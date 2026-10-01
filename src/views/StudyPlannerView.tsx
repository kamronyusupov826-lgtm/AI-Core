import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Target,
  Trophy,
  Flame,
} from 'lucide-react';
import { generateContent } from '../services/api';
import { MarkdownView } from '../components/MarkdownView';
import { StudyTask, StudyPlan } from '../types';
import { Locale } from '../utils/i18n';

interface StudyPlannerViewProps {
  locale: Locale;
}

const STORAGE_KEY = 'student_ai_study_plan_v1';

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({ locale }) => {
  const [subjects, setSubjects] = useState<string[]>(['Calculus', 'Physics Mechanics', 'English Essay']);
  const [newSubject, setNewSubject] = useState('');
  const [dailyHours, setDailyHours] = useState('3');
  const [examDate, setExamDate] = useState('2026-05-15');
  const [goal, setGoal] = useState('Master core formulas, finish all past paper sets, and achieve an A grade');
  const [loading, setLoading] = useState(false);

  const [activePlan, setActivePlan] = useState<StudyPlan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [rawPlanMarkdown, setRawPlanMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (activePlan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activePlan));
    }
  }, [activePlan]);

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleGeneratePlan = async () => {
    if (subjects.length === 0 || loading) return;
    setLoading(true);
    setRawPlanMarkdown(null);

    const prompt = `Create an organized, high-yield study schedule for a student.
Parameters:
- Subjects: ${subjects.join(', ')}
- Daily Available Study Time: ${dailyHours} hours/day
- Target Exam Date: ${examDate}
- Student's Primary Goal: "${goal}"

Format the response strictly with:
1. **Weekly Milestone Strategy**: High level roadmap dividing the weeks into Concept Foundation, Practice Drills, and Mock Exams.
2. **Weekly Day-by-Day Schedule**: (Monday through Sunday) breakdown specifying exact subject, recommended Pomodoro blocks, and concrete topics.
3. **Daily Actionable Checklist**: A list of specific actionable study tasks formatted as:
[TASK] Day | Subject | Task Title | Duration in minutes
For example:
[TASK] Monday | Calculus | Derivatives Chain Rule Drill | 45
[TASK] Monday | Physics Mechanics | Newton's Laws Problem Set | 60
[TASK] Tuesday | English Essay | Thesis formulation & Outline | 45
(Provide 8 to 12 structured tasks across the week)
4. **Retention & Exam Success Tips**: 3 proven cognitive science tips (e.g. spaced repetition, active recall).`;

    try {
      const response = await generateContent(
        prompt,
        'You are an elite academic coach specializing in Pomodoro study scheduling, spaced repetition, and student time management.'
      );
      setRawPlanMarkdown(response);

      // Parse structured [TASK] lines into interactive tasks
      const taskLines = response.split('\n').filter((l) => l.trim().startsWith('[TASK]'));
      const parsedTasks: StudyTask[] = taskLines.map((line, idx) => {
        const parts = line.replace('[TASK]', '').split('|').map((s) => s.trim());
        return {
          id: `task-${Date.now()}-${idx}`,
          day: parts[0] || 'Day 1',
          subject: parts[1] || subjects[0] || 'General',
          title: parts[2] || 'Study session',
          durationMinutes: parseInt(parts[3], 10) || 45,
          completed: false,
          description: '',
        };
      });

      if (parsedTasks.length > 0) {
        setActivePlan({
          id: `plan-${Date.now()}`,
          goal,
          examDate,
          availableHoursPerDay: parseFloat(dailyHours) || 3,
          totalStudyHours: parsedTasks.reduce((acc, t) => acc + t.durationMinutes / 60, 0),
          tasks: parsedTasks,
          tips: [],
        });
      }
    } catch (e: any) {
      setRawPlanMarkdown(`⚠️ Error: ${e?.message || 'Failed to create plan'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    if (!activePlan) return;
    const updated = activePlan.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setActivePlan({ ...activePlan, tasks: updated });
  };

  const completedCount = activePlan ? activePlan.tasks.filter((t) => t.completed).length : 0;
  const totalCount = activePlan ? activePlan.tasks.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Study Planner & Habit Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Generate an actionable study roadmap with Pomodoro blocks, milestones, and daily completion tracking.
            </p>
          </div>
        </div>

        {activePlan && totalCount > 0 && (
          <div className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200/50 dark:border-indigo-800/40">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                {completedCount} of {totalCount} completed ({progressPercent}%)
              </div>
              <div className="w-32 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Builder Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Subject Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Target Subjects / Topics
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {subjects.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                {sub}
                <button
                  onClick={() => handleRemoveSubject(sub)}
                  className="hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Add another subject (e.g. Organic Chemistry, History)..."
              className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddSubject}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Daily Study Hours
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Target Exam Date / Deadline
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              Primary Goal / Grade Aim
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Master chapter 4-7, score 90%+"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Generate Plan Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleGeneratePlan}
            disabled={subjects.length === 0 || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Generating plan...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>Create Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Daily Tasks Checklist */}
      {activePlan && activePlan.tasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Interactive Study Checklist
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Click task to check off
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activePlan.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 line-through opacity-70'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono shrink-0">
                      {task.durationMinutes}m
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {task.day}
                    </span>
                    <span>•</span>
                    <span>{task.subject}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Full Markdown Plan Strategy */}
      {rawPlanMarkdown && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Complete Strategy & Milestone Schedule</span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm">
            <MarkdownView content={rawPlanMarkdown} />
          </div>
        </div>
      )}
    </div>
  );
};
