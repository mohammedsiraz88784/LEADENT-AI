import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Check,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  SwitchCamera,
  HelpCircle,
  BookOpen,
  FileCode,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { TutorImageAttachment } from '../types';

interface CameraSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureImage: (image: TutorImageAttachment, defaultPrompt?: string) => void;
  currentTopic?: string;
  courseTitle?: string;
}

// Sample academic presets for instant one-click testing
const ACADEMIC_IMAGE_SAMPLES = [
  {
    id: 'sample_recursion',
    title: 'Handwritten Binary Tree Recursion',
    category: 'Data Structures & Algorithms',
    description: 'Tree traversal recursion tracing with base condition and stack frame calls.',
    prompt: 'Analyze this recursion tree diagram: explain the time complexity, call stack growth, and base case return path.',
    generateSvg: () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" style="background:#0f172a;font-family:monospace;">
        <rect width="600" height="400" fill="#0f172a"/>
        <text x="30" y="40" fill="#38bdf8" font-size="18" font-weight="bold">// PROBLEM: Binary Tree Max Depth Recursion</text>
        <text x="30" y="70" fill="#94a3b8" font-size="14">public int maxDepth(TreeNode root) {</text>
        <text x="50" y="95" fill="#f43f5e" font-size="14">    if (root == null) return 0; // Base Case</text>
        <text x="50" y="120" fill="#a855f7" font-size="14">    int left = maxDepth(root.left);</text>
        <text x="50" y="145" fill="#a855f7" font-size="14">    int right = maxDepth(root.right);</text>
        <text x="50" y="170" fill="#22c55e" font-size="14">    return 1 + Math.max(left, right);</text>
        <text x="30" y="195" fill="#94a3b8" font-size="14">}</text>
        
        <!-- Tree Diagram -->
        <circle cx="450" cy="80" r="22" fill="#3b82f6" stroke="#60a5fa" stroke-width="2"/>
        <text x="444" y="86" fill="#ffffff" font-size="16" font-weight="bold">1</text>
        
        <line x1="435" y1="98" x2="380" y2="150" stroke="#64748b" stroke-width="2"/>
        <line x1="465" y1="98" x2="520" y2="150" stroke="#64748b" stroke-width="2"/>
        
        <circle cx="380" cy="160" r="20" fill="#6366f1" stroke="#818cf8" stroke-width="2"/>
        <text x="374" y="166" fill="#ffffff" font-size="15" font-weight="bold">2</text>
        
        <circle cx="520" cy="160" r="20" fill="#6366f1" stroke="#818cf8" stroke-width="2"/>
        <text x="514" y="166" fill="#ffffff" font-size="15" font-weight="bold">3</text>
        
        <line x1="365" y1="175" x2="330" y2="230" stroke="#64748b" stroke-width="2"/>
        <circle cx="330" cy="240" r="18" fill="#10b981" stroke="#34d399" stroke-width="2"/>
        <text x="324" y="246" fill="#ffffff" font-size="14" font-weight="bold">4</text>
        
        <rect x="30" y="240" width="240" height="130" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="45" y="265" fill="#facc15" font-size="13" font-weight="bold">Stack Trace Trace:</text>
        <text x="45" y="290" fill="#cbd5e1" font-size="12">1. maxDepth(1) calls 2 &amp; 3</text>
        <text x="45" y="315" fill="#cbd5e1" font-size="12">2. maxDepth(2) calls 4 &amp; null</text>
        <text x="45" y="340" fill="#cbd5e1" font-size="12">3. maxDepth(4) returns 1</text>
        <text x="45" y="360" fill="#22c55e" font-size="12">Result Depth = 3</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
  },
  {
    id: 'sample_oop_inheritance',
    title: 'Java Stack & Heap Memory Architecture',
    category: 'JVM & Object-Oriented',
    description: 'Polymorphism reference vs runtime object memory allocation with super() chaining.',
    prompt: 'Explain what happens in Stack memory vs JVM Heap memory for this inheritance hierarchy and constructor call.',
    generateSvg: () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" style="background:#090d16;font-family:sans-serif;">
        <rect width="600" height="400" fill="#090d16"/>
        <text x="30" y="40" fill="#38bdf8" font-size="18" font-weight="bold">JVM Runtime Memory Architecture: Polymorphism</text>
        
        <!-- Stack Section -->
        <rect x="30" y="70" width="220" height="300" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="50" y="100" fill="#38bdf8" font-size="16" font-weight="bold">CALL STACK (Frame)</text>
        
        <rect x="45" y="120" width="190" height="60" rx="6" fill="#334155"/>
        <text x="55" y="145" fill="#e2e8f0" font-size="13" font-weight="bold">BankAccount acc</text>
        <text x="55" y="165" fill="#facc15" font-size="11">ref -&gt; 0x7A4F (Heap)</text>
        
        <rect x="45" y="195" width="190" height="50" rx="6" fill="#334155"/>
        <text x="55" y="225" fill="#94a3b8" font-size="12">main(String[] args)</text>
        
        <!-- Pointer Arrow -->
        <path d="M 235 150 L 330 180" stroke="#facc15" stroke-width="3" stroke-dasharray="4" marker-end="url(#arrow)"/>
        
        <!-- Heap Section -->
        <rect x="340" y="70" width="230" height="300" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="360" y="100" fill="#10b981" font-size="16" font-weight="bold">JVM HEAP SPACE</text>
        
        <rect x="355" y="120" width="200" height="230" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
        <text x="365" y="145" fill="#4ade80" font-size="13" font-weight="bold">SavingsAccount @0x7A4F</text>
        
        <rect x="365" y="160" width="180" height="80" rx="4" fill="#1e293b"/>
        <text x="375" y="180" fill="#93c5fd" font-size="11" font-weight="bold">[Superclass: BankAccount]</text>
        <text x="375" y="200" fill="#cbd5e1" font-size="11">accountNumber: "SA-901"</text>
        <text x="375" y="220" fill="#cbd5e1" font-size="11">balance: $2,500.00</text>
        
        <rect x="365" y="250" width="180" height="80" rx="4" fill="#1e293b"/>
        <text x="375" y="270" fill="#a78bfa" font-size="11" font-weight="bold">[Subclass: SavingsAccount]</text>
        <text x="375" y="290" fill="#cbd5e1" font-size="11">interestRate: 4.5%</text>
        <text x="375" y="310" fill="#cbd5e1" font-size="11">vtable: calculateInterest()</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
  },
  {
    id: 'sample_dbms_er',
    title: 'Database Schema & 3NF Normalization',
    category: 'DBMS & Relational Design',
    description: 'Entity-relationship schema with primary & foreign key constraints.',
    prompt: 'Check this database relation schema: identify functional dependencies, candidate keys, and verify if it satisfies 3rd Normal Form (3NF).',
    generateSvg: () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" style="background:#0f172a;font-family:sans-serif;">
        <rect width="600" height="400" fill="#0f172a"/>
        <text x="30" y="40" fill="#f59e0b" font-size="18" font-weight="bold">Relational Schema Normalization Analysis</text>
        
        <!-- Table 1 -->
        <rect x="30" y="70" width="240" height="140" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        <rect x="30" y="70" width="240" height="35" rx="6" fill="#d97706"/>
        <text x="45" y="94" fill="#ffffff" font-size="15" font-weight="bold">STUDENT_ENROLLMENT</text>
        <text x="45" y="130" fill="#facc15" font-size="12" font-weight="bold">PK: student_id (INT)</text>
        <text x="45" y="150" fill="#facc15" font-size="12" font-weight="bold">PK, FK: course_code (VARCHAR)</text>
        <text x="45" y="170" fill="#cbd5e1" font-size="12">student_name (VARCHAR)</text>
        <text x="45" y="190" fill="#cbd5e1" font-size="12">enrollment_date (DATE)</text>
        
        <!-- Table 2 -->
        <rect x="330" y="70" width="240" height="140" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
        <rect x="330" y="70" width="240" height="35" rx="6" fill="#2563eb"/>
        <text x="345" y="94" fill="#ffffff" font-size="15" font-weight="bold">COURSE_CATALOG</text>
        <text x="345" y="130" fill="#facc15" font-size="12" font-weight="bold">PK: course_code (VARCHAR)</text>
        <text x="345" y="150" fill="#cbd5e1" font-size="12">course_title (VARCHAR)</text>
        <text x="345" y="170" fill="#cbd5e1" font-size="12">instructor_id (INT)</text>
        <text x="345" y="190" fill="#cbd5e1" font-size="12">credits (INT)</text>
        
        <!-- Functional Dependencies Box -->
        <rect x="30" y="235" width="540" height="135" rx="8" fill="#1e293b" stroke="#475569"/>
        <text x="45" y="265" fill="#38bdf8" font-size="14" font-weight="bold">Functional Dependencies Identified:</text>
        <text x="45" y="290" fill="#e2e8f0" font-size="12">FD1: student_id -&gt; student_name (Partial Dependency)</text>
        <text x="45" y="315" fill="#e2e8f0" font-size="12">FD2: course_code -&gt; course_title, instructor_id, credits</text>
        <text x="45" y="340" fill="#ef4444" font-size="12" font-weight="bold">⚠️ Violation: Partial dependency on composite primary key violates 2NF!</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
  }
];

