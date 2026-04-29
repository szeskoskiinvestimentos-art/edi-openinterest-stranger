window.marketData = {
    "last_updated": "2026-04-28 22:05:16",
    "spot_price": 4978.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 28/04/2026 22:05\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (4926.19)\n  // 2 = Spline (4926.08)\n  // 3 = HVL (4924.18)\n  // 4 = HVL Log (4903.93)\n  // 5 = Sigma Kernel (4903.39)\n  // 6 = PVOP (4926.19)\n  // 7 = HVL Gaussian (4800.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4926.19;\n\n  if (ModeloFlip = 1) then GammaVal := 4926.19;\n  if (ModeloFlip = 2) then GammaVal := 4926.08;\n  if (ModeloFlip = 3) then GammaVal := 4924.18;\n  if (ModeloFlip = 4) then GammaVal := 4903.93;\n  if (ModeloFlip = 5) then GammaVal := 4903.39;\n  if (ModeloFlip = 6) then GammaVal := 4926.19;\n  if (ModeloFlip = 7) then GammaVal := 4800.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4900.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4972.66, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5000.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5000.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5050.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5926.81, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5187.42 > 0) then\n      HorizontalLineCustom(5187.42, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4850.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5025.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5125.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4838.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4861.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5019.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5030.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5107.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5142.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5345.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5404.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5011.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5085.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5164.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5309.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5441.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4980.97, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4976.03, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4990.36, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4966.67, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5014.78, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4942.48, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5132.71, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4828.92, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 26300,
        "volume_total": 14055,
        "total_trades": 26300,
        "total_volume": 26300,
        "gamma_exposure": 102747457.73391446,
        "delta_position": -6677.955691829047,
        "last_update": "2026-04-28T22:05:16.652494",
        "spot_price": 4978.5,
        "dealer_pressure": 0.07127747581274517,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4926.188484798862,
        "gamma_flip_hvl": 4924.183865854196,
        "gamma_flip_hvl_gaussian": 4800.0,
        "call_wall": 5000.0,
        "put_wall": 5000.0,
        "effective_call_wall": 5926.808510638298,
        "effective_put_wall": 4972.664624808575,
        "max_pain": 5200.0,
        "zero_gamma": 4926.188484798862,
        "range_low": 4940.866077422471,
        "range_high": 5016.133922577529,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.63392257752876,
                "upper": 5016.133922577529,
                "lower": 4940.866077422471
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.15200914331838,
                "upper": 5062.6520091433185,
                "lower": 4894.3479908566815
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 3.0,
                "move": 65.18386599239328,
                "upper": 5043.683865992393,
                "lower": 4913.316134007607
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
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_oi": [
            0.0,
            0.0,
            1440.0,
            0.0,
            0.0,
            30.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ],
        "put_oi": [
            300.0,
            3570.0,
            9490.0,
            1150.0,
            2010.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            300.0,
            3570.0,
            10930.0,
            1150.0,
            2010.0,
            30.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_oi": [
            0.0,
            0.0,
            1440.0,
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
            590.0,
            1150.0,
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
            2030.0,
            1150.0,
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
            "days_to_exp": 3,
            "call_oi": 1440,
            "put_oi": 1740
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 24,
            "call_oi": 0,
            "put_oi": 3570
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 46,
            "call_oi": 0,
            "put_oi": 10910
        },
        {
            "expiry": "2026-08-03",
            "days_to_exp": 69,
            "call_oi": 200,
            "put_oi": 0
        },
        {
            "expiry": "2026-09-01",
            "days_to_exp": 90,
            "call_oi": 320,
            "put_oi": 0
        },
        {
            "expiry": "2026-10-01",
            "days_to_exp": 112,
            "call_oi": 5330,
            "put_oi": 0
        },
        {
            "expiry": "2026-11-02",
            "days_to_exp": 134,
            "call_oi": 0,
            "put_oi": 300
        },
        {
            "expiry": "2026-12-01",
            "days_to_exp": 155,
            "call_oi": 30,
            "put_oi": 0
        },
        {
            "expiry": "2027-01-01",
            "days_to_exp": 178,
            "call_oi": 300,
            "put_oi": 0
        },
        {
            "expiry": "2027-03-01",
            "days_to_exp": 219,
            "call_oi": 760,
            "put_oi": 0
        },
        {
            "expiry": "2027-04-01",
            "days_to_exp": 242,
            "call_oi": 1400,
            "put_oi": 0
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
                4900.020434342453,
                4904.276871779142,
                4911.515310248044,
                4916.335630168094,
                4919.261230566819,
                4921.10062238191,
                4922.313491730876,
                4923.148429050327,
                4923.744676162595,
                4924.183865854196,
                4924.515972396822,
                4924.772793596422,
                4924.975260394764,
                4925.137566959073,
                4925.2695942518,
                4925.3783815203415,
                4925.469047461682,
                4925.545382910087,
                4925.610241693472,
                4925.665804179425,
                4925.713758585693,
                4925.755428011738,
                4925.79186093227,
                4925.823896648872,
                4925.852213293634,
                4925.877363490178,
                4925.899801160764,
                4925.919901899465,
                4925.937978613614,
                4925.95429364641
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4231.724999999999,
                4262.205612244898,
                4292.686224489796,
                4323.166836734694,
                4353.647448979591,
                4384.128061224489,
                4414.608673469387,
                4445.089285714285,
                4475.569897959183,
                4506.050510204081,
                4536.531122448979,
                4567.011734693877,
                4597.492346938775,
                4627.972959183673,
                4658.453571428571,
                4688.934183673469,
                4719.4147959183665,
                4749.895408163265,
                4780.376020408163,
                4810.856632653061,
                4841.337244897959,
                4871.817857142856,
                4902.298469387754,
                4932.779081632652,
                4963.2596938775505,
                4993.740306122449,
                5024.220918367347,
                5054.701530612245,
                5085.182142857142,
                5115.66275510204,
                5146.143367346938,
                5176.623979591836,
                5207.1045918367345,
                5237.585204081633,
                5268.065816326531,
                5298.546428571428,
                5329.027040816326,
                5359.507653061224,
                5389.988265306122,
                5420.46887755102,
                5450.9494897959175,
                5481.430102040816,
                5511.910714285714,
                5542.391326530612,
                5572.87193877551,
                5603.352551020407,
                5633.833163265306,
                5664.313775510203,
                5694.7943877551015,
                5725.275
            ],
            "deltas": [
                -16431.50301277532,
                -16413.358522342118,
                -16390.69886455321,
                -16362.058537546793,
                -16325.496272512431,
                -16278.487270466125,
                -16217.817617301154,
                -16139.497117209148,
                -16038.71315072708,
                -15909.852999159904,
                -15746.623063412779,
                -15542.288224025528,
                -15290.041783691113,
                -14983.496311820663,
                -14617.260880454889,
                -14187.544983526486,
                -13692.705541043402,
                -13133.611012177811,
                -12513.545032377076,
                -11836.93582311058,
                -11105.599080806029,
                -10311.871987944403,
                -9432.495209140994,
                -8433.598983216883,
                -7294.644633734757,
                -6039.951350610692,
                -4748.378650117274,
                -3524.2265151376773,
                -2448.9499311785676,
                -1551.1618630150058,
                -811.9272897024928,
                -191.1833208086256,
                348.44488629606553,
                831.8705892217052,
                1272.8038795823143,
                1678.5150500978593,
                2053.542595262456,
                2401.5007552688267,
                2725.690357865252,
                3029.2214951604565,
                3314.9980739998186,
                3585.681576889774,
                3843.661987416033,
                4091.0397209154926,
                4329.617808709453,
                4560.903110159683,
                4786.115360905395,
                5006.202844829655,
                5221.863407087786,
                5433.569469105621
            ],
            "flip_value": 5187.422867775473
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                600.0,
                0.0,
                0.0,
                30.0,
                100.0,
                1335.0,
                860.0,
                300.0
            ],
            "bear": [
                -40.0,
                -300.0,
                -8265.0,
                -225.0,
                -2000.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4231.724999999999,
                4262.205612244898,
                4292.686224489796,
                4323.166836734694,
                4353.647448979591,
                4384.128061224489,
                4414.608673469387,
                4445.089285714285,
                4475.569897959183,
                4506.050510204081,
                4536.531122448979,
                4567.011734693877,
                4597.492346938775,
                4627.972959183673,
                4658.453571428571,
                4688.934183673469,
                4719.4147959183665,
                4749.895408163265,
                4780.376020408163,
                4810.856632653061,
                4841.337244897959,
                4871.817857142856,
                4902.298469387754,
                4932.779081632652,
                4963.2596938775505,
                4993.740306122449,
                5024.220918367347,
                5054.701530612245,
                5085.182142857142,
                5115.66275510204,
                5146.143367346938,
                5176.623979591836,
                5207.1045918367345,
                5237.585204081633,
                5268.065816326531,
                5298.546428571428,
                5329.027040816326,
                5359.507653061224,
                5389.988265306122,
                5420.46887755102,
                5450.9494897959175,
                5481.430102040816,
                5511.910714285714,
                5542.391326530612,
                5572.87193877551,
                5603.352551020407,
                5633.833163265306,
                5664.313775510203,
                5694.7943877551015,
                5725.275
            ],
            "pnl": [
                -18181043.907665145,
                -17416216.63011784,
                -16651389.352570541,
                -15886562.075023249,
                -15121734.797475971,
                -14356907.519928679,
                -13592080.242381677,
                -12827252.9648427,
                -12062425.687474076,
                -11297598.412829628,
                -10532771.171224108,
                -9767944.235521495,
                -9003119.478015896,
                -8238306.75889767,
                -7473546.359315535,
                -6708968.403352728,
                -5944916.972875243,
                -5182176.81181371,
                -4422373.626850281,
                -3668613.8925137212,
                -2926239.0599789214,
                -2203327.9875055263,
                -1510734.228094811,
                -861679.6996895398,
                -270284.08379264874,
                252134.29664899874,
                702186.7350788173,
                1087126.0122933192,
                1422043.579130681,
                1723248.7379575602,
                2002685.6851445276,
                2266510.3183765374,
                2517149.9505137466,
                2756163.290298378,
                2985809.1599523327,
                3208972.7355629294,
                3428339.13939996,
                3645768.8984954576,
                3862191.787170577,
                4077828.7418728517,
                4292488.938161674,
                4505830.369785562,
                4717539.185970541,
                4927356.0991296135,
                5134896.060182983,
                5339344.990679874,
                5539283.879580446,
                5732900.078860154,
                5918597.16690999,
                6095653.795072721
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4800.0,
                4900.0,
                5000.0,
                5050.0,
                5200.0,
                5250.0,
                5500.0,
                5700.0,
                5900.0,
                6000.0
            ],
            "loss": [
                3346500.0,
                1724500.0,
                459500.0,
                373500.0,
                288000.0,
                360000.0,
                727500.0,
                1081500.0,
                1779500.0,
                2224500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4926.188484798862,
                        "Call_Now": 62.34277187066118,
                        "Call_Sim": 80.52888508805063,
                        "Call_Chg": 29.171165592571164,
                        "Put_Now": 7.099874140875613,
                        "Put_Sim": 3.7859873582648333,
                        "Put_Chg": -46.675289122830634
                    },
                    {
                        "Strike": 4978.5,
                        "Call_Now": 27.504792769072537,
                        "Call_Sim": 40.09079455459414,
                        "Call_Chg": 45.75930417361222,
                        "Put_Now": 24.542281699123123,
                        "Put_Sim": 15.628283484644953,
                        "Put_Chg": -36.32098402161466
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 17.831631056134484,
                        "Call_Sim": 27.62357413786549,
                        "Call_Chg": 54.91333378817501,
                        "Put_Now": 36.35632617519741,
                        "Put_Sim": 24.64826925692796,
                        "Put_Chg": -32.20363042692907
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 4926.188484798862,
                        "Call_Now": 62.34277187066118,
                        "Call_Sim": 80.52888508805063,
                        "Call_Chg": 29.171165592571164,
                        "Put_Now": 7.099874140875613,
                        "Put_Sim": 3.7859873582648333,
                        "Put_Chg": -46.675289122830634
                    },
                    {
                        "Strike": 4978.5,
                        "Call_Now": 27.504792769072537,
                        "Call_Sim": 40.09079455459414,
                        "Call_Chg": 45.75930417361222,
                        "Put_Now": 24.542281699123123,
                        "Put_Sim": 15.628283484644953,
                        "Put_Chg": -36.32098402161466
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 17.831631056134484,
                        "Call_Sim": 27.62357413786549,
                        "Call_Chg": 54.91333378817501,
                        "Put_Now": 36.35632617519741,
                        "Put_Sim": 24.64826925692796,
                        "Put_Chg": -32.20363042692907
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4926.188484798862,
                "options": [
                    {
                        "Strike": 4926.188484798862,
                        "Call_Now": 62.34277187066118,
                        "Call_Sim": 27.2157865653885,
                        "Call_Chg": -56.344920591834665,
                        "Put_Now": 7.099874140875613,
                        "Put_Sim": 24.284404036739943,
                        "Put_Chg": 242.0399228900274
                    },
                    {
                        "Strike": 4978.5,
                        "Call_Now": 27.504792769072537,
                        "Call_Sim": 8.337444536388148,
                        "Call_Chg": -69.68730284067766,
                        "Put_Now": 24.542281699123123,
                        "Put_Sim": 57.686448667576315,
                        "Put_Chg": 135.04924837382748
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 17.831631056134484,
                        "Call_Sim": 4.542498950212803,
                        "Call_Chg": -74.52561161728343,
                        "Put_Now": 36.35632617519741,
                        "Put_Sim": 75.37870927041331,
                        "Put_Chg": 107.33313071065275
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5028.285,
                "options": [
                    {
                        "Strike": 4926.188484798862,
                        "Call_Now": 62.34277187066118,
                        "Call_Sim": 106.49894422589387,
                        "Call_Chg": 70.82805436826078,
                        "Put_Now": 7.099874140875613,
                        "Put_Sim": 1.4710464961084995,
                        "Put_Chg": -79.28066798199498
                    },
                    {
                        "Strike": 4978.5,
                        "Call_Now": 27.504792769072537,
                        "Call_Sim": 60.544647847370925,
                        "Call_Chg": 120.12399204639597,
                        "Put_Now": 24.542281699123123,
                        "Put_Sim": 7.797136777422793,
                        "Put_Chg": -68.2297804539446
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 17.831631056134484,
                        "Call_Sim": 44.72801726196258,
                        "Call_Chg": 150.8352551774849,
                        "Put_Now": 36.35632617519741,
                        "Put_Sim": 13.467712381026104,
                        "Put_Chg": -62.956344059279864
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4928.715,
                "options": [
                    {
                        "Strike": 4926.188484798862,
                        "Call_Now": 62.34277187066118,
                        "Call_Sim": 28.55113691767656,
                        "Call_Chg": -54.202971634129625,
                        "Put_Now": 7.099874140875613,
                        "Put_Sim": 23.09323918789096,
                        "Put_Chg": 225.26265578340121
                    },
                    {
                        "Strike": 4978.5,
                        "Call_Now": 27.504792769072537,
                        "Call_Sim": 8.921398003880313,
                        "Call_Chg": -67.56420570486216,
                        "Put_Now": 24.542281699123123,
                        "Put_Sim": 55.74388693393075,
                        "Put_Chg": 127.13408483092441
                    },
                    {
                        "Strike": 5000.0,
                        "Call_Now": 17.831631056134484,
                        "Call_Sim": 4.905334334353142,
                        "Call_Chg": -72.4908264481751,
                        "Put_Now": 36.35632617519741,
                        "Put_Sim": 73.21502945341672,
                        "Put_Chg": 101.38181481979504
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.025682467947649862,
            -0.2803020367822947,
            0.2440265997367461,
            0.28757922638532785,
            0.13076605767159644,
            0.002501896689664611,
            0.03555676842932692,
            0.19788543796797123,
            0.09445772656379925,
            0.2497501509041773
        ]
    },
    "delta_data": {
        "strikes": [
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "delta_values": [
            -66.65380512690156,
            -1007.5071257529642,
            -3822.934189165535,
            -977.6750686994727,
            -1488.729994380986,
            12.735198212143,
            83.5653016492165,
            363.3395116414051,
            108.92862606868701,
            116.97585372536017
        ],
        "delta_cumulative": [
            -66.65380512690156,
            -1074.1609308798656,
            -4897.0951200454,
            -5874.770188744873,
            -7363.500183125859,
            -7350.764984913716,
            -7267.1996832645,
            -6903.860171623095,
            -6794.931545554408,
            -6677.955691829048
        ]
    },
    "gamma_data": {
        "strikes": [
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "gamma_values": [
            510430.45207119966,
            16287289.002482185,
            64141624.01363228,
            10232551.16864634,
            6349933.853632403,
            62443.076489467516,
            499401.1429160174,
            2126283.468366479,
            792658.0060102076,
            1744843.5496678988
        ],
        "gamma_call": [
            0.0,
            0.0,
            21111803.52827049,
            0.0,
            0.0,
            62443.076489467516,
            499401.1429160174,
            2126283.468366479,
            792658.0060102076,
            1744843.5496678988
        ],
        "gamma_put": [
            510430.45207119966,
            16287289.002482185,
            43029820.4853618,
            10232551.16864634,
            6349933.853632403,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            510430.45207119966,
            16797719.454553384,
            80939343.46818566,
            91171894.636832,
            97521828.4904644,
            97584271.56695387,
            98083672.70986989,
            100209956.17823637,
            101002614.18424657,
            102747457.73391446
        ]
    },
    "volume_data": {
        "strikes": [
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_volume": [
            0.0,
            0.0,
            1440.0,
            0.0,
            0.0,
            30.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ],
        "put_volume": [
            300.0,
            3570.0,
            9490.0,
            1150.0,
            2010.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            300.0,
            3570.0,
            10930.0,
            1150.0,
            2010.0,
            30.0,
            300.0,
            1720.0,
            960.0,
            5330.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
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
            12.0
        ],
        "skew": [
            0.0,
            0.0,
            2.168404344971009e-19,
            1.3552527156068805e-19,
            -2.168404344971009e-19,
            0.0,
            0.0,
            0.0,
            1.0842021724855044e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4800.0,
            4900.0,
            5000.0,
            5050.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "charm": [
            -5.853440047350533,
            -1788.8958909939593,
            16030.647930434632,
            13084.527020902922,
            1877.72408266673,
            8.962544925293487,
            98.99899194370305,
            479.96028015374503,
            213.4884448916944,
            832.4733029227872
        ],
        "vanna": [
            -505.9134506525137,
            -5446.526937096784,
            -130.13714175949394,
            2343.6747784526524,
            3792.70523120921,
            28.01539374033335,
            579.546463161083,
            3449.883044579115,
            1762.8337599140868,
            4843.42790179845
        ],
        "vex": [
            324302.7169097968,
            1853400.418259601,
            7921780.786204189,
            145550.73140887366,
            1384956.8588135333,
            45890.75497803446,
            421481.7228774437,
            2262061.8317203536,
            800885.7486719431,
            926581.7186156411
        ],
        "theta": [
            -75.90817482878259,
            -3614.952576197727,
            -14302.710747251575,
            -1928.4933300429661,
            -250.87309432881003,
            -29.522475255856,
            -219.72657267720146,
            -940.7449594528123,
            -327.2900473204799,
            -608.5881492008705
        ],
        "charm_cum": [
            -5.853440047350533,
            -1794.7493310413097,
            14235.898599393322,
            27320.425620296242,
            29198.14970296297,
            29207.112247888264,
            29306.111239831967,
            29786.07151998571,
            29999.559964877404,
            30832.03326780019
        ],
        "vanna_cum": [
            -505.9134506525137,
            -5952.440387749298,
            -6082.5775295087915,
            -3738.902751056139,
            53.802480153070974,
            81.81787389340433,
            661.3643370544874,
            4111.247381633602,
            5874.081141547689,
            10717.50904334614
        ],
        "theta_cum": [
            -75.90817482878259,
            -3690.8607510265097,
            -17993.571498278085,
            -19922.06482832105,
            -20172.93792264986,
            -20202.460397905717,
            -20422.18697058292,
            -21362.93193003573,
            -21690.22197735621,
            -22298.81012655708
        ],
        "r_gamma": [
            510430.45207119966,
            16287289.002482185,
            -64141624.01363228,
            -10232551.16864634,
            -6349933.853632403,
            -62443.076489467516,
            -499401.1429160174,
            -2126283.468366479,
            -792658.0060102076,
            -1744843.5496678988
        ],
        "r_gamma_cum": [
            510430.45207119966,
            16797719.454553384,
            -47343904.5590789,
            -57576455.72772524,
            -63926389.58135764,
            -63988832.657847114,
            -64488233.80076313,
            -66614517.26912961,
            -67407175.27513982,
            -69152018.82480772
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
            "strike": 4800.0,
            "delta": -66.65380512690156,
            "gamma": 510430.45207119966,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 4900.0,
            "delta": -1007.5071257529642,
            "gamma": 16287289.002482185,
            "volume": 0,
            "oi": 3570,
            "iv": 12.0
        },
        {
            "strike": 5000.0,
            "delta": -3822.934189165535,
            "gamma": 64141624.01363228,
            "volume": 0,
            "oi": 10930,
            "iv": 12.0
        },
        {
            "strike": 5050.0,
            "delta": -977.6750686994727,
            "gamma": 10232551.16864634,
            "volume": 0,
            "oi": 1150,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": -1488.729994380986,
            "gamma": 6349933.853632403,
            "volume": 0,
            "oi": 2010,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": 12.735198212143,
            "gamma": 62443.076489467516,
            "volume": 0,
            "oi": 30,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 83.5653016492165,
            "gamma": 499401.1429160174,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 363.3395116414051,
            "gamma": 2126283.468366479,
            "volume": 0,
            "oi": 1720,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 108.92862606868701,
            "gamma": 792658.0060102076,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6000.0,
            "delta": 116.97585372536017,
            "gamma": 1744843.5496678988,
            "volume": 0,
            "oi": 5330,
            "iv": 12.0
        }
    ],
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-04-28",
        "meetings": [
            {
                "date": "2026-04-29",
                "days_remaining": 1,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 1.1,
                    "3.50-3.75": 98.9
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 50,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.0,
                    "3.25-3.50": 4.4,
                    "3.50-3.75": 95.6
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 92,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.3,
                    "3.25-3.50": 10.4,
                    "3.50-3.75": 89.3
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 141,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.9,
                    "3.25-3.50": 14.9,
                    "3.50-3.75": 84.2
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 183,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.2,
                    "3.25-3.50": 16.5,
                    "3.50-3.75": 82.2
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 225,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.3,
                    "3.25-3.50": 21.0,
                    "3.50-3.75": 76.7
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 274,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.2,
                    "3.25-3.50": 20.1,
                    "3.50-3.75": 74.0,
                    "3.75-4.00": 3.7
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 323,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.1,
                    "3.25-3.50": 19.9,
                    "3.50-3.75": 73.4,
                    "3.75-4.00": 4.4,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 365,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.0,
                    "3.25-3.50": 18.3,
                    "3.50-3.75": 68.7,
                    "3.75-4.00": 10.6,
                    "4.00-4.25": 0.4,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 407,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.3,
                    "3.00-3.25": 3.4,
                    "3.25-3.50": 22.9,
                    "3.50-3.75": 63.4,
                    "3.75-4.00": 9.6,
                    "4.00-4.25": 0.4,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 456,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.5,
                    "3.00-3.25": 4.8,
                    "3.25-3.50": 25.7,
                    "3.50-3.75": 59.7,
                    "3.75-4.00": 9.0,
                    "4.00-4.25": 0.4,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 505,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.4,
                    "3.00-3.25": 9.1,
                    "3.25-3.50": 32.6,
                    "3.50-3.75": 49.3,
                    "3.75-4.00": 7.2,
                    "4.00-4.25": 0.3,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 547,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 2.1,
                    "3.00-3.25": 11.3,
                    "3.25-3.50": 34.2,
                    "3.50-3.75": 45.3,
                    "3.75-4.00": 6.6,
                    "4.00-4.25": 0.3,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-12-08",
                "days_remaining": 589,
                "current_rate": "3.00-3.25",
                "probs": {
                    "1.00-1.25": 0.0,
                    "1.50-1.75": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.1,
                    "2.25-2.50": 0.8,
                    "2.50-2.75": 5.0,
                    "2.75-3.00": 18.6,
                    "3.00-3.25": 37.8,
                    "3.25-3.50": 32.9,
                    "3.50-3.75": 4.6,
                    "3.75-4.00": 0.2,
                    "4.00-4.25": 0.0
                }
            }
        ]
    }
};