import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Course,
  UserEnrollment,
  StudentLearningState,
  KnowledgeMap,
  LearningPlan,
  LearningPlanItem,
  FamiliarityLevel,
  PracticalStage,
  StudentStreak
} from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type NavView =
  | 'dashboard'
  | 'courses'
  | 'learning-plan'
  | 'practice'
  | 'assessments'
  | 'progress'
  | 'tutor'
  | 'resources';

interface LearningContextType {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  activeCourseId: string;
  setActiveCourseId: (id: string) => void;
  courses: Course[];
  activeCourse: Course | undefined;
  enrollments: UserEnrollment[];
  activeEnrollment: UserEnrollment | undefined;
  enrollInCourse: (courseId: string) => Promise<void>;
  switchActiveCourse: (courseId: string) => Promise<void>;
  learningState: StudentLearningState | null;
  streak: StudentStreak | null;
  knowledgeMap: KnowledgeMap | null;
  learningPlan: LearningPlan | null;
  loading: boolean;
  isCheckLevelOpen: boolean;
  openCheckLevelModal: (initialFamiliarity?: FamiliarityLevel) => void;
  closeCheckLevelModal: () => void;
  initialFamiliarityChoice: FamiliarityLevel | null;
  refreshAll: () => Promise<void>;
  refreshStreak: () => Promise<void>;
  recordStreakActivity: (type: string, details?: string) => Promise<void>;
  updateState: (updates: Partial<StudentLearningState>) => Promise<void>;
  setLearningPlan: React.Dispatch<React.SetStateAction<LearningPlan | null>>;
  setKnowledgeMap: React.Dispatch<React.SetStateAction<KnowledgeMap | null>>;
  setLearningState: React.Dispatch<React.SetStateAction<StudentLearningState | null>>;
  selectedPracticeTopic: string;
  setSelectedPracticeTopic: (topicId: string) => void;
  selectedPracticalStage: PracticalStage | null;
  setSelectedPracticalStage: (stage: PracticalStage | null) => void;
  selectedQuizTopic: string;
  setSelectedQuizTopic: (topicId: string) => void;
  activeTutorTopic: string;
  setActiveTutorTopic: (topic: string) => void;
  activeTutorActivity: LearningPlanItem | null;
  setActiveTutorActivity: (item: LearningPlanItem | null) => void;
  askTutorAboutStep: (item: LearningPlanItem) => void;
  triggerNextBestAction: () => void;
  togglePlanItem: (itemId: string) => Promise<void>;
  startPlanItem: (itemId: string) => Promise<void>;
  completePlanItem: (itemId: string) => Promise<void>;
  generatePlanForGoal: (goal?: string) => Promise<void>;
  launchActivity: (item: LearningPlanItem) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string>('java-programming');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [activeEnrollment, setActiveEnrollment] = useState<UserEnrollment | undefined>(undefined);
  const [learningState, setLearningState] = useState<StudentLearningState | null>(null);
  const [streak, setStreak] = useState<StudentStreak | null>(null);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckLevelOpen, setIsCheckLevelOpen] = useState(false);
  const [initialFamiliarityChoice, setInitialFamiliarityChoice] = useState<FamiliarityLevel | null>(null);

  // Selected topic contexts
  const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<string>('inheritance');
  const [selectedPracticalStage, setSelectedPracticalStage] = useState<PracticalStage | null>(null);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState<string>('inheritance');
  const [activeTutorTopic, setActiveTutorTopic] = useState<string>('Inheritance');
  const [activeTutorActivity, setActiveTutorActivity] = useState<LearningPlanItem | null>(null);

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];

  const refreshStreak = useCallback(async () => {
    if (!user) {
      setStreak(null);
      return;
    }
    try {
      const streakRes = await api.student.getStreak();
      if (streakRes && streakRes.streak) {
        setStreak(streakRes.streak);
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
    }
  }, [user]);

  const recordStreakActivity = useCallback(async (type: string, details?: string) => {
    if (!user) return;
    try {
      const res = await api.student.recordStreakActivity(type, details);
      if (res && res.streak) {
        setStreak(res.streak);
      }
    } catch (err) {
      console.error('Error recording streak activity:', err);
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      setActiveEnrollment(undefined);
      setLearningState(null);
      setStreak(null);
      setKnowledgeMap(null);
      setLearningPlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cRes, enrollRes, streakRes] = await Promise.all([
        api.courses.list(),
        api.student.getEnrollments(),
        api.student.getStreak()
      ]);

      setCourses(cRes.courses);
      if (streakRes && streakRes.streak) {
        setStreak(streakRes.streak);
      }
      const userEnrollments = enrollRes.enrollments || [];
      setEnrollments(userEnrollments);

      if (userEnrollments.length === 0) {
        // Real student has no courses enrolled yet
        setActiveEnrollment(undefined);
        setLearningState(null);
        setKnowledgeMap(null);
        setLearningPlan(null);
        setLoading(false);
        return;
      }

      // Student has one or more enrollments
      const currentActive = enrollRes.activeEnrollment || userEnrollments.find(e => e.active) || userEnrollments[0];
      setActiveEnrollment(currentActive);
      const effectiveCourseId = currentActive.courseId;
      setActiveCourseId(effectiveCourseId);

      const [sRes, kRes, pRes] = await Promise.all([
        api.student.getState(effectiveCourseId),
        api.knowledgeMap.get(effectiveCourseId),
        api.learningPlan.get(effectiveCourseId)
      ]);

      setLearningState(sRes.state);
      setKnowledgeMap(kRes.knowledgeMap);
      setLearningPlan(pRes.learningPlan);
    } catch (err) {
      console.error('Error refreshing learning state:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const enrollInCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await api.student.enroll(courseId);
      if (res.success) {
        setActiveCourseId(courseId);
        setActiveEnrollment(res.activeEnrollment || res.enrollment);
        await refreshAll();
      }
    } catch (err) {
      console.error('Failed to enroll in course:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchActiveCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await api.student.setActiveCourse(courseId);
      if (res.success) {
        setActiveCourseId(courseId);
        setActiveEnrollment(res.activeEnrollment);
        await refreshAll();
      }
    } catch (err) {
      console.error('Failed to switch active course:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateState = async (updates: Partial<StudentLearningState>) => {
    try {
      const res = await api.student.updateState(activeCourseId, updates);
      setLearningState(res.state);
    } catch (err) {
      console.error('Failed to update student state:', err);
    }
  };

  const openCheckLevelModal = (initial?: FamiliarityLevel) => {
    setInitialFamiliarityChoice(initial || null);
    setIsCheckLevelOpen(true);
  };

  const closeCheckLevelModal = () => {
    setIsCheckLevelOpen(false);
    setInitialFamiliarityChoice(null);
  };

  const triggerNextBestAction = () => {
    if (!learningState?.nextBestAction) return;
    const action = learningState.nextBestAction;

    if (action.actionType === 'practice') {
      setSelectedPracticeTopic(action.targetTopic.toLowerCase() || 'inheritance');
      setCurrentView('practice');
    } else if (action.actionType === 'quiz') {
      setSelectedQuizTopic(action.targetTopic.toLowerCase() || 'inheritance');
      setCurrentView('assessments');
    } else if (action.actionType === 'learn') {
      setCurrentView('tutor');
    } else if (action.actionType === 'assessment') {
      openCheckLevelModal();
    } else {
      setCurrentView('learning-plan');
    }
  };

  const togglePlanItem = async (itemId: string) => {
    try {
      const res = await api.learningPlan.toggleItem(activeCourseId, itemId);
      if (res.learningPlan) setLearningPlan(res.learningPlan);
      if (res.learningState) setLearningState(res.learningState);
    } catch (err) {
      console.error('Failed to toggle plan item:', err);
    }
  };

  const startPlanItem = async (itemId: string) => {
    try {
      const res = await api.learningPlan.startActivity(activeCourseId, itemId);
      if (res.learningPlan) setLearningPlan(res.learningPlan);
      if (res.learningState) setLearningState(res.learningState);
    } catch (err) {
      console.error('Failed to start plan activity:', err);
    }
  };

  const completePlanItem = async (itemId: string) => {
    try {
      const res = await api.learningPlan.completeActivity(activeCourseId, itemId);
      if (res.learningPlan) setLearningPlan(res.learningPlan);
      if (res.learningState) setLearningState(res.learningState);
    } catch (err) {
      console.error('Failed to complete plan activity:', err);
    }
  };

  const generatePlanForGoal = async (goal?: string) => {
    try {
      setLoading(true);
      const res = await api.learningPlan.generateNew(activeCourseId, goal);
      if (res.learningPlan) setLearningPlan(res.learningPlan);
      if (res.learningState) setLearningState(res.learningState);
    } catch (err) {
      console.error('Failed to generate learning plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const askTutorAboutStep = (item: LearningPlanItem) => {
    if (item.topicTitle) {
      setActiveTutorTopic(item.topicTitle);
    } else if (item.topicId) {
      setActiveTutorTopic(item.topicId);
    }
    setActiveTutorActivity(item);
    setCurrentView('tutor');
  };

  const launchActivity = (item: LearningPlanItem) => {
    if (item.topicId) {
      setSelectedPracticeTopic(item.topicId);
      setSelectedQuizTopic(item.topicId);
      setActiveTutorTopic(item.topicTitle || item.topicId);
    }
    if (item.status !== 'completed') {
      startPlanItem(item.id);
    }

    // Set target practical stage if launching into practical route
    if (item.practicalRouteStage) {
      const stageMap: Record<string, PracticalStage> = {
        theory: 'understand',
        understand: 'understand',
        example: 'example',
        practice: 'practice',
        build: 'build',
        apply: 'apply'
      };
      setSelectedPracticalStage(stageMap[item.practicalRouteStage] || 'understand');
    } else if (item.type === 'code') {
      setSelectedPracticalStage('build');
    } else if (item.type === 'example') {
      setSelectedPracticalStage('example');
    } else if (item.type === 'practice') {
      setSelectedPracticalStage('practice');
    }

    if (item.actionRoute === 'practice' || item.type === 'code' || item.type === 'example') {
      setCurrentView('practice');
    } else if (item.actionRoute === 'quiz' || item.type === 'quiz') {
      setCurrentView('assessments');
    } else if (item.actionRoute === 'tutor' || item.type === 'learn') {
      setActiveTutorActivity(item);
      setCurrentView('tutor');
    } else {
      setCurrentView('practice');
    }
  };

  return (
    <LearningContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeCourseId,
        setActiveCourseId,
        courses,
        activeCourse,
        enrollments,
        activeEnrollment,
        enrollInCourse,
        switchActiveCourse,
        learningState,
        streak,
        knowledgeMap,
        learningPlan,
        loading,
        isCheckLevelOpen,
        openCheckLevelModal,
        closeCheckLevelModal,
        initialFamiliarityChoice,
        refreshAll,
        refreshStreak,
        recordStreakActivity,
        updateState,
        setLearningPlan,
        setKnowledgeMap,
        setLearningState,
        selectedPracticeTopic,
        setSelectedPracticeTopic,
        selectedPracticalStage,
        setSelectedPracticalStage,
        selectedQuizTopic,
        setSelectedQuizTopic,
        activeTutorTopic,
        setActiveTutorTopic,
        activeTutorActivity,
        setActiveTutorActivity,
        askTutorAboutStep,
        triggerNextBestAction,
        togglePlanItem,
        startPlanItem,
        completePlanItem,
        generatePlanForGoal,
        launchActivity
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
