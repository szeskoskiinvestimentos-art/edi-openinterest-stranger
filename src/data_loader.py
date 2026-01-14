import pandas as pd
from pathlib import Path
import os
import re
import datetime as dt
from src.utils import _num

def collect_csv_files(directory='.'):
    """Coleta arquivos CSV no diretório especificado."""
    root = Path(directory)
    if not root.exists():
        return []
    # Busca recursiva para encontrar todos os CSVs, incluindo subdiretórios como 'Histórico barchart'
    return [str(p) for p in root.rglob('*.csv')]

def read_options_table(path: Path):
    """Lê um arquivo CSV de opções e tenta identificar colunas e Spot."""
    try:
        df = pd.read_csv(path)
    except Exception:
        return None, None
    if df.empty:
        return None, None
    df.columns = [c.strip() for c in df.columns]
    spot_val = None
    
    # Tenta achar o Spot nas colunas
    for c in df.columns:
        if any(k in c.lower() for k in ['spot', 'underlying', 'à vista', 'avista']):
            try:
                # Conversão segura para satisfazer linter
                vals = _num(df[c])
                if isinstance(vals, pd.Series):
                    valid_vals = vals.dropna()
                    if not valid_vals.empty:
                        spot_val = float(valid_vals.iloc[0])
                        break
            except Exception:
                pass
                
    rename_map = {
        'Open Int':'Open Int', 'Open Interest':'Open Int', 'OI':'Open Int',
        'Qtde. Contratos em Aberto':'Open Int',
        'Option Type':'OptionType', 'Type':'OptionType'
    }
    df = df.rename(columns={c: rename_map[c] for c in df.columns if c in rename_map})
    
    if not {'Strike','Open Int','OptionType'}.issubset(df.columns):
        return None, spot_val
        
    df['OptionType'] = (df['OptionType'].astype(str).str.strip().str.upper()
                        .replace({'C':'CALL','CALLS':'CALL','P':'PUT','PUTS':'PUT'}))
                        
    for col in ['Strike','Last','Volume','Open Int','Premium','Change']:
        if col in df.columns:
            df[col] = _num(df[col])
            
    df = df.dropna(subset=['Strike','Open Int']).reset_index(drop=True)
    df['StrikeK'] = df['Strike'].astype(float)
    return df, spot_val

def get_expiry_from_filename(filename):
    """Tenta extrair a data de vencimento do nome do arquivo."""
    base = os.path.basename(filename)
    
    # Padrão 1: YYYY-MM-DD (ex: exp_2025-12-30)
    m = re.search(r'exp[_\-]?(20\d{2})[_\-](\d{2})[_\-](\d{2})', base)
    if m:
        yyyy, mm, dd = map(int, m.groups())
        return dt.date(yyyy, mm, dd)
    
    # Padrão 2: MM_DD_YY (ex: exp-12_30_25)
    m2 = re.search(r'exp[_\-](\d{2})[_\-](\d{2})[_\-](\d{2})', base)
    if m2:
        mm, dd, yy = map(int, m2.groups())
        yyyy = 2000 + yy
        return dt.date(yyyy, mm, dd)
    
    return None

def get_snapshot_date_from_filename(filename):
    """Tenta extrair a data de snapshot do nome do arquivo (intraday-MM-DD-YYYY)."""
    base = os.path.basename(filename)
    # Ex: intraday-12-03-2025.csv ou similar
    m = re.search(r'intraday[_\-](\d{2})[_\-](\d{2})[_\-](\d{4})', base)
    if m:
        mm, dd, yyyy = map(int, m.groups())
        return dt.date(yyyy, mm, dd)
    return dt.date(1900, 1, 1) # Default antigo se não achar

def load_data(directory='.', use_csv_spot=False, spot_override=None):
    """Carrega e consolida dados de todos os CSVs encontrados."""
    csv_files = collect_csv_files(directory)
    parts, spot_auto = [], None
    expiry = None
    
    if not csv_files:
        print("Nenhum arquivo CSV encontrado.")
        return pd.DataFrame(), spot_override, None

    # Agrupa arquivos por vencimento e seleciona o mais recente (snapshot)
    files_by_expiry = {}
    
    for f in csv_files:
        exp = get_expiry_from_filename(f)
        snap = get_snapshot_date_from_filename(f)
        
        # Chave para agrupamento: se exp for None, usa o próprio nome como chave única (para não descartar)
        # Mas se quisermos consolidar por vencimento real, precisamos agrupar.
        # Se exp for None, assumimos que é um arquivo avulso que deve ser carregado (ex: oi_by_strike.csv)
        if exp is None:
            # Adiciona com chave única baseada no nome para garantir inclusão
            key = f"Unknown_{os.path.basename(f)}"
        else:
            key = exp
        
        if key not in files_by_expiry:
            files_by_expiry[key] = (f, snap)
        else:
            # Se já tem, verifica se o atual é mais recente
            _, existing_snap = files_by_expiry[key]
            if snap > existing_snap:
                files_by_expiry[key] = (f, snap)
    
    selected_files = [v[0] for v in files_by_expiry.values()]
    print(f"Arquivos selecionados para carregamento: {len(selected_files)} de {len(csv_files)} encontrados.")

    for f in selected_files:
        current_expiry = get_expiry_from_filename(f)
        d, s = read_options_table(Path(f))
        
        if d is not None and not d.empty:
            # Adiciona a data de vencimento a cada registro deste arquivo
            if current_expiry:
                d['Expiry'] = pd.to_datetime(current_expiry)
            else:
                # Fallback se não conseguir ler do nome do arquivo (evita erro)
                d['Expiry'] = pd.NaT
                
            parts.append(d)
            # Mantém expiry global apenas como referência (ex: para título)
            if expiry is None:
                expiry = current_expiry
                
        if s and not spot_auto:
            spot_auto = s
            
    if not parts:
        empty_cols = pd.Index(['Strike', 'Open Int', 'OptionType', 'StrikeK'])
        return pd.DataFrame(columns=empty_cols), spot_override, None
        
    options = pd.concat(parts, ignore_index=True)
    
    # Determina o Spot final
    final_spot = spot_override
    if use_csv_spot and spot_auto:
        final_spot = spot_auto
        
    # Ajuste de escala do Spot se necessário (menor que 100 -> multiplica por 1000)
    if final_spot and final_spot < 100:
        final_spot *= 1000
        
    return options, final_spot, expiry
