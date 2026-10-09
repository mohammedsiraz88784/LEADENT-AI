import React, { useState } from 'react';
import {
  Edit3,
  CheckCircle2,
  X,
  Code2,
  Sparkles,
  Send,
  Lightbulb,
  ArrowRight,
  Terminal
} from 'lucide-react';

interface TryFirstDrawerProps {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitAttempt: (attemptText: string, codeSnippet?: string) => void;
}

export const TryFirstDrawer: React.FC<TryFirstDrawerProps> = ({
  topic,
  isOpen,
  onClose,
  onSubmitAttempt
}) => {
  const [attemptText, setAttemptText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'code' | 'both'>('text');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attemptText.trim() && !codeSnippet.trim()) return;

    const formattedPrompt = attemptText.trim()
      ? `Here is my attempt for ${topic}:\n\n${attemptText.trim()}\n\nPlease evaluate what I got right, where my misconceptions might be, and how to improve.`
      : `Here is my code attempt for ${topic}. Please review my implementation and give constructive feedback on correctness and edge cases.`;

    onSubmitAttempt(formattedPrompt, codeSnippet.trim() || undefined);
    setAttemptText('');
    setCodeSnippet('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Edit3 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-100 border border-emerald-400/30">
                  Productive Learning
                </span>
                <span className="text-xs text-emerald-200">Topic: {topic}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold">Let Me Try First</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Productive encouragement banner */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>The best way to build mastery:</strong> Write down your initial thought process, draft, or code. LEADENT AI will evaluate your attempt and provide targeted feedback!
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Format selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Written / Conceptual Attempt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Attempt</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Both (Explanation + Code)
            </button>
          </div>

          {/* Text input */}
          {(activeTab === 'text' || activeTab === 'both') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>My Understanding / Steps for {topic}:</span>
                <span className="text-[11px] font-normal text-slate-400">Explain your thought process</span>
              </label>
              <textarea
                value={attemptText}
                onChange={e => setAttemptText(e.target.value)}
                rows={4}
                placeholder={`Example: For ${topic}, my understanding is that we first need to...\n1. Step one is...\n2. Then we check for edge cases like...`}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Code input */}
          {(activeTab === 'code' || activeTab === 'both') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono text-emerald-800">
                  <Terminal className="w-3.5 h-3.5" />
                  My Code Attempt:
                </span>
                <span className="text-[11px] font-normal text-slate-400">Java / Algorithm logic</span>
              </label>
              <textarea
                value={codeSnippet}
                onChange={e => setCodeSnippet(e.target.value)}
                rows={5}
                placeholder={`// Write or paste your attempt here...\npublic class MySolution {\n    public void solve() {\n        // My logic...\n    }\n}`}
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-950 text-emerald-300 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Tips */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Tips for a great attempt:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[11px]">
              <li>Don't worry about being 100% correct — making mistakes is how learning happens.</li>
              <li>Mention any specific edge cases or lines you are unsure about.</li>
              <li>The tutor will evaluate what was correct and guide you on the rest!</li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!attemptText.trim() && !codeSnippet.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>Submit for AI Review</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
