import unittest
import time
import sys
import os
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src import tradingview_fetcher as tv


class TestFetchSpotPrices(unittest.TestCase):

    def setUp(self):
        tv._CACHE.clear()

    def test_returns_expected_format(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "data": [{"d": [38.06, 0.8, 0.3, "iShares Brazil ETF", "EWZ", "stock", "NYSEARCA"]}]
        }
        mock_resp.raise_for_status = lambda: None

        with patch("src.tradingview_fetcher.requests.post", return_value=mock_resp):
            result = tv.fetch_spot_prices()

        self.assertIn("EWZ", result)
        self.assertIn("price", result["EWZ"])
        self.assertIn("change_pct", result["EWZ"])
        self.assertIn("source", result["EWZ"])
        self.assertIn("timestamp", result["EWZ"])
        self.assertEqual(result["EWZ"]["source"], "tradingview")
        self.assertAlmostEqual(result["EWZ"]["price"], 38.06)

    def test_all_symbols_present(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "data": [{"d": [100.0, 1.0, 1.0, "Test", "T", "stock", "TEST"]}]
        }
        mock_resp.raise_for_status = lambda: None

        with patch("src.tradingview_fetcher.requests.post", return_value=mock_resp):
            result = tv.fetch_spot_prices()

        for alias in ["WIN", "WDO", "EWZ", "UUP", "USDU"]:
            self.assertIn(alias, result)

    def test_error_handling_returns_zero(self):
        with patch("src.tradingview_fetcher.requests.post", side_effect=tv.requests.RequestException("network error")):
            with patch("src.tradingview_fetcher.time.sleep"):
                result = tv.fetch_spot_prices()

        for alias in ["WIN", "WDO", "EWZ", "UUP", "USDU"]:
            self.assertEqual(result[alias]["price"], 0.0)
            self.assertIn("error", result[alias])

    def test_rate_limit_retries(self):
        call_count = {"WIN": 0, "WDO": 0, "EWZ": 0, "UUP": 0, "USDU": 0}

        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.json.return_value = {
            "data": [{"d": [50.0, 0.5, 0.25, "Test", "T", "stock", "TEST"]}]
        }
        ok_resp.raise_for_status = lambda: None

        def side_effect(url, **kwargs):
            payload = kwargs.get("json", {})
            ticker = payload.get("symbols", {}).get("tickers", [""])[0]
            call_count[ticker] = call_count.get(ticker, 0) + 1
            if call_count[ticker] <= 2:
                raise tv.requests.exceptions.HTTPError("429 Too Many Requests")
            return ok_resp

        with patch("src.tradingview_fetcher.requests.post", side_effect=side_effect):
            with patch("src.tradingview_fetcher.time.sleep"):
                result = tv.fetch_spot_prices()

        total_calls = sum(call_count.values())
        self.assertGreater(total_calls, 5, f"Expected retries across symbols, got {total_calls} calls")


class TestCaching(unittest.TestCase):

    def setUp(self):
        tv._CACHE.clear()

    def test_cache_returns_same_data(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "data": [{"d": [42.0, 0.1, 0.05, "Test", "T", "stock", "TEST"]}]
        }
        mock_resp.raise_for_status = lambda: None

        with patch("src.tradingview_fetcher.requests.post", return_value=mock_resp) as mock_post:
            result1 = tv.fetch_spot_prices()
            calls_first = mock_post.call_count
            result2 = tv.fetch_spot_prices()
            calls_second = mock_post.call_count

        self.assertEqual(calls_first, 5, "First call should hit network for all 5 symbols")
        self.assertEqual(calls_second, 5, "Second call should use cache (no additional network calls)")
        self.assertEqual(result1["EWZ"]["price"], result2["EWZ"]["price"])

    def test_cache_expires(self):
        tv._set_cache("test_key", "test_value")
        tv._CACHE["test_key"]["ts"] = time.time() - 100
        self.assertFalse(tv._is_cache_valid("test_key"))

    def test_cache_still_valid(self):
        tv._set_cache("test_key", "test_value")
        self.assertTrue(tv._is_cache_valid("test_key"))


if __name__ == '__main__':
    unittest.main()
