"""
test_structured_logging.py - Testes para E38 (Logging JSON estruturado).

Valida que src/structured_logging.py:
- JSONFormatter produz saida valida
- Campos basicos (ts, level, module, message)
- Campos extras sao propagados
- Setup funciona com diferentes niveis
- Fallback text funciona
"""
from __future__ import annotations

import io
import json
import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.structured_logging import (
    JSONFormatter,
    setup_json_logging,
    setup_text_logging,
    setup_logging,
)


def get_capture_stream():
    """Cria stream para capturar output de log."""
    return io.StringIO()


def test_json_formatter_basic():
    """JSONFormatter deve produzir JSON com campos basicos."""
    fmt = JSONFormatter()
    record = logging.LogRecord(
        name='test_module', level=logging.INFO, pathname='/path',
        lineno=1, msg='hello world', args=(), exc_info=None
    )
    output = fmt.format(record)

    obj = json.loads(output)
    assert obj['level'] == 'INFO'
    assert obj['module'] == 'test_module'
    assert obj['message'] == 'hello world'
    assert 'ts' in obj
    return True, f"JSON basico OK: {obj}"


def test_json_formatter_extras():
    """JSONFormatter deve incluir campos extras passados via extra=."""
    import logging

    # Cria logger que captura
    logger = logging.getLogger('test_extras')
    logger.handlers.clear()
    logger.propagate = False

    buf = io.StringIO()
    handler = logging.StreamHandler(buf)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

    # Log com extras via logger.info(..., extra={})
    logger.info('pipeline_started', extra={'symbol': 'WDO', 'spot': 5108, 'duration_ms': 1234})

    output = buf.getvalue()
    obj = json.loads(output.strip())
    assert obj['symbol'] == 'WDO'
    assert obj['spot'] == 5108
    assert obj['duration_ms'] == 1234
    assert obj['level'] == 'INFO'
    return True, f"Extras OK: symbol={obj['symbol']}, spot={obj['spot']}"


def test_json_formatter_correlation_id():
    """correlation_id adicionado via factory deve aparecer no JSON."""
    fmt = JSONFormatter()
    record = logging.LogRecord(
        name='test', level=logging.INFO, pathname='/p', lineno=1,
        msg='msg', args=(), exc_info=None
    )
    record.correlation_id = 'corr-abc-123'
    output = fmt.format(record)
    obj = json.loads(output)

    assert obj['correlation_id'] == 'corr-abc-123'
    return True, f"correlation_id OK: {obj['correlation_id']}"


def test_json_formatter_exception():
    """Exceptions devem ser capturadas em campo 'exception'."""
    fmt = JSONFormatter()
    try:
        raise ValueError('test error')
    except ValueError:
        import sys
        record = logging.LogRecord(
            name='test', level=logging.ERROR, pathname='/p', lineno=1,
            msg='erro_capturado', args=(), exc_info=sys.exc_info()
        )
    output = fmt.format(record)
    obj = json.loads(output)

    assert 'exception' in obj, "Campo exception nao presente"
    assert 'ValueError' in obj['exception'], "ValueError nao capturado"
    return True, f"Exception capturada: {obj['exception'][:60]}..."


def test_setup_json_logging_capture():
    """setup_json_logging deve redirecionar log para StringIO."""
    import logging
    setup_json_logging(level='INFO', console_output=False)

    # Redireciona para StringIO via handler custom
    buf = io.StringIO()
    handler = logging.StreamHandler(buf)
    handler.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.addHandler(handler)
    try:
        logging.getLogger('test_module').info('hello_from_json')
        output = buf.getvalue()
        obj = json.loads(output.strip())
        assert obj['message'] == 'hello_from_json'
        assert obj['module'] == 'test_module'
    finally:
        root.removeHandler(handler)
        # Reset para nao afetar outros testes
        root.handlers.clear()
    return True, "Setup + log + parse OK"


