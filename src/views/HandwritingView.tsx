import React, { useState, useRef } from 'react';
import {
  FileSignature,
  Download,
  Printer,
  Sparkles,
  Sliders,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { Locale } from '../utils/i18n';

interface HandwritingViewProps {
  locale: Locale;
}

export const HandwritingView: React.FC<HandwritingViewProps> = ({ locale }) => {
  const [text, setText] = useState(
    `Photosynthesis Formula & Notes:\n6CO₂ + 6H₂O + Light Energy  →  C₆H₁₂O₆ + 6O₂\n\n1. Light-Dependent Reactions:\n   - Occur in the thylakoid membrane.\n   - Chlorophyll absorbs photons and splits water molecules.\n\n2. Calvin Cycle (Light-Independent):\n   - Takes place in the stroma.\n   - Carbon fixation produces glucose for plant cellular respiration.\n\nExam Tip: Don't confuse the stroma with stomata (the leaf pores)!`
  );

  const [fontFamily, setFontFamily] = useState<'Caveat' | 'Patrick Hand' | 'Kalam' | 'Shadows Into Light' | 'Indie Flower'>('Caveat');
  const [fontSize, setFontSize] = useState<number>(24);
  const [lineHeight, setLineHeight] = useState<number>(36);
  const [letterSpacing, setLetterSpacing] = useState<number>(0.5);
  const [inkColor, setInkColor] = useState<string>('#1e3a8a'); // Classic blue ballpoint
  const [paperType, setPaperType] = useState<'lined' | 'grid' | 'legal' | 'blank' | 'dark'>('lined');
  const [slant, setSlant] = useState<number>(0);

  const sheetRef = useRef<HTMLDivElement>(null);

  const fontOptions = [
    { id: 'Caveat', label: 'Caveat (Fluid Cursive)' },
    { id: 'Patrick Hand', label: 'Patrick Hand (Neat Student Print)' },
    { id: 'Kalam', label: 'Kalam (Fast Ballpoint Pen)' },
    { id: 'Shadows Into Light', label: 'Shadows Into Light (Thin Script)' },
    { id: 'Indie Flower', label: 'Indie Flower (Artistic Cursive)' },
  ];

  const inkColors = [
    { name: 'Royal Blue Ballpoint', color: '#1e3a8a' },
    { name: 'Gel Pen Black', color: '#09090b' },
    { name: 'Correction Red', color: '#dc2626' },
    { name: 'Graphite Pencil', color: '#475569' },
    { name: 'Deep Emerald', color: '#047857' },
    { name: 'Turquoise Violet', color: '#4338ca' },
  ];

  const paperStyles = {
    lined: {
      background: '#fffef9',
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #93c5fd 35px, #93c5fd 36px)',
      borderLeft: '4px solid #f87171',
    },
    grid: {
      background: '#ffffff',
      backgroundImage:
        'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      borderLeft: '4px solid #cbd5e1',
    },
    legal: {
      background: '#fef08a',
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #facc15 35px, #facc15 36px)',
      borderLeft: '4px solid #ef4444',
    },
    blank: {
      background: '#fafaf9',
      borderLeft: 'none',
    },
    dark: {
      background: '#0f172a',
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #1e293b 35px, #1e293b 36px)',
      borderLeft: '4px solid #6366f1',
    },
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = () => {
    if (!sheetRef.current) return;
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = Math.max(1000, text.split('\n').length * lineHeight + 160);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = paperType === 'dark' ? '#0f172a' : paperType === 'legal' ? '#fef08a' : '#fffef9';
    ctx.fillRect(0, 0, width, height);

    // Draw lines if lined
    if (paperType === 'lined' || paperType === 'legal' || paperType === 'dark') {
      ctx.strokeStyle = paperType === 'dark' ? '#1e293b' : paperType === 'legal' ? '#facc15' : '#93c5fd';
      ctx.lineWidth = 1;
      for (let y = 80; y < height - 40; y += 36) {
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(width - 40, y);
        ctx.stroke();
      }
      // Margin line
      ctx.strokeStyle = paperType === 'dark' ? '#6366f1' : '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(80, height);
      ctx.stroke();
    }

    // Draw text
    ctx.fillStyle = inkColor;
    ctx.font = `${fontSize}px "${fontFamily}", cursive`;
    const lines = text.split('\n');
    let startY = 80;
    for (const l of lines) {
      ctx.fillText(l, 96, startY);
      startY += lineHeight;
    }

    // Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'handwritten_notes.png';
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Handwritten Text Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Transform typed school notes into realistic handwritten notebook pages with custom inks and lined paper.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls & Input Column */}
        <div className="space-y-4">
          {/* Text Input */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Type or Paste Notes
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
          </div>

          {/* Typography Controls */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Handwriting Style
            </h3>

            {/* Font Family */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Handwriting Font
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              >
                {fontOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Notebook Paper Style
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { id: 'lined', label: 'College Ruled' },
                    { id: 'grid', label: 'Math Grid' },
                    { id: 'legal', label: 'Yellow Pad' },
                    { id: 'dark', label: 'Dark Note' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaperType(p.id)}
                    className={`py-2 px-2.5 rounded-xl border font-medium text-center transition-all ${
                      paperType === p.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ink Color Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Pen Ink Color
              </label>
              <div className="flex items-center gap-2">
                {inkColors.map((ink) => (
                  <button
                    key={ink.color}
                    onClick={() => setInkColor(ink.color)}
                    style={{ backgroundColor: ink.color }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      inkColor === ink.color ? 'ring-3 ring-indigo-400 scale-110' : 'hover:scale-105'
                    }`}
                    title={ink.name}
                  />
                ))}
              </div>
            </div>

            {/* Sliders: Size & Line height */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="36"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Line Height (Notebook Margin)</span>
                  <span className="font-mono">{lineHeight}px</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="48"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Natural Slant</span>
                  <span className="font-mono">{slant}°</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={slant}
                  onChange={(e) => setSlant(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Notebook Preview Column */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Interactive Notebook Sheet</span>
              <span className="font-normal text-slate-400">Scale 100%</span>
            </div>

            <div
              ref={sheetRef}
              className="rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 min-h-[580px] border border-slate-200 dark:border-slate-800 transition-all"
              style={{
                ...paperStyles[paperType],
                transform: `rotate(${slant}deg)`,
                transformOrigin: 'top left',
              }}
            >
              <div
                style={{
                  fontFamily: `"${fontFamily}", cursive`,
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`,
                  letterSpacing: `${letterSpacing}px`,
                  color: paperType === 'dark' && inkColor === '#09090b' ? '#f8fafc' : inkColor,
                }}
                className="whitespace-pre-wrap select-text leading-relaxed outline-hidden"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setText(e.currentTarget.innerText || '')}
              >
                {text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
