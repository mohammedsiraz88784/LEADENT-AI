import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  TrendingUp,
  Target,
  PlayCircle,
  Layers,
  Award,
  BookOpen,
  Globe,
  ExternalLink,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { api } from '../services/api';
import { StudyResource } from '../types';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const {
    learningState,
    streak,
    knowledgeMap,
    learningPlan,
    openCheckLevelModal,
    setCurrentView,
    triggerNextBestAction,
    setSelectedPracticeTopic,
    togglePlanItem,
    launchActivity,
    enrollments,
    activeEnrollment,
    courses,
    activeCourse,
    activeCourseId,
    enrollInCourse,
    switchActiveCourse
  } = useLearning();

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Student';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Study resources for the active course (Always call hooks unconditionally at the top)
  const [dashboardResources, setDashboardResources] = useState<StudyResource[]>([]);

  useEffect(() => {
    if (!activeCourseId || enrollments.length === 0) {
      setDashboardResources([]);
      return;
    }
    let isMounted = true;
    api.resources
      .getByCourse(activeCourseId, learningState?.currentTopic)
      .then(res => {
        if (isMounted) {
          setDashboardResources(res.resources.slice(0, 6));
        }
      })
      .catch(() => {
        if (isMounted) setDashboardResources([]);
      });
    return () => {
      isMounted = false;
    };
  }, [activeCourseId, enrollments.length, learningState?.currentTopic]);

  // -------------------------------------------------------------
  // If student has no enrollments yet (New Student Onboarding)
  // -------------------------------------------------------------
  if (enrollments.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-100">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name || 'New Student'}</h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                Enrolled: <strong className="text-slate-800">0 courses</strong>
              </span>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">College / Institute</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">{user?.college || 'Computer Science & Eng'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Semester</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{user?.semester || 'Semester 4'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Account Type</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{user?.isDemo ? 'Demo Account' : 'Individual Student'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Goal</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">Semester Exams & Mastery</span>
            </div>
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 rounded-2xl border border-indigo-100 p-6 sm:p-7 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            No course selected yet.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Enroll in a course to receive personalized study resources.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const catalogEl = document.getElementById('courses-catalog-section');
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Courses</span>
            </button>
          </div>
        </div>

        {/* Available Courses Catalog */}
        <div id="courses-catalog-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Available Course Catalog</h3>
              <p className="text-xs text-slate-500">Select an academic subject to enroll and begin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {course.code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {course.topics.length} Core Topics
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{course.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Syllabus Highlights:</span>
                    <div className="flex flex-wrap gap-1">
                      {course.topics.slice(0, 3).map((t) => (
                        <span key={t.id} className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-100">
                          {t.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => enrollInCourse(course.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enroll in {course.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default Next Action fallback
  // -------------------------------------------------------------
  const currentCourseTitle = activeCourse?.title || learningState?.courseTitle || 'Current Course';
  const nextAction = learningState?.nextBestAction || {
    title: `Start learning ${currentCourseTitle}`,
    actionText: `Complete baseline diagnostic assessment for ${currentCourseTitle}.`,
    reason: 'Establishing your diagnostic baseline enables the AI Tutor and personalized learning roadmap.',
    estimatedMinutes: 15,
    actionType: 'assessment' as const,
    targetTopic: activeCourse?.topics[0]?.title || 'Fundamentals',
    buttonLabel: 'Take Diagnostic Assessment'
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header section: Greeting & Primary Check Level CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {greeting}, <span className="text-indigo-600">{studentFirstName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Active Journey: <span className="text-slate-800 font-semibold">{learningState?.courseTitle || activeCourse?.title || 'Course'}</span> • Academic Goal: <span className="text-slate-800 font-semibold">{learningState?.goal || 'Semester Examination'}</span>
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => openCheckLevelModal()}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>CHECK MY LEVEL</span>
        </button>
      </div>

      {/* Course Enrollment & Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Course:</span>
          {enrollments.map((enr) => (
            <button
              key={enr.courseId}
              type="button"
              onClick={() => switchActiveCourse(enr.courseId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                enr.courseId === activeCourseId
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{enr.courseTitle}</span>
              {enr.courseId === activeCourseId && (
                <span className="text-[10px] bg-indigo-500/80 text-white px-1.5 py-0.2 rounded font-semibold">Active</span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('courses')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
        >
          <span>+ Browse All Courses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 🎯 NEXT BEST ACTION - Prominently Displayed Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-900/40">
        {/* Subtle decorative background accent */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Next Best Action
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                ~{nextAction.estimatedMinutes} minutes
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {nextAction.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">What to do:</strong> {nextAction.actionText}
            </p>

            <div className="text-xs text-indigo-200/90 flex items-start gap-1.5 bg-white/5 p-2.5 rounded-lg border border-white/10">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-indigo-300">Why recommended:</strong> {nextAction.reason}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              type="button"
              onClick={triggerNextBestAction}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-extrabold text-sm shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-indigo-600" />
              <span>{nextAction.buttonLabel || 'Start Now'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('tutor')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 text-xs font-semibold transition"
            >
              <span>Ask AI Tutor First</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Continue Learning */}
        <div
          onClick={() => {
            setSelectedPracticeTopic(learningState?.currentTopic.toLowerCase() || 'inheritance');
            setCurrentView('practice');
          }}
          className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Continue</span>
            <PlayCircle className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {learningState?.currentTopic || 'Inheritance'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Resume practical exercise</p>
        </div>

        {/* Current Course */}
        <div
          onClick={() => setCurrentView('courses')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Course</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {activeCourse?.title || learningState?.courseTitle || 'Active Course'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {activeCourse?.code || 'CS204'} • {activeCourse?.topics.length || 5} topics
          </p>
        </div>

        {/* Learning Streak & Consistency Tier */}
        <div
          onClick={() => setCurrentView('progress')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Streak & Tier</span>
            <Flame className={`w-4 h-4 ${
              (streak?.tier || 'bronze') === 'gold'
                ? 'text-amber-500 fill-amber-500 animate-pulse'
                : (streak?.tier || 'bronze') === 'silver'
                ? 'text-slate-500 fill-slate-400'
                : 'text-amber-500 fill-amber-500'
            }`} />
          </div>
          <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>{streak?.currentStreak || learningState?.studyStreakDays || 1} Days</span>
            <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${
              (streak?.tier || 'bronze') === 'gold'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : (streak?.tier || 'bronze') === 'silver'
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {streak?.tier || 'bronze'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Best: {streak?.longestStreak || streak?.currentStreak || 1}d • {
              (streak?.tier || 'bronze') === 'gold'
                ? 'Gold Mastery'
                : `${streak?.nextTierTarget ? Math.max(1, streak.nextTierTarget - (streak?.currentStreak || 1)) : 1}d to next tier`
            }
          </p>
        </div>

        {/* Learning Progress */}
        <div
          onClick={() => setCurrentView('progress')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            {learningState?.completedActivitiesCount || 8} / 24 Tasks
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((learningState?.completedActivitiesCount || 8) / 24) * 100)}%` }}
            />
          </div>
        </div>

        {/* Knowledge Level */}
        <div
          onClick={() => setCurrentView('progress')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Level</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>{learningState?.overallLevel || 'Intermediate'}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {learningState?.strongTopics?.length || 2} strong • {learningState?.weakTopics?.length || 2} weak
          </p>
        </div>

        {/* Exam Readiness */}
        <div
          onClick={() => setCurrentView('progress')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exam Readiness</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
            <span>{learningState?.examReadiness || 62}%</span>
            <span className="text-[10px] font-normal text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${learningState?.examReadiness || 62}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Plan & Knowledge Map Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Today's Personalized Learning Plan */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {learningPlan?.title || "Today's Personalized Plan"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pedagogical Route: Theory → Example → Practice → Build → Apply
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {learningPlan?.items.filter(i => i.completed).length || 0} / {learningPlan?.items.length || 0} done
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('learning-plan')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (learningPlan?.items.length || 0) > 0
                    ? Math.round(
                        ((learningPlan?.items.filter(i => i.completed).length || 0) /
                          (learningPlan?.items.length || 1)) *
                          100
                      )
                    : 0
                }%`
              }}
            />
          </div>

          {/* Plan items preview with interactive completion toggle and direct launch */}
          <div className="space-y-2.5">
            {(learningPlan?.items || []).slice(0, 5).map((item, idx) => {
              const stageLabel =
                item.practicalRouteStage === 'theory' || item.type === 'learn'
                  ? 'Theory'
                  : item.practicalRouteStage === 'example' || item.type === 'example'
                  ? 'Example'
                  : item.practicalRouteStage === 'practice' || item.type === 'practice'
                  ? 'Practice'
                  : item.practicalRouteStage === 'build' || item.type === 'code'
                  ? 'Build'
                  : 'Apply';

              const stageColor =
                stageLabel === 'Theory'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  : stageLabel === 'Example'
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : stageLabel === 'Practice'
                  ? 'bg-amber-50 text-amber-800 border-amber-100'
                  : stageLabel === 'Build'
                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    item.completed
                      ? 'bg-slate-50/70 border-slate-200/80 text-slate-500'
                      : item.status === 'in_progress'
                      ? 'bg-indigo-50/30 border-indigo-200 text-slate-900 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => togglePlanItem(item.id)}
                      className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-600 transition shrink-0"
                      title={item.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-indigo-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          #{item.stepNumber || idx + 1}
                        </span>
                        <span className={`text-xs font-bold truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${stageColor}`}>
                          {stageLabel}
                        </span>
                        {item.status === 'in_progress' && !item.completed && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.estimatedMinutes}m
                    </span>
                    <button
                      type="button"
                      onClick={() => launchActivity(item)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        item.completed
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          : item.status === 'in_progress'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      <span>{item.completed ? 'Review' : item.status === 'in_progress' ? 'Resume' : 'Start'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>
              Target Focus: <strong className="text-slate-800">{learningPlan?.targetTopic || 'Inheritance'}</strong>
            </span>
            <span className="text-indigo-600 font-medium">
              ~{learningPlan?.estimatedTotalMinutes || 65} min total
            </span>
          </div>
        </div>

        {/* Right Col: Knowledge Map Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  LEADENT Knowledge Map
                </h3>
                <p className="text-[11px] text-slate-500">Calibrated topic proficiency matrix</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('progress')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Deep Dive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dynamic topic mastery, trends & proficiencies */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {((learningState?.topicProficiencies && Object.keys(learningState.topicProficiencies).length > 0) ||
              (knowledgeMap?.topicProficiencies && Object.keys(knowledgeMap.topicProficiencies).length > 0)) ? (
              Object.entries(learningState?.topicProficiencies || knowledgeMap?.topicProficiencies || {}).map(([topic, prof]) => {
                const mastery = learningState?.topicMastery?.[topic] ?? (
                  prof === 'Strong' ? 88 : prof === 'Good' ? 72 : prof === 'Moderate' ? 55 : prof === 'Weak' ? 38 : 20
                );
                const trend = learningState?.topicTrends?.[topic];
                const color =
                  prof === 'Strong' || mastery >= 80
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : prof === 'Good' || mastery >= 60
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : prof === 'Moderate' || mastery >= 40
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                    : prof === 'Weak' || mastery >= 20
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200';

                return (
                  <div
                    key={topic}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-100 text-xs bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 capitalize">
                        {topic.replace('-', ' ')}
                      </span>
                      {learningState?.topicMastery?.[topic] !== undefined && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {mastery}%
                        </span>
                      )}
                      {trend === 'improving' && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded" title="Performance improving based on recent evidence">
                          ↗ Improving
                        </span>
                      )}
                      {trend === 'struggling' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded" title="Identified as needing reinforcement">
                          ⚠ Reinforce
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
                      {prof}
                    </span>
                  </div>
                );
              })
            ) : (
              (activeCourse?.topics || []).map((t, idx) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-100 text-xs"
                >
                  <span className="font-semibold text-slate-800">{t.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-slate-600 bg-slate-100 border-slate-200">
                    {idx === 0 ? 'Diagnostic Pending' : 'Upcoming'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Diagnostic status note */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-900">Recommended Starting Point:</span>
              <span className="text-indigo-700 font-extrabold">
                {knowledgeMap?.recommendedStartingPoint || learningState?.recommendedStartingTopic || activeCourse?.topics[0]?.title || 'Core Fundamentals'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {knowledgeMap?.recommendedStartingWhy || learningState?.recommendedStartingWhy || knowledgeMap?.summary || `Diagnostic analysis establishes your personalized mastery baseline for ${activeCourse?.title || 'the curriculum'}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Study Platforms & Tools Card Section */}
      {dashboardResources.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>📚 Study Platforms</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verified learning tools, visualizers & references curated for <strong className="text-slate-700">{activeCourse?.title}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('resources')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {res.category}
                    </span>
                    {res.featured && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Featured
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{res.name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {res.description || res.whyUseful}
                  </p>

                  {res.recommendedReason && (
                    <p className="text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded border border-indigo-100/60 leading-snug">
                      <strong>Why for you:</strong> {res.recommendedReason}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentView('resources')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                  >
                    Details
                  </button>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
