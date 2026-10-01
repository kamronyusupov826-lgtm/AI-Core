import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Calculator,
  Atom,
  Landmark,
  Compass,
  BookA,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface HomeworkHelperViewProps {
  initialProblem?: string;
  locale: Locale;
}

export const HomeworkHelperView: React.FC<HomeworkHelperViewProps> = ({
  initialProblem = '',
  locale,
}) => {
  const [problem, setProblem] = useState(initialProblem);
  const [subject, setSubject] = useState<'math' | 'science' | 'history' | 'geography' | 'english' | 'other'>('math');
  const [level, setLevel] = useState<'middle' | 'high' | 'college'>('high');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [practicePrompt, setPracticePrompt] = useState<string | null>(null);
  const [loadingPractice, setLoadingPractice] = useState(false);

  const subjects = [
    { id: 'math', label: 'Mathematics', icon: Calculator, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { id: 'science', label: 'Science (Physics, Chem, Bio)', icon: Atom, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'history', label: 'History & Civics', icon: Landmark, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { id: 'geography', label: 'Geography', icon: Compass, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'english', label: 'English & Literature', icon: BookA, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
  ] as const;

  const handleSolve = async () => {
    if (!problem.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setPracticePrompt(null);

    const levelDescriptions = {
      middle: 'Middle School (clear, simple terminology, foundational concepts)',
      high: 'High School (standard curriculum level, formulas, step-by-step rigorous logic)',
      college: 'College / University (advanced analytical depth, derivations, formal notation)',
    };

    const promptText = `Please act as a patient, master academic tutor. Solve and explain the following homework question:
Question:
"${problem}"

Subject context: ${subject}
Student education level: ${levelDescriptions[level]}
Language: Respond in the exact language used in the question (support English, Uzbek, Russian, etc.).

Structure your response clearly with these sections:
1. **Problem Overview & Key Concepts**: Briefly explain what the problem asks and what theorems/principles apply.
2. **Step-by-Step Solution**: Numbered, clear breakdown of calculations and deductions.
3. **Final Answer**: A clear, prominent statement of the final result.
4. **Student Key Takeaway / Common Mistakes**: Advice on how to recognize and avoid traps in this type of problem.`;

    try {
      const response = await generateContent(
        promptText,
        'You are an exceptional student homework tutor dedicated to clarity, mathematical rigor, and deep conceptual understanding.'
      );
      setResult(response);
    } catch (err: any) {
      setResult(`⚠️ Error: ${err?.message || 'Failed to solve problem'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePractice = async () => {
    if (!result || loadingPractice) return;
    setLoadingPractice(true);

    try {
      const practicePromptReq = `Based on the previously solved problem: "${problem}", generate 1 similar practice problem with a hint and the final answer hidden or listed at the end.`;
      const practiceRes = await generateContent(
        practicePromptReq,
        'You are a tutor creating custom practice problems for students.'
      );
      setPracticePrompt(practiceRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPractice(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleProblems = [
    {
      sub: 'math',
      title: 'Quadratic Equation',
      text: 'Solve for x: 3x² - 12x + 9 = 0 by factoring and quadratic formula.',
    },
    {
      sub: 'science',
      title: 'Physics Mechanics',
      text: 'A car accelerates uniformly from 15 m/s to 30 m/s over a distance of 100 meters. What is the acceleration and time taken?',
    },
    {
      sub: 'history',
      title: 'World History',
      text: 'What were the primary causes and consequences of the Silk Road on cultural exchange between Asia and Europe?',
    },
    {
      sub: 'english',
      title: 'Grammar & Tone',
      text: 'Analyze the difference between active and passive voice in this sentence: "The discovery was announced by the scientist."',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Homework Helper
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Get step-by-step explanations, math solutions, and concept breakdowns tailored to your grade level.
            </p>
          </div>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          {(
            [
              { id: 'middle', label: 'Middle' },
              { id: 'high', label: 'High School' },
              { id: 'college', label: 'College' },
            ] as const
          ).map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setLevel(lvl.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                level === lvl.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Subject Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Subject
          </label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => {
              const Icon = sub.icon;
              const isSelected = subject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubject(sub.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Enter or Paste Your Homework Problem
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Type your question or math equation here... (e.g. Find the roots of f(x) = x^2 - 4x + 3, or explain how photosynthesis works)"
            rows={4}
            className="w-full p-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
          />
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-2">
            Quick Samples:
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            {sampleProblems.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSubject(sample.sub as any);
                  setProblem(sample.text);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {problem && (
            <button
              onClick={() => {
                setProblem('');
                setResult(null);
                setPracticePrompt(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleSolve}
            disabled={!problem.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Solving step-by-step...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain & Solve</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Step-by-Step Explanation</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Solution'}</span>
              </button>
              <button
                onClick={handleSolve}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Re-explain"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
            <MarkdownView content={result} />
          </div>

          {/* Follow-up practice prompt button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Want to test your understanding with a similar problem?
            </p>
            <button
              onClick={handleGeneratePractice}
              disabled={loadingPractice}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-200/60 dark:border-indigo-800/60"
            >
              {loadingPractice ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating practice...</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Generate Practice Question</span>
                </>
              )}
            </button>
          </div>

          {/* Render Practice Question if generated */}
          {practicePrompt && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-900/40 text-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                Practice Exercise
              </h4>
              <MarkdownView content={practicePrompt} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
