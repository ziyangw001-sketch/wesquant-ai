/**
 * WesQuant AI — Market Data (via secure backend proxy)
 */
window.WesQuant = window.WesQuant || {};

(function (WQ) {
  'use strict';

  const state = { markets: [], lastFetch: null, source: 'demo', fetching: false };

  function genSpark(up, len = 14) {
    const arr = [];
    let v = up ? 0.35 : 0.75;
    for (let i = 0; i < len; i++) {
      v += (Math.random() - (up ? 0.42 : 0.58)) * 0.09;
      arr.push(Math.max(0.05, Math.min(0.95, v)));
    }
    return arr;
  }

  function seedMarket(meta) {
    const bases = {
      spx: 5234, ndx: 16428, dji: 39142, btc: 67420, eth: 3524, xau: 2341, wti: 78.4,
      sse: 3089, szse: 9542, csi: 3612, hsi: 17842, n225: 39842, kospi: 2654, taiex: 22418,
      ftse: 8242, dax: 18234,
    };
    const price = bases[meta.id] || 1000;
    const change = (Math.random() - 0.45) * 2;
    return buildMarket(meta, price, change, genSpark(change >= 0), false);
  }

  function buildMarket(meta, price, changePct, spark, live, extra = {}) {
    return {
      ...meta,
      price,
      change: changePct,
      up: changePct >= 0,
      spark: spark || genSpark(changePct >= 0),
      volume: extra.volume ?? price * (Math.random() * 900 + 100),
      marketCap: extra.marketCap ?? price * 1e6 * (Math.random() * 5 + 1),
      sentiment: extra.sentiment ?? (changePct >= 0 ? 0.55 + Math.random() * 0.35 : 0.2 + Math.random() * 0.35),
      volatility: extra.volatility ?? 8 + Math.random() * 12,
      momentum: extra.momentum ?? changePct * (0.85 + Math.random() * 0.3),
      live: !!live,
    };
  }

  function mergeWithUniverse(apiMarkets) {
    const byId = Object.fromEntries(apiMarkets.map((m) => [m.id, m]));
    return WQ.LIVE_SYMBOLS.map((meta) => {
      if (byId[meta.id]) return { ...meta, ...byId[meta.id] };
      const existing = state.markets.find((m) => m.id === meta.id);
      if (existing) {
        const jitter = (Math.random() - 0.5) * 0.1;
        const change = Math.max(-3, Math.min(3, existing.change + jitter));
        const price = existing.price * (1 + change / 100);
        const spark = [...existing.spark.slice(1), Math.max(0.05, Math.min(0.95, existing.spark.at(-1) + (change >= 0 ? 0.02 : -0.02)))];
        return buildMarket(meta, price, change, spark, false, existing);
      }
      return seedMarket(meta);
    });
  }

  async function fetchAll() {
    if (state.fetching) return state.markets;
    state.fetching = true;
    const base = WQ.config.API_BASE || '';

    try {
      const res = await fetch(`${base}/api/markets`);
      if (res.ok) {
        const data = await res.json();
        state.markets = mergeWithUniverse(data.markets || []);
        state.source = data.source || 'finnhub';
        state.lastFetch = data.updatedAt || Date.now();
      } else {
        throw new Error('API ' + res.status);
      }
    } catch (err) {
      console.warn('[WesQuant] Markets API:', err.message);
      if (!state.markets.length) {
        state.markets = WQ.LIVE_SYMBOLS.map(seedMarket);
      } else {
        state.markets = state.markets.map((m) => {
          const meta = WQ.LIVE_SYMBOLS.find((s) => s.id === m.id) || m;
          const jitter = (Math.random() - 0.5) * 0.12;
          const change = Math.max(-3, Math.min(3, m.change + jitter));
          const price = m.price * (1 + change / 100);
          const spark = [...m.spark.slice(1), Math.max(0.05, Math.min(0.95, m.spark.at(-1) + (change >= 0 ? 0.02 : -0.02)))];
          return buildMarket(meta, price, change, spark, m.live, m);
        });
      }
      state.source = 'demo';
    } finally {
      state.fetching = false;
    }

    WQ.events.emit('markets:updated', state.markets);
    return state.markets;
  }

  function getMarkets() {
    return state.markets.length ? state.markets : WQ.LIVE_SYMBOLS.map(seedMarket);
  }

  WQ.MarketAPI = {
    fetchAll,
    getMarkets,
    getSource: () => state.source,
    isLive: () => state.source === 'finnhub',
    buildMarket,
    genSpark,
    getState: () => ({ ...state }),
  };
})(window.WesQuant);
