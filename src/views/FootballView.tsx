import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Flame,
  Globe2,
} from 'lucide-react';
import { FootballMatch } from '../types';
import { fetchFootballMatches } from '../services/api';
import { Locale } from '../utils/i18n';

interface FootballViewProps {
  locale: Locale;
}

export const FootballView: React.FC<FootballViewProps> = ({ locale }) => {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [competitions, setCompetitions] = useState<{ code: string; name: string }[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FINISHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState('');

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFootballMatches();
      setMatches(data.matches);
      setCompetitions(data.competitions);
    } catch (err: any) {
      setError(err?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(tz);
    } catch {
      setUserTimezone('Local Time');
    }
  }, []);

  // Format UTC date to student's local date and exact kickoff time
  const formatMatchDateTime = (utcDateStr: string) => {
    try {
      const date = new Date(utcDateStr);
      const localDate = date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const localTime = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // Relative days calculation
      const now = new Date();
      const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let relativeTag = '';
      if (diffDays === 0) relativeTag = 'Today';
      else if (diffDays === 1) relativeTag = 'Tomorrow';
      else if (diffDays > 1) relativeTag = `in ${diffDays} days`;

      return { localDate, localTime, relativeTag };
    } catch {
      return { localDate: utcDateStr, localTime: '', relativeTag: '' };
    }
  };

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    // Competition
    if (selectedComp !== 'ALL' && m.competitionCode !== selectedComp) {
      return false;
    }
    // Status
    if (statusFilter !== 'ALL' && m.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const home = m.homeTeam.name.toLowerCase();
      const away = m.awayTeam.name.toLowerCase();
      const comp = m.competition.toLowerCase();
      if (!home.includes(q) && !away.includes(q) && !comp.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Football Match Tracker
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Official Schedule
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Major European leagues & UEFA Champions League. Kickoff times converted to your local time.
            </p>
          </div>
        </div>

        {/* Local Timezone Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Globe2 className="w-4 h-4 text-indigo-500" />
          <span className="truncate max-w-[180px] sm:max-w-xs">
            Local Time ({userTimezone})
          </span>
          <button
            onClick={loadMatches}
            disabled={loading}
            className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Top: Search and Status */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or league..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
            {(
              [
                { id: 'ALL', label: 'All Matches' },
                { id: 'UPCOMING', label: 'Upcoming' },
                { id: 'FINISHED', label: 'Finished' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === s.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Competition Badges Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold shrink-0">Leagues:</span>
          {competitions.map((comp) => (
            <button
              key={comp.code}
              onClick={() => setSelectedComp(comp.code)}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 border transition-all ${
                selectedComp === comp.code
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {comp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">
            Fetching latest match schedules...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/30">
          {error}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          No matches found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => {
            const { localDate, localTime, relativeTag } = formatMatchDateTime(match.utcDate);
            const isFinished = match.status === 'FINISHED';
            const isLive = match.status === 'LIVE';

            return (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Match Top Bar: League & Status */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {match.competition}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {match.round}
                    </span>
                  </div>

                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      LIVE
                    </span>
                  ) : isFinished ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                      FULL TIME
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
                      {relativeTag || 'UPCOMING'}
                    </span>
                  )}
                </div>

                {/* Teams & Score/Kickoff Center */}
                <div className="grid grid-cols-5 items-center gap-2 py-2">
                  {/* Home Team */}
                  <div className="col-span-2 flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1.5 flex items-center justify-center border border-slate-100 dark:border-slate-700/60 shadow-xs">
                      {match.homeTeam.logo ? (
                        <img
                          src={match.homeTeam.logo}
                          alt={match.homeTeam.name}
                          className="w-9 h-9 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-xs text-indigo-600">
                          {match.homeTeam.shortName.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                      {match.homeTeam.name}
                    </span>
                  </div>

                  {/* Middle: Score or Kickoff Time */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    {isFinished ? (
                      <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-slate-900 dark:text-white px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {match.score.home ?? 0} : {match.score.away ?? 0}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                          {localTime}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Kickoff
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="col-span-2 flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1.5 flex items-center justify-center border border-slate-100 dark:border-slate-700/60 shadow-xs">
                      {match.awayTeam.logo ? (
                        <img
                          src={match.awayTeam.logo}
                          alt={match.awayTeam.name}
                          className="w-9 h-9 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-xs text-indigo-600">
                          {match.awayTeam.shortName.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Match Bottom Bar: Date & Venue */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{localDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{match.venue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
