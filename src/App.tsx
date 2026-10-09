import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningProvider, useLearning } from './context/LearningContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './views/DashboardView';
import { CoursesView } from './views/CoursesView';
import { LearningPlanView } from './views/LearningPlanView';
import { PracticeView } from './views/PracticeView';
import { QuizView } from './views/QuizView';
import { ProgressView } from './views/ProgressView';
import { AITutorView } from './views/AITutorView';
import { StudyToolsView } from './views/StudyToolsView';
import { CheckMyLevelModal } from './views/CheckMyLevelModal';
import {
  LayoutDashboard,
  CalendarCheck,
  Code2,
  Award,
  Bot
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading, authModalOpen, authModalInitialMode, closeAuthModal } = useAuth();
  const { currentView, setCurrentView } = useLearning();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'courses':
        return <CoursesView />;
      case 'learning-plan':
      case 'learningPlan' as any:
        return <LearningPlanView />;
      case 'practice':
        return <PracticeView />;
      case 'assessments':
        return <QuizView />;
      case 'progress':
        return <ProgressView />;
      case 'tutor':
        return <AITutorView />;
      case 'resources':
        return <StudyToolsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900 font-sans antialiased">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
            currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('learning-plan')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
            currentView === 'learning-plan' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Plan</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('practice')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
            currentView === 'practice' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Practice</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('assessments')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
            currentView === 'assessments' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Quiz</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('tutor')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
            currentView === 'tutor' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Tutor</span>
        </button>
      </nav>

      {/* Global AI Diagnostic Modal */}
      <CheckMyLevelModal />

      {/* Authentication Modal (when logged out, or when opened explicitly to switch/register) */}
      <AuthModal
        isOpen={(!user && !loading) || authModalOpen}
        initialMode={authModalInitialMode}
        onClose={user ? closeAuthModal : undefined}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LearningProvider>
        <MainContent />
      </LearningProvider>
    </AuthProvider>
  );
}
