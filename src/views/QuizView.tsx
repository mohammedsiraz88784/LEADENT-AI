import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Target,
  Loader2,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizResult } from '../types';
import { api } from '../services/api';
import { useLearning } from '../context/LearningContext';

export const QuizView: React.FC = () => {
  const {
    selectedQuizTopic,
    setSelectedQuizTopic,
    activeCourseId,
    setLearningState,
    setCurrentView,
    setSelectedPracticeTopic,
    openCheckLevelModal
  } = useLearning();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      setResult(null);
      setAnswers({});
      try {
        const res = await api.quiz.get(selectedQuizTopic || 'inheritance', activeCourseId);
        setQuiz(res.quiz);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [selectedQuizTopic, activeCourseId]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (result) return; // locked once submitted
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await api.quiz.submit(quiz, answers, activeCourseId);
      setResult(res.result);
      if (res.state) {
        setLearningState(res.state);
      }

      if (res.result.passed) {
        try {
          confetti({
            particleCount: 65,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Targeted Academic Assessment
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Topic: <strong className="text-slate-800">{quiz?.topicTitle || selectedQuizTopic}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {quiz?.title || 'Knowledge Evaluation Quiz'}
          </h1>
        </div>

        {/* Topic Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedQuizTopic}
            onChange={e => setSelectedQuizTopic(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400"
          >
            <option value="inheritance">Inheritance & super</option>
            <option value="oop">OOP & Encapsulation</option>
            <option value="fundamentals">Fundamentals & Loops</option>
            <option value="interfaces">Interfaces & Abstraction</option>
            <option value="polymorphism">Polymorphism</option>
          </select>

          <button
            type="button"
            onClick={() => openCheckLevelModal()}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full Diagnostic</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Generating structured questions with Gemini...</span>
        </div>
      ) : quiz ? (
        <div className="space-y-6">
          {/* Result Banner if already submitted */}
          {result && (
            <div
              className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                result.passed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base ${
                      result.passed ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  >
                    {result.percentage}%
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {result.passed ? 'Quiz Passed - Mastery Validated!' : 'Review Recommended'}
                    </h3>
                    <p className="text-xs opacity-90">
                      Score: {result.score} of {result.totalQuestions} questions correct
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/70 border border-current/20">
                  Topic State: {result.passed ? 'Advanced to Strong' : 'Requires Practice'}
                </div>
              </div>

              {/* Dynamic NEXT BEST ACTION Box */}
              {result.nextAction && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      Dynamic Next Best Action
                    </span>
                    <span className="text-xs text-slate-400">
                      ~{result.nextAction.estimatedMinutes} min
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {result.nextAction.title}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {result.nextAction.actionText}
                  </p>
                  <p className="text-[11px] text-indigo-200/90 font-medium">
                    Why: {result.nextAction.reason}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (result.nextAction.actionType === 'practice') {
                          setSelectedPracticeTopic(result.nextAction.targetTopic.toLowerCase() || 'inheritance');
                          setCurrentView('practice');
                        } else {
                          setCurrentView('tutor');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>{result.nextAction.buttonLabel || 'Launch Next Best Action'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question List */}
          <div className="space-y-5">
            {quiz.questions.map((q, qIndex) => {
              const selectedAnswer = answers[q.id];
              const isSubmitted = Boolean(result);
              const isCorrect = isSubmitted && selectedAnswer === q.correctAnswer;
              const isWrong = isSubmitted && selectedAnswer && selectedAnswer !== q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs space-y-4 transition ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-200'
                        : isWrong
                        ? 'border-rose-200'
                        : 'border-slate-200'
                      : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    {isSubmitted && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <X className="w-3 h-3" /> Missed
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Code snippet if present */}
                  {q.codeSnippet && (
                    <div className="rounded-xl bg-slate-900 text-slate-200 p-3 font-mono text-xs overflow-x-auto border border-slate-800">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Options */}
                  {q.options && (
                    <div className="space-y-2 pt-1">
                      {q.options.map((option, optIdx) => {
                        const isChosen = selectedAnswer === option;
                        const isTheCorrectOne = isSubmitted && option === q.correctAnswer;

                        let buttonStyles = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

                        if (isSubmitted) {
                          if (isTheCorrectOne) {
                            buttonStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                          } else if (isChosen && !isTheCorrectOne) {
                            buttonStyles = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                          } else {
                            buttonStyles = 'border-slate-100 text-slate-400 bg-slate-50/50';
                          }
                        } else if (isChosen) {
                          buttonStyles = 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-2xs';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectAnswer(q.id, option)}
                            className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${buttonStyles}`}
                          >
                            <span>{option}</span>
                            {isChosen && !isSubmitted && <Check className="w-4 h-4 text-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation after submission */}
                  {isSubmitted && q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <strong className="text-slate-800">Academic Explanation: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!result && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={submitting || Object.keys(answers).length === 0}
                onClick={handleSubmitQuiz}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading & Generating Next Best Action...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Quiz</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
