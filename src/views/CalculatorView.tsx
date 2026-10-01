import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  History,
  Copy,
  Check,
  Divide,
  Percent,
  Delete,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface CalculatorViewProps {
  locale: Locale;
}

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ locale }) => {
  const [activeMode, setActiveMode] = useState<'scientific' | 'equation'>('scientific');
  const [display, setDisplay] = useState('0');
  const [prevEquation, setPrevEquation] = useState('');
  const [isRad, setIsRad] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  // Equation solver state
  const [eqInput, setEqInput] = useState('2x^2 - 5x + 2 = 0');
  const [eqSolving, setEqSolving] = useState(false);
  const [eqResult, setEqResult] = useState<string | null>(null);

  // Safe Math evaluator
  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setDisplay((prev) => {
      if (prev === 'Error') return '0' + op;
      const lastChar = prev.slice(-1);
      if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevEquation('');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleFunction = (fn: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;

      switch (fn) {
        case 'sin':
          res = isRad ? Math.sin(val) : Math.sin((val * Math.PI) / 180);
          break;
        case 'cos':
          res = isRad ? Math.cos(val) : Math.cos((val * Math.PI) / 180);
          break;
        case 'tan':
          res = isRad ? Math.tan(val) : Math.tan((val * Math.PI) / 180);
          break;
        case 'sqrt':
          if (val < 0) throw new Error('Invalid input');
          res = Math.sqrt(val);
          break;
        case 'cbrt':
          res = Math.cbrt(val);
          break;
        case 'sqr':
          res = Math.pow(val, 2);
          break;
        case 'cube':
          res = Math.pow(val, 3);
          break;
        case 'ln':
          if (val <= 0) throw new Error('Invalid input');
          res = Math.log(val);
          break;
        case 'log10':
          if (val <= 0) throw new Error('Invalid input');
          res = Math.log10(val);
          break;
        case 'fact':
          if (val < 0 || !Number.isInteger(val)) throw new Error('Integer required');
          let f = 1;
          for (let i = 2; i <= Math.min(val, 170); i++) f *= i;
          res = f;
          break;
        case 'neg':
          res = -val;
          break;
        case 'fraction':
          // Convert decimal to simplified fraction string
          const fractionStr = toFraction(val);
          setDisplay(fractionStr);
          return;
        default:
          return;
      }

      const formatted = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();
      setPrevEquation(`${fn}(${display}) =`);
      setDisplay(formatted);
      addToHistory(`${fn}(${display})`, formatted);
    } catch {
      setDisplay('Error');
    }
  };

  const handleEvaluate = () => {
    try {
      let sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `${Math.PI}`)
        .replace(/e/g, `${Math.E}`)
        .replace(/\^/g, '**');

      // Safe arithmetic evaluator
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();

      if (!isFinite(result) || isNaN(result)) {
        throw new Error('Math error');
      }

      const formatted = Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toFixed(8)).toString();

      setPrevEquation(`${display} =`);
      setDisplay(formatted);
      addToHistory(display, formatted);
    } catch {
      setDisplay('Error');
    }
  };

  const toFraction = (decimal: number): string => {
    if (Number.isInteger(decimal)) return decimal.toString();
    const tolerance = 1.0e-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    do {
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
    return `${h1}/${k1}`;
  };

  const addToHistory = (expression: string, result: string) => {
    setHistory((prev) => [{ expression, result, timestamp: Date.now() }, ...prev.slice(0, 19)]);
  };

  const handleSolveEquation = async () => {
    if (!eqInput.trim() || eqSolving) return;
    setEqSolving(true);
    setEqResult(null);

    const prompt = `Solve this algebraic or polynomial equation step-by-step for a student:
Equation: "${eqInput}"

Format requirements:
1. Identify the equation type (Linear, Quadratic, System, etc.).
2. Rearrange into standard form if necessary.
3. Show all intermediate steps (discriminant D = b² - 4ac, factoring, or formula).
4. State the exact roots and decimal approximations if irrational.
5. Verification check (substitute back into equation).`;

    try {
      const response = await generateContent(
        prompt,
        'You are a patient mathematics professor who provides clear, rigorous step-by-step solutions.'
      );
      setEqResult(response);
    } catch (e: any) {
      setEqResult(`⚠️ Error: ${e?.message || 'Failed to solve equation'}`);
    } finally {
      setEqSolving(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CalcIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Student Calculator & Equation Solver
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Basic arithmetic, scientific functions, fractions, powers, roots, and step-by-step algebraic equation solver.
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveMode('scientific')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeMode === 'scientific'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Scientific & Fractions
          </button>
          <button
            onClick={() => setActiveMode('equation')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeMode === 'equation'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Equation Solver
          </button>
        </div>
      </div>

      {activeMode === 'scientific' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Keypad & Screen */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            {/* Display screen */}
            <div className="bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl text-right text-white space-y-1 shadow-inner relative">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <button
                  onClick={() => setIsRad(!isRad)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-indigo-400 hover:bg-slate-700"
                >
                  {isRad ? 'RAD' : 'DEG'}
                </button>
                <span className="truncate">{prevEquation}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight overflow-x-auto scrollbar-none py-1">
                {display}
              </div>
              <button
                onClick={handleCopyResult}
                className="absolute left-3 bottom-3 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white"
                title="Copy current result"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Scientific Function Row */}
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
              <button onClick={() => handleFunction('sin')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">sin</button>
              <button onClick={() => handleFunction('cos')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">cos</button>
              <button onClick={() => handleFunction('tan')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">tan</button>
              <button onClick={() => handleFunction('ln')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">ln</button>
              <button onClick={() => handleFunction('log10')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">log</button>

              <button onClick={() => handleFunction('sqrt')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">√x</button>
              <button onClick={() => handleFunction('sqr')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">x²</button>
              <button onClick={() => handleOperator('^')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">xʸ</button>
              <button onClick={() => handleFunction('fraction')} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800" title="Convert to fraction a/b">a/b</button>
              <button onClick={() => handleFunction('fact')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300">n!</button>
            </div>

            {/* Main Numeric Keypad */}
            <div className="grid grid-cols-4 gap-2.5 text-base font-semibold">
              <button onClick={handleClear} className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors">AC</button>
              <button onClick={handleBackspace} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center"><Delete className="w-5 h-5" /></button>
              <button onClick={() => handleOperator('%')} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200">%</button>
              <button onClick={() => handleOperator('/')} className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xl font-bold">÷</button>

              <button onClick={() => handleDigit('7')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">7</button>
              <button onClick={() => handleDigit('8')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">8</button>
              <button onClick={() => handleDigit('9')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">9</button>
              <button onClick={() => handleOperator('*')} className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xl font-bold">×</button>

              <button onClick={() => handleDigit('4')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">4</button>
              <button onClick={() => handleDigit('5')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">5</button>
              <button onClick={() => handleDigit('6')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">6</button>
              <button onClick={() => handleOperator('-')} className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xl font-bold">−</button>

              <button onClick={() => handleDigit('1')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">1</button>
              <button onClick={() => handleDigit('2')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">2</button>
              <button onClick={() => handleDigit('3')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">3</button>
              <button onClick={() => handleOperator('+')} className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xl font-bold">+</button>

              <button onClick={() => handleFunction('neg')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">±</button>
              <button onClick={() => handleDigit('0')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">0</button>
              <button onClick={() => handleDigit('.')} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100">.</button>
              <button onClick={handleEvaluate} className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl shadow-md shadow-indigo-600/30">=</button>
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-500" />
                Calculation History
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] text-slate-400 hover:text-red-500"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 scrollbar-thin">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">
                  No calculations yet. Expressions will appear here.
                </p>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setDisplay(item.result)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors group"
                  >
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {item.expression} =
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Equation Solver Mode */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Enter Equation to Solve
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={eqInput}
                onChange={(e) => setEqInput(e.target.value)}
                placeholder="e.g. 3x^2 - 12x + 9 = 0 or 4x + 10 = 26"
                className="flex-1 p-3.5 text-base font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSolveEquation}
                disabled={!eqInput.trim() || eqSolving}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {eqSolving ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Solve Step-by-Step</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-xs text-slate-400 font-semibold mr-2">Samples:</span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {[
                '2x^2 - 5x + 2 = 0',
                'x^2 - 9 = 0',
                '3x + 15 = 2x - 5',
                '2x^2 + 4x - 6 = 0',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => setEqInput(sample)}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Solution display */}
          {eqResult && (
            <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <MarkdownView content={eqResult} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
