import numpy as np
from scipy.stats import norm


def _broadcast_to_k_shape(*args):
    """Broadcast all arrays to match the shape of the largest array (typically K)."""
    arrays = [np.asarray(a, dtype=float) for a in args]
    target_shape = max((a.shape for a in arrays), key=lambda s: len(s))
    result = []
    for a in arrays:
        if a.shape != target_shape:
            result.append(np.broadcast_to(a, target_shape).copy())
        else:
            result.append(a)
    return result


class GreeksEngine:
    """
    Motor de cálculo vetorizado para Gregas de Black-Scholes.
    Focado apenas em matemática financeira, sem estado de negócio.
    """
    
    @staticmethod
    def calculate_greeks(S, K, T, r, sigma, typ):
        """
        Cálculo vetorizado de Delta e Gamma.
        
        Args:
            S (float or np.array): Preço do ativo subjacente (Spot).
            K (float or np.array): Strike price.
            T (float or np.array): Tempo até o vencimento (em anos).
            r (float or np.array): Taxa livre de risco (anual).
            sigma (float or np.array): Volatilidade implícita (anual).
            typ (str): Tipo da opção ('C' para Call, 'P' para Put).
            
        Returns:
            tuple: (delta, gamma)
        """
        S = np.asarray(S, dtype=float)
        K = np.asarray(K, dtype=float)
        T = np.asarray(T, dtype=float)
        r = np.asarray(r, dtype=float)
        sigma = np.asarray(sigma, dtype=float)
        
        # Broadcast all inputs to match K's shape
        S, K, T, r, sigma = _broadcast_to_k_shape(S, K, T, r, sigma)
        
        # Inicializa arrays de resultado com zeros
        delta = np.zeros_like(S, dtype=float)
        gamma = np.zeros_like(S, dtype=float)
        
        # Máscara para valores válidos (T > 0 e sigma > 0)
        valid_mask = (T > 0) & (sigma > 0)
        
        if np.any(valid_mask):
            # Calcula apenas para valores válidos
            S_valid = S[valid_mask]
            K_valid = K[valid_mask]
            T_valid = T[valid_mask]
            r_valid = r[valid_mask]
            sigma_valid = sigma[valid_mask]
            
            with np.errstate(divide='ignore', invalid='ignore'):
                d1 = (np.log(S_valid/K_valid) + (r_valid + 0.5*sigma_valid**2)*T_valid) / (sigma_valid*np.sqrt(T_valid))
            
            if typ == 'C':
                delta[valid_mask] = norm.cdf(d1)
            else:
                delta[valid_mask] = norm.cdf(d1) - 1.0
            
            gamma[valid_mask] = norm.pdf(d1) / (S_valid*sigma_valid*np.sqrt(T_valid))
        
        # Para T=0 ou sigma=0:
        # Delta é intrinsic value (1 para ITM, 0 para OTM)
        # Gamma é 0 (sem curvatura no vencimento)
        invalid_mask = ~valid_mask
        if np.any(invalid_mask):
            if typ == 'C':
                delta[invalid_mask] = np.where(S[invalid_mask] >= K[invalid_mask], 1.0, 0.0)
            else:
                delta[invalid_mask] = np.where(S[invalid_mask] <= K[invalid_mask], 1.0, 0.0)
            # Gamma já é 0 (inicializado)
        
        return delta, gamma

    @staticmethod
    def calculate_vega(S, K, T, r, sigma):
        """Cálculo vetorizado de Vega."""
        S, K, T, r, sigma = _broadcast_to_k_shape(S, K, T, r, sigma)
        
        # Vega é 0 quando T=0 ou sigma=0
        vega = np.zeros_like(S, dtype=float)
        
        valid_mask = (T > 0) & (sigma > 0)
        if np.any(valid_mask):
            S_valid = S[valid_mask]
            K_valid = K[valid_mask]
            T_valid = T[valid_mask]
            r_valid = r[valid_mask]
            sigma_valid = sigma[valid_mask]
            
            with np.errstate(divide='ignore', invalid='ignore'):
                d1 = (np.log(S_valid/K_valid) + (r_valid + 0.5*sigma_valid**2)*T_valid) / (sigma_valid*np.sqrt(T_valid))
            
            vega[valid_mask] = S_valid * norm.pdf(d1) * np.sqrt(T_valid)
            # NOTE: Vega is per unit change in sigma (100%). Market convention is per 1%.
            # To convert to market convention: vega_market = vega / 100
            # Vega Exposure in calculator.py uses this raw value consistently.
        
        return vega

    @staticmethod
    def calculate_theta(S, K, T, r, sigma, typ):
        """Cálculo vetorizado de Theta."""
        S, K, T, r, sigma = _broadcast_to_k_shape(S, K, T, r, sigma)
        
        # Theta é 0 quando T=0 ou sigma=0
        theta = np.zeros_like(S, dtype=float)
        
        valid_mask = (T > 0) & (sigma > 0)
        if np.any(valid_mask):
            S_valid = S[valid_mask]
            K_valid = K[valid_mask]
            T_valid = T[valid_mask]
            r_valid = r[valid_mask]
            sigma_valid = sigma[valid_mask]
            
            with np.errstate(divide='ignore', invalid='ignore'):
                d1 = (np.log(S_valid/K_valid) + (r_valid + 0.5*sigma_valid**2)*T_valid) / (sigma_valid*np.sqrt(T_valid))
                d2 = d1 - sigma_valid*np.sqrt(T_valid)
            
            term = -(S_valid * norm.pdf(d1) * sigma_valid) / (2 * np.sqrt(T_valid))
            
            if typ == 'C':
                theta[valid_mask] = term - r_valid * K_valid * np.exp(-r_valid*T_valid) * norm.cdf(d2)
            else:
                theta[valid_mask] = term + r_valid * K_valid * np.exp(-r_valid*T_valid) * norm.cdf(-d2)
        
        return theta

    @staticmethod
    def bs_price(S, K, T, r, sigma, typ):
        """Cálculo do preço teórico (Black-Scholes)."""
        S = np.asarray(S, dtype=float)
        K = np.asarray(K, dtype=float)
        T = np.asarray(T, dtype=float)
        r = np.asarray(r, dtype=float)
        sigma = np.asarray(sigma, dtype=float)
        
        # Preço é intrinsic value quando T=0 ou sigma=0
        intrinsic = np.maximum(0.0, S - K) if typ == 'C' else np.maximum(0.0, K - S)
        
        price = np.zeros_like(S, dtype=float)
        
        valid_mask = (T > 0) & (sigma > 0)
        if np.any(valid_mask):
            S_valid = S[valid_mask]
            K_valid = K[valid_mask]
            T_valid = T[valid_mask]
            r_valid = r[valid_mask]
            sigma_valid = sigma[valid_mask]
            
            with np.errstate(divide='ignore', invalid='ignore'):
                d1 = (np.log(S_valid/K_valid) + (r_valid + 0.5*sigma_valid**2)*T_valid) / (sigma_valid*np.sqrt(T_valid))
                d2 = d1 - sigma_valid*np.sqrt(T_valid)
                
                if typ == 'C':
                    price[valid_mask] = S_valid*norm.cdf(d1) - K_valid*np.exp(-r_valid*T_valid)*norm.cdf(d2)
                else:
                    price[valid_mask] = K_valid*np.exp(-r_valid*T_valid)*norm.cdf(-d2) - S_valid*norm.cdf(-d1)
        
        # Para T=0 ou sigma=0, usa intrinsic value
        invalid_mask = ~valid_mask
        if np.any(invalid_mask):
            price[invalid_mask] = intrinsic[invalid_mask]
        
        return price
