import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Code2,
  Calculator,
  PenTool,
  CalendarCheck,
  BookOpen,
  Trophy,
  Globe,
  FileSignature,
  Gamepad2,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { translations, Locale } from '../utils/i18n';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  locale: Locale;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  locale,
}) => {
  const t = translations[locale];

  const navItems = [
    {
      id: 'ai-core' as ActiveTab,
      label: t.aiCore,
      icon: Sparkles,
      badge: 'Main',
      badgeColor: 'bg-indigo-500 text-white',
      group: 'Core',
    },
    {
      id: 'homework' as ActiveTab,
      label: t.homework,
      icon: GraduationCap,
      group: 'Academic',
    },
    {
      id: 'code-finder' as ActiveTab,
      label: t.codeFinder,
      icon: Code2,
      group: 'Academic',
    },
    {
      id: 'calculator' as ActiveTab,
      label: t.calculator,
      icon: Calculator,
      group: 'Academic',
    },
    {
      id: 'essay' as ActiveTab,
      label: t.essay,
      icon: PenTool,
      group: 'Academic',
    },
    {
      id: 'planner' as ActiveTab,
      label: t.planner,
      icon: CalendarCheck,
      group: 'Productivity',
    },
    {
      id: 'english' as ActiveTab,
      label: t.english,
      icon: BookOpen,
      group: 'Language',
    },
    {
      id: 'translator' as ActiveTab,
      label: t.translator,
      icon: Globe,
      group: 'Language',
    },
    {
      id: 'football' as ActiveTab,
      label: t.football,
      icon: Trophy,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      group: 'Utility',
    },
    {
      id: 'handwriting' as ActiveTab,
      label: t.handwriting,
      icon: FileSignature,
      group: 'Utility',
    },
    {
      id: 'game-compatibility' as ActiveTab,
      label: t.gameCompatibility,
      icon: Gamepad2,
      group: 'Utility',
    },
    {
      id: 'settings' as ActiveTab,
      label: t.settings,
      icon: Settings,
      group: 'System',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <div
            onClick={() => handleSelect('ai-core')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Student<span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Universal Toolkit
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile, collapse toggle for desktop */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 dark:bg-indigo-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip in collapsed mode */}
                {collapsed && (
                  <div className="fixed left-20 ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Help Card */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-slate-900/60 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Core Connected</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Universal assistant is ready to help across all tools.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
