/**
 * WesQuant AI — Market Data Service
 * Central layer for Finnhub requests, caching, session state, and future realtime feeds.
 */

const EventEmitter = require('events');
const { formatForFinnhub, resolveSymbolMeta, getQuoteCandidates, scaleQuoteToIndexLevel } = require('../utils/symbolFormatter');
const {
  mapQuote,
  mapCandlesToSpark,
  mapMissingData,
} = require('../mappers/finnhub.mapper');

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = {
  quote: 15_000,
  spark: 60_000,
};
const BATCH_DELAY_MS = 150;

class MarketDataError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'MarketDataError';
    this.code = code;
    this.details = details;
  }
}

class MarketDataService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.apiKey = options.apiKey || process.env.FINNHUB_API_KEY || '';
    this.timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.cache = new Map();
    this.subscribers = new Set();
  }

  configure(options = {}) {
    if (options.apiKey != null) this.apiKey = options.apiKey;
    if (options.timeoutMs != null) this.timeoutMs = options.timeoutMs;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  publish(event, payload) {
    this.emit(event, payload);
    for (const listener of this.subscribers) {
      try {
        listener(event, payload);
      } catch (err) {
        console.error('[marketData] subscriber error:', err.message);
      }
    }
  }

  getCacheKey(type, symbol) {
    return `${type}:${formatForFinnhub(symbol)}`;
  }

  getFromCache(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  setCache(key, data, ttlMs) {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  clearCache() {
    this.cache.clear();
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new MarketDataError('Finnhub API timeout', 'API_TIMEOUT', { url });
      }
      throw new MarketDataError(err.message || 'Finnhub request failed', 'API_ERROR', { url });
    } finally {
      clearTimeout(timer);
    }
  }

  async finnhubRequest(path, params = {}) {
    if (!this.apiKey) {
      throw new MarketDataError('Finnhub API key not configured', 'NOT_CONFIGURED');
    }

    const query = new URLSearchParams({ ...params, token: this.apiKey });
    const url = `${FINNHUB_BASE}${path}?${query.toString()}`;
    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      throw new MarketDataError(`Finnhub HTTP ${response.status}`, 'API_ERROR', {
        status: response.status,
        path,
      });
    }

    return response.json();
  }

  async fetchFinnhubQuote(symbol, originalSymbol = symbol) {
    const candidates = getQuoteCandidates(originalSymbol);
    let lastError = null;

    for (const candidate of candidates) {
      const finnhubSymbol = candidate.symbol;
      const cacheKey = this.getCacheKey('quote', `${originalSymbol}:${finnhubSymbol}`);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      try {
        const raw = await this.finnhubRequest('/quote', { symbol: finnhubSymbol });
        let quote = mapQuote(raw, originalSymbol);
        quote.finnhubSymbol = finnhubSymbol;
        quote.dataSource = candidate.isFallback ? 'fallback' : 'primary';

        if (candidate.isFallback && candidate.scale) {
          quote = scaleQuoteToIndexLevel(quote, candidate.scale);
        }

        this.setCache(cacheKey, quote, CACHE_TTL_MS.quote);
        this.publish('quote:updated', quote);
        return quote;
      } catch (err) {
        lastError = err instanceof MarketDataError
          ? err
          : new MarketDataError(err.message || 'Quote fetch failed', err.code || 'API_ERROR', {
            symbol: finnhubSymbol,
          });
      }
    }

    if (lastError) throw lastError;
    throw new MarketDataError('Invalid quote: missing or zero price', 'INVALID_QUOTE', {
      symbol: formatForFinnhub(originalSymbol),
    });
  }

  async fetchFinnhubSpark(symbol, finnhubSymbol = null) {
    const resolvedSymbol = finnhubSymbol || formatForFinnhub(symbol);
    const cacheKey = this.getCacheKey('spark', resolvedSymbol);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const to = Math.floor(Date.now() / 1000);
    const from = to - 7 * 86400;

    try {
      const raw = await this.finnhubRequest('/stock/candle', {
        symbol: resolvedSymbol,
        resolution: '60',
        from: String(from),
        to: String(to),
      });

      const spark = mapCandlesToSpark(raw);
      if (spark) {
        this.setCache(cacheKey, spark, CACHE_TTL_MS.spark);
      }
      return spark;
    } catch (err) {
      console.warn('[marketData] spark fetch failed:', resolvedSymbol, err.message);
      return null;
    }
  }

  async getQuote(symbol) {
    if (!this.isConfigured()) {
      return mapMissingData(symbol, 'NOT_CONFIGURED');
    }

    try {
      return await this.fetchFinnhubQuote(symbol, symbol);
    } catch (err) {
      if (err instanceof MarketDataError) throw err;
      throw new MarketDataError(err.message, 'API_ERROR', { symbol });
    }
  }

  genSpark(up, len = 14) {
    const arr = [];
    let v = up ? 0.35 : 0.7;
    for (let i = 0; i < len; i++) {
      v += (Math.random() - (up ? 0.42 : 0.58)) * 0.09;
      arr.push(Math.max(0.05, Math.min(0.95, v)));
    }
    return arr;
  }

  buildDemoMarket(meta, demoSeeds = {}) {
    const base = demoSeeds[meta.id] || 1000;
    const changePercent = (Math.random() - 0.45) * 2;
    const price = base * (1 + changePercent / 100);
    const symbolMeta = resolveSymbolMeta(meta.finnhub || meta.code || meta.id);

    const quote = {
      symbol: symbolMeta.symbol || meta.code || meta.id,
      exchange: symbolMeta.exchange,
      price,
      change: price * (changePercent / 100),
      changePercent,
      high: price * 1.01,
      low: price * 0.99,
      delayed: true,
      marketStatus: symbolMeta.marketStatus,
      timestamp: Date.now(),
    };

    return this.toLegacyMarket(meta, quote, this.genSpark(changePercent >= 0), false);
  }

  toLegacyMarket(meta, quote, spark, live, extra = {}) {
    const changePercent = quote.changePercent ?? 0;

    return {
      ...meta,
      symbol: meta.symbol,
      exchange: quote.exchange,
      price: quote.price,
      change: changePercent,
      changePercent,
      changeAbs: quote.change,
      high: quote.high,
      low: quote.low,
      delayed: quote.delayed,
      marketStatus: quote.marketStatus,
      timestamp: quote.timestamp,
      up: changePercent >= 0,
      spark: spark || this.genSpark(changePercent >= 0),
      volume: extra.volume ?? quote.volume ?? quote.price * (Math.random() * 800 + 200),
      marketCap: extra.marketCap ?? quote.price * 1e9 * (Math.random() * 3 + 0.5),
      sentiment: extra.sentiment ?? (changePercent >= 0 ? 0.58 + Math.random() * 0.3 : 0.25 + Math.random() * 0.3),
      volatility: extra.volatility ?? 9 + Math.abs(changePercent) * 1.8,
      momentum: extra.momentum ?? changePercent * 1.05,
      live: !!live && !quote.delayed,
      fromApi: !!live,
      finnhubSymbol: quote.finnhubSymbol || formatForFinnhub(meta.finnhub),
    };
  }

  async fetchMarket(meta, demoSeeds = {}) {
    if (!this.isConfigured()) {
      return this.buildDemoMarket(meta, demoSeeds);
    }

    try {
      const symbol = meta.finnhub || meta.code || meta.id;
      const quote = await this.fetchFinnhubQuote(symbol, symbol);
      let spark = await this.fetchFinnhubSpark(symbol, quote.finnhubSymbol);
      if (!spark) spark = this.genSpark(quote.changePercent >= 0);

      const fromApi = !quote.error;
      return this.toLegacyMarket(meta, quote, spark, fromApi, {
        volume: quote.volume,
        sentiment: quote.changePercent >= 0
          ? 0.55 + Math.min(0.4, quote.changePercent / 8)
          : 0.35 - Math.min(0.3, Math.abs(quote.changePercent) / 8),
        volatility: 10 + Math.abs(quote.changePercent) * 2,
        momentum: quote.changePercent,
      });
    } catch (err) {
      console.warn('[marketData] fetchMarket fallback:', meta.id, err.code || err.message);
      return this.buildDemoMarket(meta, demoSeeds);
    }
  }

  async fetchAllMarkets(markets, demoSeeds = {}) {
    const results = [];
    let liveCount = 0;
    let apiCount = 0;

    for (const meta of markets) {
      const market = await this.fetchMarket(meta, demoSeeds);
      if (market.live) liveCount += 1;
      if (market.fromApi) apiCount += 1;
      results.push(market);
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }

    return {
      source: this.isConfigured() && apiCount > 0 ? 'finnhub' : 'demo',
      liveCount,
      delayedCount: results.filter((m) => m.fromApi && m.delayed).length,
      updatedAt: Date.now(),
      markets: results,
    };
  }

  async getUnifiedQuote(symbol) {
    try {
      return await this.getQuote(symbol);
    } catch (err) {
      if (err instanceof MarketDataError) {
        return mapMissingData(symbol, err.code);
      }
      return mapMissingData(symbol, 'API_ERROR');
    }
  }
}

const marketDataService = new MarketDataService();

module.exports = {
  MarketDataService,
  MarketDataError,
  marketDataService,
};