export const CameraSearchModal: React.FC<CameraSearchModalProps> = ({
  isOpen,
  onClose,
  onCaptureImage,
  currentTopic = 'Computer Science',
  courseTitle = 'Curriculum'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<TutorImageAttachment | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream utility
  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Start camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    stopCameraStream();
    setCameraError(null);
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera initialization issue:', err);
      const msg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        ? 'Camera permission was denied. Please allow camera access in your browser or use the file upload option.'
        : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
        ? 'No camera device was detected on this hardware. You can upload an image or select an academic sample.'
        : 'Unable to connect to camera. Please use file upload or select an academic sample below.';
      setCameraError(msg);
      // Automatically switch to upload tab if camera cannot be accessed
      setActiveTab('upload');
    }
  }, [stopCameraStream]);

  // Manage camera lifecycle based on modal open state and active tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage) {
      startCamera(cameraFacing);
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, cameraFacing, capturedImage, startCamera, stopCameraStream]);

  // Handle capture snapshot from live video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    // Snapshot flash effect
    setTimeout(() => {
      try {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

          setCapturedImage({
            data: base64Data,
            mimeType: 'image/jpeg',
            previewUrl: dataUrl,
            name: `camera_snapshot_${Date.now()}.jpg`,
            sizeBytes: Math.round(base64Data.length * 0.75)
          });
          stopCameraStream();
        }
      } catch (err) {
        console.error('Failed to take snapshot:', err);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  // Handle file selection from local device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Clean base64 data
      const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : file.type || 'image/jpeg';
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');

      setCapturedImage({
        data: base64Data,
        mimeType,
        previewUrl: dataUrl,
        name: file.name,
        sizeBytes: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop upload
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : file.type || 'image/jpeg';
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');

      setCapturedImage({
        data: base64Data,
        mimeType,
        previewUrl: dataUrl,
        name: file.name,
        sizeBytes: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  // Select sample preset with automatic PNG rasterization for multimodal AI
  const handleSelectSample = (sample: typeof ACADEMIC_IMAGE_SAMPLES[0]) => {
    const dataUrl = sample.generateSvg();
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png', 0.95);
          const base64Data = pngUrl.replace(/^data:image\/png;base64,/, '');
          setCapturedImage({
            data: base64Data,
            mimeType: 'image/png',
            previewUrl: pngUrl,
            name: `${sample.id}.png`,
            sizeBytes: Math.round(base64Data.length * 0.75)
          });
          setUserPrompt(sample.prompt);
          return;
        }
      } catch (err) {
        console.warn('Canvas rasterization fallback:', err);
      }
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');
      setCapturedImage({
        data: base64Data,
        mimeType: 'image/png',
        previewUrl: dataUrl,
        name: `${sample.id}.png`,
        sizeBytes: Math.round(base64Data.length * 0.75)
      });
      setUserPrompt(sample.prompt);
    };
    img.onerror = () => {
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');
      setCapturedImage({
        data: base64Data,
        mimeType: 'image/png',
        previewUrl: dataUrl,
        name: `${sample.id}.png`,
        sizeBytes: Math.round(base64Data.length * 0.75)
      });
      setUserPrompt(sample.prompt);
    };
    img.src = dataUrl;
  };

  // Retake or clear image
  const handleRetake = () => {
    setCapturedImage(null);
    if (activeTab === 'camera') {
      startCamera(cameraFacing);
    }
  };

  // Confirm and send image to AI Tutor
  const handleConfirmAndAsk = () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    onCaptureImage(capturedImage, userPrompt.trim() || undefined);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Realistic Camera Search &amp; Visual AI Tutor</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 tracking-wider">
                  Vision Grounded
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Snap or upload textbook problems, diagrams, code snippets, or handwritten notes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (when not in preview mode) */}
        {!capturedImage && (
          <div className="flex border-b border-slate-100 px-5 pt-2 gap-4 bg-white text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'camera'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('samples')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'samples'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Academic Sample Presets</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* 1. CAPTURED PREVIEW STATE */}
          {capturedImage ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center max-h-72">
                <img
                  src={capturedImage.previewUrl || `data:${capturedImage.mimeType};base64,${capturedImage.data}`}
                  alt="Captured academic question"
                  className="max-h-72 w-auto object-contain"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{capturedImage.name || 'Image Ready'}</span>
                  {capturedImage.sizeBytes && (
                    <span className="text-slate-400">({Math.round(capturedImage.sizeBytes / 1024)} KB)</span>
                  )}
                </div>

                {/* Retake Button */}
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-3 right-3 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake / Change</span>
                </button>
              </div>

              {/* Accompanying Question / Prompt */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Optional: Specific question or instructions about this image</span>
                  <span className="text-[11px] font-normal text-slate-400">Leave blank for automatic comprehensive breakdown</span>
                </label>
                <input
                  type="text"
                  value={userPrompt}
                  onChange={e => setUserPrompt(e.target.value)}
                  placeholder="e.g. Find the bug in step 2, or explain the time complexity of this diagram..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel / Choose Another
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndAsk}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Analyze with AI Tutor</span>
                </button>
              </div>
            </div>
          ) : (
            /* 2. LIVE CAMERA / UPLOAD / SAMPLES TAB CONTENT */
            <div>
              {/* TAB A: LIVE CAMERA */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  {cameraError ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Camera Notice</span>
                      </div>
                      <p>{cameraError}</p>
                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('upload')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition"
                        >
                          Upload Image File
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('samples')}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 font-semibold hover:bg-amber-50 transition"
                        >
                          Use Academic Sample
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Video Viewport Container */}
                      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video sm:aspect-16/10 flex items-center justify-center shadow-inner">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />

                        {/* Framing Reticle overlay */}
                        <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-indigo-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                          <div className="flex justify-between">
                            <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                            <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                          </div>
                          <div className="text-center text-[11px] font-semibold text-white/90 bg-slate-950/60 px-2 py-0.5 rounded-full mx-auto backdrop-blur-xs">
                            Position question, code, or diagram in frame
                          </div>
                          <div className="flex justify-between">
                            <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                            <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                          </div>
                        </div>

                        {/* Flip Camera Control */}
                        <button
                          type="button"
                          onClick={() => {
                            const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
                            setCameraFacing(nextFacing);
                            startCamera(nextFacing);
                          }}
                          title="Switch front/back camera"
                          className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl border border-slate-700 backdrop-blur-xs transition cursor-pointer"
                        >
                          <SwitchCamera className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Shutter Capture Button Bar */}
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={takeSnapshot}
                          disabled={isCapturing}
                          className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center border-4 border-white/80 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition cursor-pointer"
                          title="Snap Photo"
                        >
                          <Camera className="w-7 h-7" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB B: UPLOAD IMAGE */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-8 text-center cursor-pointer transition space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        Click to upload or drag &amp; drop an image
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Supports JPG, PNG, WEBP, or SVG (textbook captures, screenshots, notes)
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-[11px] flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Visual Tip:</strong> Ensure adequate lighting and high contrast for handwritten calculations, recursion trees, or code screenshots.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB C: ACADEMIC SAMPLE PRESETS */}
              {activeTab === 'samples' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Test visual academic recognition immediately with realistic pre-configured engineering artifacts:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {ACADEMIC_IMAGE_SAMPLES.map(sample => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 transition cursor-pointer space-y-2 flex flex-col justify-between group shadow-2xs"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {sample.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                            {sample.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {sample.description}
                          </p>
                        </div>

                        <div className="pt-2 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                          <span>Select Sample</span>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Grounded in {currentTopic} ({courseTitle})</span>
          </span>
          <span className="text-slate-400">LEADENT AI Multimodal Academic Engine</span>
        </div>
      </div>
    </div>
  );
};
