window.marketData = {
    "last_updated": "2026-02-24 08:22:03",
    "spot_price": 5179.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 24/02/2026 08:22\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(1);\n  spot(0);\n  // 1 = Classic (5000.00)\n  // 2 = Spline (5000.00)\n  // 3 = HVL (5000.00)\n  // 4 = HVL Log (5000.00)\n  // 5 = Sigma Kernel (5000.00)\n  // 6 = PVOP (5000.00)\n  // 7 = HVL Gaussian (5000.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5000.00;\n\n  if (ModeloFlip = 1) then GammaVal := 5000.00;\n  if (ModeloFlip = 2) then GammaVal := 5000.00;\n  if (ModeloFlip = 3) then GammaVal := 5000.00;\n  if (ModeloFlip = 4) then GammaVal := 5000.00;\n  if (ModeloFlip = 5) then GammaVal := 5000.00;\n  if (ModeloFlip = 6) then GammaVal := 5000.00;\n  if (ModeloFlip = 7) then GammaVal := 5000.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5000.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5093.14, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5138.91, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5150.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5220.09, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5225.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5225.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5250.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5300.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5354.76, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5245.53 > 0) then\n      HorizontalLineCustom(5245.53, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5075.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5187.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5237.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5325.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5057.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5092.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5178.65, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5196.35, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5234.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5240.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5269.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5280.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5319.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5330.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5035.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5114.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5167.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5207.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5230.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5244.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5261.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5338.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5187.27, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5171.73, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5195.04, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5163.96, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5209.47, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5149.53, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5217.24, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5141.76, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 9250,
        "total_volume": 9250,
        "gamma_exposure": 67401027.38464035,
        "delta_position": -1476.2081651688661,
        "last_update": "2026-02-24T08:22:03.877927",
        "spot_price": 5179.5,
        "dealer_pressure": -0.1383643792116676,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5000.0,
        "gamma_flip_hvl": 5000.0,
        "gamma_flip_hvl_gaussian": 5000.0,
        "call_wall": 5225.0,
        "put_wall": 5150.0,
        "effective_call_wall": 5354.761904761905,
        "effective_put_wall": 5093.137254901961,
        "max_pain": 5250.0,
        "zero_gamma": 5000.0,
        "range_low": 5138.911037783143,
        "range_high": 5220.088962216857,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5220.088962216857,
                "sigma_1_down": 5138.911037783143,
                "sigma_2_up": 5260.677924433714,
                "sigma_2_down": 5098.322075566286
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5270.259678653062,
                "sigma_1_down": 5088.740321346938,
                "sigma_2_up": 5361.019357306125,
                "sigma_2_down": 4997.980642693875
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 3.0,
                "sigma_1_up": 5249.802144786089,
                "sigma_1_down": 5109.197855213911,
                "sigma_2_up": 5320.1042895721785,
                "sigma_2_down": 5038.8957104278215
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
                4402.575,
                4434.286224489796,
                4465.997448979591,
                4497.708673469388,
                4529.419897959184,
                4561.131122448979,
                4592.842346938775,
                4624.553571428572,
                4656.264795918367,
                4687.976020408163,
                4719.687244897959,
                4751.398469387755,
                4783.109693877551,
                4814.820918367346,
                4846.532142857142,
                4878.243367346939,
                4909.954591836734,
                4941.66581632653,
                4973.377040816326,
                5005.088265306122,
                5036.799489795918,
                5068.510714285714,
                5100.221938775509,
                5131.933163265306,
                5163.644387755102,
                5195.355612244897,
                5227.066836734693,
                5258.77806122449,
                5290.489285714285,
                5322.200510204081,
                5353.911734693877,
                5385.622959183673,
                5417.334183673469,
                5449.045408163265,
                5480.7566326530605,
                5512.467857142857,
                5544.179081632652,
                5575.890306122448,
                5607.6015306122445,
                5639.312755102041,
                5671.023979591836,
                5702.735204081632,
                5734.4464285714275,
                5766.157653061224,
                5797.86887755102,
                5829.580102040815,
                5861.2913265306115,
                5893.002551020408,
                5924.713775510203,
                5956.424999999999
            ],
            "deltas": [
                -6288.310425513351,
                -6286.905586436695,
                -6284.525238939879,
                -6280.633358354378,
                -6274.487272589204,
                -6265.103331746084,
                -6251.236914008742,
                -6231.384995641596,
                -6203.817737508025,
                -6166.641708105053,
                -6117.891978770843,
                -6055.644527478791,
                -5978.135659987688,
                -5883.872425531883,
                -5771.713721918715,
                -5640.870963009473,
                -5490.627136073261,
                -5319.126784037482,
                -5119.937902119331,
                -4875.609131232597,
                -4551.7430282692985,
                -4101.914685577969,
                -3492.08334948192,
                -2733.7091314975805,
                -1895.0923656682485,
                -1073.2080013178984,
                -347.1752228174089,
                249.2185351408477,
                723.1944645698959,
                1102.508114571345,
                1416.7754285073006,
                1686.9931101608754,
                1923.0042271714437,
                2126.90707107962,
                2298.6628330899093,
                2439.8580566035243,
                2554.201667136773,
                2646.1917495516473,
                2719.8892066757453,
                2778.5303181950767,
                2824.6854614312438,
                2860.5092409931262,
                2887.885039186274,
                2908.470515812066,
                2923.7013776101885,
                2934.7908445075573,
                2942.737763225991,
                2948.344046208954,
                2952.238325557105,
                2954.9023774990123
            ],
            "flip_value": 5245.52670704881
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                10.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -150.0,
                -0.0,
                -100.0,
                -200.0,
                -250.0,
                -200.0,
                -350.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4402.575,
                4434.286224489796,
                4465.997448979591,
                4497.708673469388,
                4529.419897959184,
                4561.131122448979,
                4592.842346938775,
                4624.553571428572,
                4656.264795918367,
                4687.976020408163,
                4719.687244897959,
                4751.398469387755,
                4783.109693877551,
                4814.820918367346,
                4846.532142857142,
                4878.243367346939,
                4909.954591836734,
                4941.66581632653,
                4973.377040816326,
                5005.088265306122,
                5036.799489795918,
                5068.510714285714,
                5100.221938775509,
                5131.933163265306,
                5163.644387755102,
                5195.355612244897,
                5227.066836734693,
                5258.77806122449,
                5290.489285714285,
                5322.200510204081,
                5353.911734693877,
                5385.622959183673,
                5417.334183673469,
                5449.045408163265,
                5480.7566326530605,
                5512.467857142857,
                5544.179081632652,
                5575.890306122448,
                5607.6015306122445,
                5639.312755102041,
                5671.023979591836,
                5702.735204081632,
                5734.4464285714275,
                5766.157653061224,
                5797.86887755102,
                5829.580102040815,
                5861.2913265306115,
                5893.002551020408,
                5924.713775510203,
                5956.424999999999
            ],
            "pnl": [
                -6050722.2314230455,
                -5784509.486983309,
                -5518296.742543582,
                -5252083.998103846,
                -4985871.253664112,
                -4719658.509224523,
                -4453445.764789129,
                -4187233.020453102,
                -3921020.277910067,
                -3654807.5602108827,
                -3388595.1082746065,
                -3122384.862677276,
                -2856188.904498394,
                -2590065.4705470046,
                -2324232.0200818256,
                -2059316.4256133216,
                -1796713.191984565,
                -1538779.5469445966,
                -1288491.5471974271,
                -1048584.118747242,
                -820915.7391927332,
                -606829.6004989408,
                -408220.6247728376,
                -228093.7622658174,
                -69930.01785399759,
                63516.02985836525,
                170994.9072552965,
                252874.30658384215,
                310909.3035810061,
                347858.86409491487,
                366981.9420401032,
                371592.6601682688,
                364862.22529658594,
                349785.0624138992,
                329084.40531926975,
                305006.22751043376,
                279153.9336336206,
                252496.1191521806,
                225524.15473636458,
                198447.26161551775,
                171340.3794069007,
                144226.16084921066,
                117110.40452304957,
                89994.37161111491,
                62878.29593848353,
                35762.214572680736,
                8646.132552812662,
                -18469.949532027502,
                -45586.03162245816,
                -72702.11371330908
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5000.0,
                5150.0,
                5225.0,
                5250.0,
                5300.0,
                5350.0,
                5400.0
            ],
            "loss": [
                852500.0,
                170000.0,
                42500.0,
                9375.0,
                48375.0,
                125375.0,
                227375.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5225.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 182.5635504431175,
                        "Call_Sim": 227.98458491906968,
                        "Call_Chg": 24.879574463635503,
                        "Put_Now": 0.08824556218017321,
                        "Put_Sim": 0.009280038132127189,
                        "Put_Chg": -89.4838472294166
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 47.20552679940329,
                        "Call_Sim": 82.80867201593264,
                        "Call_Chg": 75.42156105538771,
                        "Put_Now": 14.640962772038165,
                        "Put_Sim": 4.744107988568203,
                        "Put_Chg": -67.59702170933274
                    },
                    {
                        "Strike": 5179.5,
                        "Call_Now": 29.60595347364415,
                        "Call_Sim": 58.870220951114334,
                        "Call_Chg": 98.84588754596896,
                        "Put_Now": 26.52383514748135,
                        "Put_Sim": 10.288102624950625,
                        "Put_Chg": -61.211858813986176
                    },
                    {
                        "Strike": 5225.0,
                        "Call_Now": 11.89615084697789,
                        "Call_Sim": 29.86603087166577,
                        "Call_Chg": 151.0562555555772,
                        "Put_Now": 54.28695724639829,
                        "Put_Sim": 26.75683727108617,
                        "Put_Chg": -50.712217762285114
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5150.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 182.5635504431175,
                        "Call_Sim": 153.29168509213923,
                        "Call_Chg": -16.03379496067518,
                        "Put_Now": 0.08824556218017321,
                        "Put_Sim": 0.31638021120230064,
                        "Put_Chg": 258.5225176041591
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 47.20552679940329,
                        "Call_Sim": 29.437331863937743,
                        "Call_Chg": -37.64007339854567,
                        "Put_Now": 14.640962772038165,
                        "Put_Sim": 26.372767836573075,
                        "Put_Chg": 80.13001089614635
                    },
                    {
                        "Strike": 5179.5,
                        "Call_Now": 29.60595347364415,
                        "Call_Sim": 16.712333869278382,
                        "Call_Chg": -43.550766287071085,
                        "Put_Now": 26.52383514748135,
                        "Put_Sim": 43.130215543115355,
                        "Put_Chg": 62.609273143559385
                    },
                    {
                        "Strike": 5225.0,
                        "Call_Now": 11.89615084697789,
                        "Call_Sim": 5.629826370488445,
                        "Call_Chg": -52.6752271141665,
                        "Put_Now": 54.28695724639829,
                        "Put_Sim": 77.52063276990884,
                        "Put_Chg": 42.7978960361644
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5000.0,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 182.5635504431175,
                        "Call_Sim": 28.579933848483506,
                        "Call_Chg": -84.34521360966392,
                        "Put_Now": 0.08824556218017321,
                        "Put_Sim": 25.604628967546887,
                        "Put_Chg": 28915.202957480473
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 47.20552679940329,
                        "Call_Sim": 0.40538866665498574,
                        "Call_Chg": -99.14122626281102,
                        "Put_Now": 14.640962772038165,
                        "Put_Sim": 147.34082463929008,
                        "Put_Chg": 906.3602164243383
                    },
                    {
                        "Strike": 5179.5,
                        "Call_Now": 29.60595347364415,
                        "Call_Sim": 0.11666314165386282,
                        "Call_Chg": -99.60594702089998,
                        "Put_Now": 26.52383514748135,
                        "Put_Sim": 176.53454481549034,
                        "Put_Chg": 565.5694541679193
                    },
                    {
                        "Strike": 5225.0,
                        "Call_Now": 11.89615084697789,
                        "Call_Sim": 0.01289133954244015,
                        "Call_Chg": -99.8916343638521,
                        "Put_Now": 54.28695724639829,
                        "Put_Sim": 221.90369773896327,
                        "Put_Chg": 308.76061027289506
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5231.295,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 182.5635504431175,
                        "Call_Sim": 234.2769179087063,
                        "Call_Chg": 28.326227957371746,
                        "Put_Now": 0.08824556218017321,
                        "Put_Sim": 0.006613027769419633,
                        "Put_Chg": -92.50610726926115
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 47.20552679940329,
                        "Call_Sim": 88.32900380223782,
                        "Call_Chg": 87.11580992959995,
                        "Put_Now": 14.640962772038165,
                        "Put_Sim": 3.9694397748727397,
                        "Put_Chg": -72.8881232970982
                    },
                    {
                        "Strike": 5179.5,
                        "Call_Now": 29.60595347364415,
                        "Call_Sim": 63.717934842758496,
                        "Call_Chg": 115.22000600143332,
                        "Put_Now": 26.52383514748135,
                        "Put_Sim": 8.840816516595169,
                        "Put_Chg": -66.66840799063452
                    },
                    {
                        "Strike": 5225.0,
                        "Call_Now": 11.89615084697789,
                        "Call_Sim": 33.25168212092285,
                        "Call_Chg": 179.5163120293666,
                        "Put_Now": 54.28695724639829,
                        "Put_Sim": 23.847488520343177,
                        "Put_Chg": -56.07142170060497
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5127.705,
                "options": [
                    {
                        "Strike": 5000.0,
                        "Call_Now": 182.5635504431175,
                        "Call_Sim": 131.43595019781515,
                        "Call_Chg": -28.005371346693053,
                        "Put_Now": 0.08824556218017321,
                        "Put_Sim": 0.7556453168782014,
                        "Put_Chg": 756.2983771754789
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 47.20552679940329,
                        "Call_Sim": 19.25388030691147,
                        "Call_Chg": -59.212656626565064,
                        "Put_Now": 14.640962772038165,
                        "Put_Sim": 38.48431627954642,
                        "Put_Chg": 162.85372675795026
                    },
                    {
                        "Strike": 5179.5,
                        "Call_Now": 29.60595347364415,
                        "Call_Sim": 10.048877849365454,
                        "Call_Chg": -66.05791514767063,
                        "Put_Now": 26.52383514748135,
                        "Put_Sim": 58.76175952320273,
                        "Put_Chg": 121.543224034035
                    },
                    {
                        "Strike": 5225.0,
                        "Call_Now": 11.89615084697789,
                        "Call_Sim": 2.9289206028021226,
                        "Call_Chg": -75.37925804340159,
                        "Put_Now": 54.28695724639829,
                        "Put_Sim": 97.11472700222293,
                        "Put_Chg": 78.89145372697433
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.27444620213252796,
            -0.49834373376253793,
            0.156576291921908,
            0.06275612712648743,
            0.17774633436019793,
            0.11980083673654529,
            0.16270724690811228
        ]
    },
    "delta_data": {
        "strikes": [
            5000.0,
            5150.0,
            5225.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0
        ],
        "delta_values": [
            -256.9960916753213,
            -908.1725018284379,
            103.62868259517631,
            -914.2293305222039,
            250.56449821643258,
            124.06102234665336,
            124.93555569883469
        ],
        "delta_cumulative": [
            -256.9960916753213,
            -1165.1685935037592,
            -1061.539910908583,
            -1975.7692414307867,
            -1725.204743214354,
            -1601.1437208677007,
            -1476.2081651688661
        ]
    },
    "gamma_data": {
        "strikes": [
            5000.0,
            5150.0,
            5225.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0
        ],
        "gamma_values": [
            5123824.845394225,
            37478171.64691478,
            4620408.809052706,
            12291875.955090817,
            3510886.3508972083,
            2019433.6283099113,
            2356426.1489806967
        ],
        "gamma_call": [
            0.0,
            0.0,
            4620408.809052706,
            3806870.1623577815,
            3510886.3508972083,
            2019433.6283099113,
            2356426.1489806967
        ],
        "gamma_put": [
            5123824.845394225,
            37478171.64691478,
            0.0,
            8485005.792733036,
            0.0,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            5123824.845394225,
            42601996.492309004,
            47222405.30136171,
            59514281.25645253,
            63025167.60734974,
            65044601.23565965,
            67401027.38464035
        ]
    },
    "volume_data": {
        "strikes": [
            5000.0,
            5150.0,
            5225.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0
        ],
        "call_volume": [
            0.0,
            0.0,
            375.0,
            405.0,
            760.0,
            500.0,
            920.0
        ],
        "put_volume": [
            1740.0,
            2850.0,
            0.0,
            1700.0,
            0.0,
            0.0,
            0.0
        ],
        "total_volume": [
            1740.0,
            2850.0,
            375.0,
            2105.0,
            760.0,
            500.0,
            920.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5000.0,
            5150.0,
            5225.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0
        ],
        "iv_values": [
            12.44,
            12.44,
            12.44,
            12.44,
            12.44,
            12.44,
            12.44
        ],
        "skew": [
            0.0,
            0.0,
            -4.336808689942018e-19,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5000.0,
            5150.0,
            5225.0,
            5250.0,
            5300.0,
            5350.0,
            5400.0
        ],
        "charm": [
            -1526.777149462504,
            -16995.22869605002,
            3846.7622026825265,
            6310.190773468412,
            1017.268742466751,
            776.263974820256,
            1238.8654613832002
        ],
        "vanna": [
            -3249.937590034099,
            -3763.430281586242,
            614.6734897537546,
            2076.504038014481,
            1066.4779120336118,
            918.069626787564,
            1424.0924385926962
        ],
        "vex": [
            655046.2376722007,
            574959.5914671968,
            70882.54961559923,
            1143152.3159268005,
            448842.99609054124,
            258170.88607980145,
            297372.50046418124
        ],
        "theta": [
            -1360.2108133785305,
            -10979.240327943553,
            -1575.2433749138406,
            -2934.087681921755,
            -1367.7275222651917,
            -766.9079757028477,
            -875.2388439945851
        ],
        "charm_cum": [
            -1526.777149462504,
            -18522.005845512525,
            -14675.243642829999,
            -8365.052869361587,
            -7347.784126894836,
            -6571.5201520745795,
            -5332.654690691379
        ],
        "vanna_cum": [
            -3249.937590034099,
            -7013.367871620341,
            -6398.694381866587,
            -4322.190343852106,
            -3255.712431818494,
            -2337.6428050309305,
            -913.5503664382343
        ],
        "theta_cum": [
            -1360.2108133785305,
            -12339.451141322083,
            -13914.694516235922,
            -16848.782198157678,
            -18216.50972042287,
            -18983.417696125718,
            -19858.656540120304
        ],
        "r_gamma": [
            5123824.845394225,
            37478171.64691478,
            -4620408.809052706,
            -12291875.955090817,
            -3510886.3508972083,
            -2019433.6283099113,
            -2356426.1489806967
        ],
        "r_gamma_cum": [
            5123824.845394225,
            42601996.492309004,
            37981587.6832563,
            25689711.72816548,
            22178825.377268273,
            20159391.74895836,
            17802965.599977665
        ]
    },
    "detailed_data": [
        {
            "strike": 5000.0,
            "delta": -256.9960916753213,
            "gamma": 5123824.845394225,
            "volume": 0,
            "oi": 1740,
            "iv": 12.44
        },
        {
            "strike": 5150.0,
            "delta": -908.1725018284379,
            "gamma": 37478171.64691478,
            "volume": 0,
            "oi": 2850,
            "iv": 12.44
        },
        {
            "strike": 5225.0,
            "delta": 103.62868259517631,
            "gamma": 4620408.809052706,
            "volume": 0,
            "oi": 375,
            "iv": 12.44
        },
        {
            "strike": 5250.0,
            "delta": -914.2293305222039,
            "gamma": 12291875.955090817,
            "volume": 0,
            "oi": 2105,
            "iv": 12.44
        },
        {
            "strike": 5300.0,
            "delta": 250.56449821643258,
            "gamma": 3510886.3508972083,
            "volume": 0,
            "oi": 760,
            "iv": 12.44
        },
        {
            "strike": 5350.0,
            "delta": 124.06102234665336,
            "gamma": 2019433.6283099113,
            "volume": 0,
            "oi": 500,
            "iv": 12.44
        },
        {
            "strike": 5400.0,
            "delta": 124.93555569883469,
            "gamma": 2356426.1489806967,
            "volume": 0,
            "oi": 920,
            "iv": 12.44
        }
    ]
};