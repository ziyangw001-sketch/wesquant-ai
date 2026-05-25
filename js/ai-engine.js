/**
 * WesQuant AI — AI Engine (OpenRouter via backend proxy)
 */
window.WesQuant = window.WesQuant || {};

(function (WQ) {
  'use strict';

  const THINKING = {
    en: [
      'Thinking...',
      'Generating market insight...',
      'Analyzing global macro data...',
      'Running neural sentiment model...',
      'Scanning cross-asset signals...',
    ],
    zh: ['思考中...', '正在生成市场洞察...', '分析全球宏观数据...', '运行神经情绪模型...', '扫描跨资产信号...'],
    ms: ['Berfikir...', 'Menjana wawasan...', 'Menganalisis data makro...', 'Model neural aktif...'],
  };

  function pickThinking(lang) {
    const arr = THINKING[lang] || THINKING.en;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async function chat(userMessage, lang, history = []) {
    const base = WQ.config.API_BASE || '';
    const payload = {
      message: userMessage,
      lang,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    };

    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Chat API ' + res.status);
      const data = await res.json();
      return {
        text: data.reply || '',
        source: data.source || 'api',
        model: data.model,
      };
    } catch (err) {
      console.warn('[WesQuant AI]', err.message);
      await new Promise((r) => setTimeout(r, 600));
      return {
        text: 'Connection issue. Start the backend with `npm start` in /backend and add keys to .env.',
        source: 'error',
      };
    }
  }

  WQ.AIEngine = { chat, pickThinking };
})(window.WesQuant);
