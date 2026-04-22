window.marketData = {
    "last_updated": "2026-04-22 10:03:36",
    "spot_price": 4984.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 22/04/2026 10:03\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5058.67)\n  // 2 = Spline (5055.65)\n  // 3 = HVL (5055.88)\n  // 4 = HVL Log (4450.00)\n  // 5 = Sigma Kernel (4450.00)\n  // 6 = PVOP (5058.67)\n  // 7 = HVL Gaussian (5110.85)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5058.67;\n\n  if (ModeloFlip = 1) then GammaVal := 5058.67;\n  if (ModeloFlip = 2) then GammaVal := 5055.65;\n  if (ModeloFlip = 3) then GammaVal := 5055.88;\n  if (ModeloFlip = 4) then GammaVal := 4450.00;\n  if (ModeloFlip = 5) then GammaVal := 4450.00;\n  if (ModeloFlip = 6) then GammaVal := 5058.67;\n  if (ModeloFlip = 7) then GammaVal := 5110.85;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4450.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4800.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4900.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4976.70, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5200.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5200.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5551.83, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6050.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5218.41 > 0) then\n      HorizontalLineCustom(5218.41, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4625.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4850.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4925.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5025.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5975.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4583.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4666.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4838.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4861.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4919.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4930.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5007.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5042.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5345.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5404.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5957.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5992.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6069.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6080.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4532.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4717.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4876.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4911.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4985.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5064.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5309.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5441.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5935.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6014.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6061.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4986.97, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4982.03, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4996.38, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4972.65, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5020.83, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4948.43, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5138.89, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4834.74, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
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
        "gamma_exposure": 65508053.51685265,
        "delta_position": -6583.251073867303,
        "last_update": "2026-04-22T10:03:36.300268",
        "spot_price": 4984.5,
        "dealer_pressure": 0.07132178536328046,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5058.665267149049,
        "gamma_flip_hvl": 5055.88227946614,
        "gamma_flip_hvl_gaussian": 5110.845227633174,
        "call_wall": 5200.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5551.832460732984,
        "effective_put_wall": 4976.700838769804,
        "max_pain": 5200.0,
        "zero_gamma": 5058.665267149049,
        "range_low": 4946.82072168571,
        "range_high": 5022.17927831429,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.67927831428987,
                "upper": 5022.17927831429,
                "lower": 4946.82072168571
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.25342765388581,
                "upper": 5068.753427653885,
                "lower": 4900.246572346115
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 7.0,
                "move": 99.69,
                "upper": 5084.19,
                "lower": 4884.81
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
                4450.0,
                5055.478112934121,
                5050.565451817102,
                5051.217364816728,
                5052.535036340203,
                5053.7017153885845,
                5054.62214581273,
                5055.33245360925,
                5055.88227946614,
                5056.312543383001,
                5056.653678253656,
                5056.927740437883,
                5057.150695912003,
                5057.334195128974,
                5057.486838292235,
                5057.615054989296,
                5057.723713659334,
                5057.816546300025,
                5057.89644731944,
                5057.965686240504,
                5058.026060909042,
                5058.079009167513,
                5058.125691200034,
                5058.16705092712,
                5058.203862264554,
                5058.236764326843,
                5058.266288470548,
                5058.292879254143,
                5058.316910819322
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4236.825,
                4267.342346938775,
                4297.859693877551,
                4328.377040816326,
                4358.894387755102,
                4389.411734693877,
                4419.929081632653,
                4450.446428571428,
                4480.963775510204,
                4511.4811224489795,
                4541.998469387755,
                4572.5158163265305,
                4603.033163265306,
                4633.550510204082,
                4664.067857142857,
                4694.585204081633,
                4725.102551020408,
                4755.619897959184,
                4786.137244897959,
                4816.654591836735,
                4847.17193877551,
                4877.689285714286,
                4908.206632653061,
                4938.723979591836,
                4969.241326530611,
                4999.758673469387,
                5030.276020408162,
                5060.793367346938,
                5091.310714285713,
                5121.828061224489,
                5152.345408163264,
                5182.86275510204,
                5213.3801020408155,
                5243.897448979591,
                5274.4147959183665,
                5304.932142857142,
                5335.4494897959175,
                5365.966836734693,
                5396.484183673469,
                5427.001530612244,
                5457.51887755102,
                5488.036224489795,
                5518.553571428571,
                5549.070918367346,
                5579.588265306122,
                5610.105612244897,
                5640.622959183673,
                5671.140306122448,
                5701.657653061224,
                5732.174999999999
            ],
            "deltas": [
                -14301.95584240657,
                -14263.299762665627,
                -14214.393714056167,
                -14153.148653325494,
                -14077.262014692997,
                -13984.242896824939,
                -13871.451117432807,
                -13736.155453020801,
                -13575.617883009561,
                -13387.210766577622,
                -13168.571635424942,
                -12917.795089006455,
                -12633.65315054339,
                -12315.824862565181,
                -11965.102801099512,
                -11583.52585370917,
                -11174.356742623882,
                -10741.770736808317,
                -10290.056086734956,
                -9822.104281026852,
                -9337.120693633333,
                -8827.964375658717,
                -8279.311294100486,
                -7668.5101261777145,
                -6970.7743318667735,
                -6168.623914937608,
                -5262.678471440603,
                -4278.7305807215525,
                -3266.496404807441,
                -2289.040070467234,
                -1406.6886673752522,
                -662.1655315387902,
                -72.76275129967567,
                368.551170616575,
                685.4267962055106,
                908.2912966657811,
                1066.2692183489874,
                1182.6787979757419,
                1273.8845433104464,
                1350.235665330602,
                1417.7661488331976,
                1479.7992143727934,
                1538.114597421774,
                1593.6690745055973,
                1646.9921644164656,
                1698.3871672446166,
                1748.030187915351,
                1796.020388953734,
                1842.4078946403042,
                1887.211165678803
            ],
            "flip_value": 5218.411726957587
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
                4236.825,
                4267.342346938775,
                4297.859693877551,
                4328.377040816326,
                4358.894387755102,
                4389.411734693877,
                4419.929081632653,
                4450.446428571428,
                4480.963775510204,
                4511.4811224489795,
                4541.998469387755,
                4572.5158163265305,
                4603.033163265306,
                4633.550510204082,
                4664.067857142857,
                4694.585204081633,
                4725.102551020408,
                4755.619897959184,
                4786.137244897959,
                4816.654591836735,
                4847.17193877551,
                4877.689285714286,
                4908.206632653061,
                4938.723979591836,
                4969.241326530611,
                4999.758673469387,
                5030.276020408162,
                5060.793367346938,
                5091.310714285713,
                5121.828061224489,
                5152.345408163264,
                5182.86275510204,
                5213.3801020408155,
                5243.897448979591,
                5274.4147959183665,
                5304.932142857142,
                5335.4494897959175,
                5365.966836734693,
                5396.484183673469,
                5427.001530612244,
                5457.51887755102,
                5488.036224489795,
                5518.553571428571,
                5549.070918367346,
                5579.588265306122,
                5610.105612244897,
                5640.622959183673,
                5671.140306122448,
                5701.657653061224,
                5732.174999999999
            ],
            "pnl": [
                -14163078.007133711,
                -13532860.784153763,
                -12902667.084616102,
                -12272517.741176326,
                -11642442.076396063,
                -11012474.616866909,
                -10382648.558180295,
                -9752989.582488135,
                -9123517.618627202,
                -8494268.30019468,
                -7865350.515408375,
                -7237060.020241386,
                -6610064.385461522,
                -5985650.052110772,
                -5365973.855180734,
                -4754207.792836517,
                -4154448.945192891,
                -3571323.4132023416,
                -3009337.2834428283,
                -2472158.455087111,
                -1962074.7435870045,
                -1479828.8109189668,
                -1024899.6964201683,
                -596137.4023866339,
                -192517.4290256215,
                186282.25858632708,
                539727.550207915,
                866772.9271000938,
                1166555.7804788616,
                1439129.6815113225,
                1685919.3557609918,
                1909729.1196759958,
                2114347.158283753,
                2303941.3885676116,
                2482474.762994267,
                2653296.7792816954,
                2818959.985803053,
                2981226.0222967295,
                3141189.2786646807,
                3299448.587367245,
                3456277.268042402,
                3611763.1111794556,
                3765906.331857323,
                3918675.2348479237,
                4070027.4128202456,
                4219908.571563056,
                4368241.009030817,
                4514910.306840964,
                4659754.663471689,
                4802559.333467031
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
                        "Strike": 4984.5,
                        "Call_Now": 43.29713745995832,
                        "Call_Sim": 222.93592349080154,
                        "Call_Chg": 414.89760425149393,
                        "Put_Now": 36.379026149350466,
                        "Put_Sim": 0.51781218019336,
                        "Put_Chg": -98.57661890654374
                    },
                    {
                        "Strike": 5058.665267149049,
                        "Call_Now": 15.105926026765474,
                        "Call_Sim": 151.7400323059028,
                        "Call_Chg": 904.5066554479469,
                        "Put_Now": 82.2501460494741,
                        "Put_Sim": 3.38425232861249,
                        "Put_Chg": -95.88541480938304
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.249947330712985,
                        "Call_Sim": 115.01442361686532,
                        "Call_Chg": 1486.4173678838906,
                        "Put_Now": 115.67153070234599,
                        "Put_Sim": 7.936006988497638,
                        "Put_Chg": -93.13918736934576
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7613418976464743,
                        "Call_Sim": 45.16904700406894,
                        "Call_Chg": 5832.820345721074,
                        "Put_Now": 209.04413278637003,
                        "Put_Sim": 37.951837892792355,
                        "Put_Chg": -81.8450595159364
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4984.5,
                        "Call_Now": 43.29713745995832,
                        "Call_Sim": 127.90161057337536,
                        "Call_Chg": 195.40431094702325,
                        "Put_Now": 36.379026149350466,
                        "Put_Sim": 5.483499262767282,
                        "Put_Chg": -84.92675631212524
                    },
                    {
                        "Strike": 5058.665267149049,
                        "Call_Now": 15.105926026765474,
                        "Call_Sim": 69.18579747322747,
                        "Call_Chg": 358.00434445819764,
                        "Put_Now": 82.2501460494741,
                        "Put_Sim": 20.830017495937,
                        "Put_Chg": -74.67479573421355
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.249947330712985,
                        "Call_Sim": 44.30041148475948,
                        "Call_Chg": 511.044597484032,
                        "Put_Now": 115.67153070234599,
                        "Put_Sim": 37.221994856392485,
                        "Put_Chg": -67.82095418778998
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7613418976464743,
                        "Call_Sim": 10.308796182120545,
                        "Call_Chg": 1254.0298010641454,
                        "Put_Now": 209.04413278637003,
                        "Put_Sim": 103.09158707084316,
                        "Put_Chg": -50.68429537020478
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5058.665267149049,
                "options": [
                    {
                        "Strike": 4984.5,
                        "Call_Now": 43.29713745995832,
                        "Call_Sim": 92.97938375790955,
                        "Call_Chg": 114.74718471607488,
                        "Put_Now": 36.379026149350466,
                        "Put_Sim": 11.896005298252703,
                        "Put_Chg": -67.29982476876968
                    },
                    {
                        "Strike": 5058.665267149049,
                        "Call_Now": 15.105926026765474,
                        "Call_Sim": 43.94136331340496,
                        "Call_Chg": 190.8882463448275,
                        "Put_Now": 82.2501460494741,
                        "Put_Sim": 36.92031618706551,
                        "Put_Chg": -55.11215729044705
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.249947330712985,
                        "Call_Sim": 25.65422805763569,
                        "Call_Chg": 253.85399213807483,
                        "Put_Now": 115.67153070234599,
                        "Put_Sim": 59.910544280219256,
                        "Put_Chg": -48.206318429047826
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7613418976464743,
                        "Call_Sim": 4.584439666046933,
                        "Call_Chg": 502.1525519899467,
                        "Put_Now": 209.04413278637003,
                        "Put_Sim": 138.70196340572056,
                        "Put_Chg": -33.64943490307606
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5034.345,
                "options": [
                    {
                        "Strike": 4984.5,
                        "Call_Now": 43.29713745995832,
                        "Call_Sim": 74.57525811083497,
                        "Call_Chg": 72.24062024840096,
                        "Put_Now": 36.379026149350466,
                        "Put_Sim": 17.812146800227083,
                        "Put_Chg": -51.03731824183229
                    },
                    {
                        "Strike": 5058.665267149049,
                        "Call_Now": 15.105926026765474,
                        "Call_Sim": 32.177373040452494,
                        "Call_Chg": 113.01158885220894,
                        "Put_Now": 82.2501460494741,
                        "Put_Sim": 49.476593063162,
                        "Put_Chg": -39.846194274960375
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.249947330712985,
                        "Call_Sim": 17.6886852350724,
                        "Call_Chg": 143.98363778641178,
                        "Put_Now": 115.67153070234599,
                        "Put_Sim": 76.26526860670447,
                        "Put_Chg": -34.06738188417723
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7613418976464743,
                        "Call_Sim": 2.6755929601143293,
                        "Call_Chg": 251.43119909535426,
                        "Put_Now": 209.04413278637003,
                        "Put_Sim": 161.11338384883675,
                        "Put_Chg": -22.92853107076461
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4934.655,
                "options": [
                    {
                        "Strike": 4984.5,
                        "Call_Now": 43.29713745995832,
                        "Call_Sim": 21.731181786178695,
                        "Call_Chg": -49.80919510839271,
                        "Put_Now": 36.379026149350466,
                        "Put_Sim": 64.6580704755711,
                        "Put_Chg": 77.73447318277249
                    },
                    {
                        "Strike": 5058.665267149049,
                        "Call_Now": 15.105926026765474,
                        "Call_Sim": 5.936804777520024,
                        "Call_Chg": -60.69883589393407,
                        "Put_Now": 82.2501460494741,
                        "Put_Sim": 122.92602480023015,
                        "Put_Chg": 49.453868113850156
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 7.249947330712985,
                        "Call_Sim": 2.451273192616725,
                        "Call_Chg": -66.18908964714288,
                        "Put_Now": 115.67153070234599,
                        "Put_Sim": 160.7178565642489,
                        "Put_Chg": 38.943312661625654
                    },
                    {
                        "Strike": 5200.0,
                        "Call_Now": 0.7613418976464743,
                        "Call_Sim": 0.17394441241231107,
                        "Call_Chg": -77.15291737522617,
                        "Put_Now": 209.04413278637003,
                        "Put_Sim": 258.3017353011355,
                        "Put_Chg": 23.56325521228748
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0011939227739201433,
            -0.13347783340082353,
            -0.058688284135439625,
            -0.0010431804605673509,
            0.5,
            0.0498182248132328,
            0.001673632650322391,
            0.019230276958109922,
            0.013756594467991616,
            0.04741527020060739,
            0.0022079363598101085,
            0.00017324200615288343
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
            -3.067809587702799,
            -790.8145984379072,
            -995.4045544520066,
            -11.928634555384026,
            -5414.797963686055,
            428.1657227226251,
            -20.875261695024594,
            86.32706741750209,
            19.80697532489178,
            114.28631639886609,
            4.89669155612223,
            0.15497512676969602
        ],
        "delta_cumulative": [
            -3.067809587702799,
            -793.88240802561,
            -1789.2869624776165,
            -1801.2155970330004,
            -7216.013560719055,
            -6787.84783799643,
            -6808.723099691454,
            -6722.396032273952,
            -6702.58905694906,
            -6588.302740550194,
            -6583.406048994072,
            -6583.251073867303
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
            24288.50412224824,
            10798867.453729983,
            14991159.165213844,
            58492.60731522365,
            35714458.36721671,
            2117630.4054794107,
            182130.33913918253,
            501648.5089624451,
            266463.69671355694,
            816301.7441609725,
            34220.8839854819,
            2391.8408135841337
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2117630.4054794107,
            61923.00538863292,
            501648.5089624451,
            266463.69671355694,
            816301.7441609725,
            34220.8839854819,
            2391.8408135841337
        ],
        "gamma_put": [
            24288.50412224824,
            10798867.453729983,
            14991159.165213844,
            58492.60731522365,
            35714458.36721671,
            0.0,
            120207.3337505496,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            24288.50412224824,
            10823155.957852231,
            25814315.123066075,
            25872807.7303813,
            61587266.097598,
            63704896.50307741,
            63887026.842216596,
            64388675.35117904,
            64655139.0478926,
            65471440.79205357,
            65505661.676039055,
            65508053.51685264
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
            -1.4329303401160942,
            -1435.46703560199,
            -1450.9085691926891,
            2.9296100036056316,
            31579.745154333676,
            284.8056458372025,
            23.25509690225749,
            97.05295382728548,
            111.05585639894386,
            217.3726248618865,
            8.748545784433123,
            1.1861596413553508
        ],
        "vanna": [
            -62.56146087597925,
            -8327.732105202023,
            -5485.670475586897,
            -47.792041698941915,
            12915.699487627102,
            670.1653947526645,
            60.881216315107594,
            566.4689754687203,
            521.6756436567488,
            1792.8948412092948,
            86.43468252093643,
            7.2304070358490655
        ],
        "vex": [
            28364.045718235426,
            2563188.3249103385,
            1992624.876240224,
            68307.49970098298,
            1186791.451542611,
            1387271.7793747361,
            162579.42039842345,
            433414.2787733733,
            118904.47604691437,
            836617.224836955,
            39963.05054429152,
            1317.1115639009267
        ],
        "theta": [
            -3.71428510003469,
            -2270.492414729448,
            -3260.6011671142255,
            -3.91913022614234,
            -4672.279004485881,
            -999.6880581308503,
            -27.201610790017703,
            -223.0918854622984,
            -94.88095082740375,
            -339.32722030685176,
            -14.319947307213429,
            -0.8302062996200203
        ],
        "charm_cum": [
            -1.4329303401160942,
            -1436.899965942106,
            -2887.8085351347954,
            -2884.8789251311896,
            28694.866229202486,
            28979.671875039687,
            29002.926971941943,
            29099.97992576923,
            29211.035782168172,
            29428.40840703006,
            29437.156952814494,
            29438.34311245585
        ],
        "vanna_cum": [
            -62.56146087597925,
            -8390.293566078002,
            -13875.964041664898,
            -13923.75608336384,
            -1008.056595736738,
            -337.8912009840735,
            -277.0099846689659,
            289.45899079975436,
            811.1346344565031,
            2604.0294756657977,
            2690.464158186734,
            2697.694565222583
        ],
        "theta_cum": [
            -3.71428510003469,
            -2274.2066998294827,
            -5534.807866943708,
            -5538.726997169851,
            -10211.006001655733,
            -11210.694059786583,
            -11237.895670576601,
            -11460.9875560389,
            -11555.868506866304,
            -11895.195727173155,
            -11909.515674480368,
            -11910.345880779989
        ],
        "r_gamma": [
            24288.50412224824,
            10798867.453729983,
            14991159.165213844,
            58492.60731522365,
            -35714458.36721671,
            -2117630.4054794107,
            -182130.33913918253,
            -501648.5089624451,
            -266463.69671355694,
            -816301.7441609725,
            -34220.8839854819,
            -2391.8408135841337
        ],
        "r_gamma_cum": [
            24288.50412224824,
            10823155.957852231,
            25814315.123066075,
            25872807.7303813,
            -9841650.636835407,
            -11959281.042314818,
            -12141411.381454,
            -12643059.890416445,
            -12909523.587130003,
            -13725825.331290975,
            -13760046.215276457,
            -13762438.056090042
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
            "delta": -3.067809587702799,
            "gamma": 24288.50412224824,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 4800.0,
            "delta": -790.8145984379072,
            "gamma": 10798867.453729983,
            "volume": 0,
            "oi": 4410,
            "iv": 12.0
        },
        {
            "strike": 4900.0,
            "delta": -995.4045544520066,
            "gamma": 14991159.165213844,
            "volume": 0,
            "oi": 3570,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -11.928634555384026,
            "gamma": 58492.60731522365,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 5100.0,
            "delta": -5414.797963686055,
            "gamma": 35714458.36721671,
            "volume": 0,
            "oi": 6320,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 428.1657227226251,
            "gamma": 2117630.4054794107,
            "volume": 0,
            "oi": 950,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -20.875261695024594,
            "gamma": 182130.33913918253,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 86.32706741750209,
            "gamma": 501648.5089624451,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 19.80697532489178,
            "gamma": 266463.69671355694,
            "volume": 0,
            "oi": 320,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 114.28631639886609,
            "gamma": 816301.7441609725,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6050.0,
            "delta": 4.89669155612223,
            "gamma": 34220.8839854819,
            "volume": 0,
            "oi": 40,
            "iv": 12.0
        },
        {
            "strike": 6100.0,
            "delta": 0.15497512676969602,
            "gamma": 2391.8408135841337,
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
                    "3.50-3.75": 100.0
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 56,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 3.4,
                    "3.50-3.75": 96.6,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 98,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 9.6,
                    "3.50-3.75": 90.2,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 147,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 18.5,
                    "3.50-3.75": 80.2,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 189,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.4,
                    "3.25-3.50": 22.8,
                    "3.50-3.75": 74.7,
                    "3.75-4.00": 0.4
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 231,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.4,
                    "3.00-3.25": 5.1,
                    "3.25-3.50": 29.6,
                    "3.50-3.75": 64.8,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 280,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.6,
                    "3.00-3.25": 6.3,
                    "3.25-3.50": 31.3,
                    "3.50-3.75": 61.7,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 329,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.0,
                    "3.00-3.25": 7.7,
                    "3.25-3.50": 33.1,
                    "3.50-3.75": 58.1,
                    "3.75-4.00": 0.3
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 371,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.1,
                    "3.00-3.25": 8.3,
                    "3.25-3.50": 33.6,
                    "3.50-3.75": 56.8,
                    "3.75-4.00": 0.3
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
                    "2.75-3.00": 1.7,
                    "3.00-3.25": 10.5,
                    "3.25-3.50": 35.6,
                    "3.50-3.75": 52.0,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 462,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.4,
                    "2.75-3.00": 2.7,
                    "3.00-3.25": 13.4,
                    "3.25-3.50": 37.5,
                    "3.50-3.75": 46.0,
                    "3.75-4.00": 0.2
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 511,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.1,
                    "2.50-2.75": 0.8,
                    "2.75-3.00": 4.9,
                    "3.00-3.25": 18.3,
                    "3.25-3.50": 39.2,
                    "3.50-3.75": 36.6,
                    "3.75-4.00": 0.1
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 553,
                "current_rate": "3.25-3.50",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.2,
                    "2.50-2.75": 1.2,
                    "2.75-3.00": 6.2,
                    "3.00-3.25": 20.3,
                    "3.25-3.50": 39.0,
                    "3.50-3.75": 33.1,
                    "3.75-4.00": 0.1
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
                    "2.75-3.00": 26.3,
                    "3.00-3.25": 37.1,
                    "3.25-3.50": 22.5,
                    "3.50-3.75": 0.1
                }
            }
        ]
    }
};