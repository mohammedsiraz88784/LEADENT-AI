import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Loader2,
  Lock,
  Compass,
  Check,
  Copy,
  ChevronRight,
  RefreshCw,
  Target,
  MessageSquareQuote,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PracticalRoute,
  PracticalStage,
  PracticalActivity,
  PracticalEvaluationFeedback,
  NextBestAction
} from '../types';
import { api } from '../services/api';
import { useLearning } from '../context/LearningContext';

const STAGE_META: Record<
  PracticalStage,
  { label: string; step: number; color: string; bg: string; border: string; icon: string }
> = {
  understand: {
    label: '1. Understand',
    step: 1,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'BookOpen'
  },
  example: {
    label: '2. Example',
    step: 2,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'Compass'
  },
  practice: {
    label: '3. Practice',
    step: 3,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'Lightbulb'
  },
  build: {
    label: '4. Build',
    step: 4,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'Code2'
  },
  apply: {
    label: '5. Apply',
    step: 5,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'Award'
  }
};

export const PracticeView: React.FC = () => {
  const {
    selectedPracticeTopic,
    setSelectedPracticeTopic,
    selectedPracticalStage,
    setSelectedPracticalStage,
    activeCourseId,
    setLearningState,
    setLearningPlan,
    setCurrentView,
    setSelectedQuizTopic,
    setActiveTutorTopic
  } = useLearning();

  const [route, setRoute] = useState<PracticalRoute | null>(null);
  const [activeStageKey, setActiveStageKey] = useState<PracticalStage>('understand');
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Student interaction state
  const [studentInput, setStudentInput] = useState<string>('');
  const [codeEditor, setCodeEditor] = useState<string>('');
  const [showHintIndex, setShowHintIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeBuildTab, setActiveBuildTab] = useState<'editor' | 'tests' | 'criteria'>('editor');
  const [feedback, setFeedback] = useState<PracticalEvaluationFeedback | null>(null);

  // Load or fetch practical route
  useEffect(() => {
    async function loadRoute() {
      setLoading(true);
      setFeedback(null);
      try {
        const topic = selectedPracticeTopic || 'inheritance';
        const res = await api.practicalRoute.get(activeCourseId, topic);
        if (res.route) {
          setRoute(res.route);
          // Sync active stage
          if (selectedPracticalStage) {
            setActiveStageKey(selectedPracticalStage);
          } else {
            setActiveStageKey(res.route.currentStage || 'understand');
          }
        }
      } catch (err) {
        console.error('Failed to load practical route:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoute();
  }, [selectedPracticeTopic, activeCourseId]);

  // Sync when selectedPracticalStage changes from context
  useEffect(() => {
    if (selectedPracticalStage) {
      setActiveStageKey(selectedPracticalStage);
    }
  }, [selectedPracticalStage]);

  // Get current active stage and activity
  const activeStageObj = route?.stages.find(s => s.stage === activeStageKey) || route?.stages[0];
  const currentActivity: PracticalActivity | undefined = activeStageObj?.activities[currentActivityIndex] || activeStageObj?.activities[0];

  // Sync inputs when activity changes
  useEffect(() => {
    if (currentActivity) {
      setCodeEditor(currentActivity.starterCode || currentActivity.exampleCode || '');
      setStudentInput('');
      setShowHintIndex(0);
      setFeedback(null);
    }
  }, [currentActivity?.id]);

  const handleRegenerateRoute = async () => {
    if (!route) return;
    setGenerating(true);
    try {
      const res = await api.practicalRoute.generate({
        courseId: activeCourseId,
        topicId: route.topicId,
        topicTitle: route.topicTitle,
        level: route.studentLevel
      });
      if (res.route) {
        setRoute(res.route);
        setActiveStageKey(res.route.currentStage || 'understand');
        setFeedback(null);
      }
    } catch (err) {
      console.error('Failed to regenerate practical route:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitActivity = async () => {
    if (!route || !currentActivity) return;
    setSubmitting(true);
    try {
      const payloadSubmission =
        currentActivity.type === 'coding' || currentActivity.type === 'debugging' || currentActivity.type === 'code_completion'
          ? codeEditor
          : studentInput;

      const res = await api.practicalRoute.submit({
        courseId: activeCourseId,
        topicId: route.topicId,
        activityId: currentActivity.id,
        submission: payloadSubmission,
        code: codeEditor
      });

      setFeedback(res.feedback);
      if (res.route) {
        setRoute(res.route);
      }
      if (res.state) {
        setLearningState(res.state);
      }
      if (res.plan) {
        setLearningPlan(res.plan);
      }

      if (res.feedback.passed) {
        try {
          confetti({
            particleCount: 65,
            spread: 55,
            origin: { y: 0.65 }
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Practical activity submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAskTutor = () => {
    if (!route || !currentActivity) return;
    setActiveTutorTopic(route.topicTitle);
    setCurrentView('tutor');
  };

  const handleAdvanceToNextStage = () => {
    if (!route) return;
    const stagesOrder: PracticalStage[] = ['understand', 'example', 'practice', 'build', 'apply'];
    const curIdx = stagesOrder.indexOf(activeStageKey);
    if (curIdx < stagesOrder.length - 1) {
      const nextStage = stagesOrder[curIdx + 1];
      setActiveStageKey(nextStage);
      setSelectedPracticalStage(nextStage);
      setCurrentActivityIndex(0);
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: Practical Route Engine & Stage Progression Bar   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                PRACTICAL ROUTE ENGINE
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Theory → Example → Practice → Build → Apply
              </span>
              {route?.studentLevel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Calibrated: {route.studentLevel} Level
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{route?.topicTitle || 'Practical Learning Journey'}</span>
              <span className="text-xs font-normal text-slate-400">({activeCourseId})</span>
            </h1>
          </div>

          {/* Topic selector & route actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-500">Topic:</span>
              <select
                value={selectedPracticeTopic}
                onChange={e => setSelectedPracticeTopic(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="inheritance">Inheritance & super</option>
                <option value="oop">OOP & Encapsulation</option>
                <option value="fundamentals">Fundamentals & Syntax</option>
                <option value="interfaces">Interfaces & Contracts</option>
                <option value="polymorphism">Polymorphism</option>
                <option value="exception-handling">Exception Handling</option>
                <option value="collections">Collections Framework</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRegenerateRoute}
              disabled={generating || loading}
              title="Regenerate adaptive route based on latest diagnostic state"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{generating ? 'Adapting...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* 5-STAGE PROGRESSION NAV BAR */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 uppercase text-[11px] tracking-wide">
                Progressive Mastery Pipeline
              </span>
              <span className="text-[11px] font-bold text-indigo-600">
                ({route?.overallProgress || 0}% Completed)
              </span>
            </div>
            {route?.weakGapsTargeted && route.weakGapsTargeted.length > 0 && (
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline truncate max-w-md">
                Targeting: <strong className="text-amber-700">{route.weakGapsTargeted[0]}</strong>
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, route?.overallProgress || 0)}%` }}
            />
          </div>

          {/* Stage buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {(['understand', 'example', 'practice', 'build', 'apply'] as PracticalStage[]).map(stageKey => {
              const meta = STAGE_META[stageKey];
              const stageData = route?.stages.find(s => s.stage === stageKey);
              const isCurrent = activeStageKey === stageKey;
              const isCompleted = stageData?.status === 'completed';
              const isUpcoming = stageData?.status === 'upcoming' && !isCompleted;

              return (
                <button
                  key={stageKey}
                  type="button"
                  onClick={() => {
                    setActiveStageKey(stageKey);
                    setSelectedPracticalStage(stageKey);
                    setCurrentActivityIndex(0);
                    setFeedback(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                      : isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-black uppercase ${isCurrent ? 'text-indigo-100' : 'text-slate-500'}`}>
                      STAGE {meta.step}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                    ) : isUpcoming ? (
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className={`text-xs font-black truncate ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                    {meta.label.replace(/^\d+\.\s*/, '')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN ACTIVE ACTIVITY WORKSPACE                                */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <span className="text-sm font-semibold text-slate-600">Loading practical route activity...</span>
        </div>
      ) : !route || !currentActivity ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900">No Practical Activity Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            We couldn't load activities for this topic. Click below to generate an adaptive route.
          </p>
          <button
            type="button"
            onClick={handleRegenerateRoute}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
          >
            Generate Practical Route
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active Activity Context Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${STAGE_META[activeStageKey].bg} ${STAGE_META[activeStageKey].color} border ${STAGE_META[activeStageKey].border}`}>
                    {STAGE_META[activeStageKey].label}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    ~{currentActivity.estimatedMinutes} mins
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                    {currentActivity.type.replace('_', ' ')}
                  </span>
                  {currentActivity.status === 'completed' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentActivity.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentActivity.description}
                </p>
              </div>

              {/* Tutor Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAskTutor}
                  className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>
            </div>

            {/* Objective & Evaluation Criteria Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3 text-indigo-600" />
                  Learning Objective
                </span>
                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {currentActivity.learningObjective}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Evaluation Criteria
                </span>
                <ul className="text-xs font-medium text-slate-700 space-y-1">
                  {currentActivity.evaluationCriteria.slice(0, 2).map((crit, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* STAGE 1: UNDERSTAND (THEORY & MECHANICS)                      */}
          {/* ------------------------------------------------------------- */}
          {activeStageKey === 'understand' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Theory Content */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm border-b border-slate-100 pb-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Conceptual Architecture & Rules</span>
                </div>

                {/* Render Theory Markdown */}
                <div className="prose prose-slate prose-xs max-w-none text-xs text-slate-700 leading-relaxed space-y-3">
                  <div className="whitespace-pre-line">
                    {currentActivity.theoryContent || currentActivity.instructions}
                  </div>
                </div>

                {/* Key takeaways */}
                {currentActivity.keyTakeaways && currentActivity.keyTakeaways.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Key Architectural Takeaways
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {currentActivity.keyTakeaways.map((point, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-950 text-xs font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comprehension Checkpoint Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Comprehension Checkpoint</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs font-medium space-y-1">
                  <strong className="block text-[11px] uppercase tracking-wider text-amber-900">
                    Verify Your Grasp
                  </strong>
                  <p className="leading-relaxed">
                    {currentActivity.deliverablePrompt ||
                      'Explain in your own words how this mechanism guarantees stability in the Java runtime.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600">
                    Your Conceptual Answer:
                  </label>
                  <textarea
                    rows={6}
                    value={studentInput}
                    onChange={e => setStudentInput(e.target.value)}
                    placeholder="e.g. Java requires super() constructor chaining as the first statement because parent instance fields must be allocated in memory before subclass logic can reference them..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitActivity}
                  disabled={submitting || studentInput.trim().length < 5}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Comprehension...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Comprehension & Unlock Example</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 2: EXAMPLE (REFERENCE IMPLEMENTATION)                   */}
          {/* ------------------------------------------------------------- */}
          {activeStageKey === 'example' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Code viewer */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg flex flex-col">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-sans font-semibold text-slate-200">ReferenceExample.java</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentActivity.exampleCode || '')}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition text-[11px] cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-4 text-xs font-mono text-indigo-100 overflow-x-auto leading-relaxed max-h-[460px]">
                  <pre>{currentActivity.exampleCode}</pre>
                </div>
              </div>

              {/* Architectural Explanation */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm border-b border-slate-100 pb-2.5">
                  <Compass className="w-4 h-4" />
                  <span>Pattern Analysis</span>
                </div>

                <div className="prose prose-slate text-xs text-slate-700 leading-relaxed space-y-2">
                  <div className="whitespace-pre-line">
                    {currentActivity.exampleExplanation}
                  </div>
                </div>

                {currentActivity.deliverablePrompt && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs font-medium space-y-1">
                    <strong className="block text-[11px] uppercase tracking-wider text-indigo-900">
                      Observation Question:
                    </strong>
                    <p>{currentActivity.deliverablePrompt}</p>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={studentInput}
                  onChange={e => setStudentInput(e.target.value)}
                  placeholder="Record your observation or explanation here..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />

                <button
                  type="button"
                  onClick={handleSubmitActivity}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <span>Understood Example & Proceed to Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 3: PRACTICE (GUIDED DEBUGGING / CHALLENGE)              */}
          {/* ------------------------------------------------------------- */}
          {activeStageKey === 'practice' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Instructions & hints left side */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                    Challenge Instructions
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {currentActivity.instructions}
                  </p>
                </div>

                {/* Hints */}
                {currentActivity.hints && currentActivity.hints.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        Guided Hints
                      </span>
                      {showHintIndex < currentActivity.hints.length && (
                        <button
                          type="button"
                          onClick={() => setShowHintIndex(i => i + 1)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          Reveal Hint ({showHintIndex + 1}/{currentActivity.hints.length})
                        </button>
                      )}
                    </div>

                    {showHintIndex > 0 && (
                      <div className="space-y-1.5">
                        {currentActivity.hints.slice(0, showHintIndex).map((hint, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs leading-relaxed"
                          >
                            <strong>Hint {hIdx + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Test cases if available */}
                {currentActivity.testCases && currentActivity.testCases.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-800">Target Test Assertions</span>
                    {currentActivity.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 font-mono">
                        <div className="text-slate-700"><strong>Input:</strong> {tc.input}</div>
                        <div className="text-slate-700"><strong>Expected:</strong> {tc.expectedOutput}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solution Editor right side */}
              <div className="lg:col-span-7 space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg flex flex-col h-[420px]">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="text-slate-200 font-sans font-semibold">Solution.java (Fix Flaws)</span>
                    <button
                      type="button"
                      onClick={() => setCodeEditor(currentActivity.starterCode || '')}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <textarea
                    value={codeEditor}
                    onChange={e => setCodeEditor(e.target.value)}
                    className="flex-1 w-full p-4 bg-slate-950 text-indigo-100 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                    spellCheck={false}
                  />

                  <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">JDK 21 Compiler</span>
                    <button
                      type="button"
                      onClick={handleSubmitActivity}
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Fix...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Validate & Submit Fix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 4: BUILD (INTERACTIVE JAVA IDE WORKSPACE)              */}
          {/* ------------------------------------------------------------- */}
          {activeStageKey === 'build' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Build Specs Column */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex border-b border-slate-200 pb-2 text-xs font-bold gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveBuildTab('editor')}
                    className={`pb-1 border-b-2 transition ${
                      activeBuildTab === 'editor'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Instructions
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBuildTab('tests')}
                    className={`pb-1 border-b-2 transition ${
                      activeBuildTab === 'tests'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Test Suite ({currentActivity.testCases?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBuildTab('criteria')}
                    className={`pb-1 border-b-2 transition ${
                      activeBuildTab === 'criteria'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Rubric
                  </button>
                </div>

                {activeBuildTab === 'editor' && (
                  <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                    <div className="whitespace-pre-line font-sans">
                      {currentActivity.instructions}
                    </div>

                    {currentActivity.hints && currentActivity.hints.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                        <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          Architectural Hint:
                        </span>
                        <p className="text-[11px] text-amber-950">
                          {currentActivity.hints[0]}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeBuildTab === 'tests' && (
                  <div className="space-y-2.5">
                    {currentActivity.testCases?.map((tc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                        <div className="text-slate-800 font-sans font-bold text-[11px]">
                          Test #{idx + 1}: {tc.description}
                        </div>
                        <div className="text-slate-600 text-[10px]">
                          <div><strong>Input:</strong> {tc.input}</div>
                          <div><strong>Expected:</strong> {tc.expectedOutput}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeBuildTab === 'criteria' && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800">Automated Grading Criteria</span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {currentActivity.evaluationCriteria.map((crit, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Java IDE Workspace Column */}
              <div className="lg:col-span-7 space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg flex flex-col h-[440px]">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="ml-2 font-sans font-semibold text-slate-200">Solution.java</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCodeEditor(currentActivity.starterCode || '')}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Code</span>
                    </button>
                  </div>

                  <textarea
                    value={codeEditor}
                    onChange={e => setCodeEditor(e.target.value)}
                    className="flex-1 w-full p-4 bg-slate-950 text-indigo-100 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                    spellCheck={false}
                  />

                  <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      JDK 21 Runtime Environment
                    </span>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitActivity}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Compiling & Validating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Run & Validate Solution</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 5: APPLY (ENTERPRISE SCENARIO / CAPSTONE)               */}
          {/* ------------------------------------------------------------- */}
          {activeStageKey === 'apply' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Scenario Prompt */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm border-b border-slate-100 pb-2.5">
                  <Award className="w-4 h-4" />
                  <span>Real-World Enterprise Scenario</span>
                </div>

                <div className="prose prose-slate text-xs text-slate-700 leading-relaxed space-y-3">
                  <div className="whitespace-pre-line">
                    {currentActivity.instructions}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 text-xs font-medium space-y-1">
                  <strong className="block text-[11px] uppercase tracking-wider text-purple-900">
                    Capstone Deliverable:
                  </strong>
                  <p>{currentActivity.deliverablePrompt || 'Provide your complete class hierarchy and design rationale.'}</p>
                </div>
              </div>

              {/* Solution Submission Workspace */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-extrabold text-slate-900 text-sm">Your Architecture & Code Solution</span>
                  <span className="text-[11px] text-slate-400 font-mono">Multi-Class Hierarchy</span>
                </div>

                <textarea
                  rows={14}
                  value={studentInput}
                  onChange={e => setStudentInput(e.target.value)}
                  placeholder={`// Provide your class design and rationale below:
public class Person { ... }
public class Employee extends Person { ... }
public class Professor extends Employee { ... }
public class DepartmentHead extends Professor { ... }

// Explain constructor chaining and why super.calculatePay() prevents duplicate grant calculations:`}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-950 text-indigo-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 leading-relaxed"
                  spellCheck={false}
                />

                <button
                  type="button"
                  onClick={handleSubmitActivity}
                  disabled={submitting || studentInput.trim().length < 15}
                  className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Architecture Solution...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Submit Real-World Solution for AI Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* PEDAGOGICAL EVALUATION FEEDBACK BANNER                        */}
          {/* ------------------------------------------------------------- */}
          {feedback && (
            <div
              className={`p-5 rounded-2xl border shadow-xs space-y-4 transition-all duration-300 ${
                feedback.passed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-current/15 pb-3">
                <div className="flex items-center gap-2.5">
                  {feedback.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-black text-base">
                      {feedback.passed ? 'Activity Verification Passed' : 'Needs Review & Refinement'}
                    </h3>
                    <span className="text-xs font-semibold opacity-80">
                      Score: {feedback.score}/100 •{' '}
                      {feedback.adaptiveChange === 'promoted'
                        ? 'Promoted to Next Practical Stage'
                        : 'Reinforcement Recommended'}
                    </span>
                  </div>
                </div>

                {feedback.passed && (
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 self-start sm:self-auto">
                    +4% Exam Readiness
                  </span>
                )}
              </div>

              {/* Detailed pedagogical points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-white/70 border border-current/10 space-y-1">
                  <strong className="block font-bold text-emerald-800">
                    ✓ What Was Done Correctly
                  </strong>
                  <p>{feedback.whatWasDoneCorrectly}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/70 border border-current/10 space-y-1">
                  <strong className="block font-bold text-amber-800">
                    💡 What Needs Improvement
                  </strong>
                  <p>{feedback.whatNeedsImprovement}</p>
                </div>
              </div>

              {feedback.mistakesExplanation && (
                <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-red-950 text-xs leading-relaxed">
                  <strong>Mistake Breakdown: </strong>
                  <span>{feedback.mistakesExplanation}</span>
                </div>
              )}

              {feedback.compilerOutput && (
                <div className="rounded-xl bg-slate-900 text-slate-200 p-3 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  <pre>{feedback.compilerOutput}</pre>
                </div>
              )}

              {/* Recommended Next Step */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-current/15">
                <div className="text-xs font-medium">
                  <strong>Recommended Next Step: </strong>
                  <span>{feedback.recommendedNextStep}</span>
                </div>

                <div className="flex items-center gap-2">
                  {feedback.passed && activeStageKey !== 'apply' && (
                    <button
                      type="button"
                      onClick={handleAdvanceToNextStage}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <span>Proceed to Next Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {feedback.nextAction && (
                    <button
                      type="button"
                      onClick={() => {
                        if (feedback.nextAction?.actionType === 'quiz') {
                          setSelectedQuizTopic(feedback.nextAction.targetTopic || 'inheritance');
                          setCurrentView('assessments');
                        } else if (feedback.nextAction?.actionType === 'learn') {
                          setActiveTutorTopic(feedback.nextAction.targetTopic || 'Inheritance');
                          setCurrentView('tutor');
                        } else {
                          handleAdvanceToNextStage();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <span>{feedback.nextAction.buttonLabel || 'Next Best Action'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
