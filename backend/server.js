/**
 * WesQuant AI — Express API Proxy
 * Keys live in ../.env only — never exposed to the browser.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { marketDataService } = require('./services/marketData.service');

const app = express();
const PORT = process.env.PORT || 3001;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

marketDataService.configure({ apiKey: FINNHUB_KEY });

const MARKETS = [
  { id: 'spx', finnhub: 'SPY', region: 'us', symbol: 'S&P 500', code: 'SPX', currency: '$' },
  { id: 'ndx', finnhub: 'QQQ', region: 'us', symbol: 'NASDAQ', code: 'NDX', currency: '$' },
  { id: 'dji', finnhub: 'DIA', region: 'us', symbol: 'Dow Jones', code: 'DJI', currency: '$' },
  { id: 'btc', finnhub: 'BINANCE:BTCUSDT', region: 'crypto', symbol: 'Bitcoin', code: 'BTC', currency: '$', crypto: true },
  { id: 'eth', finnhub: 'BINANCE:ETHUSDT', region: 'crypto', symbol: 'Ethereum', code: 'ETH', currency: '$', crypto: true },
  { id: 'xau', finnhub: 'OANDA:XAU_USD', region: 'commodity', symbol: 'Gold', code: 'XAU', currency: '$' },
  { id: 'wti', finnhub: 'OANDA:WTICO_USD', region: 'commodity', symbol: 'Oil (WTI)', code: 'WTI', currency: '$' },
  { id: 'sse', finnhub: '000001.SS', region: 'cn', symbol: 'Shanghai Composite', code: 'SSE', currency: '¥' },
  { id: 'n225', finnhub: 'N225', region: 'jp', symbol: 'Nikkei 225', code: 'N225', currency: '¥' },
  { id: 'hsi', finnhub: 'HSI', region: 'hk', symbol: 'Hang Seng', code: 'HSI', currency: 'HK$' },
  { id: 'kospi', finnhub: 'KOSPI', region: 'kr', symbol: 'KOSPI', code: 'KOSPI', currency: '₩', formatKr: true },
];

const demoSeeds = {
  spx: 5234, ndx: 16428, dji: 39142, btc: 67420, eth: 3524, xau: 2341, wti: 78.4,
  sse: 3089, n225: 39842, hsi: 17842, kospi: 2654,
};

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    finnhub: !!FINNHUB_KEY,
    openrouter: !!OPENROUTER_KEY,
    model: OPENROUTER_MODEL,
  });
});

app.get('/api/status', (_req, res) => {
  res.json({
    aiNodesOnline: 128 + Math.floor(Math.random() * 24),
    engineStatus: OPENROUTER_KEY ? 'operational' : 'standby',
    marketSource: FINNHUB_KEY ? 'finnhub' : 'demo',
    uptime: process.uptime(),
  });
});

app.get('/api/markets', async (_req, res) => {
  try {
    const payload = await marketDataService.fetchAllMarkets(MARKETS, demoSeeds);
    res.json(payload);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      markets: MARKETS.map((meta) => marketDataService.buildDemoMarket(meta, demoSeeds)),
    });
  }
});

/** Unified quote endpoint — ready for future websocket / terminal integrations. */
app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  if (!symbol?.trim()) {
    return res.status(400).json({ error: 'Symbol required' });
  }

  const quote = await marketDataService.getUnifiedQuote(symbol);
  const status = quote.error ? (quote.error === 'NOT_CONFIGURED' ? 503 : 502) : 200;
  res.status(status).json({
    source: marketDataService.isConfigured() && !quote.error ? 'finnhub' : 'demo',
    quote,
  });
});

app.post('/api/chat', async (req, res) => {
  const { message, history = [], lang = 'en' } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

  const systemPrompt = `You are WesQuant AI, an institutional financial intelligence assistant for global markets.
Respond in ${lang === 'zh' ? 'Simplified Chinese' : lang === 'ms' ? 'Bahasa Melayu' : 'English'}.
Be concise, professional, data-driven. Reference macro context when relevant. No disclaimers about being an AI unless asked.`;

  if (!OPENROUTER_KEY) {
    return res.json({
      reply: simulatedChat(message, lang),
      source: 'simulated',
    });
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://wesquant.ai',
        'X-Title': 'WesQuant AI',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: 600,
        temperature: 0.65,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'No response generated.';
    res.json({ reply, source: 'openrouter', model: OPENROUTER_MODEL });
  } catch (err) {
    console.error('[chat]', err.message);
    res.json({ reply: simulatedChat(message, lang), source: 'fallback', error: err.message });
  }
});

function simulatedChat(message, lang) {
  const q = message.toLowerCase();
  const en = {
    bitcoin: 'Bitcoin is supported by ETF inflows and improving risk appetite. Monitor funding rates and $68K resistance.',
    fed: 'Fed policy is the key driver. Watch PCE, FOMC rhetoric, and USD moves for equity transmission.',
    default: 'WesQuant detects constructive global risk sentiment with moderate volatility. Ask about a specific asset for detail.',
  };
  const zh = {
    bitcoin: '比特币受ETF资金流支撑，关注资金费率与上方阻力。',
    fed: '美联储政策是核心变量，关注PCE与美元传导。',
    default: 'WesQuant检测到全球风险偏好偏积极，可指定资产深入分析。',
  };
  const r = lang === 'zh' ? zh : en;
  if (/bitcoin|btc/.test(q)) return r.bitcoin;
  if (/fed|rate/.test(q)) return r.fed;
  return r.default;
}

app.listen(PORT, () => {
  console.log(`WesQuant AI API → http://localhost:${PORT}`);
  console.log(`Finnhub: ${FINNHUB_KEY ? 'configured' : 'missing — demo markets'}`);
  console.log(`OpenRouter: ${OPENROUTER_KEY ? 'configured' : 'missing — simulated chat'}`);
});
