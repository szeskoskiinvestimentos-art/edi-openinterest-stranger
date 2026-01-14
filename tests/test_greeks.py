import unittest
import numpy as np
import sys
import os

# Adiciona o diretório raiz ao path para importar src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.greeks import GreeksEngine

class TestGreeksEngine(unittest.TestCase):
    def setUp(self):
        # Parâmetros padrão de teste
        self.S = 100.0  # Spot
        self.K = 100.0  # Strike
        self.T = 1.0    # 1 ano
        self.r = 0.05   # 5% risk free
        self.sigma = 0.2 # 20% vol

    def test_bs_price_call_atm(self):
        """Testa preço de Call ATM"""
        price = GreeksEngine.bs_price(self.S, self.K, self.T, self.r, self.sigma, 'C')
        # Valor de referência aproximado para BS(100, 100, 1, 0.05, 0.2) -> Call ~ 10.45
        self.assertAlmostEqual(float(price), 10.4506, places=4)

    def test_bs_price_put_atm(self):
        """Testa preço de Put ATM"""
        price = GreeksEngine.bs_price(self.S, self.K, self.T, self.r, self.sigma, 'P')
        # Put ~ 5.57
        self.assertAlmostEqual(float(price), 5.5735, places=4)

    def test_put_call_parity(self):
        """Testa paridade Put-Call: C - P = S - K*exp(-rT)"""
        c = GreeksEngine.bs_price(self.S, self.K, self.T, self.r, self.sigma, 'C')
        p = GreeksEngine.bs_price(self.S, self.K, self.T, self.r, self.sigma, 'P')
        lhs = c - p
        rhs = self.S - self.K * np.exp(-self.r * self.T)
        self.assertAlmostEqual(float(lhs), float(rhs), places=7)

    def test_delta_atm(self):
        """Testa Delta ATM (Call ~ 0.6, Put ~ -0.4 com drift)"""
        delta_c, _ = GreeksEngine.calculate_greeks(self.S, self.K, self.T, self.r, self.sigma, 'C')
        delta_p, _ = GreeksEngine.calculate_greeks(self.S, self.K, self.T, self.r, self.sigma, 'P')
        
        # d1 = (ln(1) + (0.05 + 0.02)*1) / 0.2 = 0.07 / 0.2 = 0.35
        # N(0.35) ~ 0.6368
        self.assertAlmostEqual(float(delta_c), 0.6368, places=3)
        self.assertAlmostEqual(float(delta_p), 0.6368 - 1.0, places=3)

    def test_gamma_equality(self):
        """Testa se Gamma é igual para Call e Put"""
        _, gamma_c = GreeksEngine.calculate_greeks(self.S, self.K, self.T, self.r, self.sigma, 'C')
        _, gamma_p = GreeksEngine.calculate_greeks(self.S, self.K, self.T, self.r, self.sigma, 'P')
        self.assertAlmostEqual(float(gamma_c), float(gamma_p), places=7)
        self.assertGreater(float(gamma_c), 0.0)

    def test_vega_equality(self):
        """Testa se Vega é igual para Call e Put (embora o método não exija tipo, conceitualmente é o mesmo)"""
        vega_c = GreeksEngine.calculate_vega(self.S, self.K, self.T, self.r, self.sigma)
        vega_p = GreeksEngine.calculate_vega(self.S, self.K, self.T, self.r, self.sigma)
        self.assertAlmostEqual(float(vega_c), float(vega_p), places=7)
        self.assertGreater(float(vega_c), 0.0)

    def test_vectorized_input(self):
        """Testa suporte a inputs vetorizados (NumPy arrays)"""
        S = np.array([100.0, 100.0])
        K = np.array([90.0, 110.0])
        prices = GreeksEngine.bs_price(S, K, self.T, self.r, self.sigma, 'C')
        
        self.assertEqual(len(prices), 2)
        self.assertGreater(float(prices[0]), float(prices[1])) # Call ITM > Call OTM

    def test_edge_cases(self):
        """Testa casos extremos: T muito pequeno"""
        T_tiny = 1e-6
        delta, gamma = GreeksEngine.calculate_greeks(self.S, self.K, T_tiny, self.r, self.sigma, 'C')
        # Com T -> 0, ATM Delta -> 0.5 (aprox) e Gamma explode
        # Mas nossa implementação usa np.nan_to_num e evita crash
        self.assertTrue(np.isfinite(delta))
        self.assertTrue(np.isfinite(gamma))

if __name__ == '__main__':
    unittest.main()
