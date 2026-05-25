/**
 * Symbol resolution & exchange mapping for WesQuant market data.
 */

const EXCHANGE_SUFFIXES = {
  HK: 'HKEX',
  SI: 'SGX',
  SS: 'SSE',
  SZ: 'SZSE',
  L: 'LSE',
  DE: 'XETRA',
  TO: 'TSX',
  AX: 'ASX',
  PA: 'EPA',
  SW: 'SIX',
};

/** Known symbol → exchange overrides (Finnhub ticker keys). */
const SYMBOL_EXCHANGE = {
  AAPL: 'NASDAQ',
  TSLA: 'NASDAQ',
  MSFT: 'NASDAQ',
  GOOGL: 'NASDAQ',
  AMZN: 'NASDAQ',
  META: 'NASDAQ',
  NVDA: 'NASDAQ',
  AMD: 'NASDAQ',
  INTC: 'NASDAQ',
  QQQ: 'NASDAQ',
  SPY: 'NYSEARCA',
  DIA: 'NYSEARCA',
  IWM: 'NYSEARCA',
  '0700.HK': 'HKEX',
  '9988.HK': 'HKEX',
  '3690.HK': 'HKEX',
  'D05.SI': 'SGX',
  'O39.SI': 'SGX',
  'U11.SI': 'SGX',
  HSI: 'HKEX',
  N225: 'TSE',
  KOSPI: 'KRX',
  TWII: 'TWSE',
  '000001.SS': 'SSE',
  '399001.SZ': 'SZSE',
  '000300.SS': 'SSE',
  'ISF.L': 'LSE',
  'EXS1.DE': 'XETRA',
};

const EXCHANGE_TIMEZONES = {
  NASDAQ: 'America/New_York',
  NYSE: 'America/New_York',
  NYSEARCA: 'America/New_York',
  HKEX: 'Asia/Hong_Kong',
  SGX: 'Asia/Singapore',
  SSE: 'Asia/Shanghai',
  SZSE: 'Asia/Shanghai',
  TSE: 'Asia/Tokyo',
  KRX: 'Asia/Seoul',
  TWSE: 'Asia/Taipei',
  LSE: 'Europe/London',
  XETRA: 'Europe/Berlin',
  TSE_CA: 'America/Toronto',
  ASX: 'Australia/Sydney',
};

const EXCHANGE_SESSIONS = {
  NASDAQ: { pre: [4, 0, 9, 30], open: [9, 30, 16, 0], after: [16, 0, 20, 0] },
  NYSE: { pre: [4, 0, 9, 30], open: [9, 30, 16, 0], after: [16, 0, 20, 0] },
  NYSEARCA: { pre: [4, 0, 9, 30], open: [9, 30, 16, 0], after: [16, 0, 20, 0] },
  HKEX: { open: [[9, 30, 12, 0], [13, 0, 16, 0]] },
  SGX: { open: [[9, 0, 12, 0], [13, 0, 17, 0]] },
  SSE: { open: [[9, 30, 11, 30], [13, 0, 15, 0]] },
  SZSE: { open: [[9, 30, 11, 30], [13, 0, 15, 0]] },
  TSE: { open: [[9, 0, 11, 30], [12, 30, 15, 0]] },
  KRX: { open: [[9, 0, 15, 30]] },
  TWSE: { open: [[9, 0, 13, 30]] },
  LSE: { open: [[8, 0, 16, 30]] },
  XETRA: { open: [[9, 0, 17, 30]] },
};

const MARKET_STATUS = {
  PRE_MARKET: 'PRE_MARKET',
  OPEN: 'OPEN',
  AFTER_HOURS: 'AFTER_HOURS',
  CLOSED: 'CLOSED',
};

const REALTIME_EXCHANGES = new Set(['CRYPTO', 'FOREX', 'COMMODITY']);

/** Primary index symbol → US ETF proxy (Finnhub free tier) + index level scale. */
const ASIA_INDEX_FALLBACKS = {
  HSI: { symbol: 'EWH', scale: 759 },
  N225: { symbol: 'EWJ', scale: 435 },
  KOSPI: { symbol: 'EWY', scale: 14.6 },
  TWII: { symbol: 'EWT', scale: 231.5 },
  '000001.SS': { symbol: 'FXI', scale: 87 },
  '399001.SZ': { symbol: 'ASHR', scale: 270 },
  '000300.SS': { symbol: 'ASHR', scale: 102 },
};

function getAsiaIndexFallback(primarySymbol) {
  const normalized = normalizeSymbol(primarySymbol);
  return ASIA_INDEX_FALLBACKS[normalized] || null;
}

