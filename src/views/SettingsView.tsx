import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Sliders,
  Trash2,
  Check,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react';
import { Locale } from '../utils/i18n';
import { AppSettings } from '../types';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  appSettings: AppSettings;
  setAppSettings: (settings: AppSettings) => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  setTheme,
  locale,
  setLocale,
  appSettings,
  setAppSettings,
  onClearAllData,
}) => {
  const [clearedMessage, setClearedMessage] = useState(false);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset all stored conversation sessions and data?')) {
      onClearAllData();
      setClearedMessage(true);
      setTimeout(() => setClearedMessage(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Application Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Personalize appearance, language preferences, AI response parameters, and manage local storage.
          </p>
        </div>
      </div>

      {/* Appearance & Theme */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
          Display Theme
        </h3>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Interface Language */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          Application Language (Til / Язык)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose default interface language. AI Core will also auto-detect whatever language you speak to it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
          {[
            { code: 'en' as Locale, name: 'English', desc: 'Default' },
            { code: 'uz' as Locale, name: "O'zbek tili", desc: 'Lotin alifbosi' },
            { code: 'ru' as Locale, name: 'Русский', desc: 'Интерфейс' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                locale === lang.code
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                {lang.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Intelligence Preferences */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          AI Core Parameters
        </h3>

        {/* Creativity temperature */}
        <div className="max-w-md space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Response Creativity (Temperature)
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {appSettings.aiTemperature}
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.1"
            value={appSettings.aiTemperature}
            onChange={(e) =>
              setAppSettings({ ...appSettings, aiTemperature: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0.2 (Precise / Math / Coding)</span>
            <span>0.7 (Balanced)</span>
            <span>1.0 (Creative / Brainstorming)</span>
          </div>
        </div>

        {/* Persona Style */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            AI Explanatory Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
            {(
              [
                { id: 'concise', label: 'Concise & Fast', desc: 'Direct answers without fluff' },
                { id: 'balanced', label: 'Balanced Tutor', desc: 'Standard friendly guidance' },
                { id: 'comprehensive', label: 'Deep Professor', desc: 'Thorough derivations & analogies' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setAppSettings({ ...appSettings, aiPersona: p.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  appSettings.aiPersona === p.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {p.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data & Storage Management */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Trash2 className="w-4 h-4" />
          Data & Privacy Management
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
          All your chats, study plans, and preferences are stored strictly inside your browser's private local storage. No data is shared with third parties.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-200 dark:border-rose-900/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All Local Data</span>
          </button>
          {clearedMessage && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              All local storage cleared!
            </span>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>AI Student Toolkit • Version 2.0.0</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <Cpu className="w-3.5 h-3.5 text-emerald-500" />
          <span>Backend Model: gemini-3.8-flash</span>
        </div>
      </div>
    </div>
  );
};
