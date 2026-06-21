import logging

from src.safe_ops import safe_default

logger = logging.getLogger(__name__)


def format_number_br(value, decimals=2, prefix="", suffix=""):
    """
    Formata números no padrão brasileiro (1.234,56).

    Args:
        value (float/int): Valor numérico
        decimals (int): Casas decimais
        prefix (str): Prefixo opcional (ex: 'R$ ')
        suffix (str): Sufixo opcional (ex: '%')
    """
    if value is None:
        return "-"

    val = safe_default(
        lambda: float(value),
        default=None,
        logger=logger,
        log_msg=f"format_number_br converteu {value!r} para float"
    )
    if val is None:
        return str(value)
        
    # Formata com vírgula como separador decimal e ponto como milhar
    # Usamos o truque do replace: formata com vírgula padrão US (1,234.56), inverte chars
    # Ou mais simples: formata com _ como milhar e . decimal, depois substitui
    
    fmt = f"{{:,.{decimals}f}}"
    formatted = fmt.format(val)
    
    # Troca , por X, . por ,, X por .
    formatted = formatted.replace(",", "X").replace(".", ",").replace("X", ".")
    
    return f"{prefix}{formatted}{suffix}"

def parse_and_scale_walls(txt, scale):
    """
    Parses and scales wall strings like "38.5(15,000) | 39.0(12,000)".
    Returns tuple (values_list, formatted_string).
    """
    if not txt: return [], "N/A"
    try:
        parts = txt.split('|')
        scaled_parts = []
        values = []
        for p in parts:
            p = p.strip()
            if '(' in p:
                strike_str, vol_str = p.split('(')
                strike = float(strike_str) * scale
                vol = vol_str.replace(')', '')
                scaled_parts.append(f"{format_number_br(strike, 0)}({vol})")
                values.append(strike)
            else:
                try:
                    strike = float(p) * scale
                    scaled_parts.append(f"{format_number_br(strike, 0)}")
                    values.append(strike)
                except ValueError:
                    scaled_parts.append(p) # Mantém texto original se não for número
        return values, ' | '.join(scaled_parts)
    except (ValueError, TypeError, IndexError, KeyError, AttributeError) as e:
        logger.warning("[E95] parse_and_scale_walls failed: %s", e)
        return [], txt
