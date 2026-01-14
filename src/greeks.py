import numpy as np
from scipy.stats import norm

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
        
        # Evita divisão por zero ou raiz negativa
        with np.errstate(divide='ignore', invalid='ignore'):
            d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
            
        if typ == 'C':
            delta = norm.cdf(d1)
        else:
            delta = norm.cdf(d1) - 1.0
            
        gamma = norm.pdf(d1) / (S*sigma*np.sqrt(T))
        
        # Tratamento de NaN gerado por T=0 ou Sigma=0
        return np.nan_to_num(delta), np.nan_to_num(gamma)

    @staticmethod
    def calculate_vega(S, K, T, r, sigma):
        """Cálculo vetorizado de Vega."""
        S = np.asarray(S, dtype=float)
        K = np.asarray(K, dtype=float)
        T = np.asarray(T, dtype=float)
        r = np.asarray(r, dtype=float)
        sigma = np.asarray(sigma, dtype=float)
        
        with np.errstate(divide='ignore', invalid='ignore'):
            d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
            
        return np.nan_to_num(S * norm.pdf(d1) * np.sqrt(T))

    @staticmethod
    def calculate_theta(S, K, T, r, sigma, typ):
        """Cálculo vetorizado de Theta."""
        S = np.asarray(S, dtype=float)
        K = np.asarray(K, dtype=float)
        T = np.asarray(T, dtype=float)
        r = np.asarray(r, dtype=float)
        sigma = np.asarray(sigma, dtype=float)
        
        with np.errstate(divide='ignore', invalid='ignore'):
            d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
            d2 = d1 - sigma*np.sqrt(T)
        
        term = -(S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))
        
        if typ == 'C':
            theta = term - r * K * np.exp(-r*T) * norm.cdf(d2)
        else:
            theta = term + r * K * np.exp(-r*T) * norm.cdf(-d2)
            
        return np.nan_to_num(theta)

    @staticmethod
    def bs_price(S, K, T, r, sigma, typ):
        """Cálculo do preço teórico (Black-Scholes)."""
        S = np.asarray(S, dtype=float)
        K = np.asarray(K, dtype=float)
        T = np.asarray(T, dtype=float)
        r = np.asarray(r, dtype=float)
        sigma = np.asarray(sigma, dtype=float)
        
        # Note: bs_price logic with scalar checks (sigma<=0) is harder to vectorize directly 
        # without using np.where.
        # But for now, let's keep it simple or try to vectorize it using np.where.
        
        with np.errstate(divide='ignore', invalid='ignore'):
            d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
            d2 = d1 - sigma*np.sqrt(T)
            
            call_price = S*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
            put_price = K*np.exp(-r*T)*norm.cdf(-d2) - S*norm.cdf(-d1)
            
        price = call_price if typ == 'C' else put_price
        
        # Handle invalid cases (sigma <= 0 or T <= 0)
        # Intrinsic value
        intrinsic = np.maximum(0.0, S - K) if typ == 'C' else np.maximum(0.0, K - S)
        
        # Use intrinsic where sigma<=0 or T<=0
        mask_valid = (sigma > 0) & (T > 0)
        
        # If inputs are scalar, result is scalar. If array, result is array.
        # np.where works for both if we are careful.
        
        if np.ndim(mask_valid) == 0:
             return price if mask_valid else intrinsic
        else:
             return np.where(mask_valid, price, intrinsic)
