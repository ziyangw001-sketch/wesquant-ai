/**
 * Maps Finnhub API payloads to WesQuant unified market data structures.
 */

const {
  resolveSymbolMeta,
  getMarketSession,
  MARKET_STATUS,
} = require('../utils/symbolFormatter');

function isValidQuote(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.c == null || data.c === 0) return false;
  return Number.isFinite(Number(data.c));
}

function mapQuote(raw, symbolInput, fetchedAt = Date.now()) {
  if (!isValidQuote(raw)) {
    const err = new Error('Invalid quote: missing or zero price');
    err.code = 'INVALID_QUOTE';
    throw err;
  }

  const meta = resolveSymbolMeta(symbolInput);
  const price = Number(raw.c);
  const previousClose = raw.pc != null ? Number(raw.pc) : null;
  const change = raw.d != null
    ? Number(raw.d)
    : previousClose
      ? price - previousClose
      : 0;
  const changePercent = raw.dp != null
    ? Number(raw.dp)
    : previousClose
      ? ((price - previousClose) / previousClose) * 100
      : 0;

  const timestamp = raw.t ? Number(raw.t) * 1000 : fetchedAt;
  const marketStatus = getMarketSession(meta.exchange, new Date(fetchedAt));

  return {
    symbol: meta.symbol || symbolInput,
    exchange: meta.exchange,
    price,
    change,
    changePercent,
    high: raw.h != null ? Number(raw.h) : null,
    low: raw.l != null ? Number(raw.l) : null,
    delayed: meta.delayed,
    marketStatus,
    timestamp,
    volume: raw.v != null ? Number(raw.v) : null,
    previousClose,
    finnhubSymbol: meta.finnhubSymbol,
    assetClass: meta.assetClass,
  };
}

function mapCandlesToSpark(candles) {
  if (!candles || candles.s !== 'ok' || !Array.isArray(candles.c) || !candles.c.length) {
    return null;
  }

  const closes = candles.c.slice(-14);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  return closes.map((close) => (close - min) / range);
}

function mapMissingData(symbolInput, reason = 'MISSING_DATA') {
  const meta = resolveSymbolMeta(symbolInput);
  return {
    symbol: meta.symbol || symbolInput,
    exchange: meta.exchange,
    price: null,
    change: null,
    changePercent: null,
    high: null,
    low: null,
    delayed: meta.delayed,
    marketStatus: meta.marketStatus || MARKET_STATUS.CLOSED,
    timestamp: Date.now(),
    error: reason,
    finnhubSymbol: meta.finnhubSymbol,
  };
}

module.exports = {
  isValidQuote,
  mapQuote,
  mapCandlesToSpark,
  mapMissingData,
};
