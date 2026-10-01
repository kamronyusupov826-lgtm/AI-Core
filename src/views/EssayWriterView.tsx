import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Download,
  BookOpen,
  AlignLeft,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface EssayWriterViewProps {
  initialTopic?: string;
  locale: Locale;
}

export const EssayWriterView: React.FC<EssayWriterViewProps> = ({ initialTopic = '', locale }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [type, setType] = useState<'essay' | 'paragraph' | 'intro' | 'conclusion' | 'assignment' | 'explanation'>('essay');
  const [language, setLanguage] = useState<'English' | 'Uzbek' | 'Russian' | 'Spanish' | 'German'>('English');
  const [length, setLength] = useState<'short' | 'medium' | 'long' | 'detailed'>('medium');
  const [style, setStyle] = useState<'academic' | 'argumentative' | 'narrative' | 'persuasive' | 'informative'>('academic');
  const [level, setLevel] = useState<'middle' | 'high' | 'undergrad' | 'advanced'>('high');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setResult(null);

    const lengthWords = {
      short: 'approx. 300 words',
      medium: 'approx. 600 words',
      long: 'approx. 1000 words',
      detailed: 'approx. 1500 words with thorough analytical structure',
    };

    const typePrompts = {
      essay: 'a complete structured essay (catchy title, compelling introduction with hook & thesis statement, body paragraphs with evidence, and strong synthesis conclusion)',
      paragraph: 'a focused, impactful paragraph with a clear topic sentence, supporting arguments, and concluding thought',
      intro: 'a powerful introductory section featuring an engaging hook, background context, and a clear, arguable thesis statement',
      conclusion: 'a resonant concluding section that restates the thesis in a fresh way, summarizes main points, and leaves a thought-provoking final takeaway',
      assignment: 'a comprehensive academic school assignment response addressing key questions with critical analysis and citations/examples',
      explanation: 'an educational deep-dive explanation with clear analogies, key terminology definitions, and conceptual clarity',
    };

    const prompt = `Write ${typePrompts[type]} on the topic:
"${topic}"

Requirements:
- Language: ${language} (Write completely and fluently in ${language})
- Target Length: ${lengthWords[length]}
- Tone/Style: ${style}
- Academic Level: ${level} level student

Formatting:
- Include a bold title.
- Provide a brief 3-point outline at the beginning.
- Use clean paragraph breaks and bold emphasis where fitting.
- Conclude with a brief "Self-Check Question" for the student.`;

    try {
      const response = await generateContent(
        prompt,
        `You are a distinguished academic writing instructor. You produce original, elegant, structured writing in the user's requested language (${language}).`
      );
      setResult(response);
    } catch (e: any) {
      setResult(`⚠️ Error: ${e?.message || 'Failed to generate text'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `essay_${topic.slice(0, 20).replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = result ? result.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Essay & Academic Writer
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Draft essays, hooks, conclusions, and school assignments in English, Uzbek, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Topic Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Essay / Paper Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The impact of renewable energy on global economy, or O'zbekistonning boy madaniy merosi..."
            className="w-full p-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Writing Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Output Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(
              [
                { id: 'essay', label: 'Full Essay' },
                { id: 'paragraph', label: 'Single Paragraph' },
                { id: 'intro', label: 'Introduction & Hook' },
                { id: 'conclusion', label: 'Conclusion' },
                { id: 'assignment', label: 'Assignment' },
                { id: 'explanation', label: 'Explanation' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  type === t.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Granular Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="English">English</option>
              <option value="Uzbek">O'zbek tili (Uzbek)</option>
              <option value="Russian">Русский (Russian)</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="German">Deutsch (German)</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="short">Short (~300 words)</option>
              <option value="medium">Medium (~600 words)</option>
              <option value="long">Long (~1000 words)</option>
              <option value="detailed">In-depth (~1500 words)</option>
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tone & Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="academic">Academic & Analytical</option>
              <option value="argumentative">Argumentative & Persuasive</option>
              <option value="narrative">Narrative Storytelling</option>
              <option value="informative">Informative & Objective</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="middle">Middle School</option>
              <option value="high">High School</option>
              <option value="undergrad">Undergraduate / College</option>
              <option value="advanced">Advanced / Graduate</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Crafting essay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Writing</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Display */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {wordCount} words
              </span>
              <span className="text-xs text-slate-400">
                ~{Math.ceil(wordCount / 200)} min read
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Download as Markdown file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={handleGenerate}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Regenerate"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
            <MarkdownView content={result} />
          </div>
        </div>
      )}
    </div>
  );
};
