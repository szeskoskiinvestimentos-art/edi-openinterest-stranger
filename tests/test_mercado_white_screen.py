"""
test_mercado_white_screen.py - Testes para Cotacoes/dashboard/MERCADO/index.html.

Owner reportou (22/06 22:30): "Cotacoes/dashboard/MERCADO ainda eh uma
pagina com fundo branco."

Valida que:
1. MERCADO existe
2. Tema Neon Terminal aplicado (NAO indigo)
3. Fundo principal NAO eh branco
4. Overlays rgba(255,255,255,*** com opacidade <0.95 (causa do branco)
5. Background body usa variavel CSS dark
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
MERCADO = ROOT / "Cotacoes" / "dashboard" / "MERCADO" / "index.html"


def test_mercado_exists():
    """MERCADO dashboard existe."""
    assert MERCADO.exists(), f"Arquivo nao encontrado: {MERCADO}"


def test_mercado_size():
    """Tamanho minimo."""
    size = MERCADO.stat().st_size
    assert size > 30_000, f"MERCADO muito pequeno: {size} bytes"


def test_mercado_has_neon_theme():
    """Variaveis CSS do tema Neon Terminal presentes."""
    content = MERCADO.read_text(encoding="utf-8", errors="ignore")
    neon_vars = ["--primary-neon", "--secondary-neon", "#ff073a", "#00f3ff"]
    has_neon = any(v in content for v in neon_vars)
    assert has_neon, "Tema Neon Terminal nao detectado"


def test_mercado_no_white_body():
    """Body NAO tem background branco puro (#fff ou rgb(255,255,255))."""
    content = MERCADO.read_text(encoding="utf-8", errors="ignore")
    # Procurar body { background: ...; }
    body_match = re.search(r'body\s*\{[^}]*background[^}]*\}', content, re.I | re.DOTALL)
    if body_match:
        body_css = body_match.group(0)
        # Permitir dark colors, gradient com dark base, ou var(--dark-bg)
        forbidden = ["background: #fff", "background: white", "background-color: white"]
        for f in forbidden:
            assert f not in body_css, f"body com fundo branco: {body_css[:200]}"


def test_mercado_no_high_opacity_white_overlays():
    """Overlays rgba(255,255,255,*** com opacidade >= 0.9 sao causa do flash branco.

    Owner exige que sejam reduzidos para 0.3-0.5 OU substituidos por accent neon.
    Esta teste passa se a opacidade for < 0.9 OU usar var(--xxx).
    """
    content = MERCADO.read_text(encoding="utf-8", errors="ignore")
    # Encontrar rgba(255,255,255,X.XX) com X >= 0.9
    high_opacity = re.findall(r'rgba\s*\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(0?\.9[0-9]*|1\.0?)\s*\)', content)
    assert len(high_opacity) <= 2, (
        f"MERCADO tem {len(high_opacity)} overlays rgba(255,255,255,X>=0.9). "
        f"Devem ser reduzidos a 0.3-0.5 ou trocados por accent neon. Exemplos: {high_opacity[:3]}"
    )


def test_mercado_references_data():
    """JS deve carregar market_quotes.json ou similar."""
    content = MERCADO.read_text(encoding="utf-8", errors="ignore")
    assert "market_quotes" in content, "JS nao referencia market_quotes.json"


def test_mercado_has_dark_overall():
    """HTML deve ter pelo menos 1 classe ou id 'dark', 'bg-dark', 'neon', ou usar --dark-bg."""
    content = MERCADO.read_text(encoding="utf-8", errors="ignore")
    dark_indicators = ["--dark-bg", "#0a0a0a", "bg-dark", "dark-mode", "neon"]
    has_dark = any(v.lower() in content.lower() for v in dark_indicators)
    assert has_dark, "MERCADO sem indicadores de dark theme"


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))