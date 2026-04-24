window.marketData = {
    "last_updated": "2026-04-23 21:46:03",
    "spot_price": 4993.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 23/04/2026 21:46\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5100.00)\n  // 2 = Spline (5100.00)\n  // 3 = HVL (5100.00)\n  // 4 = HVL Log (5100.00)\n  // 5 = Sigma Kernel (5100.00)\n  // 6 = PVOP (5100.00)\n  // 7 = HVL Gaussian (5100.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5100.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5100.00;\n  if (ModeloFlip = 2) then GammaVal := 5100.00;\n  if (ModeloFlip = 3) then GammaVal := 5100.00;\n  if (ModeloFlip = 4) then GammaVal := 5100.00;\n  if (ModeloFlip = 5) then GammaVal := 5100.00;\n  if (ModeloFlip = 6) then GammaVal := 5100.00;\n  if (ModeloFlip = 7) then GammaVal := 5100.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5100.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5250.00, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5676.11, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5900.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6000.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (4313.24 > 0) then\n      HorizontalLineCustom(4313.24, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5150.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5450.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5800.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5950.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5138.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5307.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5342.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5776.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5823.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5938.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5961.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5123.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5176.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5238.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5285.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5364.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5423.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5476.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5747.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5852.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5923.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5976.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4995.47, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4990.53, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5004.90, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4981.13, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5029.39, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4956.87, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5147.66, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4842.99, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "positive"
    },
    "overview": {
        "open_interest_total": 14710,
        "volume_total": 6055,
        "total_trades": 14710,
        "total_volume": 14710,
        "gamma_exposure": 19689364.73255827,
        "delta_position": 1541.7169176762654,
        "last_update": "2026-04-23T21:46:03.549168",
        "spot_price": 4993.0,
        "dealer_pressure": 0.18442562473388802,
        "regime": "Gamma Negativo"
    },
    "key_levels": {
        "gamma_flip": 5100.0,
        "gamma_flip_hvl": 5100.0,
        "gamma_flip_hvl_gaussian": 5100.0,
        "call_wall": 5400.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5676.1061946902655,
        "effective_put_wall": 5250.0,
        "max_pain": 5100.0,
        "zero_gamma": 5100.0,
        "range_low": 4955.2564677252985,
        "range_high": 5030.7435322747015,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.74353227470143,
                "upper": 5030.7435322747015,
                "lower": 4955.2564677252985
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.39710387718965,
                "upper": 5077.39710387719,
                "lower": 4908.60289612281
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 6.0,
                "move": 92.45239516328698,
                "upper": 5085.452395163287,
                "lower": 4900.547604836713
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
            5100.0,
            5200.0,
            5250.0,
            5400.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_oi": [
            500.0,
            1035.0,
            30.0,
            6100.0,
            300.0,
            520.0,
            960.0,
            5200.0
        ],
        "put_oi": [
            0.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            500.0,
            1035.0,
            95.0,
            6100.0,
            300.0,
            520.0,
            960.0,
            5200.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            5100.0,
            5200.0,
            5250.0,
            5400.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_oi": [
            500.0,
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
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_oi": [
            500.0,
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
            "call_oi": 500,
            "put_oi": 0
        },
        {
            "expiry": "2026-07-01",
            "days_to_exp": 49,
            "call_oi": 6185,
            "put_oi": 0
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
            "call_oi": 5200,
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
            "call_oi": 200,
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
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0,
                5100.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4244.05,
                4274.619387755102,
                4305.188775510204,
                4335.758163265306,
                4366.3275510204085,
                4396.8969387755105,
                4427.466326530613,
                4458.035714285715,
                4488.605102040817,
                4519.174489795919,
                4549.743877551021,
                4580.313265306123,
                4610.882653061224,
                4641.452040816326,
                4672.021428571428,
                4702.59081632653,
                4733.160204081632,
                4763.7295918367345,
                4794.2989795918365,
                4824.868367346939,
                4855.437755102041,
                4886.007142857143,
                4916.576530612245,
                4947.145918367347,
                4977.715306122449,
                5008.284693877551,
                5038.854081632653,
                5069.423469387755,
                5099.992857142857,
                5130.562244897959,
                5161.131632653061,
                5191.7010204081635,
                5222.2704081632655,
                5252.839795918368,
                5283.40918367347,
                5313.978571428572,
                5344.547959183674,
                5375.117346938776,
                5405.686734693878,
                5436.25612244898,
                5466.825510204082,
                5497.394897959184,
                5527.964285714285,
                5558.533673469387,
                5589.1030612244895,
                5619.6724489795915,
                5650.241836734694,
                5680.811224489796,
                5711.380612244898,
                5741.95
            ],
            "deltas": [
                -21.104825914714848,
                -12.66692970642879,
                -2.9388162386329038,
                8.223516447099033,
                20.977891878898163,
                35.50009762103063,
                51.98980060107971,
                70.6785823708157,
                91.84036635219617,
                115.8043652567408,
                142.9704537986777,
                173.8265678223471,
                208.9673596446533,
                249.11294668412634,
                295.12630861736017,
                348.02808670946627,
                409.0091156928199,
                479.4456015938047,
                560.9308968871256,
                655.3488185157137,
                765.0135393555933,
                892.865639044303,
                1042.6253341570605,
                1218.6936800598899,
                1425.5670521812751,
                1666.7116463272944,
                1943.2225091388498,
                2252.926234113097,
                2590.545477716075,
                2949.025769102566,
                3321.444835023374,
                3702.589290032574,
                4089.540635850382,
                4481.233211149074,
                4877.461959484945,
                5277.931787335549,
                5681.709339353105,
                6087.119635581404,
                6491.93207048488,
                6893.6472532580065,
                7289.759252042513,
                7677.944452469673,
                8056.176674286725,
                8422.78586014669,
                8776.47794445253,
                9116.328539551881,
                9441.758676756901,
                9752.498284736952,
                10048.541851894199,
                10330.100071246974
            ],
            "flip_value": 4313.237076494334
        },
        "flow_sentiment": {
            "bull": [
                2160.0,
                1100.0,
                30.0,
                150.0,
                100.0,
                1335.0,
                860.0,
                300.0
            ],
            "bear": [
                -0.0,
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
                4244.05,
                4274.619387755102,
                4305.188775510204,
                4335.758163265306,
                4366.3275510204085,
                4396.8969387755105,
                4427.466326530613,
                4458.035714285715,
                4488.605102040817,
                4519.174489795919,
                4549.743877551021,
                4580.313265306123,
                4610.882653061224,
                4641.452040816326,
                4672.021428571428,
                4702.59081632653,
                4733.160204081632,
                4763.7295918367345,
                4794.2989795918365,
                4824.868367346939,
                4855.437755102041,
                4886.007142857143,
                4916.576530612245,
                4947.145918367347,
                4977.715306122449,
                5008.284693877551,
                5038.854081632653,
                5069.423469387755,
                5099.992857142857,
                5130.562244897959,
                5161.131632653061,
                5191.7010204081635,
                5222.2704081632655,
                5252.839795918368,
                5283.40918367347,
                5313.978571428572,
                5344.547959183674,
                5375.117346938776,
                5405.686734693878,
                5436.25612244898,
                5466.825510204082,
                5497.394897959184,
                5527.964285714285,
                5558.533673469387,
                5589.1030612244895,
                5619.6724489795915,
                5650.241836734694,
                5680.811224489796,
                5711.380612244898,
                5741.95
            ],
            "pnl": [
                -26740.667243416014,
                -25489.12810605416,
                -24237.58896869232,
                -22986.049831330478,
                -21734.510693968623,
                -20482.97155660679,
                -19231.43241924503,
                -17979.893281884848,
                -16728.354144547302,
                -15476.8150074913,
                -14225.275873456165,
                -12973.736767448274,
                -11722.197886958245,
                -10470.660584682351,
                -9219.132915526206,
                -7967.656676688523,
                -6716.421304865507,
                -5466.178439496674,
                -4219.545017922326,
                -2984.5352251979093,
                -1782.791928613049,
                -666.0000385940148,
                256.35885097331266,
                777.8729070656955,
                550.8624796335826,
                -949.9806167168535,
                -4439.551661813184,
                -10798.30015963424,
                -21014.988405025222,
                -36120.50049419204,
                -57158.248163188604,
                -85243.46115806136,
                -121736.70575859724,
                -168487.71522500948,
                -228018.5172149763,
                -303471.1211485252,
                -398205.4260790104,
                -515098.04830065585,
                -655776.9097388445,
                -820106.5621442068,
                -1006148.8076579054,
                -1210610.162301535,
                -1429580.8179771507,
                -1659282.565871952,
                -1896600.1322233605,
                -2139309.799752004,
                -2386053.3448378677,
                -2636178.2842319985,
                -2889569.614022335,
                -3146556.2814149866
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5100.0,
                5200.0,
                5250.0,
                5400.0,
                5500.0,
                5700.0,
                5900.0,
                6000.0
            ],
            "loss": [
                9750.0,
                53250.0,
                126750.0,
                361500.0,
                1128000.0,
                2721000.0,
                4418000.0,
                5362500.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5400.0,
                "options": [
                    {
                        "Strike": 4993.0,
                        "Call_Now": 39.90711225768155,
                        "Call_Sim": 412.9406882002713,
                        "Call_Chg": 934.7546210156717,
                        "Put_Now": 33.96660135861703,
                        "Put_Sim": 0.00017730120728603332,
                        "Put_Chg": -99.99947801310641
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.654243351565015,
                        "Call_Sim": 306.0893522175302,
                        "Call_Chg": 4499.912207081228,
                        "Put_Now": 107.5864272920362,
                        "Put_Sim": 0.0215361580010347,
                        "Put_Chg": -99.97998245824952
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 0.11955499050184315,
                        "Call_Sim": 158.61463988007108,
                        "Call_Chg": 132570.8648583145,
                        "Put_Now": 250.87327375275072,
                        "Put_Sim": 2.368358642319947,
                        "Put_Chg": -99.05595418479926
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 0.00032222916782172206,
                        "Call_Sim": 43.16010538583623,
                        "Call_Chg": 0.0,
                        "Put_Now": 400.5755758131954,
                        "Put_Sim": 36.73535896986414,
                        "Put_Chg": -90.82935625935534
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 4993.0,
                        "Call_Now": 39.90711225768155,
                        "Call_Sim": 263.0189293446474,
                        "Call_Chg": 559.0778296518312,
                        "Put_Now": 33.96660135861703,
                        "Put_Sim": 0.07841844558318734,
                        "Put_Chg": -99.76913072710674
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.654243351565015,
                        "Call_Sim": 158.14156828871637,
                        "Call_Chg": 2276.552222898836,
                        "Put_Now": 107.5864272920362,
                        "Put_Sim": 2.0737522291874484,
                        "Put_Chg": -98.07247783815853
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 0.11955499050184315,
                        "Call_Sim": 41.961213569562915,
                        "Call_Chg": 34997.83522496789,
                        "Put_Now": 250.87327375275072,
                        "Put_Sim": 35.71493233181218,
                        "Put_Chg": -85.76375562148912
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 0.00032222916782172206,
                        "Call_Sim": 3.1818742265819537,
                        "Call_Chg": 0.0,
                        "Put_Now": 400.5755758131954,
                        "Put_Sim": 146.75712781060975,
                        "Put_Chg": -63.36343584785895
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 4993.0,
                        "Call_Now": 39.90711225768155,
                        "Call_Sim": 118.07892293775149,
                        "Call_Chg": 195.88440821102756,
                        "Put_Now": 33.96660135861703,
                        "Put_Sim": 5.138412038687534,
                        "Put_Chg": -84.87216314509499
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.654243351565015,
                        "Call_Sim": 40.7623217532896,
                        "Call_Chg": 512.5763606722121,
                        "Put_Now": 107.5864272920362,
                        "Put_Sim": 34.694505693760675,
                        "Put_Chg": -67.751967820639
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 0.11955499050184315,
                        "Call_Sim": 2.798444464371812,
                        "Call_Chg": 2240.717399269643,
                        "Put_Now": 250.87327375275072,
                        "Put_Sim": 146.55216322662181,
                        "Put_Chg": -41.58319017630513
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 0.00032222916782172206,
                        "Call_Sim": 0.034254148682226315,
                        "Call_Chg": 0.0,
                        "Put_Now": 400.5755758131954,
                        "Put_Sim": 293.60950773271,
                        "Put_Chg": -26.70309288411734
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5042.93,
                "options": [
                    {
                        "Strike": 4993.0,
                        "Call_Now": 39.90711225768155,
                        "Call_Sim": 71.49025360949372,
                        "Call_Chg": 79.14163557583115,
                        "Put_Now": 33.96660135861703,
                        "Put_Sim": 15.619742710429136,
                        "Put_Chg": -54.014408019463076
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.654243351565015,
                        "Call_Sim": 17.335152353008652,
                        "Call_Chg": 160.51275009248934,
                        "Put_Now": 107.5864272920362,
                        "Put_Sim": 68.33733629347853,
                        "Put_Chg": -36.48145215568747
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 0.11955499050184315,
                        "Call_Sim": 0.6008066416787585,
                        "Call_Chg": 402.5358114762228,
                        "Put_Now": 250.87327375275072,
                        "Put_Sim": 201.42452540392787,
                        "Put_Chg": -19.71064817273333
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 0.00032222916782172206,
                        "Call_Sim": 0.0033365504799852674,
                        "Call_Chg": 0.0,
                        "Put_Now": 400.5755758131954,
                        "Put_Sim": 350.6485901345086,
                        "Put_Chg": -12.463811748215473
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4943.07,
                "options": [
                    {
                        "Strike": 4993.0,
                        "Call_Now": 39.90711225768155,
                        "Call_Sim": 18.8016019847837,
                        "Call_Chg": -52.886588577541936,
                        "Put_Now": 33.96660135861703,
                        "Put_Sim": 62.79109108571993,
                        "Put_Chg": 84.8612712905125
                    },
                    {
                        "Strike": 5100.0,
                        "Call_Now": 6.654243351565015,
                        "Call_Sim": 2.0420508723836406,
                        "Call_Chg": -69.31205000335058,
                        "Put_Now": 107.5864272920362,
                        "Put_Sim": 152.90423481285416,
                        "Put_Chg": 42.12223480365769
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 0.11955499050184315,
                        "Call_Sim": 0.01818095307895895,
                        "Call_Chg": -84.79281123887617,
                        "Put_Now": 250.87327375275072,
                        "Put_Sim": 300.7018997153291,
                        "Put_Chg": 19.862070286405718
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 0.00032222916782172206,
                        "Call_Sim": 2.320236308295167e-05,
                        "Call_Chg": 0.0,
                        "Put_Now": 400.5755758131954,
                        "Put_Sim": 450.50527678639173,
                        "Put_Chg": 12.464489596460204
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            0.2766860216761431,
            0.277915185658089,
            -0.001324333132568037,
            1.0,
            0.06446530122264447,
            0.07076581728102738,
            0.11620737668603154,
            0.2584331307217125
        ]
    },
    "delta_data": {
        "strikes": [
            5100.0,
            5200.0,
            5250.0,
            5400.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "delta_values": [
            70.97780259285125,
            458.81024588118146,
            -20.34515646735862,
            621.6840894071869,
            87.65962469142082,
            71.89913837377786,
            116.22003337084963,
            134.8111398263563
        ],
        "delta_cumulative": [
            70.97780259285125,
            529.7880484740327,
            509.44289200667413,
            1131.126981413861,
            1218.7866061052816,
            1290.6857444790594,
            1406.905777849909,
            1541.7169176762654
        ]
    },
    "gamma_data": {
        "strikes": [
            5100.0,
            5200.0,
            5250.0,
            5400.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "gamma_values": [
            3033537.8343034484,
            2403648.708634229,
            182848.48236901895,
            10256539.57585235,
            506658.276750396,
            545966.8092774004,
            827710.5463817085,
            1932454.4989897187
        ],
        "gamma_call": [
            3033537.8343034484,
            2403648.708634229,
            62266.51404495138,
            10256539.57585235,
            506658.276750396,
            545966.8092774004,
            827710.5463817085,
            1932454.4989897187
        ],
        "gamma_put": [
            0.0,
            0.0,
            120581.96832406758,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            3033537.8343034484,
            5437186.542937677,
            5620035.025306696,
            15876574.601159045,
            16383232.87790944,
            16929199.68718684,
            17756910.23356855,
            19689364.73255827
        ]
    },
    "volume_data": {
        "strikes": [
            5100.0,
            5200.0,
            5250.0,
            5400.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "call_volume": [
            500.0,
            1035.0,
            30.0,
            6100.0,
            300.0,
            520.0,
            960.0,
            5200.0
        ],
        "put_volume": [
            0.0,
            0.0,
            65.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            500.0,
            1035.0,
            95.0,
            6100.0,
            300.0,
            520.0,
            960.0,
            5200.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5100.0,
            5200.0,
            5250.0,
            5400.0,
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
            12.0
        ],
        "skew": [
            0.0,
            2.168404344971009e-19,
            1.3552527156068805e-19,
            0.0,
            -8.131516293641283e-20,
            0.0,
            1.0842021724855044e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5100.0,
            5200.0,
            5250.0,
            5400.0,
            5500.0,
            5700.0,
            5900.0,
            6000.0
        ],
        "charm": [
            2885.576348236026,
            353.9139826240634,
            22.993917025267564,
            4719.905013337047,
            97.20175807734338,
            166.34147554127077,
            219.7829782622717,
            888.5007911283899
        ],
        "vanna": [
            1019.500407033659,
            767.3630093205289,
            56.429356209851456,
            11931.734441902394,
            559.1825370877051,
            941.8603318564035,
            1797.154769449733,
            5252.669277218404
        ],
        "vex": [
            86551.16803815494,
            1451113.7569460447,
            162608.53755721514,
            2389842.098104103,
            436079.81373568147,
            438840.8012053953,
            845572.2244972945,
            1056767.343854668
        ],
        "theta": [
            -935.1674436097882,
            -1112.0914832212275,
            -28.02516465175518,
            -3527.0698198324653,
            -226.1284757378367,
            -222.9414769830462,
            -344.9607457442189,
            -680.9123924852067
        ],
        "charm_cum": [
            2885.576348236026,
            3239.4903308600897,
            3262.484247885357,
            7982.3892612224045,
            8079.591019299748,
            8245.93249484102,
            8465.715473103292,
            9354.216264231682
        ],
        "vanna_cum": [
            1019.500407033659,
            1786.8634163541878,
            1843.2927725640393,
            13775.027214466434,
            14334.209751554139,
            15276.070083410543,
            17073.224852860276,
            22325.89413007868
        ],
        "theta_cum": [
            -935.1674436097882,
            -2047.2589268310157,
            -2075.284091482771,
            -5602.3539113152365,
            -5828.482387053074,
            -6051.42386403612,
            -6396.384609780339,
            -7077.297002265545
        ],
        "r_gamma": [
            -3033537.8343034484,
            -2403648.708634229,
            -182848.48236901895,
            -10256539.57585235,
            -506658.276750396,
            -545966.8092774004,
            -827710.5463817085,
            -1932454.4989897187
        ],
        "r_gamma_cum": [
            -3033537.8343034484,
            -5437186.542937677,
            -5620035.025306696,
            -15876574.601159045,
            -16383232.87790944,
            -16929199.68718684,
            -17756910.23356855,
            -19689364.73255827
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
            "strike": 5100.0,
            "delta": 70.97780259285125,
            "gamma": 3033537.8343034484,
            "volume": 0,
            "oi": 500,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 458.81024588118146,
            "gamma": 2403648.708634229,
            "volume": 0,
            "oi": 1035,
            "iv": 12.0
        },
        {
            "strike": 5250.0,
            "delta": -20.34515646735862,
            "gamma": 182848.48236901895,
            "volume": 0,
            "oi": 95,
            "iv": 12.0
        },
        {
            "strike": 5400.0,
            "delta": 621.6840894071869,
            "gamma": 10256539.57585235,
            "volume": 0,
            "oi": 6100,
            "iv": 12.0
        },
        {
            "strike": 5500.0,
            "delta": 87.65962469142082,
            "gamma": 506658.276750396,
            "volume": 0,
            "oi": 300,
            "iv": 12.0
        },
        {
            "strike": 5700.0,
            "delta": 71.89913837377786,
            "gamma": 545966.8092774004,
            "volume": 0,
            "oi": 520,
            "iv": 12.0
        },
        {
            "strike": 5900.0,
            "delta": 116.22003337084963,
            "gamma": 827710.5463817085,
            "volume": 0,
            "oi": 960,
            "iv": 12.0
        },
        {
            "strike": 6000.0,
            "delta": 134.8111398263563,
            "gamma": 1932454.4989897187,
            "volume": 0,
            "oi": 5200,
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
                    "3.50-3.75": 98.9,
                    "3.75-4.00": 1.1
                }
            },
            {
                "date": "2026-06-17",
                "days_remaining": 55,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 3.5,
                    "3.50-3.75": 95.4,
                    "3.75-4.00": 1.0
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 97,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 7.6,
                    "3.50-3.75": 91.3,
                    "3.75-4.00": 1.0
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 146,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.7,
                    "3.25-3.50": 13.8,
                    "3.50-3.75": 84.6,
                    "3.75-4.00": 0.9
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 188,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 1.3,
                    "3.25-3.50": 17.0,
                    "3.50-3.75": 80.7,
                    "3.75-4.00": 0.9
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 230,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 1.9,
                    "3.25-3.50": 19.6,
                    "3.50-3.75": 77.5,
                    "3.75-4.00": 0.8
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 279,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 1.9,
                    "3.25-3.50": 19.6,
                    "3.50-3.75": 77.5,
                    "3.75-4.00": 0.8
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
                    "3.00-3.25": 2.0,
                    "3.25-3.50": 19.7,
                    "3.50-3.75": 77.4,
                    "3.75-4.00": 0.8
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 370,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 1.9,
                    "3.25-3.50": 19.3,
                    "3.50-3.75": 76.1,
                    "3.75-4.00": 2.5,
                    "4.00-4.25": 0.0
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
                    "3.00-3.25": 4.2,
                    "3.25-3.50": 26.6,
                    "3.50-3.75": 66.7,
                    "3.75-4.00": 2.2,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 461,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.7,
                    "3.00-3.25": 6.2,
                    "3.25-3.50": 30.3,
                    "3.50-3.75": 60.7,
                    "3.75-4.00": 2.0,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 510,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.2,
                    "2.75-3.00": 1.8,
                    "3.00-3.25": 11.1,
                    "3.25-3.50": 36.5,
                    "3.50-3.75": 48.7,
                    "3.75-4.00": 1.6,
                    "4.00-4.25": 0.0
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 552,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.25-1.50": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.3,
                    "2.75-3.00": 2.7,
                    "3.00-3.25": 13.6,
                    "3.25-3.50": 37.7,
                    "3.50-3.75": 44.2,
                    "3.75-4.00": 1.5,
                    "4.00-4.25": 0.0
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
                    "2.00-2.25": 0.1,
                    "2.25-2.50": 1.1,
                    "2.50-2.75": 6.2,
                    "2.75-3.00": 21.3,
                    "3.00-3.25": 39.8,
                    "3.25-3.50": 30.5,
                    "3.50-3.75": 1.0,
                    "3.75-4.00": 0.0
                }
            }
        ]
    }
};