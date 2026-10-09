import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Check, AlertCircle, Volume2, Globe, Sparkles, Send, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';

export type VoiceState = 'ready' | 'listening' | 'processing' | 'captured' | 'error';

interface VoiceAssistantButtonProps {
  onTranscript: (transcript: string, mode?: 'append' | 'replace') => void;
  onVoiceSubmit?: (transcript: string) => void;
  onInterim?: (interim: string) => void;
  onStateChange?: (state: VoiceState) => void;
  currentInputText?: string;
  disabled?: boolean;
  className?: string;
  autoStartOnMount?: boolean;
}

// Supported academic languages
export const SUPPORTED_VOICE_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'es-ES', label: 'Spanish (Español)' },
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { code: 'fr-FR', label: 'French (Français)' },
  { code: 'de-DE', label: 'German (Deutsch)' }
];

export const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({
  onTranscript,
  onVoiceSubmit,
  onInterim,
  onStateChange,
  currentInputText = '',
  disabled = false,
  className = '',
  autoStartOnMount = false
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const match = SUPPORTED_VOICE_LANGUAGES.find(l => l.code === navigator.language);
      return match ? match.code : 'en-US';
    }
    return 'en-US';
  });

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<any>(null);
  const stateResetTimerRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const baseInputTextRef = useRef<string>('');
  const accumulatedFinalRef = useRef<string>('');
  const activeStreamRef = useRef<MediaStream | null>(null);

  const updateState = useCallback((state: VoiceState) => {
    setVoiceState(state);
    if (onStateChange) onStateChange(state);
  }, [onStateChange]);

  // Clean up timers & mic tracks on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (activeStreamRef.current) {
        try {
          activeStreamRef.current.getTracks().forEach(t => t.stop());
        } catch {
          // ignore
        }
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (stateResetTimerRef.current) clearTimeout(stateResetTimerRef.current);
    };
  }, []);

  const initRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return null;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognition.maxAlternatives = 1;
      return recognition;
    } catch {
      return null;
    }
  }, [selectedLang]);

  // Finalize and submit transcribed question to AI Tutor
  const finalizeAndSubmit = useCallback((explicitText?: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop audio stream tracks
    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach(t => t.stop());
        activeStreamRef.current = null;
      } catch {
        // ignore
      }
    }

    const spokenText = (explicitText !== undefined
      ? explicitText
      : (accumulatedFinalRef.current || liveTranscript || interimText)
    ).trim();

    const base = baseInputTextRef.current.trim();
    const fullFinalText = spokenText
      ? (base && !spokenText.startsWith(base) ? `${base} ${spokenText}` : spokenText)
      : base;

    if (fullFinalText) {
      updateState('captured');
      ttsService.playChime('mic_stop');
      onTranscript(fullFinalText, 'replace');

      // Seamlessly trigger AI Tutor response
      if (onVoiceSubmit) {
        onVoiceSubmit(fullFinalText);
      }

      if (stateResetTimerRef.current) clearTimeout(stateResetTimerRef.current);
      stateResetTimerRef.current = setTimeout(() => {
        updateState('ready');
        isSubmittingRef.current = false;
      }, 2500);
    } else {
      updateState('ready');
      isSubmittingRef.current = false;
    }

    setInterimText('');
  }, [liveTranscript, interimText, onTranscript, onVoiceSubmit, updateState]);

  // Audio recording fallback using Gemini audio transcription API
  const startAudioRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          updateState('ready');
          return;
        }

        updateState('processing');
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              const res = await api.tutor.transcribeVoice(base64Audio, audioBlob.type);
              if (res.transcript && res.transcript.trim()) {
                finalizeAndSubmit(res.transcript.trim());
              } else {
                updateState('ready');
                setErrorMessage('No clear speech recognized. Please try speaking again.');
              }
            } catch {
              updateState('ready');
              setErrorMessage('Voice service unavailable. You can type your question.');
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch {
          updateState('ready');
        }
      };

      mediaRecorder.start();
      updateState('listening');
    } catch (err: any) {
      updateState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your question.');
      } else {
        setErrorMessage('Could not access microphone device. You can type your question.');
      }
    }
  };

  const startListening = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setInterimText('');
    isManuallyStoppedRef.current = false;
    isSubmittingRef.current = false;
    baseInputTextRef.current = currentInputText.trim();
    accumulatedFinalRef.current = '';

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    // If Web Speech API is not supported in the browser, fallback to MediaRecorder
    if (!SpeechRecognitionAPI) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        startAudioRecordingFallback();
        return;
      }
      updateState('error');
      setErrorMessage("Voice input isn't supported in this browser. You can type your question instead.");
      return;
    }

    const recognition = initRecognition();
    if (!recognition) {
      startAudioRecordingFallback();
      return;
    }

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      updateState('listening');
      ttsService.playChime('mic_start');
      setErrorMessage(null);
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
        accumulatedFinalRef.current = (accumulatedFinalRef.current ? accumulatedFinalRef.current + ' ' + finalBatch : finalBatch).trim();
      }

      const currentLive = interimBatch.trim();
      setInterimText(currentLive);

      const combinedSpeech = accumulatedFinalRef.current
        ? (currentLive ? `${accumulatedFinalRef.current} ${currentLive}` : accumulatedFinalRef.current)
        : currentLive;

      setLiveTranscript(combinedSpeech);
      if (onInterim) onInterim(combinedSpeech);

      // Real-time update into the student input box
      if (combinedSpeech) {
        const base = baseInputTextRef.current;
        const fullText = base ? `${base} ${combinedSpeech}` : combinedSpeech;
        onTranscript(fullText, 'replace');

        // Reset silence timer: auto-submit after 3 seconds of pause following recognized speech
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (!isManuallyStoppedRef.current && combinedSpeech.trim()) {
            finalizeAndSubmit(combinedSpeech.trim());
          }
        }, 3200);
      }
    };

    recognition.onerror = (event: any) => {
      if (isManuallyStoppedRef.current || isSubmittingRef.current) return;

      const err = event.error;
      if (err === 'no-speech') {
        // If some speech was captured, finalize it instead of showing an error
        const captured = (accumulatedFinalRef.current || liveTranscript).trim();
        if (captured) {
          finalizeAndSubmit(captured);
        } else {
          updateState('ready');
        }
        return;
      }

      if (err === 'not-allowed' || err === 'service-not-allowed') {
        // Try fallback recording
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          startAudioRecordingFallback();
          return;
        }
        updateState('error');
        setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your question.');
      } else if (err === 'network') {
        // Fallback to media recorder if speech synthesis server is unreachable
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          startAudioRecordingFallback();
          return;
        }
        updateState('error');
        setErrorMessage('Network error during speech recognition. You can type your question.');
      } else if (err === 'aborted') {
        updateState('ready');
      } else {
        updateState('ready');
      }
    };

    recognition.onend = () => {
      if (isManuallyStoppedRef.current || isSubmittingRef.current) return;

      if (voiceState === 'listening') {
        const finalRecorded = (accumulatedFinalRef.current || liveTranscript || interimText).trim();
        if (finalRecorded) {
          finalizeAndSubmit(finalRecorded);
        } else {
          updateState('ready');
        }
      }
    };

    try {
      recognition.start();
    } catch {
      // Fallback
      startAudioRecordingFallback();
    }
  };

  const stopListening = () => {
    isManuallyStoppedRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      return;
    }

    finalizeAndSubmit();
  };

  const toggleListening = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (autoStartOnMount) {
      startListening();
    }
  }, [autoStartOnMount]);

  return (
    <div className="relative inline-flex items-center">
      {/* 1. Primary Microphone Button with Real-Time Dynamic States */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-label="Voice input"
        title={
          voiceState === 'listening'
            ? 'Listening... Click to send question to AI Tutor'
            : voiceState === 'processing'
            ? 'Processing speech...'
            : voiceState === 'captured'
            ? 'Question sent to AI Tutor!'
            : 'Click to speak your academic question'
        }
        className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${className} ${
          voiceState === 'listening'
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 ring-2 ring-rose-400 animate-pulse'
            : voiceState === 'processing'
            ? 'bg-amber-500 text-white'
            : voiceState === 'captured'
            ? 'bg-emerald-600 text-white shadow-xs'
            : voiceState === 'error'
            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
            : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-300'
        }`}
      >
        {voiceState === 'listening' ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
            <span className="font-extrabold text-[11px]">Listening...</span>
          </>
        ) : voiceState === 'processing' ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            <span className="font-semibold text-[11px]">Processing...</span>
          </>
        ) : voiceState === 'captured' ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span className="font-semibold text-[11px]">Sent</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-[11px]">Voice</span>
          </>
        )}
      </button>

      {/* 2. Active Audio Wave & Live Transcript Floating Panel when listening */}
      {voiceState === 'listening' && (
        <div className="absolute bottom-full mb-2 left-0 sm:left-auto right-0 sm:right-auto z-50 bg-slate-950 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs flex flex-col gap-2.5 min-w-[280px] max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-150">
          
          {/* Header & Wave animation */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
                <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
                <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-4" />
              </div>
              <span className="text-rose-400 font-bold text-[11px] uppercase tracking-wider">
                Listening to speech...
              </span>
            </div>

            <button
              type="button"
              onClick={stopListening}
              className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-bold shadow-xs cursor-pointer transition flex items-center gap-1"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>

          {/* Real-time live transcript box */}
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-slate-200 text-xs min-h-[48px] flex items-center">
            {liveTranscript ? (
              <p className="font-semibold text-indigo-200 leading-snug break-words">
                &ldquo;{liveTranscript}&rdquo;
              </p>
            ) : (
              <p className="text-slate-400 italic text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Speak your question (e.g. &ldquo;Explain data abstraction.&rdquo;)</span>
              </p>
            )}
          </div>

          {/* Language selector & quick instruction */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <select
                value={selectedLang}
                onChange={e => setSelectedLang(e.target.value)}
                className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_VOICE_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-indigo-300 font-medium text-[10px]">Auto-sends to AI Tutor</span>
          </div>
        </div>
      )}

      {/* 3. Helpful Error Banner / Feedback Pill */}
      {errorMessage && (
        <div className="absolute bottom-full mb-2 left-0 sm:left-auto right-0 z-50 bg-amber-950 text-amber-50 p-3 rounded-2xl shadow-xl border border-amber-800 text-xs flex items-start gap-2.5 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-150">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium leading-relaxed text-amber-100">{errorMessage}</p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[10px] font-bold text-amber-300 hover:text-white px-2 py-0.5 rounded cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  startListening();
                }}
                className="text-[10px] bg-amber-700 hover:bg-amber-600 px-2.5 py-1 rounded-md font-bold text-white shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
