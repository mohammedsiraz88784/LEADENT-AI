import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Settings2, Sparkles } from 'lucide-react';
import { ttsService, TTSState } from '../services/ttsService';

interface TutorSpeechPlayerProps {
  text: string;
  messageId: string;
  className?: string;
  topic?: string;
}

export const TutorSpeechPlayer: React.FC<TutorSpeechPlayerProps> = ({
  text,
  messageId,
  className = '',
  topic
}) => {
  const [ttsState, setTTSState] = useState<TTSState>(() => ttsService.getState());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      setTTSState(state);
    });
    return unsubscribe;
  }, []);

  const isCurrentMessagePlaying =
    ttsState.activeMessageId === messageId && ttsState.playbackState === 'playing';
  const isCurrentMessagePaused =
    ttsState.activeMessageId === messageId && ttsState.playbackState === 'paused';
  const isCurrentActive = isCurrentMessagePlaying || isCurrentMessagePaused;

  const handleTogglePlay = () => {
    if (isCurrentMessagePlaying) {
      ttsService.pause();
    } else if (isCurrentMessagePaused) {
      ttsService.resume();
    } else {
      ttsService.speak(text, messageId);
    }
  };

  const handleStop = () => {
    ttsService.stop();
  };

  const handleRateChange = (newRate: number) => {
    ttsService.setRate(newRate);
  };

  const handleVoiceChange = (voiceName: string) => {
    ttsService.setVoice(voiceName);
  };

  return (
    <div
      className={`rounded-xl border transition-all select-none ${
        isCurrentActive
          ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-2xs'
          : 'bg-slate-100/80 hover:bg-slate-100 border-slate-200/80 text-slate-700'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
        {/* Left: Play / Pause Button & Wave Animation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isCurrentMessagePlaying ? 'Pause narration' : 'Listen to tutor explanation'}
            className={`p-1.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
              isCurrentMessagePlaying
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300'
            }`}
            title={isCurrentMessagePlaying ? 'Pause narration' : 'Listen to this explanation'}
          >
            {isCurrentMessagePlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Status Label & Dynamic Sound Waves */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] flex items-center gap-1">
              {isCurrentMessagePlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span className="text-indigo-700">Speaking...</span>
                </>
              ) : isCurrentMessagePaused ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700">Paused</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-700">Listen</span>
                </>
              )}
            </span>

            {/* Real-time wave bars during playback */}
            {isCurrentMessagePlaying && (
              <div className="flex items-center gap-0.5 h-3 px-1">
                <span className="w-0.5 bg-indigo-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2.5" />
                <span className="w-0.5 bg-indigo-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
                <span className="w-0.5 bg-indigo-600 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-indigo-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3" />
              </div>
            )}

            {/* Sentence Progress Indicator */}
            {isCurrentActive && ttsState.totalSentences > 0 && (
              <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
                ({ttsState.currentSentenceIndex + 1}/{ttsState.totalSentences})
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls (Replay, Stop, Speed Pill, Settings) */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {isCurrentActive && (
            <>
              <button
                type="button"
                onClick={() => ttsService.speak(text, messageId)}
                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition cursor-pointer"
                title="Restart from beginning"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded transition cursor-pointer"
                title="Stop audio"
              >
                <VolumeX className="w-3 h-3" />
              </button>
            </>
          )}

          {/* Speed Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5">
            {[1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  ttsState.rate === rate
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Settings / Voice Picker Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-white transition cursor-pointer ${
              showSettings ? 'text-indigo-600 bg-white' : ''
            }`}
            title="TTS Voice Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice Selection Dropdown Panel */}
      {showSettings && (
        <div className="p-2.5 border-t border-slate-200/80 bg-white/95 rounded-b-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Tutor Voice Accent
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <select
              value={ttsState.selectedVoiceName || ''}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              {ttsState.availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
