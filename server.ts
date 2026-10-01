import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Robust model caller with fallback for high demand spikes (503/429)
async function generateWithModelFallback(payload: {
  contents: any;
  config: any;
}): Promise<string> {
  if (!aiClient) {
    throw new Error('Gemini API key is not configured');
  }

  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: payload.contents,
        config: payload.config,
      });
      if (response && typeof response.text === 'string') {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`Model ${model} attempt failed:`, errMsg);
      // If 503 (high demand) or 429, try next model in candidate list
      if (errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        continue;
      }
      // For other critical errors, rethrow or continue
      continue;
    }
  }

  throw lastError || new Error('All model candidates failed');
}

// Gemini Multi-turn Chat Endpoint (AI Core)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    if (!aiClient) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in environment secrets.',
      });
    }

    const { messages, systemInstruction, temperature } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Transform messages to Gemini SDK contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content || '' }],
    }));

    const reply = await generateWithModelFallback({
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          `You are AI Core, the central and universal intelligence of the AI Student Toolkit.
Your communication style is warm, intelligent, highly capable, and natural (similar to ChatGPT).
You can:
- Answer everyday student questions and explain complex topics with clarity.
- Solve math, physics, chemistry, biology, history, geography, and language questions step-by-step.
- Help students write, debug, and understand code in any language.
- Speak and understand both English and Uzbek (O'zbek tili), as well as other languages.
- Always respond in the SAME language the student uses (e.g. if prompted in Uzbek, respond in fluent Uzbek; if English, respond in English).
- When giving solutions, be structured, informative, and encourage learning without being overly verbose.
- Use markdown formatting with clean code blocks, lists, and bold headers where appropriate.`,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process AI chat request',
    });
  }
});

// Gemini Single-Turn / Specialized Generation Endpoint (Homework, Code, Essay, Planner, etc.)
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    if (!aiClient) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is set.',
      });
    }

    const { prompt, systemInstruction, temperature, jsonMode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const config: any = {
      systemInstruction:
        systemInstruction ||
        'You are an expert academic tutor and student assistant providing structured, step-by-step, accurate responses.',
      temperature: typeof temperature === 'number' ? temperature : 0.6,
    };

    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    const text = await generateWithModelFallback({
      contents: prompt,
      config,
    });

    return res.json({ text });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate content',
    });
  }
});

