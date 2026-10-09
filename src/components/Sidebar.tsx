import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Code2,
  Award,
  BarChart3,
  Bot,
  Sparkles,
  ArrowRight,
  Globe
} from 'lucide-react';
import { useLearning, NavView } from '../context/LearningContext';

interface NavItemConfig {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, learningState, openCheckLevelModal } = useLearning();

  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Your learning overview'
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: BookOpen,
      description: 'Syllabus & topic trees'
    },
    {
      id: 'learning-plan',
      label: 'Learning Plan',
      icon: CalendarCheck,
      description: "Today's targeted steps",
      badge: 'AI Plan'
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: Code2,
      description: 'Hands-on coding challenges'
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: Award,
      description: 'Quizzes & level tests'
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: BarChart3,
      description: 'Knowledge map & mastery'
    },
    {
      id: 'tutor',
      label: 'AI Tutor',
      icon: Bot,
      description: 'Context-grounded guidance',
      badge: 'Gemini'
    },
    {
      id: 'resources',
      label: 'Study Platforms & Tools',
      icon: Globe,
      description: 'Course-specific external tools',
      badge: 'Curated'
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between py-6 px-4 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Academic Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Diagnostic assessment promotion card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/90 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-indigo-950">Diagnostic Loop</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
            Calibrate your topic proficiency anytime to update your Knowledge Map.
          </p>
          <button
            type="button"
            onClick={() => openCheckLevelModal()}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
          >
            <span>CHECK MY LEVEL</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Active Academic State Pill */}
      <div className="pt-4 border-t border-slate-100 px-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span>Active Course</span>
          <span className="font-semibold text-slate-700">{learningState?.courseTitle || 'Java'}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span>Current Topic</span>
          <span className="font-semibold text-indigo-600">{learningState?.currentTopic || 'Inheritance'}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Knowledge Level</span>
          <span className="font-semibold text-slate-700">{learningState?.overallLevel || 'Intermediate'}</span>
        </div>
      </div>
    </aside>
  );
};
