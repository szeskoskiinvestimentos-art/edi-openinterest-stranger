window.marketData = {
    "last_updated": "2026-04-23 08:01:40",
    "spot_price": 4975.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 23/04/2026 08:01\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5013.75)\n  // 2 = Spline (5016.19)\n  // 3 = HVL (5004.94)\n  // 4 = HVL Log (4950.47)\n  // 5 = Sigma Kernel (4950.47)\n  // 6 = PVOP (5013.75)\n  // 7 = HVL Gaussian (4972.41)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5013.75;\n\n  if (ModeloFlip = 1) then GammaVal := 5013.75;\n  if (ModeloFlip = 2) then GammaVal := 5016.19;\n  if (ModeloFlip = 3) then GammaVal := 5004.94;\n  if (ModeloFlip = 4) then GammaVal := 4950.47;\n  if (ModeloFlip = 5) then GammaVal := 4950.47;\n  if (ModeloFlip = 6) then GammaVal := 5013.75;\n  if (ModeloFlip = 7) then GammaVal := 4972.41;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4989.95, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5150.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5239.13, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6050.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5180.29 > 0) then\n      HorizontalLineCustom(5180.29, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4875.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5050.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4583.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4666.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4857.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4892.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4969.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4980.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5119.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5130.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5407.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5442.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5957.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5992.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6069.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6080.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4532.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4717.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4835.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4914.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4988.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5023.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5076.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5385.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5464.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5935.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6014.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4977.97, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4973.04, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4987.36, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4963.67, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5011.76, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4939.50, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5129.62, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4826.01, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 21630,
        "volume_total": 4555,
        "total_trades": 21630,
        "total_volume": 21630,
        "gamma_exposure": 70582006.74494028,
        "delta_position": -9149.484419531986,
        "last_update": "2026-04-23T08:01:40.799495",
        "spot_price": 4975.5,
        "dealer_pressure": 0.09749958693532132,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5013.7512577548605,
        "gamma_flip_hvl": 5004.936006432258,
        "gamma_flip_hvl_gaussian": 4972.410294204978,
        "call_wall": 5200.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5239.130434782609,
        "effective_put_wall": 4989.945990859992,
        "max_pain": 5150.0,
        "zero_gamma": 5013.7512577548605,
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
                "days": 6.0,
                "move": 92.12835812836659,
                "upper": 5067.628358128367,
                "lower": 4883.371641871633
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
            150.0,
            0.0,
            3400.0,
            30.0,
            1200.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_oi": [
            40.0,
            4415.0,
            40.0,
            590.0,
            7620.0,
            2450.0,
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
            4415.0,
            40.0,
            590.0,
            7770.0,
            2450.0,
            3400.0,
            95.0,
            1200.0,
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
            6820.0,
            2450.0,
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
            6820.0,
            2450.0,
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
            "days_to_exp": 6,
            "call_oi": 900,
            "put_oi": 9860
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 27,
            "call_oi": 2900,
            "put_oi": 0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 49,
            "call_oi": 0,
            "put_oi": 5215
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 72,
            "call_oi": 200,
            "put_oi": 0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 93,
            "call_oi": 320,
            "put_oi": 0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 115,
            "call_oi": 10,
            "put_oi": 0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 137,
            "call_oi": 950,
            "put_oi": 0
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 158,
            "call_oi": 30,
            "put_oi": 0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 181,
            "call_oi": 300,
            "put_oi": 0
        },
        {
            "expiry": "2027-02-01",
            "days_to_exp": 202,
            "call_oi": 0,
            "put_oi": 65
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 222,
            "call_oi": 760,
            "put_oi": 0
        },
        {
            "expiry": "2027-04-01",
            "days_to_exp": 245,
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
                4950.444905860768,
                4950.47341557804,
                4951.825001032722,
                4958.959586646664,
                4970.318542062895,
                4981.954215693253,
                4992.052395054858,
                5000.1278425232495,
                5002.92519377244,
                5004.936006432258,
                5006.432251441403,
                5007.576624810984,
                5008.4718354700735,
                5009.185502196552,
                5009.763688203974,
                5010.2386822002245,
                5010.633676233875,
                5010.965684038614,
                5011.2474199121925,
                5011.4885417877895,
                5011.696493549182,
                5011.877088007443,
                5012.0349180913045,
                5012.17365184673,
                5012.296247358507,
                5012.405111535848,
                5012.50221893182,
                5012.589201703192,
                5012.667418458365,
                5012.738007475139
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
                -15090.837047320381,
                -15056.23354470443,
                -15012.503693222336,
                -14957.922038655588,
                -14890.705453256001,
                -14809.09200104548,
                -14711.432961217537,
                -14596.29171378445,
                -14462.541316296356,
                -14309.45144186731,
                -14136.75516400108,
                -13944.686970427241,
                -13733.985154163578,
                -13505.853425684796,
                -13261.875724838275,
                -13003.869654170829,
                -12733.639686348775,
                -12452.54316432971,
                -12160.709762452158,
                -11855.681265941319,
                -11530.236014469676,
                -11169.385969939613,
                -10747.193777215443,
                -10225.195608172136,
                -9555.287409618311,
                -8689.636729282985,
                -7597.294514096465,
                -6282.27133355437,
                -4794.106569054761,
                -3223.2519794271802,
                -1680.6170451188036,
                -269.2350584933387,
                939.8189627689092,
                1918.1592191374643,
                2675.952417990626,
                3248.1798446200655,
                3678.935999740274,
                4009.4899040641044,
                4272.17707154134,
                4489.247028166147,
                4674.560614925633,
                4836.197241069306,
                4978.798310464563,
                5105.212446896218,
                5217.461041844894,
                5317.217381351793,
                5406.000058123659,
                5485.225310134661,
                5556.202959848936,
                5620.118018146752
            ],
            "flip_value": 5180.287997824152
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                250.0,
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
                -17682171.27755401,
                -16924416.93587132,
                -16166677.007960934,
                -15408968.509362958,
                -14651319.109326828,
                -13893765.839138279,
                -13136348.31597862,
                -12379098.18063009,
                -11622031.125187375,
                -10865151.540355442,
                -10108482.923581153,
                -9352142.67824434,
                -8596485.661064181,
                -7842331.112154404,
                -7091239.3513517715,
                -6345717.4456322985,
                -5609162.153690962,
                -4885389.272484116,
                -4177798.5758970566,
                -3488491.7212805916,
                -2817797.345165235,
                -2164523.735252007,
                -1526919.7441528651,
                -903997.8727119265,
                -296736.3898114674,
                291259.2238600636,
                853883.4870384079,
                1383480.1112130429,
                1872403.074683867,
                2314750.0287296474,
                2707722.807808961,
                3052184.081115844,
                3352286.962730022,
                3614401.4272465883,
                3845773.896990097,
                4053355.488138905,
                4243064.830625956,
                4419527.912794159,
                4586168.967682808,
                4745465.674563355,
                4899216.096355291,
                5048741.189098333,
                5195012.982229943,
                5338730.478025877,
                5480368.320838145,
                5620214.3944831975,
                5758403.532671509,
                5894948.276461887,
                6029763.685363945,
                6162682.83916519
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
                8609750.0,
                3296750.0,
                1682000.0,
                1145750.0,
                132250.0,
                14000.0,
                18250.0,
                192500.0,
                550500.0,
                1267500.0,
                2283500.0,
                3363500.0,
                4317500.0,
                4637500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 39.767241545783236,
                        "Call_Sim": 230.64123100620327,
                        "Call_Chg": 479.977946774786,
                        "Put_Now": 33.84755158417738,
                        "Put_Sim": 0.22154104459755786,
                        "Put_Chg": -99.34547394352411
                    },
                    {
                        "Strike": 5013.7512577548605,
                        "Call_Now": 22.956525585981126,
                        "Call_Sim": 192.94573880232474,
                        "Call_Chg": 740.4831910633333,
                        "Put_Now": 55.242583262353946,
                        "Put_Sim": 0.7317964786970492,
                        "Put_Chg": -98.67530365982043
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 4.517604377361522,
                        "Call_Sim": 112.44075919804891,
                        "Call_Chg": 2388.946570034077,
                        "Put_Now": 122.94978831783283,
                        "Put_Sim": 6.372943138519986,
                        "Put_Chg": -94.81662943408611
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.32579842209838006,
                        "Call_Sim": 41.56158296413878,
                        "Call_Chg": 12656.839857127543,
                        "Put_Now": 218.63900557708894,
                        "Put_Sim": 35.37479011912819,
                        "Put_Chg": -83.82045782464212
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 39.767241545783236,
                        "Call_Sim": 133.84498018388513,
                        "Call_Chg": 236.57094377489588,
                        "Put_Now": 33.84755158417738,
                        "Put_Sim": 3.425290222280239,
                        "Put_Chg": -89.88024225692753
                    },
                    {
                        "Strike": 5013.7512577548605,
                        "Call_Now": 22.956525585981126,
                        "Call_Sim": 100.22877420402892,
                        "Call_Chg": 336.60254174192494,
                        "Put_Now": 55.242583262353946,
                        "Put_Sim": 8.014831880401175,
                        "Put_Chg": -85.49156935268987
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 4.517604377361522,
                        "Call_Sim": 40.7623217532896,
                        "Call_Chg": 802.2995009823452,
                        "Put_Now": 122.94978831783283,
                        "Put_Sim": 34.694505693760675,
                        "Put_Chg": -71.78156532968302
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.32579842209838006,
                        "Call_Sim": 8.178228414655337,
                        "Call_Chg": 2410.2111796556796,
                        "Put_Now": 218.63900557708894,
                        "Put_Sim": 101.99143556964555,
                        "Put_Chg": -53.35167423559981
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5013.7512577548605,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 39.767241545783236,
                        "Call_Sim": 63.09043017397698,
                        "Call_Chg": 58.64924928560163,
                        "Put_Now": 33.84755158417738,
                        "Put_Sim": 18.919482457510412,
                        "Put_Chg": -44.10383743574927
                    },
                    {
                        "Strike": 5013.7512577548605,
                        "Call_Now": 22.956525585981126,
                        "Call_Sim": 40.07296901167956,
                        "Call_Chg": 74.56025242840295,
                        "Put_Now": 55.242583262353946,
                        "Put_Sim": 34.10776893319144,
                        "Put_Chg": -38.258193373743275
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 4.517604377361522,
                        "Call_Sim": 10.16446513400615,
                        "Call_Chg": 124.99679664164486,
                        "Put_Now": 122.94978831783283,
                        "Put_Sim": 90.34539131961674,
                        "Put_Chg": -26.51846533800587
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.32579842209838006,
                        "Call_Sim": 1.0295404164191382,
                        "Call_Chg": 216.00534152011699,
                        "Put_Now": 218.63900557708894,
                        "Put_Sim": 181.09148981654835,
                        "Put_Chg": -17.173292414789127
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5025.255,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 39.767241545783236,
                        "Call_Sim": 71.23968692850758,
                        "Call_Chg": 79.14163557583129,
                        "Put_Now": 33.84755158417738,
                        "Put_Sim": 15.564996966901617,
                        "Put_Chg": -54.01440801946295
                    },
                    {
                        "Strike": 5013.7512577548605,
                        "Call_Now": 22.956525585981126,
                        "Call_Sim": 46.44422556136033,
                        "Call_Chg": 102.31382744487453,
                        "Put_Now": 55.242583262353946,
                        "Put_Sim": 28.975283237732583,
                        "Put_Chg": -47.549007438473076
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 4.517604377361522,
                        "Call_Sim": 12.651290867700027,
                        "Call_Chg": 180.0442405071542,
                        "Put_Now": 122.94978831783283,
                        "Put_Sim": 81.328474808171,
                        "Put_Chg": -33.85228561928725
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.32579842209838006,
                        "Call_Sim": 1.4136062809102725,
                        "Call_Chg": 333.8898487615792,
                        "Put_Now": 218.63900557708894,
                        "Put_Sim": 169.9718134359,
                        "Put_Chg": -22.259153627566967
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4925.745,
                "options": [
                    {
                        "Strike": 4975.5,
                        "Call_Now": 39.767241545783236,
                        "Call_Sim": 18.73570412082745,
                        "Call_Chg": -52.886588577542135,
                        "Put_Now": 33.84755158417738,
                        "Put_Sim": 62.571014159222614,
                        "Put_Chg": 84.8612712905134
                    },
                    {
                        "Strike": 5013.7512577548605,
                        "Call_Now": 22.956525585981126,
                        "Call_Sim": 9.370333618998757,
                        "Call_Chg": -59.182265696508786,
                        "Put_Now": 55.242583262353946,
                        "Put_Sim": 91.41139129537078,
                        "Put_Chg": 65.4726949701947
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 4.517604377361522,
                        "Call_Sim": 1.2805738952335446,
                        "Call_Chg": -71.65369544861616,
                        "Put_Now": 122.94978831783283,
                        "Put_Sim": 169.4677578357041,
                        "Put_Chg": 37.834932580460766
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.32579842209838006,
                        "Call_Sim": 0.05780096346775032,
                        "Call_Chg": -82.25867298697463,
                        "Put_Now": 218.63900557708894,
                        "Put_Sim": 268.12600811845823,
                        "Put_Chg": 22.63411435244609
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0010819914138717698,
            -0.1118513789751483,
            -0.0008637906926971698,
            0.047929642341900995,
            0.5,
            0.052283462002551004,
            0.18424764153775017,
            0.0017617389115021022,
            0.0483115664260271,
            0.017497133051739326,
            0.012094769622013859,
            0.04260549336925466,
            0.001988508233219671,
            0.0001490675269176361
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
            -3.150904991479968,
            -825.8200102957207,
            -12.153064994462067,
            -339.8535301870578,
            -6546.697509688369,
            -2359.641627749753,
            687.0529433700524,
            -21.62711754484741,
            54.4409599671903,
            84.13588438231724,
            18.433622794313948,
            110.51414465365762,
            4.73974474252876,
            0.14204600964443975
        ],
        "delta_cumulative": [
            -3.150904991479968,
            -828.9709152872007,
            -841.1239802816627,
            -1180.9775104687205,
            -7727.675020157089,
            -10087.316647906842,
            -9400.26370453679,
            -9421.890822081637,
            -9367.449862114447,
            -9283.31397773213,
            -9264.880354937817,
            -9154.366210284159,
            -9149.62646554163,
            -9149.484419531986
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
            24836.816837833518,
            11212010.213457426,
            59106.417385625944,
            6240122.4039122285,
            36766317.19001544,
            5335980.723113059,
            7720640.377785487,
            182236.87391310238,
            1457397.782715477,
            496884.32485409704,
            253226.6929995538,
            797505.2192441251,
            33512.87070531865,
            2228.8380015091475
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            681066.578715171,
            0.0,
            7720640.377785487,
            61878.28430088768,
            1457397.782715477,
            496884.32485409704,
            253226.6929995538,
            797505.2192441251,
            33512.87070531865,
            2228.8380015091475
        ],
        "gamma_put": [
            24836.816837833518,
            11212010.213457426,
            59106.417385625944,
            6240122.4039122285,
            36085250.61130027,
            5335980.723113059,
            0.0,
            120358.58961221468,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            24836.816837833518,
            11236847.03029526,
            11295953.447680887,
            17536075.851593114,
            54302393.04160856,
            59638373.76472162,
            67359014.1425071,
            67541251.01642022,
            68998648.79913568,
            69495533.12398978,
            69748759.81698933,
            70546265.03623345,
            70579777.90693878,
            70582006.74494028
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
            150.0,
            0.0,
            3400.0,
            30.0,
            1200.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_volume": [
            40.0,
            4415.0,
            40.0,
            590.0,
            7620.0,
            2450.0,
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
            4415.0,
            40.0,
            590.0,
            7770.0,
            2450.0,
            3400.0,
            95.0,
            1200.0,
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
            -1.430890010052872,
            -1429.687995180753,
            3.068508375621395,
            1667.202791415575,
            37060.113675431414,
            7959.354103881559,
            3878.1259848139284,
            23.787574154359504,
            1070.04538622699,
            97.75553541212297,
            107.75781216608634,
            213.8962076536211,
            8.656981971443631,
            1.122653813316468
        ],
        "vanna": [
            -63.16862364154541,
            -8279.146227905248,
            -46.34130782171519,
            407.45569066136966,
            14088.84728591018,
            2953.9402405583646,
            4471.908013461465,
            66.94993413308399,
            1640.1920162990073,
            577.42382594833,
            503.9334373937354,
            1776.2976455400687,
            85.729785404135,
            6.8141870684781605
        ],
        "vex": [
            28834.30250788282,
            2603316.6514626797,
            68619.59526384244,
            177415.59440380163,
            1707628.6342788695,
            151709.5547877087,
            2025133.1416322528,
            161534.1281976367,
            186461.55431745053,
            426168.45757561165,
            111593.74783313618,
            814260.5521480162,
            38906.767245339695,
            1214.5734283795312
        ],
        "theta": [
            -3.776324264359343,
            -2348.243947473486,
            -3.8425751990285,
            -1433.168630009158,
            -3799.296481310793,
            894.8505119463149,
            -2842.089417119751,
            -26.40064655287717,
            -467.2470115435387,
            -219.3581646008981,
            -89.64173505463745,
            -329.90240062737297,
            -13.948775292455782,
            -0.7700155630140311
        ],
        "charm_cum": [
            -1.430890010052872,
            -1431.118885190806,
            -1428.0503768151846,
            239.15241460039033,
            37299.2660900318,
            45258.62019391336,
            49136.74617872729,
            49160.53375288165,
            50230.579139108646,
            50328.33467452077,
            50436.09248668685,
            50649.98869434047,
            50658.64567631191,
            50659.76833012523
        ],
        "vanna_cum": [
            -63.16862364154541,
            -8342.314851546795,
            -8388.65615936851,
            -7981.200468707139,
            6107.646817203041,
            9061.587057761406,
            13533.495071222871,
            13600.445005355956,
            15240.637021654962,
            15818.060847603292,
            16321.994284997028,
            18098.291930537096,
            18184.02171594123,
            18190.83590300971
        ],
        "theta_cum": [
            -3.776324264359343,
            -2352.020271737845,
            -2355.8628469368737,
            -3789.031476946032,
            -7588.327958256825,
            -6693.47744631051,
            -9535.56686343026,
            -9561.967509983137,
            -10029.214521526676,
            -10248.572686127574,
            -10338.214421182212,
            -10668.116821809585,
            -10682.06559710204,
            -10682.835612665054
        ],
        "r_gamma": [
            24836.816837833518,
            11212010.213457426,
            59106.417385625944,
            -6240122.4039122285,
            -36766317.19001544,
            -5335980.723113059,
            -7720640.377785487,
            -182236.87391310238,
            -1457397.782715477,
            -496884.32485409704,
            -253226.6929995538,
            -797505.2192441251,
            -33512.87070531865,
            -2228.8380015091475
        ],
        "r_gamma_cum": [
            24836.816837833518,
            11236847.03029526,
            11295953.447680887,
            5055831.043768658,
            -31710486.146246783,
            -37046466.86935984,
            -44767107.24714533,
            -44949344.121058434,
            -46406741.90377391,
            -46903626.22862801,
            -47156852.921627566,
            -47954358.14087169,
            -47987871.01157701,
            -47990099.84957852
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
            "delta": -3.150904991479968,
            "gamma": 24836.816837833518,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 4800.0,
            "delta": -825.8200102957207,
            "gamma": 11212010.213457426,
            "volume": 0,
            "oi": 4415,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -12.153064994462067,
            "gamma": 59106.417385625944,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 5000.0,
            "delta": -339.8535301870578,
            "gamma": 6240122.4039122285,
            "volume": 0,
            "oi": 590,
            "iv": 12.0
        },
        {
            "strike": 5100.0,
            "delta": -6546.697509688369,
            "gamma": 36766317.19001544,
            "volume": 0,
            "oi": 7770,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": -2359.641627749753,
            "gamma": 5335980.723113059,
            "volume": 0,
            "oi": 2450,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 687.0529433700524,
            "gamma": 7720640.377785487,
            "volume": 0,
            "oi": 3400,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -21.62711754484741,
            "gamma": 182236.87391310238,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5350.0,
            "delta": 54.4409599671903,
            "gamma": 1457397.782715477,
            "volume": 0,
            "oi": 1200,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 84.13588438231724,
            "gamma": 496884.32485409704,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 18.433622794313948,
            "gamma": 253226.6929995538,
            "volume": 0,
            "oi": 320,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 110.51414465365762,
            "gamma": 797505.2192441251,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6050.0,
            "delta": 4.73974474252876,
            "gamma": 33512.87070531865,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 6100.0,
            "delta": 0.14204600964443975,
            "gamma": 2228.8380015091475,
            "volume": 0,
            "oi": 10,
            "iv": 12.0
        }
    ],
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-04-23",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 6,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.50-3.75": 97.9,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 55,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 3.7,
                    "3.50-3.75": 94.2,
                    "3.75-4.00": 2.1
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 97,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.1,
                    "3.25-3.50": 5.7,
                    "3.50-3.75": 92.2,
                    "3.75-4.00": 2.0
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 146,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.5,
                    "3.25-3.50": 12.4,
                    "3.50-3.75": 85.2,
                    "3.75-4.00": 1.9
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 188,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.8,
                    "3.25-3.50": 14.0,
                    "3.50-3.75": 83.3,
                    "3.75-4.00": 1.8
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 230,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 1.8,
                    "3.25-3.50": 19.3,
                    "3.50-3.75": 77.1,
                    "3.75-4.00": 1.7
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 279,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.2,
                    "3.25-3.50": 20.7,
                    "3.50-3.75": 75.3,
                    "3.75-4.00": 1.6
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 328,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.2,
                    "3.25-3.50": 20.7,
                    "3.50-3.75": 75.3,
                    "3.75-4.00": 1.6
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 370,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.2,
                    "3.25-3.50": 20.7,
                    "3.50-3.75": 75.3,
                    "3.75-4.00": 1.6
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 412,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 4.1,
                    "3.25-3.50": 26.3,
                    "3.50-3.75": 67.8,
                    "3.75-4.00": 1.5
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 461,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 0.9,
                    "3.00-3.25": 7.2,
                    "3.25-3.50": 32.0,
                    "3.50-3.75": 58.7,
                    "3.75-4.00": 1.3
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 510,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 3.2,
                    "3.00-3.25": 16.2,
                    "3.25-3.50": 41.7,
                    "3.50-3.75": 37.7,
                    "3.75-4.00": 0.8
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 552,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.6,
                    "2.75-3.00": 4.4,
                    "3.00-3.25": 18.7,
                    "3.25-3.50": 41.3,
                    "3.50-3.75": 34.2,
                    "3.75-4.00": 0.7
                }
            },
            {
                "date": "2027-12-08",
                "days_remaining": 594,
                "current_rate": "3.00-3.25",
                "probs": {
                    "1.00-1.25": 0.0,
                    "1.50-1.75": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.2,
                    "2.25-2.50": 1.8,
                    "2.50-2.75": 9.0,
                    "2.75-3.00": 25.9,
                    "3.00-3.25": 39.1,
                    "3.25-3.50": 23.5,
                    "3.50-3.75": 0.5
                }
            }
        ]
    }
};