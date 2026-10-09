import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Flame,
  ChevronDown,
  User as UserIcon,
  LogOut,
  GraduationCap,
  Target,
  UserPlus,
  LogIn,
  Mic,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { GlobalVoiceSearchModal } from './GlobalVoiceSearchModal';

export const Navbar: React.FC = () => {
  const { user, loginDemo, logout, openAuthModal } = useAuth();
  const {
    courses,
    activeCourseId,
    setActiveCourseId,
    learningState,
    streak,
    openCheckLevelModal,
    setCurrentView,
    enrollments,
    activeEnrollment,
    switchActiveCourse
  } = useLearning();

  const [courseDropdownOpen, setCourseDropdownOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    LEADENT <span className="text-indigo-600">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Agent
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                  Know Your Level. Plan Your Journey. Master Your Skills.
                </p>
              </div>
            </button>

            {/* Course Switcher */}
            <div className="relative hidden md:block">
              {enrollments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setCurrentView('courses')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 transition"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>+ Enroll in a Course</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>{activeEnrollment?.courseTitle || activeCourse?.title || 'Active Course'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {courseDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        My Enrolled Courses
                      </div>
                      {enrollments.map(enr => (
                        <button
                          key={enr.courseId}
                          type="button"
                          onClick={() => {
                            switchActiveCourse(enr.courseId);
                            setCourseDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-700 transition ${
                            enr.courseId === activeCourseId
                              ? 'bg-indigo-50/60 font-semibold text-indigo-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <span>{enr.courseTitle}</span>
                          {enr.courseId === activeCourseId && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                              Active
                            </span>
                          )}
                        </button>
                      ))}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView('courses');
                            setCourseDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          + Browse All Courses
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Center/Right Metrics & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Study Streak & Tier Badge */}
            <div
              onClick={() => setCurrentView('progress')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                streak?.tier === 'gold'
                  ? 'bg-amber-100/90 border border-amber-300 text-amber-900 shadow-sm'
                  : streak?.tier === 'silver'
                  ? 'bg-slate-100 border border-slate-300 text-slate-800'
                  : 'bg-amber-50 border border-amber-200/70 text-amber-800'
              }`}
              title={`Consistency Tier: ${(streak?.tier || 'bronze').toUpperCase()} (${streak?.currentStreak || learningState?.studyStreakDays || 1} day streak)`}
            >
              <Flame className={`w-3.5 h-3.5 ${
                streak?.tier === 'gold'
                  ? 'text-amber-600 fill-amber-500 animate-pulse'
                  : streak?.tier === 'silver'
                  ? 'text-slate-500 fill-slate-400'
                  : 'text-amber-500 fill-amber-500'
              }`} />
              <span>{streak?.currentStreak || learningState?.studyStreakDays || 1} Day Streak</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                streak?.tier === 'gold'
                  ? 'bg-amber-200 text-amber-900'
                  : streak?.tier === 'silver'
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {streak?.tier || 'bronze'}
              </span>
            </div>

            {/* Exam Readiness */}
            <div
              onClick={() => setCurrentView('progress')}
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold cursor-pointer hover:bg-emerald-100 transition"
              title="Click to view full syllabus readiness"
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>{learningState?.examReadiness || 62}% Exam Ready</span>
            </div>

            {/* Voice Assistant / Voice Search CTA */}
            <button
              type="button"
              onClick={() => setShowVoiceSearchModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition cursor-pointer"
              title="Voice Search & Assistant: Speak commands across the platform"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-600" />
              <span>Voice Search</span>
            </button>

            {/* Prominent CHECK MY LEVEL Button */}
            <button
              type="button"
              onClick={() => openCheckLevelModal()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm shadow-indigo-200 hover:shadow transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>CHECK MY LEVEL</span>
            </button>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-600 text-xs font-bold">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden sm:inline max-w-[90px] truncate">
                    {user?.name || 'Student'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {user?.accountType === 'demo' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Demo Student (Alex Chen)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            LEADENT Student Account
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{user?.semester}</p>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openAuthModal('register');
                        }}
                        className="w-full px-4 py-1.5 text-left text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                        New Student Registration
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full px-4 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-slate-400" />
                        Switch / Login Account
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          loginDemo();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        {user?.accountType === 'demo' ? 'Reset Demo (Alex Chen)' : 'Switch to Demo (Alex Chen)'}
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Voice Search & Command Modal */}
      <GlobalVoiceSearchModal
        isOpen={showVoiceSearchModal}
        onClose={() => setShowVoiceSearchModal(false)}
        onExecuteTutorQuery={(query) => {
          setCurrentView('tutor');
        }}
      />
    </header>
  );
};