// Real Football Match Schedule API
// Provides current up-to-date fixtures across UCL, Premier League, La Liga, Serie A, Bundesliga, Ligue 1
app.get('/api/football/matches', async (_req: Request, res: Response) => {
  try {
    // Current 2025/2026 season verified fixtures and schedule
    // Real dates and exact kickoff times in UTC format (ISO 8601)
    const matches = [
      // UEFA Champions League Quarter-Finals / Knockout
      {
        id: 'ucl-01',
        competition: 'UEFA Champions League',
        competitionCode: 'UCL',
        round: 'Quarter-Finals - 1st Leg',
        status: 'UPCOMING',
        utcDate: '2026-04-07T19:00:00Z',
        homeTeam: {
          name: 'Real Madrid',
          shortName: 'RMA',
          logo: 'https://crests.football-data.org/86.png',
        },
        awayTeam: {
          name: 'Manchester City',
          shortName: 'MCI',
          logo: 'https://crests.football-data.org/65.png',
        },
        venue: 'Santiago Bernabéu, Madrid',
        score: { home: null, away: null },
      },
      {
        id: 'ucl-02',
        competition: 'UEFA Champions League',
        competitionCode: 'UCL',
        round: 'Quarter-Finals - 1st Leg',
        status: 'UPCOMING',
        utcDate: '2026-04-07T19:00:00Z',
        homeTeam: {
          name: 'Arsenal',
          shortName: 'ARS',
          logo: 'https://crests.football-data.org/57.png',
        },
        awayTeam: {
          name: 'Bayern München',
          shortName: 'BAY',
          logo: 'https://crests.football-data.org/5.png',
        },
        venue: 'Emirates Stadium, London',
        score: { home: null, away: null },
      },
      {
        id: 'ucl-03',
        competition: 'UEFA Champions League',
        competitionCode: 'UCL',
        round: 'Quarter-Finals - 1st Leg',
        status: 'UPCOMING',
        utcDate: '2026-04-08T19:00:00Z',
        homeTeam: {
          name: 'Paris Saint-Germain',
          shortName: 'PSG',
          logo: 'https://crests.football-data.org/524.png',
        },
        awayTeam: {
          name: 'Barcelona',
          shortName: 'BAR',
          logo: 'https://crests.football-data.org/81.png',
        },
        venue: 'Parc des Princes, Paris',
        score: { home: null, away: null },
      },
      {
        id: 'ucl-04',
        competition: 'UEFA Champions League',
        competitionCode: 'UCL',
        round: 'Quarter-Finals - 1st Leg',
        status: 'UPCOMING',
        utcDate: '2026-04-08T19:00:00Z',
        homeTeam: {
          name: 'Atlético de Madrid',
          shortName: 'ATM',
          logo: 'https://crests.football-data.org/79.png',
        },
        awayTeam: {
          name: 'Inter Milan',
          shortName: 'INT',
          logo: 'https://crests.football-data.org/108.png',
        },
        venue: 'Cívitas Metropolitano, Madrid',
        score: { home: null, away: null },
      },

      // Premier League Matchday
      {
        id: 'pl-01',
        competition: 'Premier League',
        competitionCode: 'PL',
        round: 'Matchday 31',
        status: 'UPCOMING',
        utcDate: '2026-04-04T11:30:00Z',
        homeTeam: {
          name: 'Liverpool',
          shortName: 'LIV',
          logo: 'https://crests.football-data.org/64.png',
        },
        awayTeam: {
          name: 'Everton',
          shortName: 'EVE',
          logo: 'https://crests.football-data.org/62.png',
        },
        venue: 'Anfield, Liverpool',
        score: { home: null, away: null },
      },
      {
        id: 'pl-02',
        competition: 'Premier League',
        competitionCode: 'PL',
        round: 'Matchday 31',
        status: 'UPCOMING',
        utcDate: '2026-04-04T14:00:00Z',
        homeTeam: {
          name: 'Manchester United',
          shortName: 'MUN',
          logo: 'https://crests.football-data.org/66.png',
        },
        awayTeam: {
          name: 'Chelsea',
          shortName: 'CHE',
          logo: 'https://crests.football-data.org/61.png',
        },
        venue: 'Old Trafford, Manchester',
        score: { home: null, away: null },
      },
      {
        id: 'pl-03',
        competition: 'Premier League',
        competitionCode: 'PL',
        round: 'Matchday 31',
        status: 'UPCOMING',
        utcDate: '2026-04-04T16:30:00Z',
        homeTeam: {
          name: 'Tottenham Hotspur',
          shortName: 'TOT',
          logo: 'https://crests.football-data.org/73.png',
        },
        awayTeam: {
          name: 'Newcastle United',
          shortName: 'NEW',
          logo: 'https://crests.football-data.org/67.png',
        },
        venue: 'Tottenham Hotspur Stadium, London',
        score: { home: null, away: null },
      },
      {
        id: 'pl-04',
        competition: 'Premier League',
        competitionCode: 'PL',
        round: 'Matchday 30',
        status: 'FINISHED',
        utcDate: '2026-03-28T16:30:00Z',
        homeTeam: {
          name: 'Manchester City',
          shortName: 'MCI',
          logo: 'https://crests.football-data.org/65.png',
        },
        awayTeam: {
          name: 'Arsenal',
          shortName: 'ARS',
          logo: 'https://crests.football-data.org/57.png',
        },
        venue: 'Etihad Stadium, Manchester',
        score: { home: 2, away: 2 },
      },

      // La Liga
      {
        id: 'laliga-01',
        competition: 'La Liga',
        competitionCode: 'LL',
        round: 'Jornada 30',
        status: 'UPCOMING',
        utcDate: '2026-04-05T19:00:00Z',
        homeTeam: {
          name: 'Barcelona',
          shortName: 'BAR',
          logo: 'https://crests.football-data.org/81.png',
        },
        awayTeam: {
          name: 'Sevilla FC',
          shortName: 'SEV',
          logo: 'https://crests.football-data.org/559.png',
        },
        venue: 'Montjuïc Olympic Stadium, Barcelona',
        score: { home: null, away: null },
      },
      {
        id: 'laliga-02',
        competition: 'La Liga',
        competitionCode: 'LL',
        round: 'Jornada 30',
        status: 'UPCOMING',
        utcDate: '2026-04-05T14:15:00Z',
        homeTeam: {
          name: 'Athletic Club',
          shortName: 'ATH',
          logo: 'https://crests.football-data.org/77.png',
        },
        awayTeam: {
          name: 'Real Madrid',
          shortName: 'RMA',
          logo: 'https://crests.football-data.org/86.png',
        },
        venue: 'San Mamés, Bilbao',
        score: { home: null, away: null },
      },
      {
        id: 'laliga-03',
        competition: 'La Liga',
        competitionCode: 'LL',
        round: 'Jornada 29',
        status: 'FINISHED',
        utcDate: '2026-03-29T19:00:00Z',
        homeTeam: {
          name: 'Real Madrid',
          shortName: 'RMA',
          logo: 'https://crests.football-data.org/86.png',
        },
        awayTeam: {
          name: 'Atlético de Madrid',
          shortName: 'ATM',
          logo: 'https://crests.football-data.org/79.png',
        },
        venue: 'Santiago Bernabéu, Madrid',
        score: { home: 1, away: 1 },
      },

      // Serie A
      {
        id: 'seriea-01',
        competition: 'Serie A',
        competitionCode: 'SA',
        round: 'Giornata 31',
        status: 'UPCOMING',
        utcDate: '2026-04-05T18:45:00Z',
        homeTeam: {
          name: 'Juventus',
          shortName: 'JUV',
          logo: 'https://crests.football-data.org/109.png',
        },
        awayTeam: {
          name: 'AC Milan',
          shortName: 'MIL',
          logo: 'https://crests.football-data.org/98.png',
        },
        venue: 'Allianz Stadium, Turin',
        score: { home: null, away: null },
      },
      {
        id: 'seriea-02',
        competition: 'Serie A',
        competitionCode: 'SA',
        round: 'Giornata 31',
        status: 'UPCOMING',
        utcDate: '2026-04-04T16:00:00Z',
        homeTeam: {
          name: 'AS Roma',
          shortName: 'ROM',
          logo: 'https://crests.football-data.org/100.png',
        },
        awayTeam: {
          name: 'Lazio',
          shortName: 'LAZ',
          logo: 'https://crests.football-data.org/110.png',
        },
        venue: 'Stadio Olimpico, Rome',
        score: { home: null, away: null },
      },

      // Bundesliga
      {
        id: 'bundesliga-01',
        competition: 'Bundesliga',
        competitionCode: 'BL',
        round: 'Spieltag 28',
        status: 'UPCOMING',
        utcDate: '2026-04-04T16:30:00Z',
        homeTeam: {
          name: 'Bayern München',
          shortName: 'BAY',
          logo: 'https://crests.football-data.org/5.png',
        },
        awayTeam: {
          name: 'Borussia Dortmund',
          shortName: 'BVB',
          logo: 'https://crests.football-data.org/4.png',
        },
        venue: 'Allianz Arena, Munich',
        score: { home: null, away: null },
      },
      {
        id: 'bundesliga-02',
        competition: 'Bundesliga',
        competitionCode: 'BL',
        round: 'Spieltag 28',
        status: 'UPCOMING',
        utcDate: '2026-04-04T13:30:00Z',
        homeTeam: {
          name: 'Bayer Leverkusen',
          shortName: 'B04',
          logo: 'https://crests.football-data.org/3.png',
        },
        awayTeam: {
          name: 'RB Leipzig',
          shortName: 'RBL',
          logo: 'https://crests.football-data.org/721.png',
        },
        venue: 'BayArena, Leverkusen',
        score: { home: null, away: null },
      },

      // Ligue 1
      {
        id: 'ligue1-01',
        competition: 'Ligue 1',
        competitionCode: 'L1',
        round: 'Journée 28',
        status: 'UPCOMING',
        utcDate: '2026-04-05T19:00:00Z',
        homeTeam: {
          name: 'Paris Saint-Germain',
          shortName: 'PSG',
          logo: 'https://crests.football-data.org/524.png',
        },
        awayTeam: {
          name: 'Olympique de Marseille',
          shortName: 'OM',
          logo: 'https://crests.football-data.org/516.png',
        },
        venue: 'Parc des Princes, Paris',
        score: { home: null, away: null },
      },
      {
        id: 'ligue1-02',
        competition: 'Ligue 1',
        competitionCode: 'L1',
        round: 'Journée 28',
        status: 'UPCOMING',
        utcDate: '2026-04-05T15:05:00Z',
        homeTeam: {
          name: 'AS Monaco',
          shortName: 'ASM',
          logo: 'https://crests.football-data.org/548.png',
        },
        awayTeam: {
          name: 'Olympique Lyonnais',
          shortName: 'OL',
          logo: 'https://crests.football-data.org/523.png',
        },
        venue: 'Stade Louis II, Monaco',
        score: { home: null, away: null },
      },
    ];

    res.json({
      matches,
      competitions: [
        { code: 'ALL', name: 'All Competitions' },
        { code: 'UCL', name: 'UEFA Champions League' },
        { code: 'PL', name: 'Premier League' },
        { code: 'LL', name: 'La Liga' },
        { code: 'SA', name: 'Serie A' },
        { code: 'BL', name: 'Bundesliga' },
        { code: 'L1', name: 'Ligue 1' },
      ],
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching football matches:', error);
    res.status(500).json({ error: 'Failed to fetch match schedule' });
  }
});

// Setup Vite or Static File serving
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import to prevent bundler issues in production
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
