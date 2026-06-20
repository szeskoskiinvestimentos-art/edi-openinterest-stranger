import pandas as pd
import re

import logging

logger = logging.getLogger(__name__)

def _num(s):
    def _parse_one(v) -> float:
        if v is None:
            return float("nan")
        if isinstance(v, (int, float)):
            try:
                return float(v)
            except Exception as e:
                logger.debug("[E95] _parse_one failed: %s", e)
                return float("nan")
        x = str(v).strip()
        if x in {"", "-", "—", "N/A", "n/a", "null", "None"}:
            return float("nan")
        x = x.replace("%", "").strip()
        if "," in x and "." in x:
            if x.rfind(",") > x.rfind("."):
                x = x.replace(".", "").replace(",", ".")
            else:
                x = x.replace(",", "")
        elif "," in x:
            if re.search(r",\d{3}$", x):
                x = x.replace(",", "")
            else:
                x = x.replace(".", "").replace(",", ".")
        elif "." in x:
            if re.search(r"\.\d{3}$", x):
                x = x.replace(".", "")
        x = re.sub(r"[^\d\.\-]", "", x)
        if x in {"", "-", ".", "-."}:
            return float("nan")
        try:
            return float(x)
        except Exception as e:
            logger.debug("[E95] operation failed: %s", e)
            return float("nan")

    if isinstance(s, pd.Series):
        return s.apply(_parse_one)
    return pd.Series(s).apply(_parse_one)

