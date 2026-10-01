import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  return (
    <div className={`space-y-3 leading-relaxed break-words ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

function renderMarkdown(rawText: string): React.ReactNode[] {
  if (!rawText) return [];

  const lines = rawText.split('\n');
  const elements: React.ReactNode[] = [];
  let index = 0;

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <CodeBlock
            key={`code-${index++}`}
            language={codeBlockLang}
            code={codeBlockLines.join('\n')}
          />
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim() || 'code';
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`sp-${index++}`} className="h-2" />);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index++}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1">
          {formatInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index++}`} className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-5 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          {formatInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index++}`} className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-2">
          {formatInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${index++}`}
          className="border-l-4 border-indigo-500 pl-3.5 py-1.5 italic text-slate-700 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-md text-sm my-2"
        >
          {formatInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <div key={`li-${index++}`} className="flex items-start gap-2.5 ml-1">
          <span className="text-indigo-500 font-bold mt-1 text-xs">•</span>
          <span className="text-slate-800 dark:text-slate-200 flex-1">
            {formatInline(text)}
          </span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`oli-${index++}`} className="flex items-start gap-2.5 ml-1">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs mt-0.5 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 min-w-5 text-center">
            {numMatch[1]}
          </span>
          <span className="text-slate-800 dark:text-slate-200 flex-1">
            {formatInline(numMatch[2])}
          </span>
        </div>
      );
      continue;
    }

    // Default paragraph
    elements.push(
      <p key={`p-${index++}`} className="text-slate-800 dark:text-slate-200 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  // If ended while still in code block
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <CodeBlock
        key={`code-end-${index++}`}
        language={codeBlockLang}
        code={codeBlockLines.join('\n')}
      />
    );
  }

  return elements;
}

function formatInline(text: string): React.ReactNode {
  // Split on code spans `...`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, pIdx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      const code = part.slice(1, -1);
      return (
        <code
          key={`code-part-${pIdx}`}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 mx-0.5"
        >
          {code}
        </code>
      );
    }

    // Bold formatting: **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 3) {
        return (
          <strong key={`bold-${pIdx}-${bIdx}`} className="font-semibold text-slate-900 dark:text-slate-100">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-3 border border-slate-700/80 bg-slate-900 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 text-xs font-mono text-slate-400 border-b border-slate-700/60">
        <span className="uppercase tracking-wider font-semibold text-indigo-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};
