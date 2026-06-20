"""GreeksEngine — Motor de cálculo vetorizado para Gregas de Black-Scholes.

Focado apenas em matemática financeira, sem estado de negócio.
Suporta entrada scalar ou array para todos os parâmetros.
"""
import numpy as np
from numpy.typing import NDArray
from scipy.stats import norm
from typing import Union

# Tipo para entrada flexível (scalar ou array)
Numeric = Union[float, int, np.ndarray, NDArray[np.float64]]


def _broadcast_to_k_shape(*args: Numeric) -> list[NDArray[np.float64]]:
    """Broadcast all arrays to match the shape of the largest array (typically K)."""
    arrays = [np.asarray(a, dtype=float) for a in args]
    target_shape = max((a.shape for a in arrays), key=lambda s: len(s))
    result: list[NDArray[np.float64]] = []
    for a in arrays:
        if a.shape != target_shape:
            result.append(np.broadcast_to(a, target_shape).copy())
        else:
            result.append(a)
    return result


class GreeksEngine:
    """Motor de cálculo vetorizado para Gregas de Black-Scholes.

    Todos os métodos são estáticos e suportam entrada scalar ou array.
    Broadcast automático alinha shapes antes do cálculo.
    """

    @staticmethod
    def calculate_greeks(
        S: Numeric,
        K: Numeric,
        T: Numeric,
        r: Numeric,
        sigma: Numeric,
        typ: str,
    ) -> tuple[NDArray[np.float64], NDArray[np.float64]]:
        """Cálculo vetorizado de Delta e Gamma.

        Args:
            S: Preço do ativo subjacente (Spot)
            K: Strike price
            T: Tempo até o vencimento (em anos)
            r: Taxa livre de risco (anual)
            sigma: Volatilidade implícita (anual)
            typ: Tipo da opção ('C' para Call, 'P' para Put)

        Returns:
            Tupla (delta, gamma) como arrays numpy
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
    def calculate_vega(
        S: Numeric,
        K: Numeric,
        T: Numeric,
        r: Numeric,
        sigma: Numeric,
    ) -> NDArray[np.float64]:
        """Cálculo vetorizado de Vega.

        Args:
            S: Preço do ativo subjacente (Spot)
            K: Strike price
            T: Tempo até o vencimento (em anos)
            r: Taxa livre de risco (anual)
            sigma: Volatilidade implícita (anual)

        Returns:
            Array numpy com valores de Vega
        """
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
    def calculate_theta(
        S: Numeric,
        K: Numeric,
        T: Numeric,
        r: Numeric,
        sigma: Numeric,
        typ: str,
    ) -> NDArray[np.float64]:
        """Cálculo vetorizado de Theta.

        Args:
            S: Preço do ativo subjacente (Spot)
            K: Strike price
            T: Tempo até o vencimento (em anos)
            r: Taxa livre de risco (anual)
            sigma: Volatilidade implícita (anual)
            typ: Tipo da opção ('C' para Call, 'P' para Put)

        Returns:
            Array numpy com valores de Theta (anual)
        """
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
    def implied_vol_bs(
        price: Numeric,
        S: Numeric,
        K: Numeric,
        T: Numeric,
        r: Numeric,
        typ: str,
        max_iter: int = 60,
        tol: float = 1e-5,
    ) -> tuple[float, float] | None:
        """Calcula volatilidade implicita via bisseccao (Black-Scholes).

        Versao robusta com tratamento de edge cases e retorno de confidence.

        Args:
            price: preco de mercado da opcao
            S: spot do ativo
            K: strike
            T: tempo em anos
            r: taxa livre de risco
            typ: 'C' para call, 'P' para put
            max_iter: maximo de iteracoes (default 60)
            tol: tolerancia de convergencia (default 1e-5)

        Returns:
            Tupla (iv, confidence) onde:
                - iv: volatilidade implicita (annualizada)
                - confidence: 0.0 a 1.0 (1.0 = convergiu perfeitamente, <0.5 = aproximacao)
            Ou None se nao foi possivel calcular.
        """
        if not (np.isfinite(price) and np.isfinite(S) and np.isfinite(K)
                and np.isfinite(T) and np.isfinite(r)):
            return None
        if price <= 0 or S <= 0 or K <= 0 or T <= 0:
            return None

        # Edge case: preco menor que intrinsic value
        intrinsic = max(0.0, S - K) if typ == "C" else max(0.0, K - S)
        if price < intrinsic - 0.01:  # tolerancia de 1 centavo
            return None

        # Edge case: preco igual ao intrinsic (ITM deep, vol = 0)
        if abs(price - intrinsic) < 0.01:
            return 0.0, 0.5  # confidence baixa pois e arbitrario

        lo = 1e-6
        hi = 5.0
        p_hi = float(GreeksEngine.bs_price(S, K, T, r, hi, typ))
        if not np.isfinite(p_hi) or p_hi < price:
            # Tenta com range expandido (pode ser opcao com vol muito alta)
            hi = 20.0
            p_hi = float(GreeksEngine.bs_price(S, K, T, r, hi, typ))
            if not np.isfinite(p_hi) or p_hi < price:
                return None

        # Edge case: T muito pequeno (0DTE)
        # BS quebra quando T < ~1/365 anos, entao usamos T_min
        T_eff = max(T, 1.0/365.0)  # min 1 dia

        iterations_used = 0
        last_error = float('inf')
        for i in range(max_iter):
            mid = 0.5 * (lo + hi)
            p_mid = float(GreeksEngine.bs_price(S, K, T_eff, r, mid, typ))
            iterations_used = i + 1
            if not np.isfinite(p_mid):
                hi = mid
                continue
            err = abs(p_mid - price)
            last_error = err
            if err < tol * max(price, 1.0):
                # Convergiu
                confidence = 1.0
                return mid, confidence
            if p_mid > price:
                hi = mid
            else:
                lo = mid

        # Nao convergiu perfeitamente: confidence baseada no erro relativo
        rel_err = last_error / max(price, 1.0)
        confidence = max(0.1, min(0.9, 1.0 - rel_err * 10))
        iv_approx = 0.5 * (lo + hi)
        return iv_approx, confidence

    @staticmethod
    def bs_price(
        S: Numeric,
        K: Numeric,
        T: Numeric,
        r: Numeric,
        sigma: Numeric,
        typ: str,
    ) -> NDArray[np.float64]:
        """Cálculo do preço teórico (Black-Scholes).

        Args:
            S: Preço do ativo subjacente (Spot)
            K: Strike price
            T: Tempo até o vencimento (em anos)
            r: Taxa livre de risco (anual)
            sigma: Volatilidade implícita (anual)
            typ: Tipo da opção ('C' para Call, 'P' para Put)

        Returns:
            Array numpy com preços teóricos
        """
        S = np.asarray(S, dtype=float)
        K = np.asarray(K, dtype=float)
        T = np.asarray(T, dtype=float)
        r = np.asarray(r, dtype=float)
        sigma = np.asarray(sigma, dtype=float)
        
        # Broadcast all inputs to match K's shape
        S, K, T, r, sigma = _broadcast_to_k_shape(S, K, T, r, sigma)
        
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
