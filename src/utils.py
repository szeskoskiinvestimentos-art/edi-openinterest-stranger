import pandas as pd
import numpy as np
import datetime as dt

def _num(s):
    """Converte string formatada (com vírgulas, etc.) para numérico."""
    return pd.to_numeric(
        s.astype(str).str.replace(r'[^\d\.\-]', '', regex=True).str.replace(',', ''),
        errors='coerce'
    )

def get_business_days(start_date, end_date):
    """Calcula dias úteis entre duas datas."""
    try:
        return int(np.busday_count(start_date, end_date))
    except Exception:
        return 1
