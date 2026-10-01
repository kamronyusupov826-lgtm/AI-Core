import React, { useState } from 'react';
import {
  Code2,
  Bug,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  FileCode,
  Terminal,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface CodeFinderViewProps {
  initialCode?: string;
  locale: Locale;
}

export const CodeFinderView: React.FC<CodeFinderViewProps> = ({ initialCode = '', locale }) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState('python');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const languages = [
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'csharp', label: 'C#' },
    { id: 'html_css', label: 'HTML / CSS' },
    { id: 'sql', label: 'SQL' },
  ];

  const handleAnalyze = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setAnalysis(null);

    const prompt = `You are a world-class software engineer and friendly computer science teacher for students.
Analyze the following code for syntax errors, logical bugs, runtime issues, or inefficiency:

Language: ${language}
${errorMessage.trim() ? `User Reported Error / Output:\n${errorMessage}\n` : ''}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please structure your response strictly as follows:
1. **Error Detection & Summary**: What is broken, wrong, or causing unexpected behavior? (If no fatal error, mention logic flaws or code smells).
2. **Root Cause Explanation**: Explain in plain, beginner-friendly terms WHY the bug occurred and what the interpreter/compiler is complaining about.
3. **Corrected Code**: Provide the full, fixed, clean code in a code block with helpful inline comments.
4. **Step-by-Step Fix Breakdown**: Detail each change made and why.
5. **Best Practice / Pro Tip for Students**: A practical takeaway to avoid this pitfall in future coding sessions.`;

    try {
      const response = await generateContent(
        prompt,
        'You are an expert programming mentor specializing in clear bug diagnostics, beginner explanations, and pristine code fixes.'
      );
      setAnalysis(response);
    } catch (err: any) {
      setAnalysis(`⚠️ Error analyzing code: ${err?.message || 'Failed to connect to AI'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleBugs = [
    {
      lang: 'python',
      title: 'Python Off-by-One Loop',
      code: `def get_average(scores):\n    total = 0\n    for i in range(len(scores) + 1):\n        total += scores[i]\n    return total / len(scores)\n\nprint(get_average([90, 85, 95]))`,
      err: 'IndexError: list index out of range',
    },
    {
      lang: 'javascript',
      title: 'JS Async Promise Trap',
      code: `function fetchUserData(userId) {\n    let user;\n    fetch('/api/user/' + userId)\n        .then(res => res.json())\n        .then(data => { user = data; });\n    return user.name;\n}\n\nconsole.log(fetchUserData(42));`,
      err: "TypeError: Cannot read properties of undefined (reading 'name')",
    },
    {
      lang: 'cpp',
      title: 'C++ Dangling Pointer',
      code: `#include <iostream>\n\nint* createNumber() {\n    int num = 42;\n    return &num;\n}\n\nint main() {\n    int* ptr = createNumber();\n    std::cout << *ptr << std::endl;\n    return 0;\n}`,
      err: 'warning: address of local variable returned',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Code Error Finder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Paste broken or buggy code, understand what caused the error, and get the clean corrected version.
            </p>
          </div>
        </div>

        {/* Language dropdown */}
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Console Input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              Source Code
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {code.split('\n').length} lines
            </span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${language} code here...\nfunction example() {\n  // your code\n}`}
            rows={12}
            className="w-full p-4 rounded-xl text-xs sm:text-sm font-mono bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed"
            spellCheck={false}
          />

          {/* Quick Bug Samples */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-2">
              Try Common Student Bugs:
            </span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {sampleBugs.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLanguage(sample.lang);
                    setCode(sample.code);
                    setErrorMessage(sample.err);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Terminal Error & Analyze Button */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              Terminal Error (Optional)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Paste any traceback or error message you received.
            </p>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="e.g. TypeError: Cannot read property of undefined at line 4..."
              rows={4}
              className="w-full p-3 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!code.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Debugging & Analyzing...</span>
              </>
            ) : (
              <>
                <Bug className="w-4 h-4" />
                <span>Find & Fix Errors</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis & Correction Output */}
      {analysis && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Diagnostic Report & Corrected Code</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Fix'}</span>
              </button>
              <button
                onClick={handleAnalyze}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Re-analyze"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm">
            <MarkdownView content={analysis} />
          </div>
        </div>
      )}
    </div>
  );
};
