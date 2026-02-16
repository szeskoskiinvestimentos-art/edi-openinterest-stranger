window.marketData = {
    "last_updated": "2026-02-16 16:34:44",
    "spot_price": 5228.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 16/02/2026 16:34\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5226.12)\n  // 2 = Spline (5224.58)\n  // 3 = HVL (5203.20)\n  // 4 = HVL Log (5101.10)\n  // 5 = Sigma Kernel (5100.30)\n  // 6 = PVOP (5226.12)\n  // 7 = HVL Gaussian (5187.32)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5226.12;\n\n  if (ModeloFlip = 1) then GammaVal := 5226.12;\n  if (ModeloFlip = 2) then GammaVal := 5224.58;\n  if (ModeloFlip = 3) then GammaVal := 5203.20;\n  if (ModeloFlip = 4) then GammaVal := 5101.10;\n  if (ModeloFlip = 5) then GammaVal := 5100.30;\n  if (ModeloFlip = 6) then GammaVal := 5226.12;\n  if (ModeloFlip = 7) then GammaVal := 5187.32;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5100.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5162.79, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5192.01, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5250.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5264.99, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5350.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5393.85, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5450.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5326.89 > 0) then\n      HorizontalLineCustom(5326.89, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5400.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5157.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5192.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5411.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5135.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5214.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5373.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5426.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5236.34, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5220.66, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5244.19, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5212.81, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5258.75, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5198.25, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5266.59, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5190.41, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 9390,
        "total_volume": 9390,
        "gamma_exposure": 39784755.171405256,
        "delta_position": -1534.3850443831777,
        "last_update": "2026-02-16T16:34:44.635447",
        "spot_price": 5228.5,
        "dealer_pressure": 0.10629253183435615,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5100.0,
        "gamma_flip_hvl": 5100.0,
        "gamma_flip_hvl_gaussian": 5187.324639000857,
        "call_wall": 5350.0,
        "put_wall": 5250.0,
        "effective_call_wall": 5393.852459016393,
        "effective_put_wall": 5162.790697674419,
        "max_pain": 5250.0,
        "zero_gamma": 5226.122853316047,
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
                "days": 9.0,
                "sigma_1_up": 5337.980773490933,
                "sigma_1_down": 5119.019226509067,
                "sigma_2_up": 5447.461546981865,
                "sigma_2_down": 5009.538453018135
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
                -6448.4961005232735,
                -6447.093137862636,
                -6444.577369764531,
                -6440.227611925161,
                -6432.969787273226,
                -6421.272989847247,
                -6403.050229844234,
                -6375.583240614445,
                -6335.495086330724,
                -6278.795131394698,
                -6201.016659517637,
                -6097.457376828625,
                -5963.517808002121,
                -5795.114121927028,
                -5589.122913700823,
                -5343.7984452880955,
                -5059.089377706073,
                -4736.773463972602,
                -4380.329528628898,
                -3994.48869993406,
                -3584.4711646414016,
                -3155.0337963430893,
                -2709.6058496390565,
                -2249.8965949176236,
                -1776.309793873796,
                -1289.232301985092,
                -790.849561205219,
                -286.7896440803745,
                213.1615727430758,
                695.7191448530183,
                1146.0348045264795,
                1550.3139435939452,
                1898.2903315930869,
                2184.8429885663068,
                2410.388541438,
                2580.102415540772,
                2702.3543487210795,
                2786.891366392449,
                2843.249934858999,
                2879.688748256804,
                2902.705160067325,
                2917.0230682012257,
                2925.862254776026,
                2931.309590257576,
                2934.670974638087,
                2936.747960327068,
                2938.030178436498,
                2938.8184238832023,
                2939.299348774069,
                2939.58976057771
            ],
            "flip_value": 5326.890828168704
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
                -5448669.862439327,
                -5198905.964101117,
                -4949142.065916872,
                -4699378.168850415,
                -4449614.278939515,
                -4199850.429522298,
                -3950086.7831806284,
                -3700324.0415348387,
                -3450564.888711564,
                -3200818.4422980035,
                -2951112.2422905113,
                -2701520.3517645677,
                -2452220.2894630483,
                -2203591.572180301,
                -1956358.2570288416,
                -1711753.249174068,
                -1471649.748134224,
                -1238585.2518498243,
                -1015620.2885086245,
                -806034.109855884,
                -612936.0422790688,
                -438915.0311764868,
                -285827.4585180126,
                -154747.93691527855,
                -46032.34145585861,
                40584.41175509841,
                105905.5495667274,
                151207.15862489308,
                178166.39079399657,
                188765.03483258194,
                185171.81460895194,
                169620.95103541267,
                144303.05689388397,
                111274.82777563878,
                72387.32674012292,
                29232.90843700274,
                -16885.8963086445,
                -64961.53500674764,
                -114260.45173764328,
                -164281.70072912326,
                -214705.1044365592,
                -265339.3554667163,
                -316077.63592701155,
                -366864.2027417322,
                -417671.8544597205,
                -468488.1697364271,
                -519307.8359893652,
                -570128.7229856665,
                -620950.0290873584,
                -671771.4708843648
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
                        "Call_Now": 142.79910106606803,
                        "Call_Sim": 259.4235598465666,
                        "Call_Chg": 81.67030318106877,
                        "Put_Now": 5.200084748530344,
                        "Put_Sim": 0.32454352902891515,
                        "Put_Chg": -93.75888000439535
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 48.45946710777025,
                        "Call_Sim": 137.2634656787386,
                        "Call_Chg": 183.25417894809877,
                        "Put_Now": 39.131191261447384,
                        "Put_Sim": 6.4351898324150625,
                        "Put_Chg": -83.5548327945868
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.927335845957714,
                        "Call_Sim": 118.8457705852179,
                        "Call_Chg": 213.35122263243403,
                        "Put_Now": 50.06070140143356,
                        "Put_Sim": 9.479136140694322,
                        "Put_Chg": -81.06471568450124
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.012893907639864,
                        "Call_Sim": 49.58556928881535,
                        "Call_Chg": 450.1625759378315,
                        "Put_Now": 120.96784737845792,
                        "Put_Sim": 40.04052275963386,
                        "Put_Chg": -66.89986337083128
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 142.79910106606803,
                        "Call_Sim": 162.49749633520423,
                        "Call_Chg": 13.794481283199714,
                        "Put_Now": 5.200084748530344,
                        "Put_Sim": 3.398480017666941,
                        "Put_Chg": -34.64568017612743
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 48.45946710777025,
                        "Call_Sim": 60.85884383892835,
                        "Call_Chg": 25.587109126856074,
                        "Put_Now": 39.131191261447384,
                        "Put_Sim": 30.030567992605256,
                        "Put_Chg": -23.256698749695857
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.927335845957714,
                        "Call_Sim": 48.65873621799619,
                        "Call_Chg": 28.294632704032203,
                        "Put_Now": 50.06070140143356,
                        "Put_Sim": 39.292101773472496,
                        "Put_Chg": -21.511084196780132
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.012893907639864,
                        "Call_Sim": 12.959693456732339,
                        "Call_Chg": 43.79059145195234,
                        "Put_Now": 120.96784737845792,
                        "Put_Sim": 103.41464692755108,
                        "Put_Chg": -14.510633057716738
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5100.0,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 142.79910106606803,
                        "Call_Sim": 47.26848661176791,
                        "Call_Chg": -66.89861052423679,
                        "Put_Now": 5.200084748530344,
                        "Put_Sim": 38.16947029423045,
                        "Put_Chg": 634.0163120421829
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 48.45946710777025,
                        "Call_Sim": 7.367342263371825,
                        "Call_Chg": -84.79689789615846,
                        "Put_Now": 39.131191261447384,
                        "Put_Sim": 126.53906641704907,
                        "Put_Chg": 223.3713626850844
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.927335845957714,
                        "Call_Sim": 4.937931893549376,
                        "Call_Chg": -86.98054639639115,
                        "Put_Now": 50.06070140143356,
                        "Put_Sim": 145.57129744902613,
                        "Put_Chg": 190.78956821179793
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.012893907639864,
                        "Call_Sim": 0.5337316951655566,
                        "Call_Chg": -94.07813183384823,
                        "Put_Now": 120.96784737845792,
                        "Put_Sim": 240.98868516598395,
                        "Put_Chg": 99.21713942055274
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5280.785,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 142.79910106606803,
                        "Call_Sim": 191.64485471950593,
                        "Call_Chg": 34.205925169542006,
                        "Put_Now": 5.200084748530344,
                        "Put_Sim": 1.7608384019683854,
                        "Put_Chg": -66.13827491049956
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 48.45946710777025,
                        "Call_Sim": 81.37491729041722,
                        "Call_Chg": 67.92367342679492,
                        "Put_Now": 39.131191261447384,
                        "Put_Sim": 19.76164144409381,
                        "Put_Chg": -49.499003717877436
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.927335845957714,
                        "Call_Sim": 66.90785774725055,
                        "Call_Chg": 76.41064486838079,
                        "Put_Now": 50.06070140143356,
                        "Put_Sim": 26.75622330272722,
                        "Put_Chg": -46.55244023017021
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.012893907639864,
                        "Call_Sim": 20.76430240386526,
                        "Call_Chg": 130.38440945437296,
                        "Put_Now": 120.96784737845792,
                        "Put_Sim": 80.43425587468391,
                        "Put_Chg": -33.50773976903243
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5176.215,
                "options": [
                    {
                        "Strike": 5100.0,
                        "Call_Now": 142.79910106606803,
                        "Call_Sim": 98.37885859209973,
                        "Call_Chg": -31.10680819581395,
                        "Put_Now": 5.200084748530344,
                        "Put_Sim": 13.06484227456167,
                        "Put_Chg": 151.24287211384538
                    },
                    {
                        "Strike": 5228.5,
                        "Call_Now": 48.45946710777025,
                        "Call_Sim": 25.278589962030537,
                        "Call_Chg": -47.83560061481313,
                        "Put_Now": 39.131191261447384,
                        "Put_Sim": 68.2353141157073,
                        "Put_Chg": 74.37576499986014
                    },
                    {
                        "Strike": 5250.0,
                        "Call_Now": 37.927335845957714,
                        "Call_Sim": 18.675123636964827,
                        "Call_Chg": -50.76078184659728,
                        "Put_Now": 50.06070140143356,
                        "Put_Sim": 83.09348919244167,
                        "Put_Chg": 65.98546737513782
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 9.012893907639864,
                        "Call_Sim": 3.287247790015215,
                        "Call_Chg": -63.52727743495629,
                        "Put_Now": 120.96784737845792,
                        "Put_Sim": 167.52720126083295,
                        "Put_Chg": 38.48903232667292
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.3229184167211292,
            0.053374215165445264,
            0.5255575652200136,
            0.1691567636730949
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
            -775.0163255053905,
            -1008.0246233485491,
            216.91535915802157,
            31.740545312740092
        ],
        "delta_cumulative": [
            -775.0163255053905,
            -1783.0409488539394,
            -1566.1255896959178,
            -1534.3850443831777
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
            13774731.635813478,
            16382516.657741437,
            7905191.119253416,
            1722315.7585969286
        ],
        "gamma_call": [
            0.0,
            2559768.2277720994,
            7905191.119253416,
            1722315.7585969286
        ],
        "gamma_put": [
            13774731.635813478,
            13822748.429969337,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            13774731.635813478,
            30157248.293554917,
            38062439.41280833,
            39784755.171405256
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
            -2014.4220357310721,
            1466.663132623308,
            5539.512764794127,
            2088.1949125950023
        ],
        "vanna": [
            -7549.314351571842,
            -387.03117152774524,
            3053.7236743358953,
            1230.8720321035066
        ],
        "vex": [
            1963320.3494630626,
            2335009.4346619826,
            327115.56627038756,
            71269.15544112171
        ],
        "theta": [
            -2686.705313312721,
            -3078.013757653407,
            -2236.156273546975,
            -471.36425408166787
        ],
        "charm_cum": [
            -2014.4220357310721,
            -547.7589031077641,
            4991.753861686363,
            7079.948774281365
        ],
        "vanna_cum": [
            -7549.314351571842,
            -7936.345523099587,
            -4882.621848763692,
            -3651.749816660185
        ],
        "theta_cum": [
            -2686.705313312721,
            -5764.719070966128,
            -8000.875344513103,
            -8472.239598594771
        ],
        "r_gamma": [
            13774731.635813478,
            -16382516.657741437,
            -7905191.119253416,
            -1722315.7585969286
        ],
        "r_gamma_cum": [
            13774731.635813478,
            -2607785.0219279584,
            -10512976.141181374,
            -12235291.899778303
        ]
    },
    "detailed_data": [
        {
            "strike": 5100.0,
            "delta": -775.0163255053905,
            "gamma": 13774731.635813478,
            "volume": 0,
            "oi": 3750,
            "iv": 11.08
        },
        {
            "strike": 5250.0,
            "delta": -1008.0246233485491,
            "gamma": 16382516.657741437,
            "volume": 0,
            "oi": 3200,
            "iv": 11.08
        },
        {
            "strike": 5350.0,
            "delta": 216.91535915802157,
            "gamma": 7905191.119253416,
            "volume": 0,
            "oi": 1370,
            "iv": 11.08
        },
        {
            "strike": 5450.0,
            "delta": 31.740545312740092,
            "gamma": 1722315.7585969286,
            "volume": 0,
            "oi": 1070,
            "iv": 11.08
        }
    ]
};