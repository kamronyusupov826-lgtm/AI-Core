import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  MessageCircle,
  FileCheck,
  CheckCircle,
  Volume2,
  RefreshCw,
  Send,
  HelpCircle,
  Check,
  Copy,
} from 'lucide-react';
import { generateContent, sendChatMessage } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface EnglishLearningViewProps {
  locale: Locale;
}

export const EnglishLearningView: React.FC<EnglishLearningViewProps> = ({ locale }) => {
  const [activeTab, setActiveTab] = useState<'vocab' | 'grammar' | 'reading' | 'writing' | 'chat'>('vocab');
  const [cefrLevel, setCefrLevel] = useState<'A2' | 'B1' | 'B2' | 'C1'>('B2');

  // Vocabulary State
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [showVocabMeaning, setShowVocabMeaning] = useState(false);
  const vocabularyList = [
    {
      word: 'Resilient',
      phonetic: '/rɪˈzɪl.jənt/',
      level: 'B2',
      partOfSpeech: 'adjective',
      definition: 'Able to be happy, successful, or quickly recover again after something difficult happens.',
      uzbek: 'Chidamli, bardoshli, qayta tiklanuvchan',
      example: 'The students remained resilient despite the rigorous exam schedule.',
      synonyms: ['adaptable', 'tough', 'buoyant', 'strong'],
    },
    {
      word: 'Perseverance',
      phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
      level: 'B2',
      partOfSpeech: 'noun',
      definition: 'Continued effort to do or achieve something despite difficulties, failure, or opposition.',
      uzbek: 'G‘ayrat, matonat, tinimsiz intilish',
      example: 'Through hard work and perseverance, she earned a scholarship.',
      synonyms: ['persistence', 'tenacity', 'determination', 'resolve'],
    },
    {
      word: 'Meticulous',
      phonetic: '/məˈtɪk.jə.ləs/',
      level: 'C1',
      partOfSpeech: 'adjective',
      definition: 'Very careful and with great attention to every detail.',
      uzbek: 'O‘ta sinchkov, mayda detallargacha e’tiborli',
      example: 'He gave a meticulous presentation with no errors.',
      synonyms: ['thorough', 'diligent', 'precise', 'scrupulous'],
    },
    {
      word: 'Ambiguous',
      phonetic: '/æmˈbɪɡ.ju.əs/',
      level: 'B2',
      partOfSpeech: 'adjective',
      definition: 'Having or expressing more than one possible meaning, sometimes intentionally.',
      uzbek: 'Noaniq, ikki ma’noli',
      example: 'The instructions on the test were ambiguous and caused confusion.',
      synonyms: ['unclear', 'equivocal', 'vague', 'obscure'],
    },
    {
      word: 'Eloquent',
      phonetic: '/ˈel.ə.kwənt/',
      level: 'C1',
      partOfSpeech: 'adjective',
      definition: 'Giving a clear, strong message; expressing oneself fluently and persuasively.',
      uzbek: 'Fasohli, notiqona, ta’sirchan gapiruvchi',
      example: 'She gave an eloquent speech advocating for educational reform.',
      synonyms: ['articulate', 'expressive', 'fluent', 'persuasive'],
    },
  ];

  // Grammar & Exercise state
  const [grammarTopic, setGrammarTopic] = useState('Present Perfect vs Past Simple');
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarContent, setGrammarContent] = useState<string | null>(null);

  // Reading Comprehension state
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingPassage, setReadingPassage] = useState<string | null>(null);

  // Writing Evaluation state
  const [writingInput, setWritingInput] = useState('');
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<string | null>(null);

  // AI Conversation Partner state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm your English conversation partner. We can talk about hobbies, school, science, or your dreams. As we chat, I'll gently highlight and explain any grammar or vocabulary mistakes you make. What did you do today?",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFetchGrammar = async () => {
    setGrammarLoading(true);
    setGrammarContent(null);
    const prompt = `Explain the English grammar topic "${grammarTopic}" for a ${cefrLevel} learner.
Include:
1. Core Rule & When to use it (simple explanation).
2. Formula / Sentence structure.
3. 3 Clear Example Sentences with translations.
4. Top 3 Common Mistakes students make with this rule.
5. A 3-question mini practice quiz with answers revealed below.`;

    try {
      const res = await generateContent(
        prompt,
        'You are an expert Cambridge/IELTS English language coach.'
      );
      setGrammarContent(res);
    } catch (e: any) {
      setGrammarContent(`⚠️ Error: ${e?.message}`);
    } finally {
      setGrammarLoading(false);
    }
  };

  const handleGenerateReading = async () => {
    setReadingLoading(true);
    setReadingPassage(null);
    const prompt = `Create an interesting 200-word reading comprehension passage for a ${cefrLevel} English learner on an intriguing scientific or historical topic.
Follow it with:
1. 3 Multiple-Choice Comprehension Questions (A, B, C, D).
2. Key Vocabulary list (3 challenging words defined in context).
3. Answer key with brief explanations at the bottom.`;

    try {
      const res = await generateContent(
        prompt,
        'You are an ESL reading comprehension test author.'
      );
      setReadingPassage(res);
    } catch (e: any) {
      setReadingPassage(`⚠️ Error: ${e?.message}`);
    } finally {
      setReadingLoading(false);
    }
  };

  const handleEvaluateWriting = async () => {
    if (!writingInput.trim() || writingLoading) return;
    setWritingLoading(true);
    setWritingFeedback(null);

    const prompt = `Review and grade this student English writing sample:
"${writingInput}"

Target Level: ${cefrLevel}
Provide:
1. **CEFR Estimated Score & Overall Impression**: (e.g. B1+, B2, or C1).
2. **Corrected Version**: Show the revised, polished text.
3. **Specific Mistakes Explained**: Highlight every grammar, spelling, punctuation, or word choice error and explain WHY it was incorrect.
4. **Vocabulary Upgrades**: 3 ways to use more academic/idiomatic vocabulary.
5. **Scorecard**: Grammar (/10), Vocabulary (/10), Coherence (/10).`;

    try {
      const res = await generateContent(
        prompt,
        'You are an IELTS/TOEFL writing examiner providing encouraging, thorough, educational feedback.'
      );
      setWritingFeedback(res);
    } catch (e: any) {
      setWritingFeedback(`⚠️ Error: ${e?.message}`);
    } finally {
      setWritingLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');

    const newHistory = [...chatMessages, { role: 'user' as const, text: userText }];
    setChatMessages(newHistory);
    setChatLoading(true);

    const prompt = `You are a supportive, conversational English tutor. 
Engage in a friendly conversation with the student.
If the student makes any grammatical, spelling, or vocabulary mistakes in their message, kindly point them out in a dedicated "**Mistake & Correction**" block, explain why in simple terms, and then reply naturally to keep the conversation flowing.
Conversation history:
${newHistory.map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')}`;

    try {
      const reply = await sendChatMessage(
        newHistory.map((m) => ({ role: m.role, content: m.text })),
        'You are an expert English conversation practice partner who corrects mistakes gently while keeping discussions lively and engaging.'
      );
      setChatMessages([...newHistory, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      setChatMessages([
        ...newHistory,
        { role: 'assistant', text: `⚠️ Connection error: ${e?.message || 'Could not connect'}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentWord = vocabularyList[currentWordIdx];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              English Learning Academy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Vocabulary flashcards, grammar rules, reading comprehension, writing evaluation, and AI conversation practice.
            </p>
          </div>
        </div>

        {/* Level selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Target:</span>
          <select
            value={cefrLevel}
            onChange={(e) => setCefrLevel(e.target.value as any)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
          >
            <option value="A2">A2 Elementary</option>
            <option value="B1">B1 Intermediate</option>
            <option value="B2">B2 Upper-Int</option>
            <option value="C1">C1 Advanced</option>
          </select>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'vocab', label: 'Vocabulary Builder' },
          { id: 'grammar', label: 'Grammar Guide' },
          { id: 'reading', label: 'Reading Comprehension' },
          { id: 'writing', label: 'Writing Checker' },
          { id: 'chat', label: 'AI Conversation Partner' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Vocabulary Flashcard */}
      {activeTab === 'vocab' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-center">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
              Level {currentWord.level}
            </span>
            <span>
              Word {currentWordIdx + 1} of {vocabularyList.length}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentWord.word}
              </h3>
              <button
                onClick={() => speakText(currentWord.word)}
                className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Listen pronunciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-mono text-slate-400">
              {currentWord.phonetic} • <span className="italic">{currentWord.partOfSpeech}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Definition
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                {currentWord.definition}
              </p>
            </div>

            {/* Uzbek translation toggle */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                O'zbekcha Tarjimasi
              </span>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {currentWord.uzbek}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Example in Context
              </span>
              <p className="text-xs italic text-slate-600 dark:text-slate-400 mt-0.5">
                "{currentWord.example}"
              </p>
            </div>
          </div>

          {/* Flashcard Next/Prev Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentWordIdx((prev) => (prev > 0 ? prev - 1 : vocabularyList.length - 1))}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Previous Word
            </button>
            <button
              onClick={() => setCurrentWordIdx((prev) => (prev + 1) % vocabularyList.length)}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25"
            >
              Next Word
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Grammar Guide */}
      {activeTab === 'grammar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select or Enter Grammar Topic
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={grammarTopic}
                onChange={(e) => setGrammarTopic(e.target.value)}
                placeholder="e.g. Conditionals (0, 1, 2, 3), Passive Voice, Inversion..."
                className="flex-1 p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleFetchGrammar}
                disabled={grammarLoading}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 disabled:opacity-50"
              >
                {grammarLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Explaining...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain Grammar</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick grammar presets */}
            <div className="inline-flex flex-wrap gap-2 mt-3">
              {[
                'Present Perfect vs Past Simple',
                'Second & Third Conditionals',
                'Passive Voice Formations',
                'Gerunds vs Infinitives',
                'Relative Clauses (who, which, that)',
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setGrammarTopic(topic)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {grammarContent && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <MarkdownView content={grammarContent} />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Reading Comprehension */}
      {activeTab === 'reading' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Reading Comprehension Practice ({cefrLevel})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate an academic passage with multiple-choice questions and answer breakdown.
              </p>
            </div>
            <button
              onClick={handleGenerateReading}
              disabled={readingLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 disabled:opacity-50"
            >
              {readingLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Passage...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Reading Passage</span>
                </>
              )}
            </button>
          </div>

          {readingPassage ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-sm">
              <MarkdownView content={readingPassage} />
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Click "New Reading Passage" to generate a level-appropriate passage with comprehension questions.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Writing Evaluator */}
      {activeTab === 'writing' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Paste or Type Your English Writing Sample
            </label>
            <textarea
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              placeholder="Paste a paragraph, essay excerpt, or homework sentence here... (e.g. Although the weather was raining, we decided to went to the park because we want to play football...)"
              rows={5}
              className="w-full p-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleEvaluateWriting}
              disabled={!writingInput.trim() || writingLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 disabled:opacity-50"
            >
              {writingLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing & Scoring...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Check Writing & Explain Mistakes</span>
                </>
              )}
            </button>
          </div>

          {writingFeedback && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-sm">
              <MarkdownView content={writingFeedback} />
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AI Conversation Partner */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-full sm:max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <MarkdownView content={msg.text} />
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-xs max-w-xs text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Partner is typing & reviewing grammar...</span>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Type your message in English..."
              className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim() || chatLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
