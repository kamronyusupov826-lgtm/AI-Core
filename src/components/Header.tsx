import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { translations, Locale } from '../utils/i18n';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setMobileOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  setMobileOpen,
  theme,
  setTheme,
  locale,
  setLocale,
  isBackendConnected,
}) => {
  const t = translations[locale];

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'ai-core':
        return { title: t.aiCore, subtitle: 'Universal Conversational Assistant' };
      case 'homework':
        return { title: t.homework, subtitle: 'Step-by-step problem solver for STEM & Humanities' };
      case 'code-finder':
        return { title: t.codeFinder, subtitle: 'Instant bug detection, cause explanation & corrected code' };
      case 'calculator':
        return { title: t.calculator, subtitle: 'Scientific calculations, equations & fractions' };
      case 'essay':
        return { title: t.essay, subtitle: 'Essays, paragraphs, introductions & structured school writing' };
      case 'planner':
        return { title: t.planner, subtitle: 'Organized study schedule with daily goals & progress tracking' };
      case 'english':
        return { title: t.english, subtitle: 'Grammar, vocabulary, reading, writing & AI conversational practice' };
      case 'football':
        return { title: t.football, subtitle: 'Live scores, upcoming fixtures & kickoff times in your local time' };
      case 'translator':
        return { title: t.translator, subtitle: 'Multi-language translator with audio speech & history' };
      case 'handwriting':
        return { title: t.handwriting, subtitle: 'Transform typed text into authentic handwritten notebook notes' };
      case 'game-compatibility':
        return { title: t.gameCompatibility, subtitle: 'PC hardware compatibility, FPS estimate & graphics settings' };
      case 'settings':
        return { title: t.settings, subtitle: 'Personalize themes, AI preferences & application data' };
      default:
        return { title: t.appTitle, subtitle: '' };
    }
  };

  const currentInfo = getTabTitle(activeTab);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {currentInfo.title}
            </h1>
            {activeTab !== 'ai-core' && (
              <button
                onClick={() => setActiveTab('ai-core')}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-200/50 dark:border-indigo-800/40"
              >
                <Sparkles className="w-3 h-3" />
                <span>Ask AI Core</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend / Gemini Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {isBackendConnected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gemini AI Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Connecting...</span>
            </>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="uz">O'zbekcha (UZ)</option>
            <option value="ru">Русский (RU)</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};
