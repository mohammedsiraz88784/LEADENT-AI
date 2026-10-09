import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Search,
  X,
  Sparkles,
  BookOpen,
  Code2,
  Award,
  Bot,
  ArrowRight,
  Loader2,
  Globe
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { ttsService } from '../services/ttsService';
import { SUPPORTED_VOICE_LANGUAGES } from './VoiceAssistantButton';

export interface GlobalVoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteTutorQuery?: (query: string) => void;
}

export const GlobalVoiceSearchModal: React.FC<GlobalVoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onExecuteTutorQuery
}) => {
  const { courses, activeCourse, switchActiveCourse, setCurrentView, setSelectedPracticeTopic } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [detectedAction, setDetectedAction] = useState<{
    type: 'tutor' | 'practice' | 'quiz' | 'course';
    label: string;
    topicName?: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startVoiceListening();
    } else {
      stopVoiceListening();
      setSearchQuery('');
      setDetectedAction(null);
    }
    return () => {
      stopVoiceListening();
    };
  }, [isOpen]);

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const startVoiceListening = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        ttsService.playChime('mic_start');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const trimmed = transcript.trim();
        setSearchQuery(trimmed);
        analyzeQueryIntent(trimmed);
      };

      recognition.onend = () => {
        setIsListening(false);
        ttsService.playChime('mic_stop');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const analyzeQueryIntent = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.startsWith('quiz') || lower.includes('test') || lower.includes('exam')) {
      setDetectedAction({
        type: 'quiz',
        label: 'Take Adaptive Quiz',
        topicName: text.replace(/quiz|test|exam|on|for/gi, '').trim()
      });
    } else if (lower.startsWith('practice') || lower.startsWith('code') || lower.includes('ide') || lower.includes('program')) {
      setDetectedAction({
        type: 'practice',
        label: 'Practice in IDE',
        topicName: text.replace(/practice|code|in ide|program/gi, '').trim()
      });
    } else if (lower.startsWith('course') || lower.includes('syllabus') || lower.includes('curriculum')) {
      setDetectedAction({
        type: 'course',
        label: 'Browse Curriculum & Syllabus',
        topicName: text.replace(/course|syllabus|curriculum/gi, '').trim()
      });
    } else if (lower.length > 0) {
      setDetectedAction({
        type: 'tutor',
        label: 'Ask AI Tutor Grounded Response',
        topicName: text
      });
    } else {
      setDetectedAction(null);
    }
  };

  const handleExecute = (actionType?: string) => {
    const act = actionType || detectedAction?.type || 'tutor';
    const query = searchQuery.trim();

    onClose();

    if (act === 'quiz') {
      setCurrentView('assessments');
    } else if (act === 'practice') {
      if (detectedAction?.topicName) {
        setSelectedPracticeTopic(detectedAction.topicName.toLowerCase().replace(/\s+/g, '-'));
      }
      setCurrentView('practice');
    } else if (act === 'course') {
      setCurrentView('courses');
    } else {
      // AI Tutor
      setCurrentView('tutor');
      if (onExecuteTutorQuery && query) {
        onExecuteTutorQuery(query);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search & Voice Input Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              analyzeQueryIntent(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecute();
            }}
            placeholder="Speak or type (e.g. 'Explain binary search' or 'Quiz on DBMS')..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            autoFocus
          />

          {/* Language Selector */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
            <Globe className="w-3 h-3 text-indigo-500" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_VOICE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Mic Pulse Button */}
          <button
            type="button"
            onClick={isListening ? stopVoiceListening : startVoiceListening}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-200'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
          >
            {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Listening Waveform Indicator */}
        {isListening && (
          <div className="bg-gradient-to-r from-indigo-50 via-rose-50 to-indigo-50 px-4 py-2 border-b border-rose-100 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2 font-bold text-[11px]">
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2.5" />
                <span className="w-1 bg-rose-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
                <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-2" />
                <span className="w-1 bg-rose-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3" />
              </div>
              <span>Listening to voice... Speak your topic or query</span>
            </div>
            <span className="text-[10px] text-slate-500">Auto-detects intent</span>
          </div>
        )}

        {/* Dynamic Intent Action Card */}
        {detectedAction && searchQuery.trim() && (
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  {detectedAction.type === 'tutor' ? (
                    <Bot className="w-4 h-4" />
                  ) : detectedAction.type === 'practice' ? (
                    <Code2 className="w-4 h-4" />
                  ) : detectedAction.type === 'quiz' ? (
                    <Award className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>{detectedAction.label}</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                      Matched
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleExecute()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Launch Shortcuts */}
        <div className="p-4 space-y-2 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Quick Voice Commands
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Explain data abstraction with an analogy');
                analyzeQueryIntent('Explain data abstraction with an analogy');
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition flex items-center gap-2.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-[11px] truncate">"Explain data abstraction"</div>
                <div className="text-[10px] text-slate-500">Ask AI Tutor directly</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('Practice binary search in IDE');
                analyzeQueryIntent('Practice binary search in IDE');
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition flex items-center gap-2.5 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-[11px] truncate">"Practice binary search"</div>
                <div className="text-[10px] text-slate-500">Open interactive code editor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('Quiz on DBMS normalization');
                analyzeQueryIntent('Quiz on DBMS normalization');
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition flex items-center gap-2.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-[11px] truncate">"Quiz on DBMS normalization"</div>
                <div className="text-[10px] text-slate-500">Start knowledge check</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('Stack data structure LIFO');
                analyzeQueryIntent('Stack data structure LIFO');
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition flex items-center gap-2.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-[11px] truncate">"Stack data structure"</div>
                <div className="text-[10px] text-slate-500">Explore LIFO mechanics</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700">Enter</kbd> to launch</span>
          <span className="text-indigo-600 font-semibold">LEADENT AI Voice Pipeline</span>
        </div>

      </div>
    </div>
  );
};
