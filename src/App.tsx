/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, AppSettings } from './types';
import { Locale } from './utils/i18n';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AICoreView } from './views/AICoreView';
import { HomeworkHelperView } from './views/HomeworkHelperView';
import { CodeFinderView } from './views/CodeFinderView';
import { CalculatorView } from './views/CalculatorView';
import { EssayWriterView } from './views/EssayWriterView';
import { StudyPlannerView } from './views/StudyPlannerView';
import { EnglishLearningView } from './views/EnglishLearningView';
import { FootballView } from './views/FootballView';
import { TranslatorView } from './views/TranslatorView';
import { HandwritingView } from './views/HandwritingView';
import { GameCompatibilityView } from './views/GameCompatibilityView';
import { SettingsView } from './views/SettingsView';
import { checkBackendHealth } from './services/api';

const SETTINGS_STORAGE_KEY = 'student_ai_app_settings_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ai-core');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // App settings
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: 'dark',
      language: 'en',
      aiTemperature: 0.7,
      aiPersona: 'balanced',
      defaultStudentLevel: 'high_school',
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(appSettings.theme);
  const [locale, setLocale] = useState<Locale>(appSettings.language);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Tool transfer payload (e.g. sending problem from AI Core to Homework Helper)
  const [toolPrefillData, setToolPrefillData] = useState<{ [key: string]: any }>({});

  // Sync settings
  useEffect(() => {
    const updated = { ...appSettings, theme, language: locale };
    setAppSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, [theme, locale]);

  // Handle dark mode DOM class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Health check
  useEffect(() => {
    checkBackendHealth().then((health) => {
      setIsBackendConnected(health.status === 'ok');
    });
  }, []);

  const handleNavigateToTool = (tab: ActiveTab, prefill?: any) => {
    if (prefill) {
      setToolPrefillData((prev) => ({ ...prev, [tab]: prefill }));
    }
    setActiveTab(tab);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        locale={locale}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
          theme={theme}
          setTheme={setTheme}
          locale={locale}
          setLocale={setLocale}
          isBackendConnected={isBackendConnected}
        />

        {/* Dynamic View Mount */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          {activeTab === 'ai-core' && (
            <AICoreView onNavigateToTool={handleNavigateToTool} locale={locale} />
          )}

          {activeTab === 'homework' && (
            <HomeworkHelperView
              initialProblem={toolPrefillData['homework'] || ''}
              locale={locale}
            />
          )}

          {activeTab === 'code-finder' && (
            <CodeFinderView
              initialCode={toolPrefillData['code-finder'] || ''}
              locale={locale}
            />
          )}

          {activeTab === 'calculator' && <CalculatorView locale={locale} />}

          {activeTab === 'essay' && (
            <EssayWriterView
              initialTopic={toolPrefillData['essay'] || ''}
              locale={locale}
            />
          )}

          {activeTab === 'planner' && <StudyPlannerView locale={locale} />}

          {activeTab === 'english' && <EnglishLearningView locale={locale} />}

          {activeTab === 'football' && <FootballView locale={locale} />}

          {activeTab === 'translator' && <TranslatorView locale={locale} />}

          {activeTab === 'handwriting' && <HandwritingView locale={locale} />}

          {activeTab === 'game-compatibility' && (
            <GameCompatibilityView locale={locale} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              theme={theme}
              setTheme={setTheme}
              locale={locale}
              setLocale={setLocale}
              appSettings={appSettings}
              setAppSettings={setAppSettings}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
