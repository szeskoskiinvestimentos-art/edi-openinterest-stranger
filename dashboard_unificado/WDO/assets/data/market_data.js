window.marketData = {
    "last_updated": "2026-05-04 08:33:01",
    "spot_price": 4992.0,
    "ntsl_script": "// NTSL Indicator - Edi OpenInterest Levels - 04/05/2026 08:33\n// Gerado Automaticamente\n\nconst\n  clCallWall = clBlue;\n  clPutWall = clRed;\n  clGammaFlip = clFuchsia;\n  clDeltaFlip = clYellow;\n  clRangeHigh = clLime;\n  clRangeLow = clRed;\n  clMaxPain = clPurple;\n  clExpMove = clWhite;\n  clEdiWall = clSilver;\n  clEffectiveWall = clAqua;\n  clFib = clYellow;\n  TamanhoFonte = 8;\n\ninput\n  ExibirWalls(true);\n  ExibirFlips(true);\n  ExibirRange(true);\n  ExibirMaxPain(true);\n  ExibirExpMoves(true);\n  ExibirEdiWall(false);\n  ExibirEffectiveWalls(true);\n  MostrarPLUS(false);\n  MostrarPLUS2(false);\n  ExibirMelhoresPontos(true);\n  ModeloFlip(7);\n  spot(0);\n  // 1 = Classic (4850.00)\n  // 2 = Spline (4850.00)\n  // 3 = HVL (4850.00)\n  // 4 = HVL Log (4850.00)\n  // 5 = Sigma Kernel (4850.00)\n  // 6 = PVOP (4850.00)\n  // 7 = HVL Gaussian (4850.00)\n\nvar\n  GammaVal: Float;\n\nbegin\n  // Inicializa GammaVal com o primeiro disponivel por seguranca\n  GammaVal := 4850.00;\n\n  if (ModeloFlip = 1) then GammaVal := 4850.00;\n  if (ModeloFlip = 2) then GammaVal := 4850.00;\n  if (ModeloFlip = 3) then GammaVal := 4850.00;\n  if (ModeloFlip = 4) then GammaVal := 4850.00;\n  if (ModeloFlip = 5) then GammaVal := 4850.00;\n  if (ModeloFlip = 6) then GammaVal := 4850.00;\n  if (ModeloFlip = 7) then GammaVal := 4850.00;\n\n  // --- Linhas Principais (Com Intercala\u00e7\u00e3o de Texto) ---\n  if (ExibirWalls) then\n    HorizontalLineCustom(4850.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4900.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(4900.00, clRangeLow, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(4907.17, clEffectiveWall, 2, psDashDot, \"Edi Effective Put\", TamanhoFonte, tpBottomRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4925.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(4950.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5050.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5150.00, clPutWall, 1, psDash, \"PutWall\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirMaxPain) then\n    HorizontalLineCustom(5150.00, clMaxPain, 2, psSolid, \"Edi_MaxPain\", TamanhoFonte, tpBottomRight, CurrentDate, 0);\n  if (ExibirRange) then\n    HorizontalLineCustom(5150.00, clRangeHigh, 1, psDot, \"Edi_Range_1D\", TamanhoFonte, tpTopRight, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5200.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirEffectiveWalls) then\n    HorizontalLineCustom(5246.07, clEffectiveWall, 2, psDashDot, \"Edi Effective Call\", TamanhoFonte, tpTopLeft, 0, 0);\n  if (ExibirWalls) then\n    HorizontalLineCustom(5350.00, clCallWall, 1, psDash, \"CallWall\", TamanhoFonte, tpTopLeft, 0, 0);\n\n  // Flips (Din\u00e2micos)\n  if (ExibirFlips) then begin\n    if (GammaVal > 0) then\n      HorizontalLineCustom(GammaVal, clGammaFlip, 2, psDash, \"Edi_GammaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    if (5069.94 > 0) then\n      HorizontalLineCustom(5069.94, clDeltaFlip, 2, psDash, \"Edi_DeltaFlip\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\n\n  // Edi_Wall (Midpoints) - Grid Completo\n  if (ExibirEdiWall) then begin\n    HorizontalLineCustom(4875.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4912.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4937.50, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5000.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5100.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5175.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5275.00, clEdiWall, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS) then begin\n    HorizontalLineCustom(4869.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4880.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4909.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4915.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4934.55, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4940.45, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4988.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5011.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5088.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5111.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5169.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5180.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5257.30, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5292.70, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (MostrarPLUS2) then begin\n    HorizontalLineCustom(4861.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4888.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4905.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4919.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4930.90, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4944.10, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(4973.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5026.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5073.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5126.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5161.80, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5188.20, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5235.40, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n    HorizontalLineCustom(5314.60, clFib, 1, psDash, \"Edi_Wall\", TamanhoFonte, tpTopLeft, CurrentDate, 0);\n  end;\n\n  if (ExibirMelhoresPontos) then\n  begin\n    HorizontalLineCustom(4994.47, clRed, 1, psDash, \"Edi_Wall_Venda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4989.53, clLime, 1, psDash, \"Edi_Wall_Compra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5003.89, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4980.13, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5028.38, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4955.88, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(5146.63, clRed, 1, psDash, \"Edi_Wall_MelhorVenda\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n    HorizontalLineCustom(4842.02, clLime, 1, psDash, \"Edi_Wall_MelhorCompra\", TamanhoFonte, tpTopRight, CurrentDate, 0);\n  end;\nend;",
    "market_sentiment": {
        "score": 65,
        "label": "Bullish",
        "delta_sign": "negative"
    },
    "overview": {
        "open_interest_total": 15395,
        "volume_total": 9355,
        "total_trades": 15395,
        "total_volume": 15395,
        "gamma_exposure": 61670753.35496655,
        "delta_position": -1848.1478895436785,
        "last_update": "2026-05-04T08:33:01.251433",
        "spot_price": 4992.0,
        "dealer_pressure": -0.007114001390212765,
        "regime": "Gamma Positivo"
    },
    "key_levels": {
        "gamma_flip": 4850.0,
        "gamma_flip_hvl": 4850.0,
        "gamma_flip_hvl_gaussian": 4850.0,
        "call_wall": 5150.0,
        "put_wall": 4900.0,
        "effective_call_wall": 5246.069868995633,
        "effective_put_wall": 4907.173601147776,
        "max_pain": 5150.0,
        "zero_gamma": 4850.0,
        "range_low": 4954.2640270147585,
        "range_high": 5029.7359729852415,
        "expected_moves": [
            {
                "label": "1 Dia",
                "days": 1,
                "move": 37.73597298524125,
                "upper": 5029.7359729852415,
                "lower": 4954.2640270147585
            },
            {
                "label": "1 Semana",
                "days": 5,
                "move": 84.38020079209508,
                "upper": 5076.380200792095,
                "lower": 4907.619799207905
            },
            {
                "label": "Expira\u00e7\u00e3o",
                "days": 20.0,
                "move": 168.76040158419016,
                "upper": 5160.76040158419,
                "lower": 4823.23959841581
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
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2380.0,
            1700.0,
            2200.0
        ],
        "put_oi": [
            740.0,
            4970.0,
            2000.0,
            640.0,
            500.0,
            265.0,
            0.0,
            0.0
        ],
        "total_oi": [
            740.0,
            4970.0,
            2000.0,
            640.0,
            500.0,
            2645.0,
            1700.0,
            2200.0
        ]
    },
    "oi_data_nearest": {
        "strikes": [
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
        ],
        "call_oi": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2380.0,
            1700.0,
            2200.0
        ],
        "put_oi": [
            740.0,
            4970.0,
            2000.0,
            640.0,
            500.0,
            265.0,
            0.0,
            0.0
        ],
        "total_oi": [
            740.0,
            4970.0,
            2000.0,
            640.0,
            500.0,
            2645.0,
            1700.0,
            2200.0
        ]
    },
    "oi_by_expiry": [
        {
            "expiry": "2026-06-01",
            "days_to_exp": 20,
            "call_oi": 6280,
            "put_oi": 9115
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
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0,
                4850.0
            ]
        },
        "delta_flip_profile": {
            "spots": [
                4243.2,
                4273.763265306122,
                4304.326530612245,
                4334.889795918367,
                4365.45306122449,
                4396.016326530612,
                4426.579591836735,
                4457.142857142857,
                4487.706122448979,
                4518.269387755102,
                4548.832653061224,
                4579.395918367347,
                4609.959183673469,
                4640.522448979592,
                4671.085714285714,
                4701.648979591836,
                4732.212244897959,
                4762.775510204081,
                4793.338775510204,
                4823.902040816326,
                4854.465306122449,
                4885.028571428571,
                4915.591836734693,
                4946.155102040816,
                4976.718367346938,
                5007.281632653061,
                5037.844897959183,
                5068.408163265306,
                5098.971428571428,
                5129.534693877551,
                5160.097959183673,
                5190.661224489795,
                5221.224489795918,
                5251.78775510204,
                5282.351020408163,
                5312.914285714285,
                5343.477551020407,
                5374.04081632653,
                5404.604081632652,
                5435.167346938775,
                5465.730612244897,
                5496.293877551019,
                5526.857142857142,
                5557.420408163265,
                5587.983673469387,
                5618.546938775509,
                5649.110204081632,
                5679.673469387754,
                5710.236734693877,
                5740.799999999999
            ],
            "deltas": [
                -9114.834992862481,
                -9114.599140487688,
                -9114.071396227266,
                -9112.946411329882,
                -9110.659556085742,
                -9106.222233958446,
                -9097.995850109968,
                -9083.410606260442,
                -9058.656707276716,
                -9018.40288616531,
                -8955.623734939158,
                -8861.63270239916,
                -8726.410166199126,
                -8539.277588339462,
                -8289.899953797149,
                -7969.511850476232,
                -7572.180804401574,
                -7095.872474272483,
                -6543.088343538873,
                -5920.914919280225,
                -5240.441307356806,
                -4515.63876250833,
                -3761.9126583584903,
                -2994.6007505829343,
                -2227.684970717686,
                -1472.912802183938,
                -739.4131994297486,
                -33.77513678491846,
                639.5342035263184,
                1277.580442988293,
                1878.3684100999833,
                2440.369806230096,
                2962.2386619174686,
                3442.7219012949554,
                3880.727283764662,
                4275.486532961906,
                4626.746999879918,
                4934.935600499269,
                5201.257253236653,
                5427.71049567766,
                5617.02106940123,
                5772.5077001890895,
                5897.902334071166,
                5997.15001894679,
                6074.21232453816,
                6132.893828965457,
                6176.705030487597,
                6208.768299566873,
                6231.767240639945,
                6247.934876334937
            ],
            "flip_value": 5069.941304727195
        },
        "flow_sentiment": {
            "bull": [
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                1045.0,
                200.0,
                500.0
            ],
            "bear": [
                -240.0,
                -2900.0,
                -3500.0,
                -440.0,
                -265.0,
                -265.0,
                -0.0,
                -0.0
            ]
        },
        "mm_pnl": {
            "spots": [
                4243.2,
                4273.763265306122,
                4304.326530612245,
                4334.889795918367,
                4365.45306122449,
                4396.016326530612,
                4426.579591836735,
                4457.142857142857,
                4487.706122448979,
                4518.269387755102,
                4548.832653061224,
                4579.395918367347,
                4609.959183673469,
                4640.522448979592,
                4671.085714285714,
                4701.648979591836,
                4732.212244897959,
                4762.775510204081,
                4793.338775510204,
                4823.902040816326,
                4854.465306122449,
                4885.028571428571,
                4915.591836734693,
                4946.155102040816,
                4976.718367346938,
                5007.281632653061,
                5037.844897959183,
                5068.408163265306,
                5098.971428571428,
                5129.534693877551,
                5160.097959183673,
                5190.661224489795,
                5221.224489795918,
                5251.78775510204,
                5282.351020408163,
                5312.914285714285,
                5343.477551020407,
                5374.04081632653,
                5404.604081632652,
                5435.167346938775,
                5465.730612244897,
                5496.293877551019,
                5526.857142857142,
                5557.420408163265,
                5587.983673469387,
                5618.546938775509,
                5649.110204081632,
                5679.673469387754,
                5710.236734693877,
                5740.799999999999
            ],
            "pnl": [
                -6994012.312969965,
                -6658950.868689296,
                -6323900.545861555,
                -5988874.434662347,
                -5653898.574970553,
                -5319022.245924807,
                -4984334.221374121,
                -4649986.816024581,
                -4316229.051139619,
                -3983449.0166985835,
                -3652223.408767859,
                -3323369.451638603,
                -2997991.496427262,
                -2677512.3588028327,
                -2363678.88355312,
                -2058533.0743054864,
                -1764344.622266835,
                -1483507.2301322008,
                -1218408.3878929927,
                -971288.3745490463,
                -744107.4727250041,
                -538439.6114582133,
                -355405.9072025033,
                -195654.00476739637,
                -59380.66899626271,
                53612.14199440193,
                143841.84530682897,
                212065.34807690402,
                259207.14833385398,
                286303.27504427533,
                294463.685548008,
                284851.201299541,
                258672.09995518753,
                217172.37486955815,
                161634.18575002265,
                93368.60566688736,
                13702.784352114424,
                -76038.44461842149,
                -174555.03603630664,
                -280595.96744090004,
                -392982.67561487656,
                -510629.3780561277,
                -632558.5336225753,
                -757910.4337299165,
                -885946.6749134414,
                -1016047.9333308066,
                -1147706.96733208,
                -1280518.079445844,
                -1414164.3734357487,
                -1548404.0736129875
            ]
        },
        "max_pain_profile": {
            "strikes": [
                4850.0,
                4900.0,
                4925.0,
                4950.0,
                5050.0,
                5150.0,
                5200.0,
                5350.0
            ],
            "loss": [
                642000.0,
                223250.0,
                138125.0,
                103000.0,
                26500.0,
                0.0,
                119000.0,
                731000.0
            ]
        },
        "fair_value_sims": [
            {
                "scenario": "Call Wall",
                "target_spot": 5150.0,
                "options": [
                    {
                        "Strike": 4850.0,
                        "Call_Now": 175.8186105881905,
                        "Call_Sim": 321.1071198968457,
                        "Call_Chg": 82.63545526983822,
                        "Put_Now": 14.610714951816817,
                        "Put_Sim": 1.8992242604725504,
                        "Put_Chg": -87.00115451751809
                    },
                    {
                        "Strike": 4900.0,
                        "Call_Now": 136.58059773990044,
                        "Call_Sim": 273.44470511340296,
                        "Call_Chg": 100.20757679955537,
                        "Put_Now": 25.17468256088455,
                        "Put_Sim": 4.038789934387182,
                        "Put_Chg": -83.95693798871372
                    },
                    {
                        "Strike": 4992.0,
                        "Call_Now": 77.53659015826952,
                        "Call_Sim": 190.99162349842572,
                        "Call_Chg": 146.3245070599173,
                        "Put_Now": 57.76631902078998,
                        "Put_Sim": 13.221352360946412,
                        "Put_Chg": -77.1123509597555
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 20.405180160418695,
                        "Call_Sim": 79.99067293972075,
                        "Call_Chg": 292.01159857869845,
                        "Put_Now": 158.00916726818696,
                        "Put_Sim": 59.594660047489015,
                        "Put_Chg": -62.284049034737485
                    }
                ]
            },
            {
                "scenario": "Put Wall",
                "target_spot": 4900.0,
                "options": [
                    {
                        "Strike": 4850.0,
                        "Call_Now": 175.8186105881905,
                        "Call_Sim": 105.94273444072951,
                        "Call_Chg": -39.74316252056337,
                        "Put_Now": 14.610714951816817,
                        "Put_Sim": 36.734838804356514,
                        "Put_Chg": 151.42396471014993
                    },
                    {
                        "Strike": 4900.0,
                        "Call_Now": 136.58059773990044,
                        "Call_Sim": 76.10763056400583,
                        "Call_Chg": -44.27639663069664,
                        "Put_Now": 25.17468256088455,
                        "Put_Sim": 56.701715384990166,
                        "Put_Chg": 125.23308982291243
                    },
                    {
                        "Strike": 4992.0,
                        "Call_Now": 77.53659015826952,
                        "Call_Sim": 36.59390055757467,
                        "Call_Chg": -52.80434633135358,
                        "Put_Now": 57.76631902078998,
                        "Put_Sim": 108.82362942009559,
                        "Put_Chg": 88.38595095687192
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 20.405180160418695,
                        "Call_Sim": 6.862446156690112,
                        "Call_Chg": -66.36909793131029,
                        "Put_Now": 158.00916726818696,
                        "Put_Sim": 236.46643326445792,
                        "Put_Chg": 49.653616529164054
                    }
                ]
            },
            {
                "scenario": "Gamma Flip",
                "target_spot": 4850.0,
                "options": [
                    {
                        "Strike": 4850.0,
                        "Call_Now": 175.8186105881905,
                        "Call_Sim": 75.33102208886294,
                        "Call_Chg": -57.1541250173417,
                        "Put_Now": 14.610714951816817,
                        "Put_Sim": 56.123126452490396,
                        "Put_Chg": 284.1230674718733
                    },
                    {
                        "Strike": 4900.0,
                        "Call_Now": 136.58059773990044,
                        "Call_Sim": 51.44840654820837,
                        "Call_Chg": -62.3311016355449,
                        "Put_Now": 25.17468256088455,
                        "Put_Sim": 82.04249136919225,
                        "Put_Chg": 225.89285354750297
                    },
                    {
                        "Strike": 4992.0,
                        "Call_Now": 77.53659015826952,
                        "Call_Sim": 22.295797738769352,
                        "Call_Chg": -71.24480494530565,
                        "Put_Now": 57.76631902078998,
                        "Put_Sim": 144.52552660128958,
                        "Put_Chg": 150.1899533347021
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 20.405180160418695,
                        "Call_Sim": 3.413471877891368,
                        "Call_Chg": -83.2715425639186,
                        "Put_Now": 158.00916726818696,
                        "Put_Sim": 283.0174589856597,
                        "Put_Chg": 79.11458169088237
                    }
                ]
            },
            {
                "scenario": "+1%",
                "target_spot": 5041.92,
                "options": [
                    {
                        "Strike": 4850.0,
                        "Call_Now": 175.8186105881905,
                        "Call_Sim": 219.30012685702332,
                        "Call_Chg": 24.730895167108898,
                        "Put_Now": 14.610714951816817,
                        "Put_Sim": 8.172231220650474,
                        "Put_Chg": -44.06686293175358
                    },
                    {
                        "Strike": 4900.0,
                        "Call_Now": 136.58059773990044,
                        "Call_Sim": 176.33846602899212,
                        "Call_Chg": 29.109455476835176,
                        "Put_Now": 25.17468256088455,
                        "Put_Sim": 15.012550849975696,
                        "Put_Chg": -40.36647408098158
                    },
                    {
                        "Strike": 4992.0,
                        "Call_Now": 77.53659015826952,
                        "Call_Sim": 108.01392672747261,
                        "Call_Chg": 39.30703749931746,
                        "Put_Now": 57.76631902078998,
                        "Put_Sim": 38.323655589992995,
                        "Put_Chg": -33.65743872965077
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 20.405180160418695,
                        "Call_Sim": 33.475498344814696,
                        "Call_Chg": 64.05392200236183,
                        "Put_Now": 158.00916726818696,
                        "Put_Sim": 121.15948545258289,
                        "Put_Chg": -23.321230313846016
                    }
                ]
            },
            {
                "scenario": "-1%",
                "target_spot": 4942.08,
                "options": [
                    {
                        "Strike": 4850.0,
                        "Call_Now": 175.8186105881905,
                        "Call_Sim": 135.95521616981796,
                        "Call_Chg": -22.67302322832149,
                        "Put_Now": 14.610714951816817,
                        "Put_Sim": 24.667320533445036,
                        "Put_Chg": 68.83034550186538
                    },
                    {
                        "Strike": 4900.0,
                        "Call_Now": 136.58059773990044,
                        "Call_Sim": 101.46766375766538,
                        "Call_Chg": -25.708581279679983,
                        "Put_Now": 25.17468256088455,
                        "Put_Sim": 39.9817485786491,
                        "Put_Chg": 58.81728987824937
                    },
                    {
                        "Strike": 4992.0,
                        "Call_Now": 77.53659015826952,
                        "Call_Sim": 52.856582632417485,
                        "Call_Chg": -31.830143001484355,
                        "Put_Now": 57.76631902078998,
                        "Put_Sim": 83.00631149493802,
                        "Put_Chg": 43.693267810718936
                    },
                    {
                        "Strike": 5150.0,
                        "Call_Now": 20.405180160418695,
                        "Call_Sim": 11.641066557828594,
                        "Call_Chg": -42.95043480963938,
                        "Put_Now": 158.00916726818696,
                        "Put_Sim": 199.16505366559704,
                        "Put_Chg": 26.04651812863283
                    }
                ]
            }
        ],
        "dealer_pressure_profile": [
            -0.0775892568044951,
            -0.4497880899377381,
            -0.1517810423225901,
            -0.036720305897820035,
            0.011794317231416633,
            0.5909251139756678,
            0.3691324997606208,
            0.19476054655947844
        ]
    },
    "delta_data": {
        "strikes": [
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
        ],
        "delta_values": [
            -119.58195793015254,
            -1226.707406716653,
            -593.3508643070664,
            -224.26281860648368,
            -291.0786899389249,
            305.02807616799277,
            240.68692448568424,
            61.11884730192524
        ],
        "delta_cumulative": [
            -119.58195793015254,
            -1346.2893646468056,
            -1939.6402289538719,
            -2163.9030475603554,
            -2454.9817374992804,
            -2149.9536613312875,
            -1909.2667368456032,
            -1848.147889543678
        ]
    },
    "gamma_data": {
        "strikes": [
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
        ],
        "gamma_values": [
            2680312.845526593,
            23200180.29154269,
            10232844.655200485,
            3507591.738526784,
            2887434.5741772684,
            11446279.901288752,
            5639113.0038134875,
            2076996.3448904902
        ],
        "gamma_call": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            10299488.15314451,
            5639113.0038134875,
            2076996.3448904902
        ],
        "gamma_put": [
            2680312.845526593,
            23200180.29154269,
            10232844.655200485,
            3507591.738526784,
            2887434.5741772684,
            1146791.7481442417,
            0.0,
            0.0
        ],
        "gamma_exposure": [
            2680312.845526593,
            25880493.137069285,
            36113337.79226977,
            39620929.53079655,
            42508364.104973815,
            53954644.00626257,
            59593757.01007606,
            61670753.35496655
        ]
    },
    "volume_data": {
        "strikes": [
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
        ],
        "call_volume": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            2380.0,
            1700.0,
            2200.0
        ],
        "put_volume": [
            740.0,
            4970.0,
            2000.0,
            640.0,
            500.0,
            265.0,
            0.0,
            0.0
        ],
        "total_volume": [
            740.0,
            4970.0,
            2000.0,
            640.0,
            500.0,
            2645.0,
            1700.0,
            2200.0
        ]
    },
    "volatility_data": {
        "strikes": [
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
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
            4.336808689942018e-19,
            0.0,
            -1.8973538018496328e-19,
            0.0,
            2.168404344971009e-19,
            1.3552527156068805e-19,
            0.0
        ]
    },
    "greeks_2nd_order": {
        "strikes": [
            4850.0,
            4900.0,
            4925.0,
            4950.0,
            5050.0,
            5150.0,
            5200.0,
            5350.0
        ],
        "charm": [
            -822.1336098814331,
            -4117.280270221072,
            -1159.213202279482,
            -173.28605426984652,
            586.0804724641873,
            5152.059203709516,
            3223.736765578672,
            1929.514657259248
        ],
        "vanna": [
            -1441.3825787947999,
            -8537.427821007917,
            -2898.4377554771013,
            -696.8089835758384,
            394.8375140457927,
            5307.498799627504,
            3513.5178760031695,
            2263.9584569178287
        ],
        "vex": [
            254859.46142607142,
            2206005.714578687,
            972997.3432144915,
            333521.86588048947,
            274553.7789389128,
            1088377.700328256,
            536199.0879054653,
            197492.68102273002
        ],
        "theta": [
            -643.9900781171693,
            -5378.167630510443,
            -2318.5087254767514,
            -773.2871314981248,
            -526.5977137794015,
            -3549.312346644045,
            -1842.9355182628738,
            -652.2396686430876
        ],
        "charm_cum": [
            -822.1336098814331,
            -4939.413880102506,
            -6098.627082381988,
            -6271.913136651834,
            -5685.8326641876465,
            -533.7734604781308,
            2689.963305100541,
            4619.47796235979
        ],
        "vanna_cum": [
            -1441.3825787947999,
            -9978.810399802718,
            -12877.24815527982,
            -13574.057138855658,
            -13179.219624809866,
            -7871.720825182362,
            -4358.202949179193,
            -2094.244492261364
        ],
        "theta_cum": [
            -643.9900781171693,
            -6022.157708627612,
            -8340.666434104363,
            -9113.95356560249,
            -9640.55127938189,
            -13189.863626025935,
            -15032.799144288809,
            -15685.038812931896
        ],
        "r_gamma": [
            2680312.845526593,
            23200180.29154269,
            10232844.655200485,
            3507591.738526784,
            -2887434.5741772684,
            -11446279.901288752,
            -5639113.0038134875,
            -2076996.3448904902
        ],
        "r_gamma_cum": [
            2680312.845526593,
            25880493.137069285,
            36113337.79226977,
            39620929.53079655,
            36733494.956619285,
            25287215.055330534,
            19648102.051517047,
            17571105.706626557
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
            "strike": 4850.0,
            "delta": -119.58195793015254,
            "gamma": 2680312.845526593,
            "volume": 0,
            "oi": 740,
            "iv": 12.0
        },
        {
            "strike": 4900.0,
            "delta": -1226.707406716653,
            "gamma": 23200180.29154269,
            "volume": 0,
            "oi": 4970,
            "iv": 12.0
        },
        {
            "strike": 4925.0,
            "delta": -593.3508643070664,
            "gamma": 10232844.655200485,
            "volume": 0,
            "oi": 2000,
            "iv": 12.0
        },
        {
            "strike": 4950.0,
            "delta": -224.26281860648368,
            "gamma": 3507591.738526784,
            "volume": 0,
            "oi": 640,
            "iv": 12.0
        },
        {
            "strike": 5050.0,
            "delta": -291.0786899389249,
            "gamma": 2887434.5741772684,
            "volume": 0,
            "oi": 500,
            "iv": 12.0
        },
        {
            "strike": 5150.0,
            "delta": 305.02807616799277,
            "gamma": 11446279.901288752,
            "volume": 0,
            "oi": 2645,
            "iv": 12.0
        },
        {
            "strike": 5200.0,
            "delta": 240.68692448568424,
            "gamma": 5639113.0038134875,
            "volume": 0,
            "oi": 1700,
            "iv": 12.0
        },
        {
            "strike": 5350.0,
            "delta": 61.11884730192524,
            "gamma": 2076996.3448904902,
            "volume": 0,
            "oi": 2200,
            "iv": 12.0
        }
    ],
    "fed_watch_rates": {
        "source": "Investing Fed Rate Monitor",
        "last_update": "2026-05-04",
        "meetings": [
            {
                "date": "2026-06-17",
                "days_remaining": 44,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.25-3.50": 6.8,
                    "3.50-3.75": 93.2
                }
            },
            {
                "date": "2026-07-29",
                "days_remaining": 86,
                "current_rate": "3.50-3.75",
                "probs": {
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 8.7,
                    "3.50-3.75": 91.2
                }
            },
            {
                "date": "2026-09-16",
                "days_remaining": 135,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.4,
                    "3.25-3.50": 10.8,
                    "3.50-3.75": 88.8
                }
            },
            {
                "date": "2026-10-28",
                "days_remaining": 177,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.4,
                    "3.25-3.50": 10.4,
                    "3.50-3.75": 85.2,
                    "3.75-4.00": 4.1
                }
            },
            {
                "date": "2026-12-09",
                "days_remaining": 219,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.3,
                    "3.25-3.50": 9.3,
                    "3.50-3.75": 77.7,
                    "3.75-4.00": 12.3,
                    "4.00-4.25": 0.4
                }
            },
            {
                "date": "2027-01-27",
                "days_remaining": 268,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.3,
                    "3.25-3.50": 8.3,
                    "3.50-3.75": 69.5,
                    "3.75-4.00": 20.1,
                    "4.00-4.25": 1.8,
                    "4.25-4.50": 0.0
                }
            },
            {
                "date": "2027-03-17",
                "days_remaining": 317,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 7.2,
                    "3.50-3.75": 61.2,
                    "3.75-4.00": 26.8,
                    "4.00-4.25": 4.3,
                    "4.25-4.50": 0.3,
                    "4.50-4.75": 0.0
                }
            },
            {
                "date": "2027-04-28",
                "days_remaining": 359,
                "current_rate": "3.50-3.75",
                "probs": {
                    "2.00-2.25": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.2,
                    "3.25-3.50": 6.9,
                    "3.50-3.75": 58.8,
                    "3.75-4.00": 28.3,
                    "4.00-4.25": 5.3,
                    "4.25-4.50": 0.5,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 0.0
                }
            },
            {
                "date": "2027-06-09",
                "days_remaining": 401,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.0,
                    "3.00-3.25": 0.8,
                    "3.25-3.50": 11.0,
                    "3.50-3.75": 56.4,
                    "3.75-4.00": 26.5,
                    "4.00-4.25": 4.9,
                    "4.25-4.50": 0.4,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 0.0
                }
            },
            {
                "date": "2027-07-28",
                "days_remaining": 450,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.75-2.00": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.1,
                    "3.00-3.25": 2.4,
                    "3.25-3.50": 18.3,
                    "3.50-3.75": 51.6,
                    "3.75-4.00": 23.0,
                    "4.00-4.25": 4.2,
                    "4.25-4.50": 0.4,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 0.0
                }
            },
            {
                "date": "2027-09-15",
                "days_remaining": 499,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.0,
                    "2.75-3.00": 0.5,
                    "3.00-3.25": 5.2,
                    "3.25-3.50": 24.2,
                    "3.50-3.75": 46.5,
                    "3.75-4.00": 19.7,
                    "4.00-4.25": 3.5,
                    "4.25-4.50": 0.3,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 0.0
                }
            },
            {
                "date": "2027-10-27",
                "days_remaining": 541,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.50-1.75": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.1,
                    "2.75-3.00": 1.2,
                    "3.00-3.25": 7.9,
                    "3.25-3.50": 27.4,
                    "3.50-3.75": 42.7,
                    "3.75-4.00": 17.4,
                    "4.00-4.25": 3.1,
                    "4.25-4.50": 0.3,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 0.0
                }
            },
            {
                "date": "2027-12-08",
                "days_remaining": 583,
                "current_rate": "3.50-3.75",
                "probs": {
                    "1.00-1.25": 0.0,
                    "1.75-2.00": 0.0,
                    "2.00-2.25": 0.0,
                    "2.25-2.50": 0.0,
                    "2.50-2.75": 0.5,
                    "2.75-3.00": 3.4,
                    "3.00-3.25": 14.2,
                    "3.25-3.50": 32.3,
                    "3.50-3.75": 34.6,
                    "3.75-4.00": 12.8,
                    "4.00-4.25": 2.2,
                    "4.25-4.50": 0.2,
                    "4.50-4.75": 0.0,
                    "4.75-5.00": 0.0
                }
            }
        ]
    }
};