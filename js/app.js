/**
 * WesQuant AI — Application Orchestrator
 */
(function () {
  'use strict';

  const WQ = window.WesQuant;
  const CONFIG = WQ.config;
  const LANG_LABELS = { en: 'EN', zh: '中文', ms: 'BM' };
  let currentLang = localStorage.getItem(CONFIG.langKey) || 'en';
  let activeRegion = 'all';
  let chartPeriod = '1M';
  let mainChartData = [];
  let portfolioAnimated = false;
  let marketsData = [];
  const chatHistory = [];

  function syncMarkets() {
    marketsData = WQ.MarketAPI.getMarkets();
  }

  /* ========== i18n ========== */
  const i18n = {
    en: {
      'loader.subtitle': 'Initializing Global Financial Intelligence...',
      'nav.markets': 'Markets',
      'nav.heatmap': 'Heatmap',
      'nav.ai': 'AI Insights',
      'nav.portfolio': 'Portfolio',
      'nav.analytics': 'Analytics',
      'nav.news': 'News',
      'nav.contact': 'Contact',
      'nav.cta': 'Launch',
      'profile.welcome': 'Welcome Back,',
      'profile.badge': 'AI Investor · Premium',
      'profile.live': 'Markets Live',
      'profile.aiOnline': 'AI Online',
      'sys.clock': 'Market Clock',
      'sys.nodes': 'Global AI Nodes',
      'sys.online': 'Online',
      'sys.engine': 'AI Engine',
      'sys.activity': 'AI Activity',
      'hero.badge': 'AI-Powered Global Intelligence',
      'hero.title1': 'WesQuant',
      'hero.title2': 'Financial Intelligence',
      'hero.subtitle':
        'The AI investment operating system for global markets. Institutional-grade analytics across 150+ markets — powered by next-generation quantitative intelligence.',
      'hero.cta1': 'Global Markets',
      'hero.cta2': 'AI Analysis',
      'hero.cta3': 'Ask AI Assistant',
      'hero.stat1': 'Assets Tracked',
      'hero.stat2': 'AI Accuracy',
      'hero.stat3': 'Global Indices',
      'markets.tag': 'Global Markets',
      'markets.title': 'World Markets Dashboard',
      'markets.desc':
        'Real-time indices across Americas, Asia-Pacific, Europe, crypto, and commodities — institutional data architecture.',
      'heatmap.tag': 'Market Heatmap',
      'heatmap.title': 'Sector Performance Heatmap',
      'heatmap.desc':
        'Bloomberg-style visualization of sector and equity performance. Size reflects market cap weight.',
      'heatmap.up': 'Gainers',
      'heatmap.down': 'Losers',
      'ai.title': 'AI Market Summary',
      'ai.badge': 'WesQuant AI · Live',
      'ai.summary':
        'Global equities advanced as rate-cut expectations lifted technology and growth sectors. S&P 500 +0.82%, NASDAQ +1.24%. Asian markets mixed: Hang Seng +0.6%, Nikkei +0.9%, KOSPI flat. Bitcoin held $67K+; Ethereum +1.2%. Gold firm on safe-haven demand; oil -0.8% on demand concerns. WesQuant models favor AI, semiconductors, and quality growth with moderate energy exposure.',
      'ai.refresh': 'Regenerate Analysis',
      'ai.confidence': 'Confidence',
      'portfolio.tag': 'Portfolio',
      'portfolio.title': 'Asset Overview',
      'portfolio.desc': 'Premium account dashboard — holdings, performance, and risk intelligence.',
      'analytics.tag': 'Analytics',
      'analytics.title': 'Performance Analytics',
      'analytics.desc': 'Deep-dive into portfolio performance, sector allocation, and historical trends.',
      'analytics.chart1': 'Portfolio Performance',
      'analytics.all': 'ALL',
      'analytics.sector': 'Sector Allocation',
      'analytics.total': 'Total',
      'analytics.metrics': 'Key Metrics',
      'news.tag': 'Intelligence Feed',
      'news.title': 'AI-Generated Market News',
      'news.desc': 'Curated headlines with AI summaries and sentiment analysis.',
      'contact.tag': 'Connect',
      'contact.title': 'Partner With WesQuant AI',
      'contact.desc':
        'Institutional partnerships, enterprise solutions, and investment intelligence — reach out through secure channels.',
      'contact.whatsapp': 'WhatsApp',
      'contact.whatsappHint': 'Secure messaging',
      'contact.email': 'Email',
      'contact.emailHint': 'Business inquiries',
      'contact.linkedin': 'LinkedIn',
      'contact.linkedinHint': 'Professional network',
      'footer.tagline': 'AI-driven global market intelligence platform.',
      'footer.copy': '© 2026 WesQuant AI. All rights reserved. Demo data for illustration.',
      'chat.title': 'WesQuant AI Assistant',
      'chat.subtitle': 'Financial Intelligence',
      'chat.placeholder': 'Ask about markets...',
      'chat.welcome':
        "Hello Wesley! I'm your WesQuant AI assistant. Ask me about markets, sectors, or macro trends.",
      regions: {
        all: 'All Markets',
        us: 'United States',
        cn: 'China',
        hk: 'Hong Kong',
        jp: 'Japan',
        kr: 'Korea',
        tw: 'Taiwan',
        eu: 'Europe',
        crypto: 'Crypto',
        commodity: 'Commodities',
      },
      portfolio: {
        totalAssets: 'Total Assets',
        dailyProfit: 'Daily Profit',
        riskLevel: 'Risk Level',
        allocation: 'Asset Allocation',
        moderate: 'Moderate',
        vsYesterday: 'vs yesterday',
        equities: 'Equities',
        bonds: 'Bonds',
        crypto: 'Crypto',
        cash: 'Cash',
        premium: 'Premium Account',
      },
      metrics: {
        sharpe: 'Sharpe Ratio',
        beta: 'Portfolio Beta',
        ytd: 'YTD Return',
        drawdown: 'Max Drawdown',
        volatility: 'Volatility (30d)',
      },
      sectors: ['Technology', 'Healthcare', 'Financials', 'Consumer', 'Energy', 'Other'],
      insights: [
        { label: 'Tech Sector', value: '+1.8%' },
        { label: 'Fed Outlook', value: 'Dovish' },
        { label: 'VIX', value: '14.2' },
        { label: 'BTC Trend', value: 'Bullish' },
      ],
      chatSuggestions: [
        'Why is Bitcoin rising today?',
        'Should investors watch the Fed this week?',
        'What sectors are outperforming?',
      ],
      loaderSteps: [
        'Connecting to market feeds',
        'Loading global indices',
        'Initializing AI models',
        'Ready',
      ],
    },
    zh: {
      'loader.subtitle': '正在初始化全球市场情报系统...',
      'nav.markets': '市场',
      'nav.heatmap': '热力图',
      'nav.ai': 'AI 洞察',
      'nav.portfolio': '资产组合',
      'nav.analytics': '数据分析',
      'nav.news': '新闻',
      'nav.contact': '联系',
      'nav.cta': '启动',
      'profile.welcome': '欢迎回来，',
      'profile.badge': 'AI 投资者 · 高级',
      'profile.live': '市场实时',
      'profile.aiOnline': 'AI 在线',
      'sys.clock': '市场时钟',
      'sys.nodes': '全球 AI 节点',
      'sys.online': '在线',
      'sys.engine': 'AI 引擎',
      'sys.activity': 'AI 活动',
      'hero.badge': 'AI 驱动全球情报',
      'hero.title1': 'WesQuant',
      'hero.title2': '金融智能平台',
      'hero.subtitle':
        '面向全球市场的 AI 投资操作系统。覆盖 150+ 市场的机构级分析 — 由下一代量化智能驱动。',
      'hero.cta1': '全球市场',
      'hero.cta2': 'AI 分析',
      'hero.cta3': '询问 AI 助手',
      'hero.stat1': '追踪资产',
      'hero.stat2': 'AI 准确率',
      'hero.stat3': '全球指数',
      'markets.tag': '全球市场',
      'markets.title': '世界市场 Dashboard',
      'markets.desc': '美洲、亚太、欧洲、加密货币与大宗商品的实时指数 — 机构级数据架构。',
      'heatmap.tag': '市场热力图',
      'heatmap.title': '板块表现热力图',
      'heatmap.desc': 'Bloomberg 风格板块与个股表现可视化，面积反映市值权重。',
      'heatmap.up': '上涨',
      'heatmap.down': '下跌',
      'ai.title': 'AI 市场分析',
      'ai.badge': 'WesQuant AI · 实时',
      'ai.summary':
        '全球股市因降息预期上涨，科技与成长板块领涨。标普500涨0.82%，纳斯达克涨1.24%。亚洲市场分化：恒生涨0.6%，日经涨0.9%，KOSPI持平。比特币站稳67,000美元上方，以太坊涨1.2%。黄金因避险需求坚挺，原油跌0.8%。WesQuant模型看好AI、半导体与优质成长，能源敞口适中。',
      'ai.refresh': '重新生成分析',
      'ai.confidence': '置信度',
      'portfolio.tag': '资产组合',
      'portfolio.title': '资产概览',
      'portfolio.desc': '高级账户 Dashboard — 持仓、业绩与风险智能分析。',
      'analytics.tag': '数据分析',
      'analytics.title': '业绩分析',
      'analytics.desc': '深入分析资产组合表现、行业配置与历史趋势。',
      'analytics.chart1': '资产组合表现',
      'analytics.all': '全部',
      'analytics.sector': '行业配置',
      'analytics.total': '总计',
      'analytics.metrics': '关键指标',
      'news.tag': '情报资讯',
      'news.title': 'AI 生成市场新闻',
      'news.desc': '精选头条，附 AI 摘要与情绪分析。',
      'contact.tag': '联系我们',
      'contact.title': '与 WesQuant AI 合作',
      'contact.desc': '机构合作、企业解决方案与投资智能 — 通过安全渠道联系。',
      'contact.whatsapp': 'WhatsApp',
      'contact.whatsappHint': '安全即时通讯',
      'contact.email': '电子邮件',
      'contact.emailHint': '商务咨询',
      'contact.linkedin': 'LinkedIn',
      'contact.linkedinHint': '职业社交网络',
      'footer.tagline': 'AI 驱动的全球市场智能平台。',
      'footer.copy': '© 2026 WesQuant AI. 版权所有。演示数据仅供展示。',
      'chat.title': 'WesQuant AI 助手',
      'chat.subtitle': '金融智能',
      'chat.placeholder': '询问市场相关问题...',
      'chat.welcome': '你好 Wesley！我是 WesQuant AI 助手，可以解答市场、板块和宏观问题。',
      regions: {
        all: '全部市场',
        us: '美国',
        cn: '中国',
        hk: '香港',
        jp: '日本',
        kr: '韩国',
        tw: '台湾',
        eu: '欧洲',
        crypto: '加密货币',
        commodity: '大宗商品',
      },
      portfolio: {
        totalAssets: '总资产',
        dailyProfit: '日收益',
        riskLevel: '风险等级',
        allocation: '资产配置',
        moderate: '中等',
        vsYesterday: '较昨日',
        equities: '股票',
        bonds: '债券',
        crypto: '加密货币',
        cash: '现金',
        premium: '高级账户',
      },
      metrics: {
        sharpe: '夏普比率',
        beta: '组合贝塔',
        ytd: '年初至今回报',
        drawdown: '最大回撤',
        volatility: '波动率 (30日)',
      },
      sectors: ['科技', '医疗', '金融', '消费', '能源', '其他'],
      insights: [
        { label: '科技板块', value: '+1.8%' },
        { label: '美联储', value: '鸽派' },
        { label: 'VIX', value: '14.2' },
        { label: 'BTC', value: '看涨' },
      ],
      chatSuggestions: [
        '比特币今天为什么上涨？',
        '投资者本周应关注美联储吗？',
        '哪些板块表现突出？',
      ],
      loaderSteps: ['连接市场数据源', '加载全球指数', '初始化 AI 模型', '就绪'],
    },
    ms: {
      'loader.subtitle': 'Memulakan Kecerdasan Pasaran Global...',
      'nav.markets': 'Pasaran',
      'nav.heatmap': 'Peta Haba',
      'nav.ai': 'Wawasan AI',
      'nav.portfolio': 'Portfolio',
      'nav.analytics': 'Analitik',
      'nav.news': 'Berita',
      'nav.contact': 'Hubungi',
      'nav.cta': 'Lancar',
      'profile.welcome': 'Selamat Kembali,',
      'profile.badge': 'Pelabur AI · Premium',
      'profile.live': 'Pasaran Langsung',
      'profile.aiOnline': 'AI Dalam Talian',
      'sys.clock': 'Jam Pasaran',
      'sys.nodes': 'Nod AI Global',
      'sys.online': 'Dalam Talian',
      'sys.engine': 'Enjin AI',
      'sys.activity': 'Aktiviti AI',
      'hero.badge': 'Kecerdasan Global Berkuasa AI',
      'hero.title1': 'WesQuant',
      'hero.title2': 'Kecerdasan Kewangan',
      'hero.subtitle':
        'Sistem operasi pelaburan AI untuk pasaran global. Analitik gred institusi merentasi 150+ pasaran — dikuasakan oleh kecerdasan kuantitatif generasi baharu.',
      'hero.cta1': 'Pasaran Global',
      'hero.cta2': 'Analisis AI',
      'hero.cta3': 'Tanya Pembantu AI',
      'hero.stat1': 'Aset Di Jejaki',
      'hero.stat2': 'Ketepatan AI',
      'hero.stat3': 'Indeks Global',
      'markets.tag': 'Pasaran Global',
      'markets.title': 'Dashboard Pasaran Dunia',
      'markets.desc':
        'Indeks masa nyata merentasi Amerika, Asia-Pasifik, Eropah, kripto dan komoditi — seni bina data institusi.',
      'heatmap.tag': 'Peta Haba Pasaran',
      'heatmap.title': 'Peta Haba Prestasi Sektor',
      'heatmap.desc':
        'Visualisasi gaya Bloomberg prestasi sektor dan ekuiti. Saiz mencerminkan berat permodalan pasaran.',
      'heatmap.up': 'Peningkat',
      'heatmap.down': 'Penurun',
      'ai.title': 'Ringkasan Pasaran AI',
      'ai.badge': 'WesQuant AI · Langsung',
      'ai.summary':
        'Ekuiti global meningkat apabila jangkaan pemotongan kadar mengangkat sektor teknologi. S&P 500 +0.82%, NASDAQ +1.24%. Pasaran Asia bercampur. Bitcoin kekal di atas $67K; Ethereum +1.2%. Emas kukuh; minyak -0.8%. Model WesQuant memihak AI, semikonduktor dan pertumbuhan berkualiti.',
      'ai.refresh': 'Jana Semula Analisis',
      'ai.confidence': 'Keyakinan',
      'portfolio.tag': 'Portfolio',
      'portfolio.title': 'Gambaran Aset',
      'portfolio.desc': 'Dashboard akaun premium — pegangan, prestasi dan risiko.',
      'analytics.tag': 'Analitik',
      'analytics.title': 'Analitik Prestasi',
      'analytics.desc': 'Analisis mendalam prestasi portfolio dan peruntukan sektor.',
      'analytics.chart1': 'Prestasi Portfolio',
      'analytics.all': 'SEMUA',
      'analytics.sector': 'Peruntukan Sektor',
      'analytics.total': 'Jumlah',
      'analytics.metrics': 'Metrik Utama',
      'news.tag': 'Suapan Perisikan',
      'news.title': 'Berita Pasaran AI',
      'news.desc': 'Tajuk utama dengan ringkasan AI dan analisis sentimen.',
      'contact.tag': 'Hubungi',
      'contact.title': 'Berkongsi dengan WesQuant AI',
      'contact.desc':
        'Perkongsian institusi, penyelesaian perusahaan dan perisikan pelaburan — hubungi melalui saluran selamat.',
      'contact.whatsapp': 'WhatsApp',
      'contact.whatsappHint': 'Pemesejan selamat',
      'contact.email': 'E-mel',
      'contact.emailHint': 'Pertanyaan perniagaan',
      'contact.linkedin': 'LinkedIn',
      'contact.linkedinHint': 'Rangkaian profesional',
      'footer.tagline': 'Platform perisikan pasaran global berkuasa AI.',
      'footer.copy': '© 2026 WesQuant AI. Hak cipta terpelihara. Data demo untuk ilustrasi.',
      'chat.title': 'Pembantu WesQuant AI',
      'chat.subtitle': 'Kecerdasan Kewangan',
      'chat.placeholder': 'Tanya tentang pasaran...',
      'chat.welcome':
        'Hello Wesley! Saya pembantu WesQuant AI anda. Tanya tentang pasaran, sektor atau trend makro.',
      regions: {
        all: 'Semua Pasaran',
        us: 'Amerika Syarikat',
        cn: 'China',
        hk: 'Hong Kong',
        jp: 'Jepun',
        kr: 'Korea',
        tw: 'Taiwan',
        eu: 'Eropah',
        crypto: 'Kripto',
        commodity: 'Komoditi',
      },
      portfolio: {
        totalAssets: 'Jumlah Aset',
        dailyProfit: 'Keuntungan Harian',
        riskLevel: 'Tahap Risiko',
        allocation: 'Peruntukan Aset',
        moderate: 'Sederhana',
        vsYesterday: 'berbanding semalam',
        equities: 'Ekuiti',
        bonds: 'Bon',
        crypto: 'Kripto',
        cash: 'Tunai',
        premium: 'Akaun Premium',
      },
      metrics: {
        sharpe: 'Nisbah Sharpe',
        beta: 'Beta Portfolio',
        ytd: 'Pulangan YTD',
        drawdown: 'Drawdown Maks',
        volatility: 'Volatiliti (30h)',
      },
      sectors: ['Teknologi', 'Penjagaan Kesihatan', 'Kewangan', 'Pengguna', 'Tenaga', 'Lain'],
      insights: [
        { label: 'Sektor Tek', value: '+1.8%' },
        { label: 'Fed', value: 'Dovish' },
        { label: 'VIX', value: '14.2' },
        { label: 'BTC', value: 'Bullish' },
      ],
      chatSuggestions: [
        'Mengapa Bitcoin meningkat hari ini?',
        'Patutkah pelabur pantau Fed minggu ini?',
        'Sektor manakah mengatasi prestasi?',
      ],
      loaderSteps: [
        'Menyambung suapan pasaran',
        'Memuatkan indeks global',
        'Memulakan model AI',
        'Sedia',
      ],
    },
  };

  const heatmapData = [
    { ticker: 'NVDA', name: 'NVIDIA', change: 3.24, size: 'lg' },
    { ticker: 'AAPL', name: 'Apple', change: 0.67, size: 'md' },
    { ticker: 'MSFT', name: 'Microsoft', change: 1.12, size: 'lg' },
    { ticker: 'GOOGL', name: 'Alphabet', change: 0.89, size: 'md' },
    { ticker: 'AMZN', name: 'Amazon', change: -0.34, size: 'md' },
    { ticker: 'META', name: 'Meta', change: 1.45, size: 'sm' },
    { ticker: 'TSLA', name: 'Tesla', change: 2.18, size: 'md' },
    { ticker: 'JPM', name: 'JPMorgan', change: 0.42, size: 'sm' },
    { ticker: 'V', name: 'Visa', change: 0.28, size: 'sm' },
    { ticker: 'XOM', name: 'Exxon', change: -1.24, size: 'sm' },
    { ticker: 'JNJ', name: 'J&J', change: -0.18, size: 'sm' },
    { ticker: 'AMD', name: 'AMD', change: 2.84, size: 'md' },
    { ticker: 'COIN', name: 'Coinbase', change: 4.12, size: 'sm' },
    { ticker: 'BA', name: 'Boeing', change: -0.92, size: 'sm' },
    { ticker: 'NFLX', name: 'Netflix', change: -1.56, size: 'sm' },
    { ticker: 'TSM', name: 'TSMC', change: 1.68, size: 'md' },
    { ticker: 'BABA', name: 'Alibaba', change: -2.14, size: 'sm' },
    { ticker: 'LLY', name: 'Eli Lilly', change: 0.95, size: 'sm' },
  ];

  const newsData = {
    en: [
      { source: 'WesQuant Intel', time: '2h ago', title: 'Fed Signals Potential Rate Cut in Q3 2026', summary: 'Fed officials hinted at possible rate reduction amid cooling inflation. Bond yields declined 8bps.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'AI Digest', time: '4h ago', title: 'NVIDIA Surpasses $3T on AI Enterprise Demand', summary: 'Chipmaker reaches historic valuation as AI adoption accelerates globally.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'Asia Pacific', time: '5h ago', title: 'Hang Seng Rises on Mainland Stimulus Hopes', summary: 'Hong Kong index gained 0.6% as investors anticipate further policy support from Beijing.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'Global Macro', time: '6h ago', title: 'ECB Holds Rates Steady', summary: 'ECB maintains policy stance while monitoring energy prices. Euro -0.3% vs USD.', sentiment: 'neutral', sentimentLabel: 'Neutral' },
      { source: 'Crypto Watch', time: '8h ago', title: 'Bitcoin ETF Inflows Hit Weekly Record', summary: 'Spot Bitcoin ETFs recorded $1.2B net inflows. Institutional participation grows.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'Commodities', time: '10h ago', title: 'Oil Retreats on Demand Concerns', summary: 'WTI fell 1.8% as softening global demand forecasts weigh on energy sector.', sentiment: 'bearish', sentimentLabel: 'Bearish' },
    ],
    zh: [
      { source: 'WesQuant 情报', time: '2小时前', title: '美联储暗示2026年Q3可能降息', summary: '美联储在通胀降温背景下暗示可能降息，债券收益率下降8个基点。', sentiment: 'bullish', sentimentLabel: '看涨' },
      { source: 'AI 摘要', time: '4小时前', title: '英伟达市值突破3万亿美元', summary: '随着全球AI应用加速，芯片巨头达到历史性估值。', sentiment: 'bullish', sentimentLabel: '看涨' },
      { source: '亚太市场', time: '5小时前', title: '恒生指数因刺激预期上涨', summary: '香港指数涨0.6%，投资者预期北京进一步政策支持。', sentiment: 'bullish', sentimentLabel: '看涨' },
      { source: '全球宏观', time: '6小时前', title: '欧洲央行维持利率不变', summary: '欧洲央行维持政策立场，欧元对美元走弱0.3%。', sentiment: 'neutral', sentimentLabel: '中性' },
      { source: '加密观察', time: '8小时前', title: '比特币ETF周流入创新高', summary: '现货比特币ETF本周净流入12亿美元。', sentiment: 'bullish', sentimentLabel: '看涨' },
      { source: '大宗商品', time: '10小时前', title: '油价因需求担忧回落', summary: 'WTI原油下跌1.8%，全球需求预测疲软压制能源板块。', sentiment: 'bearish', sentimentLabel: '看跌' },
    ],
    ms: [
      { source: 'WesQuant Intel', time: '2j lalu', title: 'Fed Isyarat Pemotongan Kadar Q3 2026', summary: 'Pegawai Fed mencadangkan pemotongan kadar. Hasil bon turun 8bps.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'AI Digest', time: '4j lalu', title: 'NVIDIA Melepasi $3T', summary: 'Pengeluar cip mencapai penilaian bersejarah apabila AI di perusahaan meningkat.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'Asia Pasifik', time: '5j lalu', title: 'Hang Seng Naik Atas Harapan Rangsangan', summary: 'Indeks Hong Kong +0.6% apabila pelabur menjangka sokongan dasar Beijing.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'Makro Global', time: '6j lalu', title: 'ECB Kekalkan Kadar', summary: 'ECB kekalkan dasar sambil memantau harga tenaga. Euro -0.3% berbanding USD.', sentiment: 'neutral', sentimentLabel: 'Neutral' },
      { source: 'Crypto Watch', time: '8j lalu', title: 'Aliran Masuk ETF Bitcoin Rekod', summary: 'ETF Bitcoin spot merekod $1.2B aliran masuk bersih minggu ini.', sentiment: 'bullish', sentimentLabel: 'Bullish' },
      { source: 'Komoditi', time: '10j lalu', title: 'Minyak Menurun Atas Kebimbangan Permintaan', summary: 'WTI -1.8% apabila ramalan permintaan global melemah.', sentiment: 'bearish', sentimentLabel: 'Bearish' },
    ],
  };

  const sectorColors = ['#3b82f6', '#22d3ee', '#8b5cf6', '#10b981', '#f59e0b', '#64748b'];
  const sectorPcts = [32, 18, 15, 14, 11, 10];
  const metricsData = [
    { key: 'sharpe', value: '1.92', positive: true },
    { key: 'beta', value: '0.88', positive: null },
    { key: 'ytd', value: '+21.6%', positive: true },
    { key: 'drawdown', value: '-5.8%', positive: false },
    { key: 'volatility', value: '11.4%', positive: null },
  ];
  const allocationData = [
    { key: 'equities', pct: 52 },
    { key: 'bonds', pct: 22 },
    { key: 'crypto', pct: 14 },
    { key: 'cash', pct: 12 },
  ];

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function genSpark(up) {
    const arr = [];
    let v = up ? 0.3 : 0.8;
    for (let i = 0; i < 10; i++) {
      v += (Math.random() - (up ? 0.4 : 0.6)) * 0.12;
      arr.push(Math.max(0, Math.min(1, v)));
    }
    return arr;
  }

  function t(key) {
    const dict = i18n[currentLang] || i18n.en;
    if (key.includes('.')) return dict[key] ?? i18n.en[key] ?? key;
    return dict[key] ?? i18n.en[key] ?? key;
  }

  function tRegion(key) {
    return i18n[currentLang].regions[key] || i18n.en.regions[key];
  }

  /* ========== i18n ========== */
  function applyTranslations() {
    const langMap = { en: 'en', zh: 'zh-CN', ms: 'ms' };
    document.documentElement.lang = langMap[currentLang] || 'en';

    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (typeof val === 'string') el.textContent = val;
    });

    $$('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) el.placeholder = val;
    });

    $('#langCurrent').textContent = LANG_LABELS[currentLang];
    $$('#langMenu button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    const loaderSub = $('.loader-subtitle');
    if (loaderSub) loaderSub.textContent = t('loader.subtitle');

    renderRegionTabs();
    renderMarkets();
    renderHeatmap();
    renderAiInsights();
    renderPortfolio();
    renderSectorList();
    renderMetrics();
    renderNews();
    renderChatSuggestions();
    updateAiTimestamp();
    initChatWelcome();
  }

  function setLanguage(lang) {
    if (!i18n[lang] || lang === currentLang) return;
    const switcher = $('#langSwitcher');
    switcher?.classList.add('switching');
    document.body.classList.add('lang-switching');

    currentLang = lang;
    localStorage.setItem(CONFIG.langKey, currentLang);

    setTimeout(() => {
      applyTranslations();
      document.body.classList.remove('lang-switching');
      switcher?.classList.remove('switching');
    }, 280);
  }

  /* ========== Formatters ========== */
  function formatPrice(m) {
    const { price, currency, formatKr } = m;
    if (formatKr) return '₩' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 10000) return currency + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 1000) return currency + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency + price.toFixed(2);
  }

  function formatChange(pct, up) {
    return (up ? '+' : '') + pct.toFixed(2) + '%';
  }

  function formatVolume(v) {
    if (!v) return '—';
    if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    return (v / 1e3).toFixed(0) + 'K';
  }

  function formatCap(v) {
    if (!v) return '—';
    if (v >= 1e12) return '$' + (v / 1e12).toFixed(2) + 'T';
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
    return '$' + (v / 1e6).toFixed(0) + 'M';
  }

  function updateDataPill() {
    const pill = $('#dataSourcePill');
    if (!pill) return;
    const src = WQ.MarketAPI.getSource();
    pill.textContent = src === 'finnhub' ? 'LIVE' : 'DEMO';
    pill.classList.toggle('live', WQ.MarketAPI.isLive());
  }

  const ACTIVITY_LINES = {
    en: ['Neural scan complete', 'Macro feed synced', 'Liquidity map updated', 'Sentiment model refreshed'],
    zh: ['神经扫描完成', '宏观数据已同步', '流动性图谱已更新', '情绪模型已刷新'],
    ms: ['Imbasan neural selesai', 'Suapan makro disegerakkan', 'Peta kecairan dikemas kini'],
  };

  function initSystemBar() {
    const zones = [
      { id: 'clockNYC', tz: 'America/New_York' },
      { id: 'clockLDN', tz: 'Europe/London' },
      { id: 'clockHKG', tz: 'Asia/Hong_Kong' },
    ];

    function tickClocks() {
      zones.forEach(({ id, tz }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const label = id.replace('clock', '');
        const time = new Date().toLocaleTimeString('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        el.textContent = `${label} ${time}`;
      });
    }

    async function refreshStatus() {
      const base = WQ.config.API_BASE || '';
      try {
        const res = await fetch(`${base}/api/status`);
        if (res.ok) {
          const d = await res.json();
          const nodes = $('#aiNodesCount');
          if (nodes) nodes.textContent = d.aiNodesOnline?.toLocaleString() || '—';
          const eng = $('#aiEngineStatus');
          if (eng) {
            const ok = d.engineStatus === 'operational';
            eng.innerHTML = `<span class="pulse-dot"></span> ${ok ? 'Operational' : 'Standby'}`;
          }
        }
      } catch (_) {}
    }

    function pushActivity() {
      const feed = $('#aiActivityFeed');
      if (!feed) return;
      const pool = ACTIVITY_LINES[currentLang] || ACTIVITY_LINES.en;
      const line = pool[Math.floor(Math.random() * pool.length)];
      const item = document.createElement('span');
      item.className = 'inst-feed-item';
      item.textContent = line;
      feed.prepend(item);
      while (feed.children.length > 3) feed.lastChild.remove();
    }

    tickClocks();
    refreshStatus();
    pushActivity();
    setInterval(tickClocks, 1000);
    setInterval(refreshStatus, 60000);
    setInterval(pushActivity, 8000);
  }

  WQ.App = { formatPrice, formatVolume, formatCap, formatChange, drawSparkline };

  function getHeatClass(change) {
    if (change >= 2) return 'up-strong';
    if (change >= 0.5) return 'up';
    if (change >= 0) return 'up-mild';
    if (change >= -0.5) return 'down-mild';
    if (change >= -2) return 'down';
    return 'down-strong';
  }

  /* ========== Sparkline ========== */
  function drawSparkline(canvas, data, up, fixedW, fixedH) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const rect = parent?.getBoundingClientRect?.() || { width: fixedW || 100 };
    const w = fixedW || rect.width;
    const h = fixedH || 48;
    if (w === 0) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const pad = 4;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const color = up ? '#10b981' : '#ef4444';

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, up ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)');
    grad.addColorStop(1, 'transparent');

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w - pad, h);
    ctx.lineTo(pad, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /* ========== Region tabs & markets ========== */
  function renderRegionTabs() {
    const container = $('#regionTabs');
    if (!container) return;
    const regions = i18n[currentLang].regions;
    container.innerHTML = Object.keys(regions)
      .map(
        (key) =>
          `<button class="region-tab ${key === activeRegion ? 'active' : ''}" data-region="${key}">${regions[key]}</button>`
      )
      .join('');

    container.querySelectorAll('.region-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        activeRegion = tab.dataset.region;
        renderRegionTabs();
        renderMarkets();
      });
    });
  }

  function renderMarkets() {
    const grid = $('#marketGrid');
    if (!grid) return;

    const filtered =
      activeRegion === 'all' ? marketsData : marketsData.filter((m) => m.region === activeRegion);

    grid.innerHTML = filtered
      .map((m, i) => `
      <article class="market-card glass-card reveal ${m.live ? 'is-live' : ''}" style="transition-delay:${i * 0.05}s">
        <div class="market-card-header">
          <div>
            <div class="market-symbol">${m.symbol} ${m.live ? '<span class="live-dot">●</span>' : ''}</div>
            <div class="market-name">${m.code}</div>
            <div class="market-region">${tRegion(m.region)}</div>
          </div>
          <div class="market-icon">${m.code.slice(0, 2)}</div>
        </div>
        <div class="market-price">${formatPrice(m)}</div>
        <span class="market-change ${m.up ? 'up' : 'down'}">${m.up ? '▲' : '▼'} ${formatChange(Math.abs(m.change), m.up)}</span>
        <div class="market-meta-row">
          <span>Vol ${formatVolume(m.volume)}</span>
          <span>σ ${(m.volatility || 0).toFixed(1)}</span>
        </div>
        <div class="market-sparkline"><canvas data-spark-id="${m.id}"></canvas></div>
      </article>`)
      .join('');

    requestAnimationFrame(() => {
      grid.querySelectorAll('canvas[data-spark-id]').forEach((canvas) => {
        const m = marketsData.find((x) => x.id === canvas.dataset.sparkId);
        if (m) drawSparkline(canvas, m.spark, m.up);
      });
    });

    observeReveals(grid.querySelectorAll('.reveal'));
  }

  /* ========== Heatmap ========== */
  function renderHeatmap() {
    const grid = $('#heatmapGrid');
    if (!grid) return;

    grid.innerHTML = heatmapData
      .map((cell) => {
        const cls = getHeatClass(cell.change);
        const sign = cell.change >= 0 ? '+' : '';
        const cap = cell.marketCap || (500 + Math.random() * 2500) * 1e9;
        const vol = cell.volume || cap * 0.002;
        const sent = (55 + cell.change * 8).toFixed(0);
        return `
        <div class="heatmap-cell ${cls} size-${cell.size}"
          data-ticker="${cell.ticker}" data-name="${cell.name}" data-change="${cell.change.toFixed(2)}"
          data-cap="${formatCap(cap)}" data-vol="${formatVolume(vol)}" data-sent="${sent}/100">
          <span class="heatmap-ticker">${cell.ticker}</span>
          <span class="heatmap-name">${cell.name}</span>
          <span class="heatmap-change">${sign}${cell.change.toFixed(2)}%</span>
          <span class="heatmap-vol">${formatVolume(vol)} vol</span>
        </div>`;
      })
      .join('');
  }

  /* ========== Live ticker ========== */
  function initLiveTicker() {
    const ticker = $('#liveTicker');
    if (!ticker) return;

    const items = marketsData
      .map(
        (m) =>
          `<span class="ticker-item"><span class="sym">${m.code}</span> ${formatPrice(m)} <span class="${m.up ? 'up' : 'down'}">${formatChange(m.change, m.up)}</span></span>`
      )
      .join('');

    ticker.innerHTML = `<div class="ticker-track">${items}${items}</div>`;
  }

  /* ========== AI Summary ========== */
  function renderAiInsights() {
    const container = $('#aiInsights');
    if (!container) return;
    container.innerHTML = i18n[currentLang].insights
      .map((ins) => `<span class="ai-insight-tag"><strong>${ins.label}</strong> ${ins.value}</span>`)
      .join('');
  }

  function updateAiTimestamp() {
    const el = $('#aiTimestamp');
    if (!el) return;
    const now = new Date();
    const locales = { en: 'en-US', zh: 'zh-CN', ms: 'ms-MY' };
    const prefix = currentLang === 'zh' ? '更新于 ' : currentLang === 'ms' ? 'Dikemas kini ' : 'Updated ';
    el.textContent =
      prefix +
      now.toLocaleString(locales[currentLang] || 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
  }

  function typeAiSummary() {
    const el = $('#aiSummaryText');
    if (!el) return;
    const text = t('ai.summary');
    el.classList.add('typing');
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i++];
      } else {
        clearInterval(interval);
        el.classList.remove('typing');
      }
    }, 10);
  }

  /* ========== Portfolio ========== */
  function animateValue(el, end, prefix, suffix, decimals) {
    const duration = 1800;
    const startTime = performance.now();
    function update(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const current = end * eased;
      el.textContent =
        prefix +
        (decimals === 0 ? Math.round(current).toLocaleString() : current.toFixed(decimals)) +
        suffix;
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function renderPortfolio() {
    const grid = $('#portfolioGrid');
    if (!grid) return;
    const p = i18n[currentLang].portfolio;

    grid.innerHTML = `
      <div class="portfolio-card glass-card reveal">
        <div class="portfolio-label">${p.totalAssets} · <span style="color:var(--gold)">${p.premium}</span></div>
        <div class="portfolio-value" data-animate="4200000" data-prefix="$" data-decimals="0">$0</div>
        <div class="portfolio-sub">${p.vsYesterday} <span style="color:var(--green)">+2.4%</span></div>
      </div>
      <div class="portfolio-card glass-card reveal" style="transition-delay:0.1s">
        <div class="portfolio-label">${p.dailyProfit}</div>
        <div class="portfolio-value" data-animate="98420" data-prefix="+$" data-decimals="0">$0</div>
        <div class="portfolio-sub">${p.vsYesterday} <span style="color:var(--green)">+1.12%</span></div>
      </div>
      <div class="portfolio-card glass-card risk reveal" style="transition-delay:0.2s">
        <div class="portfolio-label">${p.riskLevel}</div>
        <div class="portfolio-value">${p.moderate}</div>
        <div class="risk-bar"><div class="risk-fill" data-risk="38" style="width:0%"></div></div>
        <div class="portfolio-sub">Score: 38 / 100</div>
      </div>
      <div class="portfolio-card glass-card reveal" style="transition-delay:0.3s">
        <div class="portfolio-label">${p.allocation}</div>
        <div class="allocation-bars">
          ${allocationData
            .map(
              (a) => `
            <div class="alloc-row">
              <span>${p[a.key]}</span>
              <div class="alloc-bar"><div class="alloc-fill" data-alloc="${a.pct}" style="width:0%"></div></div>
              <span class="alloc-pct">${a.pct}%</span>
            </div>`
            )
            .join('')}
        </div>
      </div>`;

    observeReveals(grid.querySelectorAll('.reveal'));
  }

  function runPortfolioAnimations() {
    if (portfolioAnimated) return;
    portfolioAnimated = true;
    $$('[data-animate]').forEach((el) => {
      animateValue(el, parseFloat(el.dataset.animate), el.dataset.prefix || '', '', parseInt(el.dataset.decimals, 10) || 0);
    });
    const riskFill = $('.risk-fill');
    if (riskFill) setTimeout(() => { riskFill.style.width = riskFill.dataset.risk + '%'; }, 400);
    $$('.alloc-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.alloc + '%'; }, 500 + i * 120);
    });
  }

  /* ========== Charts ========== */
  function generateChartData(points) {
    const data = [];
    let v = 3.8;
    for (let i = 0; i < points; i++) {
      v += (Math.random() - 0.42) * 0.08;
      v = Math.max(3.5, Math.min(4.5, v));
      data.push(v);
    }
    return data;
  }

  function drawMainChart() {
    const canvas = $('#mainChart');
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent || parent.clientWidth === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const data = mainChartData;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    const min = Math.min(...data) * 0.98;
    const max = Math.max(...data) * 1.02;
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0)');

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const y = pad.top + chartH - ((v - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const y = pad.top + chartH - ((v - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lineGrad = ctx.createLinearGradient(pad.left, 0, w - pad.right, 0);
    lineGrad.addColorStop(0, '#3b82f6');
    lineGrad.addColorStop(0.5, '#22d3ee');
    lineGrad.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = max - (i / 4) * range;
      ctx.fillText('$' + val.toFixed(2) + 'M', pad.left - 8, pad.top + (i / 4) * chartH + 4);
    }

    const legend = $('#chartLegend');
    if (legend && data.length) {
      const chg = (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(2);
      const up = data[data.length - 1] >= data[0];
      legend.innerHTML = `
        <div class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span> Portfolio</div>
        <div class="legend-item"><span class="legend-dot" style="background:${up ? '#10b981' : '#ef4444'}"></span> ${up ? '+' : ''}${chg}% ${chartPeriod}</div>`;
    }
  }

  function drawDonutChart() {
    const canvas = $('#donutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    let start = -Math.PI / 2;
    sectorPcts.forEach((pct, i) => {
      const angle = (pct / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, start, start + angle);
      ctx.arc(cx, cy, 48, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = sectorColors[i];
      ctx.fill();
      start += angle;
    });
  }

  function renderSectorList() {
    const list = $('#sectorList');
    if (!list) return;
    list.innerHTML = i18n[currentLang].sectors
      .map(
        (name, i) => `
      <li><span class="sector-name"><span class="sector-color" style="background:${sectorColors[i]}"></span>${name}</span>
      <span class="sector-pct">${sectorPcts[i]}%</span></li>`
      )
      .join('');
  }

  function renderMetrics() {
    const list = $('#metricsList');
    if (!list) return;
    const m = i18n[currentLang].metrics;
    list.innerHTML = metricsData
      .map((item) => {
        const cls = item.positive === true ? 'positive' : item.positive === false ? 'negative' : '';
        return `<li><span class="metric-label">${m[item.key]}</span><span class="metric-value ${cls}">${item.value}</span></li>`;
      })
      .join('');
  }

  function renderNews() {
    const grid = $('#newsGrid');
    if (!grid) return;
    const items = newsData[currentLang] || newsData.en;
    grid.innerHTML = items
      .map(
        (n, i) => `
      <article class="news-card glass-card reveal" style="transition-delay:${i * 0.06}s">
        <div class="news-meta"><span class="news-source">${n.source}</span><span class="news-time">${n.time}</span></div>
        <h3 class="news-title">${n.title}</h3>
        <p class="news-summary">${n.summary}</p>
        <span class="news-sentiment ${n.sentiment}">${n.sentimentLabel}</span>
      </article>`
      )
      .join('');
    observeReveals(grid.querySelectorAll('.reveal'));
  }

  /* ========== AI Chat ========== */
  function initChatWelcome() {
    const msgs = $('#aiChatMessages');
    if (!msgs || msgs.dataset.welcomed) return;
    msgs.dataset.welcomed = '1';
    msgs.innerHTML = '';
    appendChatMessage('ai', t('chat.welcome'));
  }

  function renderChatSuggestions() {
    const container = $('#aiChatSuggestions');
    if (!container) return;
    container.innerHTML = i18n[currentLang].chatSuggestions
      .map((q) => `<button class="chat-chip" data-question="${q.replace(/"/g, '&quot;')}">${q}</button>`)
      .join('');

    container.querySelectorAll('.chat-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $('#aiChatInput').value = chip.dataset.question;
        sendChatMessage();
      });
    });
  }

  function appendChatMessage(role, text, typing) {
    const msgs = $('#aiChatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}${typing ? ' typing' : ''}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function typeChatResponse(el, text) {
    el.classList.add('typing');
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i++];
        $('#aiChatMessages').scrollTop = $('#aiChatMessages').scrollHeight;
      } else {
        clearInterval(interval);
        el.classList.remove('typing');
      }
    }, 14);
  }

  function setChatStatus(text, active) {
    const status = $('#aiChatStatus');
    if (!status) return;
    status.textContent = text || '';
    status.classList.toggle('active', !!active);
  }

  async function sendChatMessage() {
    const input = $('#aiChatInput');
    const text = input?.value?.trim();
    if (!text) return;

    appendChatMessage('user', text);
    chatHistory.push({ role: 'user', content: text });
    input.value = '';

    setChatStatus(WQ.AIEngine.pickThinking(currentLang), true);
    const thinking = appendChatMessage('ai', '');

    try {
      const result = await WQ.AIEngine.chat(text, currentLang, chatHistory.slice(-8));
      thinking.remove();
      chatHistory.push({ role: 'assistant', content: result.text });
      const el = appendChatMessage('ai', '');
      typeChatResponse(el, result.text);
    } catch (err) {
      thinking.textContent = 'Unable to process request. Please try again.';
    } finally {
      setChatStatus('', false);
    }
  }

  function initAiChat() {
    const panel = $('#aiChatPanel');
    const fab = $('#aiFab');
    const close = $('#aiChatClose');
    const send = $('#aiChatSend');
    const input = $('#aiChatInput');

    function openChat() {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      input?.focus();
    }

    function closeChat() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }

    fab?.addEventListener('click', () => {
      panel.classList.contains('open') ? closeChat() : openChat();
    });
    close?.addEventListener('click', closeChat);
    $('#openAiFromHero')?.addEventListener('click', openChat);
    send?.addEventListener('click', sendChatMessage);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  /* ========== Lang menu ========== */
  function initLangSwitcher() {
    const switcher = $('#langSwitcher');
    const trigger = $('#langTrigger');
    const menu = $('#langMenu');

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('open');
      trigger.setAttribute('aria-expanded', switcher.classList.contains('open'));
    });

    menu?.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
        switcher.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      switcher?.classList.remove('open');
      trigger?.setAttribute('aria-expanded', 'false');
    });
  }

  function initHeroCounters() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.done) return;
          entry.target.dataset.done = '1';
          const end = parseFloat(entry.target.dataset.count);
          const startTime = performance.now();
          const update = (now) => {
            const p = Math.min((now - startTime) / 2000, 1);
            entry.target.textContent = (end * (1 - Math.pow(1 - p, 4))).toFixed(end % 1 ? 1 : 0);
            if (p < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        });
      },
      { threshold: 0.5 }
    );
    $$('.hero-stat-value[data-count]').forEach((c) => observer.observe(c));
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.closest('#portfolioGrid')) runPortfolioAnimations();
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  function observeReveals(nodes) {
    nodes.forEach((n) => revealObserver.observe(n));
  }

  function initHeader() {
    window.addEventListener(
      'scroll',
      () => $('#header')?.classList.toggle('scrolled', window.scrollY > 40),
      { passive: true }
    );
  }

  function initMobileMenu() {
    $('#mobileMenuBtn')?.addEventListener('click', () => $('.nav')?.classList.toggle('mobile-open'));
    $$('.nav-links a').forEach((a) => a.addEventListener('click', () => $('.nav')?.classList.remove('mobile-open')));
  }

  function initChartTabs() {
    $('#chartTabs')?.querySelectorAll('.chart-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $('#chartTabs').querySelectorAll('.chart-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        chartPeriod = tab.dataset.period;
        const points = { '1M': 30, '3M': 60, '1Y': 90, ALL: 120 }[chartPeriod] || 30;
        mainChartData = generateChartData(points);
        drawMainChart();
      });
    });
  }

  function initContact() {
    const linkedin = $('#linkedinBtn');
    if (linkedin) linkedin.href = CONFIG.linkedin;
  }

  function onResize() {
    drawMainChart();
    drawDonutChart();
    $('#marketGrid')?.querySelectorAll('canvas[data-spark-id]').forEach((canvas) => {
      const m = marketsData.find((x) => x.id === canvas.dataset.sparkId);
      if (m) drawSparkline(canvas, m.spark, m.up);
    });
  }

  async function init() {
    if (!['en', 'zh', 'ms'].includes(currentLang)) currentLang = 'en';

    initContact();
    const loaderSub = $('.loader-subtitle');
    if (loaderSub) loaderSub.textContent = t('loader.subtitle');
    WQ.Visuals.initLoader(() => i18n[currentLang]);

    await WQ.MarketAPI.fetchAll();
    syncMarkets();

    applyTranslations();
    WQ.Visuals.initGlobe('globeCanvas');
    WQ.Visuals.initTerminal('heroTerminal', () => currentLang);
    WQ.Visuals.initFloatingInsights(() => currentLang);
    WQ.Visuals.initHeatmapTooltip();

    WQ.events.on('markets:updated', (m) => {
      marketsData = m;
      renderMarkets();
      initLiveTicker();
      updateDataPill();
      document.querySelectorAll('.market-card').forEach((c) => c.classList.add('data-pulse'));
      setTimeout(() => document.querySelectorAll('.market-card').forEach((c) => c.classList.remove('data-pulse')), 600);
    });

    updateDataPill();
    initLiveTicker();
    typeAiSummary();
    initHeroCounters();
    observeReveals($$('.reveal'));
    initHeader();
    initMobileMenu();
    initLangSwitcher();
    initChartTabs();
    initAiChat();
    initSystemBar();
    $('#refreshAi')?.addEventListener('click', () => {
      typeAiSummary();
      updateAiTimestamp();
    });

    mainChartData = generateChartData(30);
    requestAnimationFrame(() => {
      drawMainChart();
      drawDonutChart();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 150);
    });

    setInterval(() => WQ.MarketAPI.fetchAll(), CONFIG.DATA_REFRESH_MS || 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