function getQuoteCandidates(input) {
  const primary = formatForFinnhub(input);
  const fallback = getAsiaIndexFallback(primary);
  if (!fallback) return [{ symbol: primary }];
  return [
    { symbol: primary },
    { symbol: fallback.symbol, scale: fallback.scale, isFallback: true },
  ];
}

function scaleQuoteToIndexLevel(quote, scale) {
  if (!scale || !quote?.price) return quote;
  return {
    ...quote,
    price: quote.price * scale,
    change: quote.change != null ? quote.change * scale : quote.change,
    high: quote.high != null ? quote.high * scale : quote.high,
    low: quote.low != null ? quote.low * scale : quote.low,
    previousClose: quote.previousClose != null ? quote.previousClose * scale : quote.previousClose,
  };
}

function normalizeSymbol(input) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().toUpperCase();
}

function detectAssetClass(symbol) {
  if (symbol.startsWith('BINANCE:') || symbol.startsWith('COINBASE:')) return 'CRYPTO';
  if (symbol.startsWith('OANDA:') || symbol.startsWith('FX:')) return 'FOREX';
  if (/^(BTC|ETH|XRP|SOL)(USDT?|USD)?$/i.test(symbol)) return 'CRYPTO';
  return 'EQUITY';
}

function resolveExchange(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return 'UNKNOWN';

  if (SYMBOL_EXCHANGE[normalized]) return SYMBOL_EXCHANGE[normalized];

  const assetClass = detectAssetClass(normalized);
  if (assetClass === 'CRYPTO') return 'CRYPTO';
  if (assetClass === 'FOREX') return 'FOREX';

  const dotIdx = normalized.lastIndexOf('.');
  if (dotIdx > 0) {
    const suffix = normalized.slice(dotIdx + 1);
    if (EXCHANGE_SUFFIXES[suffix]) return EXCHANGE_SUFFIXES[suffix];
  }

  if (/^[A-Z]{1,5}$/.test(normalized)) return 'NASDAQ';

  return 'UNKNOWN';
}

function formatForFinnhub(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return '';

  if (normalized.includes(':')) return normalized;

  const exchange = resolveExchange(normalized);
  if (exchange === 'CRYPTO' && !normalized.includes(':')) {
    return `BINANCE:${normalized}USDT`;
  }

  return normalized;
}

function isDelayedFeed(exchange, assetClass) {
  if (REALTIME_EXCHANGES.has(exchange) || REALTIME_EXCHANGES.has(assetClass)) {
    return false;
  }
  return true;
}

function getLocalTimeParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const minutes = Number(lookup.hour) * 60 + Number(lookup.minute);
  return {
    weekday: weekdayMap[lookup.weekday] ?? 0,
    minutes,
  };
}

function inRange(minutes, startH, startM, endH, endM) {
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return minutes >= start && minutes < end;
}

function inAnyRange(minutes, ranges) {
  return ranges.some(([sh, sm, eh, em]) => inRange(minutes, sh, sm, eh, em));
}

function getMarketSession(exchange, now = new Date()) {
  const normalizedExchange = exchange || 'UNKNOWN';

  if (REALTIME_EXCHANGES.has(normalizedExchange)) {
    return MARKET_STATUS.OPEN;
  }

  const session = EXCHANGE_SESSIONS[normalizedExchange];
  const timeZone = EXCHANGE_TIMEZONES[normalizedExchange] || 'America/New_York';

  if (!session) return MARKET_STATUS.CLOSED;

  const { weekday, minutes } = getLocalTimeParts(now, timeZone);
  if (weekday === 0 || weekday === 6) return MARKET_STATUS.CLOSED;

  if (session.pre && inRange(minutes, ...session.pre)) return MARKET_STATUS.PRE_MARKET;
  if (session.after && inRange(minutes, ...session.after)) return MARKET_STATUS.AFTER_HOURS;

  const openRanges = Array.isArray(session.open[0]) ? session.open : [session.open];
  if (inAnyRange(minutes, openRanges)) return MARKET_STATUS.OPEN;

  return MARKET_STATUS.CLOSED;
}

function resolveSymbolMeta(input) {
  const symbol = normalizeSymbol(input);
  const finnhubSymbol = formatForFinnhub(symbol);
  const exchange = resolveExchange(finnhubSymbol);
  const assetClass = detectAssetClass(finnhubSymbol);

  return {
    symbol,
    finnhubSymbol,
    exchange,
    assetClass,
    delayed: isDelayedFeed(exchange, assetClass),
    marketStatus: getMarketSession(exchange),
  };
}

module.exports = {
  MARKET_STATUS,
  normalizeSymbol,
  formatForFinnhub,
  resolveExchange,
  resolveSymbolMeta,
  getMarketSession,
  isDelayedFeed,
  detectAssetClass,
  getAsiaIndexFallback,
  getQuoteCandidates,
  scaleQuoteToIndexLevel,
};
