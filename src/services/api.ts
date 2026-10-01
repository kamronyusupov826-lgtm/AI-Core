import { FootballMatch } from '../types';

export interface ChatRequestMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  messages: ChatRequestMessage[],
  systemInstruction?: string,
  temperature?: number
): Promise<string> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemInstruction, temperature }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  const data = await response.json();
  return data.reply;
}

export async function generateContent(
  prompt: string,
  systemInstruction?: string,
  temperature?: number,
  jsonMode?: boolean
): Promise<string> {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction, temperature, jsonMode }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Generation error (${response.status})`);
  }

  const data = await response.json();
  return data.text;
}

export async function fetchFootballMatches(): Promise<{
  matches: FootballMatch[];
  competitions: { code: string; name: string }[];
  fetchedAt: string;
}> {
  const response = await fetch('/api/football/matches');
  if (!response.ok) {
    throw new Error(`Failed to load matches (${response.status})`);
  }
  return response.json();
}

export async function checkBackendHealth(): Promise<{
  status: string;
  hasGeminiKey: boolean;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'error', hasGeminiKey: false };
    return await res.json();
  } catch {
    return { status: 'offline', hasGeminiKey: false };
  }
}
