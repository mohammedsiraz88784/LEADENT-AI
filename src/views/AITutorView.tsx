import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  RefreshCw,
  BookOpen,
  HelpCircle,
  Code2,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowRight,
  Lightbulb,
  FileCode,
  Check,
  AlertTriangle,
  Award,
  Terminal,
  Zap,
  Target,
  ExternalLink,
  ChevronDown,
  X,
  FileText,
  Edit3,
  Camera,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { TutorMessage, StudentTutorContext, TutorMode, ProductiveInterventionAction, TutorImageAttachment } from '../types';
import { api } from '../services/api';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { TutorMarkdown } from '../components/TutorMarkdown';
import { TutorEvaluationCard } from '../components/TutorEvaluationCard';
import { ProductiveInterventionCard } from '../components/ProductiveInterventionCard';
import { TryFirstDrawer } from '../components/TryFirstDrawer';
import { VoiceAssistantButton } from '../components/VoiceAssistantButton';
import { WaitingLearningGame } from '../components/WaitingLearningGame';
import { CameraSearchModal } from '../components/CameraSearchModal';
import { TutorSpeechPlayer } from '../components/TutorSpeechPlayer';
import { VoiceConversationOrb } from '../components/VoiceConversationOrb';
import { ttsService } from '../services/ttsService';

