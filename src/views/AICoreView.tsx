import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Edit2,
  Trash2,
  Plus,
  Compass,
  Wand2,
  BookOpen,
  Code2,
  Calculator,
  PenTool,
  ArrowRight,
  MessageSquare,
  History,
  X,
} from 'lucide-react';
import { ChatMessage, ChatSession, ActiveTab } from '../types';
import { sendChatMessage } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface AICoreViewProps {
  onNavigateToTool: (tab: ActiveTab, prefillData?: any) => void;
  locale: Locale;
}

const STORAGE_KEY = 'student_ai_core_sessions_v1';
const ACTIVE_SESSION_KEY = 'student_ai_core_active_id_v1';

export const AICoreView: React.FC<AICoreViewProps> = ({ onNavigateToTool, locale }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }
    const initialSession: ChatSession = {
      id: 'session-default',
      title: locale === 'uz' ? 'Yangi Suhbat' : 'General Assistance',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedId) return savedId;
    } catch {}
    return 'session-default';
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [promptTopic, setPromptTopic] = useState('');
  const [promptTarget, setPromptTarget] = useState<'study' | 'essay' | 'code' | 'general'>('study');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active session helper
  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
      id: 'session-default',
      title: 'General Assistance',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    } catch (e) {
      console.error('Failed to persist chat sessions:', e);
    }
  }, [sessions, activeSessionId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages, isLoading]);

  // Handle auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: locale === 'uz' ? 'Yangi suhbat' : 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setInput('');
    setShowHistoryModal(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const fresh: ChatSession = {
        id: `session-${Date.now()}`,
        title: locale === 'uz' ? 'Yangi suhbat' : 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  const handleClearCurrentChat = () => {
    if (window.confirm('Clear all messages in this conversation?')) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s))
      );
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentSession.messages, userMessage];

    // Auto update title from first message if title is default
    let updatedTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      updatedTitle = messageText.slice(0, 32) + (messageText.length > 32 ? '...' : '');
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      // Build context history for multi-turn conversation
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const replyText = await sendChatMessage(historyPayload);

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...updatedMessages, aiMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ **Connection Error:** ${
          error?.message || 'Could not reach Gemini AI. Please check your network and secret configuration.'
        }`,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...updatedMessages, errorMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (isLoading || currentSession.messages.length === 0) return;

    // Remove last assistant message if present
    const messages = [...currentSession.messages];
    if (messages[messages.length - 1].role === 'assistant') {
      messages.pop();
    }

    if (messages.length === 0) return;

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages, updatedAt: Date.now() } : s))
    );

    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const replyText = await sendChatMessage(historyPayload);

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...messages, aiMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (error: any) {
      console.error('Regenerate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editContent.trim()) return;

    // Find the message index
    const msgIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (msgIdx === -1) return;

    // Truncate messages after this edited message
    const trimmed = currentSession.messages.slice(0, msgIdx);
    const updatedUserMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: editContent.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...trimmed, updatedUserMsg];

    setEditingMessageId(null);
    setEditContent('');

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: newMessages, updatedAt: Date.now() } : s))
    );

    setIsLoading(true);

    try {
      const replyText = await sendChatMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content }))
      );

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...newMessages, aiMessage], updatedAt: Date.now() }
            : s
        )
      );
    } catch (error: any) {
      console.error('Edit submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGeneratePrompt = async () => {
    if (!promptTopic.trim() || isGeneratingPrompt) return;
    setIsGeneratingPrompt(true);

    try {
      const promptInstruction = `You are a prompt engineering expert for students. Generate a powerful, structured, ready-to-use prompt for a student working on the following topic: "${promptTopic}". Target category: ${promptTarget}. Make the prompt clear, multi-faceted, and engaging. Return ONLY the finalized prompt text without filler.`;
      const generated = await sendChatMessage([
        { role: 'user', content: promptInstruction },
      ]);
      setInput(generated.trim());
      setShowPromptGenerator(false);
      setPromptTopic('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Quick Action Starter Prompts
  const quickActions = [
    {
      title: locale === 'uz' ? 'Matematika Masalasi' : 'Math Problem Solver',
      desc: locale === 'uz' ? 'Kvadrat tenglamani bosqichma-bosqich yechish' : 'Solve a quadratic equation step by step',
      prompt: locale === 'uz' 
        ? 'Quyidagi kvadrat tenglamani bosqichma-bosqich yechib bering: 2x² - 5x + 2 = 0. Har bir qadamni batafsil tushuntiring.'
        : 'Please solve this quadratic equation step-by-step: 2x² - 5x + 2 = 0. Show all steps and the quadratic formula.',
      icon: Calculator,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      title: locale === 'uz' ? 'Fizika Tushuntirishi' : 'Explain Physics Concept',
      desc: locale === 'uz' ? 'Kvant chalkashligini oddiy tilda tushuntir' : 'Explain Quantum Entanglement simply with analogies',
      prompt: locale === 'uz'
        ? 'Kvant chalkashligi (Quantum Entanglement) hodisasini o\'rta maktab o\'quvchisiga tushunarli bo\'lgan oddiy misollar orqali tushuntirib bering.'
        : 'Explain the concept of Quantum Entanglement using simple real-world analogies suitable for a high school student.',
      icon: BookOpen,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      title: locale === 'uz' ? 'Dasturlash / Kod Yordami' : 'Python Bug & Logic Fix',
      desc: locale === 'uz' ? 'Python ro\'yxatlarini tartiblash algoritmi' : 'Debug and optimize a binary search algorithm',
      prompt: locale === 'uz'
        ? 'Python tilida Binary Search (ikkilik qidiruv) algoritmini yozib, har bir satr qanday ishlashini izohlab bering.'
        : 'Write an optimized binary search implementation in Python with detailed comments explaining the time complexity.',
      icon: Code2,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      title: locale === 'uz' ? 'Insho Rejasi va Kirish' : 'Essay Hook & Outline',
      desc: locale === 'uz' ? 'Sun\'iy intellektning ta\'limdagi roli mavzusida' : 'Hook and thesis for AI in education essay',
      prompt: locale === 'uz'
        ? '"Sun\'iy intellektning zamonaviy ta\'lim tizimidagi roli" mavzusida 5 qismli akademik insho rejasi va kuchli kirish qismini tuzib bering.'
        : 'Create a compelling thesis statement, hook, and 5-paragraph outline for an academic essay on "The Impact of Artificial Intelligence on Modern Education".',
      icon: PenTool,
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sessions Left Drawer / History (Desktop & Modal) */}
      <div
        className={`hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs p-3 shrink-0`}
      >
        <button
          onClick={handleCreateNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'uz' ? 'Yangi Suhbat' : 'New Chat'}</span>
        </button>

        <div className="mt-4 flex items-center justify-between px-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            {locale === 'uz' ? 'Tarix' : 'Chat History'}
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
            {sessions.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto mt-2 space-y-1 scrollbar-thin">
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-1">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{sess.title || 'Untitled Session'}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity rounded"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Chat Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="View History"
            >
              <History className="w-4 h-4" />
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
              {currentSession.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptGenerator(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200/50 dark:border-indigo-800/40"
              title="Generate a high-impact prompt"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prompt Generator</span>
            </button>

            {currentSession.messages.length > 0 && (
              <button
                onClick={handleClearCurrentChat}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 scrollbar-thin">
          {currentSession.messages.length === 0 ? (
            /* Welcome / Empty Screen */
            <div className="max-w-3xl mx-auto py-8 sm:py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI Core
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
                {locale === 'uz'
                  ? "Universal talabalar yordamchisi. Istalgan fandan savol bering, murakkab masalalarni yeching, kod yozing yoki insho loyihalashtiring."
                  : 'Your universal student intelligence. Ask anything, solve homework, debug code, brainstorm essays, and explain difficult topics simply.'}
              </p>

              {/* Quick Action Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-8 text-left">
                {quickActions.map((qa, i) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(qa.prompt)}
                      className={`p-4 rounded-2xl border transition-all text-left bg-gradient-to-br hover:shadow-md hover:-translate-y-0.5 group ${qa.color} bg-white dark:bg-slate-900`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {qa.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {qa.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Connect to Specialized Tools Banner */}
              <div className="w-full mt-8 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Need a dedicated specialized environment?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jump into Homework Helper, Code Finder, Calculator, or Essay Writer.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigateToTool('homework')}
                    className="flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Homework
                  </button>
                  <button
                    onClick={() => onNavigateToTool('code-finder')}
                    className="flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Code Finder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Render Messages */
            <div className="max-w-3xl mx-auto space-y-6">
              {currentSession.messages.map((message) => {
                const isUser = message.role === 'user';
                const isEditing = editingMessageId === message.id;

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col group ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {isUser ? 'You' : 'AI Core'}
                      </span>
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`relative max-w-full sm:max-w-2xl rounded-2xl p-4 sm:p-5 shadow-xs ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2 min-w-[280px] sm:min-w-[400px]">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-indigo-400 focus:outline-hidden resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditContent('');
                              }}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(message.id)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white"
                            >
                              Save & Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            <MarkdownView content={message.content} />
                          )}
                        </>
                      )}

                      {/* Action buttons on message hover */}
                      {!isEditing && (
                        <div
                          className={`mt-2 pt-2 flex items-center gap-1.5 border-t ${
                            isUser
                              ? 'border-indigo-500/40 text-indigo-100'
                              : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Copy message"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isUser && (
                            <button
                              onClick={() => {
                                setEditingMessageId(message.id);
                                setEditContent(message.content);
                              }}
                              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                              title="Edit question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick tool redirection from AI answer */}
                          {!isUser && (
                            <div className="flex items-center gap-1 ml-auto text-[11px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] text-slate-400 mr-1">Send to:</span>
                              <button
                                onClick={() => onNavigateToTool('homework', message.content)}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                title="Open in Homework Helper"
                              >
                                Homework
                              </button>
                              <button
                                onClick={() => onNavigateToTool('code-finder', message.content)}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                title="Open in Code Error Finder"
                              >
                                Code
                              </button>
                              <button
                                onClick={() => onNavigateToTool('essay', message.content)}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                title="Open in Essay Writer"
                              >
                                Essay
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing / Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                      AI Core is thinking...
                    </span>
                  </div>
                </div>
              )}

              {/* Regenerate Button if not loading */}
              {!isLoading && currentSession.messages.length > 0 && currentSession.messages[currentSession.messages.length - 1].role === 'assistant' && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleRegenerateResponse}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate response</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-2 border border-slate-200 dark:border-slate-700/80 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  locale === 'uz'
                    ? "AI Corega savol bering (O'zbekcha yoki inglizcha)..."
                    : 'Ask AI Core anything in English, Uzbek, or any language (Shift+Enter for newline)...'
                }
                rows={1}
                className="flex-1 bg-transparent p-2 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden resize-none max-h-44 min-h-[44px]"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-xl font-medium transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Powered by Gemini AI Core</span>
              </span>
              <span className="hidden sm:inline">
                Enter to send • Shift + Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chat History Drawer / Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs md:hidden">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Conversations
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleCreateNewChat}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            <div className="flex-1 overflow-y-auto mt-3 space-y-1.5">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => {
                    setActiveSessionId(sess.id);
                    setShowHistoryModal(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                    sess.id === activeSessionId
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate flex-1">{sess.title}</span>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prompt Generator Modal */}
      {showPromptGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  AI Prompt Generator
                </h3>
              </div>
              <button
                onClick={() => setShowPromptGenerator(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform a vague idea or homework topic into a comprehensive, highly effective prompt for AI Core.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic or Question Idea
              </label>
              <input
                type="text"
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
                placeholder="e.g., Photosynthesis vs Cellular Respiration, React Hooks tutorial..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Category
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { id: 'study', label: 'Study & Exam Prep' },
                    { id: 'essay', label: 'Essay & Writing' },
                    { id: 'code', label: 'Coding & Debugging' },
                    { id: 'general', label: 'Deep Explanation' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPromptTarget(cat.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-colors ${
                      promptTarget === cat.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPromptGenerator(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePrompt}
                disabled={!promptTopic.trim() || isGeneratingPrompt}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Crafting prompt...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate & Insert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