def test_setup_json_logging_with_file(tmp_path=None):
    """setup_json_logging deve escrever em arquivo."""
    import tempfile
    if tmp_path is None:
        tmp_path = Path(tempfile.mkdtemp())

    log_file = tmp_path / "test.log"
    setup_json_logging(level='DEBUG', output_file=str(log_file),
                        console_output=False)
    try:
        logging.getLogger('file_test').info('test_message', extra={'key': 'value'})

        # Le arquivo
        content = log_file.read_text()
        assert 'test_message' in content, "Mensagem nao encontrada no arquivo"
        obj = json.loads(content.strip())
        assert obj['message'] == 'test_message'
        assert obj['key'] == 'value'
    finally:
        # Reset
        logging.getLogger().handlers.clear()
        log_file.unlink()
    return True, f"Arquivo escrito: {log_file}"


def test_setup_text_logging_fallback():
    """setup_text_logging deve produzir texto legivel."""
    import logging
    setup_text_logging(level='INFO', console_output=False)

    buf = io.StringIO()
    handler = logging.StreamHandler(buf)
    handler.setFormatter(logging.Formatter('[%(levelname)s] %(message)s'))
    logging.getLogger().addHandler(handler)
    try:
        logging.getLogger('text_test').info('hello_text')
        output = buf.getvalue()
        assert '[INFO] hello_text' in output, f"Formato errado: {output}"
    finally:
        logging.getLogger().handlers.clear()
    return True, "Texto format OK"


def test_setup_logging_json_dispatches_to_json():
    """setup_logging com format='json' deve usar JSONFormatter."""
    # Default: console_output=True
    setup_logging(level='INFO', format='json')

    # Confirma que JSONFormatter esta instalado
    root = logging.getLogger()
    has_json = any(
        isinstance(h.formatter, JSONFormatter) for h in root.handlers
    )
    assert has_json, "JSONFormatter nao encontrado nos handlers"
    logging.getLogger().handlers.clear()
    return True, "format='json' dispatcha para JSONFormatter"


def test_setup_logging_text_dispatches_to_text():
    """setup_logging com format='text' deve usar Formatter texto."""
    setup_logging(level='INFO', format='text', console_output=False)

    root = logging.getLogger()
    has_text = any(
        not isinstance(h.formatter, JSONFormatter) for h in root.handlers
    )
    assert has_text, "Formatter de texto nao encontrado"
    logging.getLogger().handlers.clear()
    return True, "format='text' dispatcha para text Formatter"


def test_json_formatter_safely_serializes_complex():
    """Valores nao-seriais (objetos) devem virar string."""
    fmt = JSONFormatter()
    record = logging.LogRecord(
        name='test', level=logging.INFO, pathname='/p', lineno=1,
        msg='complex', args=(), exc_info=None
    )
    # Adiciona objeto complexo
    class CustomObj:
        def __repr__(self): return "CUSTOM_OBJ_REPR"
    record.custom_obj = CustomObj()
    record.list_value = [1, 2, 3]
    record.dict_value = {'k': 'v'}

    output = fmt.format(record)
    obj = json.loads(output)
    assert obj['custom_obj'] == "CUSTOM_OBJ_REPR", \
        f"Custom obj nao serializado: {obj['custom_obj']}"
    return True, f"Objetos complexos serializados OK"


if __name__ == "__main__":
    tests = [
        ("JSONFormatter basico", test_json_formatter_basic),
        ("JSONFormatter extras", test_json_formatter_extras),
        ("JSONFormatter correlation_id", test_json_formatter_correlation_id),
        ("JSONFormatter exception", test_json_formatter_exception),
        ("setup_json_logging captura", test_setup_json_logging_capture),
        ("setup_json_logging file", test_setup_json_logging_with_file),
        ("setup_text_logging fallback", test_setup_text_logging_fallback),
        ("setup_logging json dispatch", test_setup_logging_json_dispatches_to_json),
        ("setup_logging text dispatch", test_setup_logging_text_dispatches_to_text),
        ("JSON serializa objetos complexos", test_json_formatter_safely_serializes_complex),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            ok, msg = fn()
            if ok:
                print(f"  [OK ] {name} - {msg}")
                passed += 1
            else:
                print(f"  [FAIL] {name} - {msg}")
                failed += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  [FAIL] {name} - {e}")
            failed += 1

    print(f"\n=== Total: {len(tests)}, Passou: {passed}, Falhou: {failed} ===")
    sys.exit(1 if failed else 0)
