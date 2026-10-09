import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, HelpCircle, Loader2, Brain, Check, X, RefreshCw } from 'lucide-react';
import { WaitingGameActivity, getWaitingGame } from '../data/waitingLearningActivities';

interface WaitingLearningGameProps {
  courseId?: string;
  topic?: string;
  onAnswerSelected?: (isCorrect: boolean, activity: WaitingGameActivity) => void;
}

export const WaitingLearningGame: React.FC<WaitingLearningGameProps> = ({
  courseId,
  topic,
  onAnswerSelected
}) => {
  const [activity, setActivity] = useState<WaitingGameActivity>(() => getWaitingGame(courseId, topic));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setActivity(getWaitingGame(courseId, topic));
    setSelectedOption(null);
    setIsAnswered(false);
  }, [courseId, topic]);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === activity.correctAnswer;
    if (onAnswerSelected) {
      onAnswerSelected(isCorrect, activity);
    }
  };

  const isCorrect = selectedOption === activity.correctAnswer;

  return (
    <div className="bg-gradient-to-br from-indigo-900/95 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-lg space-y-3.5 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>While LEADENT AI prepares your answer...</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-indigo-950/80 border border-indigo-700/50 px-2 py-0.5 rounded-full text-indigo-200 font-semibold">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Quick Challenge</span>
        </div>
      </div>

      {/* 2. Question Content */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
          {activity.question}
        </p>

        {/* Optional code snippet */}
        {activity.codeSnippet && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
            <code>{activity.codeSnippet}</code>
          </div>
        )}
      </div>

      {/* 3. Interactive Choice Options */}
      {activity.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {activity.options.map((opt, idx) => {
            const isThisSelected = selectedOption === idx;
            const isThisCorrect = idx === activity.correctAnswer;

            let buttonStyle = 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/80';
            if (isAnswered) {
              if (isThisCorrect) {
                buttonStyle = 'bg-emerald-600/90 text-white border-emerald-400 font-bold shadow-xs';
              } else if (isThisSelected && !isThisCorrect) {
                buttonStyle = 'bg-rose-900/70 text-rose-200 border-rose-600/80';
              } else {
                buttonStyle = 'bg-slate-900/50 text-slate-500 border-slate-800/60 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full p-2.5 rounded-xl text-xs text-left border font-medium transition flex items-center justify-between gap-2 cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-lg bg-black/30 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="truncate">{opt}</span>
                </div>

                {isAnswered && isThisCorrect && (
                  <Check className="w-4 h-4 text-white shrink-0" />
                )}
                {isAnswered && isThisSelected && !isThisCorrect && (
                  <X className="w-4 h-4 text-rose-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Feedback Explanation if Answered */}
      {isAnswered && (
        <div className={`p-2.5 rounded-xl text-xs border flex items-start gap-2 animate-in fade-in duration-150 ${
          isCorrect
            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/70 border-amber-500/40 text-amber-200'
        }`}>
          {isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">
              {isCorrect ? '✓ Correct! Well done.' : '💡 Insight:'}
            </span>
            <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
              {activity.explanation}
            </p>
          </div>
        </div>
      )}

      {/* 5. Live Processing Status */}
      <div className="flex items-center justify-between pt-1 border-t border-indigo-900/60 text-[11px] text-indigo-300/80">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Your AI Tutor response is being prepared...</span>
        </div>
      </div>
    </div>
  );
};