export const AITutorView: React.FC = () => {
  const { user } = useAuth();
  const {
    learningState,
    activeCourseId,
    activeCourse,
    knowledgeMap,
    learningPlan,
    setSelectedPracticeTopic,
    setCurrentView,
    activeTutorTopic,
    setActiveTutorTopic,
    activeTutorActivity,
    setActiveTutorActivity
  } = useLearning();

  const [tutorContext, setTutorContext] = useState<StudentTutorContext | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TutorMode>('explain');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [switchingTopic, setSwitchingTopic] = useState(false);
  const [showTryFirstModal, setShowTryFirstModal] = useState(false);
  const [tryFirstTopic, setTryFirstTopic] = useState<string>('');
  const [showWaitingGame, setShowWaitingGame] = useState(false);
  
  // Camera & Visual Image Search States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [attachedImage, setAttachedImage] = useState<TutorImageAttachment | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [lastFailedRequest, setLastFailedRequest] = useState<{
    text: string;
    mode: TutorMode;
    image?: TutorImageAttachment;
    codeSnippet?: string;
  } | null>(null);

  // Voice Pipeline & TTS States
  const [showVoiceOrbModal, setShowVoiceOrbModal] = useState(false);
  const [autoSpeakResponses, setAutoSpeakResponses] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor loading duration to only trigger waiting game when processing takes noticeable time (>1.2s)
  useEffect(() => {
    if (loading) {
      loadingTimerRef.current = setTimeout(() => {
        setShowWaitingGame(true);
      }, 1200);
    } else {
      setShowWaitingGame(false);
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    }
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [loading]);

  // Load context and history
  const loadTutorData = async () => {
    try {
      const topicToFetch = activeTutorTopic || learningState?.currentTopic || 'Inheritance';
      const [contextRes, historyRes] = await Promise.all([
        api.tutor.getContext(activeCourseId, topicToFetch, activeTutorActivity?.id),
        api.tutor.getHistory(activeCourseId)
      ]);
      setTutorContext(contextRes.context);
      setMessages(historyRes.messages);
    } catch (err) {
      console.error('Failed to load tutor data:', err);
    }
  };

  useEffect(() => {
    loadTutorData();
  }, [activeCourseId, activeTutorTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleTopicChange = async (newTopic: string) => {
    setSwitchingTopic(true);
    setActiveTutorTopic(newTopic);
    try {
      const res = await api.tutor.setTopic(activeCourseId, newTopic);
      setTutorContext(res.context);
    } catch (err) {
      console.error('Failed to update topic:', err);
    } finally {
      setSwitchingTopic(false);
    }
  };

  const handleSend = async (customText?: string, overrideMode?: TutorMode, customImage?: TutorImageAttachment, customSnippet?: string) => {
    const text = (customText !== undefined ? customText : inputText).trim();
    const imageToSend = customImage || attachedImage;
    const snippetToSend = customSnippet !== undefined ? customSnippet : codeSnippet;
    
    if (!text && !snippetToSend.trim() && !imageToSend) return;
    if (loading) return;

    const modeToUse = overrideMode || activeMode;
    const currentTopic = tutorContext?.currentTopic || activeTutorTopic || 'Inheritance';

    setInputText('');
    setLoading(true);
    setIsAnalyzingImage(!!imageToSend);
    setLastFailedRequest(null);

    const fullUserText = text || (imageToSend ? '📷 Visual Search / Image Problem Analysis' : (snippetToSend ? 'Please review and explain my code below.' : ''));

    // Optimistic user message with image thumbnail
    const tempUserMsg: TutorMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: fullUserText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      codeSnippet: snippetToSend ? snippetToSend : undefined,
      imageUrl: imageToSend ? (imageToSend.previewUrl || `data:${imageToSend.mimeType};base64,${imageToSend.data}`) : undefined,
      contextTopic: currentTopic,
      mode: modeToUse
    };

    setMessages(prev => [...prev, tempUserMsg]);

    setCodeSnippet('');
    setShowCodeInput(false);
    setAttachedImage(null);

    try {
      const res = await api.tutor.sendMessage(activeCourseId, fullUserText, {
        mode: modeToUse,
        topic: currentTopic,
        activityId: activeTutorActivity?.id,
        activityTitle: activeTutorActivity?.title,
        codeSnippet: snippetToSend || undefined,
        image: imageToSend ? {
          data: imageToSend.data,
          mimeType: imageToSend.mimeType,
          name: imageToSend.name,
          previewUrl: imageToSend.previewUrl
        } : undefined,
        imageUrl: imageToSend?.previewUrl
      });

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        tempUserMsg,
        res.response
      ]);

      if (res.context) {
        setTutorContext(res.context);
      }

      // Voice pipeline cues
      ttsService.playChime('ai_ready');
      if (autoSpeakResponses && res.response?.content) {
        ttsService.speak(res.response.content, res.response.id);
      }
    } catch (err: any) {
      console.error('Failed to send tutor message:', err);
      const errMsg = err?.message || '';
      let formattedError = 'I apologize, but I encountered a connection interruption with the academic reasoning engine.';
      if (errMsg.includes('413') || errMsg.includes('too large')) {
        formattedError = 'The uploaded image exceeds size limits. Please try capturing a closer photo or using a smaller image.';
      } else if (errMsg.includes('format') || errMsg.includes('MIME')) {
        formattedError = 'The uploaded image format could not be processed. Please use JPG, PNG, or WebP.';
      }

      setLastFailedRequest({
        text: fullUserText,
        mode: modeToUse,
        image: imageToSend || undefined,
        codeSnippet: snippetToSend || undefined
      });

      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `${formattedError}\n\nYou can click **Try Again** below to automatically resend this request with your attached image.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      setIsAnalyzingImage(false);
    }
  };

  // Direct file attachment from quick toolbar input
  const handleQuickImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : file.type || 'image/jpeg';
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');

      setAttachedImage({
        data: base64Data,
        mimeType,
        previewUrl: dataUrl,
        name: file.name,
        sizeBytes: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear your conversation history with LEADENT AI Tutor?')) return;
    try {
      await api.tutor.clearHistory(activeCourseId);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear tutor history:', err);
    }
  };

  // Contextual action triggers
  const triggerContextualAction = (action: { label: string; mode: TutorMode; promptText: string; isTryFirstModal?: boolean; isCameraModal?: boolean }) => {
    if (action.isCameraModal) {
      setShowCameraModal(true);
      return;
    }
    if (action.isTryFirstModal) {
      setTryFirstTopic(currentTopicName);
      setShowTryFirstModal(true);
      return;
    }
    setActiveMode(action.mode);
    handleSend(action.promptText, action.mode);
  };

  const currentTopicName = tutorContext?.currentTopic || activeTutorTopic || 'Inheritance';
  const assessedLevel = tutorContext?.overallLevel || learningState?.overallLevel || 'Intermediate';

  const contextualActions: { label: string; mode: TutorMode; promptText: string; icon: any; color: string; isTryFirstModal?: boolean; isCameraModal?: boolean }[] = [
    {
      label: 'Camera / Visual Search',
      mode: 'explain',
      promptText: '',
      icon: Camera,
      color: 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 font-bold shadow-xs',
      isCameraModal: true
    },
    {
      label: 'Let Me Try First',
      mode: 'try_first',
      promptText: `Give me a starter challenge or problem on ${currentTopicName} so I can attempt it first.`,
      icon: Edit3,
      color: 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 font-bold shadow-xs',
      isTryFirstModal: true
    },
    {
      label: 'Give Me a Hint',
      mode: 'hint',
      promptText: `I am working on ${currentTopicName}. Can you give me a progressive hint without giving away the full answer?`,
      icon: HelpCircle,
      color: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-semibold'
    },
    {
      label: 'Review My Attempt',
      mode: 'review_attempt',
      promptText: `I want to submit my attempt for ${currentTopicName}. Please review my answer and point out what I got right and where I can improve.`,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-semibold'
    },
    {
      label: 'Step-by-Step Guidance',
      mode: 'guided_solution',
      promptText: `Guide me step-by-step through understanding and implementing ${currentTopicName}.`,
      icon: Layers,
      color: 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100 font-semibold'
    },
    {
      label: 'Solve a Problem',
      mode: 'solve',
      promptText: `Solve this: Walk me step-by-step through solving a practical problem on ${currentTopicName} with full code and complexity.`,
      icon: Target,
      color: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
    },
    {
      label: 'Explain Simply',
      mode: 'simplify',
      promptText: `Can you explain ${currentTopicName} in simple terms with an everyday analogy?`,
      icon: Lightbulb,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
    },
    {
      label: 'Give an Example',
      mode: 'example',
      promptText: `Show me a clear, clean, compilable Java code example demonstrating ${currentTopicName}.`,
      icon: FileCode,
      color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
    },
    {
      label: 'Core Concept',
      mode: 'concept',
      promptText: `What is the core theoretical concept behind ${currentTopicName}, and why does it matter?`,
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
    },
    {
      label: 'Exam Summary',
      mode: 'summary',
      promptText: `Give me a high-yield exam summary of ${currentTopicName} with key rules and common pitfalls.`,
      icon: FileText,
      color: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
    },
    {
      label: 'Test My Understanding',
      mode: 'test',
      promptText: `Ask me a diagnostic challenge question on ${currentTopicName} to test my grasp, and evaluate my reply!`,
      icon: Award,
      color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
    },
    {
      label: 'Explain Common Mistake',
      mode: 'explain_mistake',
      promptText: `What are the most frequent student misconceptions or bugs in ${currentTopicName}, and how do I avoid them?`,
      icon: AlertTriangle,
      color: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
    },
    {
      label: 'Real-World Application',
      mode: 'application',
      promptText: `How is ${currentTopicName} used in modern enterprise Java architectures and industry frameworks?`,
      icon: Terminal,
      color: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
    },
    {
      label: 'Deep JVM Challenge',
      mode: 'challenge',
      promptText: `Challenge me with an advanced Java concept or JVM internal detail about ${currentTopicName}!`,
      icon: Zap,
      color: 'bg-indigo-900 text-white border-indigo-700 hover:bg-indigo-800'
    }
  ];

  const getModeBadge = (mode?: string) => {
    switch (mode) {
      case 'try_first':
        return { label: 'Try First Challenge', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
      case 'review_attempt':
        return { label: 'Attempt Review & Feedback', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
      case 'guided_solution':
      case 'socratic':
        return { label: 'Step-by-Step Guidance', color: 'bg-purple-100 text-purple-900 border-purple-300 font-bold' };
      case 'solve':
        return { label: 'Step-by-Step Solution', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold' };
      case 'concept':
        return { label: 'Core Concept', color: 'bg-violet-100 text-violet-800 border-violet-200' };
      case 'summary':
        return { label: 'Exam Summary', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'debug':
        return { label: 'Debug & Fix', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'simplify':
        return { label: 'Simplified Concept', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'example':
        return { label: 'Code Walkthrough', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'analogy':
        return { label: 'Conceptual Analogy', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'hint':
        return { label: 'Progressive Hint', color: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' };
      case 'practice':
        return { label: 'Practice Exercise', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'test':
        return { label: 'Concept Challenge', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'evaluation':
        return { label: 'Academic Evaluation', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'explain_mistake':
        return { label: 'Misconception Analysis', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'application':
        return { label: 'Industry Application', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'challenge':
        return { label: 'Deep JVM Mastery', color: 'bg-indigo-950 text-indigo-200 border-indigo-800' };
      default:
        return { label: 'Academic Explanation', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-3 max-w-5xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* 1. ACADEMIC GROUNDING CONTEXT BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs shrink-0 space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Context: Course, Topic, Level */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold shadow-2xs">
              <Bot className="w-3.5 h-3.5 text-indigo-200" />
              <span>LEADENT Tutor</span>
            </div>

            <span className="text-slate-300">|</span>

            <span className="text-slate-600">
              Course: <strong className="text-slate-900">{activeCourse?.title || 'Java Programming'}</strong>
            </span>

            <span className="text-slate-300">|</span>

            {/* Topic Switcher Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Topic:</span>
              <select
                value={currentTopicName}
                onChange={e => handleTopicChange(e.target.value)}
                disabled={switchingTopic}
                className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:border-indigo-400 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {(tutorContext?.availableTopics || [
                  { id: 'inheritance', title: 'Inheritance' },
                  { id: 'polymorphism', title: 'Polymorphism' },
                  { id: 'interfaces', title: 'Interfaces' },
                  { id: 'abstract-classes', title: 'Abstract Classes' },
                  { id: 'exception-handling', title: 'Exception Handling' },
                  { id: 'collections', title: 'Collections Framework' }
                ]).map(t => (
                  <option key={t.id} value={t.title}>
                    {t.title} {t.proficiency ? `(${t.proficiency})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-300">|</span>

            {/* Assessed Level Badge */}
            <div className="flex items-center gap-1">
              <span className="text-slate-600">Level:</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {assessedLevel}
              </span>
            </div>

            {/* Diagnostic Gaps if any */}
            {tutorContext?.weakTopics && tutorContext.weakTopics.length > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-medium">
                  Identified Gap: <strong>{tutorContext.weakTopics[0]}</strong>
                </span>
              </>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
            {/* Live Voice Dialogue Orb Modal Button */}
            <button
              type="button"
              onClick={() => setShowVoiceOrbModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-xs text-xs font-bold transition cursor-pointer"
              title="Open Hands-Free Interactive Voice Dialogue"
            >
              <Mic className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
              <span>Voice Dialogue</span>
            </button>

            {/* Auto-Speak Responses (TTS) Toggle */}
            <button
              type="button"
              onClick={() => setAutoSpeakResponses(!autoSpeakResponses)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                autoSpeakResponses
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
              }`}
              title={autoSpeakResponses ? 'Auto-Speak Responses is ON' : 'Turn ON Auto-Speak for AI Tutor responses'}
            >
              <Volume2 className={`w-3.5 h-3.5 ${autoSpeakResponses ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Auto-Read</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPracticeTopic(currentTopicName.toLowerCase().replace(/\s+/g, '-'));
                setCurrentView('practice');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-semibold transition cursor-pointer"
              title="Practice this topic in interactive IDE"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Practice in IDE</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('learning-plan')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
              title="Return to learning plan"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Learning Plan</span>
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Clear conversation history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Linked Learning Plan Activity (if coming from plan step) */}
        {activeTutorActivity && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-medium truncate">
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold uppercase text-[10px]">
                Active Step {activeTutorActivity.stepNumber || 1}
              </span>
              <span className="truncate">{activeTutorActivity.title}</span>
              {activeTutorActivity.learningObjective && (
                <span className="text-slate-500 hidden md:inline truncate">
                  • Objective: {activeTutorActivity.learningObjective}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTutorActivity(null)}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5 text-[11px] shrink-0"
              title="Unlink current step"
            >
              <X className="w-3 h-3" />
              <span>Unlink Step</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. CONTEXTUAL ACTIONS TRAY (Pedagogical Actions) */}
      <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Tutor Modes:
        </span>
        {contextualActions.map((action, idx) => {
          const IconComponent = action.icon;
          const isSelected = activeMode === action.mode;
          return (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => triggerContextualAction(action)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-2xs ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300'
                  : action.color
              }`}
            >
              <IconComponent className="w-3 h-3" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MESSAGES FEED */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                LEADENT AI Tutor Grounded in {currentTopicName}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                I am calibrated to your diagnostic profile ({assessedLevel} level). Choose any action above like{' '}
                <strong className="text-indigo-600">[Explain Simply]</strong>, ask a question, or test your code!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleSend(`Can you explain ${currentTopicName} with an intuitive real-world analogy?`, 'simplify')
                }
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition cursor-pointer"
              >
                Explain with an Analogy
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSend(`Show me a clean Java code example demonstrating ${currentTopicName}.`, 'example')
                }
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition cursor-pointer"
              >
                Show Compilable Example
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSend(`Test my understanding of ${currentTopicName} with a quick challenge question!`, 'test')
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition cursor-pointer"
              >
                Test My Understanding
              </button>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const badge = getModeBadge(msg.mode);
            const isAssistant = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAssistant
                      ? 'bg-gradient-to-br from-indigo-700 to-blue-700 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div
                  className={`max-w-3xl space-y-2.5 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
                      : 'bg-indigo-600 text-white font-normal rounded-tr-none shadow-xs'
                  }`}
                >
                  {/* Assistant metadata header */}
                  {isAssistant && (
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {msg.contextTopic && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          Topic: <strong className="text-slate-700">{msg.contextTopic}</strong>
                        </span>
                      )}
                      {msg.isVerifiedConcept !== false && (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5 ml-auto">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Academic Standard</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Attached user image if present */}
                  {!isAssistant && msg.imageUrl && (
                    <div className="my-1.5 rounded-xl overflow-hidden border border-indigo-400 bg-indigo-900/50 p-1.5">
                      <div className="relative group">
                        <img
                          src={msg.imageUrl}
                          alt="User uploaded academic problem"
                          className="max-h-60 max-w-full rounded-lg object-contain cursor-pointer hover:opacity-95 transition bg-slate-950/40"
                          onClick={() => setSelectedImagePreview(msg.imageUrl || null)}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImagePreview(msg.imageUrl || null)}
                          className="absolute bottom-2 right-2 bg-slate-950/80 hover:bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 opacity-90 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Expand</span>
                        </button>
                      </div>
                      <div className="text-[10px] text-indigo-200 mt-1 flex items-center justify-between px-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Camera className="w-3 h-3 text-indigo-300" />
                          <span>Visual Search Input</span>
                        </span>
                        <span className="text-indigo-300">Click to view full size</span>
                      </div>
                    </div>
                  )}

                  {/* Attached user code snippet if present */}
                  {!isAssistant && msg.codeSnippet && (
                    <div className="p-3 bg-indigo-700/80 rounded-xl font-mono text-[11px] text-indigo-100 border border-indigo-500 overflow-x-auto my-1">
                      <div className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Attached Code:</div>
                      <pre>{msg.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Positive Reinforcement Banner if student took initiative/attempted */}
                  {isAssistant && msg.positiveReinforcement && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300/80 text-emerald-900 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded-sm mr-1.5">
                          Effort Recognized
                        </span>
                        <span>{msg.positiveReinforcement}</span>
                      </div>
                    </div>
                  )}

                  {/* Productive Intervention Card if academic outsourcing was detected */}
                  {isAssistant && msg.productiveIntervention && (
                    <ProductiveInterventionCard
                      intervention={msg.productiveIntervention}
                      onSelectAction={(act: ProductiveInterventionAction) => {
                        setActiveMode(act.mode);
                        handleSend(act.promptText, act.mode);
                      }}
                      onOpenTryFirst={(topic?: string) => {
                        setTryFirstTopic(topic || currentTopicName);
                        setShowTryFirstModal(true);
                      }}
                    />
                  )}

                  {/* Speech & Audio Narration Player Bar */}
                  {isAssistant && (
                    <TutorSpeechPlayer
                      text={msg.content}
                      messageId={msg.id}
                      topic={msg.contextTopic || currentTopicName}
                      className="my-1.5"
                    />
                  )}

                  {/* Message Content */}
                  {isAssistant ? (
                    <TutorMarkdown content={msg.content} topic={msg.contextTopic || currentTopicName} />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  )}

                  {/* Reflection Prompt Footer if present */}
                  {isAssistant && msg.reflectionPrompt && (
                    <div className="p-3 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1 text-indigo-800">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Self-Reflection Check:</span>
                      </div>
                      <p className="text-slate-700 italic">{msg.reflectionPrompt}</p>
                    </div>
                  )}

                  {/* Evaluation Card if assistant evaluated student's answer */}
                  {isAssistant && msg.evaluation && msg.evaluation.isEvaluation && (
                    <TutorEvaluationCard evaluation={msg.evaluation} />
                  )}

                  {/* Follow-up Exploration Question Chips */}
                  {isAssistant && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-indigo-500" />
                        Explore Further:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(q, 'explain')}
                            className="text-left text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 transition flex items-center justify-between group cursor-pointer shadow-2xs"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Retry Button if this message was an error */}
                  {isAssistant && msg.id.startsWith('err_') && lastFailedRequest && (
                    <div className="pt-2 border-t border-rose-200/60">
                      <button
                        type="button"
                        onClick={() =>
                          handleSend(
                            lastFailedRequest.text,
                            lastFailedRequest.mode,
                            lastFailedRequest.image,
                            lastFailedRequest.codeSnippet
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                      </button>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] ${
                      isAssistant ? 'text-slate-400 text-left' : 'text-indigo-200 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading State & Waiting Learning Game */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              {showWaitingGame ? (
                <WaitingLearningGame
                  courseId={activeCourseId}
                  topic={currentTopicName}
                />
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>
                    {isAnalyzingImage
                      ? 'Analyzing uploaded visual image & academic problem step-by-step...'
                      : `Grounded reasoning engine is structuring explanation for ${currentTopicName}...`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. CODE ATTACHMENT DRAWER (Collapsible) */}
      {showCodeInput && (
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Paste Java Code for Tutor Evaluation / Debugging
            </span>
            <button
              type="button"
              onClick={() => setShowCodeInput(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={codeSnippet}
            onChange={e => setCodeSnippet(e.target.value)}
            rows={4}
            placeholder={`// Paste your Java class or method here for review...
public class TestSubclass extends Superclass {
    @Override
    public void execute() {
        super.execute();
    }
}`}
            className="w-full font-mono text-xs text-emerald-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* 5. MESSAGE INPUT AREA & INTEGRATED MULTIMODAL TOOLBAR */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100/70 transition">
        
        {/* Hidden file input for direct image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleQuickImageUpload}
          className="hidden"
        />

        {/* 5.1 IMAGE PREVIEW STATE (WHEN IMAGE IS SELECTED) */}
        {attachedImage && (
          <div className="m-2.5 p-2.5 bg-gradient-to-r from-indigo-50/90 to-blue-50/80 rounded-xl border border-indigo-200/90 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="relative group w-12 h-12 rounded-lg overflow-hidden bg-slate-950 border border-indigo-300/80 shrink-0 cursor-pointer shadow-xs"
                onClick={() => setSelectedImagePreview(attachedImage.previewUrl || `data:${attachedImage.mimeType};base64,${attachedImage.data}`)}
                title="Click to expand full image"
              >
                <img
                  src={attachedImage.previewUrl || `data:${attachedImage.mimeType};base64,${attachedImage.data}`}
                  alt="Attached academic question thumbnail"
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-indigo-950 truncate max-w-[180px] sm:max-w-xs">
                    {attachedImage.name || 'Academic Problem Image'}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-200/90 text-indigo-800 px-1.5 py-0.2 rounded font-mono">
                    {attachedImage.mimeType.split('/')[1]?.toUpperCase() || 'IMG'}
                  </span>
                  {attachedImage.sizeBytes && (
                    <span className="text-[10px] text-indigo-600 font-mono">
                      {Math.round(attachedImage.sizeBytes / 1024)} KB
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-indigo-700/90 truncate">
                  Visual prompt ready • AI Tutor will analyze diagrams, formulas, equations, or code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/80 rounded-lg transition cursor-pointer flex items-center gap-1"
                title="Switch or retake image"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Change</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="w-7 h-7 rounded-lg bg-indigo-100/80 hover:bg-indigo-200 text-indigo-800 flex items-center justify-center transition cursor-pointer"
                title="Remove attached image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 5.2 MESSAGE INPUT FIELD */}
        <div className="px-3 pt-2.5 pb-1">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              attachedImage
                ? 'Add a specific question about this image, or press Enter to analyze...'
                : `Ask about ${currentTopicName}, request progressive guidance, or paste your solution...`
            }
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* 5.3 NEW MESSAGE INPUT TOOLBAR (Camera, Upload, Voice, Code, Mode, Send) */}
        <div className="px-2.5 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
          
          {/* Left Toolbar Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            
            {/* Camera Capture Button */}
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                attachedImage
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700'
              }`}
              title="Capture problem, diagram, or code with live camera"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold">Camera</span>
            </button>

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Upload image or screenshot from your device"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold">Upload Image</span>
            </button>

            {/* Voice Input Button */}
            <VoiceAssistantButton
              onTranscript={(transcript, mode) => {
                if (mode === 'replace') {
                  setInputText(transcript);
                } else {
                  setInputText(prev => {
                    const trimmed = prev.trim();
                    if (!trimmed) return transcript;
                    return `${trimmed} ${transcript}`;
                  });
                }
              }}
              onVoiceSubmit={(transcript) => {
                if (transcript && transcript.trim()) {
                  handleSend(transcript.trim());
                }
              }}
              currentInputText={inputText}
              disabled={loading}
              className="border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
            />

            {/* Attach Code Toggle */}
            <button
              type="button"
              onClick={() => setShowCodeInput(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                showCodeInput || codeSnippet
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
              title="Attach or paste code snippet"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold hidden sm:inline">{showCodeInput ? 'Hide Code' : 'Code'}</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Learning Mode Dropdown */}
            <select
              value={activeMode}
              onChange={e => setActiveMode(e.target.value as TutorMode)}
              className="text-[11px] font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
              title="Select AI Tutor response mode"
            >
              <option value="explain">Mode: Explain</option>
              <option value="try_first">Mode: Try First</option>
              <option value="hint">Mode: Progressive Hint</option>
              <option value="review_attempt">Mode: Review My Attempt</option>
              <option value="guided_solution">Mode: Step-by-Step Guidance</option>
              <option value="simplify">Mode: Simplify</option>
              <option value="example">Mode: Example Code</option>
              <option value="analogy">Mode: Analogy</option>
              <option value="practice">Mode: Practice Question</option>
              <option value="test">Mode: Test My Grasp</option>
              <option value="evaluation">Mode: Evaluate My Answer</option>
              <option value="explain_mistake">Mode: Explain Mistake</option>
              <option value="debug">Mode: Debug Code</option>
              <option value="challenge">Mode: Deep Challenge</option>
            </select>
          </div>

          {/* Right Toolbar Action (Send / Submit Button) */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !codeSnippet.trim() && !attachedImage) || loading}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
          >
            <span>{attachedImage ? 'Analyze Image' : 'Ask Tutor'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. LET ME TRY FIRST MODAL DRAWER */}
      <TryFirstDrawer
        topic={tryFirstTopic || currentTopicName}
        isOpen={showTryFirstModal}
        onClose={() => setShowTryFirstModal(false)}
        onSubmitAttempt={(formattedPrompt, code) => {
          if (code) {
            setCodeSnippet(code);
          }
          handleSend(formattedPrompt, 'review_attempt');
        }}
      />

      {/* 7. REALISTIC CAMERA SEARCH & VISUAL AI TUTOR MODAL */}
      <CameraSearchModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCaptureImage={(captured, defaultPrompt) => {
          setAttachedImage(captured);
          if (defaultPrompt) {
            setInputText(defaultPrompt);
          }
        }}
        currentTopic={currentTopicName}
        courseTitle={activeCourse?.title || 'Course'}
      />

      {/* 8. IMAGE LIGHTBOX VIEWER */}
      {selectedImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-4 right-4 bg-slate-800/90 hover:bg-slate-700 text-white p-2 rounded-full transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImagePreview}
              alt="Expanded view"
              className="max-h-[82vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* 9. REAL-TIME CONVERSATIONAL VOICE ORB DIALOGUE MODAL */}
      <VoiceConversationOrb
        isOpen={showVoiceOrbModal}
        onClose={() => setShowVoiceOrbModal(false)}
        currentTopic={currentTopicName}
        courseId={activeCourseId}
        assessedLevel={assessedLevel}
      />
    </div>
  );
};
