/**
 * LEADENT AI - High-Fidelity Text-to-Speech (TTS) & Acoustic Feedback Engine
 * Handles natural speech synthesis, markdown sanitization for spoken delivery,
 * browser chunking workaround for long texts, voice selection, and Web Audio UI chimes.
 */

export interface VoiceOption {
  name: string;
  lang: string;
  displayName: string;
  isDefault?: boolean;
}

export type TTSPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped';

export interface TTSState {
  playbackState: TTSPlaybackState;
  activeMessageId: string | null;
  currentSentenceIndex: number;
  totalSentences: number;
  rate: number;
  pitch: number;
  selectedVoiceName: string | null;
  availableVoices: VoiceOption[];
}

type StateListener = (state: TTSState) => void;

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private audioContext: AudioContext | null = null;

  private state: TTSState = {
    playbackState: 'idle',
    activeMessageId: null,
    currentSentenceIndex: 0,
    totalSentences: 0,
    rate: 1.0,
    pitch: 1.0,
    selectedVoiceName: null,
    availableVoices: []
  };

  private sentenceQueue: string[] = [];
  private currentSentenceIdx = 0;
  private isCancelling = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    try {
      const rawVoices = this.synth.getVoices();
      if (!rawVoices || rawVoices.length === 0) return;

      // Filter and prioritize high-quality English and multilingual voices
      const mapped: VoiceOption[] = rawVoices
        .filter(v => {
          const l = v.lang.toLowerCase();
          return (
            l.startsWith('en') ||
            l.startsWith('hi') ||
            l.startsWith('es') ||
            l.startsWith('fr') ||
            l.startsWith('de')
          );
        })
        .map(v => {
          let label = v.name;
          if (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural')) {
            label = `✨ ${v.name.replace(/Google|Microsoft|Apple/g, '').trim()} (${v.lang})`;
          } else {
            label = `${v.name} (${v.lang})`;
          }
          return {
            name: v.name,
            lang: v.lang,
            displayName: label,
            isDefault: v.default
          };
        });

      // Prefer natural/neural English voices as default if none selected yet
      if (!this.state.selectedVoiceName && mapped.length > 0) {
        const preferred =
          mapped.find(v => v.displayName.includes('✨') && v.lang.startsWith('en')) ||
          mapped.find(v => v.lang === 'en-US') ||
          mapped.find(v => v.lang.startsWith('en')) ||
          mapped[0];

        this.state.selectedVoiceName = preferred ? preferred.name : mapped[0].name;
      }

      this.state.availableVoices = mapped;
      this.notifyListeners();
    } catch {
      // ignore
    }
  }

  /**
   * Cleans and sanitizes raw markdown and code snippets so they sound natural
   * when spoken aloud by the speech synthesizer.
   */
  public cleanTextForSpeech(markdown: string): string {
    if (!markdown) return '';

    let text = markdown;

    // 1. Remove and replace markdown code blocks with friendly verbal cues
    text = text.replace(/```(?:java|python|javascript|typescript|sql|cpp|c)?\n([\s\S]*?)```/gi, (_match, code) => {
      // If code has a class or method name, summarize it
      const classMatch = code.match(/class\s+([A-Za-z0-9_]+)/);
      const methodMatch = code.match(/(?:public|private|static)?\s*[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);

      if (classMatch) {
        return ` Code demonstration defining class ${classMatch[1]}. Refer to the code block on your screen. `;
      } else if (methodMatch) {
        return ` Code demonstration for method ${methodMatch[1]}. Refer to the code block on your screen. `;
      }
      return ' Code implementation snippet shown on screen. ';
    });

    // 2. Remove inline code backticks
    text = text.replace(/`([^`]+)`/g, '$1');

    // 3. Remove markdown headers (### Header -> Header)
    text = text.replace(/#{1,6}\s*(.+)/g, '$1.');

    // 4. Remove bold / italics
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // 5. Clean up markdown lists
    text = text.replace(/^\s*[-*+]\s+/gm, ' ');
    text = text.replace(/^\s*\d+\.\s+/gm, ' ');

    // 6. Clean mathematical notation & LaTeX $...$
    text = text.replace(/\$O\(([^)]+)\)\$/g, 'Big O of $1');
    text = text.replace(/\$([^$]+)\$/g, '$1');

    // 7. Remove markdown horizontal rules
    text = text.replace(/---/g, ' ');

    // 8. Remove excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Splits text into short, natural sentence chunks to prevent browser speech clipping.
   */
  public splitIntoSentences(text: string): string[] {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return [];

    // Split on sentence terminators (. ! ?) while keeping abbreviations intact
    const rawSentences = cleaned.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleaned];

    return rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Starts speaking the provided text for a specific message ID.
   */
  public speak(text: string, messageId: string, onFinish?: () => void) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    this.stop();
    this.isCancelling = false;

    const sentences = this.splitIntoSentences(text);
    if (sentences.length === 0) {
      return;
    }

    this.sentenceQueue = sentences;
    this.currentSentenceIdx = 0;

    this.state = {
      ...this.state,
      playbackState: 'playing',
      activeMessageId: messageId,
      currentSentenceIndex: 0,
      totalSentences: sentences.length
    };
    this.notifyListeners();

    this.speakNextSentence(onFinish);
  }

  private speakNextSentence(onAllFinished?: () => void) {
    if (!this.synth || this.isCancelling) return;

    if (this.currentSentenceIdx >= this.sentenceQueue.length) {
      this.state = {
        ...this.state,
        playbackState: 'idle',
        activeMessageId: null,
        currentSentenceIndex: 0,
        totalSentences: 0
      };
      this.notifyListeners();
      if (onAllFinished) onAllFinished();
      return;
    }

    const currentSentence = this.sentenceQueue[this.currentSentenceIdx];

    const utterance = new SpeechSynthesisUtterance(currentSentence);
    this.currentUtterance = utterance;

    // Apply voice settings
    const voices = this.synth.getVoices();
    if (this.state.selectedVoiceName && voices.length > 0) {
      const match = voices.find(v => v.name === this.state.selectedVoiceName);
      if (match) utterance.voice = match;
    }

    utterance.rate = this.state.rate;
    utterance.pitch = this.state.pitch;

    utterance.onend = () => {
      if (this.isCancelling) return;
      this.currentSentenceIdx++;
      this.state.currentSentenceIndex = this.currentSentenceIdx;
      this.notifyListeners();
      this.speakNextSentence(onAllFinished);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      this.currentSentenceIdx++;
      this.speakNextSentence(onAllFinished);
    };

    this.synth.speak(utterance);
  }

  /**
   * Pauses current speech playback.
   */
  public pause() {
    if (this.synth && this.state.playbackState === 'playing') {
      try {
        this.synth.pause();
        this.state.playbackState = 'paused';
        this.notifyListeners();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Resumes paused speech playback.
   */
  public resume() {
    if (this.synth && this.state.playbackState === 'paused') {
      try {
        this.synth.resume();
        this.state.playbackState = 'playing';
        this.notifyListeners();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Stops all active and queued speech.
   */
  public stop() {
    this.isCancelling = true;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
    this.sentenceQueue = [];
    this.currentSentenceIdx = 0;

    this.state = {
      ...this.state,
      playbackState: 'idle',
      activeMessageId: null,
      currentSentenceIndex: 0,
      totalSentences: 0
    };
    this.notifyListeners();
  }

  /**
   * Updates playback speed rate (0.75, 1.0, 1.25, 1.5, 2.0).
   */
  public setRate(rate: number) {
    this.state.rate = Math.max(0.5, Math.min(2.5, rate));
    this.notifyListeners();
  }

  /**
   * Sets preferred voice by name.
   */
  public setVoice(voiceName: string) {
    this.state.selectedVoiceName = voiceName;
    this.notifyListeners();
  }

  /**
   * Subscribes a React component to state changes.
   */
  public subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public getState(): TTSState {
    return this.state;
  }

  private notifyListeners() {
    this.stateListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch {
        // ignore
      }
    });
  }

  /**
   * Generates pleasant audio chime cues for microphone start, transcript completion,
   * AI answer ready, and error states using Web Audio API synthesis.
   */
  public playChime(type: 'mic_start' | 'mic_stop' | 'ai_ready' | 'error') {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'mic_start') {
        // Cheerful upward chime: C5 (523Hz) -> G5 (784Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'mic_stop') {
        // Subtle confirmation tone: G5 (784Hz) -> C5 (523Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'ai_ready') {
        // Harmonic arrival chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'error') {
        // Soft low alert
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext might be blocked until user gesture, ignore
    }
  }
}

export const ttsService = new TTSService();
