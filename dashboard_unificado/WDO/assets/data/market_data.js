window.marketData = {
    "last_updated": "2026-04-22 22:06:28",
    "spot_price": 4975.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 22/04/2026 22:06\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5015.38)\n  // 2 = Spline (5018.34)\n  // 3 = HVL (5006.46)\n  // 4 = HVL Log (4950.50)\n  // 5 = Sigma Kernel (4950.50)\n  // 6 = PVOP (5015.38)\n  // 7 = HVL Gaussian (4974.44)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5015.38;\n\n  if (ModeloFlip = 1) then GammaVal := 5015.38;\n  if (ModeloFlip = 2) then GammaVal := 5018.34;\n  if (ModeloFlip = 3) then GammaVal := 5006.46;\n  if (ModeloFlip = 4) then GammaVal := 4950.50;\n  if (ModeloFlip = 5) then GammaVal := 4950.50;\n  if (ModeloFlip = 6) then GammaVal := 5015.38;\n  if (ModeloFlip = 7) then GammaVal := 4974.44;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4985.26, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5381.13, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6050.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5197.47 > 0) then\n      HorizontalLineCustom(5197.47, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4875.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4583.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4666.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4857.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4892.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4969.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4980.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5407.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5442.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5957.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5992.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6069.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6080.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4532.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4717.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4835.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4914.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4988.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5385.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5464.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5935.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6014.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4977.97, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4973.04, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4987.36, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4963.67, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5011.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4939.50, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5129.62, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4826.01, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 19875,
        "volume_total": 4305,
        "total_trades": 19875,
        "total_volume": 19875,
        "gamma_exposure": 67248739.5127302,
        "delta_position": -8747.999809914816,
        "last_update": "2026-04-22T22:06:28.475630",
        "spot_price": 4975.5,
        "dealer_pressure": 0.10086134757945171,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5015.379337790912,
        "gamma_flip_hvl": 5006.463786114357,
        "gamma_flip_hvl_gaussian": 4974.436734803715,
        "call_wall": 5200.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5381.132075471698,
        "effective_put_wall": 4985.255854293148,
        "max_pain": 5200.0,
        "zero_gamma": 5015.379337790912,
        "range_low": 4937.888755290852,
        "range_high": 5013.111244709148,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.6112447091482,
                "upper": 5013.111244709148,
                "lower": 4937.888755290852
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.10129988803467,
                "upper": 5059.601299888035,
                "lower": 4891.398700111965
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 7.0,
                "move": 99.50999999999999,
                "upper": 5075.01,
                "lower": 4875.99
            }
        ],
        "pinning_risk": {
            "strike": null,
            "score": null
        },
        "volatility_analysis": {
            "iv_current": 0.12,
            "hv_current": 0.1257,
            "vrp": 0.954653937947494,
            "iv_rank": 0.0,
            "regime": "Justa (Neutro)",
            "rank_desc": "Baixa"
        }
    },
    "oi_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2750.0,
            30.0,
            700.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_oi": [
            40.0,
            4410.0,
            40.0,
            590.0,
            7120.0,
            2500.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            40.0,
            4410.0,
            40.0,
            590.0,
            7120.0,
            2500.0,
            2750.0,
            95.0,
            700.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            900.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "put_oi": [
            0.0,
            0.0,
            0.0,
            590.0,
            6320.0,
            2500.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            0.0,
            0.0,
            0.0,
            590.0,
            6320.0,
            2500.0,
            900.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "oi_by_expiry": [
        {
            "expiry": "2026-05-01",
            "days_to_exp": 7,
            "call_oi": 900,
            "put_oi": 9410
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 28,
            "call_oi": 1600,
            "put_oi": 0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 50,
            "call_oi": 0,
            "put_oi": 5210
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 73,
            "call_oi": 200,
            "put_oi": 0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 94,
            "call_oi": 320,
            "put_oi": 0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 116,
            "call_oi": 10,
            "put_oi": 0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 138,
            "call_oi": 950,
            "put_oi": 0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 159,
            "call_oi": 30,
            "put_oi": 0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 182,
            "call_oi": 300,
            "put_oi": 0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 203,
            "call_oi": 0,
            "put_oi": 65
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 223,
            "call_oi": 760,
            "put_oi": 0
        },
        {
            "expiry": "2027-04-01",
            "days_to_exp": 246,
            "call_oi": 40,
            "put_oi": 80
        }
    ],
    "v3_data": {
        "gamma_flip_cone": {
            "alphas": [
                0.1,
                0.2,
                0.3,
                0.4,
                0.5,
                0.6,
                0.7,
                0.7999999999999999,
                0.8999999999999999,
                0.9999999999999999,
                1.0999999999999999,
                1.2,
                1.3,
                1.4,
                1.5,
                1.5999999999999999,
                1.7,
                1.8,
                1.9,
                2.0,
                2.0999999999999996,
                2.1999999999999997,
                2.3,
                2.4,
                2.5,
                2.6,
                2.6999999999999997,
                2.8,
                2.9,
                3.0
            ],
            "flips": [
                4950.477172717761,
                4950.507714900047,
                4951.950696822106,
                4959.567636543148,
                4971.6945387538535,
                4984.116865836669,
                4994.897753775692,
                5001.625007559598,
                5004.438104627182,
                5006.463786114357,
                5007.973011681936,
                5009.128413585487,
                5010.0329168986,
                5010.754411606588,
                5011.339214148302,
                5011.819828938285,
                5012.219625218179,
                5012.555760175083,
                5012.841063725304,
                5013.085287040819,
                5013.295949439991,
                5013.478925047099,
                5013.638856892445,
                5013.779454193291,
                5013.90370906084,
                5014.014056685008,
                5014.112495253888,
                5014.200676782228,
                5014.279976648602,
                5014.351547362959
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4229.175,
                4259.637244897959,
                4290.099489795918,
                4320.561734693878,
                4351.023979591837,
                4381.486224489796,
                4411.948469387755,
                4442.410714285715,
                4472.872959183674,
                4503.335204081633,
                4533.7974489795915,
                4564.259693877551,
                4594.72193877551,
                4625.184183673469,
                4655.646428571428,
                4686.108673469388,
                4716.570918367347,
                4747.033163265306,
                4777.495408163265,
                4807.957653061225,
                4838.419897959184,
                4868.882142857143,
                4899.344387755102,
                4929.806632653062,
                4960.2688775510205,
                4990.7311224489795,
                5021.193367346938,
                5051.655612244898,
                5082.117857142857,
                5112.580102040816,
                5143.042346938775,
                5173.504591836735,
                5203.966836734694,
                5234.429081632653,
                5264.891326530612,
                5295.353571428572,
                5325.815816326531,
                5356.27806122449,
                5386.740306122449,
                5417.202551020408,
                5447.664795918367,
                5478.127040816326,
                5508.589285714285,
                5539.051530612245,
                5569.513775510204,
                5599.976020408163,
                5630.438265306122,
                5660.900510204081,
                5691.362755102041,
                5721.825
            ],
            "deltas": [
                -14630.628009656035,
                -14594.792389233235,
                -14549.685687144174,
                -14493.613636035763,
                -14424.839548663835,
                -14341.662844173,
                -14242.509576725006,
                -14126.028950275273,
                -13991.188207766188,
                -13837.357361109624,
                -13664.375136720273,
                -13472.588169010918,
                -13262.856298686847,
                -13036.516268048976,
                -12795.291035011642,
                -12541.11752181981,
                -12275.836794318753,
                -12000.64674725408,
                -11715.171335877996,
                -11415.992918227093,
                -11094.605572872282,
                -10735.080827036638,
                -10312.331543934417,
                -9792.522398304125,
                -9137.372493973166,
                -8313.1556567319,
                -7302.93693001591,
                -6117.89920611001,
                -4802.348406255304,
                -3428.6401769703675,
                -2082.5383923093236,
                -844.0719357835472,
                228.98672011031243,
                1109.5124400098423,
                1799.839648180592,
                2323.524745868869,
                2714.509344943452,
                3007.6570395484414,
                3232.7614155993156,
                3412.1816368162,
                3561.0842366981037,
                3688.980838272563,
                3801.5362995032624,
                3902.0860871052887,
                3992.6872179699426,
                4074.747307470496,
                4149.354737292421,
                4217.4297264091865,
                4279.782641296726,
                4337.131367229576
            ],
            "flip_value": 5197.466307142889
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                1700.0,
                30.0,
                500.0,
                100.0,
                135.0,
                860.0,
                40.0,
                10.0
            ],
            "bear": [
                -40.0,
                -5.0,
                -40.0,
                -75.0,
                -700.0,
                -50.0,
                -0.0,
                -20.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4229.175,
                4259.637244897959,
                4290.099489795918,
                4320.561734693878,
                4351.023979591837,
                4381.486224489796,
                4411.948469387755,
                4442.410714285715,
                4472.872959183674,
                4503.335204081633,
                4533.7974489795915,
                4564.259693877551,
                4594.72193877551,
                4625.184183673469,
                4655.646428571428,
                4686.108673469388,
                4716.570918367347,
                4747.033163265306,
                4777.495408163265,
                4807.957653061225,
                4838.419897959184,
                4868.882142857143,
                4899.344387755102,
                4929.806632653062,
                4960.2688775510205,
                4990.7311224489795,
                5021.193367346938,
                5051.655612244898,
                5082.117857142857,
                5112.580102040816,
                5143.042346938775,
                5173.504591836735,
                5203.966836734694,
                5234.429081632653,
                5264.891326530612,
                5295.353571428572,
                5325.815816326531,
                5356.27806122449,
                5386.740306122449,
                5417.202551020408,
                5447.664795918367,
                5478.127040816326,
                5508.589285714285,
                5539.051530612245,
                5569.513775510204,
                5599.976020408163,
                5630.438265306122,
                5660.900510204081,
                5691.362755102041,
                5721.825
            ],
            "pnl": [
                -16921365.34373521,
                -16193949.852338621,
                -15466553.925578685,
                -14739196.068710057,
                -14011903.447521785,
                -13284709.5974337,
                -12557648.580414109,
                -11830748.185719853,
                -11104028.57943223,
                -10377516.693616675,
                -9651290.59724958,
                -8925571.01265113,
                -8200872.992289575,
                -7478208.477754151,
                -6759284.231303297,
                -6046586.294651593,
                -5343226.490895694,
                -4652494.576711694,
                -3977209.0297309086,
                -3319113.5855392003,
                -2678615.796446614,
                -2055051.7651993416,
                -1447437.970135934,
                -855457.6838725295,
                -280327.97504420485,
                274770.50533496146,
                804880.5441258531,
                1304063.0188724753,
                1766598.3150161589,
                2188252.5894884905,
                2567234.057829126,
                2904567.8426210927,
                3203822.7080051824,
                3470339.449015933,
                3710245.061949063,
                3929544.933781543,
                4133489.337290868,
                4326274.164957175,
                4511022.786662199,
                4689940.218290442,
                4864531.165576751,
                5035806.716426522,
                5204444.239699742,
                5370894.919525957,
                5535448.9446663605,
                5698272.713760039,
                5859430.3478323,
                6018897.286014503,
                6176569.716130344,
                6332272.062051266
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4450.0,
                4800.0,
                4950.0,
                5000.0,
                5100.0,
                5150.0,
                5200.0,
                5250.0,
                5350.0,
                5500.0,
                5700.0,
                5900.0,
                6050.0,
                6100.0
            ],
            "loss": [
                8318000.0,
                3164250.0,
                1617000.0,
                1103250.0,
                134750.0,
                6500.0,
                3250.0,
                137500.0,
                415500.0,
                937500.0,
                1693500.0,
                2513500.0,
                3272500.0,
                3527500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 43.2189602632202,
                        "Call_Sim": 231.8047532455539,
                        "Call_Chg": 436.3496757760326,
                        "Put_Now": 36.31334027607454,
                        "Put_Sim": 0.3991332584076872,
                        "Put_Chg": -98.90086327676482
                    },
                    {
                        "Strike": 5015.379337790912,
                        "Call_Now": 25.515708786264213,
                        "Call_Sim": 192.77930985996227,
                        "Call_Chg": 655.5318626451032,
                        "Put_Now": 58.434077066943246,
                        "Put_Sim": 1.1976781406409316,
                        "Put_Chg": -97.95037724431097
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.049841373678419,
                        "Call_Sim": 115.01442361686532,
                        "Call_Chg": 1801.114698928616,
                        "Put_Now": 123.4714247453121,
                        "Put_Sim": 7.936006988497638,
                        "Put_Chg": -93.5725962465668
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.5930092223208163,
                        "Call_Sim": 45.16904700406894,
                        "Call_Chg": 7516.921508791076,
                        "Put_Now": 217.87580011104365,
                        "Put_Sim": 37.951837892792355,
                        "Put_Chg": -82.58097600860232
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 43.2189602632202,
                        "Call_Sim": 135.9388661993744,
                        "Call_Chg": 214.5352534430585,
                        "Put_Now": 36.31334027607454,
                        "Put_Sim": 4.53324621222896,
                        "Put_Chg": -87.51630619005397
                    },
                    {
                        "Strike": 5015.379337790912,
                        "Call_Now": 25.515708786264213,
                        "Call_Sim": 101.6214198492994,
                        "Call_Chg": 298.2700253422116,
                        "Put_Now": 58.434077066943246,
                        "Put_Sim": 10.039788129978092,
                        "Put_Chg": -82.81860750795069
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.049841373678419,
                        "Call_Sim": 44.30041148475948,
                        "Call_Chg": 632.2574055825862,
                        "Put_Now": 123.4714247453121,
                        "Put_Sim": 37.221994856392485,
                        "Put_Chg": -69.8537577150573
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.5930092223208163,
                        "Call_Sim": 10.308796182120545,
                        "Call_Chg": 1638.3871606204998,
                        "Put_Now": 217.87580011104365,
                        "Put_Sim": 103.09158707084316,
                        "Put_Chg": -52.683323701714
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5015.379337790912,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 43.2189602632202,
                        "Call_Sim": 67.51671299823056,
                        "Call_Chg": 56.220123267722414,
                        "Put_Now": 36.31334027607454,
                        "Put_Sim": 20.731755220171863,
                        "Put_Chg": -42.90870775710155
                    },
                    {
                        "Strike": 5015.379337790912,
                        "Call_Now": 25.515708786264213,
                        "Call_Sim": 43.565366356137474,
                        "Call_Chg": 70.73939321485702,
                        "Put_Now": 58.434077066943246,
                        "Put_Sim": 36.60439684590392,
                        "Put_Chg": -37.357790722065836
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.049841373678419,
                        "Call_Sim": 12.870032766785698,
                        "Call_Chg": 112.73339203207031,
                        "Put_Now": 123.4714247453121,
                        "Put_Sim": 90.41227834750589,
                        "Put_Chg": -26.77473469347116
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.5930092223208163,
                        "Call_Sim": 1.7002941531103488,
                        "Call_Chg": 186.72305406247028,
                        "Put_Now": 217.87580011104365,
                        "Put_Sim": 179.1037472509206,
                        "Put_Chg": -17.795483867580653
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5025.255,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 43.2189602632202,
                        "Call_Sim": 74.44060522228074,
                        "Call_Chg": 72.24062024840171,
                        "Put_Now": 36.31334027607454,
                        "Put_Sim": 17.779985235134973,
                        "Put_Chg": -51.03731824183214
                    },
                    {
                        "Strike": 5015.379337790912,
                        "Call_Now": 25.515708786264213,
                        "Call_Sim": 49.008415247914854,
                        "Call_Chg": 92.07154172529745,
                        "Put_Now": 58.434077066943246,
                        "Put_Sim": 32.17178352859355,
                        "Put_Chg": -44.9434556966872
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.049841373678419,
                        "Call_Sim": 15.23605778741171,
                        "Call_Chg": 151.8422690171775,
                        "Put_Now": 123.4714247453121,
                        "Put_Sim": 82.90264115904347,
                        "Put_Chg": -32.856819843094044
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.5930092223208163,
                        "Call_Sim": 2.1610693129447327,
                        "Call_Chg": 264.4242334861363,
                        "Put_Now": 217.87580011104365,
                        "Put_Sim": 169.688860201667,
                        "Put_Chg": -22.116701297169048
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4925.745,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 43.2189602632202,
                        "Call_Sim": 21.691944021894187,
                        "Call_Chg": -49.809195108392586,
                        "Put_Now": 36.31334027607454,
                        "Put_Sim": 64.54132403474887,
                        "Put_Chg": 77.73447318277316
                    },
                    {
                        "Strike": 5015.379337790912,
                        "Call_Now": 25.515708786264213,
                        "Call_Sim": 11.277320783507093,
                        "Call_Chg": -55.80243967364146,
                        "Put_Now": 58.434077066943246,
                        "Put_Sim": 93.95068906418601,
                        "Put_Chg": 60.780650230094714
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.049841373678419,
                        "Call_Sim": 1.975787265817189,
                        "Call_Chg": -67.34150296215333,
                        "Put_Now": 123.4714247453121,
                        "Put_Sim": 169.15237063744917,
                        "Put_Chg": 36.99718051068447
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.5930092223208163,
                        "Call_Sim": 0.1303903028169735,
                        "Call_Chg": -78.01209527456004,
                        "Put_Now": 217.87580011104365,
                        "Put_Sim": 267.1681811915396,
                        "Put_Chg": 22.624073465420828
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0011428538190202916,
            -0.12014215565625573,
            -0.0009248852030245315,
            0.045103630793490536,
            0.5,
            0.08027014796304822,
            0.15277882325297396,
            0.0018202417605391286,
            0.03131599923319768,
            0.018539308361557302,
            0.012962548193580267,
            0.04521334651384454,
            0.002105941190083174,
            0.00016102761772761464
        ]
    },
    "delta_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "delta_values": [
            -3.156558115702235,
            -830.4510638354438,
            -12.140900990499093,
            -333.93032717856306,
            -6016.6801738480735,
            -2374.8050192059354,
            590.7810794138582,
            -21.5329822922686,
            34.24671536829413,
            84.52294024093734,
            18.861994673745027,
            111.36385534402697,
            4.774096194573105,
            0.1465343162361081
        ],
        "delta_cumulative": [
            -3.156558115702235,
            -833.607621951146,
            -845.7485229416451,
            -1179.6788501202082,
            -7196.359023968282,
            -9571.164043174216,
            -8980.382963760358,
            -9001.915946052626,
            -8967.669230684332,
            -8883.146290443396,
            -8864.28429576965,
            -8752.920440425623,
            -8748.14634423105,
            -8747.999809914814
        ]
    },
    "gamma_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "gamma_values": [
            24819.967807020468,
            11132910.983767612,
            58959.80015538551,
            5803727.2862807475,
            35196336.4030383,
            6453993.552798841,
            5919498.882055944,
            181799.08614986498,
            886899.4086409936,
            496617.2510089206,
            256462.72317578757,
            800819.0343753431,
            33615.6839798189,
            2279.44949561095
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            5919498.882055944,
            61717.55247995474,
            886899.4086409936,
            496617.2510089206,
            256462.72317578757,
            800819.0343753431,
            33615.6839798189,
            2279.44949561095
        ],
        "gamma_put": [
            24819.967807020468,
            11132910.983767612,
            58959.80015538551,
            5803727.2862807475,
            35196336.4030383,
            6453993.552798841,
            0.0,
            120081.53366991023,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            24819.967807020468,
            11157730.951574633,
            11216690.75173002,
            17020418.03801077,
            52216754.44104907,
            58670747.99384791,
            64590246.87590385,
            64772045.962053716,
            65658945.37069471,
            66155562.62170363,
            66412025.34487942,
            67212844.37925476,
            67246460.06323458,
            67248739.5127302
        ]
    },
    "volume_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2750.0,
            30.0,
            700.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_volume": [
            40.0,
            4410.0,
            40.0,
            590.0,
            7120.0,
            2500.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            40.0,
            4410.0,
            40.0,
            590.0,
            7120.0,
            2500.0,
            2750.0,
            95.0,
            700.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "iv_values": [
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0,
            12.0
        ],
        "skew": [
            0.0,
            1.0842021724855044e-19,
            -2.168404344971009e-19,
            -1.6263032587282567e-19,
            2.168404344971009e-19,
            0.0,
            0.0,
            -1.6263032587282567e-19,
            5.421010862427522e-20,
            0.0,
            0.0,
            0.0,
            -2.168404344971009e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4450.0,
            4800.0,
            4950.0,
            5000.0,
            5100.0,
            5150.0,
            5200.0,
            5250.0,
            5350.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "charm": [
            -1.4183354032340834,
            -1378.461233806051,
            3.0621634270864195,
            1371.819415124975,
            31157.799999274583,
            8335.743120334915,
            3122.0911206178753,
            23.657323988773715,
            629.7619618918138,
            97.32224097495848,
            108.13004897155989,
            214.35368325636665,
            8.65605837408404,
            1.1393726504519865
        ],
        "vanna": [
            -63.19647708846521,
            -8252.781964338878,
            -46.394051685699544,
            362.4306804038211,
            13427.64355618728,
            3556.712302312012,
            3283.557181017364,
            66.26930334472026,
            995.8127099698637,
            575.7194868709248,
            509.68931935339265,
            1782.0050707481164,
            85.9017919540783,
            6.961214677815294
        ],
        "vex": [
            28932.352815868813,
            2637704.695225511,
            68728.76521484536,
            192509.63408593237,
            1757043.3462070534,
            214078.96614633748,
            1793213.658175873,
            162010.06158393325,
            117673.81353848701,
            428292.6496151132,
            114235.09165823458,
            820508.0164053855,
            39185.4186360294,
            1252.9547733217375
        ],
        "theta": [
            -3.7652048990827156,
            -2320.7476467311144,
            -3.8121387670809153,
            -1314.6704836831932,
            -3888.8155646527593,
            593.4880654771428,
            -2236.71774461906,
            -26.363873209988917,
            -285.41177334111626,
            -219.62078459617496,
            -90.96675670039774,
            -331.6177750141664,
            -14.009144802617248,
            -0.788681369894147
        ],
        "charm_cum": [
            -1.4183354032340834,
            -1379.8795692092851,
            -1376.8174057821986,
            -4.997990657223681,
            31152.80200861736,
            39488.545128952275,
            42610.63624957015,
            42634.29357355892,
            43264.05553545073,
            43361.37777642569,
            43469.507825397246,
            43683.861508653616,
            43692.5175670277,
            43693.656939678156
        ],
        "vanna_cum": [
            -63.19647708846521,
            -8315.978441427344,
            -8362.372493113044,
            -7999.941812709222,
            5427.701743478058,
            8984.41404579007,
            12267.971226807435,
            12334.240530152154,
            13330.053240122017,
            13905.772726992942,
            14415.462046346334,
            16197.467117094451,
            16283.36890904853,
            16290.330123726344
        ],
        "theta_cum": [
            -3.7652048990827156,
            -2324.512851630197,
            -2328.324990397278,
            -3642.995474080471,
            -7531.811038733231,
            -6938.3229732560885,
            -9175.040717875148,
            -9201.404591085136,
            -9486.816364426253,
            -9706.437149022428,
            -9797.403905722826,
            -10129.021680736992,
            -10143.03082553961,
            -10143.819506909504
        ],
        "r_gamma": [
            24819.967807020468,
            11132910.983767612,
            58959.80015538551,
            -5803727.2862807475,
            -35196336.4030383,
            -6453993.552798841,
            -5919498.882055944,
            -181799.08614986498,
            -886899.4086409936,
            -496617.2510089206,
            -256462.72317578757,
            -800819.0343753431,
            -33615.6839798189,
            -2279.44949561095
        ],
        "r_gamma_cum": [
            24819.967807020468,
            11157730.951574633,
            11216690.75173002,
            5412963.465449272,
            -29783372.937589027,
            -36237366.49038787,
            -42156865.37244382,
            -42338664.45859368,
            -43225563.86723468,
            -43722181.1182436,
            -43978643.841419384,
            -44779462.87579472,
            -44813078.55977454,
            -44815358.009270154
        ]
    },
    "ewz_meta": {
        "expiration": "",
        "atm_iv_pct": 0.0,
        "hv_pct": 0.0,
        "iv_rank_pct": 0.0
    },
    "detailed_data": [
        {
            "strike": 4450.0,
            "delta": -3.156558115702235,
            "gamma": 24819.967807020468,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 4800.0,
            "delta": -830.4510638354438,
            "gamma": 11132910.983767612,
            "volume": 0,
            "oi": 4410,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -12.140900990499093,
            "gamma": 58959.80015538551,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 5000.0,
            "delta": -333.93032717856306,
            "gamma": 5803727.2862807475,
            "volume": 0,
            "oi": 590,
            "iv": 12.0
        },
        {
            "strike": 5100.0,
            "delta": -6016.6801738480735,
            "gamma": 35196336.4030383,
            "volume": 0,
            "oi": 7120,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": -2374.8050192059354,
            "gamma": 6453993.552798841,
            "volume": 0,
            "oi": 2500,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 590.7810794138582,
            "gamma": 5919498.882055944,
            "volume": 0,
            "oi": 2750,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -21.5329822922686,
            "gamma": 181799.08614986498,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5350.0,
            "delta": 34.24671536829413,
            "gamma": 886899.4086409936,
            "volume": 0,
            "oi": 700,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 84.52294024093734,
            "gamma": 496617.2510089206,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 18.861994673745027,
            "gamma": 256462.72317578757,
            "volume": 0,
            "oi": 320,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 111.36385534402697,
            "gamma": 800819.0343753431,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6050.0,
            "delta": 4.774096194573105,
            "gamma": 33615.6839798189,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 6100.0,
            "delta": 0.1465343162361081,
            "gamma": 2279.44949561095,
            "volume": 0,
            "oi": 10,
            "iv": 12.0
        }
    ],
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-04-22",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 7,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.50-3.75": 100.0,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 56,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.6,
                    "3.50-3.75": 98.4,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 98,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 5.9,
                    "3.50-3.75": 94.1,
                    "3.75-4.00": 1.9
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 147,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.5,
                    "3.25-3.50": 12.4,
                    "3.50-3.75": 87.1,
                    "3.75-4.00": 1.8
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 189,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.0,
                    "3.25-3.50": 15.8,
                    "3.50-3.75": 83.1,
                    "3.75-4.00": 1.6
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 231,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.5,
                    "3.25-3.50": 22.3,
                    "3.50-3.75": 75.1,
                    "3.75-4.00": 1.4
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 280,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 2.9,
                    "3.25-3.50": 23.6,
                    "3.50-3.75": 73.3,
                    "3.75-4.00": 1.3
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 329,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 3.8,
                    "3.25-3.50": 25.5,
                    "3.50-3.75": 70.4,
                    "3.75-4.00": 1.3
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 371,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 3.8,
                    "3.25-3.50": 25.5,
                    "3.50-3.75": 70.4,
                    "3.75-4.00": 1.2
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 413,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.7,
                    "3.00-3.25": 6.3,
                    "3.25-3.50": 30.8,
                    "3.50-3.75": 62.2,
                    "3.75-4.00": 1.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 462,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 1.7,
                    "3.00-3.25": 10.8,
                    "3.25-3.50": 36.5,
                    "3.50-3.75": 50.8,
                    "3.75-4.00": 0.9
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 511,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.5,
                    "2.75-3.00": 3.6,
                    "3.00-3.25": 16.1,
                    "3.25-3.50": 39.4,
                    "3.50-3.75": 40.4,
                    "3.75-4.00": 0.7
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 553,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 4.8,
                    "3.00-3.25": 18.3,
                    "3.25-3.50": 39.5,
                    "3.50-3.75": 36.5,
                    "3.75-4.00": 0.6
                }
            },
            {
                "date": "2027-12-08",
                "days_remaining": 595,
                "current_rate": "3.00-3.25",
                "probs": {
                    "0.75-1.00": 0.0,
                    "1.50-1.75": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.3,
                    "2.25-2.50": 2.1,
                    "2.50-2.75": 9.1,
                    "2.75-3.00": 25.1,
                    "3.00-3.25": 38.6,
                    "3.25-3.50": 24.8,
                    "3.50-3.75": 0.4
                }
            }
        ]
    }
};