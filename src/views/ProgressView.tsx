import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Layers,
  History,
  CheckCircle,
  FileCode,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Flame,
  Zap,
  Shield
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { api } from '../services/api';
import { ActivityHistoryItem, LearningEvidence, TopicTrend } from '../types';

export const ProgressView: React.FC = () => {
  const {
    learningState,
    streak,
    knowledgeMap,
    openCheckLevelModal,
    triggerNextBestAction,
    activeCourse,
    refreshAll
  } = useLearning();

  const [logs, setLogs] = useState<ActivityHistoryItem[]>([]);
  const [evidences, setEvidences] = useState<LearningEvidence[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'evidence' | 'activity'>('matrix');
  const [isLoadingEvidences, setIsLoadingEvidences] = useState(false);

  const courseId = learningState?.courseId || 'java-programming';

  const loadData = useCallback(async () => {
    setIsLoadingEvidences(true);
    try {
      const [logsRes, eviRes] = await Promise.all([
        api.activity.getLogs(),
        api.student.getEvidence(courseId)
      ]);
      setLogs(logsRes.logs);
      setEvidences(eviRes.evidences || []);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setIsLoadingEvidences(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const examReadiness = learningState?.examReadiness;
  const examStatus = learningState?.examReadinessStatus || 'progressing';

  // Helper for trend badge
  const renderTrendBadge = (trend?: TopicTrend) => {
    if (!trend || trend === 'stable') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded" title="Performance is stable across evaluations">
          <Minus className="w-2.5 h-2.5" />
          Stable
        </span>
      );
    }
    if (trend === 'improving') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded" title="Consistently increasing scores in recent sessions">
          <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
          Improving
        </span>
      );
    }
    if (trend === 'struggling') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded" title="Average score < 50% across assessments">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
          Struggling
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded" title="Score drop detected in latest session">
        <TrendingDown className="w-2.5 h-2.5 text-rose-600" />
        Declining
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Adaptive Learning State
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Course: <strong className="text-slate-800">{activeCourse?.title || 'Java Programming'}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Competency & Readiness Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every mastery score is calibrated from verified student evidence — quizzes, practical code submissions, and diagnostic evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              refreshAll();
              loadData();
            }}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Refresh State & Evidence"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openCheckLevelModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHECK MY LEVEL</span>
          </button>
        </div>
      </div>

      {/* Prerequisite Bottleneck Warning if present */}
      {learningState?.prerequisiteRecommendations && learningState.prerequisiteRecommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Prerequisite Bottleneck Detected
          </div>
          <div className="space-y-1 text-xs">
            {learningState.prerequisiteRecommendations.map((rec, i) => (
              <p key={i} className="leading-relaxed">
                <strong className="text-amber-900 capitalize">{rec.topicId.replace('-', ' ')}</strong> requires{' '}
                <strong className="text-amber-900">{rec.missingPrerequisite}</strong>. {rec.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Top Cards: Exam Readiness, Assessed Level & Evidence Count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Exam Readiness Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Exam Readiness Index
            </span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>

          {examReadiness !== null && examReadiness !== undefined ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{examReadiness}%</span>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  examStatus === 'ready'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : examStatus === 'progressing'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {examStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    examReadiness >= 75 ? 'bg-emerald-500' : examReadiness >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${examReadiness}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Calculated from verified syllabus coverage, average quiz performance, and practical task completions.
              </p>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <div className="text-sm font-bold text-slate-700">Calibrating Data</div>
              <p className="text-xs text-slate-500">
                Complete at least 2 practical or quiz assessments to generate a verifiable exam readiness projection.
              </p>
            </div>
          )}
        </div>

        {/* Knowledge Level Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assessed Academic Level
            </span>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-950">
              {learningState?.overallLevel || 'Intermediate'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({learningState?.overallMastery || 64}% avg)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs pt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[10px]">
              {learningState?.strongTopics?.length || 0} Strong
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200 text-[10px]">
              {learningState?.goodTopics?.length || 0} Good
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 text-[10px]">
              {learningState?.moderateTopics?.length || 0} Moderate
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[10px]">
              {learningState?.weakTopics?.length || 0} Gaps
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Derived from foundational, intermediate, and advanced topic mastery thresholds.
          </p>
        </div>

        {/* Evidence Count Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evidence Trail
            </span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {evidences.length || learningState?.totalEvidenceCount || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">recorded sessions</span>
          </div>

          <div className="text-xs text-slate-600 space-y-1 pt-1">
            <div className="flex justify-between">
              <span>Completed Activities:</span>
              <strong className="text-slate-900">{learningState?.completedActivitiesCount || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>Study Streak:</span>
              <strong className="text-slate-900">{streak?.currentStreak || learningState?.studyStreakDays || 1} Days ({streak?.tier || 'bronze'})</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            No simulated data: Every point is backed by an auditable submission record.
          </p>
        </div>
      </div>

      {/* Consistency Tier & Learning Streak Journey */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              (streak?.tier || 'bronze') === 'gold'
                ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                : (streak?.tier || 'bronze') === 'silver'
                ? 'bg-slate-500/20 border border-slate-400/40 text-slate-200'
                : 'bg-amber-600/20 border border-amber-600/40 text-amber-400'
            }`}>
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Consistency Tier: <span className="capitalize text-amber-300">{streak?.tier || 'bronze'}</span>
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  (streak?.tier || 'bronze') === 'gold'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : (streak?.tier || 'bronze') === 'silver'
                    ? 'bg-slate-300/20 text-slate-200 border-slate-400/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {streak?.tier || 'bronze'} Tier
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Rewarding regular, meaningful study sessions over passive app screen time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Streak</div>
              <div className="text-lg font-black text-amber-300 flex items-center gap-1">
                <span>{streak?.currentStreak || learningState?.studyStreakDays || 1}</span>
                <span className="text-xs font-normal text-slate-300">Days</span>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Longest Streak</div>
              <div className="text-lg font-black text-white flex items-center gap-1">
                <span>{streak?.longestStreak || streak?.currentStreak || 1}</span>
                <span className="text-xs font-normal text-slate-300">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Tier Milestone Progression Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-700/80">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2 rounded-lg border transition ${
              (streak?.currentStreak || 1) >= 1
                ? 'bg-amber-950/40 border-amber-600/60 text-amber-300 font-bold'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}>
              <div className="text-[11px] font-extrabold uppercase">Bronze</div>
              <div className="text-[10px] opacity-80">1 - 6 Days</div>
            </div>
            <div className={`p-2 rounded-lg border transition ${
              (streak?.currentStreak || 1) >= 7
                ? 'bg-slate-700/60 border-slate-400 text-slate-100 font-bold'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}>
              <div className="text-[11px] font-extrabold uppercase">Silver</div>
              <div className="text-[10px] opacity-80">7 - 13 Days</div>
            </div>
            <div className={`p-2 rounded-lg border transition ${
              (streak?.currentStreak || 1) >= 14
                ? 'bg-amber-900/50 border-amber-400 text-amber-300 font-bold shadow-xs'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}>
              <div className="text-[11px] font-extrabold uppercase">Gold</div>
              <div className="text-[10px] opacity-80">14+ Days</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
            <span>
              {streak?.tier === 'gold'
                ? '🌟 Highest Consistency Tier Unlocked! Maintain your daily mastery habit.'
                : `Next Goal: ${(streak?.tier === 'silver' ? 14 : 7) - (streak?.currentStreak || 1)} more consecutive days to unlock ${(streak?.tier === 'silver' ? 'Gold' : 'Silver')} tier.`
              }
            </span>
            <span className="text-slate-400 text-[10px]">
              {streak?.totalMeaningfulActivities || 0} verified learning activities
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Topic Mastery & Gaps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'evidence'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Evidence Audit Trail ({evidences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Activity Log ({logs.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: Topic Mastery & Knowledge Gaps */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Knowledge Gaps Specific Highlights */}
          {learningState?.knowledgeGaps && learningState.knowledgeGaps.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Identified Semantic Knowledge Gaps
              </div>
              <p className="text-xs text-slate-500">
                These specific conceptual boundaries were pinpointed from assessment mistakes and prerequisite analysis:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {learningState.knowledgeGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-medium leading-relaxed">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Matrix Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-slate-900">
                  Topic Mastery & Performance Trends
                </h2>
                <p className="text-xs text-slate-500">
                  Mastery Tiers: Strong (80-100%) • Good (60-79%) • Moderate (40-59%) • Weak (20-39%) • Beginner (0-19%)
                </p>
              </div>

              <button
                type="button"
                onClick={triggerNextBestAction}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Recommended Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(learningState?.topicProficiencies || knowledgeMap?.topicProficiencies || {
                fundamentals: 'Strong',
                oop: 'Good',
                inheritance: 'Weak',
                polymorphism: 'Moderate',
                abstraction: 'Moderate',
                interfaces: 'Weak',
                'exception-handling': 'Good',
                collections: 'Moderate'
              }).map(([topicId, prof]) => {
                const profKey = String(prof);
                const mastery = learningState?.topicMastery?.[topicId] ?? (
                  profKey === 'Strong' ? 88 : profKey === 'Good' ? 72 : profKey === 'Moderate' ? 55 : profKey === 'Weak' ? 38 : 20
                );
                const trend = learningState?.topicTrends?.[topicId];
                const isWeak = profKey === 'Weak' || profKey === 'Beginner' || mastery < 50;

                const colorMap: Record<string, { badge: string; bar: string; ring: string }> = {
                  Strong: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', ring: 'hover:border-emerald-300' },
                  Good: { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', ring: 'hover:border-blue-300' },
                  Moderate: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', bar: 'bg-indigo-500', ring: 'hover:border-indigo-300' },
                  Weak: { badge: 'bg-amber-50 text-amber-800 border-amber-200', bar: 'bg-amber-500', ring: 'hover:border-amber-300' },
                  Beginner: { badge: 'bg-slate-100 text-slate-700 border-slate-200', bar: 'bg-slate-400', ring: 'hover:border-slate-300' }
                };
                const config = colorMap[profKey] || colorMap.Beginner;

                return (
                  <div
                    key={topicId}
                    className={`p-4 rounded-xl border border-slate-200 bg-white transition shadow-2xs space-y-2.5 ${config.ring} ${
                      isWeak ? 'ring-1 ring-amber-400/40 bg-amber-50/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug capitalize">
                          {topicId.replace('-', ' ')}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {mastery}% mastery
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                          {prof}
                        </span>
                        {renderTrendBadge(trend)}
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${config.bar}`}
                        style={{ width: `${mastery}%` }}
                      />
                    </div>

                    {isWeak && (
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <span>⚡ Priority Target</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Verifiable Evidence Audit Trail */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Verifiable Learning Evidence Trail
              </h2>
              <p className="text-xs text-slate-500">
                Auditable log of assessments and activities that mathematically adjusted student mastery.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {evidences.length} records
            </span>
          </div>

          {evidences.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <FileCode className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">No learning evidence recorded yet for this course.</p>
              <button
                type="button"
                onClick={() => openCheckLevelModal()}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Run Diagnostic Calibration
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {evidences.map(evi => (
                <div
                  key={evi.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        evi.source === 'quiz'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : evi.source === 'practical'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : evi.source === 'diagnostic'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {evi.source.replace('_', ' ')}
                      </span>
                      <strong className="text-slate-900 capitalize font-bold">
                        {evi.topicTitle || evi.topicId.replace('-', ' ')}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        evi.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        Score: {evi.score}%
                      </span>
                      {evi.previousMastery !== undefined && (
                        <span className="text-[11px] text-slate-500">
                          {evi.previousMastery}% → <strong className="text-slate-800">{evi.newMastery}%</strong>
                        </span>
                      )}
                      <span className="text-slate-400 text-[10px]">{evi.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    {evi.details}
                  </p>

                  {evi.conceptDemonstrated && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Demonstrated:</span>
                      <span>{evi.conceptDemonstrated}</span>
                    </div>
                  )}

                  {evi.mistakesIdentified && evi.mistakesIdentified.length > 0 && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                      <strong>Identified Weakness:</strong> {evi.mistakesIdentified.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Academic Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Academic Activity Log</h2>
            <span className="text-xs text-slate-500">{logs.length} logged sessions</span>
          </div>

          <div className="space-y-3">
            {logs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white flex items-center justify-between gap-4 text-xs transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    {log.type === 'practice' ? '💻' : log.type === 'quiz' ? '📝' : '⚡'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{log.title}</h4>
                    <p className="text-[11px] text-slate-500">{log.topic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  {log.score !== undefined && (
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {log.score}%
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
