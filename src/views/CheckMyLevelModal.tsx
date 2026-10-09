import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Code2,
  HelpCircle,
  Check,
  ListChecks,
  Target,
  LayoutDashboard,
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamiliarityLevel, DiagnosticAssessment, KnowledgeMap, StudentLearningState } from '../types';
import { api } from '../services/api';
import { useLearning } from '../context/LearningContext';

export const CheckMyLevelModal: React.FC = () => {
  const {
    isCheckLevelOpen,
    closeCheckLevelModal,
    initialFamiliarityChoice,
    activeCourseId,
    activeCourse,
    setKnowledgeMap,
    setLearningPlan,
    setLearningState,
    setCurrentView,
    triggerNextBestAction
  } = useLearning();

  const [step, setStep] = useState<'select_level' | 'taking_test' | 'review_summary' | 'results'>('select_level');
  const [familiarity, setFamiliarity] = useState<FamiliarityLevel>(initialFamiliarityChoice || 'familiar');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<DiagnosticAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evalResult, setEvalResult] = useState<{
    knowledgeMap: KnowledgeMap;
    overallLevel: string;
    learningState: StudentLearningState;
    nextAction: any;
  } | null>(null);

  // Sync initial familiarity if passed
  useEffect(() => {
    if (initialFamiliarityChoice) {
      setFamiliarity(initialFamiliarityChoice);
    }
  }, [initialFamiliarityChoice]);

  // Reset modal state when closed/opened
  useEffect(() => {
    if (isCheckLevelOpen) {
      setStep('select_level');
      setAnswers({});
      setCurrentQuestionIndex(0);
      setEvalResult(null);
    }
  }, [isCheckLevelOpen]);

  if (!isCheckLevelOpen) return null;

  const handleStartDiagnostic = async (chosenFamiliarity?: FamiliarityLevel) => {
    const fam = chosenFamiliarity || familiarity;
    setFamiliarity(fam);
    setLoading(true);
    try {
      const res = await api.diagnostic.generate(activeCourseId, fam);
      setAssessment(res.assessment);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setStep('taking_test');
    } catch (err) {
      console.error('Failed to start diagnostic test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitDiagnostic = async () => {
    if (!assessment) return;
    setLoading(true);
    try {
      const res = await api.diagnostic.submit(activeCourseId, familiarity, assessment.questions, answers);
      setKnowledgeMap(res.knowledgeMap);
      setLearningPlan(res.learningPlan);
      setLearningState(res.learningState);
      setEvalResult({
        knowledgeMap: res.knowledgeMap,
        overallLevel: res.learningState.overallLevel,
        learningState: res.learningState,
        nextAction: res.learningState.nextBestAction
      });
      setStep('results');

      // Trigger celebratory confetti on diagnostic completion
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to submit diagnostic assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = assessment?.questions.length || 0;
  const answeredCount = Object.keys(answers).length;
  const currentQ = assessment?.questions[currentQuestionIndex];
  const isLastQuestion = assessment ? currentQuestionIndex === totalQuestions - 1 : false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {step === 'select_level' && 'CHECK MY LEVEL'}
                {step === 'taking_test' && 'AI Diagnostic Assessment'}
                {step === 'review_summary' && 'Review Assessment Answers'}
                {step === 'results' && 'Your LEADENT Knowledge Map'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeCourse?.title || 'Java Programming'} • Academic Level Calibration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheckLevelModal}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* STEP 1: Select Familiarity Level */}
          {step === 'select_level' && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Let's understand your current level
                </h1>
                <h3 className="text-sm font-semibold text-slate-600">
                  How familiar are you with this course?
                </h3>
              </div>

              {/* 3 Tier Options */}
              <div className="space-y-3">
                {/* 🟢 I'm New */}
                <div
                  onClick={() => setFamiliarity('new')}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                    familiarity === 'new'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full mt-0.5 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                    {familiarity === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">🟢 I'm New</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Beginner
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">
                      "I have little or no knowledge of this course."
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Recommended starting level: Beginner • Starting topic: Topic 1: Variables & Data Types
                    </p>
                  </div>
                </div>

                {/* 🟡 I'm Familiar */}
                <div
                  onClick={() => setFamiliarity('familiar')}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                    familiarity === 'familiar'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full mt-0.5 border-2 border-amber-500 flex items-center justify-center shrink-0">
                    {familiarity === 'familiar' && <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">🟡 I'm Familiar</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">
                      "I understand some concepts but need structured learning."
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      10-12 questions testing Variables, Loops, OOP basics, Inheritance, and Exceptions.
                    </p>
                  </div>
                </div>

                {/* 🔵 I'm Well Versed */}
                <div
                  onClick={() => setFamiliarity('well_versed')}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                    familiarity === 'well_versed'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full mt-0.5 border-2 border-blue-600 flex items-center justify-center shrink-0">
                    {familiarity === 'well_versed' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">🔵 I'm Well Versed</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        Advanced
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">
                      "I already have strong knowledge and want to improve and validate my skills."
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Assessment tests Polymorphism, Interfaces, Abstract Classes, Collections, and OOP Design.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explanatory notes to the student */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>How LEADENT AI calibrates your learning path:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1 pl-1">
                  <li>This helps LEADENT AI set an initial baseline.</li>
                  <li>Next, you will take a quick adaptive diagnostic assessment.</li>
                  <li>We will pinpoint your exact knowledge gaps and calibrate your Knowledge Map.</li>
                </ul>
              </div>

              {/* Start Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStartDiagnostic()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini is generating diagnostic questions...</span>
                  </>
                ) : (
                  <>
                    <span>Start AI Diagnostic Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Taking the Diagnostic Test */}
          {step === 'taking_test' && assessment && currentQ && (
            <div className="space-y-5">
              {/* Progress bar and Quick Navigation bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="font-bold text-slate-800">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Topic: {currentQ.topic || currentQ.topicTitle}
                    </span>
                    {currentQ.difficulty && (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        currentQ.difficulty === 'beginner' || currentQ.difficulty === 'easy'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : currentQ.difficulty === 'intermediate' || currentQ.difficulty === 'medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {currentQ.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
                    }}
                  />
                </div>

                {/* Question jumping palette */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {assessment.questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                  <span className="text-[11px] text-slate-400 pl-2 font-medium shrink-0">
                    {answeredCount}/{totalQuestions} Answered
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {currentQ.type === 'code_output'
                      ? 'Code Output Prediction'
                      : currentQ.type === 'true_false'
                      ? 'True / False'
                      : currentQ.type === 'short_answer'
                      ? 'Short Answer / Keyword'
                      : 'Multiple Choice'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug whitespace-pre-line">
                  {currentQ.question}
                </h3>

                {/* Optional code snippet */}
                {currentQ.codeSnippet && (
                  <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                    <pre>{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options */}
              {currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = answers[currentQ.id] === option;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQ.id, option)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                        }`}
                      >
                        <span className="pr-2">{option}</span>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={e => handleSelectAnswer(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(i => i - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('review_summary')}
                    className="px-3.5 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Review All ({answeredCount}/{totalQuestions})</span>
                  </button>

                  {isLastQuestion ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSubmitDiagnostic}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Assessment</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(i => i + 1)}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2.5: Review Summary Before Submitting */}
          {step === 'review_summary' && assessment && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Review Your Answers</h3>
                  <p className="text-xs text-slate-500">
                    You have answered {answeredCount} of {totalQuestions} questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('taking_test')}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Return to Test
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {assessment.questions.map((q, idx) => {
                  const hasAnswer = answers[q.id] !== undefined;
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setStep('taking_test');
                      }}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                        hasAnswer
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          : 'border-amber-300 bg-amber-50/60 hover:bg-amber-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 max-w-[80%]">
                        <span className="font-bold text-slate-700 shrink-0">#{idx + 1}</span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-900">{q.topic || q.topicTitle}: </span>
                          <span className="text-slate-600">{q.question}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hasAnswer ? 'Answered' : 'Unanswered'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('taking_test')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Keep Answering
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitDiagnostic}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Diagnostic Assessment ({answeredCount}/{totalQuestions})</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Knowledge Map & Evaluation Results */}
          {step === 'results' && evalResult && (
            <div className="space-y-6">
              {/* Header result banner */}
              <div className="text-center max-w-lg mx-auto space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Academic Level Calibrated
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Your LEADENT Knowledge Map
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <span>Current Level:</span>
                  <span className="text-indigo-600 font-extrabold text-sm uppercase">
                    {evalResult.overallLevel}
                  </span>
                  {evalResult.knowledgeMap.overallScore !== undefined && (
                    <span className="text-slate-500 font-normal">
                      • Score: {evalResult.knowledgeMap.overallScore}%
                    </span>
                  )}
                </div>
                {evalResult.knowledgeMap.levelExplanation && (
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {evalResult.knowledgeMap.levelExplanation}
                  </p>
                )}
              </div>

              {/* Topic Mastery Progress Bars */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center border-b border-slate-200">
                  <span>Topic Mastery & Proficiency</span>
                  <span className="text-slate-400 font-normal">Status</span>
                </div>
                <div className="p-4 space-y-3 divide-y divide-slate-100">
                  {evalResult.knowledgeMap.topicMastery ? (
                    Object.entries(evalResult.knowledgeMap.topicMastery).map(([topic, rawMastery]) => {
                      const mastery = Number(rawMastery) || 0;
                      const status =
                        mastery >= 80
                          ? { label: 'Mastered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' }
                          : mastery >= 60
                          ? { label: 'Proficient', color: 'text-blue-700 bg-blue-50 border-blue-200', bar: 'bg-blue-500' }
                          : mastery >= 40
                          ? { label: 'Needs Practice', color: 'text-amber-700 bg-amber-50 border-amber-200', bar: 'bg-amber-500' }
                          : { label: 'Needs Learning', color: 'text-rose-700 bg-rose-50 border-rose-200', bar: 'bg-rose-500' };

                      return (
                        <div key={topic} className="pt-2.5 first:pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 capitalize">
                              {topic.replace('-', ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-600 font-bold text-[11px]">
                                {mastery}%
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`${status.bar} h-1.5 rounded-full transition-all duration-500`}
                              style={{ width: `${mastery}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    Object.entries(evalResult.knowledgeMap.topicProficiencies).map(([topic, prof]) => {
                      const profKey = String(prof);
                      const colorMap: Record<string, string> = {
                        Strong: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                        Moderate: 'text-blue-700 bg-blue-50 border-blue-200',
                        Weak: 'text-amber-700 bg-amber-50 border-amber-200',
                        Beginner: 'text-slate-600 bg-slate-100 border-slate-200'
                      };
                      return (
                        <div key={topic} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 capitalize">
                            {topic.replace('-', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorMap[profKey] || colorMap.Beginner}`}>
                            {profKey}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Insights: Strong, Areas to Improve, Knowledge Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Strong Areas
                  </span>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                    {evalResult.knowledgeMap.strongAreas.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Knowledge Gaps Identified
                  </span>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                    {evalResult.knowledgeMap.knowledgeGaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Starting Point Callout */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                    Recommended Starting Point
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-indigo-950">
                  {evalResult.knowledgeMap.recommendedStartingPoint}
                </h4>
                {evalResult.knowledgeMap.recommendedStartingWhy ? (
                  <p className="text-xs text-indigo-900/90 leading-relaxed">
                    <strong className="text-indigo-950">Why:</strong> {evalResult.knowledgeMap.recommendedStartingWhy}
                  </p>
                ) : (
                  <p className="text-xs text-indigo-800/80 mt-0.5">
                    Your personalized plan has been calibrated around this priority.
                  </p>
                )}
              </div>

              {/* 🎯 Next Best Action Card inside Modal */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Calibrated Next Best Action
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ~{evalResult.nextAction?.estimatedMinutes || 20} min
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {evalResult.nextAction?.title || 'Study Topic: Inheritance'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {evalResult.nextAction?.actionText || 'Review core inheritance mechanics and start practice.'}
                  </p>
                </div>

                <div className="text-xs text-indigo-200/90 flex items-start gap-1.5 bg-white/5 p-2 rounded-lg border border-white/10">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo-300">Why:</strong> {evalResult.nextAction?.reason || 'This is where your first major conceptual gap appears.'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeCheckLevelModal();
                    triggerNextBestAction();
                  }}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCheckLevelModal();
                    setCurrentView('dashboard');
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
