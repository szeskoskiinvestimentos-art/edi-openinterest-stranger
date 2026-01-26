window.marketData = {
    "last_updated": "2026-01-26 08:06:44",
    "spot_price": 5303.5,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 26/01/2026 08:06\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(true);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(true);\n  MostrarPLUS2(true);\n  ExibirMelhoresPontos(false);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (5306.16)\n  // 2 = Spline (5293.04)\n  // 3 = HVL (5305.68)\n  // 4 = HVL Log (5295.48)\n  // 5 = Sigma Kernel (5290.65)\n  // 6 = PVOP (5306.16)\n  // 7 = HVL Gaussian (5250.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 5306.16;\n\n  if (ModeloFlip = 1) then GammaVal := 5306.16;\n  if (ModeloFlip = 2) then GammaVal := 5293.04;\n  if (ModeloFlip = 3) then GammaVal := 5305.68;\n  if (ModeloFlip = 4) then GammaVal := 5295.48;\n  if (ModeloFlip = 5) then GammaVal := 5290.65;\n  if (ModeloFlip = 6) then GammaVal := 5306.16;\n  if (ModeloFlip = 7) then GammaVal := 5250.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(5250.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5270.59, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5314.65, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirExpMoves) then\n    HorizontalLineCustom(5336.41, clExpMove, 1, psDot, \"Edi_ExpMove\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5350.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5350.00, clRangeLow, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5388.46, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5400.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5400.00, clRangeHigh, 1, psDot, \"Edi_Range\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5650.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5750.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(6800.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5416.30 > 0) then\n      HorizontalLineCustom(5416.30, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(5300.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5375.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5525.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5700.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(5288.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5311.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5369.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5380.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5495.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5554.50, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5688.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5711.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6151.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6398.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(5273.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5326.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5361.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5388.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5459.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5591.00, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5673.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5726.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5997.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(6552.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos and LastBarOnChart) then\n  begin\n    HorizontalLineCustom(5311.46, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5295.54, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.1);\n    HorizontalLineCustom(5319.41, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5287.59, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.3);\n    HorizontalLineCustom(5334.18, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5272.82, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.5);\n    HorizontalLineCustom(5342.14, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n    HorizontalLineCustom(5264.86, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, CurrentTime, 0.7);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "total_trades": 16335,
        "total_volume": 16335,
        "gamma_exposure": 142388274.23793417,
        "delta_position": -5642.6242276655,
        "last_update": "2026-01-26T08:06:44.933987",
        "spot_price": 5303.5,
        "dealer_pressure": 0.12236936378909452,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 5250.0,
        "gamma_flip_hvl": 5250.0,
        "gamma_flip_hvl_gaussian": 5250.0,
        "call_wall": 5400.0,
        "put_wall": 5350.0,
        "effective_call_wall": 5388.461538461538,
        "effective_put_wall": 5314.651553316541,
        "max_pain": 5350.0,
        "zero_gamma": 5306.1643911548945,
        "range_low": 5270.592223935577,
        "range_high": 5336.407776064422,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "sigma_1_up": 5336.407776064423,
                "sigma_1_down": 5270.592223935577,
                "sigma_2_up": 5369.315552128845,
                "sigma_2_down": 5237.684447871155
            },
            {
                "label": "1 Semana",
                "days": 5,
                "sigma_1_up": 5377.08402426839,
                "sigma_1_down": 5229.91597573161,
                "sigma_2_up": 5450.66804853678,
                "sigma_2_down": 5156.33195146322
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 4.0,
                "sigma_1_up": 5369.315552128845,
                "sigma_1_down": 5237.684447871155,
                "sigma_2_up": 5435.131104257692,
                "sigma_2_down": 5171.868895742308
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
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0,
                5250.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4507.974999999999,
                4540.445408163265,
                4572.91581632653,
                4605.3862244897955,
                4637.856632653061,
                4670.327040816326,
                4702.7974489795915,
                4735.267857142857,
                4767.738265306122,
                4800.208673469388,
                4832.679081632653,
                4865.149489795918,
                4897.619897959183,
                4930.090306122449,
                4962.560714285713,
                4995.031122448979,
                5027.501530612244,
                5059.971938775509,
                5092.442346938775,
                5124.91275510204,
                5157.3831632653055,
                5189.853571428571,
                5222.323979591836,
                5254.7943877551015,
                5287.264795918367,
                5319.735204081632,
                5352.205612244898,
                5384.676020408163,
                5417.146428571428,
                5449.616836734694,
                5482.087244897959,
                5514.557653061224,
                5547.02806122449,
                5579.498469387755,
                5611.96887755102,
                5644.439285714286,
                5676.909693877551,
                5709.3801020408155,
                5741.850510204082,
                5774.320918367346,
                5806.791326530612,
                5839.261734693877,
                5871.732142857142,
                5904.202551020408,
                5936.672959183673,
                5969.143367346938,
                6001.613775510204,
                6034.084183673469,
                6066.554591836734,
                6099.025
            ],
            "deltas": [
                -12354.999893913358,
                -12354.999609488747,
                -12354.998649951282,
                -12354.995610501835,
                -12354.986559154842,
                -12354.961187417535,
                -12354.89416407979,
                -12354.727113468787,
                -12354.333825071106,
                -12353.458240556778,
                -12351.612885122266,
                -12347.927209927402,
                -12340.94390315198,
                -12328.378415637499,
                -12306.875214990172,
                -12271.75672381166,
                -12216.421591202436,
                -12129.848471211733,
                -11988.786950995884,
                -11743.16001234799,
                -11306.573905497387,
                -10578.72250449657,
                -9504.338927313973,
                -8115.135643955122,
                -6502.350535144958,
                -4762.835987202019,
                -2998.5561068332,
                -1347.9394361373631,
                35.87377800883928,
                1059.620069933743,
                1734.356724270719,
                2148.216719834345,
                2406.3036913869432,
                2589.482063551596,
                2744.8691466622035,
                2893.3605441669743,
                3040.073908457545,
                3181.945720461182,
                3311.6098218341954,
                3419.985109161708,
                3500.215537526737,
                3551.529241648027,
                3579.4700977849147,
                3592.3652843939435,
                3597.4416248004522,
                3599.183648525374,
                3599.730516372012,
                3599.901517234541,
                3599.9601990551146,
                3599.983075101215
            ],
            "flip_value": 5416.304670303479
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0
            ],
            "bear": [
                -150.0,
                -775.0,
                -300.0,
                -200.0,
                -370.0,
                -370.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4507.974999999999,
                4540.445408163265,
                4572.91581632653,
                4605.3862244897955,
                4637.856632653061,
                4670.327040816326,
                4702.7974489795915,
                4735.267857142857,
                4767.738265306122,
                4800.208673469388,
                4832.679081632653,
                4865.149489795918,
                4897.619897959183,
                4930.090306122449,
                4962.560714285713,
                4995.031122448979,
                5027.501530612244,
                5059.971938775509,
                5092.442346938775,
                5124.91275510204,
                5157.3831632653055,
                5189.853571428571,
                5222.323979591836,
                5254.7943877551015,
                5287.264795918367,
                5319.735204081632,
                5352.205612244898,
                5384.676020408163,
                5417.146428571428,
                5449.616836734694,
                5482.087244897959,
                5514.557653061224,
                5547.02806122449,
                5579.498469387755,
                5611.96887755102,
                5644.439285714286,
                5676.909693877551,
                5709.3801020408155,
                5741.850510204082,
                5774.320918367346,
                5806.791326530612,
                5839.261734693877,
                5871.732142857142,
                5904.202551020408,
                5936.672959183673,
                5969.143367346938,
                6001.613775510204,
                6034.084183673469,
                6066.554591836734,
                6099.025
            ],
            "pnl": [
                -14634731.18355182,
                -14022459.174860118,
                -13410187.166168423,
                -12797915.157476721,
                -12185643.148785027,
                -11573371.140093327,
                -10961099.131401632,
                -10348827.12270993,
                -9736555.114018235,
                -9124283.105326548,
                -8512011.09663557,
                -7899739.087969482,
                -7287467.079954997,
                -6675195.084596146,
                -6062923.272801036,
                -5450653.461296001,
                -4838400.124403393,
                -4226249.977658956,
                -3614594.6977198645,
                -3004771.2049541706,
                -2400238.9055862473,
                -1807831.935350567,
                -1238046.3336415344,
                -703932.0554644256,
                -219445.1245042591,
                202356.54207031033,
                552473.3005285882,
                830321.3285326781,
                1045745.9770585721,
                1215803.5999226328,
                1358315.810401219,
                1486795.2541844877,
                1609040.6668096846,
                1728380.556106009,
                1845579.6224965039,
                1960298.4554133841,
                2071935.8913924103,
                2180036.979459108,
                2284471.526858369,
                2385504.9687550794,
                2483765.281606893,
                2580077.0873471554,
                2675227.2811189196,
                2769795.545743354,
                2864119.999320721,
                2958359.1581803923,
                3052573.3934518294,
                3146781.5373888537,
                3240988.4337483165,
                3335195.1155017964
            ]
        },
        "max_pain_profile": {
            "strikes": [
                5250.0,
                5350.0,
                5400.0,
                5650.0,
                5750.0,
                6800.0
            ],
            "loss": [
                992500.0,
                178000.0,
                193250.0,
                894500.0,
                1210000.0,
                4990000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5400.0,
                "options": [
                    {
                        "Strike": 5250.0,
                        "Call_Now": 64.47141285555972,
                        "Call_Sim": 154.38382833348714,
                        "Call_Chg": 139.46090444669665,
                        "Put_Now": 6.806399190715638,
                        "Put_Sim": 0.2188146686432546,
                        "Put_Chg": -96.78516257257242
                    },
                    {
                        "Strike": 5303.5,
                        "Call_Now": 28.40340604404355,
                        "Call_Sim": 102.57883949448205,
                        "Call_Chg": 261.149783710513,
                        "Put_Now": 24.19594890661574,
                        "Put_Sim": 1.8713823570527097,
                        "Put_Chg": -92.26572033080699
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.446761581967166,
                        "Call_Sim": 62.06949448164232,
                        "Call_Chg": 494.15057953255587,
                        "Put_Now": 52.70241432350667,
                        "Put_Sim": 7.82514722318183,
                        "Put_Chg": -85.15220351168693
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 2.493297943054131,
                        "Call_Sim": 28.920221106408007,
                        "Call_Chg": 1059.9183798701001,
                        "Put_Now": 94.70928388778702,
                        "Put_Sim": 24.636207051140445,
                        "Put_Chg": -73.98754795746339
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 5350.0,
                "options": [
                    {
                        "Strike": 5250.0,
                        "Call_Now": 64.47141285555972,
                        "Call_Sim": 105.75008819396771,
                        "Call_Chg": 64.02632346663133,
                        "Put_Now": 6.806399190715638,
                        "Put_Sim": 1.5850745291240287,
                        "Put_Chg": -76.71199580409314
                    },
                    {
                        "Strike": 5303.5,
                        "Call_Now": 28.40340604404355,
                        "Call_Sim": 59.11703236814628,
                        "Call_Chg": 108.1336029787303,
                        "Put_Now": 24.19594890661574,
                        "Put_Sim": 8.40957523071711,
                        "Put_Chg": -65.24387093403999
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.446761581967166,
                        "Call_Sim": 28.65244128134873,
                        "Call_Chg": 174.2710365938433,
                        "Put_Now": 52.70241432350667,
                        "Put_Sim": 24.4080940228896,
                        "Put_Chg": -53.68695279676601
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 2.493297943054131,
                        "Call_Sim": 9.7602133820385,
                        "Call_Chg": 291.45796471010044,
                        "Put_Now": 94.70928388778702,
                        "Put_Sim": 55.47619932677026,
                        "Put_Chg": -41.4247505107321
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 5250.0,
                "options": [
                    {
                        "Strike": 5250.0,
                        "Call_Now": 64.47141285555972,
                        "Call_Sim": 28.11688163123017,
                        "Call_Chg": -56.388606382455755,
                        "Put_Now": 6.806399190715638,
                        "Put_Sim": 23.951867966386544,
                        "Put_Chg": 251.90219226428005
                    },
                    {
                        "Strike": 5303.5,
                        "Call_Now": 28.40340604404355,
                        "Call_Sim": 8.540481706814035,
                        "Call_Chg": -69.93148746466957,
                        "Put_Now": 24.19594890661574,
                        "Put_Sim": 57.83302456938509,
                        "Put_Chg": 139.01945235787875
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.446761581967166,
                        "Call_Sim": 2.126014144613748,
                        "Call_Chg": -79.64906035298442,
                        "Put_Now": 52.70241432350667,
                        "Put_Sim": 97.88166688615365,
                        "Put_Chg": 85.7252047037546
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 2.493297943054131,
                        "Call_Sim": 0.31722948682153174,
                        "Call_Chg": -87.27671164590359,
                        "Put_Now": 94.70928388778702,
                        "Put_Sim": 146.0332154315538,
                        "Put_Chg": 54.19102482558746
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5356.535,
                "options": [
                    {
                        "Strike": 5250.0,
                        "Call_Now": 64.47141285555972,
                        "Call_Sim": 111.95446811992497,
                        "Call_Chg": 73.64978237834681,
                        "Put_Now": 6.806399190715638,
                        "Put_Sim": 1.2544544550811736,
                        "Put_Chg": -81.56948454048465
                    },
                    {
                        "Strike": 5303.5,
                        "Call_Now": 28.40340604404355,
                        "Call_Sim": 64.30969778722374,
                        "Call_Chg": 126.41544358272505,
                        "Put_Now": 24.19594890661574,
                        "Put_Sim": 7.067240649795167,
                        "Put_Chg": -70.79163674435262
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.446761581967166,
                        "Call_Sim": 32.2302435474935,
                        "Call_Chg": 208.51899217388302,
                        "Put_Now": 52.70241432350667,
                        "Put_Sim": 21.450896289034063,
                        "Put_Chg": -59.29807663580529
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 2.493297943054131,
                        "Call_Sim": 11.487741299200707,
                        "Call_Chg": 360.7448271957806,
                        "Put_Now": 94.70928388778702,
                        "Put_Sim": 50.66872724393306,
                        "Put_Chg": -46.50078095409725
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 5250.465,
                "options": [
                    {
                        "Strike": 5250.0,
                        "Call_Now": 64.47141285555972,
                        "Call_Sim": 28.363046143004794,
                        "Call_Chg": -56.00678674973555,
                        "Put_Now": 6.806399190715638,
                        "Put_Sim": 23.73303247816102,
                        "Put_Chg": 248.68704895437793
                    },
                    {
                        "Strike": 5303.5,
                        "Call_Now": 28.40340604404355,
                        "Call_Sim": 8.646807178977951,
                        "Call_Chg": -69.55714689439063,
                        "Put_Now": 24.19594890661574,
                        "Put_Sim": 57.47435004154886,
                        "Put_Chg": 137.53707805951774
                    },
                    {
                        "Strike": 5350.0,
                        "Call_Now": 10.446761581967166,
                        "Call_Sim": 2.160418654006264,
                        "Call_Chg": -79.31972853926807,
                        "Put_Now": 52.70241432350667,
                        "Put_Sim": 97.45107139554602,
                        "Put_Chg": 84.90817289195851
                    },
                    {
                        "Strike": 5400.0,
                        "Call_Now": 2.493297943054131,
                        "Call_Sim": 0.32375565238058357,
                        "Call_Chg": -87.0149633226744,
                        "Put_Now": 94.70928388778702,
                        "Put_Sim": 145.57474159711273,
                        "Put_Chg": 53.70693940584733
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.31536082185887526,
            0.5,
            0.30483613188864433,
            2.145126608983826e-06,
            -0.024097579308987073,
            6.137473066234083e-72
        ]
    },
    "delta_data": {
        "strikes": [
            5250.0,
            5350.0,
            5400.0,
            5650.0,
            5750.0,
            6800.0
        ],
        "delta_values": [
            -789.3553660913199,
            -4616.645711009166,
            208.37676344686682,
            8.596213409021747e-05,
            -444.99999997401585,
            2.3897570905362525e-86
        ],
        "delta_cumulative": [
            -789.3553660913199,
            -5406.001077100485,
            -5197.624313653619,
            -5197.6242276914845,
            -5642.6242276655,
            -5642.6242276655
        ]
    },
    "gamma_data": {
        "strikes": [
            5250.0,
            5350.0,
            5400.0,
            5650.0,
            5750.0,
            6800.0
        ],
        "gamma_values": [
            45655000.80734936,
            81288161.17927492,
            15445094.18155095,
            18.062857710733628,
            0.006901229777410183,
            1.9265265112334523e-80
        ],
        "gamma_call": [
            0.0,
            4888905.6436672285,
            15445094.18155095,
            18.062857710733628,
            0.0,
            1.9265265112334523e-80
        ],
        "gamma_put": [
            45655000.80734936,
            76399255.5356077,
            0.0,
            0.0,
            0.006901229777410183,
            0.0
        ],
        "gamma_exposure": [
            45655000.80734936,
            126943161.98662427,
            142388256.16817522,
            142388274.23103294,
            142388274.23793417,
            142388274.23793417
        ]
    },
    "volume_data": {
        "strikes": [
            5250.0,
            5350.0,
            5400.0,
            5650.0,
            5750.0,
            6800.0
        ],
        "call_volume": [
            0.0,
            750.0,
            2500.0,
            350.0,
            0.0,
            380.0
        ],
        "put_volume": [
            4210.0,
            7700.0,
            0.0,
            0.0,
            445.0,
            0.0
        ],
        "total_volume": [
            4210.0,
            8450.0,
            2500.0,
            350.0,
            445.0,
            380.0
        ]
    },
    "volatility_data": {
        "strikes": [
            5250.0,
            5350.0,
            5400.0,
            5650.0,
            5750.0,
            6800.0
        ],
        "iv_values": [
            9.85,
            9.85,
            9.85,
            9.85,
            9.85,
            9.85
        ],
        "skew": [
            0.0,
            0.0,
            1.0842021724855044e-19,
            0.0,
            -1.2027867851011065e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            5250.0,
            5350.0,
            5400.0,
            5650.0,
            5750.0,
            6800.0
        ],
        "charm": [
            -27345.607048755843,
            36518.097244366756,
            18293.142794166568,
            0.16214737438917126,
            0.0002538956594066999,
            8.893798034521383e-67
        ],
        "vanna": [
            -10083.173473441848,
            11162.800645432828,
            5394.65460720694,
            0.04352918885634195,
            5.52119473196111e-05,
            2.1811847792374413e-69
        ],
        "vex": [
            757140.7216827007,
            3780402.1549879666,
            256140.82900627828,
            0.29955371549473864,
            0.000114449720770246,
            3.194943921283085e-82
        ],
        "theta": [
            -8485.985388762254,
            -11634.613285419086,
            -3371.768266680044,
            -0.0037785036963430196,
            507.2857231019083,
            -3.9589061321232057e-84
        ],
        "charm_cum": [
            -27345.607048755843,
            9172.490195610913,
            27465.63298977748,
            27465.795137151872,
            27465.79539104753,
            27465.79539104753
        ],
        "vanna_cum": [
            -10083.173473441848,
            1079.62717199098,
            6474.2817791979205,
            6474.325308386777,
            6474.325363598724,
            6474.325363598724
        ],
        "theta_cum": [
            -8485.985388762254,
            -20120.59867418134,
            -23492.366940861382,
            -23492.370719365077,
            -22985.08499626317,
            -22985.08499626317
        ],
        "r_gamma": [
            45655000.80734936,
            -81288161.17927492,
            -15445094.18155095,
            -18.062857710733628,
            -0.006901229777410183,
            -1.9265265112334523e-80
        ],
        "r_gamma_cum": [
            45655000.80734936,
            -35633160.371925555,
            -51078254.553476505,
            -51078272.616334215,
            -51078272.62323544,
            -51078272.62323544
        ]
    },
    "detailed_data": [
        {
            "strike": 5250.0,
            "delta": -789.3553660913199,
            "gamma": 45655000.80734936,
            "volume": 0,
            "oi": 4210,
            "iv": 9.85
        },
        {
            "strike": 5350.0,
            "delta": -4616.645711009166,
            "gamma": 81288161.17927492,
            "volume": 0,
            "oi": 8450,
            "iv": 9.85
        },
        {
            "strike": 5400.0,
            "delta": 208.37676344686682,
            "gamma": 15445094.18155095,
            "volume": 0,
            "oi": 2500,
            "iv": 9.85
        },
        {
            "strike": 5650.0,
            "delta": 8.596213409021747e-05,
            "gamma": 18.062857710733628,
            "volume": 0,
            "oi": 350,
            "iv": 9.85
        },
        {
            "strike": 5750.0,
            "delta": -444.99999997401585,
            "gamma": 0.006901229777410183,
            "volume": 0,
            "oi": 445,
            "iv": 9.85
        },
        {
            "strike": 6800.0,
            "delta": 2.3897570905362525e-86,
            "gamma": 1.9265265112334523e-80,
            "volume": 0,
            "oi": 380,
            "iv": 9.85
        }
    ]
};