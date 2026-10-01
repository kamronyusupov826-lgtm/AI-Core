export type ActiveTab =
  | 'ai-core'
  | 'homework'
  | 'code-finder'
  | 'calculator'
  | 'essay'
  | 'planner'
  | 'english'
  | 'football'
  | 'translator'
  | 'handwriting'
  | 'game-compatibility'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'uz' | 'ru';
  aiTemperature: number; // 0.2 to 1.0
  aiPersona: 'concise' | 'balanced' | 'comprehensive';
  defaultStudentLevel: 'elementary' | 'middle' | 'high_school' | 'university';
}

export interface FootballMatch {
  id: string;
  competition: string;
  competitionCode: string;
  round: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  utcDate: string;
  homeTeam: {
    name: string;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo: string;
  };
  venue: string;
  score: {
    home: number | null;
    away: number | null;
  };
}

export interface StudyTask {
  id: string;
  subject: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  day: string;
}

export interface StudyPlan {
  id: string;
  goal: string;
  examDate: string;
  availableHoursPerDay: number;
  totalStudyHours: number;
  tasks: StudyTask[];
  tips: string[];
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}
