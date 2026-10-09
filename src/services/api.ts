import {
  User,
  UserEnrollment,
  Course,
  StudentLearningState,
  DiagnosticAssessment,
  FamiliarityLevel,
  KnowledgeMap,
  LearningPlan,
  TutorMessage,
  PracticalTask,
  Quiz,
  QuizResult,
  ActivityHistoryItem,
  StudentTutorContext,
  PracticalRoute,
  PracticalEvaluationFeedback,
  PracticalActivityAttempt,
  LearningEvidence,
  NextBestAction,
  StudyResource,
  PracticeTutorContext
} from '../types';

function getAuthToken(): string {
  return localStorage.getItem('leadent_token') || '';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  auth: {
    loginDemo: async (): Promise<{ user: User; token: string }> => {
      const res = await request<{ user: User; token: string }>('/api/auth/demo', { method: 'POST' });
      localStorage.setItem('leadent_token', res.token);
      return res;
    },
    loginWithGoogle: async (params: { credential?: string; accessToken?: string }): Promise<{ user: User; token: string; isNew?: boolean }> => {
      const res = await request<{ user: User; token: string; isNew?: boolean }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      localStorage.setItem('leadent_token', res.token);
      return res;
    },
    register: async (params: {
      name: string;
      email: string;
      password?: string;
      semester?: string;
      college?: string;
      otp?: string;
    }): Promise<{ user: User; token: string; emailVerified?: boolean }> => {
      const res = await request<{ user: User; token: string; emailVerified?: boolean }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      localStorage.setItem('leadent_token', res.token);
      return res;
    },
    sendOtp: async (
      email: string,
      purpose: 'registration' | 'login' | 'verification' = 'verification'
    ): Promise<{
      success: boolean;
      email: string;
      cooldownSeconds: number;
      expiresInSeconds: number;
      emailDeliveryConfigured: boolean;
      message: string;
      retryAfterSeconds?: number;
      error?: string;
    }> => {
      return request('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email, purpose })
      });
    },
    verifyOtp: async (
      email: string,
      otp: string,
      purpose: 'registration' | 'login' | 'verification' = 'verification'
    ): Promise<{
      success: boolean;
      verified: boolean;
      user?: User;
      token?: string;
      message?: string;
      error?: string;
      expired?: boolean;
      attemptsExceeded?: boolean;
      remainingAttempts?: number;
    }> => {
      const res = await request<{
        success: boolean;
        verified: boolean;
        user?: User;
        token?: string;
        message?: string;
        error?: string;
        expired?: boolean;
        attemptsExceeded?: boolean;
        remainingAttempts?: number;
      }>('/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp, purpose })
      });
      if (res.token) {
        localStorage.setItem('leadent_token', res.token);
      }
      return res;
    },
    getOtpStatus: async (email: string): Promise<{
      hasActive: boolean;
      cooldownRemainingSeconds: number;
      expiresInSeconds: number;
      emailDeliveryConfigured: boolean;
    }> => {
      return request(`/api/auth/otp/status?email=${encodeURIComponent(email)}`);
    },
    getOtpConfig: async (): Promise<{
      configured: boolean;
      requiredEnvVars: { name: string; description: string; set: boolean }[];
    }> => {
      return request('/api/auth/otp/config');
    },
    login: async (email: string, password?: string, name?: string): Promise<{ user: User; token: string }> => {
      const res = await request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
      localStorage.setItem('leadent_token', res.token);
      return res;
    },
    getMe: async (): Promise<{ user: User }> => {
      return request<{ user: User }>('/api/auth/me');
    },
    logout: async () => {
      localStorage.removeItem('leadent_token');
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } catch {
        // ignore
      }
    }
  },

  courses: {
    list: async (): Promise<{ courses: Course[] }> => {
      return request<{ courses: Course[] }>('/api/courses');
    },
    get: async (id: string): Promise<{ course: Course }> => {
      return request<{ course: Course }>(`/api/courses/${id}`);
    }
  },

  student: {
    getEnrollments: async (): Promise<{ enrollments: UserEnrollment[]; activeEnrollment?: UserEnrollment }> => {
      return request<{ enrollments: UserEnrollment[]; activeEnrollment?: UserEnrollment }>('/api/student/enrollments');
    },
    enroll: async (courseId: string): Promise<{ success: boolean; enrollment: UserEnrollment; isNew: boolean; activeEnrollment: UserEnrollment }> => {
      return request<{ success: boolean; enrollment: UserEnrollment; isNew: boolean; activeEnrollment: UserEnrollment }>('/api/student/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
    },
    setActiveCourse: async (courseId: string): Promise<{ success: boolean; activeEnrollment: UserEnrollment }> => {
      return request<{ success: boolean; activeEnrollment: UserEnrollment }>('/api/student/active-course', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
    },
    getState: async (courseId: string = 'java-programming'): Promise<{ state: StudentLearningState }> => {
      return request<{ state: StudentLearningState }>(`/api/student/state?courseId=${courseId}`);
    },
    updateState: async (courseId: string, updates: Partial<StudentLearningState>): Promise<{ state: StudentLearningState }> => {
      return request<{ state: StudentLearningState }>('/api/student/state', {
        method: 'POST',
        body: JSON.stringify({ courseId, updates })
      });
    },
    getStreak: async (): Promise<{ streak: any }> => {
      return request<{ streak: any }>('/api/student/streak');
    },
    recordStreakActivity: async (type: string, details?: string): Promise<{ streak: any }> => {
      return request<{ streak: any }>('/api/student/streak/activity', {
        method: 'POST',
        body: JSON.stringify({ type, details })
      });
    },
    getEvidence: async (courseId: string = 'java-programming'): Promise<{ evidences: LearningEvidence[] }> => {
      return request<{ evidences: LearningEvidence[] }>(`/api/student/evidence?courseId=${courseId}`);
    },
    evaluateNextAction: async (courseId: string = 'java-programming'): Promise<{ state: StudentLearningState; nextBestAction: NextBestAction }> => {
      return request<{ state: StudentLearningState; nextBestAction: NextBestAction }>('/api/student/next-action', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
    }
  },

  diagnostic: {
    generate: async (courseId: string, familiarity: FamiliarityLevel): Promise<{ assessment: DiagnosticAssessment }> => {
      return request<{ assessment: DiagnosticAssessment }>('/api/diagnostic/generate', {
        method: 'POST',
        body: JSON.stringify({ courseId, familiarity })
      });
    },
    submit: async (
      courseId: string,
      familiarity: FamiliarityLevel,
      questions: any[],
      answers: Record<string, string>
    ): Promise<{ knowledgeMap: KnowledgeMap; learningPlan: LearningPlan; learningState: StudentLearningState }> => {
      return request<{ knowledgeMap: KnowledgeMap; learningPlan: LearningPlan; learningState: StudentLearningState }>(
        '/api/diagnostic/submit',
        {
          method: 'POST',
          body: JSON.stringify({ courseId, familiarity, questions, answers })
        }
      );
    }
  },

  knowledgeMap: {
    get: async (courseId: string = 'java-programming'): Promise<{ knowledgeMap: KnowledgeMap | null }> => {
      return request<{ knowledgeMap: KnowledgeMap | null }>(`/api/knowledge-map?courseId=${courseId}`);
    }
  },

  learningPlan: {
    get: async (courseId: string = 'java-programming'): Promise<{ learningPlan: LearningPlan | null }> => {
      return request<{ learningPlan: LearningPlan | null }>(`/api/learning-plan?courseId=${courseId}`);
    },
    toggleItem: async (courseId: string, itemId: string): Promise<{ learningPlan: LearningPlan; learningState?: StudentLearningState }> => {
      return request<{ learningPlan: LearningPlan; learningState?: StudentLearningState }>('/api/learning-plan/toggle', {
        method: 'POST',
        body: JSON.stringify({ courseId, itemId })
      });
    },
    startActivity: async (courseId: string, itemId: string): Promise<{ learningPlan: LearningPlan; learningState?: StudentLearningState }> => {
      return request<{ learningPlan: LearningPlan; learningState?: StudentLearningState }>('/api/learning-plan/start', {
        method: 'POST',
        body: JSON.stringify({ courseId, itemId })
      });
    },
    completeActivity: async (courseId: string, itemId: string): Promise<{ learningPlan: LearningPlan; learningState?: StudentLearningState }> => {
      return request<{ learningPlan: LearningPlan; learningState?: StudentLearningState }>('/api/learning-plan/complete', {
        method: 'POST',
        body: JSON.stringify({ courseId, itemId })
      });
    },
    generateNew: async (courseId: string, studentGoal?: string): Promise<{ learningPlan: LearningPlan; learningState?: StudentLearningState }> => {
      return request<{ learningPlan: LearningPlan; learningState?: StudentLearningState }>('/api/learning-plan/generate', {
        method: 'POST',
        body: JSON.stringify({ courseId, studentGoal })
      });
    }
  },

  tutor: {
    getContext: async (courseId: string = 'java-programming', topic?: string, activityId?: string): Promise<{ context: StudentTutorContext }> => {
      let url = `/api/tutor/context?courseId=${encodeURIComponent(courseId)}`;
      if (topic) url += `&topic=${encodeURIComponent(topic)}`;
      if (activityId) url += `&activityId=${encodeURIComponent(activityId)}`;
      return request<{ context: StudentTutorContext }>(url);
    },
    setTopic: async (courseId: string, topic: string): Promise<{ success: boolean; context: StudentTutorContext }> => {
      return request<{ success: boolean; context: StudentTutorContext }>('/api/tutor/topic', {
        method: 'POST',
        body: JSON.stringify({ courseId, topic })
      });
    },
    getHistory: async (courseId: string = 'java-programming'): Promise<{ messages: TutorMessage[] }> => {
      return request<{ messages: TutorMessage[] }>(`/api/tutor/history?courseId=${courseId}`);
    },
    sendMessage: async (
      courseId: string,
      message: string,
      options?: {
        mode?: string;
        topic?: string;
        activityId?: string;
        activityTitle?: string;
        codeSnippet?: string;
        image?: { data: string; mimeType: string; name?: string; previewUrl?: string };
        imageUrl?: string;
        practiceContext?: PracticeTutorContext;
      }
    ): Promise<{ response: TutorMessage; context?: StudentTutorContext }> => {
      return request<{ response: TutorMessage; context?: StudentTutorContext }>('/api/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({ courseId, message, ...options })
      });
    },
    clearHistory: async (courseId: string = 'java-programming'): Promise<{ success: boolean }> => {
      return request<{ success: boolean }>('/api/tutor/clear', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
    },
    transcribeVoice: async (audioData: string, mimeType?: string): Promise<{ transcript: string }> => {
      return request<{ transcript: string }>('/api/tutor/voice-transcribe', {
        method: 'POST',
        body: JSON.stringify({ audioData, mimeType })
      });
    }
  },

  practice: {
    getTask: async (topicId: string = 'inheritance'): Promise<{ task: PracticalTask }> => {
      return request<{ task: PracticalTask }>(`/api/practice/${topicId}`);
    },
    submitCode: async (
      topicId: string,
      submittedCode: string,
      courseId: string = 'java-programming'
    ): Promise<{ result: any; state?: StudentLearningState }> => {
      return request<{ result: any; state?: StudentLearningState }>('/api/practice/submit', {
        method: 'POST',
        body: JSON.stringify({ topicId, submittedCode, courseId })
      });
    }
  },

  practicalRoute: {
    get: async (courseId: string = 'java-programming', topicId: string = 'inheritance'): Promise<{ route: PracticalRoute }> => {
      return request<{ route: PracticalRoute }>(`/api/practical-route/${courseId}/${topicId}`);
    },
    generate: async (params: {
      courseId: string;
      topicId: string;
      topicTitle?: string;
      level?: string;
      planItemId?: string;
    }): Promise<{ route: PracticalRoute }> => {
      return request<{ route: PracticalRoute }>('/api/practical-route/generate', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },
    submit: async (params: {
      courseId?: string;
      topicId?: string;
      activityId: string;
      submission?: string;
      code?: string;
    }): Promise<{
      feedback: PracticalEvaluationFeedback;
      route: PracticalRoute;
      state: StudentLearningState;
      plan?: LearningPlan;
    }> => {
      return request<{
        feedback: PracticalEvaluationFeedback;
        route: PracticalRoute;
        state: StudentLearningState;
        plan?: LearningPlan;
      }>('/api/practical-route/submit', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },
    getAttempts: async (courseId?: string, topicId?: string): Promise<{ attempts: PracticalActivityAttempt[] }> => {
      const q = new URLSearchParams();
      if (courseId) q.append('courseId', courseId);
      if (topicId) q.append('topicId', topicId);
      return request<{ attempts: PracticalActivityAttempt[] }>(`/api/practical-route/attempts?${q.toString()}`);
    }
  },

  quiz: {
    get: async (topicId: string = 'inheritance', courseId: string = 'java-programming'): Promise<{ quiz: Quiz }> => {
      return request<{ quiz: Quiz }>(`/api/quiz/${topicId}?courseId=${courseId}`);
    },
    submit: async (
      quiz: Quiz,
      answers: Record<string, string>,
      courseId: string = 'java-programming'
    ): Promise<{ result: QuizResult; state: StudentLearningState }> => {
      return request<{ result: QuizResult; state: StudentLearningState }>('/api/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ quiz, answers, courseId })
      });
    }
  },

  activity: {
    getLogs: async (): Promise<{ logs: ActivityHistoryItem[] }> => {
      return request<{ logs: ActivityHistoryItem[] }>('/api/activity-logs');
    }
  },

  resources: {
    getByCourse: async (
      courseId: string,
      topicId?: string,
      category?: string
    ): Promise<{ courseId: string; courseTitle: string; total: number; resources: StudyResource[] }> => {
      const q = new URLSearchParams();
      q.append('courseId', courseId);
      if (topicId) q.append('topicId', topicId);
      if (category && category !== 'All') q.append('category', category);
      return request<{ courseId: string; courseTitle: string; total: number; resources: StudyResource[] }>(
        `/api/resources?${q.toString()}`
      );
    }
  }
};
