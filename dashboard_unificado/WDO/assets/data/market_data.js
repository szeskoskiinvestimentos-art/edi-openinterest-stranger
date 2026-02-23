window.marketData = {
    "last_updated": "2026-02-23 09:10:12",
    "spot_price": 5186.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 23/02/2026 09:10\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5000.00)\n  // 2 = Spline (5000.00)\n  // 3 = HVL (5000.00)\n  // 4 = HVL Log (5000.00)\n  // 5 = Sigma Kernel (5000.00)\n  // 6 = PVOP (5000.00)\n  // 7 = HVL Gaussian (5000.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5000.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5000.00;\n  if (ModeloFlip = 2) then GammaVal := 5000.00;\n  if (ModeloFlip = 3) then GammaVal := 5000.00;\n  if (ModeloFlip = 4) then GammaVal := 5000.00;\n  if (ModeloFlip = 5) then GammaVal := 5000.00;\n  if (ModeloFlip = 6) then GammaVal := 5000.00;\n  if (ModeloFlip = 7) then GammaVal := 5000.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5050.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5106.84, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5142.88, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5150.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5229.12, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5275.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5292.92, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5300.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5323.53 > 0) then\n      HorizontalLineCustom(5323.53, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5025.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5200.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5262.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5287.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5019.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5030.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5211.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5259.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5265.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5284.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5290.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5011.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5038.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5073.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5126.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5173.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5226.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5255.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5294.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5193.78, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5178.22, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5201.56, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5170.44, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5216.00, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5156.00, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5223.78, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5148.22, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 11765,
        "total_volume": 11765,
        "gamma_exposure": 51468765.15904607,
        "delta_position": -2844.689357031828,
        "last_update": "2026-02-23T09:10:12.447683",
        "spot_price": 5186.0,
        "dealer_pressure": -0.07218775534448241,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5000.0,
        "gamma_flip_hvl": 5000.0,
        "gamma_flip_hvl_gaussian": 5000.0,
        "call_wall": 5300.0,
        "put_wall": 5150.0,
        "effective_call_wall": 5292.92343387471,
        "effective_put_wall": 5106.843800322061,
        "max_pain": 5250.0,
        "zero_gamma": 5000.0,
        "range_low": 5142.877277345431,
        "range_high": 5229.122722654569,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5229.122722654569,
                "sigma_1_down": 5142.877277345431,
                "sigma_2_up": 5272.245445309138,
                "sigma_2_down": 5099.754554690862
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5282.425339230486,
                "sigma_1_down": 5089.574660769514,
                "sigma_2_up": 5378.850678460972,
                "sigma_2_down": 4993.149321539028
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 4.0,
                "sigma_1_up": 5272.245445309138,
                "sigma_1_down": 5099.754554690862,
                "sigma_2_up": 5358.490890618275,
                "sigma_2_down": 5013.509109381725
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
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0,
                5000.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4408.099999999999,
                4439.851020408163,
                4471.602040816326,
                4503.3530612244895,
                4535.104081632652,
                4566.855102040816,
                4598.6061224489795,
                4630.357142857142,
                4662.108163265306,
                4693.859183673469,
                4725.610204081632,
                4757.361224489796,
                4789.112244897959,
                4820.863265306122,
                4852.614285714285,
                4884.365306122449,
                4916.116326530611,
                4947.867346938775,
                4979.618367346939,
                5011.369387755101,
                5043.120408163265,
                5074.871428571429,
                5106.622448979591,
                5138.373469387755,
                5170.124489795918,
                5201.875510204081,
                5233.626530612244,
                5265.377551020408,
                5297.128571428571,
                5328.879591836734,
                5360.630612244898,
                5392.3816326530605,
                5424.132653061224,
                5455.883673469387,
                5487.6346938775505,
                5519.385714285714,
                5551.136734693877,
                5582.8877551020405,
                5614.638775510204,
                5646.389795918367,
                5678.1408163265305,
                5709.891836734693,
                5741.642857142857,
                5773.39387755102,
                5805.144897959183,
                5836.895918367347,
                5868.64693877551,
                5900.397959183673,
                5932.148979591837,
                5963.9
            ],
            "deltas": [
                -9502.525321643727,
                -9497.133215519572,
                -9488.478262539436,
                -9474.99202770121,
                -9454.577226630146,
                -9424.535109247588,
                -9381.527705976683,
                -9321.593696758822,
                -9240.234864826245,
                -9132.584681119502,
                -8993.661598701521,
                -8818.697987163307,
                -8603.522933102153,
                -8344.965505093383,
                -8041.236663688101,
                -7692.244048721725,
                -7299.793084213483,
                -6867.623323013468,
                -6401.206020140725,
                -5907.174029406606,
                -5392.194777414274,
                -4861.161712615427,
                -4314.9967085433545,
                -3749.20255688974,
                -3155.059760346483,
                -2524.853285351168,
                -1859.9860150324903,
                -1177.5526124746298,
                -510.08278519143187,
                103.2400886346918,
                629.6725496688837,
                1052.9399821001193,
                1375.2335951937948,
                1611.815789322452,
                1782.840823905194,
                1906.904703256387,
                1998.1356337993573,
                2066.1282608013507,
                2117.1403955466403,
                2155.36297767609,
                2183.7934415876007,
                2204.712230913182,
                2219.9125287156717,
                2230.8133265114034,
                2238.527618152373,
                2243.91518707052,
                2247.62888597025,
                2250.1558845866493,
                2251.8535708421678,
                2252.9798181940328
            ],
            "flip_value": 5323.534971081386
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                330.0,
                330.0,
                10.0,
                0.0,
                0.0
            ],
            "bear": [
                -10.0,
                -0.0,
                -0.0,
                -100.0,
                -200.0,
                -50.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4408.099999999999,
                4439.851020408163,
                4471.602040816326,
                4503.3530612244895,
                4535.104081632652,
                4566.855102040816,
                4598.6061224489795,
                4630.357142857142,
                4662.108163265306,
                4693.859183673469,
                4725.610204081632,
                4757.361224489796,
                4789.112244897959,
                4820.863265306122,
                4852.614285714285,
                4884.365306122449,
                4916.116326530611,
                4947.867346938775,
                4979.618367346939,
                5011.369387755101,
                5043.120408163265,
                5074.871428571429,
                5106.622448979591,
                5138.373469387755,
                5170.124489795918,
                5201.875510204081,
                5233.626530612244,
                5265.377551020408,
                5297.128571428571,
                5328.879591836734,
                5360.630612244898,
                5392.3816326530605,
                5424.132653061224,
                5455.883673469387,
                5487.6346938775505,
                5519.385714285714,
                5551.136734693877,
                5582.8877551020405,
                5614.638775510204,
                5646.389795918367,
                5678.1408163265305,
                5709.891836734693,
                5741.642857142857,
                5773.39387755102,
                5805.144897959183,
                5836.895918367347,
                5868.64693877551,
                5900.397959183673,
                5932.148979591837,
                5963.9
            ],
            "pnl": [
                -8235026.91870214,
                -7861221.552219178,
                -7487416.185736446,
                -7113610.819257497,
                -6739805.4528330155,
                -6366000.087054988,
                -5992194.7276512245,
                -5618389.420677142,
                -5244584.475015106,
                -4870781.624655541,
                -4496989.044692418,
                -4123239.2057799096,
                -3749641.071381076,
                -3376504.3426973554,
                -3004576.0736452797,
                -2635387.7959733736,
                -2271609.918015943,
                -1917202.2930830815,
                -1577154.2733727915,
                -1256797.8617753412,
                -960949.9159455003,
                -693258.8593896816,
                -455977.24841764034,
                -250100.25298826696,
                -75646.39177720793,
                68118.44362021174,
                182608.71861246138,
                269994.0925314827,
                333315.38436820667,
                376461.7572571769,
                403873.95396954234,
                420012.20523423475,
                428795.03985839477,
                433233.79727701505,
                435358.09266730526,
                436371.9483652096,
                436906.3567703975,
                437254.4696739209,
                437537.4065102,
                437799.797176601,
                438056.3460784841,
                438311.3953111946,
                438566.0965348667,
                438820.7246679623,
                439075.33889002807,
                439329.95070967067,
                439584.5621523418,
                439839.1735411965,
                440093.784923053,
                440348.3963040771
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5000.0,
                5050.0,
                5150.0,
                5250.0,
                5275.0,
                5300.0
            ],
            "loss": [
                1088500.0,
                693000.0,
                170000.0,
                0.0,
                7625.0,
                17750.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5300.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 190.33140683412785,
                        "Call_Sim": 303.97075266066804,
                        "Call_Chg": 59.70603996300825,
                        "Put_Now": 0.36472715332391914,
                        "Put_Sim": 0.004072979863932513,
                        "Put_Chg": -98.88328032974412
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 57.98088918728672,
                        "Call_Sim": 155.40870689372605,
                        "Call_Chg": 168.03436282553943,
                        "Put_Now": 17.89520911605905,
                        "Put_Sim": 1.3230268224989175,
                        "Put_Chg": -92.60680993489122
                    },
                    {
                        "Strike": 5186.0,
                        "Call_Now": 36.48918621168059,
                        "Call_Sim": 121.63850145902688,
                        "Call_Chg": 233.35493083726013,
                        "Put_Now": 32.374946046750665,
                        "Put_Sim": 3.52426129409605,
                        "Put_Chg": -89.11423268781087
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 4.319547356870544,
                        "Call_Sim": 37.29130098764108,
                        "Call_Chg": 763.3150167534717,
                        "Put_Now": 114.11486689521917,
                        "Put_Sim": 33.08662052598902,
                        "Put_Chg": -71.00586327952402
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5150.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 190.33140683412785,
                        "Call_Sim": 155.09683933246743,
                        "Call_Chg": -18.512219337698184,
                        "Put_Now": 0.36472715332391914,
                        "Put_Sim": 1.130159651664087,
                        "Put_Chg": 209.8644127163126
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 57.98088918728672,
                        "Call_Sim": 36.23588680874582,
                        "Call_Chg": -37.503740772759414,
                        "Put_Now": 17.89520911605905,
                        "Put_Sim": 32.15020673751769,
                        "Put_Chg": 79.65817850469429
                    },
                    {
                        "Strike": 5186.0,
                        "Call_Now": 36.48918621168059,
                        "Call_Sim": 20.664394091813392,
                        "Call_Chg": -43.36844353849006,
                        "Put_Now": 32.374946046750665,
                        "Put_Sim": 52.55015392688256,
                        "Put_Chg": 62.31734826985694
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 4.319547356870544,
                        "Call_Sim": 1.672838168651225,
                        "Call_Chg": -61.27283646999591,
                        "Put_Now": 114.11486689521917,
                        "Put_Sim": 147.46815770699868,
                        "Put_Chg": 29.227822560932985
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 190.33140683412785,
                        "Call_Sim": 35.1804726298501,
                        "Call_Chg": -81.51620207351823,
                        "Put_Now": 0.36472715332391914,
                        "Put_Sim": 31.213792949046365,
                        "Put_Chg": 8458.121506606056
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 57.98088918728672,
                        "Call_Sim": 1.4345573942415228,
                        "Call_Chg": -97.52580994470834,
                        "Put_Now": 17.89520911605905,
                        "Put_Sim": 147.34887732301377,
                        "Put_Chg": 723.3984658541028
                    },
                    {
                        "Strike": 5186.0,
                        "Call_Now": 36.48918621168059,
                        "Call_Sim": 0.47837516600257857,
                        "Call_Chg": -98.68899469769636,
                        "Put_Now": 32.374946046750665,
                        "Put_Sim": 182.3641350010712,
                        "Put_Chg": 463.2878422028267
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 4.319547356870544,
                        "Call_Sim": 0.005955816435129435,
                        "Call_Chg": -99.86211943189704,
                        "Put_Now": 114.11486689521917,
                        "Put_Sim": 295.8012753547828,
                        "Put_Chg": 159.21361817508753
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5237.86,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 190.33140683412785,
                        "Call_Sim": 241.88280979160572,
                        "Call_Chg": 27.085074300115096,
                        "Put_Now": 0.36472715332391914,
                        "Put_Sim": 0.05613011080151509,
                        "Put_Chg": -84.61038332628195
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 57.98088918728672,
                        "Call_Sim": 98.29287012302666,
                        "Call_Chg": 69.52632410573484,
                        "Put_Now": 17.89520911605905,
                        "Put_Sim": 6.347190051798975,
                        "Put_Chg": -64.53134461500622
                    },
                    {
                        "Strike": 5186.0,
                        "Call_Now": 36.48918621168059,
                        "Call_Sim": 69.52424710873856,
                        "Call_Chg": 90.53383845124803,
                        "Put_Now": 32.374946046750665,
                        "Put_Sim": 13.550006943808512,
                        "Put_Chg": -58.146626949611644
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 4.319547356870544,
                        "Call_Sim": 13.351877341315685,
                        "Call_Chg": 209.10362216722973,
                        "Put_Now": 114.11486689521917,
                        "Put_Sim": 71.28719687966395,
                        "Put_Chg": -37.53031588327557
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5134.14,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 190.33140683412785,
                        "Call_Sim": 139.88841422384394,
                        "Call_Chg": -26.502716209230005,
                        "Put_Now": 0.36472715332391914,
                        "Put_Sim": 1.7817345430401872,
                        "Put_Chg": 388.5116248687425
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 57.98088918728672,
                        "Call_Sim": 28.53737565685833,
                        "Call_Chg": -50.78141081162373,
                        "Put_Now": 17.89520911605905,
                        "Put_Sim": 40.31169558562988,
                        "Put_Chg": 125.2652948852909
                    },
                    {
                        "Strike": 5186.0,
                        "Call_Now": 36.48918621168059,
                        "Call_Sim": 15.516180166233653,
                        "Call_Chg": -57.47731923583773,
                        "Put_Now": 32.374946046750665,
                        "Put_Sim": 63.261940001303174,
                        "Put_Chg": 95.40400132235125
                    },
                    {
                        "Strike": 5300.0,
                        "Call_Now": 4.319547356870544,
                        "Call_Sim": 1.0517156670913437,
                        "Call_Chg": -75.65217880020424,
                        "Put_Now": 114.11486689521917,
                        "Put_Sim": 162.70703520543884,
                        "Put_Chg": 42.581803433935775
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.15846441118382226,
            -0.24465500688949085,
            -0.15670133041983142,
            0.1584592494972469,
            0.04042272227348567,
            0.6304488992347407
        ]
    },
    "delta_data": {
        "strikes": [
            5000.0,
            5050.0,
            5150.0,
            5250.0,
            5275.0,
            5300.0
        ],
        "delta_values": [
            -252.1819228922933,
            -591.6334880726657,
            -1339.1391287423723,
            -873.370200014718,
            16.673559697884137,
            194.9618229923371
        ],
        "delta_cumulative": [
            -252.1819228922933,
            -843.815410964959,
            -2182.9545397073316,
            -3056.3247397220493,
            -3039.651180024165,
            -2844.689357031828
        ]
    },
    "gamma_data": {
        "strikes": [
            5000.0,
            5050.0,
            5150.0,
            5250.0,
            5275.0,
            5300.0
        ],
        "gamma_values": [
            4545848.882478328,
            9376280.137905538,
            15841881.037005974,
            10812696.315164931,
            751386.2040910621,
            10140672.582400234
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            2900195.5114699313,
            751386.2040910621,
            10140672.582400234
        ],
        "gamma_put": [
            4545848.882478328,
            9376280.137905538,
            15841881.037005974,
            7912500.803694999,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            4545848.882478328,
            13922129.020383867,
            29764010.05738984,
            40576706.37255477,
            41328092.576645836,
            51468765.15904607
        ]
    },
    "volume_data": {
        "strikes": [
            5000.0,
            5050.0,
            5150.0,
            5250.0,
            5275.0,
            5300.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            305.0,
            100.0,
            1850.0
        ],
        "put_volume": [
            1600.0,
            2680.0,
            3530.0,
            1700.0,
            0.0,
            0.0
        ],
        "total_volume": [
            1600.0,
            2680.0,
            3530.0,
            2005.0,
            100.0,
            1850.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5000.0,
            5050.0,
            5150.0,
            5250.0,
            5275.0,
            5300.0
        ],
        "iv_values": [
            13.200000000000001,
            13.200000000000001,
            13.200000000000001,
            13.200000000000001,
            13.200000000000001,
            13.200000000000001
        ],
        "skew": [
            0.0,
            -2.168404344971009e-19,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5000.0,
            5050.0,
            5150.0,
            5250.0,
            5275.0,
            5300.0
        ],
        "charm": [
            -1343.2078051389417,
            -1866.1870931412338,
            -140.29258812387206,
            3876.7284329743625,
            861.1552351368043,
            14501.949167655117
        ],
        "vanna": [
            -2809.621345373738,
            -4390.925529738568,
            -2709.7774539643674,
            1476.0600515484377,
            186.29615123904512,
            3232.1172827966084
        ],
        "vex": [
            642131.8932472692,
            1324462.9709924706,
            2237772.8177679153,
            1180720.7385358536,
            16328.98186612523,
            220375.16500403956
        ],
        "theta": [
            -1364.6594083502696,
            -2738.1923835920034,
            -4260.911523539027,
            -2941.3822981349067,
            -286.4341923528466,
            -3835.214201024599
        ],
        "charm_cum": [
            -1343.2078051389417,
            -3209.3948982801758,
            -3349.687486404048,
            527.0409465703146,
            1388.196181707119,
            15890.145349362236
        ],
        "vanna_cum": [
            -2809.621345373738,
            -7200.546875112306,
            -9910.324329076673,
            -8434.264277528235,
            -8247.96812628919,
            -5015.850843492582
        ],
        "theta_cum": [
            -1364.6594083502696,
            -4102.851791942273,
            -8363.763315481301,
            -11305.145613616209,
            -11591.579805969055,
            -15426.794006993654
        ],
        "r_gamma": [
            4545848.882478328,
            9376280.137905538,
            15841881.037005974,
            -10812696.315164931,
            -751386.2040910621,
            -10140672.582400234
        ],
        "r_gamma_cum": [
            4545848.882478328,
            13922129.020383867,
            29764010.05738984,
            18951313.74222491,
            18199927.53813385,
            8059254.955733614
        ]
    },
    "detailed_data": [
        {
            "strike": 5000.0,
            "delta": -252.1819228922933,
            "gamma": 4545848.882478328,
            "volume": 0,
            "oi": 1600,
            "iv": 13.200000000000001
        },
        {
            "strike": 5050.0,
            "delta": -591.6334880726657,
            "gamma": 9376280.137905538,
            "volume": 0,
            "oi": 2680,
            "iv": 13.200000000000001
        },
        {
            "strike": 5150.0,
            "delta": -1339.1391287423723,
            "gamma": 15841881.037005974,
            "volume": 0,
            "oi": 3530,
            "iv": 13.200000000000001
        },
        {
            "strike": 5250.0,
            "delta": -873.370200014718,
            "gamma": 10812696.315164931,
            "volume": 0,
            "oi": 2005,
            "iv": 13.200000000000001
        },
        {
            "strike": 5275.0,
            "delta": 16.673559697884137,
            "gamma": 751386.2040910621,
            "volume": 0,
            "oi": 100,
            "iv": 13.200000000000001
        },
        {
            "strike": 5300.0,
            "delta": 194.9618229923371,
            "gamma": 10140672.582400234,
            "volume": 0,
            "oi": 1850,
            "iv": 13.200000000000001
        }
    ]
};