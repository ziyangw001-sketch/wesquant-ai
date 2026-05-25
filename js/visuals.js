/**
 * WesQuant AI — Visual Systems (Globe, Terminal, Loader, Insights)
 */
window.WesQuant = window.WesQuant || {};

(function (WQ) {
  'use strict';

  const AI_FEED = {
    en: [
      'AI detected bullish momentum in NVDA',
      'Institutional inflow rising across tech',
      'Macro sentiment improving — USD softening',
      'Liquidity detection: Asia session active',
      'Neural engine: cross-asset correlation stable',
    ],
    zh: [
      'AI 检测到 NVDA 看涨动能',
      '科技板块机构资金流入上升',
      '宏观情绪改善 — 美元走弱',
      '流动性检测：亚洲时段活跃',
      '神经引擎：跨资产相关性稳定',
    ],
    ms: [
      'AI mengesan momentum bullish dalam NVDA',
      'Aliran masuk institusi meningkat dalam teknologi',
      'Sentimen makro bertambah baik',
    ],
  };

  const SCAN_LINES = {
    en: [
      'Analyzing macroeconomic signals...',
      'Scanning market momentum...',
      'Neural engine active...',
      'AI liquidity detection running...',
      'Processing institutional order flow...',
    ],
    zh: [
      '正在分析市场动能...',
      '扫描宏观经济信号...',
      'AI 流动性检测已激活...',
      '神经跨资产相关性扫描...',
      '处理机构订单流...',
    ],
    ms: [
      'Menganalisis momentum pasaran...',
      'Mengimbas isyarat makroekonomi...',
      'Pengesanan kecairan AI aktif...',
    ],
  };

  const FLOAT_INSIGHTS = {
    en: [
      'AI detected unusual options activity in NVDA',
      'Macro sentiment turning bullish',
      'Increased institutional accumulation detected',
      'Cross-asset volatility compression signal',
      'Asia-Pacific tech beta expanding',
      'BTC funding rates neutral-positive',
    ],
    zh: [
      'AI 检测到 NVDA 异常期权活动',
      '宏观情绪转向看涨',
      '检测到机构资金积累增加',
      '跨资产波动率压缩信号',
      '亚太科技贝塔扩张',
      'BTC 资金费率中性偏多',
    ],
    ms: [
      'AI mengesan aktiviti opsyen luar biasa dalam NVDA',
      'Sentimen makro berpaling bullish',
      'Pengumpulan institusi meningkat dikesan',
    ],
  };

  let globeAnimId = null;
  let terminalInterval = null;
  let floatInterval = null;

  /* ---- Neural Globe ---- */
  function initGlobe(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const nodes = [];
    const connections = [];
    const NODE_COUNT = 48;

    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      nodes.push({
        theta,
        phi,
        pulse: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 2,
        market: ['NYC', 'LON', 'TYO', 'HKG', 'SGP', 'SF'][i % 6],
      });
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (Math.random() > 0.92) connections.push([i, j]);
      }
    }

    function resize() {
      const parent = canvas.parentElement;
      const size = Math.min(parent.clientWidth, 420);
      canvas.width = size * (window.devicePixelRatio || 1);
      canvas.height = size * (window.devicePixelRatio || 1);
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
    }

    let rot = 0;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      const grad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.4);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 8) {
          const t = ((lon + rot * 40) * Math.PI) / 180;
          const p = (lat * Math.PI) / 180;
          const x = cx + R * Math.cos(p) * Math.cos(t);
          const y = cy + R * Math.sin(p);
          if (lon === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const projected = nodes.map((n) => {
        const t = n.theta + rot;
        const x3 = R * Math.sin(n.phi) * Math.cos(t);
        const y3 = R * Math.cos(n.phi);
        const z3 = R * Math.sin(n.phi) * Math.sin(t);
        const scale = 1 / (1 + z3 / (R * 2.5));
        return {
          x: cx + x3 * scale,
          y: cy + y3 * scale,
          z: z3,
          n,
        };
      });

      connections.forEach(([a, b]) => {
        const pa = projected[a];
        const pb = projected[b];
        if (!pa || !pb) return;
        const alpha = 0.08 + ((pa.z + pb.z) / (2 * R) + 0.5) * 0.2;
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      projected
        .sort((a, b) => a.z - b.z)
        .forEach((p) => {
          const pulse = 0.6 + Math.sin(p.n.pulse + rot * 3) * 0.4;
          const alpha = 0.35 + ((p.z / R) + 1) * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.n.size * pulse * (0.8 + (p.z / R) * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
          ctx.fill();
          if (p.z > R * 0.2) {
            ctx.fillStyle = `rgba(241, 245, 249, ${alpha * 0.7})`;
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(p.n.market, p.x + 6, p.y + 3);
          }
        });

      rot += 0.004;
      globeAnimId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
  }

  /* ---- Hero Terminal Pro ---- */
  function initTerminal(containerId, getLang) {
    const root = document.getElementById(containerId);
    if (!root) return;

    root.innerHTML = `
      <div class="terminal-pro-grid">
        <div class="terminal-scan-bar">
          <span class="terminal-scan-dot"></span>
          <span id="terminalScanText">Initializing...</span>
        </div>
        <div class="terminal-split-top">
          <div class="terminal-ai-metrics" id="terminalMetrics"></div>
          <div class="terminal-ai-feed glass-inset" id="terminalAiFeed"></div>
        </div>
        <div class="terminal-ticker-wrap">
          <div class="terminal-ticker-label">LIVE</div>
          <div class="terminal-ticker-scroll" id="terminalTicker"></div>
        </div>
        <div class="terminal-quotes" id="terminalQuotes"></div>
      </div>`;

    function renderScan() {
      const lang = getLang();
      const lines = SCAN_LINES[lang] || SCAN_LINES.en;
      const el = document.getElementById('terminalScanText');
      if (el) el.textContent = lines[Math.floor(Date.now() / 3000) % lines.length];
    }

    function renderMetrics(markets) {
      const el = document.getElementById('terminalMetrics');
      if (!el) return;
      const avgChange = markets.reduce((s, m) => s + m.change, 0) / (markets.length || 1);
      const conf = Math.min(99, 88 + avgChange * 2 + Math.random() * 4).toFixed(1);
      const sentiment = avgChange >= 0 ? 'Bullish' : 'Cautious';
      const vix = (12 + Math.random() * 6).toFixed(1);
      const risk = avgChange > 0.5 ? 'Low' : avgChange < -0.5 ? 'Elevated' : 'Moderate';

      const liq = avgChange >= 0 ? 'Inflow ↑' : 'Neutral';
      el.innerHTML = `
        <div class="t-metric"><span>AI Confidence</span><strong>${conf}%</strong></div>
        <div class="t-metric"><span>Neural Sentiment</span><strong class="${avgChange >= 0 ? 'up' : 'down'}">${sentiment}</strong></div>
        <div class="t-metric"><span>Market Volatility</span><strong>${vix}</strong></div>
        <div class="t-metric"><span>Liquidity Detection</span><strong>${liq}</strong></div>`;
    }

    function renderAiFeed() {
      const el = document.getElementById('terminalAiFeed');
      if (!el) return;
      const lang = getLang();
      const pool = AI_FEED[lang] || AI_FEED.en;
      el.innerHTML = `
        <div class="t-feed-title">AI MARKET FEED</div>
        <ul class="t-feed-list">
          ${pool.map((line, i) => `<li class="t-feed-item" style="animation-delay:${i * 0.15}s"><span class="t-feed-dot"></span>${line}</li>`).join('')}
        </ul>`;
    }

    function renderTicker(markets) {
      const el = document.getElementById('terminalTicker');
      if (!el) return;
      const picks = ['btc', 'ndx', 'sse', 'n225', 'kospi', 'hsi']
        .map((id) => markets.find((m) => m.id === id))
        .filter(Boolean);
      el.innerHTML = picks
        .map(
          (m) =>
            `<span class="t-tick"><b>${m.code}</b> ${WQ.App?.formatPrice?.(m) || m.price} <em class="${m.up ? 'up' : 'down'}">${m.up ? '+' : ''}${m.change.toFixed(2)}%</em></span>`
        )
        .join('');
    }

    function renderQuotes(markets) {
      const el = document.getElementById('terminalQuotes');
      if (!el) return;
      const priority = ['spx', 'ndx', 'btc', 'sse', 'n225', 'hsi', 'eth', 'xau'];
      const subset = priority.map((id) => markets.find((m) => m.id === id)).filter(Boolean).slice(0, 8);
      el.innerHTML = subset
        .map((m) => {
          const sparkId = `tspark-${m.id}`;
          const cap = WQ.App?.formatCap?.(m.marketCap) || '—';
          return `
          <div class="t-quote-row">
            <div class="t-quote-left">
              <div class="t-quote-main">
                <span class="t-sym">${m.code}</span>
                <span class="t-price">${WQ.App?.formatPrice?.(m) || m.price}</span>
                <span class="t-chg ${m.up ? 'up' : 'down'}">${m.up ? '▲' : '▼'} ${Math.abs(m.change).toFixed(2)}%</span>
              </div>
              <div class="t-quote-meta">
                <span>Vol ${WQ.App?.formatVolume?.(m.volume)}</span>
                <span>Cap ${cap}</span>
                <span>Sent ${(m.sentiment * 100).toFixed(0)}</span>
                <span>Mom ${m.momentum?.toFixed(2)}</span>
                <span>σ ${(m.volatility || 0).toFixed(1)}</span>
              </div>
            </div>
            <canvas class="t-mini-spark" id="${sparkId}" width="100" height="36"></canvas>
          </div>`;
        })
        .join('');

      requestAnimationFrame(() => {
        subset.forEach((m) => {
          const c = document.getElementById(`tspark-${m.id}`);
          if (c && WQ.App?.drawSparkline) WQ.App.drawSparkline(c, m.spark, m.up, 100, 36);
        });
      });
    }

    function refresh(markets) {
      renderScan();
      renderMetrics(markets);
      renderAiFeed();
      renderTicker(markets);
      renderQuotes(markets);
    }

    WQ.events.on('markets:updated', refresh);

    if (terminalInterval) clearInterval(terminalInterval);
    terminalInterval = setInterval(() => {
      renderScan();
      renderAiFeed();
    }, 2800);

    refresh(WQ.MarketAPI.getMarkets());
    return { refresh };
  }

  /* ---- Floating AI Insights ---- */
  function initFloatingInsights(langFn) {
    const container = document.getElementById('aiFloatContainer');
    if (!container) return;

    function spawn() {
      const lang = langFn();
      const pool = FLOAT_INSIGHTS[lang] || FLOAT_INSIGHTS.en;
      const text = pool[Math.floor(Math.random() * pool.length)];
      const el = document.createElement('div');
      el.className = 'ai-float-insight';
      el.innerHTML = `<span class="ai-float-icon">◆</span><span>${text}</span>`;
      const x = 5 + Math.random() * 70;
      const y = 10 + Math.random() * 60;
      el.style.left = x + '%';
      el.style.top = y + '%';
      container.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));
      setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 800);
      }, 5000);
    }

    if (floatInterval) clearInterval(floatInterval);
    setTimeout(spawn, 2000);
    floatInterval = setInterval(spawn, WQ.config.FLOATING_INSIGHT_INTERVAL_MS || 12000);
  }

  /* ---- Loader Pro ---- */
  function initLoader(getLang) {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loaderBar');
    const status = document.getElementById('loaderStatus');
    const steps = (getLang && getLang().loaderSteps) || [
      'Connecting to market feeds',
      'Initializing neural models',
      'Syncing global indices',
      'Ready',
    ];

    let progress = 0;
    let step = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 12 + 6;
      if (progress > 100) progress = 100;
      if (bar) bar.style.width = progress + '%';
      if (step < steps.length && progress > (step + 1) * 20) {
        if (status) status.textContent = steps[step];
        step++;
      }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loader?.classList.add('hidden');
          document.body.classList.remove('is-loading');
          loader?.setAttribute('aria-hidden', 'true');
        }, 600);
      }
    }, 160);
  }

  /* ---- Heatmap tooltip ---- */
  function initHeatmapTooltip() {
    const tip = document.getElementById('heatmapTooltip');
    if (!tip) return;

    document.getElementById('heatmapGrid')?.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('.heatmap-cell');
      if (!cell || !cell.dataset.ticker) return;
      tip.innerHTML = `
        <strong>${cell.dataset.ticker}</strong> — ${cell.dataset.name || ''}
        <div class="tip-row"><span>Change</span><span class="${parseFloat(cell.dataset.change) >= 0 ? 'up' : 'down'}">${cell.dataset.change}%</span></div>
        <div class="tip-row"><span>Market Cap</span><span>${cell.dataset.cap || '—'}</span></div>
        <div class="tip-row"><span>Volume</span><span>${cell.dataset.vol || '—'}</span></div>
        <div class="tip-row"><span>AI Sentiment</span><span>${cell.dataset.sent || '—'}</span></div>`;
      tip.classList.add('visible');
      tip.style.left = Math.min(e.clientX + 16, window.innerWidth - 220) + 'px';
      tip.style.top = e.clientY + 16 + 'px';
    });

    document.getElementById('heatmapGrid')?.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget?.closest?.('.heatmap-cell')) tip.classList.remove('visible');
    });
  }

  WQ.Visuals = {
    initGlobe,
    initTerminal,
    initFloatingInsights,
    initLoader,
    initHeatmapTooltip,
    destroy() {
      if (globeAnimId) cancelAnimationFrame(globeAnimId);
      if (terminalInterval) clearInterval(terminalInterval);
      if (floatInterval) clearInterval(floatInterval);
    },
  };
})(window.WesQuant);
