window.marketData = {
    "last_updated": "2026-03-06 08:22:20",
    "spot_price": 5302.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 06/03/2026 08:22\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5075.00)\n  // 2 = Spline (5075.00)\n  // 3 = HVL (5075.00)\n  // 4 = HVL Log (5075.00)\n  // 5 = Sigma Kernel (5075.00)\n  // 6 = PVOP (5075.00)\n  // 7 = HVL Gaussian (5075.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5075.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5075.00;\n  if (ModeloFlip = 2) then GammaVal := 5075.00;\n  if (ModeloFlip = 3) then GammaVal := 5075.00;\n  if (ModeloFlip = 4) then GammaVal := 5075.00;\n  if (ModeloFlip = 5) then GammaVal := 5075.00;\n  if (ModeloFlip = 6) then GammaVal := 5075.00;\n  if (ModeloFlip = 7) then GammaVal := 5075.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5075.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5173.98, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5225.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5253.12, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5265.72, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5339.28, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5550.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5421.79 > 0) then\n      HorizontalLineCustom(5421.79, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5112.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5212.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5237.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5103.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5121.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5209.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5215.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5234.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5240.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5364.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5435.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5092.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5132.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5205.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5219.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5244.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5320.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5479.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5310.45, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5294.55, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5318.41, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5286.59, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5333.18, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5271.82, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5341.13, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5263.87, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 16765,
        "total_volume": 16765,
        "gamma_exposure": 75936576.81441899,
        "delta_position": -2339.8490348380556,
        "last_update": "2026-03-06T08:22:20.987386",
        "spot_price": 5302.5,
        "dealer_pressure": -0.21356303704361548,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5075.0,
        "gamma_flip_hvl": 5075.0,
        "gamma_flip_hvl_gaussian": 5075.0,
        "call_wall": 5250.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5253.125,
        "effective_put_wall": 5173.9786856127885,
        "max_pain": 5250.0,
        "zero_gamma": 5075.0,
        "range_low": 5265.723726057288,
        "range_high": 5339.276273942712,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5339.276273942712,
                "sigma_1_down": 5265.723726057288,
                "sigma_2_up": 5376.052547885423,
                "sigma_2_down": 5228.947452114577
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5384.734248495058,
                "sigma_1_down": 5220.265751504942,
                "sigma_2_up": 5466.968496990115,
                "sigma_2_down": 5138.031503009885
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 17.0,
                "sigma_1_up": 5454.132461982451,
                "sigma_1_down": 5150.867538017549,
                "sigma_2_up": 5605.764923964902,
                "sigma_2_down": 4999.235076035098
            }
        ]
    },
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
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0,
                5075.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4507.125,
                4539.589285714285,
                4572.053571428572,
                4604.517857142857,
                4636.982142857143,
                4669.446428571428,
                4701.910714285714,
                4734.375,
                4766.839285714285,
                4799.303571428572,
                4831.767857142857,
                4864.232142857143,
                4896.696428571428,
                4929.160714285714,
                4961.625,
                4994.089285714285,
                5026.553571428571,
                5059.017857142857,
                5091.482142857142,
                5123.946428571428,
                5156.410714285714,
                5188.875,
                5221.339285714285,
                5253.803571428571,
                5286.267857142857,
                5318.732142857142,
                5351.1964285714275,
                5383.660714285714,
                5416.124999999999,
                5448.589285714285,
                5481.053571428571,
                5513.517857142857,
                5545.982142857142,
                5578.4464285714275,
                5610.910714285714,
                5643.374999999999,
                5675.839285714284,
                5708.303571428571,
                5740.767857142857,
                5773.232142857142,
                5805.6964285714275,
                5838.160714285714,
                5870.624999999999,
                5903.089285714284,
                5935.553571428571,
                5968.017857142856,
                6000.482142857142,
                6032.9464285714275,
                6065.410714285714,
                6097.874999999999
            ],
            "deltas": [
                -15804.680846713947,
                -15804.358384481076,
                -15803.67821942184,
                -15802.234280152183,
                -15799.204208646835,
                -15793.01062127244,
                -15780.803282045961,
                -15757.746055636422,
                -15716.15103378033,
                -15644.593368939351,
                -15527.247891989831,
                -15343.777060287615,
                -15070.120600592907,
                -14680.445193185997,
                -14150.288766635396,
                -13460.605915740642,
                -12602.068720260932,
                -11578.71772114226,
                -10410.006948186186,
                -9130.511269790672,
                -7787.0422075873485,
                -6433.53115739211,
                -5124.603809022204,
                -3909.1044070918506,
                -2824.8232747148922,
                -1895.3421331689292,
                -1129.3583428795143,
                -522.2631551270797,
                -59.303150450703335,
                280.5486457766727,
                520.8362218921509,
                684.5718153991396,
                792.1828301574801,
                860.4628297747056,
                902.3439276418444,
                927.2226738659426,
                941.5744573203342,
                949.6478157693153,
                954.1050071021366,
                956.5437609173506,
                957.8849465541474,
                958.6399080722582,
                959.0833686910565,
                959.3590555465794,
                959.5409564881417,
                959.6671827839243,
                959.757875551799,
                959.8242972478465,
                959.873285803963,
                959.9093779842134
            ],
            "flip_value": 5421.78992347947
        },
        "flow_sentiment": {
            "bull": [
                500.0,
                350.0,
                500.0,
                0.0,
                1885.0,
                100.0
            ],
            "bear": [
                -0.0,
                -0.0,
                -0.0,
                -0.0,
                -250.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4507.125,
                4539.589285714285,
                4572.053571428572,
                4604.517857142857,
                4636.982142857143,
                4669.446428571428,
                4701.910714285714,
                4734.375,
                4766.839285714285,
                4799.303571428572,
                4831.767857142857,
                4864.232142857143,
                4896.696428571428,
                4929.160714285714,
                4961.625,
                4994.089285714285,
                5026.553571428571,
                5059.017857142857,
                5091.482142857142,
                5123.946428571428,
                5156.410714285714,
                5188.875,
                5221.339285714285,
                5253.803571428571,
                5286.267857142857,
                5318.732142857142,
                5351.1964285714275,
                5383.660714285714,
                5416.124999999999,
                5448.589285714285,
                5481.053571428571,
                5513.517857142857,
                5545.982142857142,
                5578.4464285714275,
                5610.910714285714,
                5643.374999999999,
                5675.839285714284,
                5708.303571428571,
                5740.767857142857,
                5773.232142857142,
                5805.6964285714275,
                5838.160714285714,
                5870.624999999999,
                5903.089285714284,
                5935.553571428571,
                5968.017857142856,
                6000.482142857142,
                6032.9464285714275,
                6065.410714285714,
                6097.874999999999
            ],
            "pnl": [
                -11852921.753380653,
                -11264075.163361782,
                -10675237.858407773,
                -10086423.999846395,
                -9497665.7696825,
                -8909031.769049048,
                -8320659.363377578,
                -7732807.271012219,
                -7145934.3708142815,
                -6560807.8997400645,
                -5978638.057872493,
                -5401226.524977369,
                -4831104.929814543,
                -4271628.922268744,
                -3726988.326345654,
                -3202097.942224407,
                -2702349.1591863097,
                -2233228.5339458277,
                -1799840.802000333,
                -1406402.2227525152,
                -1055786.745109965,
                -749205.6500707765,
                -486079.6519283879,
                -264125.6897458189,
                -79638.50762204378,
                72089.0143093128,
                196283.7846381428,
                298227.4665440916,
                382871.8335199728,
                454571.7832471923,
                516944.91218638036,
                572843.1273261778,
                624407.4573687171,
                673172.6973309161,
                720191.7574409656,
                766157.2862254061,
                811507.0590754987,
                856507.4433131702,
                901314.8216171432,
                946018.0239524394,
                990666.036426764,
                1035285.198019464,
                1079889.391093817,
                1124485.8338073154,
                1169078.2543541004,
                1213668.5782466508,
                1258257.804877629,
                1302846.4566617126,
                1347434.8083201938,
                1392023.0046114014
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5075.0,
                5150.0,
                5200.0,
                5225.0,
                5250.0,
                5550.0
            ],
            "loss": [
                1661375.0,
                663500.0,
                218000.0,
                96500.0,
                0.0,
                285000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 247.63475910253237,
                        "Call_Sim": 198.7483549232802,
                        "Call_Chg": -19.741333711157612,
                        "Put_Now": 3.0455408515223894,
                        "Put_Sim": 6.659136672269369,
                        "Put_Chg": 118.65202264289556
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 101.58542606263063,
                        "Call_Sim": 69.0454536143111,
                        "Call_Chg": -32.032126762216464,
                        "Put_Now": 31.406924423653663,
                        "Put_Sim": 51.36695197533436,
                        "Put_Chg": 63.55295183455816
                    },
                    {
                        "Strike": 5302.5,
                        "Call_Now": 69.73590815045418,
                        "Call_Sim": 44.34922156066159,
                        "Call_Chg": -36.40403812483691,
                        "Put_Now": 51.88062149508778,
                        "Put_Sim": 78.99393490529519,
                        "Put_Chg": 52.26096494001057
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 247.63475910253237,
                        "Call_Sim": 198.7483549232802,
                        "Call_Chg": -19.741333711157612,
                        "Put_Now": 3.0455408515223894,
                        "Put_Sim": 6.659136672269369,
                        "Put_Chg": 118.65202264289556
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 101.58542606263063,
                        "Call_Sim": 69.0454536143111,
                        "Call_Chg": -32.032126762216464,
                        "Put_Now": 31.406924423653663,
                        "Put_Sim": 51.36695197533436,
                        "Put_Chg": 63.55295183455816
                    },
                    {
                        "Strike": 5302.5,
                        "Call_Now": 69.73590815045418,
                        "Call_Sim": 44.34922156066159,
                        "Call_Chg": -36.40403812483691,
                        "Put_Now": 51.88062149508778,
                        "Put_Sim": 78.99393490529519,
                        "Put_Chg": 52.26096494001057
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5075.0,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 247.63475910253237,
                        "Call_Sim": 66.74393849383387,
                        "Call_Chg": -73.04742729343631,
                        "Put_Now": 3.0455408515223894,
                        "Put_Sim": 49.65472024282326,
                        "Put_Chg": 1530.407295899581
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 101.58542606263063,
                        "Call_Sim": 10.776498200645392,
                        "Call_Chg": -89.39168873101802,
                        "Put_Now": 31.406924423653663,
                        "Put_Sim": 168.09799656166888,
                        "Put_Chg": 435.22590844670026
                    },
                    {
                        "Strike": 5302.5,
                        "Call_Now": 69.73590815045418,
                        "Call_Sim": 5.246957914044856,
                        "Call_Chg": -92.47595958351238,
                        "Put_Now": 51.88062149508778,
                        "Put_Sim": 214.8916712586788,
                        "Put_Chg": 314.2041191218679
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5355.525,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 247.63475910253237,
                        "Call_Sim": 298.8798942806143,
                        "Call_Chg": 20.693837716402335,
                        "Put_Now": 3.0455408515223894,
                        "Put_Sim": 1.265676029604137,
                        "Put_Chg": -58.44166631449198
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 101.58542606263063,
                        "Call_Sim": 140.95851089818916,
                        "Call_Chg": 38.758595953797325,
                        "Put_Now": 31.406924423653663,
                        "Put_Sim": 17.75500925921392,
                        "Put_Chg": -43.46785116647081
                    },
                    {
                        "Strike": 5302.5,
                        "Call_Now": 69.73590815045418,
                        "Call_Sim": 102.60128032325656,
                        "Call_Chg": 47.12833466210239,
                        "Put_Now": 51.88062149508778,
                        "Put_Sim": 31.720993667890525,
                        "Put_Chg": -38.857722298307536
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5249.475,
                "options": [
                    {
                        "Strike": 5075.0,
                        "Call_Now": 247.63475910253237,
                        "Call_Sim": 198.2727489181225,
                        "Call_Chg": -19.933393180870745,
                        "Put_Now": 3.0455408515223894,
                        "Put_Sim": 6.70853066711112,
                        "Put_Chg": 120.27386904883228
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 101.58542606263063,
                        "Call_Sim": 68.75569804108045,
                        "Call_Chg": -32.317360170650474,
                        "Put_Now": 31.406924423653663,
                        "Put_Sim": 51.602196402103345,
                        "Put_Chg": 64.3019727307011
                    },
                    {
                        "Strike": 5302.5,
                        "Call_Now": 69.73590815045418,
                        "Call_Sim": 44.131909973258644,
                        "Call_Chg": -36.715658914135446,
                        "Put_Now": 51.88062149508778,
                        "Put_Sim": 79.30162331789188,
                        "Put_Chg": 52.85403496062669
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.20987729182028642,
            -0.5335222545528384,
            -0.5091972973787039,
            -0.11871683297854407,
            -0.2282869873161619,
            0.0019489694989479425
        ]
    },
    "delta_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5225.0,
            5250.0,
            5550.0
        ],
        "delta_values": [
            -119.71006459518874,
            -554.8865234301983,
            -840.6997387206951,
            -258.77494354942866,
            -567.7462319320834,
            1.9684673895388938
        ],
        "delta_cumulative": [
            -119.71006459518874,
            -674.5965880253871,
            -1515.2963267460823,
            -1774.0712702955109,
            -2341.8175022275946,
            -2339.8490348380556
        ]
    },
    "gamma_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5225.0,
            5250.0,
            5550.0
        ],
        "gamma_values": [
            4355145.395102862,
            15724471.042737028,
            20269516.919127416,
            5657611.751446889,
            29897821.736630928,
            32009.96937386594
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            5904975.187068478,
            32009.96937386594
        ],
        "gamma_put": [
            4355145.395102862,
            15724471.042737028,
            20269516.919127416,
            5657611.751446889,
            23992846.54956245,
            0.0
        ],
        "gamma_exposure": [
            4355145.395102862,
            20079616.437839888,
            40349133.3569673,
            46006745.10841419,
            75904566.84504512,
            75936576.81441899
        ]
    },
    "volume_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5225.0,
            5250.0,
            5550.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            950.0,
            10.0
        ],
        "put_volume": [
            2500.0,
            4395.0,
            4050.0,
            1000.0,
            3860.0,
            0.0
        ],
        "total_volume": [
            2500.0,
            4395.0,
            4050.0,
            1000.0,
            4810.0,
            10.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5225.0,
            5250.0,
            5550.0
        ],
        "iv_values": [
            11.01,
            11.01,
            11.01,
            11.01,
            11.01,
            11.01
        ],
        "skew": [
            0.0,
            0.0,
            0.0,
            0.0,
            -7.453889935837843e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5075.0,
            5150.0,
            5200.0,
            5225.0,
            5250.0,
            5550.0
        ],
        "charm": [
            -2585.8458214571924,
            -5838.079685135835,
            -4737.644070556462,
            -919.799684806967,
            -2742.099388218591,
            11.231410689323075
        ],
        "vanna": [
            -3674.7874313110274,
            -9190.277339926377,
            -8301.040635488678,
            -1826.458739291753,
            -7059.328912015701,
            22.60762308920089
        ],
        "vex": [
            343043.37051559036,
            1275420.9668732558,
            1596576.640237754,
            445635.2264306239,
            2354972.9364123596,
            5784.253482057808
        ],
        "theta": [
            -983.3995010776151,
            -3418.3956660768094,
            -4271.139240850184,
            -1166.0533497005856,
            -6985.438368696925,
            -10.186842636987885
        ],
        "charm_cum": [
            -2585.8458214571924,
            -8423.925506593027,
            -13161.569577149488,
            -14081.369261956455,
            -16823.468650175048,
            -16812.237239485723
        ],
        "vanna_cum": [
            -3674.7874313110274,
            -12865.064771237405,
            -21166.105406726085,
            -22992.564146017838,
            -30051.893058033536,
            -30029.285434944337
        ],
        "theta_cum": [
            -983.3995010776151,
            -4401.795167154424,
            -8672.934408004608,
            -9838.987757705194,
            -16824.42612640212,
            -16834.612969039106
        ],
        "r_gamma": [
            4355145.395102862,
            15724471.042737028,
            20269516.919127416,
            5657611.751446889,
            29897821.736630928,
            -32009.96937386594
        ],
        "r_gamma_cum": [
            4355145.395102862,
            20079616.437839888,
            40349133.3569673,
            46006745.10841419,
            75904566.84504512,
            75872556.87567125
        ]
    },
    "detailed_data": [
        {
            "strike": 5075.0,
            "delta": -119.71006459518874,
            "gamma": 4355145.395102862,
            "volume": 0,
            "oi": 2500,
            "iv": 11.01
        },
        {
            "strike": 5150.0,
            "delta": -554.8865234301983,
            "gamma": 15724471.042737028,
            "volume": 0,
            "oi": 4395,
            "iv": 11.01
        },
        {
            "strike": 5200.0,
            "delta": -840.6997387206951,
            "gamma": 20269516.919127416,
            "volume": 0,
            "oi": 4050,
            "iv": 11.01
        },
        {
            "strike": 5225.0,
            "delta": -258.77494354942866,
            "gamma": 5657611.751446889,
            "volume": 0,
            "oi": 1000,
            "iv": 11.01
        },
        {
            "strike": 5250.0,
            "delta": -567.7462319320834,
            "gamma": 29897821.736630928,
            "volume": 0,
            "oi": 4810,
            "iv": 11.01
        },
        {
            "strike": 5550.0,
            "delta": 1.9684673895388938,
            "gamma": 32009.96937386594,
            "volume": 0,
            "oi": 10,
            "iv": 11.01
        }
    ]
};