import React, { useState } from 'react';
import { Copy, Check, Code2, ExternalLink } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

interface TutorMarkdownProps {
  content: string;
  topic?: string;
}

export const TutorMarkdown: React.FC<TutorMarkdownProps> = ({ content, topic }) => {
  const { setSelectedPracticeTopic, setCurrentView } = useLearning();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendToIDE = (codeText: string) => {
    if (topic) {
      setSelectedPracticeTopic(topic.toLowerCase().replace(/\s+/g, '-'));
    }
    setCurrentView('practice');
  };

  // Split content by triple backticks for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  const renderInlineFormatted = (text: string) => {
    // Process bold, inline code, italics
    const inlineParts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return inlineParts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-200 text-indigo-900 font-mono text-[11px] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const renderParagraphOrList = (rawText: string, blockIdx: number) => {
    const lines = rawText.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={`${blockIdx}_${lineIdx}`} className="h-2" />;
      }

      // Headers (### or ####)
      if (trimmed.startsWith('#### ')) {
        return (
          <h5
            key={`${blockIdx}_${lineIdx}`}
            className="font-bold text-slate-900 text-xs sm:text-sm mt-3 mb-1 text-indigo-950 flex items-center gap-1.5"
          >
            {renderInlineFormatted(trimmed.replace(/^####\s*/, ''))}
          </h5>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4
            key={`${blockIdx}_${lineIdx}`}
            className="font-bold text-slate-900 text-sm sm:text-base mt-3.5 mb-1.5 text-indigo-900 border-b border-slate-100 pb-1"
          >
            {renderInlineFormatted(trimmed.replace(/^###\s*/, ''))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3
            key={`${blockIdx}_${lineIdx}`}
            className="font-extrabold text-slate-900 text-base sm:text-lg mt-4 mb-2 text-indigo-950"
          >
            {renderInlineFormatted(trimmed.replace(/^##\s*/, ''))}
          </h3>
        );
      }

      // Blockquotes (> )
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={`${blockIdx}_${lineIdx}`}
            className="border-l-4 border-indigo-400 bg-indigo-50/50 pl-3 py-1.5 my-2 rounded-r text-xs text-indigo-900 italic font-medium"
          >
            {renderInlineFormatted(trimmed.replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // Bullet items (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={`${blockIdx}_${lineIdx}`} className="flex items-start gap-2 my-1 pl-1 text-xs sm:text-sm leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span className="text-slate-700 flex-1">
              {renderInlineFormatted(trimmed.replace(/^[-*]\s*/, ''))}
            </span>
          </div>
        );
      }

      // Numbered items (1. 2. etc)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={`${blockIdx}_${lineIdx}`} className="flex items-start gap-2 my-1 pl-1 text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-indigo-700 text-xs shrink-0 mt-0.5 min-w-4 text-right">
              {numMatch[1]}.
            </span>
            <span className="text-slate-700 flex-1">
              {renderInlineFormatted(numMatch[2])}
            </span>
          </div>
        );
      }

      // Standard text line
      return (
        <p key={`${blockIdx}_${lineIdx}`} className="my-1.5 text-xs sm:text-sm leading-relaxed text-slate-800">
          {renderInlineFormatted(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-1.5">
      {parts.map((part, partIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const firstLineBreak = part.indexOf('\n');
          const lang = firstLineBreak !== -1 ? part.slice(3, firstLineBreak).trim() : 'java';
          const codeContent =
            firstLineBreak !== -1 ? part.slice(firstLineBreak + 1, -3).trim() : part.slice(3, -3).trim();

          const codeLines = codeContent.split('\n');

          return (
            <div
              key={partIdx}
              className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md"
            >
              {/* Code block bar */}
              <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-400 ml-1">
                    {lang || 'JAVA'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(codeContent, partIdx)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition cursor-pointer"
                    title="Copy snippet"
                  >
                    {copiedIndex === partIdx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendToIDE(codeContent)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition cursor-pointer shadow-xs"
                    title="Open in Practice IDE"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Open in IDE</span>
                  </button>
                </div>
              </div>

              {/* Code lines */}
              <div className="p-3.5 overflow-x-auto font-mono text-[11px] sm:text-xs leading-relaxed max-h-96">
                <table className="w-full border-collapse">
                  <tbody>
                    {codeLines.map((line, lIdx) => (
                      <tr key={lIdx} className="hover:bg-slate-900/50">
                        <td className="pr-4 select-none text-slate-600 text-right text-[10px] w-6 align-top">
                          {lIdx + 1}
                        </td>
                        <td className="whitespace-pre text-emerald-300 font-mono">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return <div key={partIdx}>{renderParagraphOrList(part, partIdx)}</div>;
      })}
    </div>
  );
};
