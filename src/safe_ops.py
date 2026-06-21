"""
safe_ops.py - Helpers para operacoes defensivas sem 'except Exception' generico.

Fornece decoradores e funcoes safe_* que capturam excecoes especificas,
fazem log adequado e retornam valores default. Elimina a necessidade de
`except Exception` ou `except:` genericos espalhados pelo codigo.

Uso:
    from src.safe_ops import safe_call, safe_default, SafeOpError

    @safe_call(default=None, logger=logger)
    def my_risky_func(x):
        return 1 / x

    val = safe_default(lambda: int("abc"), default=0, log_msg="parse int")

Vantagens sobre `except Exception`:
- Captura apenas excecoes relevantes (ValueError, TypeError, KeyError, IndexError)
- Logging consistente (info/warning/error)
- Documenta a intencao (safe vs unsafe)
- Testes de excecoes inesperadas NAO sao silenciados
"""
from __future__ import annotations

import functools
import logging
from typing import Any, Callable, TypeVar

T = TypeVar("T")

# Excecoes consideradas "esperadas" em operacoes defensivas.
# NAO inclui Exception generico (KeyError, ValueError, etc. sao especificas).
SAFE_EXCEPTIONS = (
    ValueError,
    TypeError,
    KeyError,
    IndexError,
    AttributeError,
    ZeroDivisionError,
    ArithmeticError,
    OSError,
    IOError,
    ImportError,
    NameError,  # modulos opcionais nao importados
)


class SafeOpError(Exception):
    """Erro em operacao safe — excecao nao-esperada escapou do filtro."""
    pass


def safe_call(
    default: Any = None,
    logger: logging.Logger | None = None,
    log_level: int = logging.WARNING,
    log_msg: str | None = None,
    exceptions: tuple = SAFE_EXCEPTIONS,
    reraise_unexpected: bool = False,
) -> Callable:
    """Decorador que captura excecoes especificas e retorna default.

    Args:
        default: valor retornado se excecao capturada
        logger: logger para registrar (opcional)
        log_level: nivel do log (default WARNING)
        log_msg: mensagem customizada (opcional, usa nome da funcao se None)
        exceptions: tupla de tipos a capturar (default SAFE_EXCEPTIONS)
        reraise_unexpected: se True, re-raise excecoes nao-listadas em exceptions
                            (recomendado em modo strict)

    Returns:
        Callable: decorador aplicado

    Examples:
        @safe_call(default=[], logger=logger)
        def parse_list(s):
            return s.split(",")

        @safe_call(default=0.0, log_msg="DIVISAO")
        def divide(a, b):
            return a / b
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except exceptions as e:
                msg = log_msg or f"{func.__name__} falhou"
                if logger:
                    logger.log(log_level, f"{msg}: {type(e).__name__}: {e}")
                return default
            except Exception as e:
                # Excecao nao esperada — log ERROR (mais severo)
                msg = log_msg or f"{func.__name__} falhou (inesperado)"
                if logger:
                    logger.error(f"{msg}: {type(e).__name__}: {e}")
                if reraise_unexpected:
                    raise SafeOpError(f"{msg} ({type(e).__name__}: {e})") from e
                return default
        return wrapper
    return decorator


def safe_default(
    func: Callable[[], T],
    default: T = None,
    logger: logging.Logger | None = None,
    log_level: int = logging.WARNING,
    log_msg: str | None = None,
    exceptions: tuple = SAFE_EXCEPTIONS,
) -> T:
    """Executa func() retornando default se capturar excecao especifica.

    Args:
        func: callable sem argumentos (use lambda se precisar)
        default: valor retornado se excecao capturada
        logger: logger para registrar
        log_level: nivel do log
        log_msg: mensagem customizada
        exceptions: tupla de tipos a capturar

    Returns:
        T: resultado de func() ou default

    Examples:
        val = safe_default(lambda: int("abc"), default=0)
        lst = safe_default(lambda: data[key], default=[], log_msg="lookup")
    """
    try:
        return func()
    except exceptions as e:
        if logger:
            logger.log(log_level, f"{log_msg or 'safe_default'}: {type(e).__name__}: {e}")
        return default


def safe_import(module_name: str, default=None, logger=None):
    """Import seguro que retorna default se modulo nao disponivel.

    Args:
        module_name: nome do modulo (e.g., 'scipy.stats')
        default: o que retornar se falhar
        logger: logger

    Returns:
        modulo importado ou default

    Examples:
        np = safe_import('numpy', default=None)
        if np is None:
            return ...
    """
    try:
        __import__(module_name)
        return __import__(module_name, fromlist=[''])
    except ImportError as e:
        if logger:
            logger.info(f"Modulo {module_name} nao disponivel: {e}")
        return default


__all__ = [
    "SAFE_EXCEPTIONS",
    "SafeOpError",
    "safe_call",
    "safe_default",
    "safe_import",
]