import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/fortune', async (req, res) => {
    try {
      const customKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey.trim() : '';
      const apiKey = customKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Safe fallback if no key exists anywhere
        const fallbackFortunes = [
          {
            type: "☕ 咖啡續命吉",
            colorClass: "bg-amber-100 text-amber-950 border-purple-900",
            title: "今天的第二杯咖啡會帶來好運與額外靈感！",
            explain: "宇宙能量提示：適度休息與補充水分，靈感會在你不經意放空時降臨。",
            dos: "喝燕麥拿鐵、發呆5分鐘",
            donts: "過度糾結、無止盡加班",
            luckyColor: "燕麥奶黃",
            luckyNum: "7",
            scores: { energy: 88, creativity: 92, chill: 85 }
          },
          {
            type: "🛋️ 貓咪躺平吉",
            colorClass: "bg-purple-100 text-purple-950 border-purple-900",
            title: "今天適合優雅地放慢腳步，允許自己打個小盹！",
            explain: "充飽電的電池才能走得更遠，對自己溫柔一點是今天的最高指導原則。",
            dos: "抱緊抱枕、聽輕音樂",
            donts: "強迫症發作、焦慮比較",
            luckyColor: "薄荷淡紫",
            luckyNum: "3",
            scores: { energy: 70, creativity: 85, chill: 98 }
          },
          {
            type: "🍕 美食療癒大吉",
            colorClass: "bg-rose-100 text-rose-950 border-purple-900",
            title: "今晚就吃最想吃的那道美食，熱量全歸宇宙承擔！",
            explain: "美食是撫平心靈皺褶的最快途徑，吃飽了才有力氣拯救世界。",
            dos: "大口享受美食、犒賞自己",
            donts: "計算卡路里、猶豫不決",
            luckyColor: "暖橘紅",
            luckyNum: "8",
            scores: { energy: 95, creativity: 80, chill: 90 }
          }
        ];
        const randomFallback = fallbackFortunes[Math.floor(Math.random() * fallbackFortunes.length)];
        return res.json(randomFallback);
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `你是一個充滿童心、幽默可愛的現代靈感扭蛋機 AI。請根據即時時間與隨機氣場，為使用者生成一顆獨一無二的「現代日常靈感運勢膠囊」。
嚴禁出現任何傳統宮廟、宗教、神佛或嚴肅詞彙。風格必須是輕快、馬卡龍、幽默療癒、貼近現代都市人生活（如咖啡、躺平、追劇、美食、放放松等）。
請即時進行靈感運算，生成今天的專屬靈感膠囊！生成時間戳記：${Date.now()}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: '例如：☕ 咖啡續命吉, 🛋️ 貓咪躺平吉' },
              colorClass: { type: Type.STRING, description: 'Tailwind 背景與邊框樣式，例如：bg-amber-100 text-amber-950 border-purple-900' },
              title: { type: Type.STRING, description: '幽默原創的運勢靈感語錄 headline' },
              explain: { type: Type.STRING, description: '即時說明的療癒解析' },
              dos: { type: Type.STRING, description: '宜事項 2 項，用頓號分隔' },
              donts: { type: Type.STRING, description: '忌事項 2 項，用頓號分隔' },
              luckyColor: { type: Type.STRING, description: '幸運色' },
              luckyNum: { type: Type.STRING, description: '幸運數字' },
              scores: {
                type: Type.OBJECT,
                properties: {
                  energy: { type: Type.INTEGER },
                  creativity: { type: Type.INTEGER },
                  chill: { type: Type.INTEGER },
                },
                required: ['energy', 'creativity', 'chill'],
              },
            },
            required: ['type', 'colorClass', 'title', 'explain', 'dos', 'donts', 'luckyColor', 'luckyNum', 'scores'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const fortuneData = JSON.parse(text);
      res.json(fortuneData);
    } catch (err) {
      console.error('Error generating fortune:', err);
      // Fallback on error
      res.json({
        type: "✨ 靈感電波大爆發",
        colorClass: "bg-teal-100 text-teal-950 border-purple-900",
        title: "跳出框架思考，今天你會發現意想不到的新樂趣！",
        explain: "靈感就像流星，捕捉到的那一刻就能綻放光芒。相信自己的第一直覺！",
        dos: "嘗試新路線、記錄新想法",
        donts: "自我懷疑、裹足不前",
        luckyColor: "翡翠薄荷綠",
        luckyNum: "6",
        scores: { energy: 90, creativity: 96, chill: 88 }
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
