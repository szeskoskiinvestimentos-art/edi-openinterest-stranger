(function (global) {
  var ChartDataUtils = (global.ChartDataUtils = global.ChartDataUtils || {});

  ChartDataUtils.registerSpotLinePlugin = function registerSpotLinePlugin() {
    var Chart = global && global.Chart;
    if (!Chart || typeof Chart.register !== 'function') return;
    if (ChartDataUtils._spotLinePluginRegistered) return;

    var plugin = {
      id: 'spotLine',
      afterDatasetsDraw: function afterDatasetsDraw(chart, _args, pluginOptions) {
        var value = Number(pluginOptions && pluginOptions.value);
        if (!Number.isFinite(value)) return;

        var scales = chart && chart.scales ? chart.scales : null;
        var xScale =
          (scales && scales.x) ||
          (scales &&
            Object.values(scales).find(function (s) {
              return s && s.axis === 'x';
            }));
        if (!xScale || typeof xScale.getPixelForValue !== 'function') return;

        var xPixel = null;
        if (xScale.type === 'category') {
          var labelsIn = chart && chart.data ? chart.data.labels : null;
          var labels = Array.isArray(labelsIn) ? labelsIn : [];
          var numericLabels = labels
            .map(function (l) {
              if (typeof l === 'number') return l;
              if (typeof l !== 'string') return Number(l);
              var s = l.trim();
              var looksLikePtBr = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s);
              if (!looksLikePtBr) return Number(s);
              var normalized = s.replace(/\./g, '').replace(',', '.');
              return Number(normalized);
            })
            .map(function (n, i) {
              return { n: n, i: i };
            })
            .filter(function (p) {
              return Number.isFinite(p.n);
            });
          if (numericLabels.length === 0) return;

          var min = Math.min.apply(
            null,
            numericLabels.map(function (p) {
              return p.n;
            })
          );
          var max = Math.max.apply(
            null,
            numericLabels.map(function (p) {
              return p.n;
            })
          );
          if (value < min || value > max) return;

          var lo = null;
          var hi = null;
          for (var i = 0; i < numericLabels.length; i++) {
            var p = numericLabels[i];
            if (p.n <= value) lo = p;
            if (p.n >= value) {
              hi = p;
              break;
            }
          }
          if (!lo && hi) lo = hi;
          if (!hi && lo) hi = lo;
          if (!lo || !hi) return;

          if (lo.i === hi.i || lo.n === hi.n) {
            xPixel = xScale.getPixelForValue(lo.i);
          } else {
            var x0 = xScale.getPixelForValue(lo.i);
            var x1 = xScale.getPixelForValue(hi.i);
            var t = (value - lo.n) / (hi.n - lo.n);
            xPixel = x0 + (x1 - x0) * t;
          }
        } else {
          var minScale = Number(xScale.min);
          var maxScale = Number(xScale.max);
          if (Number.isFinite(minScale) && Number.isFinite(maxScale) && (value < minScale || value > maxScale))
            return;
          xPixel = xScale.getPixelForValue(value);
        }

        if (!Number.isFinite(xPixel)) return;

        var chartArea = chart && chart.chartArea ? chart.chartArea : null;
        if (!chartArea) return;

        var ctx = chart.ctx;
        var color = (pluginOptions && pluginOptions.color) || 'lime';
        var width = Number(pluginOptions && pluginOptions.width != null ? pluginOptions.width : 2);
        var dash = Array.isArray(pluginOptions && pluginOptions.dash) ? pluginOptions.dash : [4, 4];

        ctx.save();
        ctx.lineWidth = Number.isFinite(width) ? width : 2;
        ctx.strokeStyle = color;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(xPixel, chartArea.top);
        ctx.lineTo(xPixel, chartArea.bottom);
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

        var showLabel = !(pluginOptions && pluginOptions.label === false);
        if (showLabel) {
          var labelText =
            pluginOptions && typeof pluginOptions.labelText === 'string'
              ? pluginOptions.labelText
              : 'SPOT ' + (Number.isFinite(value) ? value.toFixed(2) : String(value));
          ctx.fillStyle = color;
          ctx.font = (pluginOptions && pluginOptions.font) || '12px Orbitron';
          ctx.textBaseline = 'top';
          var offsetX = Number(pluginOptions && pluginOptions.labelOffsetX != null ? pluginOptions.labelOffsetX : 0);
          var offsetY = Number(pluginOptions && pluginOptions.labelOffsetY != null ? pluginOptions.labelOffsetY : 0);
          var x = xPixel + 6 + (Number.isFinite(offsetX) ? offsetX : 0);
          var y = chartArea.top + 6 + (Number.isFinite(offsetY) ? offsetY : 0);
          ctx.fillText(labelText, x, y);
        }

        ctx.restore();
      },
    };

    Chart.register(plugin);
    ChartDataUtils._spotLinePluginRegistered = true;
  };

  ChartDataUtils.registerVLinesPlugin = function registerVLinesPlugin() {
    var Chart = global && global.Chart;
    if (!Chart || typeof Chart.register !== 'function') return;
    if (ChartDataUtils._vLinesPluginRegistered) return;

    function parseMaybePtBrNumber(val) {
      if (typeof val === 'number') return val;
      if (typeof val !== 'string') return Number(val);
      var s = val.trim();
      var looksLikePtBr = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s);
      if (!looksLikePtBr) return Number(s);
      var normalized = s.replace(/\./g, '').replace(',', '.');
      return Number(normalized);
    }

    var plugin = {
      id: 'vLines',
      afterDatasetsDraw: function afterDatasetsDraw(chart) {
        var lines = chart && chart.options && chart.options.plugins && chart.options.plugins.vLines && chart.options.plugins.vLines.lines;
        if (!Array.isArray(lines) || lines.length === 0) return;

        var scales = chart && chart.scales ? chart.scales : null;
        var xScale =
          (scales && scales.x) ||
          (scales &&
            Object.values(scales).find(function (s) {
              return s && s.axis === 'x';
            }));
        if (!xScale || typeof xScale.getPixelForValue !== 'function') return;

        var chartArea = chart && chart.chartArea ? chart.chartArea : null;
        if (!chartArea) return;

        var ctx = chart.ctx;
        ctx.save();

        var labelRow = 0;
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
          var value = Number(l && l.value);
          if (!Number.isFinite(value)) continue;

          var xPixel = null;
          if (xScale.type === 'category') {
            var labelsIn = chart && chart.data ? chart.data.labels : null;
            var labels = Array.isArray(labelsIn) ? labelsIn : [];
            var numericLabels = labels
              .map(function (lab) {
                return parseMaybePtBrNumber(lab);
              })
              .map(function (n, idx) {
                return { n: n, i: idx };
              })
              .filter(function (p) {
                return Number.isFinite(p.n);
              });
            if (numericLabels.length === 0) continue;

            var min = Math.min.apply(
              null,
              numericLabels.map(function (p) {
                return p.n;
              })
            );
            var max = Math.max.apply(
              null,
              numericLabels.map(function (p) {
                return p.n;
              })
            );
            if (value < min || value > max) continue;

            var lo = null;
            var hi = null;
            for (var j = 0; j < numericLabels.length; j++) {
              var p = numericLabels[j];
              if (p.n <= value) lo = p;
              if (p.n >= value) {
                hi = p;
                break;
              }
            }
            if (!lo && hi) lo = hi;
            if (!hi && lo) hi = lo;
            if (!lo || !hi) continue;

            if (lo.i === hi.i || lo.n === hi.n) {
              xPixel = xScale.getPixelForValue(lo.i);
            } else {
              var x0 = xScale.getPixelForValue(lo.i);
              var x1 = xScale.getPixelForValue(hi.i);
              var t = (value - lo.n) / (hi.n - lo.n);
              xPixel = x0 + (x1 - x0) * t;
            }
          } else {
            var minScale = Number(xScale.min);
            var maxScale = Number(xScale.max);
            if (Number.isFinite(minScale) && Number.isFinite(maxScale) && (value < minScale || value > maxScale))
              continue;
            xPixel = xScale.getPixelForValue(value);
          }

          if (!Number.isFinite(xPixel)) continue;

          var color = (l && l.color) || '#ff00ff';
          var width = Number(l && l.width != null ? l.width : 2);
          var dash = Array.isArray(l && l.dash) ? l.dash : [6, 4];

          ctx.lineWidth = Number.isFinite(width) ? width : 2;
          ctx.strokeStyle = color;
          if (typeof ctx.setLineDash === 'function') ctx.setLineDash(dash);
          ctx.beginPath();
          ctx.moveTo(xPixel, chartArea.top);
          ctx.lineTo(xPixel, chartArea.bottom);
          ctx.stroke();
          if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

          var labelText = l && typeof l.labelText === 'string' ? l.labelText : '';
          if (labelText) {
            ctx.fillStyle = color;
            ctx.font = (l && l.font) || '12px Orbitron';
            ctx.textBaseline = 'top';
            var offsetX = Number(l && l.labelOffsetX != null ? l.labelOffsetX : 0);
            var offsetY = Number(l && l.labelOffsetY != null ? l.labelOffsetY : 0);
            var labelPadding = 6;
            var lineHeight = Number(l && l.labelLineHeight != null ? l.labelLineHeight : 16);
            var pos = String((l && l.labelPosition) || 'top').toLowerCase();
            var yBase =
              pos === 'bottom'
                ? chartArea.bottom - labelPadding - lineHeight * (labelRow + 1)
                : chartArea.top + labelPadding + lineHeight * labelRow;
            var y = yBase + (Number.isFinite(offsetY) ? offsetY : 0);

            var textWidth = (ctx.measureText(labelText) || {}).width || 0;
            var xBase = xPixel + labelPadding;
            var xClamped = Math.max(chartArea.left + labelPadding, Math.min(xBase, chartArea.right - labelPadding - textWidth));
            var x = xClamped + (Number.isFinite(offsetX) ? offsetX : 0);

            ctx.fillText(labelText, x, y);
            labelRow += 1;
          }
        }

        ctx.restore();
      },
    };

    Chart.register(plugin);
    ChartDataUtils._vLinesPluginRegistered = true;
  };

  ChartDataUtils.getDisplayScaleFactor = function getDisplayScaleFactor(marketData) {
    var scale = Number(marketData && marketData.scale_diagnostics && marketData.scale_diagnostics.display_scale_factor);
    if (Number.isFinite(scale) && scale > 0) return scale;

    var ewzSpot = Number(
      (marketData && marketData.scale_diagnostics && marketData.scale_diagnostics.ewz_spot) ||
        marketData.spot_price ||
        marketData.spot
    );
    var idxSpot = Number(
      (marketData && marketData.scale_diagnostics && marketData.scale_diagnostics.index_spot) ||
        (marketData && marketData.overview && (marketData.overview.spot_price || marketData.overview.spot))
    );
    if (Number.isFinite(ewzSpot) && ewzSpot > 0 && Number.isFinite(idxSpot) && idxSpot > 0) return idxSpot / ewzSpot;

    return 1;
  };

  ChartDataUtils.renderEwzOptionsOiChart = function renderEwzOptionsOiChart(opts) {
    var payload = (opts && opts.payload) || global.yahooEwzOptionsData;
    if (!payload || typeof payload !== 'object') return;

    var canvas = (opts && opts.canvas) || (global.document && global.document.getElementById && global.document.getElementById((opts && opts.canvasId) || 'ewzOptionsOiChart'));
    var select = (opts && opts.select) || (global.document && global.document.getElementById && global.document.getElementById((opts && opts.selectId) || 'ewzOptionsExpirySelect'));
    var minOiEl = (opts && opts.minOiEl) || (global.document && global.document.getElementById && global.document.getElementById((opts && opts.minOiId) || 'ewzOptionsMinOi'));
    var meansAllEl = (opts && opts.meansAllEl) || (global.document && global.document.getElementById && global.document.getElementById((opts && opts.meansAllId) || 'ewzOptionsMeansAll'));
    if (!canvas || !select || !minOiEl) return;

    var Chart = (opts && opts.Chart) || global.Chart;
    if (!Chart) return;

    var expiries = Array.isArray(payload.expiries) ? payload.expiries.map(function (e) { return String(e); }) : [];
    var byExpiry = payload.by_expiry && typeof payload.by_expiry === 'object' ? payload.by_expiry : {};
    if (expiries.length === 0) return;

    var marketData = opts && opts.marketData;
    var scaleFactor = ChartDataUtils.getDisplayScaleFactor(marketData);
    function toIndexScale(strike) {
      var s = Number(strike);
      if (!Number.isFinite(s)) return null;
      if (!Number.isFinite(scaleFactor) || scaleFactor <= 0 || scaleFactor === 1) return s;
      if (s < 0 || s > 1000) return s;
      return s * scaleFactor;
    }

    function buildPoints(expiry, minOi) {
      var row = byExpiry && byExpiry[expiry];
      var strikesIn = row && row.strikes;
      var callOiIn = row && row.call_oi;
      var putOiIn = row && row.put_oi;
      if (!Array.isArray(strikesIn) || !Array.isArray(callOiIn) || !Array.isArray(putOiIn)) return [];
      var n = Math.min(strikesIn.length, callOiIn.length, putOiIn.length);
      var points = [];
      for (var i = 0; i < n; i++) {
        var s0 = toIndexScale(strikesIn[i]);
        if (s0 == null) continue;
        var c = Number(callOiIn[i]);
        var p = Number(putOiIn[i]);
        var cOk = Number.isFinite(c) ? Math.max(0, c) : 0;
        var pOk = Number.isFinite(p) ? Math.max(0, p) : 0;
        if (cOk < minOi && pOk < minOi) continue;
        points.push({ strike: s0, call: cOk, put: pOk, total: cOk + pOk });
      }
      points.sort(function (a, b) {
        return a.strike - b.strike;
      });
      return points;
    }

    function calcMeans(points) {
      if (!Array.isArray(points) || points.length === 0) return null;
      var strikes = points
        .map(function (p) {
          return Number(p.strike);
        })
        .filter(function (n) {
          return Number.isFinite(n);
        });
      if (strikes.length === 0) return null;
      var min = Math.min.apply(null, strikes);
      var max = Math.max.apply(null, strikes);
      var midRange = (min + max) / 2;
      var wSum = 0;
      var vSum = 0;
      for (var i = 0; i < points.length; i++) {
        var s = Number(points[i].strike);
        var w = Number(points[i].total);
        if (!Number.isFinite(s) || !Number.isFinite(w) || w < 0) continue;
        wSum += s * w;
        vSum += w;
      }
      var meanByOi = vSum > 0 ? wSum / vSum : strikes.reduce(function (a, b) { return a + b; }, 0) / strikes.length;
      return { midRange: midRange, meanByOi: meanByOi };
    }

    var charts = opts && opts.charts && typeof opts.charts === 'object' ? opts.charts : (global.__ewzOptionsChartsHost || (global.__ewzOptionsChartsHost = {}));
    var chartKey = opts && typeof opts.chartKey === 'string' && opts.chartKey ? opts.chartKey : 'ewzOptionsOi';
    var chartOptions = (opts && opts.chartOptions && typeof opts.chartOptions === 'object' ? opts.chartOptions : {});
    var formatStrikeLabel = (opts && typeof opts.formatStrikeLabel === 'function' ? opts.formatStrikeLabel : function (n) { return String(n); });
    var formatMeanValue = (opts && typeof opts.formatMeanValue === 'function' ? opts.formatMeanValue : formatStrikeLabel);
    var formatYTick = (opts && typeof opts.formatYTick === 'function' ? opts.formatYTick : function (n) { return String(n); });
    var storageKey = opts && typeof opts.storageKey === 'string' && opts.storageKey ? opts.storageKey : 'ewz_options_expiry';

    var expiriesKey = expiries.join('|');
    if (select.__ewzOptionsExpiriesKey !== expiriesKey) {
      select.innerHTML = '';
      for (var i = 0; i < expiries.length; i++) {
        var opt = global.document.createElement('option');
        opt.value = expiries[i];
        opt.textContent = expiries[i];
        select.appendChild(opt);
      }
      select.__ewzOptionsExpiriesKey = expiriesKey;
    }

    var current = String(select.value || (global.localStorage && global.localStorage.getItem && global.localStorage.getItem(storageKey)) || '');
    var wanted = expiries.indexOf(current) >= 0 ? current : expiries[0];
    select.value = wanted;
    if (global.localStorage && global.localStorage.setItem) global.localStorage.setItem(storageKey, wanted);

    function updateMeansAll() {
      if (!meansAllEl) return;
      var minOi = Math.max(0, Number(minOiEl.value || 0));
      var perExp = expiries
        .map(function (e) {
          return { e: e, points: buildPoints(e, minOi) };
        })
        .map(function (x) {
          return { e: x.e, means: calcMeans(x.points) };
        })
        .filter(function (x) {
          return x.means && Number.isFinite(x.means.midRange) && Number.isFinite(x.means.meanByOi);
        });
      if (perExp.length === 0) {
        meansAllEl.innerText = '';
        return;
      }

      function pickCurrentExpiry() {
        var now = new Date();
        var todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        for (var i = 0; i < expiries.length; i++) {
          var t = Date.parse(String(expiries[i]) + 'T00:00:00Z');
          if (Number.isFinite(t) && t >= todayUtc) return expiries[i];
        }
        return expiries[0];
      }

      var currentExpiry = pickCurrentExpiry();
      var currentRow = perExp.find(function (x) { return x.e === currentExpiry; }) || null;
      var currentLine = currentRow
        ? 'Médias (contrato atual ' +
          currentExpiry +
          '): Intervalo ' +
          formatMeanValue(currentRow.means.midRange) +
          ' | Por OI ' +
          formatMeanValue(currentRow.means.meanByOi)
        : '';

      var byStrike = new Map();
      for (var i = 0; i < expiries.length; i++) {
        var pts = buildPoints(expiries[i], minOi);
        for (var j = 0; j < pts.length; j++) {
          var s = Number(pts[j].strike);
          var w = Number(pts[j].total);
          if (!Number.isFinite(s) || !Number.isFinite(w) || w <= 0) continue;
          byStrike.set(s, (byStrike.get(s) || 0) + w);
        }
      }
      var merged = Array.from(byStrike.entries())
        .map(function (kv) {
          return { strike: kv[0], call: 0, put: 0, total: kv[1] };
        })
        .sort(function (a, b) {
          return a.strike - b.strike;
        });
      var allMeans = calcMeans(merged);
      var allLine = allMeans
        ? 'Médias (todos vencimentos): Intervalo ' +
          formatMeanValue(allMeans.midRange) +
          ' | Por OI ' +
          formatMeanValue(allMeans.meanByOi)
        : '';

      meansAllEl.innerHTML = currentLine && allLine ? currentLine + '<br>' + allLine : currentLine || allLine || '';
    }

    function render() {
      var expiry = String(select.value || expiries[0] || '');
      if (global.localStorage && global.localStorage.setItem) global.localStorage.setItem(storageKey, expiry);
      var minOi = Math.max(0, Number(minOiEl.value || 0));
      updateMeansAll();

      var points = buildPoints(expiry, minOi);
      if (!points || points.length === 0) {
        if (meansAllEl) meansAllEl.innerText = 'Sem dados para o filtro atual.';
        return;
      }
      var means = calcMeans(points);
      if (!means) return;

      if (charts[chartKey]) charts[chartKey].destroy();

      ChartDataUtils.registerVLinesPlugin();

      var labels = points.map(function (p) {
        return formatStrikeLabel(p.strike);
      });
      var call = points.map(function (p) {
        return p.call;
      });
      var put = points.map(function (p) {
        return p.put;
      });

      var options = {
        ...chartOptions,
        plugins: {
          ...(chartOptions.plugins || {}),
          spotLine: false,
          vLines: {
            lines: [
              {
                value: means.midRange,
                color: '#00f3ff',
                dash: [6, 4],
                width: 2,
                labelText: 'Média (intervalo): ' + formatMeanValue(means.midRange),
                labelOffsetY: 0,
              },
              {
                value: means.meanByOi,
                color: '#ff00ff',
                dash: [2, 6],
                width: 2,
                labelText: 'Média (por OI): ' + formatMeanValue(means.meanByOi),
                labelOffsetY: 18,
              },
            ],
          },
        },
        scales: {
          ...(chartOptions.scales || {}),
          x: {
            ...((chartOptions.scales || {}).x || {}),
            stacked: true,
          },
          y: {
            ...((chartOptions.scales || {}).y || {}),
            stacked: true,
            ticks: {
              ...(((chartOptions.scales || {}).y || {}).ticks || {}),
              callback: function (v) {
                return formatYTick(v);
              },
            },
          },
        },
      };

      charts[chartKey] = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Call OI',
              data: call,
              backgroundColor: 'rgba(0, 255, 0, 0.6)',
              borderColor: '#00ff00',
              borderWidth: 1,
            },
            {
              label: 'Put OI',
              data: put,
              backgroundColor: 'rgba(255, 7, 58, 0.6)',
              borderColor: '#ff073a',
              borderWidth: 1,
            },
          ],
        },
        options: options,
      });
    }

    select.onchange = render;
    minOiEl.onchange = render;
    updateMeansAll();
    render();
  };

  ChartDataUtils.renderProxyOptionsOiChart = function renderProxyOptionsOiChart(opts) {
    var payload = (opts && opts.payload) || null;
    if (!payload || typeof payload !== 'object') return;

    var canvas =
      (opts && opts.canvas) ||
      (global.document && global.document.getElementById && global.document.getElementById((opts && opts.canvasId) || 'proxyOiChart'));
    var select =
      (opts && opts.select) ||
      (global.document && global.document.getElementById && global.document.getElementById((opts && opts.selectId) || 'proxyExpirySelect'));
    var minOiEl =
      (opts && opts.minOiEl) ||
      (global.document && global.document.getElementById && global.document.getElementById((opts && opts.minOiId) || 'proxyMinOiInput'));
    var metaEl =
      (opts && opts.metaEl) ||
      (global.document && global.document.getElementById && global.document.getElementById((opts && opts.metaId) || 'proxyOiMeta'));
    var meansAllEl =
      (opts && opts.meansAllEl) ||
      (global.document && global.document.getElementById && global.document.getElementById((opts && opts.meansAllId) || 'proxyOiMeansAll'));
    if (!canvas || !select || !minOiEl) return;

    var Chart = (opts && opts.Chart) || global.Chart;
    if (!Chart) return;

    var expiries = Array.isArray(payload.expiries) ? payload.expiries.map(function (e) { return String(e); }) : [];
    var byExpiry = payload.by_expiry && typeof payload.by_expiry === 'object' ? payload.by_expiry : {};
    if (expiries.length === 0) return;

    var charts =
      (opts && opts.charts && typeof opts.charts === 'object'
        ? opts.charts
        : global.__proxyOptionsChartsHost || (global.__proxyOptionsChartsHost = {}));

    var tickerLabel = String(payload.ticker_label || payload.ticker_used || payload.ticker || 'Proxy');
    var chartKey = String((opts && opts.chartKey) || (opts && opts.canvasId) || ('proxy_' + tickerLabel));
    var storageKey = 'proxyOptionsExpiry::' + tickerLabel;

    var marketData = opts && opts.marketData;
    var wdoSpot = Number(
      (opts && opts.wdoSpot) ||
        (marketData && (marketData.spot_price || (marketData.overview && marketData.overview.spot_price))) ||
        null
    );
    var proxySpot = Number(payload.spot);
    var scaleFactor =
      Number.isFinite(wdoSpot) && wdoSpot > 0 && Number.isFinite(proxySpot) && proxySpot > 0 ? wdoSpot / proxySpot : 1;

    function toWdoScale(strike) {
      var s = Number(strike);
      if (!Number.isFinite(s)) return null;
      return s * scaleFactor;
    }

    function formatPtBrNumber(v, decimals) {
      try {
        return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      } catch (_e) {
        return String(v);
      }
    }

    function formatStrikeLabel(strike) {
      return formatPtBrNumber(strike, 2);
    }

    function formatMeanValue(v) {
      if (!Number.isFinite(v)) return '—';
      return formatPtBrNumber(v, 2);
    }

    function formatCompact(v) {
      var n = Math.abs(Number(v));
      if (!Number.isFinite(n)) return '—';
      if (n < 1000) return formatPtBrNumber(n, 0);
      var units = [
        { v: 1e12, s: 'T' },
        { v: 1e9, s: 'B' },
        { v: 1e6, s: 'M' },
        { v: 1e3, s: 'K' },
      ];
      for (var i = 0; i < units.length; i++) {
        if (n >= units[i].v) return formatPtBrNumber(n / units[i].v, 1) + units[i].s;
      }
      return formatPtBrNumber(n, 0);
    }

    function buildPointsFromRow(row, minOi) {
      var strikesIn = row && row.strikes;
      var callOiIn = row && row.call_oi;
      var putOiIn = row && row.put_oi;
      if (!Array.isArray(strikesIn) || !Array.isArray(callOiIn) || !Array.isArray(putOiIn)) return [];
      var n = Math.min(strikesIn.length, callOiIn.length, putOiIn.length);
      var points = [];
      for (var i = 0; i < n; i++) {
        var s0 = toWdoScale(strikesIn[i]);
        var call = Number(callOiIn[i] || 0);
        var put = Number(putOiIn[i] || 0);
        var total = call + put;
        if (!Number.isFinite(s0)) continue;
        if (!Number.isFinite(call)) call = 0;
        if (!Number.isFinite(put)) put = 0;
        if (!Number.isFinite(total)) total = call + put;
        if (total < minOi) continue;
        points.push({
          strike: s0,
          call: call,
          put: -Math.abs(put),
          total: total,
        });
      }
      points.sort(function (a, b) {
        return a.strike - b.strike;
      });
      return points;
    }

    function mergeAllExpiries(minOi) {
      var byStrike = new Map();
      for (var i = 0; i < expiries.length; i++) {
        var e = expiries[i];
        var row = byExpiry[e];
        var pts = buildPointsFromRow(row, 0);
        for (var j = 0; j < pts.length; j++) {
          var s = Number(pts[j].strike);
          if (!Number.isFinite(s)) continue;
          var prev = byStrike.get(s) || { strike: s, call: 0, putAbs: 0 };
          prev.call += Math.max(0, Number(pts[j].call || 0));
          prev.putAbs += Math.max(0, Math.abs(Number(pts[j].put || 0)));
          byStrike.set(s, prev);
        }
      }
      var merged = Array.from(byStrike.values())
        .map(function (p) {
          var total = p.call + p.putAbs;
          return { strike: p.strike, call: p.call, put: -p.putAbs, total: total };
        })
        .filter(function (p) {
          return Number.isFinite(p.total) && p.total >= minOi;
        })
        .sort(function (a, b) {
          return a.strike - b.strike;
        });
      return merged;
    }

    function calcMeans(points) {
      if (!Array.isArray(points) || points.length === 0) return null;
      var min = points[0].strike;
      var max = points[points.length - 1].strike;
      var midRange = (min + max) / 2;
      var sumW = 0;
      var sumWX = 0;
      for (var i = 0; i < points.length; i++) {
        var w = Number(points[i].total);
        var x = Number(points[i].strike);
        if (!Number.isFinite(w) || !Number.isFinite(x)) continue;
        sumW += w;
        sumWX += w * x;
      }
      var meanByOi = sumW > 0 ? sumWX / sumW : midRange;
      return { midRange: midRange, meanByOi: meanByOi };
    }

    function pickDefaultExpiry() {
      if (global.localStorage && global.localStorage.getItem) {
        var stored = global.localStorage.getItem(storageKey);
        if (stored && (stored === '__ALL__' || expiries.indexOf(stored) >= 0)) return stored;
      }
      return '__ALL__';
    }

    function ensureSelectOptions() {
      var wanted = ['__ALL__'].concat(expiries);
      var current = Array.prototype.slice.call(select.options || []).map(function (o) {
        return o && o.value ? String(o.value) : '';
      });
      var same = current.length === wanted.length && current.every(function (v, i) { return v === wanted[i]; });
      if (same) return;
      select.innerHTML = '';
      var optAll = global.document.createElement('option');
      optAll.value = '__ALL__';
      optAll.textContent = 'Todos vencimentos';
      select.appendChild(optAll);
      for (var i = 0; i < expiries.length; i++) {
        var opt = global.document.createElement('option');
        opt.value = expiries[i];
        opt.textContent = expiries[i];
        select.appendChild(opt);
      }
      select.value = pickDefaultExpiry();
    }

    function updateMeta(expiry) {
      if (!metaEl) return;
      var spotTxt = Number.isFinite(proxySpot) ? formatPtBrNumber(proxySpot, 4) : '—';
      var capturedRaw =
        payload.captured_at_utc || payload.capturedAtUtc || payload.capturedAt || (payload.meta && payload.meta.capturedAtUtc);
      var captured = capturedRaw ? new Date(String(capturedRaw)) : null;
      var capturedTxt = captured && !isNaN(captured.getTime()) ? captured.toISOString() : '—';
      var venc = expiry && expiry !== '__ALL__' ? String(expiry) : 'Todos';
      metaEl.textContent =
        'Fonte: Yahoo (' +
        tickerLabel +
        ') | Spot proxy: ' +
        spotTxt +
        ' | Captura: ' +
        capturedTxt +
        ' | Venc: ' +
        venc;
    }

    function updateMeansAll(minOi) {
      if (!meansAllEl) return;
      var exp = String(select.value || '__ALL__');

      var currPoints = exp === '__ALL__' ? mergeAllExpiries(minOi) : buildPointsFromRow(byExpiry[exp], minOi);
      var currMeans = calcMeans(currPoints);
      var currentLine =
        currMeans && exp !== '__ALL__'
          ? 'Médias (contrato atual ' +
            exp +
            '): Intervalo ' +
            formatMeanValue(currMeans.midRange) +
            ' | Por OI ' +
            formatMeanValue(currMeans.meanByOi)
          : '';

      var allMeans = calcMeans(mergeAllExpiries(minOi));
      var allLine = allMeans
        ? 'Médias (todos vencimentos): Intervalo ' +
          formatMeanValue(allMeans.midRange) +
          ' | Por OI ' +
          formatMeanValue(allMeans.meanByOi)
        : '';

      meansAllEl.innerHTML = currentLine && allLine ? currentLine + '<br>' + allLine : currentLine || allLine || '';
    }

    function render() {
      ensureSelectOptions();
      var expiry = String(select.value || '__ALL__');
      if (global.localStorage && global.localStorage.setItem) global.localStorage.setItem(storageKey, expiry);
      var minOi = Math.max(0, Number(minOiEl.value || 0));

      updateMeta(expiry);
      updateMeansAll(minOi);

      var points = expiry === '__ALL__' ? mergeAllExpiries(minOi) : buildPointsFromRow(byExpiry[expiry], minOi);
      if (!points || points.length === 0) {
        if (meansAllEl) meansAllEl.innerText = 'Sem dados para o filtro atual.';
        return;
      }

      var means = calcMeans(points);
      if (!means) return;

      if (charts[chartKey]) charts[chartKey].destroy();

      ChartDataUtils.registerVLinesPlugin();
      ChartDataUtils.registerSpotLinePlugin();

      var labels = points.map(function (p) {
        return formatStrikeLabel(p.strike);
      });
      var call = points.map(function (p) {
        return p.call;
      });
      var put = points.map(function (p) {
        return p.put;
      });

      var chartOptions = opts && opts.chartOptions ? opts.chartOptions : {};
      var options = {
        ...chartOptions,
        plugins: {
          ...(chartOptions.plugins || {}),
          spotLine: Number.isFinite(wdoSpot)
            ? { value: wdoSpot, color: 'lime', labelText: 'SPOT ' + formatMeanValue(wdoSpot) }
            : false,
          vLines: {
            lines: [
              {
                value: means.midRange,
                color: '#00f3ff',
                dash: [6, 4],
                width: 2,
                labelText: 'Média (intervalo): ' + formatMeanValue(means.midRange),
                labelOffsetY: 0,
              },
              {
                value: means.meanByOi,
                color: '#ff00ff',
                dash: [2, 6],
                width: 2,
                labelText: 'Média (por OI): ' + formatMeanValue(means.meanByOi),
                labelOffsetY: 18,
              },
            ],
          },
        },
        scales: {
          ...(chartOptions.scales || {}),
          x: { ...((chartOptions.scales || {}).x || {}), stacked: true },
          y: {
            ...((chartOptions.scales || {}).y || {}),
            stacked: true,
            ticks: {
              ...(((chartOptions.scales || {}).y || {}).ticks || {}),
              callback: function (v) {
                return formatCompact(v);
              },
            },
          },
        },
      };

      charts[chartKey] = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Call OI',
              data: call,
              backgroundColor: 'rgba(0, 255, 0, 0.6)',
              borderColor: '#00ff00',
              borderWidth: 1,
            },
            {
              label: 'Put OI',
              data: put,
              backgroundColor: 'rgba(255, 7, 58, 0.6)',
              borderColor: '#ff073a',
              borderWidth: 1,
            },
          ],
        },
        options: options,
      });
    }

    select.onchange = render;
    minOiEl.onchange = render;
    render();
  };
})(window);
