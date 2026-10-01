import React, { useState } from 'react';
import {
  Gamepad2,
  Cpu,
  Monitor,
  HardDrive,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { Locale } from '../utils/i18n';

interface GameCompatibilityViewProps {
  locale: Locale;
}

export const GameCompatibilityView: React.FC<GameCompatibilityViewProps> = ({ locale }) => {
  const [appName, setAppName] = useState('Cyberpunk 2077');
  const [cpu, setCpu] = useState('Intel Core i5-12400F');
  const [gpu, setGpu] = useState('NVIDIA GeForce RTX 3060 12GB');
  const [ram, setRam] = useState('16GB DDR4');
  const [storage, setStorage] = useState('512GB NVMe SSD (80GB free)');
  const [os, setOs] = useState('Windows 11 64-bit');

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const presets = [
    { name: 'Cyberpunk 2077', type: 'Game (Heavy 3D AAA)' },
    { name: 'Grand Theft Auto V', type: 'Game (Standard AAA)' },
    { name: 'Valorant / CS2', type: 'Game (Esports Competitive)' },
    { name: 'Minecraft with BSL Shaders', type: 'Game (Voxel Graphics)' },
    { name: 'Blender 3D (Cycles Rendering)', type: 'App (Creative CAD/3D)' },
    { name: 'Adobe Premiere Pro 4K', type: 'App (Video Editing)' },
    { name: 'Android Studio Emulator', type: 'App (Software Dev)' },
  ];

  const handleAnalyze = async () => {
    if (!appName.trim() || loading) return;
    setLoading(true);
    setAnalysis(null);

    const prompt = `Analyze the PC hardware compatibility for running this software/game:
Target Game or Application: "${appName}"

Device Specifications:
- Processor (CPU): ${cpu}
- Graphics Card (GPU): ${gpu}
- System Memory (RAM): ${ram}
- Storage Type & Free Space: ${storage}
- Operating System: ${os}

Please structure your analysis strictly as follows:
1. **Compatibility Status**: (Choose clearly from: [EXCELLENT - Can Run Smoothly], [PLAYABLE - Smooth with Medium/Optimized Settings], [MINIMUM - Playable with Low Settings/30 FPS], or [NOT RECOMMENDED / INSUFFICIENT]).
2. **Estimated Performance (Approximated FPS & Resolution)**: Provide expected average FPS at 1080p, 1440p, or 4K.
3. **Recommended Settings**: Suggested resolution, Texture Quality, Shadow Quality, and whether to enable Upscaling (DLSS / FSR / XeSS).
4. **Potential Bottlenecks & Thermal Notes**: Identify whether CPU, GPU VRAM, or RAM capacity will be the limiting factor.
5. **Technical Explanation & Upgrade Advice**: Explain WHY these components perform this way and what single upgrade would yield the highest benefit.

Crucial Instruction: Do not present uncertain hardware performance as guaranteed facts. Explicitly note that real frame rates vary based on resolution, cooling, driver updates, and background software.`;

    try {
      const response = await generateContent(
        prompt,
        'You are an expert PC hardware and benchmark analyst providing objective, balanced, nuanced system compatibility evaluations.'
      );
      setAnalysis(response);
    } catch (e: any) {
      setAnalysis(`⚠️ Error: ${e?.message || 'Failed to analyze system specs'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Game & Application Compatibility Checker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Evaluate whether your computer specs can run heavy games, 3D suites, and developer tools.
            </p>
          </div>
        </div>

        {/* Disclaimer Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Benchmark-approximated estimations</span>
        </div>
      </div>

      {/* Input Specs Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Game/App Name & Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Target Game or Application
          </label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="e.g. Cyberpunk 2077, GTA V, Valorant, Blender 3D, Premiere Pro..."
            className="w-full p-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[11px] font-semibold text-slate-400 self-center">Popular:</span>
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => setAppName(p.name)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hardware Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* CPU */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Processor (CPU)
            </label>
            <input
              type="text"
              value={cpu}
              onChange={(e) => setCpu(e.target.value)}
              placeholder="e.g. Intel Core i5-12400F, Ryzen 5 5600"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* GPU */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-emerald-500" />
              Graphics Card (GPU)
            </label>
            <input
              type="text"
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
              placeholder="e.g. RTX 3060, GTX 1650, Radeon RX 6600"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* RAM */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              Memory (RAM)
            </label>
            <input
              type="text"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              placeholder="e.g. 16GB DDR4, 32GB DDR5"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Storage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              Storage & Free Space
            </label>
            <input
              type="text"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              placeholder="e.g. 512GB SSD (100GB free)"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* OS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Operating System
            </label>
            <input
              type="text"
              value={os}
              onChange={(e) => setOs(e.target.value)}
              placeholder="e.g. Windows 11 64-bit, macOS Sonoma, Ubuntu"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleAnalyze}
            disabled={!appName.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Benchmarking & Analyzing...</span>
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                <span>Check Hardware Compatibility</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Performance Estimation Report</span>
            </div>
            <span className="text-[11px] text-slate-400">
              For {appName}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm">
            <MarkdownView content={analysis} />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Hardware Advisory:</strong> Performance estimates are based on synthetic benchmarks and typical thermal conditions. Background processes, laptop thermal dissipation limits, and driver updates can cause actual gaming frame rates to vary.
          </div>
        </div>
      )}
    </div>
  );
};
