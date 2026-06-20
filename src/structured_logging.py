"""
structured_logging.py - E38: Logging estruturado em JSON.

Permite que logs do Python sejam emitidos em formato JSON estruturado
(em vez de texto puro). Facilita integracao com Datadog, CloudWatch,
Elasticsearch, etc.

Uso standalone:
    from src.structured_logging import setup_json_logging
    setup_json_logging(level='INFO', output_file='service.log')
    import logging
    logger = logging.getLogger(__name__)
    logger.info('pipeline_started', extra={'symbol': 'WDO', 'spot': 5108})

    # Output JSON:
    {"ts": "2026-06-19T14:00:00", "level": "INFO", "module": "orquestrador",
     "message": "pipeline_started", "symbol": "WDO", "spot": 5108}

Formatos suportados:
- JSON (padrao, recomendado)
- Texto (fallback se python-json-logger nao disponivel)

Campos extras:
- correlation_id: ID de correlacao cross-process
- duration_ms: duracao de operacao
- symbol: ativo (WDO, WIN, EWZ, etc)
- spot: preco atual
- layer: pipeline layer (options, cotacoes, etc)
- error_code: codigo de erro se aplicavel
"""
from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


class JSONFormatter(logging.Formatter):
    """Formatter que converte LogRecord em JSON estruturado.

    Campos sempre presentes:
    - ts: timestamp ISO 8601
    - level: nivel do log (DEBUG/INFO/WARNING/ERROR/CRITICAL)
    - module: nome do modulo
    - message: mensagem formatada

    Campos extras (de LogRecord.__dict__):
    - correlation_id, duration_ms, symbol, spot, layer, error_code
    """

    # Campos reservados do LogRecord (nao devem ir como extras)
    RESERVED_FIELDS = {
        'name', 'msg', 'args', 'levelname', 'levelno', 'pathname', 'filename',
        'module', 'exc_info', 'exc_text', 'stack_info', 'lineno', 'funcName',
        'created', 'msecs', 'relativeCreated', 'thread', 'threadName',
        'processName', 'process', 'message', 'asctime',
    }

    # Campos reservados que NAO devem ser duplicados
    INTERNAL_TIMESTAMP = 'created'

    def format(self, record: logging.LogRecord) -> str:
        """Formata LogRecord como JSON."""
        # Timestamp ISO 8601
        ts = datetime.fromtimestamp(record.created).isoformat()

        # Mensagem
        try:
            message = record.getMessage()
        except Exception:
            message = str(record.msg)

        log_obj = {
            'ts': ts,
            'level': record.levelname,
            'module': record.name,
            'message': message,
        }

        # Adiciona campos extras (que nao sao reservados)
        for key, value in record.__dict__.items():
            if key not in self.RESERVED_FIELDS and not key.startswith('_'):
                # Serializa valores nao-JSON
                if isinstance(value, (str, int, float, bool, type(None))):
                    log_obj[key] = value
                else:
                    log_obj[key] = str(value)

        # Adiciona exception info se houver
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_obj, ensure_ascii=False, separators=(',', ':'))


def setup_json_logging(
    level: str = 'INFO',
    output_file: Optional[str] = None,
    correlation_id: Optional[str] = None,
    console_output: bool = True,
) -> None:
    """Configura logging estruturado em JSON.

    Args:
        level: nivel de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        output_file: caminho do arquivo de log (opcional)
        correlation_id: ID de correlacao (opcional, padrao: gerado)
        console_output: se True, tambem loga em stdout
    """
    formatter = JSONFormatter()
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))

    # Remove handlers existentes (evita duplicacao)
    root_logger.handlers.clear()

    # Console handler
    if console_output:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

    # File handler
    if output_file:
        log_path = Path(output_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(output_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    # Adiciona correlation_id como filter (propaga para todos os logs)
    if correlation_id:
        old_factory = logging.getLogRecordFactory()

        def add_correlation_id(*args, **kwargs):
            record = old_factory(*args, **kwargs)
            record.correlation_id = correlation_id
            return record

        logging.setLogRecordFactory(add_correlation_id)


def setup_text_logging(
    level: str = 'INFO',
    output_file: Optional[str] = None,
    console_output: bool = True,
) -> None:
    """Fallback para logging em texto puro (nao-JSON).

    Args:
        level: nivel de log
        output_file: caminho do arquivo de log (opcional)
        console_output: se True, loga em stdout
    """
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s %(name)s %(message)s',
        datefmt='%Y-%m-%dT%H:%M:%S'
    )
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    root_logger.handlers.clear()

    if console_output:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

    if output_file:
        log_path = Path(output_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(output_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)


def setup_logging(
    level: str = 'INFO',
    format: str = 'json',  # 'json' ou 'text'
    output_file: Optional[str] = None,
    correlation_id: Optional[str] = None,
    console_output: bool = True,
) -> None:
    """Configura logging.

    Args:
        level: nivel de log
        format: 'json' (estruturado) ou 'text' (legado)
        output_file: arquivo de log (opcional)
        correlation_id: ID de correlacao (opcional)
        console_output: loga em stdout tambem
    """
    if format == 'json':
        setup_json_logging(
            level=level,
            output_file=output_file,
            correlation_id=correlation_id,
            console_output=console_output,
        )
    else:
        setup_text_logging(level=level, output_file=output_file)
        if correlation_id:
            # Mesmo assim adiciona correlation_id
            old_factory = logging.getLogRecordFactory()

            def add_correlation_id(*args, **kwargs):
                record = old_factory(*args, **kwargs)
                record.correlation_id = correlation_id
                return record

            logging.setLogRecordFactory(add_correlation_id)
