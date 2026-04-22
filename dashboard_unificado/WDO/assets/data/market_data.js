window.marketData = {
    "last_updated": "2026-04-22 07:29:38",
    "spot_price": 4986.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 22/04/2026 07:29\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5056.44)\n  // 2 = Spline (5053.74)\n  // 3 = HVL (5053.31)\n  // 4 = HVL Log (4450.00)\n  // 5 = Sigma Kernel (4450.00)\n  // 6 = PVOP (5056.44)\n  // 7 = HVL Gaussian (5105.18)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5056.44;\n\n  if (ModeloFlip = 1) then GammaVal := 5056.44;\n  if (ModeloFlip = 2) then GammaVal := 5053.74;\n  if (ModeloFlip = 3) then GammaVal := 5053.31;\n  if (ModeloFlip = 4) then GammaVal := 4450.00;\n  if (ModeloFlip = 5) then GammaVal := 4450.00;\n  if (ModeloFlip = 6) then GammaVal := 5056.44;\n  if (ModeloFlip = 7) then GammaVal := 5105.18;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4900.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4976.70, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5551.83, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6050.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5218.23 > 0) then\n      HorizontalLineCustom(5218.23, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4850.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4925.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5025.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4583.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4666.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4838.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4861.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4919.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4930.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5007.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5042.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5345.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5404.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5957.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5992.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6069.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6080.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4532.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4717.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4911.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4985.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5064.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5309.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5441.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5935.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6014.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4988.47, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4983.53, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4997.88, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4974.15, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5022.34, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4949.92, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5140.44, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4836.20, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 17055,
        "volume_total": 2710,
        "total_trades": 17055,
        "total_volume": 17055,
        "gamma_exposure": 65965053.67673629,
        "delta_position": -6543.69246140161,
        "last_update": "2026-04-22T07:29:38.929129",
        "spot_price": 4986.0,
        "dealer_pressure": 0.07042027254023293,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5056.4427771842375,
        "gamma_flip_hvl": 5053.308659936723,
        "gamma_flip_hvl_gaussian": 5105.177768300732,
        "call_wall": 5200.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5551.832460732984,
        "effective_put_wall": 4976.700838769804,
        "max_pain": 5200.0,
        "zero_gamma": 5056.4427771842375,
        "range_low": 4948.3093827515195,
        "range_high": 5023.6906172484805,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.69061724848014,
                "upper": 5023.6906172484805,
                "lower": 4948.3093827515195
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.27878228152765,
                "upper": 5070.278782281528,
                "lower": 4901.721217718472
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 7.0,
                "move": 99.71999999999998,
                "upper": 5085.72,
                "lower": 4886.28
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
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
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
            950.0,
            30.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_oi": [
            40.0,
            4410.0,
            3570.0,
            40.0,
            6320.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            40.0,
            4410.0,
            3570.0,
            40.0,
            6320.0,
            950.0,
            95.0,
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
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
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
            0.0,
            6320.0,
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
            0.0,
            6320.0,
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
            "call_oi": 0,
            "put_oi": 6320
        },
        {
            "expiry": "2026-06-01",
            "days_to_exp": 28,
            "call_oi": 0,
            "put_oi": 3570
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 50,
            "call_oi": 0,
            "put_oi": 4410
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
                4450.0,
                5087.7210777114815,
                5049.3726939814005,
                5046.274373892939,
                5047.6612434908275,
                5049.372449615077,
                5050.779463087472,
                5051.858439700201,
                5052.679023022521,
                5053.308659936723,
                5053.798531775767,
                5054.185344708432,
                5054.495170498951,
                5054.746642968689,
                5054.953241208494,
                5055.124852589051,
                5055.26883379852,
                5055.390734605723,
                5055.494796699698,
                5055.584301862437,
                5055.661818233748,
                5055.729376819105,
                5055.788599634621,
                5055.840793887953,
                5055.887022005365,
                5055.928154272573,
                5055.964908815556,
                5055.99788226132,
                5056.027573466062,
                5056.05440203585
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4238.099999999999,
                4268.626530612244,
                4299.15306122449,
                4329.679591836734,
                4360.206122448979,
                4390.732653061224,
                4421.259183673469,
                4451.785714285714,
                4482.312244897958,
                4512.838775510204,
                4543.365306122449,
                4573.891836734693,
                4604.418367346938,
                4634.944897959183,
                4665.471428571428,
                4695.997959183673,
                4726.524489795918,
                4757.051020408163,
                4787.577551020408,
                4818.104081632652,
                4848.630612244898,
                4879.157142857142,
                4909.683673469387,
                4940.210204081632,
                4970.736734693877,
                5001.263265306122,
                5031.7897959183665,
                5062.316326530612,
                5092.842857142857,
                5123.369387755101,
                5153.895918367347,
                5184.4224489795915,
                5214.948979591836,
                5245.475510204081,
                5276.002040816326,
                5306.528571428571,
                5337.055102040816,
                5367.58163265306,
                5398.108163265306,
                5428.6346938775505,
                5459.161224489795,
                5489.687755102041,
                5520.214285714285,
                5550.74081632653,
                5581.2673469387755,
                5611.79387755102,
                5642.320408163265,
                5672.84693877551,
                5703.373469387755,
                5733.9
            ],
            "deltas": [
                -14300.520876222314,
                -14261.46221815722,
                -14212.063980144714,
                -14150.225844559092,
                -14073.634553588232,
                -13979.789642625517,
                -13866.043254729031,
                -13729.659444173327,
                -13567.899843412783,
                -13378.14259338958,
                -13158.039066068006,
                -12905.707564692191,
                -12619.954919610154,
                -12300.50619210535,
                -11948.20941972521,
                -11565.163583911299,
                -11154.686236428819,
                -10720.984029097888,
                -10268.323541952761,
                -9799.482008821826,
                -9313.42265462587,
                -8802.635914959872,
                -8251.38308747761,
                -7636.731844589571,
                -6933.983659100763,
                -6126.285825973693,
                -5215.3853757240195,
                -4228.3923513559885,
                -3216.0503752361383,
                -2241.7438939228864,
                -1365.2817725795098,
                -628.2487974271363,
                -46.61385746125602,
                387.7382749975864,
                699.067599642544,
                917.9320464621013,
                1073.2575707970984,
                1188.0223913608327,
                1278.2529714979062,
                1354.0342264323244,
                1421.2235481297191,
                1483.0390026484909,
                1541.2026581465211,
                1596.6410894229482,
                1649.8680160748509,
                1701.1780830956195,
                1750.7422848951828,
                1798.656553477875,
                1844.968900273874,
                1889.6964156992904
            ],
            "flip_value": 5218.225029691304
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                950.0,
                30.0,
                100.0,
                135.0,
                860.0,
                40.0,
                10.0
            ],
            "bear": [
                -40.0,
                -10.0,
                -300.0,
                -40.0,
                -175.0,
                -0.0,
                -20.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4238.099999999999,
                4268.626530612244,
                4299.15306122449,
                4329.679591836734,
                4360.206122448979,
                4390.732653061224,
                4421.259183673469,
                4451.785714285714,
                4482.312244897958,
                4512.838775510204,
                4543.365306122449,
                4573.891836734693,
                4604.418367346938,
                4634.944897959183,
                4665.471428571428,
                4695.997959183673,
                4726.524489795918,
                4757.051020408163,
                4787.577551020408,
                4818.104081632652,
                4848.630612244898,
                4879.157142857142,
                4909.683673469387,
                4940.210204081632,
                4970.736734693877,
                5001.263265306122,
                5031.7897959183665,
                5062.316326530612,
                5092.842857142857,
                5123.369387755101,
                5153.895918367347,
                5184.4224489795915,
                5214.948979591836,
                5245.475510204081,
                5276.002040816326,
                5306.528571428571,
                5337.055102040816,
                5367.58163265306,
                5398.108163265306,
                5428.6346938775505,
                5459.161224489795,
                5489.687755102041,
                5520.214285714285,
                5550.74081632653,
                5581.2673469387755,
                5611.79387755102,
                5642.320408163265,
                5672.84693877551,
                5703.373469387755,
                5733.9
            ],
            "pnl": [
                -14125297.076179342,
                -13496117.023397261,
                -12866961.208121639,
                -12237850.856796619,
                -11608815.6344899,
                -10979890.191056808,
                -10351107.530322943,
                -9722492.976401916,
                -9094066.518760612,
                -8465865.50688525,
                -7838004.329969816,
                -7210791.139374245,
                -6584916.326823015,
                -5961701.816488009,
                -5343350.8566309875,
                -4733084.941583847,
                -4135040.341339381,
                -3553857.487913856,
                -2994022.8548297393,
                -2459152.4468145617,
                -1951463.1329844836,
                -1471628.1932547293,
                -1019079.5173045549,
                -592655.0893553897,
                -191352.96889343625,
                185106.76040299237,
                536152.5008913296,
                860728.8416717877,
                1158001.891113487,
                1428086.5531580802,
                1672482.0712573014,
                1894057.3930593147,
                2096638.7884171233,
                2284400.5761823463,
                2461285.6891034883,
                2630607.8958600154,
                2794879.263690044,
                2955824.2324126293,
                3114507.570588994,
                3271507.2766018417,
                3427083.8242885172,
                3581318.2906872174,
                3734208.103980554,
                3885720.6741865557,
                4035813.0794543545,
                4184430.035092074,
                4331492.076658939,
                4476882.293863007,
                4620435.870046994,
                4761934.879283634
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4450.0,
                4800.0,
                4900.0,
                4950.0,
                5100.0,
                5200.0,
                5250.0,
                5500.0,
                5700.0,
                5900.0,
                6050.0,
                6100.0
            ],
            "loss": [
                7330000.0,
                2288250.0,
                1288750.0,
                967500.0,
                9750.0,
                3250.0,
                47500.0,
                292500.0,
                548500.0,
                868500.0,
                1252500.0,
                1382500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5200.0,
                "options": [
                    {
                        "Strike": 4986.0,
                        "Call_Now": 43.31016699274733,
                        "Call_Sim": 221.4605828675485,
                        "Call_Chg": 411.3362479175711,
                        "Put_Now": 36.38997379489638,
                        "Put_Sim": 0.5403896696977455,
                        "Put_Chg": -98.51500396031192
                    },
                    {
                        "Strike": 5056.4427771842375,
                        "Call_Now": 16.062089178618407,
                        "Call_Sim": 153.79568815790572,
                        "Call_Chg": 857.5073730921382,
                        "Put_Now": 79.48690388552086,
                        "Put_Sim": 3.2205028648072016,
                        "Put_Chg": -95.94838557374753
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.467353838531267,
                        "Call_Sim": 115.01442361686532,
                        "Call_Chg": 1440.2299945048162,
                        "Put_Now": 114.38893721016393,
                        "Put_Sim": 7.936006988497638,
                        "Put_Chg": -93.06226005586798
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7931634490462187,
                        "Call_Sim": 45.16904700406894,
                        "Call_Chg": 5594.796836438297,
                        "Put_Now": 207.57595433776896,
                        "Put_Sim": 37.951837892792355,
                        "Put_Chg": -81.7166501708397
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4986.0,
                        "Call_Now": 43.31016699274733,
                        "Call_Sim": 126.57684908759711,
                        "Call_Chg": 192.25666368082472,
                        "Put_Now": 36.38997379489638,
                        "Put_Sim": 5.6566558897459345,
                        "Put_Chg": -84.4554548963724
                    },
                    {
                        "Strike": 5056.4427771842375,
                        "Call_Now": 16.062089178618407,
                        "Call_Sim": 70.70260698988568,
                        "Call_Chg": 340.183130622907,
                        "Put_Now": 79.48690388552086,
                        "Put_Sim": 20.127421696787906,
                        "Put_Chg": -74.67831716558497
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.467353838531267,
                        "Call_Sim": 44.30041148475948,
                        "Call_Chg": 493.25448402044395,
                        "Put_Now": 114.38893721016393,
                        "Put_Sim": 37.221994856392485,
                        "Put_Chg": -67.46014451729239
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7931634490462187,
                        "Call_Sim": 10.308796182120545,
                        "Call_Chg": 1199.7064091287743,
                        "Put_Now": 207.57595433776896,
                        "Put_Sim": 103.09158707084316,
                        "Put_Chg": -50.33548688250671
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5056.4427771842375,
                "options": [
                    {
                        "Strike": 4986.0,
                        "Call_Now": 43.31016699274733,
                        "Call_Sim": 90.05659562921392,
                        "Call_Chg": 107.9340761819152,
                        "Put_Now": 36.38997379489638,
                        "Put_Sim": 12.6936252471246,
                        "Put_Chg": -65.11779503148514
                    },
                    {
                        "Strike": 5056.4427771842375,
                        "Call_Now": 16.062089178618407,
                        "Call_Sim": 43.92205797615725,
                        "Call_Chg": 173.4517128358718,
                        "Put_Now": 79.48690388552086,
                        "Put_Sim": 36.904095498822244,
                        "Put_Chg": -53.572105976133514
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.467353838531267,
                        "Call_Sim": 24.837417422773797,
                        "Call_Chg": 232.61337228475304,
                        "Put_Now": 114.38893721016393,
                        "Put_Sim": 61.31622361016889,
                        "Put_Chg": -46.39671885620012
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7931634490462187,
                        "Call_Sim": 4.3728268642312855,
                        "Call_Chg": 451.3147220146897,
                        "Put_Now": 207.57595433776896,
                        "Put_Sim": 140.71284056871718,
                        "Put_Chg": -32.21139653789171
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5035.86,
                "options": [
                    {
                        "Strike": 4986.0,
                        "Call_Now": 43.31016699274733,
                        "Call_Sim": 74.59770025892703,
                        "Call_Chg": 72.24062024840285,
                        "Put_Now": 36.38997379489638,
                        "Put_Sim": 17.81750706107573,
                        "Put_Chg": -51.03731824183231
                    },
                    {
                        "Strike": 5056.4427771842375,
                        "Call_Now": 16.062089178618407,
                        "Call_Sim": 33.81475313881765,
                        "Call_Chg": 110.52524838320099,
                        "Put_Now": 79.48690388552086,
                        "Put_Sim": 47.379567845719976,
                        "Put_Chg": -40.39324023243215
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.467353838531267,
                        "Call_Sim": 18.124154651166236,
                        "Call_Chg": 142.71187683174026,
                        "Put_Now": 114.38893721016393,
                        "Put_Sim": 75.18573802279889,
                        "Put_Chg": -34.27184493841217
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7931634490462187,
                        "Call_Sim": 2.7707176336411976,
                        "Call_Chg": 249.32492627755266,
                        "Put_Now": 207.57595433776896,
                        "Put_Sim": 159.69350852236494,
                        "Put_Chg": -23.06743378257069
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4936.14,
                "options": [
                    {
                        "Strike": 4986.0,
                        "Call_Now": 43.31016699274733,
                        "Call_Sim": 21.737721413559484,
                        "Call_Chg": -49.809195108391854,
                        "Put_Now": 36.38997379489638,
                        "Put_Sim": 64.6775282157073,
                        "Put_Chg": 77.73447318277046
                    },
                    {
                        "Strike": 5056.4427771842375,
                        "Call_Now": 16.062089178618407,
                        "Call_Sim": 6.39639121182995,
                        "Call_Chg": -60.17709065926042,
                        "Put_Now": 79.48690388552086,
                        "Put_Sim": 119.6812059187323,
                        "Put_Chg": 50.56720046751392
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.467353838531267,
                        "Call_Sim": 2.5392933412104526,
                        "Call_Chg": -65.99473660792938,
                        "Put_Now": 114.38893721016393,
                        "Put_Sim": 159.32087671284262,
                        "Put_Chg": 39.279969373372495
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7931634490462187,
                        "Call_Sim": 0.18237015017558988,
                        "Call_Chg": -77.00724227838657,
                        "Put_Now": 207.57595433776896,
                        "Put_Sim": 256.82516103889793,
                        "Put_Chg": 23.725872709220614
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0011924123096001484,
            -0.13478416371804308,
            -0.06154391928810912,
            -0.0010534757389491555,
            0.5,
            0.049482921446265996,
            0.0016338902085143044,
            0.019153174470205793,
            0.013767011902799367,
            0.04734396007414627,
            0.002204643861664962,
            0.00017380919509230587
        ]
    },
    "delta_data": {
        "strikes": [
            4450.0,
            4800.0,
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "delta_values": [
            -3.053219828949927,
            -784.3329022199273,
            -986.403195990837,
            -11.893458831156067,
            -5393.133456678155,
            429.44032534154064,
            -20.76564511097292,
            86.62919613683988,
            19.96783378190392,
            114.7783265371469,
            4.917315234310083,
            0.1564202266468661
        ],
        "delta_cumulative": [
            -3.053219828949927,
            -787.3861220488773,
            -1773.7893180397143,
            -1785.6827768708704,
            -7178.816233549025,
            -6749.375908207485,
            -6770.141553318458,
            -6683.512357181618,
            -6663.544523399714,
            -6548.766196862567,
            -6543.848881628257,
            -6543.69246140161
        ]
    },
    "gamma_data": {
        "strikes": [
            4450.0,
            4800.0,
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "gamma_values": [
            24200.585839679887,
            10743041.106800573,
            14924763.512494897,
            58413.86620930781,
            36287693.37741079,
            2118507.3742301213,
            182180.11917802505,
            502475.7809507626,
            268150.4041008927,
            818894.6581878549,
            34321.92281498711,
            2410.9685183915526
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2118507.3742301213,
            61955.11513066481,
            502475.7809507626,
            268150.4041008927,
            818894.6581878549,
            34321.92281498711,
            2410.9685183915526
        ],
        "gamma_put": [
            24200.585839679887,
            10743041.106800573,
            14924763.512494897,
            58413.86620930781,
            36287693.37741079,
            0.0,
            120225.00404736024,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            24200.585839679887,
            10767241.692640252,
            25692005.20513515,
            25750419.07134446,
            62038112.44875525,
            64156619.82298537,
            64338799.9421634,
            64841275.72311416,
            65109426.12721506,
            65928320.78540291,
            65962642.7082179,
            65965053.67673629
        ]
    },
    "volume_data": {
        "strikes": [
            4450.0,
            4800.0,
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
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
            950.0,
            30.0,
            300.0,
            320.0,
            960.0,
            40.0,
            10.0
        ],
        "put_volume": [
            40.0,
            4410.0,
            3570.0,
            40.0,
            6320.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            40.0,
            4410.0,
            3570.0,
            40.0,
            6320.0,
            950.0,
            95.0,
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
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
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
            12.0
        ],
        "skew": [
            0.0,
            0.0,
            2.168404344971009e-19,
            1.3552527156068805e-19,
            0.0,
            2.168404344971009e-19,
            0.0,
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
            4900.0,
            4950.0,
            5100.0,
            5200.0,
            5250.0,
            5500.0,
            5700.0,
            5900.0,
            6050.0,
            6100.0
        ],
        "charm": [
            -1.4352027298149839,
            -1444.338492797963,
            -1484.9211615202614,
            2.9076613463202072,
            31699.039831330825,
            283.7595660398489,
            23.187272195949834,
            97.00366940238032,
            111.54256788927293,
            217.87601097099758,
            8.763797614606816,
            1.1940693742426403
        ],
        "vanna": [
            -62.45413555154422,
            -8338.080162757651,
            -5536.193798736887,
            -48.021215463868614,
            12943.45647997438,
            659.7524753897995,
            59.980323990736835,
            564.8871427393126,
            523.6563225264401,
            1794.6559544195893,
            86.52060056444799,
            7.27582566930756
        ],
        "vex": [
            28269.879776356567,
            2550704.902786079,
            1984396.5566213208,
            68236.07436402258,
            1206202.9278651343,
            1388263.9352112105,
            162669.62294206256,
            434259.66892888705,
            119693.1466624979,
            839311.3214277659,
            40093.10510500888,
            1328.04412170784
        ],
        "theta": [
            -3.705749064530393,
            -2261.923592233417,
            -3251.872628433952,
            -3.936503017797455,
            -4860.092259049265,
            -1001.380186726518,
            -27.339830814737958,
            -223.66943218994462,
            -95.54346866355556,
            -340.6226126959858,
            -14.372067574340273,
            -0.8372904727937308
        ],
        "charm_cum": [
            -1.4352027298149839,
            -1445.773695527778,
            -2930.6948570480395,
            -2927.787195701719,
            28771.252635629105,
            29055.012201668953,
            29078.1994738649,
            29175.20314326728,
            29286.745711156553,
            29504.62172212755,
            29513.385519742158,
            29514.5795891164
        ],
        "vanna_cum": [
            -62.45413555154422,
            -8400.534298309196,
            -13936.728097046083,
            -13984.749312509952,
            -1041.2928325355715,
            -381.54035714577196,
            -321.5600331550351,
            243.32710958427748,
            766.9834321107176,
            2561.639386530307,
            2648.1599870947553,
            2655.435812764063
        ],
        "theta_cum": [
            -3.705749064530393,
            -2265.629341297947,
            -5517.5019697318985,
            -5521.438472749696,
            -10381.530731798961,
            -11382.910918525478,
            -11410.250749340215,
            -11633.92018153016,
            -11729.463650193717,
            -12070.086262889703,
            -12084.458330464044,
            -12085.295620936837
        ],
        "r_gamma": [
            24200.585839679887,
            10743041.106800573,
            14924763.512494897,
            58413.86620930781,
            -36287693.37741079,
            -2118507.3742301213,
            -182180.11917802505,
            -502475.7809507626,
            -268150.4041008927,
            -818894.6581878549,
            -34321.92281498711,
            -2410.9685183915526
        ],
        "r_gamma_cum": [
            24200.585839679887,
            10767241.692640252,
            25692005.20513515,
            25750419.07134446,
            -10537274.30606633,
            -12655781.68029645,
            -12837961.799474476,
            -13340437.580425238,
            -13608587.984526131,
            -14427482.642713986,
            -14461804.565528974,
            -14464215.534047365
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
            "delta": -3.053219828949927,
            "gamma": 24200.585839679887,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 4800.0,
            "delta": -784.3329022199273,
            "gamma": 10743041.106800573,
            "volume": 0,
            "oi": 4410,
            "iv": 12.0
        },
        {
            "strike": 4900.0,
            "delta": -986.403195990837,
            "gamma": 14924763.512494897,
            "volume": 0,
            "oi": 3570,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -11.893458831156067,
            "gamma": 58413.86620930781,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 5100.0,
            "delta": -5393.133456678155,
            "gamma": 36287693.37741079,
            "volume": 0,
            "oi": 6320,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 429.44032534154064,
            "gamma": 2118507.3742301213,
            "volume": 0,
            "oi": 950,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -20.76564511097292,
            "gamma": 182180.11917802505,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 86.62919613683988,
            "gamma": 502475.7809507626,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 19.96783378190392,
            "gamma": 268150.4041008927,
            "volume": 0,
            "oi": 320,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 114.7783265371469,
            "gamma": 818894.6581878549,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6050.0,
            "delta": 4.917315234310083,
            "gamma": 34321.92281498711,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 6100.0,
            "delta": 0.1564202266468661,
            "gamma": 2410.9685183915526,
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
                    "3.75-4.00": 2.0
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 147,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.7,
                    "3.25-3.50": 15.9,
                    "3.50-3.75": 83.3,
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
                    "3.00-3.25": 1.4,
                    "3.25-3.50": 19.0,
                    "3.50-3.75": 79.5,
                    "3.75-4.00": 1.7
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 231,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.2,
                    "3.00-3.25": 3.8,
                    "3.25-3.50": 27.0,
                    "3.50-3.75": 69.0,
                    "3.75-4.00": 1.5
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 280,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.4,
                    "3.00-3.25": 4.9,
                    "3.25-3.50": 29.0,
                    "3.50-3.75": 65.7,
                    "3.75-4.00": 1.4
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 329,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 6.8,
                    "3.25-3.50": 32.0,
                    "3.50-3.75": 60.4,
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
                    "2.75-3.00": 0.8,
                    "3.00-3.25": 6.8,
                    "3.25-3.50": 32.0,
                    "3.50-3.75": 60.4,
                    "3.75-4.00": 1.3
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 413,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 1.8,
                    "3.00-3.25": 11.0,
                    "3.25-3.50": 36.7,
                    "3.50-3.75": 50.3,
                    "3.75-4.00": 1.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 462,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 2.6,
                    "3.00-3.25": 13.4,
                    "3.25-3.50": 38.0,
                    "3.50-3.75": 45.7,
                    "3.75-4.00": 0.8
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 511,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 4.8,
                    "3.00-3.25": 18.4,
                    "3.25-3.50": 39.6,
                    "3.50-3.75": 36.3,
                    "3.75-4.00": 0.7
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 553,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.25-1.50": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 1.2,
                    "2.75-3.00": 6.1,
                    "3.00-3.25": 20.4,
                    "3.25-3.50": 39.3,
                    "3.50-3.75": 32.9,
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
                    "1.75-2.00": 0.1,
                    "2.00-2.25": 0.5,
                    "2.25-2.50": 2.8,
                    "2.50-2.75": 10.7,
                    "2.75-3.00": 26.5,
                    "3.00-3.25": 37.2,
                    "3.25-3.50": 22.3,
                    "3.50-3.75": 0.4
                }
            }
        ]
    }
};