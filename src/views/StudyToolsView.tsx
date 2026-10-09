import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  ExternalLink,
  Search,
  BookOpen,
  Eye,
  Code2,
  FileText,
  Sparkles,
  ChevronRight,
  Compass,
  GraduationCap,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { StudyResource, ResourceCategory } from '../types';
import { api } from '../services/api';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Study Platforms': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Globe
  },
  'Interactive Visualization': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Eye
  },
  'Simulators / Visualizers': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Eye
  },
  'Learn / Study': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: BookOpen
  },
  'Practice': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Code2
  },
  'Problem Solving': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: Code2
  },
  'Documentation / Reference': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: FileText
  },
  'Coding / Development': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: Code2
  },
  'Project / Practical Learning': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: Layers
  }
};

export const StudyToolsView: React.FC = () => {
  const { user } = useAuth();
  const {
    activeCourseId,
    activeCourse,
    courses,
    enrollments,
    activeEnrollment,
    switchActiveCourse,
    setCurrentView,
    learningState
  } = useLearning();

  const [resources, setResources] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');

  const hasEnrollments = enrollments.length > 0;
  const isEnrolledInActive = enrollments.some(e => e.courseId === activeCourseId);

  // Fetch resources whenever activeCourseId or selectedTopicId changes
  useEffect(() => {
    if (!activeCourseId || !hasEnrollments) {
      setResources([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const topicParam = selectedTopicId !== 'all' ? selectedTopicId : undefined;
    const catParam = selectedCategory !== 'All' ? selectedCategory : undefined;

    api.resources
      .getByCourse(activeCourseId, topicParam, catParam)
      .then(res => {
        if (isMounted) {
          setResources(res.resources);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load study resources');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeCourseId, selectedTopicId, selectedCategory, hasEnrollments]);

  // Categories present for this course
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    resources.forEach(r => cats.add(r.category));
    return ['All', ...Array.from(cats)];
  }, [resources]);

  // Filtered resources by search query
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.whyUseful.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        (r.recommendedReason && r.recommendedReason.toLowerCase().includes(q))
      );
    });
  }, [resources, searchQuery]);

  // =========================================================================
  // EMPTY STATE: User has no enrolled courses
  // =========================================================================
  if (!hasEnrollments || !isEnrolledInActive) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <Compass className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            No course selected yet.
          </h2>
          <p className="text-base text-slate-600 max-w-md mx-auto mb-8">
            Enroll in a course to receive personalized study resources, interactive tools, and visualizations tailored to your curriculum.
          </p>

          <button
            onClick={() => setCurrentView('courses')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Explore Courses</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Educational preview teaser */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
              Platforms You'll Unlock Once Enrolled
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800 text-sm">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Visual Simulators</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interactive state diagrams like VisuAlgo & Python Tutor to see pointers and memory in real time.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800 text-sm">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Authoritative References</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct official language documentation from Oracle, Python Software Foundation, and MDN.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800 text-sm">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <span>Pattern Practice</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Curated problem roadmaps on NeetCode and LeetCode structured by foundational patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active course data
  const currentCourse = courses.find(c => c.id === activeCourseId) || activeCourse;
  const currentTopic = currentCourse?.topics.find(t => t.id === selectedTopicId);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* ===================================================================== */}
      {/* Top Banner & Context Header */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                {currentCourse?.code || 'Course'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Personalized Study Tools & Reference Hub
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Globe className="w-7 h-7 text-indigo-400" />
              <span>{currentCourse?.title || 'Study Platforms & Tools'}</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verified, authoritative learning platforms, live visualizers, documentation, and practice roadmaps curated specifically for <strong className="text-white">{currentCourse?.title}</strong>.
            </p>
          </div>

          {/* Enrolled course switcher if enrolled in multiple */}
          {enrollments.length > 1 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 shrink-0">
              <label className="block text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mb-1.5">
                Switch Enrolled Course
              </label>
              <select
                value={activeCourseId}
                onChange={e => switchActiveCourse(e.target.value)}
                className="w-full bg-slate-800 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                {enrollments.map(e => (
                  <option key={e.id} value={e.courseId} className="bg-slate-900 text-white">
                    {e.courseTitle}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Personalized Learning Status Pill */}
        {learningState && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Active Focus: <strong className="text-white">{learningState.currentTopic || 'Syllabus Core'}</strong></span>
            </div>
            {learningState.overallLevel && (
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                Level: {learningState.overallLevel}
              </span>
            )}
            {learningState.knowledgeGaps && learningState.knowledgeGaps.length > 0 && (
              <span className="text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {learningState.knowledgeGaps.length} targeted review area(s) detected
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* Controls: Search, Topic Filters & Category Filters */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search tools, topics, or features for ${currentCourse?.title || 'this course'}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Topic Filter Chips (Syllabus Driven) */}
        {currentCourse?.topics && currentCourse.topics.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Filter by Syllabus Topic:
              </span>
              {selectedTopicId !== 'all' && (
                <button
                  onClick={() => setSelectedTopicId('all')}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Reset Topic
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTopicId('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTopicId === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Topics ({resources.length})
              </button>
              {currentCourse.topics.map(topic => {
                const isSelected = selectedTopicId === topic.id;
                const isCurrentTopic = learningState?.currentTopic?.toLowerCase() === topic.id.toLowerCase();
                const isGap = learningState?.knowledgeGaps?.some(g =>
                  g.toLowerCase().includes(topic.id.toLowerCase()) || topic.title.toLowerCase().includes(g.toLowerCase())
                );

                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(isSelected ? 'all' : topic.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{topic.title}</span>
                    {isCurrentTopic && !isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active topic" />
                    )}
                    {isGap && !isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Needs review" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filters */}
        {availableCategories.length > 2 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-100 text-indigo-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* Resource Cards Grid */}
      {/* ===================================================================== */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading verified course resources...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-center">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={() => setSelectedTopicId('all')}
            className="mt-3 text-xs font-semibold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No resources found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No study tools match your current filters. Try resetting your search query or topic filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTopicId('all');
            }}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredResources.length}</strong> verified study tools for{' '}
              <strong>{currentCourse?.title}</strong>
              {selectedTopicId !== 'all' && currentTopic && ` (${currentTopic.title})`}
            </span>
            <span className="hidden sm:inline text-slate-400">
              All links open official external sites in new tabs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map(resource => {
              const catConfig = CATEGORY_COLORS[resource.category] || {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                border: 'border-slate-200',
                icon: Globe
              };
              const IconComp = catConfig.icon;

              return (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header: Category Badge + Featured Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{resource.category}</span>
                      </span>

                      {resource.featured && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Title and Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        <span>{resource.name}</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>

                    {/* Why Useful Highlight Box */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Why Useful
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {resource.whyUseful}
                      </p>
                    </div>

                    {/* Context-Aware Recommendation Rationale */}
                    {resource.recommendedReason && (
                      <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100/80 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-indigo-900 leading-snug">
                          <strong className="font-semibold text-indigo-950">Why for you: </strong>
                          {resource.recommendedReason}
                        </p>
                      </div>
                    )}

                    {/* Topic Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {resource.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setCurrentView('tutor');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
                      title="Ask AI Tutor how to utilize this resource"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask AI Tutor</span>
                    </button>

                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer"
                    >
                      <span>Open Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
