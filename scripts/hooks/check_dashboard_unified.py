#!/usr/bin/env python
"""
check_dashboard_unified.py
============================
Pre-commit + pre-push hook (E95b-prevention 2026-06-21).

Avisa (não bloqueia) se `dashboard_unificado/` tem mudanças não commitadas
em arquivos VERSIONADOS (M, A, D — não os untracked de runtime/).

Por quê?
----------
Antes de rodar `gerar_controle.py` ou `Servico_Unificado.bat`, é importante
que `dashboard_unificado/` esteja limpo. Se não, há risco de conflito no
swap staging.

Este hook avisa o user para commitar antes de operações destrutivas.

Uso:
    python scripts/hooks/check_dashboard_unified.py

Exit codes:
    0 = OK (working tree limpo ou só untracked de runtime)
    1 = WARN (mudanças em arquivos versionados)
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main() -> int:
    try:
        r = subprocess.run(
            ["git", "status", "--short", "dashboard_unificado/"],
            cwd=str(ROOT), capture_output=True, text=True, timeout=10,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError) as e:
        print(f"[unified-check] WARN: git nao disponivel ({e}). Pulando check.")
        return 0

    if r.returncode != 0:
        print(f"[unified-check] git status falhou (rc={r.returncode}):")
        print(r.stderr)
        return 0

    # Filtrar untracked de runtime (geralmente JSON/JS em runtime/ ou assets/data)
    # Esses não devem ser commitados via este hook
    runtime_patterns = [
        "dashboard_unificado/WDO/assets/data/yahoo_",
        "dashboard_unificado/WIN/assets/data/yahoo_",
        "dashboard_unificado/WDO/assets/data/market_data.js",
        "dashboard_unificado/WIN/assets/data/market_data.js",
    ]

    relevant: list[str] = []
    for line in r.stdout.splitlines():
        if not line:
            continue
        status = line[:2]
        path = line[3:].strip()
        # Ignorar untracked (??) e runtime data
        if status.startswith("??"):
            continue
        if any(pat in path for pat in runtime_patterns):
            continue
        relevant.append(f"{status} {path}")

    if relevant:
        print("[unified-check] WARN: dashboard_unificado/ tem mudancas em arquivos versionados:")
        for r in relevant[:15]:
            print(f"  {r}")
        if len(relevant) > 15:
            print(f"  ... +{len(relevant) - 15} mais")
        print()
        print("Recomendado: commitar antes de rodar Servico_Unificado.bat / gerar_controle.py")
        print("  git add dashboard_unificado/")
        print("  git commit -m '...'")
        return 1

    print("[unified-check] OK (dashboard_unificado/ limpo)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
