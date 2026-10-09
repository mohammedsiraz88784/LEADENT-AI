import React from 'react';
import {
  AlertTriangle,
  Lightbulb,
  FileCode,
  HelpCircle,
  CheckCircle2,
  Code2,
  ArrowRight,
  Sparkles,
  Layers,
  Bug,
  BookOpen,
  Edit3
} from 'lucide-react';
import { ProductiveIntervention, ProductiveInterventionAction, TutorMode } from '../types';

interface ProductiveInterventionCardProps {
  intervention: ProductiveIntervention;
  onSelectAction: (action: ProductiveInterventionAction) => void;
  onOpenTryFirst?: (topic?: string) => void;
}

export const ProductiveInterventionCard: React.FC<ProductiveInterventionCardProps> = ({
  intervention,
  onSelectAction,
  onOpenTryFirst
}) => {
  const getActionIcon = (iconType?: string) => {
    switch (iconType) {
      case 'hint':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'explain':
        return <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />;
      case 'example':
        return <FileCode className="w-3.5 h-3.5 text-blue-600" />;
      case 'guided':
        return <Layers className="w-3.5 h-3.5 text-purple-600" />;
      case 'review':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'try_first':
        return <Edit3 className="w-3.5 h-3.5 text-emerald-700" />;
      case 'debug':
        return <Bug className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getActionStyles = (action: ProductiveInterventionAction) => {
    if (action.mode === 'try_first') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold';
    }
    if (action.mode === 'review_attempt') {
      return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
    }
    if (action.mode === 'hint') {
      return 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 font-semibold';
    }
    return 'bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border-slate-200 hover:border-indigo-200 font-medium';
  };

  return (
    <div className="my-3 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-4 sm:p-5 shadow-xs space-y-3.5 text-slate-800">
      {/* 1. Header Banner */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
              Productive AI Guidance
            </span>
            {intervention.topic && (
              <span className="text-xs font-semibold text-slate-600">
                Topic: <strong className="text-slate-900">{intervention.topic}</strong>
              </span>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
            {intervention.title || "Learn with AI, don't just submit with AI"}
          </h4>
        </div>
      </div>

      {/* 2. Educational Intervention Message & Disadvantages */}
      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/90 rounded-xl p-3.5 border border-amber-200/70 space-y-2">
        <p className="font-semibold text-slate-800">
          {intervention.message ||
            'Completely relying on AI may save time now, but it can reduce your independent mastery.'}
        </p>
        <div className="text-xs space-y-1 text-slate-600 pt-1 border-t border-amber-100">
          <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            Relying solely on AI can lead to:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] list-disc list-inside text-slate-600">
            <li>Reduced independent thinking</li>
            <li>Poor understanding of the concept</li>
            <li>Difficulty solving similar questions in exams</li>
            <li>Less problem-solving confidence</li>
            <li>Reduced ability to debug your own mistakes</li>
            <li>Difficulty remembering the concept long-term</li>
          </ul>
        </div>
      </div>

      {/* 3. The Productive Learning Cycle Workflow */}
      <div className="rounded-xl bg-indigo-950 text-white p-3 sm:p-3.5 space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          The Productive Learning Cycle
        </div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold gap-1 overflow-x-auto py-1">
          <span className="px-2 py-1 rounded bg-indigo-900 text-indigo-200 shrink-0">THINK</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="px-2 py-1 rounded bg-emerald-900 text-emerald-200 shrink-0 border border-emerald-700/60">ATTEMPT</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="px-2 py-1 rounded bg-indigo-900 text-indigo-200 shrink-0">ASK AI</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="px-2 py-1 rounded bg-indigo-900 text-indigo-200 shrink-0">UNDERSTAND</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="px-2 py-1 rounded bg-indigo-900 text-indigo-200 shrink-0">IMPROVE</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="px-2 py-1 rounded bg-emerald-900 text-emerald-200 shrink-0 border border-emerald-700/60">APPLY</span>
        </div>
      </div>

      {/* 4. Productive Action Alternatives */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>Choose a productive way to proceed with {intervention.topic || 'this topic'}:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {intervention.suggestedActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (action.mode === 'try_first' && onOpenTryFirst) {
                  onOpenTryFirst(intervention.topic);
                } else {
                  onSelectAction(action);
                }
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition cursor-pointer group ${getActionStyles(
                action
              )}`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-white/80 shrink-0 shadow-2xs">
                  {getActionIcon(action.iconType)}
                </span>
                <span>{action.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
