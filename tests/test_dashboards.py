"""
test_dashboards.py - Testes para integridade dos dashboards (E26).

Valida que:
1. WDO e WIN tem os elementos HTML esperados (sem IDs mortos)
2. Handlers JS estao sincronizados com elementos HTML
3. Referencias a arquivos externos existem (CSS, JS, data)
4. Links internos para outros dashboards sao validos
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tests.conftest import ROOT as PROJECT_ROOT  # type: ignore


def _read(path: str) -> str:
    """Le arquivo como string."""
    full = PROJECT_ROOT / path if not Path(path).is_absolute() else Path(path)
    if not full.exists():
        return ""
    return full.read_text(encoding="utf-8", errors="ignore")


def _html_ids(path: str) -> set[str]:
    """Extrai todos os IDs de um arquivo HTML."""
    content = _read(path)
    return set(re.findall(r'id="([a-z0-9-]+)"', content))


def _js_element_refs(path: str) -> set[str]:
    """Extrai IDs referenciados em JS (getElementById, querySelector #id, setText, animateValue, etc)."""
    content = _read(path)
    ids: set[str] = set()
    # getElementById
    ids |= set(re.findall(r"""getElementById\(['"]([a-z0-9-]+)['"]""", content))
    # querySelector #id
    ids |= set(re.findall(r"""querySelector\(['"]#([a-z0-9-]+)['"]""", content))
    # querySelectorAll #id
    ids |= set(re.findall(r"""querySelectorAll\(['"]#([a-z0-9-]+)['"]""", content))
    # setText('id', ...)
    ids |= set(re.findall(r"""setText\(['"]([a-z0-9-]+)['"]""", content))
    # animateValue('id', ...)
    ids |= set(re.findall(r"""animateValue\(['"]([a-z0-9-]+)['"]""", content))
    # setHtml('id', ...)
    ids |= set(re.findall(r"""setHtml\(['"]([a-z0-9-]+)['"]""", content))
    return ids


# IDs criados dinamicamente (stale-banner.js cria esses via JS)
DYNAMIC_IDS = {"edi-stale-banner", "edi-stale-close", "edi-stale-dismiss", "edi-stale-restore"}


def test_wdo_has_ntsl_code_block() -> tuple[bool, str]:
    """WDO tem <pre id='ntsl-code-block'> para preview do codigo NTSL."""
    ids = _html_ids("dashboard_unificado/WDO/index.html")
    if "ntsl-code-block" not in ids:
        return False, "Faltando <pre id='ntsl-code-block'> no WDO"
    return True, "WDO tem ntsl-code-block"


def test_wdo_has_copy_ntsl_button() -> tuple[bool, str]:
    """WDO tem <button id='copy-ntsl'> para copia do codigo NTSL."""
    ids = _html_ids("dashboard_unificado/WDO/index.html")
    if "copy-ntsl" not in ids:
        return False, "Faltando <button id='copy-ntsl'> no WDO"
    return True, "WDO tem copy-ntsl"


def test_win_has_ntsl_code_block() -> tuple[bool, str]:
    """WIN tem <pre id='ntsl-code-block'> para preview do codigo NTSL."""
    ids = _html_ids("dashboard_unificado/WIN/index.html")
    if "ntsl-code-block" not in ids:
        return False, "Faltando <pre id='ntsl-code-block'> no WIN"
    return True, "WIN tem ntsl-code-block"


def test_win_has_copy_ntsl_button() -> tuple[bool, str]:
    """WIN tem <button id='copy-ntsl'> para copia do codigo NTSL."""
    ids = _html_ids("dashboard_unificado/WIN/index.html")
    if "copy-ntsl" not in ids:
        return False, "Faltando <button id='copy-ntsl'> no WIN"
    return True, "WIN tem copy-ntsl"


def test_wdo_html_js_sync() -> tuple[bool, str]:
    """WDO: handlers JS estao sincronizados com HTML (sem IDs mortos)."""
    html_ids = _html_ids("dashboard_unificado/WDO/index.html")
    # Coletar todos os IDs referenciados em todos os JS
    js_ids: set[str] = set()
    js_paths = [
        "dashboard_unificado/WDO/assets/js/main.js",
        "dashboard_unificado/WDO/assets/js/charts.js",
        "dashboard_unificado/WDO/assets/js/particles.js",
        "dashboard_unificado/shared/unified-nav.js",
        "dashboard_unificado/shared/stale-banner.js",
    ]
    for p in js_paths:
        js_ids |= _js_element_refs(p)

    # IDs no JS mas nao no HTML (excluindo dinamicos)
    dead_ids = js_ids - html_ids - DYNAMIC_IDS
    if dead_ids:
        return False, f"JS handlers sem HTML: {sorted(dead_ids)}"
    return True, "WDO: HTML/JS sincronizado (sem dead handlers)"


def test_win_html_js_sync() -> tuple[bool, str]:
    """WIN: handlers JS estao sincronizados com HTML (sem IDs mortos)."""
    html_ids = _html_ids("dashboard_unificado/WIN/index.html")
    js_ids: set[str] = set()
    js_paths = [
        "dashboard_unificado/WIN/assets/js/main.js",
        "dashboard_unificado/WIN/assets/js/charts.js",
        "dashboard_unificado/WIN/assets/js/particles.js",
        "dashboard_unificado/shared/unified-nav.js",
        "dashboard_unificado/shared/stale-banner.js",
    ]
    for p in js_paths:
        js_ids |= _js_element_refs(p)

    dead_ids = js_ids - html_ids - DYNAMIC_IDS
    if dead_ids:
        return False, f"JS handlers sem HTML: {sorted(dead_ids)}"
    return True, "WIN: HTML/JS sincronizado (sem dead handlers)"


def test_wdo_external_assets_exist() -> tuple[bool, str]:
    """WDO: arquivos JS/CSS referenciados existem no disco."""
    html = _read("dashboard_unificado/WDO/index.html")
    # Extrair todos os src= e href= relativos
    refs = set(re.findall(r"""(?:src|href)=['"]([^'"]+)['"]""", html))
    # Filtrar so paths locais (excluir http://, https://, #anchors, mailto:)
    local_refs = [
        r for r in refs
        if not r.startswith(("http://", "https://", "#", "mailto:", "data:"))
        and not r.startswith("/")  # absoluto do filesystem
    ]
    missing: list[str] = []
    base = PROJECT_ROOT / "dashboard_unificado/WDO"
    for ref in local_refs:
        # Resolver relativo
        target = base / ref
        if not target.exists():
            # Tentar relativo a raiz do projeto
            target2 = PROJECT_ROOT / ref
            if not target2.exists():
                missing.append(ref)
    if missing:
        return False, f"Arquivos referenciados faltando: {missing[:5]}"
    return True, f"WDO: {len(local_refs)} refs locais, todos existem"


def test_win_external_assets_exist() -> tuple[bool, str]:
    """WIN: arquivos JS/CSS referenciados existem no disco."""
    html = _read("dashboard_unificado/WIN/index.html")
    refs = set(re.findall(r"""(?:src|href)=['"]([^'"]+)['"]""", html))
    local_refs = [
        r for r in refs
        if not r.startswith(("http://", "https://", "#", "mailto:", "data:"))
        and not r.startswith("/")
    ]
    missing: list[str] = []
    base = PROJECT_ROOT / "dashboard_unificado/WIN"
    for ref in local_refs:
        target = base / ref
        if not target.exists():
            target2 = PROJECT_ROOT / ref
            if not target2.exists():
                missing.append(ref)
    if missing:
        return False, f"Arquivos referenciados faltando: {missing[:5]}"
    return True, f"WIN: {len(local_refs)} refs locais, todos existem"


def test_ntsl_handler_is_called() -> tuple[bool, str]:
    """charts.js updateNtslCode() e chamado por algum lugar (nao dead code)."""
    content = _read("dashboard_unificado/WDO/assets/js/charts.js")
    if "this.updateNtslCode" not in content and "updateNtslCode(" not in content:
        return False, "updateNtslCode() nao e chamado em charts.js"
    return True, "updateNtslCode() e chamado (handler ativo)"


# ============================================================================
# E45e: Skew IV chart dedicado (v3->v1)
# ============================================================================

def test_wdo_has_skew_canvas() -> tuple[bool, str]:
    """E45e: WDO tem <canvas id='skewChart'>."""
    ids = _html_ids("dashboard_unificado/WDO/index.html")
    if "skewChart" not in ids:
        return False, "Faltando <canvas id='skewChart'> no WDO"
    return True, "WDO tem skewChart canvas"


def test_win_has_skew_canvas() -> tuple[bool, str]:
    """E45e: WIN tem <canvas id='skewChart'>."""
    ids = _html_ids("dashboard_unificado/WIN/index.html")
    if "skewChart" not in ids:
        return False, "Faltando <canvas id='skewChart'> no WIN"
    return True, "WIN tem skewChart canvas"


def test_wdo_create_skew_chart_present() -> tuple[bool, str]:
    """E45e: charts.js WDO tem funcao createSkewChart."""
    content = _read("dashboard_unificado/WDO/assets/js/charts.js")
    if "createSkewChart" not in content:
        return False, "createSkewChart nao definido em WDO/charts.js"
    return True, "WDO charts.js tem createSkewChart"


def test_win_create_skew_chart_present() -> tuple[bool, str]:
    """E45e: charts.js WIN tem funcao createSkewChart."""
    content = _read("dashboard_unificado/WIN/assets/js/charts.js")
    if "createSkewChart" not in content:
        return False, "createSkewChart nao definido em WIN/charts.js"
    return True, "WIN charts.js tem createSkewChart"


# ============================================================================
# E45b: Strikes + Midwalls + Fibonacci chart combinado
# ============================================================================

def test_wdo_has_discovery_canvas() -> tuple[bool, str]:
    """E45b: WDO tem <canvas id='discoveryChart'>."""
    ids = _html_ids("dashboard_unificado/WDO/index.html")
    if "discoveryChart" not in ids:
        return False, "Faltando <canvas id='discoveryChart'> no WDO"
    return True, "WDO tem discoveryChart canvas"


def test_win_has_discovery_canvas() -> tuple[bool, str]:
    """E45b: WIN tem <canvas id='discoveryChart'>."""
    ids = _html_ids("dashboard_unificado/WIN/index.html")
    if "discoveryChart" not in ids:
        return False, "Faltando <canvas id='discoveryChart'> no WIN"
    return True, "WIN tem discoveryChart canvas"


def test_wdo_create_discovery_chart_present() -> tuple[bool, str]:
    """E45b: charts.js WDO tem funcao createDiscoveryChart."""
    content = _read("dashboard_unificado/WDO/assets/js/charts.js")
    if "createDiscoveryChart" not in content:
        return False, "createDiscoveryChart nao definido em WDO/charts.js"
    return True, "WDO charts.js tem createDiscoveryChart"


def test_win_create_discovery_chart_present() -> tuple[bool, str]:
    """E45b: charts.js WIN tem funcao createDiscoveryChart."""
    content = _read("dashboard_unificado/WIN/assets/js/charts.js")
    if "createDiscoveryChart" not in content:
        return False, "createDiscoveryChart nao definido em WIN/charts.js"
    return True, "WIN charts.js tem createDiscoveryChart"
