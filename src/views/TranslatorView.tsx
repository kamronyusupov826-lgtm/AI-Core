import React, { useState, useEffect } from 'react';
import {
  Globe,
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  Trash2,
  Sparkles,
  History,
  RotateCcw,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { TranslationHistoryItem } from '../types';
import { Locale } from '../utils/i18n';

interface TranslatorViewProps {
  locale: Locale;
}

const STORAGE_KEY = 'student_ai_translation_history_v1';

export const TranslatorView: React.FC<TranslatorViewProps> = ({ locale }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('uz');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'uz', name: 'O‘zbek tili (Uzbek)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'tr', name: 'Türkçe (Turkish)' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'ko', name: '한국어 (Korean)' },
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim() || loading) return;
    setLoading(true);

    const targetLangName = languages.find((l) => l.code === targetLang)?.name || targetLang;
    const sourceLangName =
      sourceLang === 'auto'
        ? 'automatically detect the source language'
        : languages.find((l) => l.code === sourceLang)?.name || sourceLang;

    const prompt = `Translate the following student/academic text accurately into ${targetLangName}:
From language: ${sourceLangName}
Text to translate:
"""
${sourceText}
"""

Instructions:
1. Provide only the most natural, fluent, and precise translation.
2. Maintain technical terms and academic nuance where applicable.
3. Return the exact translation text without unsolicited conversational intro/outro.`;

    try {
      const response = await generateContent(
        prompt,
        'You are a professional academic linguist and translator delivering accurate, natural translations.'
      );
      const cleanResult = response.trim();
      setTranslatedText(cleanResult);

      // Save to history
      const item: TranslationHistoryItem = {
        id: `tr-${Date.now()}`,
        sourceText,
        translatedText: cleanResult,
        fromLang: sourceLang,
        toLang: targetLang,
        timestamp: Date.now(),
      };
      setHistory((prev) => [item, ...prev.slice(0, 19)]);
    } catch (e: any) {
      setTranslatedText(`⚠️ Translation error: ${e?.message || 'Failed to translate'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text: string, langCode: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (langCode === 'en') utterance.lang = 'en-US';
      else if (langCode === 'ru') utterance.lang = 'ru-RU';
      else if (langCode === 'es') utterance.lang = 'es-ES';
      else if (langCode === 'de') utterance.lang = 'de-DE';
      else if (langCode === 'fr') utterance.lang = 'fr-FR';
      else if (langCode === 'tr') utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Academic Multi-Language Translator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Precise translations supporting Uzbek, English, Russian, and 10+ major world languages.
            </p>
          </div>
        </div>
      </div>

      {/* Language Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Source language */}
        <div className="w-full sm:w-60">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full p-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwapLanguages}
          disabled={sourceLang === 'auto'}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          title="Swap languages"
        >
          <ArrowRightLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Target language */}
        <div className="w-full sm:w-60">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            {languages
              .filter((l) => l.code !== 'auto')
              .map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Dual Textboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Text Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste text to translate..."
            rows={8}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">
              {sourceText.length} chars
            </span>

            <div className="flex items-center gap-2">
              {sourceText && (
                <>
                  <button
                    onClick={() => speakText(sourceText, sourceLang)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSourceText('');
                      setTranslatedText('');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Clear text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Translated Text Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="w-full text-sm text-slate-900 dark:text-slate-100 leading-relaxed min-h-[160px] whitespace-pre-wrap">
            {loading ? (
              <div className="flex items-center gap-2 text-indigo-500 text-xs font-semibold py-8">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Translating with AI...</span>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400 text-xs italic">
                Translation will appear here...
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">
              {translatedText ? `${translatedText.length} chars` : ''}
            </span>

            <div className="flex items-center gap-2">
              {translatedText && (
                <>
                  <button
                    onClick={() => speakText(translatedText, targetLang)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Listen translation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Translate Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span>Translate Now</span>
            </>
          )}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-500" />
              Recent Translations
            </span>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto scrollbar-thin">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => {
                  setSourceText(h.sourceText);
                  setTranslatedText(h.translatedText);
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors border border-slate-100 dark:border-slate-700/60"
              >
                <div className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
                  {h.sourceText}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                  → {h.translatedText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
