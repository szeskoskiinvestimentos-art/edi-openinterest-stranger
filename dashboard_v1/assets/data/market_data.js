window.marketData = {
    "last_updated": "2026-02-13 14:33:21",
    "spot_price": 5228.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 13/02/2026 14:33\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5226.91)\n  // 2 = Spline (5225.63)\n  // 3 = HVL (5203.84)\n  // 4 = HVL Log (5101.11)\n  // 5 = Sigma Kernel (5100.31)\n  // 6 = PVOP (5226.91)\n  // 7 = HVL Gaussian (5187.43)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5226.91;\n\n  if (ModeloFlip = 1) then GammaVal := 5226.91;\n  if (ModeloFlip = 2) then GammaVal := 5225.63;\n  if (ModeloFlip = 3) then GammaVal := 5203.84;\n  if (ModeloFlip = 4) then GammaVal := 5101.11;\n  if (ModeloFlip = 5) then GammaVal := 5100.31;\n  if (ModeloFlip = 6) then GammaVal := 5226.91;\n  if (ModeloFlip = 7) then GammaVal := 5187.43;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5100.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5162.79, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5192.01, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5264.99, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5350.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5393.85, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5326.13 > 0) then\n      HorizontalLineCustom(5326.13, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5157.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5192.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5135.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5214.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5236.34, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5220.66, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5244.19, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5212.81, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5258.75, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5198.25, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5266.59, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5190.41, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 9390,
        "total_volume": 9390,
        "gamma_exposure": 39705072.44993094,
        "delta_position": -1506.9218308620623,
        "last_update": "2026-02-13T14:33:21.210961",
        "spot_price": 5228.5,
        "dealer_pressure": 0.11451054612866274,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5100.0,
        "gamma_flip_hvl": 5100.0,
        "gamma_flip_hvl_gaussian": 5187.428511620089,
        "call_wall": 5350.0,
        "put_wall": 5100.0,
        "effective_call_wall": 5393.852459016393,
        "effective_put_wall": 5162.790697674419,
        "max_pain": 5250.0,
        "zero_gamma": 5226.911330443022,
        "range_low": 5192.006408836356,
        "range_high": 5264.993591163644,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5264.993591163644,
                "sigma_1_down": 5192.006408836356,
                "sigma_2_up": 5301.487182327288,
                "sigma_2_down": 5155.512817672712
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5310.102150584994,
                "sigma_1_down": 5146.897849415006,
                "sigma_2_up": 5391.704301169988,
                "sigma_2_down": 5065.295698830012
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 10.0,
                "sigma_1_up": 5343.90286807611,
                "sigma_1_down": 5113.09713192389,
                "sigma_2_up": 5459.305736152221,
                "sigma_2_down": 4997.694263847779
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
                4444.224999999999,
                4476.236224489795,
                4508.247448979591,
                4540.258673469387,
                4572.269897959183,
                4604.281122448979,
                4636.292346938775,
                4668.303571428571,
                4700.314795918367,
                4732.326020408163,
                4764.337244897959,
                4796.348469387754,
                4828.359693877551,
                4860.370918367346,
                4892.382142857143,
                4924.393367346938,
                4956.404591836734,
                4988.41581632653,
                5020.427040816327,
                5052.438265306122,
                5084.4494897959175,
                5116.460714285714,
                5148.471938775509,
                5180.483163265306,
                5212.494387755101,
                5244.505612244898,
                5276.516836734693,
                5308.52806122449,
                5340.539285714285,
                5372.550510204082,
                5404.561734693877,
                5436.572959183673,
                5468.584183673469,
                5500.595408163264,
                5532.606632653061,
                5564.617857142857,
                5596.629081632653,
                5628.640306122448,
                5660.651530612245,
                5692.66275510204,
                5724.6739795918365,
                5756.685204081632,
                5788.696428571428,
                5820.707653061224,
                5852.71887755102,
                5884.730102040816,
                5916.741326530611,
                5948.752551020408,
                5980.763775510204,
                6012.775
            ],
            "deltas": [
                -6448.13570561935,
                -6446.4668550909655,
                -6443.53001491852,
                -6438.540860994683,
                -6430.352031982038,
                -6417.355585101142,
                -6397.394223510206,
                -6367.700252453841,
                -6324.8844643859,
                -6264.996856999542,
                -6183.676021404301,
                -6076.393812074635,
                -5938.787254275506,
                -5767.052313598634,
                -5558.356439189252,
                -5311.210922812476,
                -5025.73221263788,
                -4703.716714451874,
                -4348.4632950092855,
                -3964.3133180676673,
                -3555.950689077801,
                -3127.6106274216404,
                -2682.4516690685737,
                -2222.38541825909,
                -1748.5669954983807,
                -1262.5138678474646,
                -767.5216006419553,
                -269.83173436050186,
                220.98585954315945,
                692.7188412336357,
                1132.1540377442252,
                1527.2084725476004,
                1868.9222771214993,
                2152.765851029291,
                2378.9739905032934,
                2551.9390760694637,
                2678.9528702912744,
                2768.7066944218113,
                2829.930929067596,
                2870.42034194697,
                2896.5227688813166,
                2913.0301907295407,
                2923.3381060573915,
                2929.731053220798,
                2933.6858578709935,
                2936.131236984225,
                2937.642407107022,
                2938.57407749336,
                2939.145652088555,
                2939.4936622469445
            ],
            "flip_value": 5326.126542473678
        },
        "flow_sentiment": {
            "bull": [
                400.0,
                0.0,
                0.0,
                100.0
            ],
            "bear": [
                -0.0,
                -500.0,
                -100.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4444.224999999999,
                4476.236224489795,
                4508.247448979591,
                4540.258673469387,
                4572.269897959183,
                4604.281122448979,
                4636.292346938775,
                4668.303571428571,
                4700.314795918367,
                4732.326020408163,
                4764.337244897959,
                4796.348469387754,
                4828.359693877551,
                4860.370918367346,
                4892.382142857143,
                4924.393367346938,
                4956.404591836734,
                4988.41581632653,
                5020.427040816327,
                5052.438265306122,
                5084.4494897959175,
                5116.460714285714,
                5148.471938775509,
                5180.483163265306,
                5212.494387755101,
                5244.505612244898,
                5276.516836734693,
                5308.52806122449,
                5340.539285714285,
                5372.550510204082,
                5404.561734693877,
                5436.572959183673,
                5468.584183673469,
                5500.595408163264,
                5532.606632653061,
                5564.617857142857,
                5596.629081632653,
                5628.640306122448,
                5660.651530612245,
                5692.66275510204,
                5724.6739795918365,
                5756.685204081632,
                5788.696428571428,
                5820.707653061224,
                5852.71887755102,
                5884.730102040816,
                5916.741326530611,
                5948.752551020408,
                5980.763775510204,
                6012.775
            ],
            "pnl": [
                -5420879.736934459,
                -5171466.070104938,
                -4922052.404229526,
                -4672638.744031806,
                -4423225.1139988955,
                -4173811.6273765536,
                -3924398.7522360086,
                -3674988.2205784544,
                -3425585.779099828,
                -3176208.549709353,
                -2926902.401190465,
                -2677777.947711067,
                -2429075.5439873924,
                -2181266.141210361,
                -1935182.299847294,
                -1692152.321424385,
                -1454088.7629977409,
                -1223475.9460364482,
                -1003222.5787929796,
                -796393.1276508971,
                -605882.7973692394,
                -434125.2817102318,
                -282903.39179950993,
                -153282.38080402836,
                -45636.71291565738,
                40278.94247696796,
                105250.98989169198,
                150530.43681809088,
                177750.75218749128,
                188831.58686978824,
                185869.78132641703,
                171027.57594256848,
                146429.08973607403,
                114072.12301023107,
                75758.36535888212,
                33043.81329136051,
                -12788.531312754727,
                -60732.31343627779,
                -110039.21037062083,
                -160183.15413479495,
                -210815.1937359796,
                -261717.18649855128,
                -312760.6849580888,
                -363874.4561854667,
                -415021.2851949205,
                -466182.8466142382,
                -517350.6295969958,
                -568520.9032611895,
                -619692.1225928135,
                -670863.6826461802
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5100.0,
                5250.0,
                5350.0,
                5450.0
            ],
            "loss": [
                405000.0,
                0.0,
                50000.0,
                237000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.77342143537044,
                        "Call_Sim": 260.5854629716496,
                        "Call_Chg": 79.99537510963627,
                        "Put_Now": 6.164405917955378,
                        "Put_Sim": 0.47644745423506407,
                        "Put_Chg": -92.27099155090855
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 51.36008080668262,
                        "Call_Sim": 139.392257960425,
                        "Call_Chg": 171.4019444110537,
                        "Put_Now": 40.99635774142689,
                        "Put_Sim": 7.5285348951694,
                        "Put_Chg": -81.63608839923405
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.659048513691687,
                        "Call_Sim": 52.55358751377071,
                        "Call_Chg": 393.04201445621476,
                        "Put_Now": 121.55449301993303,
                        "Put_Sim": 41.9490320200116,
                        "Put_Chg": -65.48952574452956
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.77342143537044,
                        "Call_Sim": 50.09781239630502,
                        "Call_Chg": -65.3957115196938,
                        "Put_Now": 6.164405917955378,
                        "Put_Sim": 39.98879687888984,
                        "Put_Chg": 548.7047967171086
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 51.36008080668262,
                        "Call_Sim": 8.827752689246381,
                        "Call_Chg": -82.81203504629656,
                        "Put_Now": 40.99635774142689,
                        "Put_Sim": 126.96402962399134,
                        "Put_Chg": 209.69587694785372
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.659048513691687,
                        "Call_Sim": 0.7908426898915621,
                        "Call_Chg": -92.58055079798432,
                        "Put_Now": 121.55449301993303,
                        "Put_Sim": 240.18628719613207,
                        "Put_Chg": 97.59556494283208
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.77342143537044,
                        "Call_Sim": 50.09781239630502,
                        "Call_Chg": -65.3957115196938,
                        "Put_Now": 6.164405917955378,
                        "Put_Sim": 39.98879687888984,
                        "Put_Chg": 548.7047967171086
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 51.36008080668262,
                        "Call_Sim": 8.827752689246381,
                        "Call_Chg": -82.81203504629656,
                        "Put_Now": 40.99635774142689,
                        "Put_Sim": 126.96402962399134,
                        "Put_Chg": 209.69587694785372
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.659048513691687,
                        "Call_Sim": 0.7908426898915621,
                        "Call_Chg": -92.58055079798432,
                        "Put_Now": 121.55449301993303,
                        "Put_Sim": 240.18628719613207,
                        "Put_Chg": 97.59556494283208
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5280.785,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.77342143537044,
                        "Call_Sim": 193.1547971891623,
                        "Call_Chg": 33.41868643713047,
                        "Put_Now": 6.164405917955378,
                        "Put_Sim": 2.2607816717470257,
                        "Put_Chg": -63.32523033303287
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 51.36008080668262,
                        "Call_Sim": 84.14374061932858,
                        "Call_Chg": 63.83101291456765,
                        "Put_Now": 40.99635774142689,
                        "Put_Sim": 21.495017554073456,
                        "Put_Chg": -47.56847013179246
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.659048513691687,
                        "Call_Sim": 23.178586779592933,
                        "Call_Chg": 117.45455750407494,
                        "Put_Now": 121.55449301993303,
                        "Put_Sim": 81.78903128583443,
                        "Put_Chg": -32.71410274203331
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5176.215,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 144.77342143537044,
                        "Call_Sim": 100.87928927335224,
                        "Call_Chg": -30.31919238132626,
                        "Put_Now": 6.164405917955378,
                        "Put_Sim": 14.555273755936696,
                        "Put_Chg": 136.11802904706215
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 51.36008080668262,
                        "Call_Sim": 27.823879657920088,
                        "Call_Chg": -45.82586471651377,
                        "Put_Now": 40.99635774142689,
                        "Put_Sim": 69.7451565926649,
                        "Put_Chg": 70.125251205395
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.659048513691687,
                        "Call_Sim": 4.1965110758592346,
                        "Call_Chg": -60.62959024467558,
                        "Put_Now": 121.55449301993303,
                        "Put_Sim": 167.37695558209998,
                        "Put_Chg": 37.697053744161295
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.32790981219103527,
            0.05603145599989477,
            0.5343136190366833,
            0.19560692166910815
        ]
    },
    "delta_data": {
        "strikes": [
            5100.0,
            5250.0,
            5350.0,
            5450.0
        ],
        "delta_values": [
            -782.7915517274025,
            -1002.2874385869646,
            237.8942618040693,
            40.26289764823575
        ],
        "delta_cumulative": [
            -782.7915517274025,
            -1785.0789903143673,
            -1547.184728510298,
            -1506.9218308620623
        ]
    },
    "gamma_data": {
        "strikes": [
            5100.0,
            5250.0,
            5350.0,
            5450.0
        ],
        "gamma_values": [
            13637980.85053173,
            16119105.5238223,
            7960643.952812394,
            1987342.1227645224
        ],
        "gamma_call": [
            0.0,
            2518610.2380972346,
            7960643.952812394,
            1987342.1227645224
        ],
        "gamma_put": [
            13637980.85053173,
            13600495.285725066,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            13637980.85053173,
            29757086.37435403,
            37717730.32716642,
            39705072.44993094
        ]
    },
    "volume_data": {
        "strikes": [
            5100.0,
            5250.0,
            5350.0,
            5450.0
        ],
        "call_volume": [
            0.0,
            500.0,
            1370.0,
            1070.0
        ],
        "put_volume": [
            3750.0,
            2700.0,
            0.0,
            0.0
        ],
        "total_volume": [
            3750.0,
            3200.0,
            1370.0,
            1070.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5100.0,
            5250.0,
            5350.0,
            5450.0
        ],
        "iv_values": [
            11.08,
            11.08,
            11.08,
            11.08
        ],
        "skew": [
            0.0,
            1.0842021724855044e-19,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5100.0,
            5250.0,
            5350.0,
            5450.0
        ],
        "charm": [
            -1908.1043366269853,
            1426.2385959700332,
            5065.184576661547,
            2182.3898102855082
        ],
        "vanna": [
            -7518.07670386368,
            -431.9210394108985,
            3052.634328769188,
            1414.1857153348483
        ],
        "vex": [
            2006533.3492754723,
            2371577.079372339,
            366011.3286767127,
            91373.2274926407
        ],
        "theta": [
            -2643.2779357061004,
            -3016.265965875131,
            -2271.5970567774843,
            -547.6105812742604
        ],
        "charm_cum": [
            -1908.1043366269853,
            -481.8657406569521,
            4583.318836004595,
            6765.708646290103
        ],
        "vanna_cum": [
            -7518.07670386368,
            -7949.997743274579,
            -4897.363414505391,
            -3483.177699170543
        ],
        "theta_cum": [
            -2643.2779357061004,
            -5659.543901581232,
            -7931.140958358716,
            -8478.751539632976
        ],
        "r_gamma": [
            13637980.85053173,
            -16119105.523822302,
            -7960643.952812394,
            -1987342.1227645224
        ],
        "r_gamma_cum": [
            13637980.85053173,
            -2481124.673290571,
            -10441768.626102965,
            -12429110.748867488
        ]
    },
    "detailed_data": [
        {
            "strike": 5100.0,
            "delta": -782.7915517274025,
            "gamma": 13637980.85053173,
            "volume": 0,
            "oi": 3750,
            "iv": 11.08
        },
        {
            "strike": 5250.0,
            "delta": -1002.2874385869646,
            "gamma": 16119105.5238223,
            "volume": 0,
            "oi": 3200,
            "iv": 11.08
        },
        {
            "strike": 5350.0,
            "delta": 237.8942618040693,
            "gamma": 7960643.952812394,
            "volume": 0,
            "oi": 1370,
            "iv": 11.08
        },
        {
            "strike": 5450.0,
            "delta": 40.26289764823575,
            "gamma": 1987342.1227645224,
            "volume": 0,
            "oi": 1070,
            "iv": 11.08
        }
    ]
};