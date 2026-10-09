import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  HelpCircle,
  PlayCircle,
  RefreshCw,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
  FileCode,
  Zap,
  Lightbulb,
  ShieldCheck,
  Layers,
  Bot
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { LearningPlanItem } from '../types';

export const LearningPlanView: React.FC = () => {
  const {
    learningPlan,
    activeCourseId,
    activeCourse,
    learningState,
    knowledgeMap,
    togglePlanItem,
    generatePlanForGoal,
    launchActivity,
    askTutorAboutStep
  } = useLearning();

  const [regenerating, setRegenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(learningState?.goal || 'Semester Examination');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('step_3');

  const handleGoalChange = async (newGoal: string) => {
    setSelectedGoal(newGoal);
    setRegenerating(true);
    try {
      await generatePlanForGoal(newGoal);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await generatePlanForGoal(selectedGoal);
    } finally {
      setRegenerating(false);
    }
  };

  const todayItems = learningPlan?.items || [];
  const upcomingItems = learningPlan?.upcomingItems || [];
  const completedCount = todayItems.filter(i => i.completed).length;
  const totalCount = todayItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const targetTopic = learningPlan?.targetTopic || knowledgeMap?.recommendedStartingPoint || 'Inheritance';
  const assessedLevel = knowledgeMap?.overallLevel || 'Intermediate';
  const assessedScore = knowledgeMap?.overallScore || 64;

  const getStageBadge = (stage?: string, type?: string) => {
    const key = stage || type || 'theory';
    switch (key) {
      case 'theory':
      case 'learn':
        return { label: '1. Theory', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: BookOpen };
      case 'example':
        return { label: '2. Example', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Target };
      case 'practice':
        return { label: '3. Practice', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: HelpCircle };
      case 'build':
      case 'code':
        return { label: '4. Build in IDE', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Code2 };
      case 'apply':
      case 'quiz':
        return { label: '5. Apply (Quiz)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Award };
      default:
        return { label: 'Step', bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: PlayCircle };
    }
  };

  const getStatusBadge = (item: LearningPlanItem) => {
    if (item.completed || item.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (item.status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              AI Personalized Curriculum
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Calibrated Priority: <strong className="text-slate-800">{targetTopic}</strong>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
              Level: <strong className="text-slate-800">{assessedLevel} ({assessedScore}%)</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {learningPlan?.title || `Personalized Study Plan: ${targetTopic}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built using your diagnostic results to bypass mastered concepts and target high-yield gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <select
            value={selectedGoal}
            onChange={(e) => handleGoalChange(e.target.value)}
            disabled={regenerating}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Semester Examination">Goal: Semester Examination</option>
            <option value="Job Interview Coding Rounds">Goal: Job Interview Coding</option>
            <option value="Core Object-Oriented Mastery">Goal: Deep OOP Foundations</option>
          </select>

          <button
            type="button"
            disabled={regenerating}
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Recalibrate plan using Gemini"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{regenerating ? 'Recalibrating...' : 'Recalibrate'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Baseline & Pedagogical Route Summary Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-900/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                Diagnostic Rationale
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {activeCourse?.title || 'Java Programming'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
              {learningPlan?.summary ||
                `Calibrated for your ${assessedLevel} diagnostic profile (${assessedScore}%). Since your fundamentals are solid, this plan skips basic syntax and directly prioritizes ${targetTopic} to optimize your readiness for ${selectedGoal}.`}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="text-xs text-slate-400">Diagnostic</div>
              <div className="text-lg font-extrabold text-white">{assessedScore}%</div>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Target</div>
              <div className="text-sm font-bold text-indigo-300">{targetTopic}</div>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Est. Time</div>
              <div className="text-sm font-bold text-white">~{learningPlan?.estimatedTotalMinutes || 65}m</div>
            </div>
          </div>
        </div>

        {/* 5-Stage Pedagogical Route Bar */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>LEADENT Pedagogical Route</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { stage: '1. Theory', desc: 'Concept & memory behavior' },
              { stage: '2. Example', desc: 'Enterprise architecture code' },
              { stage: '3. Practice', desc: 'Active problem analysis' },
              { stage: '4. Build', desc: 'Hands-on code in IDE' },
              { stage: '5. Apply', desc: 'Diagnostic mini-quiz' }
            ].map((p, idx) => (
              <div key={idx} className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="font-bold text-white text-[11px]">{p.stage}</div>
                <div className="text-[10px] text-slate-300 mt-0.5">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Today's Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {completedCount} <span className="text-xs font-normal text-slate-500">/ {totalCount} completed ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Today's Time Commitment</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ~{learningPlan?.estimatedTotalMinutes || 65}{' '}
            <span className="text-xs font-normal text-slate-500">minutes</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">High code-to-theory active learning</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Next Sequential Milestone</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            {upcomingItems[0]?.topicTitle || 'Polymorphism & Dynamic Dispatch'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unlocks upon completing today's tasks</p>
        </div>
      </div>

      {/* TODAY'S SEQUENCED ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Sequenced Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute steps sequentially. Click any step to inspect learning notes and sample code.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {totalCount} Calibrated Steps
          </span>
        </div>

        <div className="space-y-3">
          {todayItems.map((item, index) => {
            const stageInfo = getStageBadge(item.practicalRouteStage, item.type);
            const StageIcon = stageInfo.icon;
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition duration-150 overflow-hidden ${
                  item.completed
                    ? 'bg-slate-50/70 border-slate-200/80 text-slate-500'
                    : item.status === 'in_progress'
                    ? 'bg-indigo-50/20 border-indigo-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox + Title + Metadata */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => togglePlanItem(item.id)}
                      className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-600 transition shrink-0"
                      title={item.completed ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {item.stepNumber || index + 1}
                        </span>

                        <h3 className={`text-sm font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </h3>

                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${stageInfo.bg}`}>
                          <StageIcon className="w-3 h-3" />
                          <span>{stageInfo.label}</span>
                        </span>

                        {getStatusBadge(item)}

                        {item.priority === 'high' && !item.completed && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            High Priority
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Learning Objective & Diagnostic Reason */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-0.5">
                        {item.learningObjective && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <strong className="text-slate-700">Objective:</strong> {item.learningObjective}
                          </span>
                        )}
                        {item.reason && (
                          <span className="text-indigo-600/90 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{item.reason}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Timer */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.estimatedMinutes}m
                    </span>

                    {item.snippet && (
                      <button
                        type="button"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition flex items-center gap-1 cursor-pointer"
                        title={isExpanded ? 'Hide notes' : 'Preview notes'}
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden md:inline">{isExpanded ? 'Hide Notes' : 'Preview'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => askTutorAboutStep(item)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 transition flex items-center gap-1 cursor-pointer"
                      title="Ask AI Tutor for guidance on this step"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden lg:inline">Ask Tutor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => launchActivity(item)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        item.completed
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : item.status === 'in_progress'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <span>{item.completed ? 'Review' : item.status === 'in_progress' ? 'Resume' : 'Start Step'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Collapsible snippet preview */}
                {isExpanded && item.snippet && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100 space-y-2 text-xs">
                    {item.snippet.theory && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700">
                        <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-indigo-700">
                          <BookOpen className="w-3 h-3" /> Theory Summary
                        </div>
                        <p className="leading-relaxed">{item.snippet.theory}</p>
                      </div>
                    )}

                    {item.snippet.exampleCode && (
                      <div className="p-3 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[11px] border border-slate-800">
                        <div className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-sans font-bold flex items-center gap-1.5">
                          <Code2 className="w-3 h-3 text-emerald-400" /> Reference Architecture Example
                        </div>
                        <pre className="overflow-x-auto whitespace-pre">{item.snippet.exampleCode}</pre>
                      </div>
                    )}

                    {item.snippet.practiceQuestion && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900">
                        <div className="font-bold text-amber-950 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <HelpCircle className="w-3 h-3" /> Challenge Question
                        </div>
                        <p>{item.snippet.practiceQuestion}</p>
                      </div>
                    )}

                    {item.snippet.solutionHint && (
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-purple-900">
                        <div className="font-bold text-purple-950 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Lightbulb className="w-3 h-3" /> Implementation Hint
                        </div>
                        <p>{item.snippet.solutionHint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* UPCOMING SEQUENTIAL ROADMAP */}
      {upcomingItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Upcoming Progression Sequence: {upcomingItems[0]?.topicTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically staged to commence once today's active plan items are validated.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Next Phase
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-200 transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1">
                    <span className="font-bold uppercase tracking-wider text-purple-700">
                      Step {todayItems.length + idx + 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.estimatedMinutes}m
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Stage: {item.practicalRouteStage || item.type}</span>
                  <button
                    type="button"
                    onClick={() => launchActivity(item)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Preview</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
