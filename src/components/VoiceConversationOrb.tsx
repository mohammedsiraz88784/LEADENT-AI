import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  Loader2,
  MessageSquare,
  Globe,
  Radio,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';
import { SUPPORTED_VOICE_LANGUAGES } from './VoiceAssistantButton';

export interface VoiceConversationOrbProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: string;
  courseId?: string;
  assessedLevel?: string;
  onQuestionAsked?: (question: string, answerText: string) => void;
}

type ConversationPhase = 'ready' | 'listening' | 'thinking' | 'speaking' | 'paused';

interface ConversationTurn {
  role: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export const VoiceConversationOrb: React.FC<VoiceConversationOrbProps> = ({
  isOpen,
  onClose,
  currentTopic,
  courseId,
  assessedLevel = 'Moderate',
  onQuestionAsked
}) => {
  const [phase, setPhase] = useState<ConversationPhase>('ready');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [isAutoLoop, setIsAutoLoop] = useState(true);
  const [activeTutorResponse, setActiveTutorResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const isManuallyStoppedRef = useRef(false);
  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Scroll conversation into view
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, liveTranscript, activeTutorResponse]);

  // Clean up when closed
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
    } else {
      ttsService.playChime('mic_start');
      startListeningTurn();
    }
    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    ttsService.stop();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    isSpeakingRef.current = false;
  };

  const startListeningTurn = useCallback(() => {
    setErrorMessage(null);
    setLiveTranscript('');
    setInterimTranscript('');
    setActiveTutorResponse('');
    isManuallyStoppedRef.current = false;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setPhase('ready');
      setErrorMessage('Speech recognition is not supported in this browser.');
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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setPhase('listening');
      };

      recognition.onresult = (event: any) => {
        let finalBatch = '';
        let interimBatch = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalBatch += item[0].transcript;
          } else {
            interimBatch += item[0].transcript;
          }
        }

        if (finalBatch) {
          setLiveTranscript(prev => (prev ? prev + ' ' + finalBatch : finalBatch).trim());
        }
        setInterimTranscript(interimBatch.trim());

        const fullSpoken = (finalBatch || interimBatch).trim();
        if (fullSpoken) {
          // Reset auto-send silence timer: after 3 seconds of pause following words, submit
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (!isManuallyStoppedRef.current) {
              submitStudentQuestion();
            }
          }, 2800);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // If we already had something, submit it
          if (liveTranscript.trim()) {
            submitStudentQuestion();
          }
          return;
        }
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied.');
          setPhase('ready');
        }
      };

      recognition.onend = () => {
        if (!isSpeakingRef.current && phase === 'listening' && liveTranscript.trim()) {
          submitStudentQuestion();
        }
      };

      recognition.start();
    } catch {
      setPhase('ready');
    }
  }, [selectedLang, liveTranscript, phase]);

  const submitStudentQuestion = async () => {
    const questionText = (liveTranscript || interimTranscript).trim();
    if (!questionText) {
      startListeningTurn();
      return;
    }

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    ttsService.playChime('mic_stop');
    setPhase('thinking');

    // Add user question to history
    const userTurn: ConversationTurn = {
      role: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversationHistory(prev => [...prev, userTurn]);

    try {
      const res = await api.tutor.sendMessage(courseId, questionText, {
        topic: currentTopic,
        mode: 'simplify'
      });

      const tutorText = res.response?.content || 'I understand your question on ' + currentTopic;
      setActiveTutorResponse(tutorText);

      const tutorTurn: ConversationTurn = {
        role: 'tutor',
        text: tutorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversationHistory(prev => [...prev, tutorTurn]);

      if (onQuestionAsked) {
        onQuestionAsked(questionText, tutorText);
      }

      // Speak response out loud using realistic TTS engine
      setPhase('speaking');
      isSpeakingRef.current = true;
      ttsService.playChime('ai_ready');

      // Create a short spoken summary or speak cleaned text
      ttsService.speak(tutorText, 'voice-orb-active', () => {
        isSpeakingRef.current = false;
        if (isAutoLoop) {
          // Automatically reopen mic for conversational back-and-forth
          setTimeout(() => {
            ttsService.playChime('mic_start');
            startListeningTurn();
          }, 800);
        } else {
          setPhase('ready');
        }
      });
    } catch {
      setPhase('ready');
      setErrorMessage('Could not connect to AI Tutor. Please try again.');
    }
  };

  const handleInterruptOrToggle = () => {
    if (phase === 'speaking') {
      ttsService.stop();
      isSpeakingRef.current = false;
      ttsService.playChime('mic_start');
      startListeningTurn();
    } else if (phase === 'listening') {
      if (liveTranscript.trim()) {
        submitStudentQuestion();
      } else {
        cleanupAudio();
        setPhase('ready');
      }
    } else if (phase === 'ready' || phase === 'paused') {
      ttsService.playChime('mic_start');
      startListeningTurn();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">Interactive Voice Dialogue</h3>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Radio className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                  Live Voice
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounded in: <strong className="text-indigo-300">{currentTopic}</strong> ({assessedLevel} level)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_VOICE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Voice Visualizer Stage */}
        <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 relative">
          
          {/* Glowing Animated Voice Orb */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer pulsating aura rings */}
            <div
              className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
                phase === 'listening'
                  ? 'bg-rose-500/20 animate-ping'
                  : phase === 'speaking'
                  ? 'bg-indigo-500/20 animate-pulse'
                  : phase === 'thinking'
                  ? 'bg-amber-500/20 animate-spin'
                  : 'bg-indigo-500/10'
              }`}
            />
            <div
              className={`absolute w-28 h-28 rounded-full blur-md transition-all ${
                phase === 'listening'
                  ? 'bg-rose-500/30'
                  : phase === 'speaking'
                  ? 'bg-indigo-500/30'
                  : phase === 'thinking'
                  ? 'bg-amber-500/30'
                  : 'bg-slate-700/20'
              }`}
            />

            {/* Central Orb Button */}
            <button
              type="button"
              onClick={handleInterruptOrToggle}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 cursor-pointer ${
                phase === 'listening'
                  ? 'bg-gradient-to-tr from-rose-600 to-rose-400 ring-4 ring-rose-400/40 text-white shadow-rose-600/50'
                  : phase === 'speaking'
                  ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 ring-4 ring-indigo-400/40 text-white shadow-indigo-600/50'
                  : phase === 'thinking'
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-400 ring-4 ring-amber-400/40 text-white shadow-amber-600/50'
                  : 'bg-slate-800 hover:bg-slate-700 ring-2 ring-slate-600 text-slate-300'
              }`}
            >
              {phase === 'listening' ? (
                <Mic className="w-8 h-8 animate-bounce text-white" />
              ) : phase === 'speaking' ? (
                <Volume2 className="w-8 h-8 animate-pulse text-white" />
              ) : phase === 'thinking' ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : (
                <Mic className="w-8 h-8 text-indigo-400" />
              )}
            </button>
          </div>

          {/* Status Text & Interactive Guidance */}
          <div className="text-center space-y-1">
            <h4 className="font-extrabold text-sm text-slate-200">
              {phase === 'listening'
                ? 'Listening to you... Speak anytime'
                : phase === 'thinking'
                ? 'LEADENT AI is reasoning grounded in curriculum...'
                : phase === 'speaking'
                ? 'LEADENT AI is speaking (Click orb to interrupt)'
                : 'Paused / Ready to Listen'}
            </h4>
            <p className="text-xs text-slate-400">
              {phase === 'listening'
                ? 'Speak naturally (e.g., "Give me a real-world analogy for ' + currentTopic + '")'
                : phase === 'speaking'
                ? 'Listening will automatically resume once the tutor finishes.'
                : 'Click the central microphone to speak with the tutor.'}
            </p>
          </div>

          {/* Quick Starter Pills */}
          {phase === 'ready' && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {[
                `Explain ${currentTopic} simply`,
                `Give me a quiz question`,
                `Show me a Java code example`,
                `Where is this applied in real life?`
              ].map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLiveTranscript(starter);
                    setTimeout(() => submitStudentQuestion(), 100);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <span>{starter}</span>
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-950/60 text-xs sm:text-sm min-h-[160px]">
          {conversationHistory.length === 0 && !liveTranscript && !interimTranscript ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-6">
              <Sparkles className="w-6 h-6 text-indigo-400 mb-2 opacity-60" />
              <p className="text-xs">
                Your conversational exchange will appear here in real-time.
              </p>
            </div>
          ) : (
            conversationHistory.map((turn, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {turn.role === 'tutor' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md font-medium'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                  <span className="block text-[10px] text-right mt-1 opacity-60">
                    {turn.timestamp}
                  </span>
                </div>
                {turn.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Live In-Progress Speech Bubble */}
          {(liveTranscript || interimTranscript) && phase === 'listening' && (
            <div className="flex gap-3 justify-end animate-in fade-in">
              <div className="p-3.5 rounded-2xl max-w-[85%] leading-relaxed bg-indigo-600/80 text-white rounded-tr-none border border-indigo-400/50 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-200 mb-1 font-bold uppercase tracking-wider">
                  <Mic className="w-3 h-3 text-rose-300 animate-pulse" />
                  <span>Hearing you speak...</span>
                </div>
                <p className="font-medium text-white italic">
                  &ldquo;{liveTranscript} {interimTranscript}&rdquo;
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>

        {/* Bottom Bar Controls */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAutoLoop}
              onChange={(e) => setIsAutoLoop(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <span>Hands-Free Auto-Dialogue Loop</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInterruptOrToggle}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              {phase === 'speaking' ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Interrupt & Speak</span>
                </>
              ) : phase === 'listening' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Voice</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Speaking</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
