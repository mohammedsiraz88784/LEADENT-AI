import React from 'react';
import { CheckCircle2, AlertCircle, TrendingUp, BookOpen, Award } from 'lucide-react';
import { TutorEvaluation } from '../types';

interface TutorEvaluationCardProps {
  evaluation: TutorEvaluation;
}

export const TutorEvaluationCard: React.FC<TutorEvaluationCardProps> = ({ evaluation }) => {
  const getRatingStyle = (rating?: string) => {
    switch (rating) {
      case 'Correct':
        return {
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          border: 'border-emerald-200',
          gradient: 'from-emerald-50/70 to-white'
        };
      case 'Partially Correct':
        return {
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          border: 'border-amber-200',
          gradient: 'from-amber-50/70 to-white'
        };
      case 'Needs Review':
      default:
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          border: 'border-rose-200',
          gradient: 'from-rose-50/70 to-white'
        };
    }
  };

  const style = getRatingStyle(evaluation.rating);

  return (
    <div className={`mt-3 rounded-xl border ${style.border} bg-gradient-to-b ${style.gradient} p-4 shadow-xs space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Academic Assessment of Your Answer
          </span>
        </div>
        {evaluation.rating && (
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}>
            {evaluation.rating}
          </span>
        )}
      </div>

      {/* 4 Pillars of Pedagogical Evaluation */}
      <div className="space-y-2.5 text-xs">
        {evaluation.whatWasCorrect && (
          <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block mb-0.5">What Was Correct:</span>
              <p className="text-slate-700 leading-relaxed">{evaluation.whatWasCorrect}</p>
            </div>
          </div>
        )}

        {evaluation.whatWasMissing && (
          <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-amber-100 text-slate-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block mb-0.5">What Was Missing:</span>
              <p className="text-slate-700 leading-relaxed">{evaluation.whatWasMissing}</p>
            </div>
          </div>
        )}

        {evaluation.whatCouldBeImproved && (
          <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-indigo-100 text-slate-800">
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900 block mb-0.5">What Could Be Improved:</span>
              <p className="text-slate-700 leading-relaxed">{evaluation.whatCouldBeImproved}</p>
            </div>
          </div>
        )}

        {evaluation.suggestedImprovedUnderstanding && (
          <div className="flex items-start gap-2 bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-200 text-slate-800">
            <BookOpen className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-950 block mb-0.5">Recommended Academic Takeaway:</span>
              <p className="text-indigo-900 leading-relaxed font-medium">
                {evaluation.suggestedImprovedUnderstanding}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
