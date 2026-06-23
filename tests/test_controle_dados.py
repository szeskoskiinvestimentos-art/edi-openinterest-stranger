"""
test_controle_dados.py - Testes para controle_de_dados.html (Issue: estava VAZIO).

Valida que:
1. HTML existe e tem tamanho razoavel (> 10KB)
2. Tema Indigo detectado (variaveis CSS --bg, --card)
3. JSON embutido presente e valido
4. Renderizacao JS tem pelo menos 5 cards/widgets
5. Service Node health endpoint mencionado no JS

Owner reportou (22/06 22:30): "a tela de controle Controle de Dados
file:///.../controle_de_dados.html esta vazia nao sei se estamos tendo
sucesso ao baixar dados das fontes."
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
CONTROLE = ROOT / "controle_de_dados.html"


def test_controle_exists():
    """controle_de_dados.html existe na raiz."""
    assert CONTROLE.exists(), f"Arquivo nao encontrado: {CONTROLE}"


def test_controle_size():
    """Tamanho minimo (HTML com dados > 30KB, sem dados ~3KB)."""
    size = CONTROLE.stat().st_size
    assert size > 30_000, f"controle_de_dados.html muito pequeno: {size} bytes (esperado > 30KB)"


def test_controle_has_indigo_theme():
    """Detecta tema Indigo (a ser refatorado em F3.5, mas existencia eh esperada)."""
    content = CONTROLE.read_text(encoding="utf-8", errors="ignore")
    assert "--bg: #0b1020" in content or "--bg:#0b1020" in content, "Tema Indigo nao detectado"
    assert "ui-sans-serif" in content or "Share Tech Mono" in content, "Tipografia nao detectada"


def test_controle_has_embedded_json():
    """JSON embutido <script id='data'> presente."""
    content = CONTROLE.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r'<script id="data"[^>]*>(.*?)</script>', content, re.DOTALL)
    assert match, "<script id='data'> nao encontrado"
    json_text = match.group(1).strip()
    assert len(json_text) > 100, f"JSON embutido muito pequeno: {len(json_text)} chars"
    # Validar que eh JSON valido
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        pytest.fail(f"JSON embutido INVALIDO: {e}")
    assert isinstance(data, dict), f"JSON deve ser dict, got {type(data)}"


def test_controle_data_has_state():
    """JSON embutido deve ter secao 'state' com timestamps."""
    content = CONTROLE.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r'<script id="data"[^>]*>(.*?)</script>', content, re.DOTALL)
    data = json.loads(match.group(1))
    assert "state" in data, "Secao 'state' ausente"
    assert "last_cotacoes_finished_iso" in data["state"], "last_cotacoes_finished_iso ausente"
    assert "last_options_wdo_last_updated" in data["state"], "last_options_wdo_last_updated ausente"
    assert "last_options_win_last_updated" in data["state"], "last_options_win_last_updated ausente"


def test_controle_data_has_cotacoes():
    """JSON deve ter cotações/portfolio/options."""
    content = CONTROLE.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r'<script id="data"[^>]*>(.*?)</script>', content, re.DOTALL)
    data = json.loads(match.group(1))
    assert "cotacoes" in data, "Secao 'cotacoes' ausente"
    cotacoes = data["cotacoes"]
    assert "market_status" in cotacoes or "data_files" in cotacoes, "cotacoes incompleta"


def test_controle_renders_cards():
    """HTML deve ter estrutura para renderizar cards (>= 10 divs/widget)."""
    content = CONTROLE.read_text(encoding="utf-8", errors="ignore")
    # Cards tipicos em dashboards Neon/Indigo: classes "card", "tile", "widget"
    cards = re.findall(r'class="[^"]*(?:card|tile|widget|panel|stat|metric)[^"]*"', content, re.I)
    assert len(cards) >= 5, f"Poucos cards/widgets: {len(cards)} (esperado >= 5)"


def test_controle_js_references_service():
    """JS deve referenciar o service Node (3433)."""
    content = CONTROLE.read_text(encoding="utf-8", errors="ignore")
    # Procura 127.0.0.1:3433 ou 'localhost:3433'
    assert "3433" in content, "JS nao referencia porta 3433 do service"


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))