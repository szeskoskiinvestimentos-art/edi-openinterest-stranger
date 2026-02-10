window.marketData = {
    "last_updated": "2026-02-10 08:17:26",
    "spot_price": 5217.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 10/02/2026 08:17\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5128.51)\n  // 2 = Spline (5374.92)\n  // 3 = HVL (5132.11)\n  // 4 = HVL Log (5266.67)\n  // 5 = Sigma Kernel (5500.00)\n  // 6 = PVOP (5128.51)\n  // 7 = HVL Gaussian (5050.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5128.51;\n\n  if (ModeloFlip = 1) then GammaVal := 5128.51;\n  if (ModeloFlip = 2) then GammaVal := 5374.92;\n  if (ModeloFlip = 3) then GammaVal := 5132.11;\n  if (ModeloFlip = 4) then GammaVal := 5266.67;\n  if (ModeloFlip = 5) then GammaVal := 5500.00;\n  if (ModeloFlip = 6) then GammaVal := 5128.51;\n  if (ModeloFlip = 7) then GammaVal := 5050.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5050.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5175.59, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5258.41, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5429.59, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5450.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5450.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5500.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5500.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5676.47, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5700.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5289.08 > 0) then\n      HorizontalLineCustom(5289.08, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5225.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5425.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5475.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5600.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5183.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5266.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5419.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5430.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5469.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5480.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5576.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5623.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5132.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5317.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5438.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5461.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5488.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5547.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5652.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5224.83, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5209.17, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5232.65, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5201.35, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5247.18, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5186.82, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5255.01, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5178.99, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 13225,
        "total_volume": 13225,
        "gamma_exposure": 8264303.192893545,
        "delta_position": -308.4221113657955,
        "last_update": "2026-02-10T08:17:26.873655",
        "spot_price": 5217.0,
        "dealer_pressure": 0.3748338559822157,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5050.0,
        "gamma_flip_hvl": 5050.0,
        "gamma_flip_hvl_gaussian": 5050.0,
        "call_wall": 5450.0,
        "put_wall": 5500.0,
        "effective_call_wall": 5676.473175021988,
        "effective_put_wall": 5429.591836734694,
        "max_pain": 5450.0,
        "zero_gamma": 5128.514501233424,
        "range_low": 5175.591346230528,
        "range_high": 5258.408653769471,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5258.408653769472,
                "sigma_1_down": 5175.591346230528,
                "sigma_2_up": 5299.817307538944,
                "sigma_2_down": 5134.182692461056
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5309.592564685292,
                "sigma_1_down": 5124.407435314708,
                "sigma_2_up": 5402.185129370584,
                "sigma_2_down": 5031.814870629416
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 13.0,
                "sigma_1_up": 5366.301024413766,
                "sigma_1_down": 5067.698975586234,
                "sigma_2_up": 5515.602048827533,
                "sigma_2_down": 4918.397951172467
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
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0,
                5050.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4434.45,
                4466.3908163265305,
                4498.331632653061,
                4530.272448979592,
                4562.213265306123,
                4594.154081632652,
                4626.094897959183,
                4658.035714285714,
                4689.9765306122445,
                4721.917346938775,
                4753.858163265306,
                4785.7989795918365,
                4817.739795918367,
                4849.680612244898,
                4881.621428571429,
                4913.562244897959,
                4945.503061224489,
                4977.44387755102,
                5009.3846938775505,
                5041.325510204081,
                5073.266326530612,
                5105.207142857143,
                5137.147959183673,
                5169.088775510204,
                5201.029591836734,
                5232.970408163264,
                5264.911224489795,
                5296.852040816326,
                5328.7928571428565,
                5360.733673469387,
                5392.674489795918,
                5424.615306122449,
                5456.556122448979,
                5488.49693877551,
                5520.437755102041,
                5552.378571428571,
                5584.319387755101,
                5616.260204081632,
                5648.201020408163,
                5680.141836734693,
                5712.082653061224,
                5744.023469387755,
                5775.964285714285,
                5807.905102040816,
                5839.845918367346,
                5871.7867346938765,
                5903.727551020407,
                5935.668367346938,
                5967.609183673469,
                5999.549999999999
            ],
            "deltas": [
                -734.990040908161,
                -734.9801615011501,
                -734.9610242468125,
                -734.9243464050656,
                -734.8548823023386,
                -734.7253207016611,
                -734.4885008866077,
                -734.0666195239328,
                -733.3379866755054,
                -732.1233268305673,
                -730.1752679706259,
                -727.1757308397983,
                -722.745354023622,
                -716.4660023967715,
                -707.9117930587836,
                -696.6772346786463,
                -682.3855232782505,
                -664.6586779970205,
                -643.0360828686859,
                -616.8391626434944,
                -584.9948798221682,
                -545.8448842177978,
                -496.97497654292283,
                -435.0965770476312,
                -355.9969024971937,
                -254.55160235334435,
                -124.77257624600747,
                40.142001313378614,
                247.76770532507828,
                506.38819881723214,
                824.8081599431775,
                1211.9074253334502,
                1675.8103258334827,
                2222.6296450954023,
                2854.895072981065,
                3569.946862149097,
                4358.698978694994,
                5205.188973804743,
                6087.205312099044,
                6978.040850719265,
                7849.13541911114,
                8673.134119909108,
                9426.778669454277,
                10093.099018774099,
                10662.558444298113,
                11133.061537006522,
                11508.980706437063,
                11799.527559914655,
                12016.859518583602,
                12174.275360533273
            ],
            "flip_value": 5289.07729882623
        },
        "flow_sentiment": {
            "bull": [
                15.0,
                200.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -0.0,
                -200.0,
                -250.0,
                -380.0,
                -200.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4434.45,
                4466.3908163265305,
                4498.331632653061,
                4530.272448979592,
                4562.213265306123,
                4594.154081632652,
                4626.094897959183,
                4658.035714285714,
                4689.9765306122445,
                4721.917346938775,
                4753.858163265306,
                4785.7989795918365,
                4817.739795918367,
                4849.680612244898,
                4881.621428571429,
                4913.562244897959,
                4945.503061224489,
                4977.44387755102,
                5009.3846938775505,
                5041.325510204081,
                5073.266326530612,
                5105.207142857143,
                5137.147959183673,
                5169.088775510204,
                5201.029591836734,
                5232.970408163264,
                5264.911224489795,
                5296.852040816326,
                5328.7928571428565,
                5360.733673469387,
                5392.674489795918,
                5424.615306122449,
                5456.556122448979,
                5488.49693877551,
                5520.437755102041,
                5552.378571428571,
                5584.319387755101,
                5616.260204081632,
                5648.201020408163,
                5680.141836734693,
                5712.082653061224,
                5744.023469387755,
                5775.964285714285,
                5807.905102040816,
                5839.845918367346,
                5871.7867346938765,
                5903.727551020407,
                5935.668367346938,
                5967.609183673469,
                5999.549999999999
            ],
            "pnl": [
                -869932.0300622858,
                -832980.7368127719,
                -796029.5056751989,
                -759078.4422368297,
                -722127.8020322163,
                -685178.1616258285,
                -648230.734853535,
                -611287.9078084502,
                -574354.0625110952,
                -537436.7204887773,
                -500547.95194346446,
                -463705.8705830538,
                -426935.90632441244,
                -390271.488697789,
                -353753.86932252685,
                -317431.1274279688,
                -281356.937223131,
                -245590.33209877106,
                -210198.28634465736,
                -175263.20989949693,
                -140897.20522829262,
                -107264.07620394218,
                -74608.7045900671,
                -43291.82987348363,
                -13826.951548001874,
                13084.495322042872,
                36523.0749809714,
                55328.41307227709,
                68083.7795371679,
                73107.71356035833,
                68453.02576547503,
                51916.29306708637,
                21064.887690385833,
                -26708.24901053292,
                -94091.81434822961,
                -183719.81027973676,
                -297995.7091498099,
                -438893.376867509,
                -607762.0498334426,
                -805168.3932415681,
                -1030806.3297866011,
                -1283494.742707544,
                -1561266.9325422496,
                -1861538.3155512614,
                -2181325.015383824,
                -2517479.0789111047,
                -2866907.0761479395,
                -3226746.5022634193,
                -3594485.789807563,
                -3968025.5434183734
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5050.0,
                5400.0,
                5450.0,
                5500.0,
                5700.0
            ],
            "loss": [
                279000.0,
                62000.0,
                53250.0,
                98000.0,
                536000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5450.0,
                "options": [
                    {
                        "Strike": 5050.0,
                        "Call_Now": 187.79381282147096,
                        "Call_Sim": 413.14217091493447,
                        "Call_Chg": 119.99775429646043,
                        "Put_Now": 7.784803874917998,
                        "Put_Sim": 0.13316196838195715,
                        "Put_Chg": -98.28946277232501
                    },
                    {
                        "Strike": 5217.0,
                        "Call_Now": 66.44477467934303,
                        "Call_Sim": 249.84240171609054,
                        "Call_Chg": 276.01512372012587,
                        "Put_Now": 53.00556682307388,
                        "Put_Sim": 3.4031938598202487,
                        "Put_Chg": -93.57955387746405
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.152150199630455,
                        "Call_Sim": 69.41231014039067,
                        "Call_Chg": 1247.2493512586136,
                        "Put_Now": 224.11272470285712,
                        "Put_Sim": 55.37288464361791,
                        "Put_Chg": -75.29239595072757
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.440995910273557,
                        "Call_Sim": 46.13854397485011,
                        "Call_Chg": 1790.152448869915,
                        "Put_Now": 271.27276834472286,
                        "Put_Sim": 81.9703164092989,
                        "Put_Chg": -69.78306487987241
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5500.0,
                "options": [
                    {
                        "Strike": 5050.0,
                        "Call_Now": 187.79381282147096,
                        "Call_Sim": 463.0534049479684,
                        "Call_Chg": 146.57543184778783,
                        "Put_Now": 7.784803874917998,
                        "Put_Sim": 0.04439600141663558,
                        "Put_Chg": -99.42970944252461
                    },
                    {
                        "Strike": 5217.0,
                        "Call_Now": 66.44477467934303,
                        "Call_Sim": 297.97956897235326,
                        "Call_Chg": 348.4620053425991,
                        "Put_Now": 53.00556682307388,
                        "Put_Sim": 1.5403611160831758,
                        "Put_Chg": -97.09396350533386
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.152150199630455,
                        "Call_Sim": 99.60091926483119,
                        "Call_Chg": 1833.1912969457917,
                        "Put_Now": 224.11272470285712,
                        "Put_Sim": 35.56149376805752,
                        "Put_Chg": -84.1323183165047
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.440995910273557,
                        "Call_Sim": 70.0491203251654,
                        "Call_Chg": 2769.694292823094,
                        "Put_Now": 271.27276834472286,
                        "Put_Sim": 55.88089275961465,
                        "Put_Chg": -79.40047830801676
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5050.0,
                "options": [
                    {
                        "Strike": 5050.0,
                        "Call_Now": 187.79381282147096,
                        "Call_Sim": 64.31782866219737,
                        "Call_Chg": -65.75082656032865,
                        "Put_Now": 7.784803874917998,
                        "Put_Sim": 51.30881971564531,
                        "Put_Chg": 559.0894329522949
                    },
                    {
                        "Strike": 5217.0,
                        "Call_Now": 66.44477467934303,
                        "Call_Sim": 11.172814868311548,
                        "Call_Chg": -83.18481035983548,
                        "Put_Now": 53.00556682307388,
                        "Put_Sim": 164.73360701204092,
                        "Put_Chg": 210.78548327178845
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.152150199630455,
                        "Call_Sim": 0.23875398965778416,
                        "Call_Chg": -95.3659349901152,
                        "Put_Now": 224.11272470285712,
                        "Put_Sim": 386.1993284928849,
                        "Put_Chg": 72.32369514267094
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.440995910273557,
                        "Call_Sim": 0.08369349324480702,
                        "Call_Chg": -96.57133824384705,
                        "Put_Now": 271.27276834472286,
                        "Put_Sim": 435.9154659276928,
                        "Put_Chg": 60.692674236194776
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5269.17,
                "options": [
                    {
                        "Strike": 5050.0,
                        "Call_Now": 187.79381282147096,
                        "Call_Sim": 235.81542743454884,
                        "Call_Chg": 25.571457276247088,
                        "Put_Now": 7.784803874917998,
                        "Put_Sim": 3.6364184879971617,
                        "Put_Chg": -53.28824532479995
                    },
                    {
                        "Strike": 5217.0,
                        "Call_Now": 66.44477467934303,
                        "Call_Sim": 98.22560244619945,
                        "Call_Chg": 47.83043951947773,
                        "Put_Now": 53.00556682307388,
                        "Put_Sim": 32.61639458992954,
                        "Put_Chg": -38.466096025726706
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.152150199630455,
                        "Call_Sim": 10.74111643153276,
                        "Call_Chg": 108.47832488080765,
                        "Put_Now": 224.11272470285712,
                        "Put_Sim": 177.53169093476026,
                        "Put_Chg": -20.78464479420209
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.440995910273557,
                        "Call_Sim": 5.54216695099052,
                        "Call_Chg": 127.04531898906055,
                        "Put_Now": 271.27276834472286,
                        "Put_Sim": 222.2039393854402,
                        "Put_Chg": -18.088372547932234
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5164.83,
                "options": [
                    {
                        "Strike": 5050.0,
                        "Call_Now": 187.79381282147096,
                        "Call_Sim": 143.15982297917117,
                        "Call_Chg": -23.767550789722648,
                        "Put_Now": 7.784803874917998,
                        "Put_Sim": 15.320814032619296,
                        "Put_Chg": 96.80411065950817
                    },
                    {
                        "Strike": 5217.0,
                        "Call_Now": 66.44477467934303,
                        "Call_Sim": 41.82580146759187,
                        "Call_Chg": -37.05178222149188,
                        "Put_Now": 53.00556682307388,
                        "Put_Sim": 80.55659361132257,
                        "Put_Chg": 51.97760997483654
                    },
                    {
                        "Strike": 5450.0,
                        "Call_Now": 5.152150199630455,
                        "Call_Sim": 2.2318213108337943,
                        "Call_Chg": -56.681749864476494,
                        "Put_Now": 224.11272470285712,
                        "Put_Sim": 273.3623958140597,
                        "Put_Chg": 21.975401520150598
                    },
                    {
                        "Strike": 5500.0,
                        "Call_Now": 2.440995910273557,
                        "Call_Sim": 0.9665493761061157,
                        "Call_Chg": -60.403482363975094,
                        "Put_Now": 271.27276834472286,
                        "Put_Sim": 321.9683218105547,
                        "Put_Chg": 18.688036316793106
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.018417934797213955,
            0.3856165835941056,
            0.7573029191497554,
            0.43764956539611855,
            0.3721036593959903
        ]
    },
    "delta_data": {
        "strikes": [
            5050.0,
            5400.0,
            5450.0,
            5500.0,
            5700.0
        ],
        "delta_values": [
            -12.333901599744735,
            93.60177415249004,
            82.88927227557541,
            -486.9688983394046,
            14.389642145288335
        ],
        "delta_cumulative": [
            -12.333901599744735,
            81.2678725527453,
            164.15714482832072,
            -322.81175351108385,
            -308.4221113657955
        ]
    },
    "gamma_data": {
        "strikes": [
            5050.0,
            5400.0,
            5450.0,
            5500.0,
            5700.0
        ],
        "gamma_values": [
            370989.09235992446,
            1653785.9922199543,
            2712276.488316764,
            2704303.3125891825,
            822948.3074077201
        ],
        "gamma_call": [
            0.0,
            1653785.9922199543,
            2712276.488316764,
            1032813.2750923829,
            822948.3074077201
        ],
        "gamma_put": [
            370989.09235992446,
            0.0,
            0.0,
            1671490.0374967998,
            0.0
        ],
        "gamma_exposure": [
            370989.09235992446,
            2024775.0845798787,
            4737051.572896643,
            7441354.885485825,
            8264303.192893545
        ]
    },
    "volume_data": {
        "strikes": [
            5050.0,
            5400.0,
            5450.0,
            5500.0,
            5700.0
        ],
        "call_volume": [
            0.0,
            445.0,
            1070.0,
            675.0,
            10300.0
        ],
        "put_volume": [
            115.0,
            0.0,
            0.0,
            620.0,
            0.0
        ],
        "total_volume": [
            115.0,
            445.0,
            1070.0,
            1295.0,
            10300.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5050.0,
            5400.0,
            5450.0,
            5500.0,
            5700.0
        ],
        "iv_values": [
            12.6,
            12.6,
            12.6,
            12.6,
            12.6
        ],
        "skew": [
            0.0,
            4.336808689942018e-19,
            0.0,
            -2.710505431213761e-20,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5050.0,
            5400.0,
            5450.0,
            5500.0,
            5700.0
        ],
        "charm": [
            -212.70943697756024,
            866.3790155866982,
            2452.5179664796756,
            1848.0652956542715,
            1464.368067246479
        ],
        "vanna": [
            -203.86918362820919,
            802.370295742772,
            1779.8096189774915,
            2071.96264791871,
            1156.9042706968426
        ],
        "vex": [
            25160.85123294243,
            203710.14840958518,
            183949.30371413127,
            375252.1525267686,
            55813.177156698985
        ],
        "theta": [
            -108.98867004417872,
            -638.1195851361258,
            -976.1530806018909,
            -351.6144207791078,
            -285.2541614524237
        ],
        "charm_cum": [
            -212.70943697756024,
            653.669578609138,
            3106.1875450888137,
            4954.2528407430855,
            6418.620907989564
        ],
        "vanna_cum": [
            -203.86918362820919,
            598.5011121145628,
            2378.310731092054,
            4450.273379010764,
            5607.177649707606
        ],
        "theta_cum": [
            -108.98867004417872,
            -747.1082551803045,
            -1723.2613357821954,
            -2074.875756561303,
            -2360.129918013727
        ],
        "r_gamma": [
            370989.09235992446,
            -1653785.9922199543,
            -2712276.488316764,
            -2704303.3125891825,
            -822948.3074077201
        ],
        "r_gamma_cum": [
            370989.09235992446,
            -1282796.8998600298,
            -3995073.388176794,
            -6699376.700765977,
            -7522325.008173697
        ]
    },
    "detailed_data": [
        {
            "strike": 5050.0,
            "delta": -12.333901599744735,
            "gamma": 370989.09235992446,
            "volume": 0,
            "oi": 115,
            "iv": 12.6
        },
        {
            "strike": 5400.0,
            "delta": 93.60177415249004,
            "gamma": 1653785.9922199543,
            "volume": 0,
            "oi": 445,
            "iv": 12.6
        },
        {
            "strike": 5450.0,
            "delta": 82.88927227557541,
            "gamma": 2712276.488316764,
            "volume": 0,
            "oi": 1070,
            "iv": 12.6
        },
        {
            "strike": 5500.0,
            "delta": -486.9688983394046,
            "gamma": 2704303.3125891825,
            "volume": 0,
            "oi": 1295,
            "iv": 12.6
        },
        {
            "strike": 5700.0,
            "delta": 14.389642145288335,
            "gamma": 822948.3074077201,
            "volume": 0,
            "oi": 10300,
            "iv": 12.6
        }
    ]
};