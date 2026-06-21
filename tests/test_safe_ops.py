"""
test_safe_ops.py - Testes para o helper de operacoes defensivas (E95).

Valida:
- safe_call captura apenas excecoes especificas
- safe_call passa o resultado normal se sem excecao
- safe_call retorna default se excecao capturada
- safe_call loga (ou nao, se logger=None)
- safe_default com lambda
- safe_import para modulo existente
- safe_import para modulo inexistente (retorna default)
- Excecoes inesperadas NAO sao silenciadas quando reraise_unexpected=True
- Decorator preserva nome e docstring (functools.wraps)
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.safe_ops import (
    safe_call,
    safe_default,
    safe_import,
    SafeOpError,
    SAFE_EXCEPTIONS,
)


# ============================================================
# Tests
# ============================================================

def test_safe_call_returns_value_on_success():
    """safe_call deve passar o valor normal se funcao tem sucesso."""
    @safe_call(default=None)
    def add(a, b):
        return a + b

    assert add(2, 3) == 5
    assert add(-1, 1) == 0


def test_safe_call_captures_value_error():
    """safe_call captura ValueError e retorna default."""
    @safe_call(default=-1)
    def parse_int(s):
        return int(s)

    assert parse_int("abc") == -1
    assert parse_int("42") == 42


def test_safe_call_captures_key_error():
    """safe_call captura KeyError."""
    @safe_call(default=None)
    def get_key(d, k):
        return d[k]

    assert get_key({"a": 1}, "a") == 1
    assert get_key({}, "missing") is None


def test_safe_call_captures_zero_division():
    """safe_call captura ZeroDivisionError."""
    @safe_call(default=0.0)
    def divide(a, b):
        return a / b

    assert divide(10, 2) == 5.0
    assert divide(10, 0) == 0.0


def test_safe_call_captures_type_error():
    """safe_call captura TypeError."""
    @safe_call(default="ERR")
    def concat(a, b):
        return a + b

    assert concat("a", "b") == "ab"
    assert concat("a", 1) == "ERR"


def test_safe_call_preserves_name_and_doc():
    """Decorador preserva __name__ e __doc__."""
    @safe_call(default=None)
    def my_special_function(x):
        """Minha docstring."""
        return x

    assert my_special_function.__name__ == "my_special_function"
    assert my_special_function.__doc__ == "Minha docstring."


def test_safe_call_with_logger(caplog):
    """safe_call loga warning ao capturar excecao."""
    logger = logging.getLogger("test_safe_call")
    logger.setLevel(logging.WARNING)

    @safe_call(default=0, logger=logger, log_msg="MEU_OP")
    def risky():
        raise ValueError("boom")

    with caplog.at_level(logging.WARNING, logger="test_safe_call"):
        result = risky()
    assert result == 0
    assert any("MEU_OP" in rec.message for rec in caplog.records)


def test_safe_call_unexpected_exception_reraise():
    """Excecoes nao-listadas sao re-raised com reraise_unexpected=True."""
    @safe_call(default=None, exceptions=(ValueError,), reraise_unexpected=True)
    def only_value_error():
        raise TypeError("not a ValueError")

    try:
        only_value_error()
        assert False, "Deveria ter re-raised"
    except SafeOpError as e:
        # mensagem deve mencionar TypeError (da excecao original)
        assert "TypeError" in str(e) or "TypeError" in repr(e.__cause__)


def test_safe_call_unexpected_exception_silenced():
    """Excecoes nao-listadas sao silenciadas (com warning) por default."""
    @safe_call(default="FALLBACK", exceptions=(ValueError,))
    def only_value_error():
        raise TypeError("not a ValueError")

    # Por default, NAO re-raise, retorna default
    result = only_value_error()
    assert result == "FALLBACK"


def test_safe_default_with_lambda():
    """safe_default aceita lambda."""
    result = safe_default(lambda: int("abc"), default=0)
    assert result == 0

    result = safe_default(lambda: 2 + 2, default=0)
    assert result == 4


def test_safe_default_captures_value_error():
    """safe_default captura ValueError."""
    result = safe_default(
        lambda: [1, 2, 3][10],  # IndexError
        default=[],
        log_msg="LIST_ACCESS"
    )
    assert result == []


def test_safe_import_existing():
    """safe_import retorna modulo se existir."""
    import sys as real_sys
    result = safe_import("sys")
    assert result is real_sys


def test_safe_import_missing():
    """safe_import retorna default se modulo nao existir."""
    result = safe_import("modulo_que_nao_existe_999", default=None)
    assert result is None


def test_safe_exceptions_includes_common():
    """SAFE_EXCEPTIONS inclui erros comuns."""
    assert ValueError in SAFE_EXCEPTIONS
    assert TypeError in SAFE_EXCEPTIONS
    assert KeyError in SAFE_EXCEPTIONS
    assert IndexError in SAFE_EXCEPTIONS
    assert ZeroDivisionError in SAFE_EXCEPTIONS


def test_module_exports():
    """Modulo exporta simbolos esperados."""
    from src import safe_ops
    assert hasattr(safe_ops, "safe_call")
    assert hasattr(safe_ops, "safe_default")
    assert hasattr(safe_ops, "safe_import")
    assert hasattr(safe_ops, "SafeOpError")
    assert hasattr(safe_ops, "SAFE_EXCEPTIONS")


if __name__ == "__main__":
    tests = [v for k, v in globals().items() if k.startswith("test_")]
    passed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS: {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {t.__name__}: {e}")
    print(f"\n{passed}/{len(tests)} tests passed")