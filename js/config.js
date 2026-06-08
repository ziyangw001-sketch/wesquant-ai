/**
 * WesQuant AI — Frontend Configuration
 * API keys are stored server-side in /.env — never put secrets here.
 */
window.WesQuant = window.WesQuant || {};

window.WesQuant.events = window.WesQuant.events || {
  _handlers: {},
  on(event, fn) {
    (this._handlers[event] = this._handlers[event] || []).push(fn);
  },
  emit(event, data) {
    (this._handlers[event] || []).forEach((fn) => fn(data));
  },
};

function resolveApiBase() {
  if (typeof window === 'undefined') return '';
  const { hostname, port, protocol } = window.location;
  if (protocol === 'file:') return 'http://localhost:3001';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (port === '3001') return '';
    return 'http://localhost:3001';
  }
  return '';
}

window.WesQuant.config = {
  API_BASE: resolveApiBase(),
  linkedin: 'https://www.linkedin.com/in/wesley-wang-747b20372/',
  langKey: 'wesquant-lang',
  USE_LIVE_DATA: true,
  DATA_REFRESH_MS: 30000,
  FLOATING_INSIGHT_INTERVAL_MS: 14000,
};

/** Extended universe (backend fetches priority 11; demo fills rest) */
window.WesQuant.LIVE_SYMBOLS = [
  { id: 'spx', finnhub: 'SPY', region: 'us', symbol: 'S&P 500', code: 'SPX', currency: '$' },
  { id: 'ndx', finnhub: 'QQQ', region: 'us', symbol: 'NASDAQ', code: 'NDX', currency: '$' },
  { id: 'dji', finnhub: 'DIA', region: 'us', symbol: 'Dow Jones', code: 'DJI', currency: '$' },
  { id: 'btc', finnhub: 'BINANCE:BTCUSDT', region: 'crypto', symbol: 'Bitcoin', code: 'BTC', currency: '$', crypto: true },
  { id: 'eth', finnhub: 'BINANCE:ETHUSDT', region: 'crypto', symbol: 'Ethereum', code: 'ETH', currency: '$', crypto: true },
  { id: 'xau', finnhub: 'OANDA:XAU_USD', region: 'commodity', symbol: 'Gold', code: 'XAU', currency: '$' },
  { id: 'wti', finnhub: 'OANDA:WTICO_USD', region: 'commodity', symbol: 'Oil (WTI)', code: 'WTI', currency: '$' },
  { id: 'sse', finnhub: '000001.SS', region: 'cn', symbol: 'Shanghai Composite', code: 'SSE', currency: '¥' },
  { id: 'szse', finnhub: '399001.SZ', region: 'cn', symbol: 'Shenzhen', code: 'SZSE', currency: '¥' },
  { id: 'csi', finnhub: '000300.SS', region: 'cn', symbol: 'CSI 300', code: 'CSI300', currency: '¥' },
  { id: 'hsi', finnhub: 'HSI', region: 'hk', symbol: 'Hang Seng', code: 'HSI', currency: 'HK$' },
  { id: 'n225', finnhub: 'N225', region: 'jp', symbol: 'Nikkei 225', code: 'N225', currency: '¥' },
  { id: 'kospi', finnhub: 'KOSPI', region: 'kr', symbol: 'KOSPI', code: 'KOSPI', currency: '₩', formatKr: true },
  { id: 'taiex', finnhub: 'TWII', region: 'tw', symbol: 'TAIEX', code: 'TAIEX', currency: 'NT$' },
  { id: 'ftse', finnhub: 'ISF.L', region: 'eu', symbol: 'FTSE 100', code: 'FTSE', currency: '£' },
  { id: 'dax', finnhub: 'EXS1.DE', region: 'eu', symbol: 'DAX', code: 'DAX', currency: '€' },
];
