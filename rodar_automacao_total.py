import os
import sys
import subprocess
import argparse
from datetime import datetime, timezone
import csv
import json
import re
from collections import defaultdict
from datetime import date
from typing import Sequence


def main() -> int:
    root_dir = os.path.dirname(os.path.abspath(__file__))
    automacao_dir = os.path.join(root_dir, "Automacao")
    b3_system_dir = os.path.join(root_dir, "B3_System")

    automacao_script = os.path.join(automacao_dir, "automacao_dados.py")
    b3_config_script = os.path.join(b3_system_dir, "config.py")

    if not os.path.isfile(automacao_script):
        print(f"ERRO: Script de automação não encontrado: {automacao_script}")
        return 2
    if not os.path.isfile(b3_config_script):
        print(f"ERRO: Script do B3_System não encontrado: {b3_config_script}")
        return 2

    parser = argparse.ArgumentParser(
        prog=os.path.basename(__file__),
        description="Orquestra a rotina Automacao + B3_System (com push do dashboard_unificado por padrão).",
    )
    parser.add_argument("--skip-automacao", action="store_true", help="Não executa Automacao/automacao_dados.py")
    parser.add_argument("--skip-b3", action="store_true", help="Não executa B3_System/config.py")
    parser.add_argument("--disable-git-push", action="store_true", help="Desabilita push automático no B3_System/config.py")
    parser.add_argument("--log-file", default="", help="Caminho do arquivo de log. Padrão: rodar_automacao_total.last.log na pasta raiz.")
    parser.add_argument("--pause", action="store_true", help="Aguarda Enter no final (útil quando executado por duplo clique).")
    args = parser.parse_args()

    print("=== Rotina Completa: Automação + B3_System ===")

    log_path = args.log_file.strip() if isinstance(args.log_file, str) else ""
    if not log_path:
        log_path = os.path.join(root_dir, "rodar_automacao_total.last.log")
    log_path = os.path.abspath(log_path)

    try:
        log_f = open(log_path, "w", encoding="utf-8", errors="replace")
    except Exception:
        log_f = None

    def log_write(text: str):
        if log_f:
            try:
                log_f.write(text)
                log_f.flush()
            except Exception:
                pass

    started_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_write(f"=== rodar_automacao_total.py ===\nstarted_at={started_at}\nroot_dir={root_dir}\n\n")

    def run_step(label: str, cmd: list[str], cwd: str, env: dict[str, str] | None = None) -> int:
        print(f"\n{label}")
        log_write(f"\n{label}\n")
        log_write(f"cwd={cwd}\ncmd={' '.join(map(str, cmd))}\n")
        try:
            if env is not None:
                env.setdefault("PYTHONIOENCODING", "utf-8")
                env.setdefault("PYTHONUTF8", "1")
            proc = subprocess.Popen(
                cmd,
                cwd=cwd,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                try:
                    sys.stdout.write(line)
                except UnicodeEncodeError:
                    enc = getattr(sys.stdout, "encoding", None) or "utf-8"
                    data = line.encode(enc, errors="replace")
                    buf = getattr(sys.stdout, "buffer", None)
                    if buf is not None:
                        buf.write(data)
                    else:
                        sys.stdout.write(data.decode(enc, errors="replace"))
                log_write(line)
            return int(proc.wait() or 0)
        except Exception as e:
            print(f"AVISO: Falha ao executar {label}: {e}")
            log_write(f"AVISO: Falha ao executar {label}: {e}\n")
            return 1

    def warn_if_missing(path: str, description: str):
        if not os.path.exists(path):
            msg = f"AVISO: {description} não encontrado: {path}"
            print(msg)
            log_write(msg + "\n")

    def hydrate_dashboard_ntsl() -> int:
        def read_json_file(path: str):
            try:
                with open(path, "r", encoding="utf-8", errors="replace") as f:
                    return json.load(f)
            except Exception:
                return None

        def write_market_files(json_path: str, obj: dict) -> int:
            try:
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(obj, f, ensure_ascii=False, indent=2)
                js_path = os.path.splitext(json_path)[0] + ".js"
                if os.path.isfile(js_path):
                    with open(js_path, "w", encoding="utf-8") as f:
                        f.write("window.marketData = ")
                        json.dump(obj, f, ensure_ascii=False, indent=4)
                        f.write(";\n")
                return 0
            except Exception:
                return 1

        def pick_nearest_expiry(expiries: list[str], ref_dt: datetime) -> str | None:
            scored: list[tuple[int, str]] = []
            for exp in expiries:
                try:
                    y, m, d = (int(p) for p in str(exp).split("-"))
                    exp_d = date(y, m, d)
                    delta = int((exp_d - ref_dt.date()).days)
                    scored.append((delta, str(exp)))
                except Exception:
                    continue
            if not scored:
                return None
            non_neg = [t for t in scored if t[0] >= 0]
            return min(non_neg or scored, key=lambda t: t[0])[1]

        def safe_float(v) -> float | None:
            try:
                n = float(v)
                return n if n == n else None
            except Exception:
                return None

        def build_edimap_lines(opt_obj: dict, group: str, wdo_spot: float, call_color: str, put_color: str):
            min_oi = int(opt_obj.get("min_open_interest") or 0)
            proxy_spot = safe_float(opt_obj.get("spot"))
            expiries = opt_obj.get("expiries")
            by_exp = opt_obj.get("by_expiry")
            captured = opt_obj.get("captured_at_utc")

            if not isinstance(expiries, list) or not isinstance(by_exp, dict):
                return None
            if not isinstance(wdo_spot, (int, float)) or not float(wdo_spot) > 0:
                return None

            scale = None
            base_offset = float(int(float(wdo_spot) // 100.0) * 100.0)
            if isinstance(proxy_spot, (int, float)) and float(proxy_spot) > 0:
                scale = float(wdo_spot) / float(proxy_spot)

            ref_dt = datetime.now(timezone.utc)
            if isinstance(captured, str) and captured.strip():
                try:
                    ref_dt = datetime.fromisoformat(captured.replace("Z", "+00:00"))
                except Exception:
                    ref_dt = datetime.now(timezone.utc)

            exp = pick_nearest_expiry([str(x) for x in expiries], ref_dt)
            if not exp:
                return None

            payload = by_exp.get(exp)
            if not isinstance(payload, dict):
                return None

            strikes = payload.get("strikes")
            call_oi = payload.get("call_oi")
            put_oi = payload.get("put_oi")
            if not isinstance(strikes, list) or not isinstance(call_oi, list) or not isinstance(put_oi, list):
                return None
            if not (len(strikes) == len(call_oi) == len(put_oi)):
                return None

            rows: list[tuple[float, int, int]] = []
            for i in range(len(strikes)):
                strike = safe_float(strikes[i])
                if strike is None:
                    continue
                c = int(round(safe_float(call_oi[i]) or 0.0))
                p = int(round(safe_float(put_oi[i]) or 0.0))
                rows.append((strike, c, p))

            lines: list[str] = []
            strikes_for_stats: list[float] = []
            oi_w_sum = 0.0
            oi_sum = 0.0

            for strike, c, p in sorted(rows, key=lambda t: t[0]):
                show_c = c >= min_oi and c > 0
                show_p = p >= min_oi and p > 0
                if not (show_c or show_p):
                    continue

                label_strike = int(round(strike * 100.0))
                price = strike * scale if isinstance(scale, (int, float)) else (base_offset + strike)
                if show_p:
                    lines.append(
                        f'    HorizontalLineCustom({price:.2f}, {put_color}, 1, psDot, "OpcoesEdiMap_{group}_P_{label_strike}", TamanhoFonte, tpTopRight, 0, 0);'
                    )
                if show_c:
                    lines.append(
                        f'    HorizontalLineCustom({price:.2f}, {call_color}, 1, psDot, "OpcoesEdiMap_{group}_C_{label_strike}", TamanhoFonte, tpTopRight, 0, 0);'
                    )

                strikes_for_stats.append(strike)
                tot = float(max(c, 0) + max(p, 0))
                if tot > 0:
                    oi_w_sum += float(strike) * tot
                    oi_sum += tot

            if not lines:
                return None

            interval_mean = None
            interval_mean_level = None
            if strikes_for_stats:
                interval_mean = (min(strikes_for_stats) + max(strikes_for_stats)) / 2.0
                interval_mean_level = interval_mean * scale if isinstance(scale, (int, float)) else (base_offset + interval_mean)
                lines.append(
                    f'    HorizontalLineCustom({interval_mean_level:.2f}, clEdiWall, 2, psSolid, "OpcoesEdiMap_{group}_MediaIntervalo", TamanhoFonte, tpTopRight, 0, 0);'
                )
            oi_mean_level = None
            if oi_sum > 0:
                oi_mean = oi_w_sum / oi_sum
                oi_mean_level = oi_mean * scale if isinstance(scale, (int, float)) else (base_offset + oi_mean)
                lines.append(
                    f'    HorizontalLineCustom({oi_mean_level:.2f}, clEffectiveWall, 2, psDashDot, "OpcoesEdiMap_{group}_MediaOI", TamanhoFonte, tpTopRight, 0, 0);'
                )

            return {
                "expiry": exp,
                "lines": lines,
                "interval_mean_level": interval_mean_level,
                "oi_mean_level": oi_mean_level,
            }

        def patch_wdo_edimap(script: str, base_dir: str, spot_price: float | None) -> str:
            uup_path = os.path.join(base_dir, "yahoo_uup_options.json")
            usdu_path = os.path.join(base_dir, "yahoo_usdu_options.json")
            uup = read_json_file(uup_path)
            usdu = read_json_file(usdu_path)
            if not isinstance(uup, dict) or not isinstance(usdu, dict):
                return script

            sp = float(spot_price) if isinstance(spot_price, (int, float)) else None
            if not sp or sp <= 0:
                return script

            a = build_edimap_lines(uup, "A", sp, "clEffectiveWall", "clFib")
            b = build_edimap_lines(usdu, "B", sp, "clRangeHigh", "clGammaFlip")
            if not a and not b:
                return script

            body_lines: list[str] = []
            if a and isinstance(a.get("lines"), list):
                body_lines.extend(a["lines"])
            if b and isinstance(b.get("lines"), list):
                body_lines.extend(b["lines"])

            if not body_lines:
                return script

            new_body = "\n".join(body_lines) + "\n"
            block_re = re.compile(
                r"(if\s*\(\s*ExibirOpcoesEdi\s*\)\s*then\s*\n\s*begin\s*\n)([\s\S]*?)(\n\s*end;\s*)",
                flags=re.IGNORECASE,
            )
            m = block_re.search(script)

            out = script
            if "ExibirOpcoesEdi" not in out:
                out = re.sub(r"(\n\s*spot\(0\);\s*\n)", r"\1  ExibirOpcoesEdi(true);\n", out, count=1, flags=re.IGNORECASE)

            if m:
                out = out[: m.start(2)] + new_body + out[m.end(2) :]
            else:
                block = "\n  if (ExibirOpcoesEdi) then\n  begin\n" + new_body + "  end;\n"
                out = re.sub(r"\nend;\s*$", block + "\nend;", out, count=1, flags=re.IGNORECASE | re.MULTILINE)
            return out

        def patch_wdo_usd_beta(script: str, base_dir: str, spot_price: float | None) -> str:
            def normalize_usd_beta_blocks(raw: str) -> tuple[str, str | None]:
                lines = raw.splitlines()
                n = len(lines)

                def is_if_exibir(i: int) -> bool:
                    return bool(re.match(r"^\s*if\s*\(\s*ExibirUsdBeta\s*\)\s*then\s*$", lines[i], flags=re.IGNORECASE))

                def is_if_janela(i: int) -> bool:
                    return bool(
                        re.match(
                            r"^\s*if\s*\(\s*JanelaUsdBeta\s*=\s*(30|60|90|252|0)\s*\)\s*then\s*$",
                            lines[i],
                            flags=re.IGNORECASE,
                        )
                    )

                def find_block(start: int) -> tuple[int, int] | None:
                    depth = 0
                    seen_begin = False
                    for j in range(start, n):
                        if re.match(r"^\s*begin\s*$", lines[j], flags=re.IGNORECASE):
                            depth += 1
                            seen_begin = True
                            continue
                        if re.match(r"^\s*end;\s*$", lines[j], flags=re.IGNORECASE):
                            if seen_begin:
                                depth -= 1
                                if depth <= 0:
                                    return (start, j)
                    return None

                def inside(idx: int, blocks: list[tuple[int, int]]) -> bool:
                    for a, b in blocks:
                        if a <= idx <= b:
                            return True
                    return False

                ex_blocks: list[tuple[int, int]] = []
                janela_blocks: list[tuple[int, int]] = []
                i = 0
                while i < n:
                    if is_if_exibir(i):
                        b = find_block(i)
                        if b:
                            ex_blocks.append(b)
                            i = b[1] + 1
                            continue
                    if is_if_janela(i) and not inside(i, ex_blocks):
                        b = find_block(i)
                        if b:
                            janela_blocks.append(b)
                            i = b[1] + 1
                            continue
                    i += 1

                keep_ex = ex_blocks[-1] if ex_blocks else None
                keep_text = None
                if keep_ex:
                    keep_text = "\n".join(lines[keep_ex[0] : keep_ex[1] + 1]) + "\n"

                remove: list[tuple[int, int]] = []
                remove.extend(janela_blocks)
                if ex_blocks:
                    remove.extend(ex_blocks[:-1])

                remove.sort()
                out_lines: list[str] = []
                cur = 0
                for a, b in remove:
                    if a > cur:
                        out_lines.extend(lines[cur:a])
                    cur = max(cur, b + 1)
                out_lines.extend(lines[cur:])
                cleaned = "\n".join(out_lines) + ("\n" if raw.endswith("\n") else "")
                return cleaned, keep_text

            script, existing_block = normalize_usd_beta_blocks(script)

            uup_path = os.path.join(base_dir, "yahoo_uup_options.json")
            usdu_path = os.path.join(base_dir, "yahoo_usdu_options.json")
            uup = read_json_file(uup_path)
            usdu = read_json_file(usdu_path)
            if not isinstance(uup, dict) or not isinstance(usdu, dict):
                return script

            sp = float(spot_price) if isinstance(spot_price, (int, float)) else None
            if not sp or sp <= 0:
                return script

            a = build_edimap_lines(uup, "A", sp, "clEffectiveWall", "clFib")
            b = build_edimap_lines(usdu, "B", sp, "clRangeHigh", "clGammaFlip")
            if not a and not b:
                return script

            def fx_points_from(opt_obj: dict) -> float | None:
                beta = opt_obj.get("usdbrl_beta")
                if not isinstance(beta, dict):
                    return None
                latest = beta.get("latest")
                if not isinstance(latest, dict):
                    return None
                return safe_float(latest.get("fx_points"))

            fx_a = fx_points_from(uup)
            fx_b = fx_points_from(usdu)
            fx = None
            if isinstance(fx_a, (int, float)) and isinstance(fx_b, (int, float)) and fx_a and fx_b:
                fx = (float(fx_a) + float(fx_b)) / 2.0
            elif isinstance(fx_a, (int, float)) and fx_a:
                fx = float(fx_a)
            elif isinstance(fx_b, (int, float)) and fx_b:
                fx = float(fx_b)

            def lvl(obj: dict | None, key: str) -> float | None:
                if not isinstance(obj, dict):
                    return None
                v = obj.get(key)
                return float(v) if isinstance(v, (int, float)) and float(v) > 0 else None

            a_range = lvl(a, "interval_mean_level")
            a_oi = lvl(a, "oi_mean_level")
            b_range = lvl(b, "interval_mean_level")
            b_oi = lvl(b, "oi_mean_level")

            if not (a_range or a_oi or b_range or b_oi or fx):
                return script

            def window_body(win: int) -> str:
                lines: list[str] = []
                if a_range:
                    lines.append(
                        f'    HorizontalLineCustom({a_range:.2f}, clEffectiveWall, 2, psSolid, "UsdBeta_{win}_A_MediaRange", TamanhoFonte, tpTopRight, 0, 0);'
                    )
                if a_oi:
                    lines.append(
                        f'    HorizontalLineCustom({a_oi:.2f}, clFib, 2, psDashDot, "UsdBeta_{win}_A_MediaOI", TamanhoFonte, tpTopRight, 0, 0);'
                    )
                if b_range:
                    lines.append(
                        f'    HorizontalLineCustom({b_range:.2f}, clRangeHigh, 2, psSolid, "UsdBeta_{win}_B_MediaRange", TamanhoFonte, tpTopRight, 0, 0);'
                    )
                if b_oi:
                    lines.append(
                        f'    HorizontalLineCustom({b_oi:.2f}, clGammaFlip, 2, psDashDot, "UsdBeta_{win}_B_MediaOI", TamanhoFonte, tpTopRight, 0, 0);'
                    )
                if fx:
                    lines.append(
                        f'    HorizontalLineCustom({fx:.2f}, clMaxPain, 1, psDot, "UsdBeta_{win}_ProxyFx", TamanhoFonte, tpTopRight, 0, 0);'
                    )
                return "\n".join(lines) + ("\n" if lines else "")

            b30 = window_body(30)
            b60 = window_body(60)
            b90 = window_body(90)
            b252 = window_body(252)

            def window_block(win: int, body: str) -> str:
                return f"    if (JanelaUsdBeta = {win}) then\n    begin\n{body}    end;\n"

            all_windows_blocks = (
                window_block(30, b30)
                + window_block(60, b60)
                + window_block(90, b90)
                + window_block(252, b252)
            )
            all0 = "    if (JanelaUsdBeta = 0) then\n    begin\n" + (b30 + b60 + b90 + b252) + "    end;\n"
            full = "\n  if (ExibirUsdBeta) then\n  begin\n" + all_windows_blocks + all0 + "  end;\n"

            out = script
            if "ExibirUsdBeta" not in out:
                out = re.sub(r"(\n\s*spot\(0\);\s*\n)", r"\1  ExibirUsdBeta(true);\n  JanelaUsdBeta(0);\n", out, count=1, flags=re.IGNORECASE)
            elif "JanelaUsdBeta" not in out:
                out = re.sub(r"(\n\s*ExibirUsdBeta\([^)]+\);\s*\n)", r"\1  JanelaUsdBeta(0);\n", out, count=1, flags=re.IGNORECASE)

            if existing_block:
                out = out.replace(existing_block, "\n")

            out = re.sub(r"\nend;\s*$", full + "\nend;", out, count=1, flags=re.IGNORECASE | re.MULTILINE)
            return out

        def patch_wdo_core_toggles(script: str) -> str:
            out = script

            def set_bool_input(name: str, value: bool) -> None:
                nonlocal out
                v = "true" if value else "false"
                pat = re.compile(rf"(\n\s*{re.escape(name)}\()\s*(true|false)\s*(\);\s*)", flags=re.IGNORECASE)
                if pat.search(out):
                    out = pat.sub(rf"\1{v}\3", out, count=1)
                    return
                out = re.sub(r"(\n\s*spot\(0\);\s*\n)", rf"\1  {name}({v});\n", out, count=1, flags=re.IGNORECASE)

            set_bool_input("MostrarPLUS", True)
            set_bool_input("MostrarPLUS2", True)
            set_bool_input("ExibirMelhoresPontos", False)
            return out

        def patch_win_core_toggles(script: str) -> str:
            out = script

            def set_bool_input(name: str, value: bool) -> None:
                nonlocal out
                v = "true" if value else "false"
                pat = re.compile(rf"(\n\s*{re.escape(name)}\()\s*(true|false)\s*(\);\s*)", flags=re.IGNORECASE)
                if pat.search(out):
                    out = pat.sub(rf"\1{v}\3", out, count=1)
                    return
                out = re.sub(r"(\n\s*spot\(0\);\s*\n)", rf"\1  {name}({v});\n", out, count=1, flags=re.IGNORECASE)

            set_bool_input("MostrarPLUS", True)
            set_bool_input("MostrarPLUS2", True)
            set_bool_input("ExibirMelhoresPontos", False)
            return out

        def patch_wdo_normalize_structure(script: str) -> str:
            raw = script
            lines = raw.splitlines()
            if not lines:
                return script

            begin_re = re.compile(r"^\s*begin\s*$", flags=re.IGNORECASE)
            end_re = re.compile(r"^\s*end;\s*$", flags=re.IGNORECASE)
            if_begin_same_line_re = re.compile(r"^\s*if\s*\([^)]*\)\s*then\s*begin\s*$", flags=re.IGNORECASE)
            if_then_re = re.compile(r"^\s*if\s*\([^)]*\)\s*then\s*$", flags=re.IGNORECASE)

            def indent_of(s: str) -> int:
                try:
                    return len(s) - len(s.lstrip(" "))
                except Exception:
                    return 0

            def next_non_empty_idx(start: int) -> int | None:
                for j in range(start, len(lines)):
                    if str(lines[j]).strip():
                        return j
                return None

            begin_idx = None
            for i, ln in enumerate(lines):
                if begin_re.match(ln):
                    begin_idx = i
                    break
            if begin_idx is None:
                return script

            out_lines: list[str] = []
            stack: list[int] = []
            out_lines.extend(lines[: begin_idx + 1])
            stack.append(indent_of(lines[begin_idx]))

            for i in range(begin_idx + 1, len(lines)):
                ln = lines[i]
                if end_re.match(ln):
                    if len(stack) <= 1 and next_non_empty_idx(i + 1) is not None:
                        continue
                    if stack:
                        stack.pop()
                    out_lines.append(ln)
                    continue

                is_if_begin = bool(if_begin_same_line_re.match(ln))
                is_if_then = bool(if_then_re.match(ln))
                next_idx = next_non_empty_idx(i + 1)
                next_is_begin = bool(next_idx is not None and begin_re.match(lines[next_idx]))

                if is_if_begin or (is_if_then and next_is_begin):
                    ind = indent_of(ln)
                    while len(stack) > 1 and ind <= stack[-1]:
                        out_lines.append((" " * stack[-1]) + "end;")
                        stack.pop()
                    out_lines.append(ln)
                    if is_if_begin:
                        stack.append(ind)
                    continue

                if begin_re.match(ln):
                    ind = indent_of(ln)
                    out_lines.append(ln)
                    stack.append(ind)
                    continue

                out_lines.append(ln)

            while len(stack) > 1:
                out_lines.append((" " * stack[-1]) + "end;")
                stack.pop()

            out = "\n".join(out_lines)
            return out + ("\n" if raw.endswith("\n") else "")

        def patch_win_pre_projections(script: str, proj: dict | None) -> str:
            if not isinstance(proj, dict):
                return script
            levels = proj.get("levels")
            if not isinstance(levels, list) or not levels:
                return script
            if bool(proj.get("stale")):
                return script
            age = proj.get("age_minutes")
            max_age = proj.get("max_age_minutes")
            if isinstance(age, (int, float)) and isinstance(max_age, (int, float)) and float(age) > float(max_age):
                return script

            def pick_price(it):
                if not isinstance(it, dict):
                    return None
                for k in ("price", "level", "value"):
                    if k in it:
                        v = safe_float(it.get(k))
                        if v and v > 0:
                            return float(v)
                return None

            def pick_label(it):
                if not isinstance(it, dict):
                    return None
                for k in ("label", "name", "key"):
                    v = it.get(k)
                    if isinstance(v, str) and v.strip():
                        return v.strip()
                return None

            def to_id(v: str) -> str:
                try:
                    s = str(v or "")
                except Exception:
                    s = ""
                s = s.casefold()
                s = s.replace("á", "a").replace("à", "a").replace("ã", "a").replace("â", "a")
                s = s.replace("é", "e").replace("ê", "e")
                s = s.replace("í", "i")
                s = s.replace("ó", "o").replace("ô", "o").replace("õ", "o")
                s = s.replace("ú", "u")
                s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
                return (s[:48] or "win_pre").upper()

            lines: list[str] = []
            for it in levels:
                price = pick_price(it)
                if price is None:
                    continue
                label = pick_label(it) or "WIN_PRE"
                lines.append(
                    f'    HorizontalLineCustom({price:.2f}, clExpMove, 2, psDash, "ProjWIN_{to_id(label)}", TamanhoFonte, tpTopRight, 0, 0);'
                )
            if not lines:
                return script

            out = script
            if "ExibirProjWinPre" not in out:
                out = re.sub(r"(\n\s*spot\(0\);\s*\n)", r"\1  ExibirProjWinPre(true);\n", out, count=1, flags=re.IGNORECASE)
            new_body = "\n".join(lines) + "\n"
            block_re = re.compile(
                r"(if\s*\(\s*ExibirProjWinPre\s*\)\s*then\s*\n\s*begin\s*\n)([\s\S]*?)(\n\s*end;\s*)",
                flags=re.IGNORECASE,
            )
            m = block_re.search(out)
            if m:
                out = out[: m.start(2)] + new_body + out[m.end(2) :]
            else:
                block = "\n  if (ExibirProjWinPre) then\n  begin\n" + new_body + "  end;\n"
                out = re.sub(r"\nend;\s*$", block + "\nend;", out, count=1, flags=re.IGNORECASE | re.MULTILINE)
            return out

        def build_win_pre_projections(root_dir_in: str) -> dict | None:
            quotes_path = os.path.join(root_dir_in, "Cotacoes", "dashboard", "MERCADO", "assets", "data", "market_quotes.json")
            if not os.path.isfile(quotes_path):
                return None
            quotes = read_json_file(quotes_path)
            if not isinstance(quotes, dict):
                return None

            meta_raw = quotes.get("meta")
            meta = meta_raw if isinstance(meta_raw, dict) else {}
            gen_at = meta.get("generatedAt")
            now_utc = datetime.now(timezone.utc)
            gen_dt = None
            if isinstance(gen_at, str) and gen_at.strip():
                try:
                    gen_dt = datetime.fromisoformat(gen_at.replace("Z", "+00:00"))
                except Exception:
                    gen_dt = None
            age_min = None
            if isinstance(gen_dt, datetime):
                age_min = max(0.0, (now_utc - gen_dt).total_seconds() / 60.0)

            max_age_min = 12 * 60

            series = quotes.get("series")
            if not isinstance(series, dict):
                return {"stale": True, "age_minutes": age_min, "max_age_minutes": max_age_min, "levels": []}

            def last_point(sym: str) -> dict | None:
                pts = series.get(sym)
                if not isinstance(pts, list):
                    return None
                for i in range(len(pts) - 1, -1, -1):
                    p = pts[i]
                    if isinstance(p, dict):
                        return p
                return None

            def last_number(sym: str, key: str) -> float | None:
                pts = series.get(sym)
                if not isinstance(pts, list):
                    return None
                for i in range(len(pts) - 1, -1, -1):
                    p = pts[i]
                    if not isinstance(p, dict):
                        continue
                    v = p.get(key)
                    if isinstance(v, (int, float)) and float(v) == float(v):
                        return float(v)
                return None

            def win_prev_close(sym: str) -> float | None:
                pts = series.get(sym)
                if not isinstance(pts, list) or not pts:
                    return None
                last = last_point(sym)
                if not isinstance(last, dict):
                    return None
                last_t = last.get("t")
                if not isinstance(last_t, str) or not last_t:
                    return None
                last_ms = None
                try:
                    last_ms = datetime.fromisoformat(last_t.replace("Z", "+00:00"))
                except Exception:
                    last_ms = None
                if not isinstance(last_ms, datetime):
                    return None
                last_ymd = last_ms.date().isoformat()
                for i in range(len(pts) - 1, -1, -1):
                    p = pts[i]
                    if not isinstance(p, dict):
                        continue
                    t = p.get("t")
                    if not isinstance(t, str) or not t:
                        continue
                    try:
                        dt = datetime.fromisoformat(t.replace("Z", "+00:00"))
                    except Exception:
                        continue
                    ymd = dt.date().isoformat()
                    if ymd == last_ymd:
                        continue
                    price = p.get("price")
                    if isinstance(price, (int, float)) and float(price) == float(price):
                        return float(price)
                return None

            sym_win = "WINc1"
            sym_iron = "DCE_I0"
            sym_copper = "HG"
            sym_oil = "LCO"

            win_now = last_number(sym_win, "price")
            win_close = win_prev_close(sym_win)
            ref_close = win_close if isinstance(win_close, (int, float)) and win_close > 0 else win_now
            ref_adjust = win_now

            def proj(base: float | None, driver_pct: float | None, beta: float) -> float | None:
                if not isinstance(base, (int, float)) or not base or base <= 0:
                    return None
                if not isinstance(driver_pct, (int, float)) or driver_pct != driver_pct:
                    return None
                move_pct = (float(driver_pct) * float(beta)) / 100.0
                return float(base) * (1.0 + move_pct)

            beta_default = 1.0
            iron_pct = last_number(sym_iron, "changePct")
            copper_pct = last_number(sym_copper, "changePct")
            oil_pct = last_number(sym_oil, "changePct")

            levels: list[dict] = []
            for k, sym, pct in (
                ("FERRO", sym_iron, iron_pct),
                ("COBRE", sym_copper, copper_pct),
                ("PETROLEO", sym_oil, oil_pct),
            ):
                if pct is None:
                    continue
                if ref_close is not None:
                    v = proj(ref_close, pct, beta_default)
                    if v is not None:
                        levels.append({"label": f"{k}_FECH", "price": v, "driver_symbol": sym, "driver_pct": pct, "beta": beta_default})
                if ref_adjust is not None:
                    v = proj(ref_adjust, pct, beta_default)
                    if v is not None:
                        levels.append({"label": f"{k}_AJUSTE", "price": v, "driver_symbol": sym, "driver_pct": pct, "beta": beta_default})

            stale = bool(age_min is not None and age_min > float(max_age_min)) or len(levels) == 0
            return {
                "generated_at_utc": gen_at,
                "age_minutes": age_min,
                "max_age_minutes": max_age_min,
                "stale": stale,
                "levels": levels,
            }

        updated_any = False
        last_error = 0
        win_proj = build_win_pre_projections(root_dir)
        for asset in ("WDO", "WIN"):
            candidates = [
                os.path.join(b3_system_dir, "dashboard_unificado", asset, "assets", "data", "market_data.json"),
                os.path.join(
                    b3_system_dir,
                    "Edi_OpenInterest - PY - Stranger - Indice",
                    "dashboard_unificado",
                    asset,
                    "assets",
                    "data",
                    "market_data.json",
                ),
            ]
            for json_path in candidates:
                if not os.path.isfile(json_path):
                    continue
                base_dir = os.path.dirname(json_path)
                txt_path = os.path.join(base_dir, "ntsl_script.txt")
                if not os.path.isfile(txt_path):
                    continue
                obj = read_json_file(json_path)
                if not isinstance(obj, dict):
                    continue
                try:
                    with open(txt_path, "r", encoding="utf-8", errors="replace") as f:
                        script = f.read()
                except Exception:
                    continue

                new_script = script
                if asset == "WDO":
                    overview = obj.get("overview")
                    overview_spot = overview.get("spot_price") if isinstance(overview, dict) else None
                    spot_price = obj.get("spot_price") if isinstance(obj.get("spot_price"), (int, float)) else overview_spot
                    new_script = patch_wdo_normalize_structure(new_script)
                    new_script = patch_wdo_core_toggles(new_script)
                    new_script = patch_wdo_edimap(new_script, base_dir, spot_price)
                    new_script = patch_wdo_usd_beta(new_script, base_dir, spot_price)
                elif asset == "WIN":
                    new_script = patch_win_core_toggles(new_script)
                    new_script = patch_win_pre_projections(new_script, win_proj)

                if isinstance(new_script, str) and new_script != script:
                    try:
                        with open(txt_path, "w", encoding="utf-8") as f:
                            f.write(new_script)
                    except Exception:
                        last_error = 1
                    script = new_script

                obj["ntsl_script"] = script
                code = write_market_files(json_path, obj)
                if code != 0:
                    last_error = 1
                else:
                    updated_any = True

        if not updated_any:
            msg = "AVISO: hydrate_dashboard_ntsl: nenhum market_data.json encontrado para atualizar."
            print(msg)
            log_write(msg + "\n")
            return 2
        return last_error

    def hydrate_wdo_open_interest() -> int:
        csv_dir = os.path.join(b3_system_dir, "CSV_Dolar")
        if not os.path.isdir(csv_dir):
            msg = f"AVISO: hydrate_wdo_open_interest: diretório não encontrado: {csv_dir}"
            print(msg)
            log_write(msg + "\n")
            return 2

        csv_paths = []
        try:
            for name in os.listdir(csv_dir):
                if not name.lower().endswith(".csv"):
                    continue
                if "_options_exp-" not in name.lower():
                    continue
                csv_paths.append(os.path.join(csv_dir, name))
        except Exception as e:
            msg = f"AVISO: hydrate_wdo_open_interest: falha ao listar CSVs: {e}"
            print(msg)
            log_write(msg + "\n")
            return 1

        if not csv_paths:
            msg = "AVISO: hydrate_wdo_open_interest: nenhum CSV '*_options_exp-YYYY-MM-DD.csv' encontrado."
            print(msg)
            log_write(msg + "\n")
            return 2

        expiry_re = re.compile(r"_options_exp-(\d{4}-\d{2}-\d{2})\.csv$", re.IGNORECASE)

        def parse_expiry_from_filename(path: str) -> str | None:
            m = expiry_re.search(os.path.basename(path))
            if not m:
                return None
            return m.group(1)

        def find_column(headers: Sequence[str], candidates: Sequence[str]) -> str | None:
            normalized = {h.strip().lower(): h for h in headers if isinstance(h, str)}
            for cand in candidates:
                key = cand.strip().lower()
                if key in normalized:
                    return normalized[key]
            return None

        def parse_float(v) -> float | None:
            if v is None:
                return None
            s = str(v).strip()
            if not s:
                return None
            s = s.replace(".", "").replace(",", ".") if s.count(",") == 1 and s.count(".") >= 1 else s
            s = s.replace(",", "")
            try:
                return float(s)
            except Exception:
                return None

        def parse_int(v) -> int | None:
            f = parse_float(v)
            if f is None:
                return None
            try:
                return int(round(f))
            except Exception:
                return None

        by_expiry_by_strike: dict[str, dict[float, dict[str, int]]] = defaultdict(lambda: defaultdict(lambda: {"call": 0, "put": 0}))

        for csv_path in sorted(csv_paths):
            expiry = parse_expiry_from_filename(csv_path)
            if not expiry:
                continue
            try:
                with open(csv_path, "r", encoding="utf-8", errors="replace", newline="") as f:
                    reader = csv.DictReader(f)
                    if not reader.fieldnames:
                        continue
                    strike_col = find_column(reader.fieldnames, ["Strike", "strike"])
                    type_col = find_column(reader.fieldnames, ["OptionType", "optiontype", "Type", "type"])
                    oi_col = find_column(reader.fieldnames, ["Open Int", "OpenInt", "open_int", "openinterest", "open interest", "OI", "oi"])
                    if not strike_col or not type_col or not oi_col:
                        msg = f"AVISO: hydrate_wdo_open_interest: colunas ausentes em {os.path.basename(csv_path)}"
                        print(msg)
                        log_write(msg + "\n")
                        continue
                    for row in reader:
                        strike = parse_float(row.get(strike_col))
                        if strike is None:
                            continue
                        opt_type = (row.get(type_col) or "").strip().upper()
                        oi = parse_int(row.get(oi_col)) or 0
                        if opt_type.startswith("C"):
                            by_expiry_by_strike[expiry][strike]["call"] += oi
                        elif opt_type.startswith("P"):
                            by_expiry_by_strike[expiry][strike]["put"] += oi
            except Exception as e:
                msg = f"AVISO: hydrate_wdo_open_interest: falha ao ler {os.path.basename(csv_path)}: {e}"
                print(msg)
                log_write(msg + "\n")

        if not by_expiry_by_strike:
            msg = "AVISO: hydrate_wdo_open_interest: não foi possível extrair OI dos CSVs."
            print(msg)
            log_write(msg + "\n")
            return 2

        def load_last_updated(json_obj: dict) -> datetime | None:
            raw = json_obj.get("last_updated") or json_obj.get("overview", {}).get("last_update")
            if not isinstance(raw, str) or not raw.strip():
                return None
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
                try:
                    return datetime.strptime(raw.strip()[:19], fmt)
                except Exception:
                    continue
            try:
                return datetime.fromisoformat(raw.strip().replace("Z", "+00:00"))
            except Exception:
                return None

        def days_to_expiry(expiry_ymd: str, ref: datetime) -> int | None:
            try:
                y, m, d = (int(p) for p in expiry_ymd.split("-"))
                exp_d = date(y, m, d)
                ref_d = ref.date()
                return int((exp_d - ref_d).days)
            except Exception:
                return None

        def build_oi_arrays(by_strike: dict[float, dict[str, int]]) -> dict:
            strikes_sorted = sorted(by_strike.keys())
            call_oi = []
            put_oi = []
            total_oi = []
            for s in strikes_sorted:
                c = int(by_strike[s].get("call") or 0)
                p = int(by_strike[s].get("put") or 0)
                call_oi.append(float(c))
                put_oi.append(float(p))
                total_oi.append(float(c + p))
            return {"strikes": strikes_sorted, "call_oi": call_oi, "put_oi": put_oi, "total_oi": total_oi}

        def merge_all_expiries() -> dict[float, dict[str, int]]:
            merged: dict[float, dict[str, int]] = defaultdict(lambda: {"call": 0, "put": 0})
            for by_strike in by_expiry_by_strike.values():
                for strike, v in by_strike.items():
                    merged[strike]["call"] += int(v.get("call") or 0)
                    merged[strike]["put"] += int(v.get("put") or 0)
            return merged

        def pick_nearest_expiry(ref: datetime) -> str:
            expiries = sorted(by_expiry_by_strike.keys())
            scored = []
            for exp in expiries:
                d = days_to_expiry(exp, ref)
                scored.append((d if d is not None else 10**9, exp))
            non_neg = [t for t in scored if t[0] >= 0]
            return min(non_neg or scored, key=lambda t: t[0])[1]

        market_json_candidates = [
            os.path.join(b3_system_dir, "dashboard_unificado", "WDO", "assets", "data", "market_data.json"),
            os.path.join(
                b3_system_dir,
                "Edi_OpenInterest - PY - Stranger - Indice",
                "dashboard_unificado",
                "WDO",
                "assets",
                "data",
                "market_data.json",
            ),
        ]

        updated_any = False
        last_error = 0
        for json_path in market_json_candidates:
            if not os.path.isfile(json_path):
                continue
            try:
                with open(json_path, "r", encoding="utf-8", errors="replace") as f:
                    obj = json.load(f)
                if not isinstance(obj, dict):
                    continue
                ref_dt = load_last_updated(obj) or datetime.now()
                nearest = pick_nearest_expiry(ref_dt)

                oi_all = build_oi_arrays(merge_all_expiries())
                oi_nearest = build_oi_arrays(by_expiry_by_strike[nearest])

                by_expiry_rows = []
                for exp, by_strike in by_expiry_by_strike.items():
                    d = days_to_expiry(exp, ref_dt)
                    totals = build_oi_arrays(by_strike)
                    call_sum = int(sum(totals["call_oi"]))
                    put_sum = int(sum(totals["put_oi"]))
                    by_expiry_rows.append(
                        {"expiry": exp, "days_to_exp": d, "call_oi": float(call_sum), "put_oi": float(put_sum), "total_oi": float(call_sum + put_sum)}
                    )
                by_expiry_rows.sort(key=lambda r: (r["days_to_exp"] if r["days_to_exp"] is not None else 10**9, str(r["expiry"])))

                open_interest_total = int(sum(oi_all["total_oi"]))

                obj["oi_data"] = oi_all
                obj["oi_data_nearest"] = oi_nearest
                obj["oi_by_expiry"] = by_expiry_rows
                if isinstance(obj.get("overview"), dict):
                    obj["overview"]["open_interest_total"] = float(open_interest_total)
                else:
                    obj["overview"] = {"open_interest_total": float(open_interest_total)}

                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(obj, f, ensure_ascii=False, indent=2)

                js_path = os.path.splitext(json_path)[0] + ".js"
                if os.path.isfile(js_path):
                    with open(js_path, "w", encoding="utf-8") as f:
                        f.write("window.marketData = ")
                        json.dump(obj, f, ensure_ascii=False, indent=4)
                        f.write(";\n")

                msg = f"OK: hydrate_wdo_open_interest: atualizado: {json_path} (nearest={nearest}, total_oi={open_interest_total})"
                print(msg)
                log_write(msg + "\n")
                updated_any = True
            except Exception as e:
                last_error = 1
                msg = f"AVISO: hydrate_wdo_open_interest: falha ao atualizar {json_path}: {e}"
                print(msg)
                log_write(msg + "\n")

        if not updated_any:
            msg = "AVISO: hydrate_wdo_open_interest: nenhum market_data.json encontrado para atualizar."
            print(msg)
            log_write(msg + "\n")
            return 2
        return last_error

    def finalize(exit_code: int):
        finished_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\nLog salvo em: {log_path}")
        log_write(f"\nfinished_at={finished_at}\nexit_code={int(exit_code or 0)}\nlog_path={log_path}\n")
        if log_f:
            try:
                log_f.close()
            except Exception:
                pass
        if args.pause:
            try:
                input("\nPressione Enter para fechar...")
            except Exception:
                pass
        return int(exit_code or 0)

    code_auto = 0
    if not args.skip_automacao:
        env_auto = dict(os.environ)
        env_auto["AUTO_START_B3_SYSTEM"] = "false"
        env_auto["PYTHONUNBUFFERED"] = "1"
        code_auto = run_step(
            "[1/2] Executando Automacao/automacao_dados.py...",
            [sys.executable, "-u", automacao_script],
            cwd=automacao_dir,
            env=env_auto,
        )
        if code_auto != 0:
            print(f"AVISO: Automação retornou código {code_auto}. Seguindo para o B3_System mesmo assim.")
        warn_if_missing(os.path.join(b3_system_dir, ".env.auto"), "Arquivo de variáveis gerado (.env.auto)")
        warn_if_missing(os.path.join(b3_system_dir, "CSV_Dolar"), "Diretório de CSV do Dólar")
        warn_if_missing(os.path.join(b3_system_dir, "CSV_Indice"), "Diretório de CSV do Índice")

    if args.skip_b3:
        code_hydrate_ntsl = hydrate_dashboard_ntsl()
        if code_hydrate_ntsl != 0:
            print("AVISO: hidratação do NTSL retornou aviso/erro. Verifique o log.")
        return finalize(0 if int(code_hydrate_ntsl or 0) == 0 else 1)

    env_b3 = dict(os.environ)
    env_b3["AUTO_DATA_FETCH"] = "false"
    env_b3["ENABLE_AUTO_GIT_PUSH"] = "false" if args.disable_git_push else "true"
    env_b3["PYTHONUNBUFFERED"] = "1"
    code_b3 = run_step(
        "[2/2] Executando B3_System/config.py...",
        [sys.executable, "-u", b3_config_script],
        cwd=b3_system_dir,
        env=env_b3,
    )

    code_hydrate = hydrate_wdo_open_interest()
    if code_hydrate != 0:
        print("AVISO: hidratação de Open Interest (WDO) retornou aviso/erro. Verifique o log.")

    code_hydrate_ntsl = hydrate_dashboard_ntsl()
    if code_hydrate_ntsl != 0:
        print("AVISO: hidratação do NTSL retornou aviso/erro. Verifique o log.")

    warn_if_missing(
        os.path.join(b3_system_dir, "dashboard_unificado", "WDO", "assets", "data", "market_data.json"),
        "Saída do dashboard (WDO) market_data.json",
    )
    warn_if_missing(
        os.path.join(b3_system_dir, "dashboard_unificado", "WIN", "assets", "data", "market_data.json"),
        "Saída do dashboard (WIN) market_data.json",
    )
    final_code = int(code_b3 or 0)
    if not args.skip_automacao and int(code_auto or 0) != 0:
        final_code = 1 if final_code == 0 else final_code
    if int(code_hydrate or 0) != 0:
        final_code = 1 if final_code == 0 else final_code
    if int(code_hydrate_ntsl or 0) != 0:
        final_code = 1 if final_code == 0 else final_code
    return finalize(final_code)


if __name__ == "__main__":
    raise SystemExit(main())
