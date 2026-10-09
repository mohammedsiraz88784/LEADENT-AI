import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  Code2,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const CoursesView: React.FC = () => {
  const {
    activeCourse,
    courses,
    setActiveCourseId,
    activeCourseId,
    learningState,
    setSelectedPracticeTopic,
    setSelectedQuizTopic,
    setCurrentView,
    openCheckLevelModal,
    enrollments,
    enrollInCourse,
    switchActiveCourse
  } = useLearning();

  const isEnrolled = enrollments.some(e => e.courseId === activeCourseId);
  const isActive = activeCourseId === activeCourse?.id && enrollments.some(e => e.courseId === activeCourseId && e.isActive);

  const getTopicStatus = (topicId: string) => {
    const strong = learningState?.strongTopics || [];
    const weak = learningState?.weakTopics || [];
    const current = learningState?.currentTopic.toLowerCase() || '';

    if (strong.some(s => s.toLowerCase().includes(topicId.toLowerCase()))) {
      return { label: 'Mastered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (topicId.toLowerCase() === current) {
      return { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse' };
    }
    if (weak.some(w => w.toLowerCase().includes(topicId.toLowerCase()))) {
      return { label: 'Gap Identified', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Upcoming', color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Curriculum & Syllabus
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Code: <strong className="text-slate-800">{activeCourse?.code || 'CS201'}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {activeCourse?.title || 'Java Programming'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCourse?.description || 'Object-oriented programming, memory mechanics, robust architectures.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEnrolled ? (
            <button
              type="button"
              onClick={() => enrollInCourse(activeCourse?.id || 'data-structures')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-200" />
              <span>Enroll in {activeCourse?.title}</span>
            </button>
          ) : !isActive ? (
            <button
              type="button"
              onClick={() => switchActiveCourse(activeCourse?.id || 'data-structures')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <span>Set as Active Course</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              ✓ Active Course
            </span>
          )}

          <button
            type="button"
            onClick={() => openCheckLevelModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-2xs transition active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>CHECK MY LEVEL</span>
          </button>
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {courses.map(course => {
          const isCourseEnrolled = enrollments.some(e => e.courseId === course.id);
          const isCourseActive = activeCourseId === course.id;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setActiveCourseId(course.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                course.id === activeCourseId
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{course.title}</span>
              {isCourseEnrolled ? (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isCourseActive ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Enrolled
                </span>
              ) : (
                <span className="text-[10px] opacity-70">({course.topics.length} topics)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Topics Syllabus Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Course Syllabus & Topic Sequence</h2>
          <span className="text-xs text-slate-500">
            Active Priority: <strong className="text-indigo-600">{learningState?.currentTopic}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCourse?.topics.map((topic, index) => {
            const status = getTopicStatus(topic.id);
            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {topic.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Subtopics chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.subtopics.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topic.estimatedHours} hrs syllabus
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPracticeTopic(topic.id);
                        setCurrentView('practice');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>Practice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuizTopic(topic.id);
                        setCurrentView('assessments');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <Award className="w-3 h-3" />
                      <span>Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
