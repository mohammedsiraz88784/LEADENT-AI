import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  UserEnrollment,
  StudentLearningState,
  KnowledgeMap,
  LearningPlan,
  QuizResult,
  ActivityHistoryItem,
  TutorMessage,
  PracticalTask,
  NextBestAction,
  StudentTutorContext,
  PracticalRoute,
  PracticalActivityAttempt,
  PracticalEvaluationFeedback,
  Quiz,
  LearningEvidence,
  StudentStreak,
  ConsistencyTier
} from '../src/types';
import { COURSES, getCourseById } from './syllabus';

export interface UserRecord extends User {
  passwordHash?: string;
  createdAt?: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  enrollments?: Record<string, UserEnrollment[]>; // key: userId
  userStreaks?: Record<string, StudentStreak>; // key: userId
  learningStates: Record<string, StudentLearningState>; // key: `${userId}_${courseId}`
  learningEvidences: Record<string, LearningEvidence[]>; // key: `${userId}_${courseId}`
  knowledgeMaps: Record<string, KnowledgeMap>; // key: `${userId}_${courseId}`
  learningPlans: Record<string, LearningPlan>; // key: `${userId}_${courseId}`
  quizResults: Record<string, QuizResult[]>; // key: `${userId}_${courseId}`
  cachedQuizzes: Record<string, Quiz>; // key: `${courseId}_${topicId}`
  practicalSubmissions: Record<string, { taskId: string; code: string; passed: boolean; submittedAt: string }[]>;
  practicalRoutes: Record<string, PracticalRoute>; // key: `${userId}_${courseId}_${topicId}`
  practicalAttempts: Record<string, PracticalActivityAttempt[]>; // key: userId
  tutorHistories: Record<string, TutorMessage[]>; // key: `${userId}_${courseId}`
  activityLogs: Record<string, ActivityHistoryItem[]>; // key: userId
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

function sanitizeUser(user: UserRecord): User {
  const { passwordHash, ...safe } = user;
  return safe;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'leadent_db.json');

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeConsistencyTier(streakDays: number): {
  tier: ConsistencyTier;
  nextTierTarget?: {
    tier: ConsistencyTier;
    daysRemaining: number;
    threshold: number;
  };
} {
  if (streakDays >= 14) {
    return {
      tier: 'GOLD',
      nextTierTarget: {
        tier: 'GOLD',
        daysRemaining: 0,
        threshold: 14
      }
    };
  }
  if (streakDays >= 7) {
    return {
      tier: 'SILVER',
      nextTierTarget: {
        tier: 'GOLD',
        daysRemaining: 14 - streakDays,
        threshold: 14
      }
    };
  }
  return {
    tier: 'BRONZE',
    nextTierTarget: {
      tier: 'SILVER',
      daysRemaining: Math.max(1, 7 - streakDays),
      threshold: 7
    }
  };
}

const INITIAL_DEMO_USER: User = {
  id: 'usr_alex_chen',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  semester: '4th Semester (Computer Science)',
  college: 'Department of Computer Science & Engineering',
  accountType: 'demo'
};

const INITIAL_DEMO_STREAK: StudentStreak = {
  userId: 'usr_alex_chen',
  currentStreak: 8,
  longestStreak: 15,
  lastActiveDate: getTodayDateString(),
  tier: 'SILVER',
  nextTierTarget: {
    tier: 'GOLD',
    daysRemaining: 6,
    threshold: 14
  },
  totalMeaningfulActivities: 24,
  lastActivityTimestamp: new Date().toISOString()
};

const DEFAULT_JAVA_NEXT_ACTION: NextBestAction = {
  title: 'Check Your Knowledge Level',
  actionText: 'Complete your diagnostic assessment to generate your personalized Java roadmap.',
  reason: 'Diagnostic baseline assessment is needed to identify weak and strong topics.',
  estimatedMinutes: 12,
  actionType: 'assessment',
  targetTopic: 'fundamentals',
  buttonLabel: 'CHECK MY LEVEL'
};

const INITIAL_LEARNING_EVIDENCES: LearningEvidence[] = [
  {
    id: 'evi_diag_init_1',
    userId: 'usr_alex_chen',
    courseId: 'java-programming',
    topicId: 'fundamentals',
    topicTitle: 'Fundamentals',
    source: 'diagnostic',
    score: 88,
    passed: true,
    details: 'Diagnostic Baseline: Strong comprehension of variables, control flow, loops, and primitive types.',
    timestamp: 'Yesterday at 4:30 PM',
    previousMastery: 80,
    newMastery: 88,
    conceptDemonstrated: 'Loops and Method Execution'
  },
  {
    id: 'evi_diag_init_2',
    userId: 'usr_alex_chen',
    courseId: 'java-programming',
    topicId: 'oop',
    topicTitle: 'OOP',
    source: 'diagnostic',
    score: 65,
    passed: true,
    details: 'Diagnostic Baseline: Understands class definition and encapsulation; constructor chaining needs polish.',
    timestamp: 'Yesterday at 4:35 PM',
    previousMastery: 60,
    newMastery: 65,
    conceptDemonstrated: 'Encapsulation & Constructors'
  },
  {
    id: 'evi_diag_init_3',
    userId: 'usr_alex_chen',
    courseId: 'java-programming',
    topicId: 'inheritance',
    topicTitle: 'Inheritance',
    source: 'diagnostic',
    score: 42,
    passed: false,
    details: 'Diagnostic Baseline: Struggled with super() constructor invocation and method overriding constraints.',
    timestamp: 'Yesterday at 4:40 PM',
    previousMastery: 35,
    newMastery: 42,
    conceptDemonstrated: 'Class Extension',
    mistakesIdentified: ['Failed super() constructor chaining', 'Attempted to override static methods']
  }
];

const INITIAL_JAVA_STATE: StudentLearningState = {
  studentId: 'usr_alex_chen',
  courseId: 'java-programming',
  courseTitle: 'Java Programming',
  overallLevel: 'Intermediate',
  overallMastery: 64,
  overallScore: 64,
  currentTopic: 'Inheritance',
  topicMastery: {
    'fundamentals': 88,
    'oop': 65,
    'inheritance': 42,
    'polymorphism': 52,
    'abstraction': 48,
    'interfaces': 32,
    'exception-handling': 62,
    'collections': 38,
    'file-handling': 30,
    'multithreading': 25,
    'jdbc': 20
  },
  topicProficiencies: {
    'fundamentals': 'Strong',
    'oop': 'Good',
    'inheritance': 'Moderate',
    'polymorphism': 'Moderate',
    'abstraction': 'Moderate',
    'interfaces': 'Weak',
    'exception-handling': 'Good',
    'collections': 'Weak',
    'file-handling': 'Weak',
    'multithreading': 'Beginner',
    'jdbc': 'Beginner'
  },
  topicTrends: {
    'fundamentals': 'stable',
    'oop': 'stable',
    'inheritance': 'struggling',
    'interfaces': 'struggling'
  },
  strongTopics: ['Fundamentals'],
  goodTopics: ['OOP', 'Exception Handling'],
  moderateTopics: ['Inheritance', 'Polymorphism', 'Abstraction'],
  weakTopics: ['Interfaces', 'Collections', 'File Handling'],
  beginnerTopics: ['Multithreading', 'JDBC'],
  knowledgeGaps: [
    'Superclass constructor chaining using super()',
    'Method overriding vs overloading semantics',
    'Interface implementation contracts'
  ],
  prerequisiteRecommendations: [
    {
      topicId: 'interfaces',
      missingPrerequisite: 'Inheritance & Abstraction',
      reason: 'Interfaces require solid grasp of inheritance and abstract methods.'
    }
  ],
  goal: 'Semester Examination & Technical Interview Prep',
  learningGoal: 'Semester Examination & Technical Interview Prep',
  examReadiness: 62,
  examReadinessStatus: 'progressing',
  lastUpdated: new Date().toISOString(),
  nextBestAction: {
    title: 'Practice Java Inheritance',
    actionText: 'Complete hands-on exercise on super keyword and method overriding.',
    reason: 'Inheritance was identified as a critical weak area in your recent diagnostic map.',
    estimatedMinutes: 20,
    actionType: 'practice',
    targetTopic: 'inheritance',
    buttonLabel: 'Start Practice'
  },
  studyStreakDays: 5,
  completedActivitiesCount: 8,
  totalHoursStudied: 14.5,
  totalEvidenceCount: 3,
  recentEvidence: INITIAL_LEARNING_EVIDENCES
};

const INITIAL_KNOWLEDGE_MAP: KnowledgeMap = {
  courseId: 'java-programming',
  courseTitle: 'Java Programming',
  topicProficiencies: {
    'fundamentals': 'Strong',
    'oop': 'Moderate',
    'inheritance': 'Weak',
    'polymorphism': 'Moderate',
    'abstraction': 'Moderate',
    'interfaces': 'Weak',
    'exception-handling': 'Moderate',
    'collections': 'Beginner',
    'file-handling': 'Beginner',
    'multithreading': 'Beginner',
    'jdbc': 'Beginner'
  },
  strongAreas: ['Fundamentals (Variables, Loops, Methods, Control Flow)', 'Object Instantiation'],
  areasToImprove: ['OOP Encapsulation vs Access Modifiers', 'Exception Propagation'],
  knowledgeGaps: ['Inheritance hierarchy design & super() constructor chaining', 'Interfaces vs Abstract Classes'],
  recommendedStartingPoint: 'Inheritance & Polymorphism',
  generatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  summary: 'Diagnostic baseline shows reliable grasp of core syntax and flow control, with significant gaps in inheritance mechanics and interface contracts.'
};

const INITIAL_LEARNING_PLAN: LearningPlan = {
  id: 'plan_initial_java',
  courseId: 'java-programming',
  courseTitle: 'Java Programming',
  studentGoal: 'Master Object-Oriented Principles for Semester Exams',
  targetTopic: 'Inheritance',
  summary: 'Calibrated for your Intermediate diagnostic baseline (62%). Prioritizes hands-on mastery of inheritance hierarchies and runtime method overriding.',
  estimatedTotalMinutes: 65,
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'step_1',
      stepNumber: 1,
      title: 'Learn Inheritance Principles & super Keyword',
      description: 'Review IS-A relationships, method overriding rules, and constructor chaining.',
      type: 'learn',
      practicalRouteStage: 'theory',
      topicId: 'inheritance',
      topicTitle: 'Inheritance',
      estimatedMinutes: 15,
      completed: true,
      status: 'completed',
      difficulty: 'intermediate',
      priority: 'high',
      reason: 'Inheritance was identified as your primary gap during diagnostic assessment.',
      learningObjective: 'Master super() invocation rules and inheritance boundaries.',
      actionRoute: 'tutor',
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      snippet: {
        theory: 'Subclasses inherit accessible members of their parent. The super keyword enables derived classes to invoke parent constructors and call overridden parent methods without code duplication.'
      }
    },
    {
      id: 'step_2',
      stepNumber: 2,
      title: 'Study Practical Bank Account Hierarchy Example',
      description: 'Analyze real-world SavingsAccount extends Account with overdraft limits.',
      type: 'example',
      practicalRouteStage: 'example',
      topicId: 'inheritance',
      topicTitle: 'Inheritance',
      estimatedMinutes: 10,
      completed: true,
      status: 'completed',
      difficulty: 'intermediate',
      priority: 'high',
      reason: 'Concrete examples bridge abstract theory before independent coding.',
      learningObjective: 'Analyze practical code reuse patterns and overriding mechanics in production systems.',
      actionRoute: 'practice',
      completedAt: new Date(Date.now() - 1800000).toISOString(),
      snippet: {
        exampleCode: 'class SavingsAccount extends BankAccount {\n    @Override\n    public double calculateMonthlyYield() {\n        return super.getBaseYield() + (balance * interestRate);\n    }\n}'
      }
    },
    {
      id: 'step_3',
      stepNumber: 3,
      title: 'Solve 3 Conceptual Polymorphic Dispatch Problems',
      description: 'Predict exact outputs when a superclass reference points to a subclass instance at runtime.',
      type: 'practice',
      practicalRouteStage: 'practice',
      topicId: 'inheritance',
      topicTitle: 'Inheritance',
      estimatedMinutes: 15,
      completed: false,
      status: 'in_progress',
      difficulty: 'intermediate',
      priority: 'high',
      reason: 'Active problem-solving reinforces dynamic method dispatch mental models.',
      learningObjective: 'Master runtime dynamic method resolution and constructor execution sequencing.',
      actionRoute: 'practice',
      snippet: {
        practiceQuestion: 'Given class B extends A, in what order do instance initializers and constructors execute when calling new B()?'
      }
    },
    {
      id: 'step_4',
      stepNumber: 4,
      title: 'Complete Coding Task: Employee & Manager Hierarchy',
      description: 'Implement Manager extending Employee, chain constructors using super(name, baseSalary), and override calculateSalary().',
      type: 'code',
      practicalRouteStage: 'build',
      topicId: 'inheritance',
      topicTitle: 'Inheritance',
      estimatedMinutes: 15,
      completed: false,
      status: 'pending',
      difficulty: 'intermediate',
      priority: 'high',
      reason: 'Writing and compiling working code cements deep procedural memory.',
      learningObjective: 'Write syntactically correct Java subclassing and pass automated test cases.',
      actionRoute: 'practice',
      snippet: {
        solutionHint: 'Inside Manager.calculateSalary(), return super.calculateSalary() + this.bonus.'
      }
    },
    {
      id: 'step_5',
      stepNumber: 5,
      title: 'Take Mini Quiz on Inheritance & Overriding',
      description: 'Test your understanding under exam conditions to verify mastery and unlock Polymorphism.',
      type: 'quiz',
      practicalRouteStage: 'quiz',
      topicId: 'inheritance',
      topicTitle: 'Inheritance',
      estimatedMinutes: 10,
      completed: false,
      status: 'pending',
      difficulty: 'intermediate',
      priority: 'high',
      reason: 'Validate mastery to update your knowledge map and unlock subsequent topics.',
      learningObjective: 'Achieve >= 80% to update your knowledge map state.',
      actionRoute: 'quiz'
    }
  ],
  upcomingItems: [
    {
      id: 'upcoming_1',
      stepNumber: 6,
      title: 'Learn Polymorphism & Dynamic Method Dispatch',
      description: 'Understand how the JVM resolves virtual methods using the vtable at runtime.',
      type: 'learn',
      practicalRouteStage: 'theory',
      topicId: 'polymorphism',
      topicTitle: 'Polymorphism',
      estimatedMinutes: 15,
      completed: false,
      status: 'pending',
      difficulty: 'intermediate',
      priority: 'medium',
      reason: 'Sequential follow-up topic in OOP hierarchy.',
      learningObjective: 'Explain dynamic dispatch vs static binding.',
      actionRoute: 'tutor'
    },
    {
      id: 'upcoming_2',
      stepNumber: 7,
      title: 'Study Upcasting, Downcasting & instanceof',
      description: 'Safely cast object references and guard with instanceof checks.',
      type: 'example',
      practicalRouteStage: 'example',
      topicId: 'polymorphism',
      topicTitle: 'Polymorphism',
      estimatedMinutes: 15,
      completed: false,
      status: 'pending',
      difficulty: 'intermediate',
      priority: 'medium',
      reason: 'Prerequisite technique for handling heterogeneous object collections.',
      learningObjective: 'Prevent ClassCastException in polymorphic hierarchies.',
      actionRoute: 'practice'
    },
    {
      id: 'upcoming_3',
      stepNumber: 8,
      title: 'Build Polymorphic Shape Rendering Engine',
      description: 'Implement a Shape hierarchy with Circle, Rectangle, and Triangle rendering logic.',
      type: 'code',
      practicalRouteStage: 'build',
      topicId: 'polymorphism',
      topicTitle: 'Polymorphism',
      estimatedMinutes: 20,
      completed: false,
      status: 'pending',
      difficulty: 'intermediate',
      priority: 'medium',
      reason: 'Build a practical multi-module polymorphic architecture.',
      learningObjective: 'Construct loosely-coupled polymorphic architectures.',
      actionRoute: 'practice'
    }
  ]
};

const INITIAL_ACTIVITY_LOGS: ActivityHistoryItem[] = [
  {
    id: 'act_1',
    title: 'Diagnostic Assessment Completed',
    type: 'diagnostic',
    topic: 'Java Programming Diagnostic Baseline',
    timestamp: 'Yesterday at 4:30 PM',
    score: 68,
    status: 'completed'
  },
  {
    id: 'act_2',
    title: 'Reviewed Fundamentals & Memory Model',
    type: 'tutor',
    topic: 'Fundamentals',
    timestamp: 'Yesterday at 5:15 PM',
    status: 'completed'
  },
  {
    id: 'act_3',
    title: 'Generated Personalized Learning Plan',
    type: 'plan',
    topic: 'Inheritance Roadmap',
    timestamp: 'Yesterday at 5:40 PM',
    status: 'completed'
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.practicalRoutes) parsed.practicalRoutes = {};
        if (!parsed.practicalAttempts) parsed.practicalAttempts = {};
        if (!parsed.cachedQuizzes) parsed.cachedQuizzes = {};
        if (!parsed.learningEvidences) parsed.learningEvidences = {};
        if (!parsed.enrollments) parsed.enrollments = {};
        if (!parsed.userStreaks) parsed.userStreaks = {};
        if (!parsed.userStreaks['usr_alex_chen']) {
          parsed.userStreaks['usr_alex_chen'] = { ...INITIAL_DEMO_STREAK };
        }
        if (!parsed.enrollments['usr_alex_chen'] || parsed.enrollments['usr_alex_chen'].length === 0) {
          parsed.enrollments['usr_alex_chen'] = [
            {
              id: 'enr_alex_java',
              userId: 'usr_alex_chen',
              courseId: 'java-programming',
              courseTitle: 'Java Programming',
              enrolledAt: '2026-09-01T10:00:00.000Z',
              active: true
            }
          ];
        }
        if (Array.isArray(parsed.users)) {
          parsed.users.forEach((u: any) => {
            if (!u.accountType) {
              u.accountType = u.id === 'usr_alex_chen' ? 'demo' : 'student';
            }
          });
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Could not read existing db.json, generating initial database:', err);
    }

    const initialData: DatabaseSchema = {
      users: [INITIAL_DEMO_USER],
      enrollments: {
        [INITIAL_DEMO_USER.id]: [
          {
            id: 'enr_alex_java',
            userId: INITIAL_DEMO_USER.id,
            courseId: 'java-programming',
            courseTitle: 'Java Programming',
            enrolledAt: '2026-09-01T10:00:00.000Z',
            active: true
          }
        ]
      },
      userStreaks: {
        [INITIAL_DEMO_USER.id]: { ...INITIAL_DEMO_STREAK }
      },
      learningStates: {
        [`${INITIAL_DEMO_USER.id}_java-programming`]: INITIAL_JAVA_STATE
      },
      learningEvidences: {
        [`${INITIAL_DEMO_USER.id}_java-programming`]: INITIAL_LEARNING_EVIDENCES
      },
      knowledgeMaps: {
        [`${INITIAL_DEMO_USER.id}_java-programming`]: INITIAL_KNOWLEDGE_MAP
      },
      learningPlans: {
        [`${INITIAL_DEMO_USER.id}_java-programming`]: INITIAL_LEARNING_PLAN
      },
      quizResults: {},
      cachedQuizzes: {},
      practicalSubmissions: {},
      practicalRoutes: {},
      practicalAttempts: {},
      tutorHistories: {
        [`${INITIAL_DEMO_USER.id}_java-programming`]: [
          {
            id: 'tut_welcome',
            role: 'assistant',
            content: "Hello Alex! I'm your LEADENT AI Academic Tutor. I'm calibrated to your current Java learning path. We've identified **Inheritance** as your highest-impact growth area. Would you like to review how the `super` constructor chain operates, or jump straight into the practical Employee-Manager override task?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedQuestions: [
              "Explain how 'super()' works in constructors with an analogy",
              "Why can't I override a private or static method?",
              "Show me a clean practical example of method overriding"
            ],
            contextTopic: 'Inheritance'
          }
        ]
      },
      activityLogs: {
        [INITIAL_DEMO_USER.id]: INITIAL_ACTIVITY_LOGS
      }
    };

    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private save() {
    this.saveDataDirect(this.data);
  }

  // Users
  getUserById(userId: string): User | undefined {
    const user = this.data.users.find(u => u.id === userId);
    return user ? sanitizeUser(user) : undefined;
  }

  getUserByEmail(email: string): User | undefined {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? sanitizeUser(user) : undefined;
  }

  getUserByGoogleId(googleId: string): User | undefined {
    const user = this.data.users.find(u => u.googleId === googleId);
    return user ? sanitizeUser(user) : undefined;
  }

  updateUserGoogleInfo(userId: string, info: { googleId?: string; avatar?: string; accountType?: 'google' | 'student' | 'demo' }): User | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return undefined;
    if (info.googleId) user.googleId = info.googleId;
    if (info.avatar) user.avatar = info.avatar;
    if (info.accountType) user.accountType = info.accountType;
    this.save();
    return sanitizeUser(user);
  }

  createGoogleUser(params: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): { user: User; isNew: boolean } {
    const normalizedEmail = params.email.trim().toLowerCase();
    const normalizedName = params.name.trim() || normalizedEmail.split('@')[0];

    const existing = this.data.users.find(u => u.googleId === params.googleId || u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      existing.googleId = params.googleId;
      if (params.picture) existing.avatar = params.picture;
      if (!existing.accountType) existing.accountType = 'google';
      this.save();
      return { user: sanitizeUser(existing), isNew: false };
    }

    const userRecord: UserRecord = {
      id: `usr_g_${params.googleId.slice(-8)}_${Date.now().toString(36)}`,
      name: normalizedName,
      email: normalizedEmail,
      avatar: params.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(normalizedName)}`,
      semester: 'Computer Science Undergraduate',
      college: 'Google Authenticated Student',
      accountType: 'google',
      googleId: params.googleId,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(userRecord);

    if (!this.data.enrollments) this.data.enrollments = {};
    this.data.enrollments[userRecord.id] = [];

    this.data.activityLogs[userRecord.id] = [
      {
        id: `act_${Date.now()}`,
        title: 'Google Sign-In Connected',
        type: 'plan',
        topic: 'Student Profile Created',
        timestamp: 'Just now',
        status: 'completed'
      }
    ];

    this.save();
    return { user: sanitizeUser(userRecord), isNew: true };
  }

  markUserEmailVerified(email: string): User | undefined {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return undefined;
    user.emailVerified = true;
    this.save();
    return sanitizeUser(user);
  }

  getUserRecordByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  registerUser(params: {
    name: string;
    email: string;
    password?: string;
    semester?: string;
    college?: string;
    emailVerified?: boolean;
  }): { user?: User; error?: string; status?: number } {
    const normalizedEmail = (params.email || '').trim().toLowerCase();
    const normalizedName = (params.name || '').trim();

    if (!normalizedEmail || !normalizedName) {
      return { error: 'Full name and email address are required', status: 400 };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return { error: 'Please enter a valid email address (e.g. student@gmail.com or university email)', status: 400 };
    }

    const existing = this.getUserRecordByEmail(normalizedEmail);
    if (existing) {
      return { error: 'An account with this email already exists. Please log in.', status: 409 };
    }

    if (!params.password || params.password.length < 6) {
      return { error: 'LEADENT AI password is required and must be at least 6 characters long', status: 400 };
    }

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const userRecord: UserRecord = {
      id: `usr_${Date.now()}_${randomSuffix}`,
      name: normalizedName,
      email: normalizedEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedName)}`,
      semester: params.semester || '4th Semester (Computer Science)',
      college: params.college || 'Department of Computer Science & Engineering',
      accountType: 'student',
      passwordHash: hashPassword(params.password),
      emailVerified: Boolean(params.emailVerified),
      createdAt: new Date().toISOString()
    };

    this.data.users.push(userRecord);

    // Real students begin with empty enrollments — NO automatic mock Java enrollment
    if (!this.data.enrollments) this.data.enrollments = {};
    this.data.enrollments[userRecord.id] = [];

    this.data.activityLogs[userRecord.id] = [
      {
        id: `act_${Date.now()}`,
        title: 'LEADENT AI Account Created',
        type: 'plan',
        topic: 'Student Registration Completed',
        timestamp: 'Just now',
        status: 'completed'
      }
    ];

    this.save();
    return { user: sanitizeUser(userRecord) };
  }

  // Course Enrollments & Multi-Course Management
  getUserEnrollments(userId: string): UserEnrollment[] {
    if (!this.data.enrollments) {
      this.data.enrollments = {};
    }
    // Ensure demo user Alex Chen permanently retains his demo Java enrollment
    if (userId === 'usr_alex_chen') {
      if (!this.data.enrollments['usr_alex_chen'] || this.data.enrollments['usr_alex_chen'].length === 0) {
        this.data.enrollments['usr_alex_chen'] = [
          {
            id: 'enr_alex_java',
            userId: 'usr_alex_chen',
            courseId: 'java-programming',
            courseTitle: 'Java Programming',
            enrolledAt: '2026-09-01T10:00:00.000Z',
            active: true
          }
        ];
        this.save();
      }
    }
    return this.data.enrollments[userId] || [];
  }

  getActiveEnrollment(userId: string): UserEnrollment | undefined {
    const enrollments = this.getUserEnrollments(userId);
    if (enrollments.length === 0) return undefined;
    const active = enrollments.find(e => e.active);
    return active || enrollments[0];
  }

  enrollUserInCourse(userId: string, courseId: string): { enrollment: UserEnrollment; isNew: boolean } {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const course = getCourseById(courseId) || COURSES.find(c => c.id === courseId);
    if (!course) {
      throw new Error(`Course "${courseId}" not found in university curriculum catalog`);
    }

    if (!this.data.enrollments) {
      this.data.enrollments = {};
    }
    if (!this.data.enrollments[userId]) {
      this.data.enrollments[userId] = [];
    }

    const existingEnrollment = this.data.enrollments[userId].find(e => e.courseId === course.id);
    if (existingEnrollment) {
      this.data.enrollments[userId].forEach(e => {
        e.active = e.courseId === course.id;
      });
      this.save();
      return { enrollment: existingEnrollment, isNew: false };
    }

    // Deactivate previous active courses for this student
    this.data.enrollments[userId].forEach(e => {
      e.active = false;
    });

    const newEnrollment: UserEnrollment = {
      id: `enr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId,
      courseId: course.id,
      courseTitle: course.title,
      enrolledAt: new Date().toISOString(),
      active: true
    };

    this.data.enrollments[userId].push(newEnrollment);

    // Initialize clean, isolated learning state for this student and this course
    const stateKey = `${userId}_${course.id}`;
    if (!this.data.learningStates[stateKey]) {
      const firstTopic = course.topics[0]?.title || 'Introduction';
      const firstTopicId = course.topics[0]?.id || 'basics';

      this.data.learningStates[stateKey] = {
        studentId: userId,
        course: course.title,
        courseId: course.id,
        courseTitle: course.title,
        overallLevel: 'Beginner',
        overallScore: 0,
        overallMastery: 0,
        topicMastery: {},
        topicProficiencies: {},
        topicTrends: {},
        strongTopics: [],
        goodTopics: [],
        moderateTopics: [],
        weakTopics: [],
        beginnerTopics: [],
        knowledgeGaps: [],
        prerequisiteRecommendations: [],
        currentTopic: firstTopic,
        goal: 'Semester Examination Prep',
        learningGoal: 'Semester Examination Prep',
        examReadiness: 0,
        examReadinessStatus: 'insufficient_data',
        lastUpdated: new Date().toISOString(),
        nextBestAction: {
          title: 'Check Your Knowledge Level',
          actionText: `Take the diagnostic baseline assessment for ${course.title} to calibrate your personalized learning journey and build your Knowledge Map.`,
          reason: `A baseline assessment is required to evaluate your current syllabus mastery in ${course.title} and identify high-impact focus areas.`,
          estimatedMinutes: 10,
          actionType: 'assessment',
          targetTopic: firstTopicId,
          buttonLabel: 'CHECK MY LEVEL'
        },
        studyStreakDays: 1,
        completedActivitiesCount: 0,
        totalHoursStudied: 0,
        totalEvidenceCount: 0,
        recentEvidence: []
      };
    }

    if (!this.data.learningEvidences[stateKey]) {
      this.data.learningEvidences[stateKey] = [];
    }

    if (!this.data.tutorHistories[stateKey]) {
      const firstName = user.name.split(' ')[0];
      const firstTopic = course.topics[0]?.title || course.title;
      this.data.tutorHistories[stateKey] = [
        {
          id: `tut_welcome_${Date.now()}`,
          role: 'assistant',
          content: `Hello ${firstName}! Welcome to your ${course.title} academic space on LEADENT AI. I am your academic tutor calibrated to your ${course.title} curriculum. Click **"CHECK MY LEVEL"** to assess your baseline, or ask me any question about ${firstTopic} to get started!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: course.topics[0]?.subtopics?.slice(0, 3) || [
            `What are the core concepts in ${course.title}?`,
            `Explain the fundamental architecture of ${course.title}.`,
            `How should I prepare for exams in ${course.title}?`
          ],
          contextTopic: firstTopic
        }
      ];
    }

    this.addActivityLog(userId, {
      title: `Enrolled in ${course.title}`,
      type: 'plan',
      topic: `${course.title} Enrollment`,
      timestamp: 'Just now',
      status: 'completed'
    });

    this.save();
    return { enrollment: newEnrollment, isNew: true };
  }

  setActiveCourse(userId: string, courseId: string): UserEnrollment | undefined {
    const enrollments = this.getUserEnrollments(userId);
    const target = enrollments.find(e => e.courseId === courseId);
    if (!target) {
      return this.enrollUserInCourse(userId, courseId).enrollment;
    }
    enrollments.forEach(e => {
      e.active = e.courseId === courseId;
    });
    this.save();
    return target;
  }

  verifyUserCredentials(email: string, password?: string): User | null {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const userRecord = this.getUserRecordByEmail(normalizedEmail);
    if (!userRecord) return null;

    // Demo account special bypass
    if (userRecord.id === 'usr_alex_chen') {
      if (!password || password === 'password123' || password === 'demo123' || password === 'alex123') {
        return sanitizeUser(userRecord);
      }
    }

    if (!password || typeof password !== 'string') {
      return null;
    }

    if (!userRecord.passwordHash) {
      return null;
    }

    if (!verifyPassword(password, userRecord.passwordHash)) {
      return null;
    }

    return sanitizeUser(userRecord);
  }

  createUser(name: string, email: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) return existing;

    const res = this.registerUser({ name, email });
    return res.user || {
      id: `usr_${Date.now()}`,
      name,
      email
    };
  }

  // Learning State & Evidences
  getLearningEvidences(userId: string, courseId: string): LearningEvidence[] {
    const key = `${userId}_${courseId}`;
    if (!this.data.learningEvidences) {
      this.data.learningEvidences = {};
    }
    return this.data.learningEvidences[key] || [];
  }

  saveLearningEvidence(userId: string, courseId: string, evidence: LearningEvidence): LearningEvidence {
    const key = `${userId}_${courseId}`;
    if (!this.data.learningEvidences) {
      this.data.learningEvidences = {};
    }
    if (!this.data.learningEvidences[key]) {
      this.data.learningEvidences[key] = [];
    }
    this.data.learningEvidences[key].unshift(evidence);
    if (this.data.learningEvidences[key].length > 100) {
      this.data.learningEvidences[key] = this.data.learningEvidences[key].slice(0, 100);
    }
    this.recordMeaningfulActivity(userId, 'evidence', evidence.details || `Learning evidence recorded for ${evidence.topicTitle || evidence.topicId}`);
    this.save();
    return evidence;
  }

  getLearningState(userId: string, courseId: string): StudentLearningState {
    const key = `${userId}_${courseId}`;
    if (!this.data.learningStates[key]) {
      const course = getCourseById(courseId) || COURSES[0];
      const isDemo = userId === 'usr_alex_chen';

      if (isDemo) {
        this.data.learningStates[key] = {
          studentId: userId,
          courseId: course.id,
          courseTitle: course.title,
          overallLevel: 'Intermediate',
          overallMastery: 50,
          overallScore: 50,
          strongTopics: [],
          goodTopics: [],
          moderateTopics: ['Fundamentals', 'OOP'],
          weakTopics: ['Inheritance', 'Interfaces'],
          beginnerTopics: ['Collections', 'Multithreading'],
          topicMastery: {
            'fundamentals': 60,
            'oop': 55,
            'inheritance': 38,
            'interfaces': 30
          },
          topicProficiencies: {
            'fundamentals': 'Good',
            'oop': 'Moderate',
            'inheritance': 'Weak',
            'interfaces': 'Weak'
          },
          topicTrends: {
            'fundamentals': 'stable',
            'inheritance': 'struggling'
          },
          knowledgeGaps: [
            'Superclass constructor chaining using super()',
            'Method overriding constraints'
          ],
          currentTopic: course.topics[0]?.title || 'Fundamentals',
          goal: 'Semester Examination',
          learningGoal: 'Semester Examination',
          examReadiness: 45,
          examReadinessStatus: 'progressing',
          lastUpdated: new Date().toISOString(),
          nextBestAction: DEFAULT_JAVA_NEXT_ACTION,
          studyStreakDays: 5,
          completedActivitiesCount: 8,
          totalHoursStudied: 14.5,
          totalEvidenceCount: 6
        };
      } else {
        // Real user starts with clean, isolated personal state
        this.data.learningStates[key] = {
          studentId: userId,
          courseId: course.id,
          courseTitle: course.title,
          overallLevel: 'Beginner',
          overallScore: 0,
          overallMastery: 0,
          strongTopics: [],
          goodTopics: [],
          moderateTopics: [],
          weakTopics: [],
          beginnerTopics: [],
          topicMastery: {},
          topicProficiencies: {},
          topicTrends: {},
          knowledgeGaps: [],
          currentTopic: course.topics[0]?.title || 'Fundamentals',
          goal: 'Semester Examination',
          learningGoal: 'Semester Examination',
          examReadiness: 0,
          examReadinessStatus: 'insufficient_data',
          lastUpdated: new Date().toISOString(),
          nextBestAction: {
            title: 'Check Your Knowledge Level',
            actionText: `Take the diagnostic baseline assessment for ${course.title} to calibrate your personalized learning journey and build your Knowledge Map.`,
            reason: `A baseline assessment is required to evaluate your current syllabus mastery in ${course.title} and identify high-impact focus areas.`,
            estimatedMinutes: 10,
            actionType: 'assessment',
            targetTopic: course.topics[0]?.id || 'basics',
            buttonLabel: 'CHECK MY LEVEL'
          },
          studyStreakDays: 1,
          completedActivitiesCount: 0,
          totalHoursStudied: 0,
          totalEvidenceCount: 0
        };
      }
      this.save();
    }
    return this.data.learningStates[key];
  }

  updateLearningState(userId: string, courseId: string, updates: Partial<StudentLearningState>): StudentLearningState {
    const key = `${userId}_${courseId}`;
    const current = this.getLearningState(userId, courseId);
    const updated: StudentLearningState = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    this.data.learningStates[key] = updated;
    this.save();
    return updated;
  }

  // Knowledge Map
  getKnowledgeMap(userId: string, courseId: string): KnowledgeMap | undefined {
    const key = `${userId}_${courseId}`;
    return this.data.knowledgeMaps[key];
  }

  saveKnowledgeMap(userId: string, courseId: string, map: KnowledgeMap): KnowledgeMap {
    const key = `${userId}_${courseId}`;
    this.data.knowledgeMaps[key] = map;
    this.recordMeaningfulActivity(userId, 'diagnostic', `Generated Knowledge Map for ${courseId}`);
    this.save();
    return map;
  }

  // Learning Plan
  getLearningPlan(userId: string, courseId: string): LearningPlan | undefined {
    const key = `${userId}_${courseId}`;
    return this.data.learningPlans[key];
  }

  saveLearningPlan(userId: string, courseId: string, plan: LearningPlan): LearningPlan {
    const key = `${userId}_${courseId}`;
    this.data.learningPlans[key] = plan;
    this.save();
    return plan;
  }

  toggleLearningPlanItem(userId: string, courseId: string, itemId: string): { plan: LearningPlan; state: StudentLearningState } | undefined {
    const key = `${userId}_${courseId}`;
    const plan = this.data.learningPlans[key];
    if (!plan) return undefined;

    let item = plan.items.find(i => i.id === itemId);
    if (!item && plan.upcomingItems) {
      item = plan.upcomingItems.find(i => i.id === itemId);
    }
    if (!item) return undefined;

    item.completed = !item.completed;
    item.status = item.completed ? 'completed' : 'pending';
    if (item.completed) {
      item.completedAt = new Date().toISOString();
      this.recordMeaningfulActivity(userId, 'plan', `Completed plan item: ${item.title}`);
    } else {
      delete item.completedAt;
    }

    const state = this.getLearningState(userId, courseId);
    const allItems = [...(plan.items || []), ...(plan.upcomingItems || [])];
    const completedCount = allItems.filter(i => i.completed).length;
    state.completedActivitiesCount = completedCount;

    const nextPending = allItems.find(i => !i.completed);
    if (nextPending) {
      state.currentTopic = nextPending.topicTitle;
      state.nextBestAction = {
        title: nextPending.title,
        actionText: nextPending.description,
        reason: nextPending.reason || `Personalized next step calibrated for ${nextPending.topicTitle}.`,
        estimatedMinutes: nextPending.estimatedMinutes,
        actionType: nextPending.type === 'code' ? 'practice' : nextPending.type === 'quiz' ? 'quiz' : 'learn',
        targetTopic: nextPending.topicId,
        buttonLabel: nextPending.type === 'code' ? 'Code in IDE' : nextPending.type === 'quiz' ? 'Take Quiz' : 'Start Activity'
      };
    }

    this.save();
    return { plan, state };
  }

  startLearningPlanActivity(userId: string, courseId: string, itemId: string): { plan: LearningPlan; state: StudentLearningState } | undefined {
    const key = `${userId}_${courseId}`;
    const plan = this.data.learningPlans[key];
    if (!plan) return undefined;

    let item = plan.items.find(i => i.id === itemId);
    if (!item && plan.upcomingItems) {
      item = plan.upcomingItems.find(i => i.id === itemId);
    }
    if (!item) return undefined;

    item.status = 'in_progress';
    const state = this.getLearningState(userId, courseId);
    state.currentTopic = item.topicTitle;
    this.save();
    return { plan, state };
  }

  completeLearningPlanActivity(userId: string, courseId: string, itemId: string): { plan: LearningPlan; state: StudentLearningState } | undefined {
    const key = `${userId}_${courseId}`;
    const plan = this.data.learningPlans[key];
    if (!plan) return undefined;

    let item = plan.items.find(i => i.id === itemId);
    if (!item && plan.upcomingItems) {
      item = plan.upcomingItems.find(i => i.id === itemId);
    }
    if (!item) return undefined;

    item.completed = true;
    item.status = 'completed';
    item.completedAt = new Date().toISOString();

    this.recordMeaningfulActivity(userId, 'plan', `Completed plan item: ${item.title}`);

    this.addActivityLog(userId, {
      title: item.title,
      type: 'plan',
      topic: item.topicTitle,
      timestamp: 'Just now',
      status: 'completed'
    });

    const state = this.getLearningState(userId, courseId);
    state.completedActivitiesCount = (state.completedActivitiesCount || 0) + 1;
    state.examReadiness = Math.min(100, (state.examReadiness || 45) + 3);

    const allItems = [...(plan.items || []), ...(plan.upcomingItems || [])];
    const nextPending = allItems.find(i => !i.completed);
    if (nextPending) {
      state.currentTopic = nextPending.topicTitle;
      state.nextBestAction = {
        title: nextPending.title,
        actionText: nextPending.description,
        reason: nextPending.reason || `Sequential step in your ${nextPending.topicTitle} study plan.`,
        estimatedMinutes: nextPending.estimatedMinutes,
        actionType: nextPending.type === 'code' ? 'practice' : nextPending.type === 'quiz' ? 'quiz' : 'learn',
        targetTopic: nextPending.topicId,
        buttonLabel: nextPending.type === 'code' ? 'Code in IDE' : nextPending.type === 'quiz' ? 'Take Quiz' : 'Start Activity'
      };
    }

    this.save();
    return { plan, state };
  }

  // Tutor messages
  getTutorHistory(userId: string, courseId: string): TutorMessage[] {
    const key = `${userId}_${courseId}`;
    if (!this.data.tutorHistories[key]) {
      this.data.tutorHistories[key] = [];
    }
    return this.data.tutorHistories[key];
  }

  appendTutorMessage(userId: string, courseId: string, message: TutorMessage): TutorMessage[] {
    const key = `${userId}_${courseId}`;
    if (!this.data.tutorHistories[key]) {
      this.data.tutorHistories[key] = [];
    }
    this.data.tutorHistories[key].push(message);
    this.save();
    return this.data.tutorHistories[key];
  }

  clearTutorHistory(userId: string, courseId: string): void {
    const key = `${userId}_${courseId}`;
    this.data.tutorHistories[key] = [];
    this.save();
  }

  getStudentTutorContext(userId: string, courseId: string, topicOverride?: string, activityId?: string): StudentTutorContext {
    const user = this.getUserById(userId) || INITIAL_DEMO_USER;
    const course = getCourseById(courseId) || COURSES[0];
    const state = this.getLearningState(userId, courseId);
    const knowledgeMap = this.getKnowledgeMap(userId, courseId);
    const plan = this.getLearningPlan(userId, courseId);
    const quizResults = this.getRecentQuizResults(userId, courseId);

    const currentTopic = topicOverride || state.currentTopic || knowledgeMap?.recommendedStartingPoint || 'Inheritance';

    let currentActivity: StudentTutorContext['currentActivity'] | undefined = undefined;
    if (plan) {
      if (activityId) {
        const found = plan.items.find(i => i.id === activityId) || (plan.upcomingItems && plan.upcomingItems.find(i => i.id === activityId));
        if (found) {
          currentActivity = {
            id: found.id,
            stepNumber: found.stepNumber,
            title: found.title,
            stage: found.practicalRouteStage,
            learningObjective: found.learningObjective,
            type: found.type
          };
        }
      } else {
        const activeItem = plan.items.find(i => i.status === 'in_progress') || plan.items.find(i => !i.completed);
        if (activeItem) {
          currentActivity = {
            id: activeItem.id,
            stepNumber: activeItem.stepNumber,
            title: activeItem.title,
            stage: activeItem.practicalRouteStage,
            learningObjective: activeItem.learningObjective,
            type: activeItem.type
          };
        }
      }
    }

    const recentMistakes: NonNullable<StudentTutorContext['recentMistakes']> = [];
    if (quizResults && quizResults.length > 0) {
      quizResults.forEach(qr => {
        if (qr.mistakes && qr.mistakes.length > 0) {
          qr.mistakes.forEach(m => {
            if (recentMistakes.length < 4) {
              recentMistakes.push({
                question: m.question,
                studentAnswer: m.studentAnswer,
                correctAnswer: m.correctAnswer,
                topic: m.topicTitle,
                feedback: m.explanation
              });
            }
          });
        }
      });
    }

    if (recentMistakes.length === 0 && knowledgeMap && knowledgeMap.knowledgeGaps) {
      knowledgeMap.knowledgeGaps.slice(0, 3).forEach(gap => {
        recentMistakes.push({
          topic: currentTopic,
          feedback: `Diagnostic gap identified: ${gap}`
        });
      });
    }

    const availableTopics = course.topics.map(t => ({
      id: t.id,
      title: t.title,
      proficiency: knowledgeMap?.topicProficiencies?.[t.id] || 'Moderate'
    }));

    return {
      studentName: user.name,
      semester: user.semester,
      college: user.college,
      courseTitle: course.title,
      courseId: course.id,
      currentTopic,
      currentActivity,
      overallLevel: state.overallLevel || knowledgeMap?.overallLevel || 'Intermediate',
      overallScore: state.overallScore || knowledgeMap?.overallScore || 64,
      topicMastery: knowledgeMap?.topicMastery,
      topicProficiencies: knowledgeMap?.topicProficiencies,
      strongTopics: state.strongTopics && state.strongTopics.length > 0 ? state.strongTopics : ['Fundamentals'],
      weakTopics: state.weakTopics && state.weakTopics.length > 0 ? state.weakTopics : ['Inheritance', 'Interfaces'],
      knowledgeGaps: knowledgeMap?.knowledgeGaps || ['Inheritance hierarchy design & super() constructor chaining'],
      recommendedStartingPoint: knowledgeMap?.recommendedStartingPoint || 'Inheritance',
      recentMistakes,
      learningGoal: state.goal || 'Semester Examination & Technical Interview Prep',
      availableTopics
    };
  }

  setCurrentTutoringTopic(userId: string, courseId: string, topic: string): StudentLearningState {
    return this.updateLearningState(userId, courseId, { currentTopic: topic });
  }

  // -------------------------------------------------------------
  // Learning Streak & Consistency Tier System
  // -------------------------------------------------------------
  getStudentStreak(userId: string): StudentStreak {
    if (!this.data.userStreaks) {
      this.data.userStreaks = {};
    }
    const today = getTodayDateString();
    let streak = this.data.userStreaks[userId];

    if (!streak) {
      if (userId === 'usr_alex_chen') {
        streak = { ...INITIAL_DEMO_STREAK, lastActiveDate: today };
      } else {
        const tierInfo = computeConsistencyTier(1);
        streak = {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          tier: tierInfo.tier,
          nextTierTarget: tierInfo.nextTierTarget,
          totalMeaningfulActivities: 0,
          lastActivityTimestamp: new Date().toISOString()
        };
      }
      this.data.userStreaks[userId] = streak;
      this.save();
    }

    const tierInfo = computeConsistencyTier(streak.currentStreak);
    streak.tier = tierInfo.tier;
    streak.nextTierTarget = tierInfo.nextTierTarget;
    return streak;
  }

  recordMeaningfulActivity(userId: string, activityType: string, details?: string): StudentStreak {
    if (!this.data.userStreaks) {
      this.data.userStreaks = {};
    }
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    let streak = this.data.userStreaks[userId];
    if (!streak) {
      streak = this.getStudentStreak(userId);
    }

    if (streak.lastActiveDate === today) {
      // Activity performed today - already active for today, increment activity count
      streak.totalMeaningfulActivities = (streak.totalMeaningfulActivities || 0) + 1;
      streak.lastActivityTimestamp = new Date().toISOString();
    } else if (streak.lastActiveDate === yesterday) {
      // Meaningful activity on consecutive calendar day!
      streak.currentStreak += 1;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.lastActiveDate = today;
      streak.totalMeaningfulActivities = (streak.totalMeaningfulActivities || 0) + 1;
      streak.lastActivityTimestamp = new Date().toISOString();
    } else {
      // Missed more than 1 day - restart active streak to 1
      streak.currentStreak = 1;
      streak.longestStreak = Math.max(streak.longestStreak, 1);
      streak.lastActiveDate = today;
      streak.totalMeaningfulActivities = (streak.totalMeaningfulActivities || 0) + 1;
      streak.lastActivityTimestamp = new Date().toISOString();
    }

    const tierInfo = computeConsistencyTier(streak.currentStreak);
    streak.tier = tierInfo.tier;
    streak.nextTierTarget = tierInfo.nextTierTarget;
    this.data.userStreaks[userId] = streak;

    // Synchronize studyStreakDays in learningStates
    if (this.data.learningStates) {
      Object.keys(this.data.learningStates).forEach(key => {
        if (key.startsWith(`${userId}_`)) {
          this.data.learningStates[key].studyStreakDays = streak.currentStreak;
        }
      });
    }

    this.save();
    return streak;
  }

  // Activity logs
  getActivityLogs(userId: string): ActivityHistoryItem[] {
    return this.data.activityLogs[userId] || [];
  }

  addActivityLog(userId: string, item: Omit<ActivityHistoryItem, 'id'>): ActivityHistoryItem {
    if (!this.data.activityLogs[userId]) {
      this.data.activityLogs[userId] = [];
    }
    const fullItem: ActivityHistoryItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...item
    };
    this.data.activityLogs[userId].unshift(fullItem);
    // Keep last 30 activities
    if (this.data.activityLogs[userId].length > 30) {
      this.data.activityLogs[userId] = this.data.activityLogs[userId].slice(0, 30);
    }
    this.save();
    return fullItem;
  }

  // Practical Tasks
  recordPracticalSubmission(userId: string, taskId: string, code: string, passed: boolean) {
    if (!this.data.practicalSubmissions[userId]) {
      this.data.practicalSubmissions[userId] = [];
    }
    this.data.practicalSubmissions[userId].push({
      taskId,
      code,
      passed,
      submittedAt: new Date().toISOString()
    });
    this.recordMeaningfulActivity(userId, 'practical_task', `Task ${taskId} submission: ${passed ? 'passed' : 'attempted'}`);
    this.save();
  }

  // Quizzes
  saveQuizResult(userId: string, courseId: string, result: QuizResult) {
    const key = `${userId}_${courseId}`;
    if (!this.data.quizResults[key]) {
      this.data.quizResults[key] = [];
    }
    this.data.quizResults[key].unshift(result);
    this.recordMeaningfulActivity(userId, 'quiz', `Completed quiz for ${courseId} with score ${result.score}/${result.totalQuestions} (${result.percentage || Math.round((result.score / (result.totalQuestions || 1)) * 100)}%)`);
    this.save();
  }

  getRecentQuizResults(userId: string, courseId: string): QuizResult[] {
    const key = `${userId}_${courseId}`;
    return this.data.quizResults[key] || [];
  }

  getQuiz(courseId: string, topicId: string): Quiz | undefined {
    const key = `${courseId}_${topicId.toLowerCase().trim()}`;
    return this.data.cachedQuizzes?.[key];
  }

  saveQuiz(courseId: string, topicId: string, quiz: Quiz): Quiz {
    if (!this.data.cachedQuizzes) {
      this.data.cachedQuizzes = {};
    }
    const key = `${courseId}_${topicId.toLowerCase().trim()}`;
    this.data.cachedQuizzes[key] = quiz;
    this.save();
    return quiz;
  }

  // -----------------------------------------------------------
  // Practical Route Engine Persistence
  // -----------------------------------------------------------
  getPracticalRoute(userId: string, courseId: string, topicId: string): PracticalRoute | undefined {
    const normTopic = (topicId || 'inheritance').toLowerCase().trim();
    const key = `${userId}_${courseId}_${normTopic}`;
    return this.data.practicalRoutes[key];
  }

  savePracticalRoute(userId: string, courseId: string, topicId: string, route: PracticalRoute): PracticalRoute {
    const normTopic = (topicId || route.topicId || 'inheritance').toLowerCase().trim();
    const key = `${userId}_${courseId}_${normTopic}`;
    route.lastUpdated = new Date().toISOString();
    this.data.practicalRoutes[key] = route;
    this.save();
    return route;
  }

  recordPracticalAttempt(userId: string, attempt: PracticalActivityAttempt) {
    if (!this.data.practicalAttempts[userId]) {
      this.data.practicalAttempts[userId] = [];
    }
    this.data.practicalAttempts[userId].unshift(attempt);
    // Keep last 50 attempts
    if (this.data.practicalAttempts[userId].length > 50) {
      this.data.practicalAttempts[userId] = this.data.practicalAttempts[userId].slice(0, 50);
    }
    this.save();
  }

  getPracticalAttempts(userId: string, courseId?: string, topicId?: string): PracticalActivityAttempt[] {
    const all = this.data.practicalAttempts[userId] || [];
    return all.filter(a => {
      if (courseId && a.courseId !== courseId) return false;
      if (topicId && a.topicId.toLowerCase() !== topicId.toLowerCase()) return false;
      return true;
    });
  }

  completePracticalActivity(
    userId: string,
    courseId: string,
    topicId: string,
    activityId: string,
    feedback: PracticalEvaluationFeedback
  ): { route: PracticalRoute; state: StudentLearningState; plan?: LearningPlan } {
    const normTopic = (topicId || 'inheritance').toLowerCase().trim();
    const routeKey = `${userId}_${courseId}_${normTopic}`;
    let route = this.data.practicalRoutes[routeKey];
    const state = this.getLearningState(userId, courseId);

    if (!route) {
      // Return unaugmented if route not found
      return { route: {} as any, state };
    }

    let targetActivity: any = null;
    let targetStageIndex = -1;

    route.stages.forEach((st, sIdx) => {
      st.activities.forEach(act => {
        if (act.id === activityId) {
          targetActivity = act;
          targetStageIndex = sIdx;
        }
      });
    });

    if (targetActivity) {
      targetActivity.status = 'completed';
      targetActivity.completionDate = new Date().toISOString();

      // Check if current stage is fully completed
      const currentStageObj = route.stages[targetStageIndex];
      const allStageActsCompleted = currentStageObj.activities.every(a => a.status === 'completed');
      if (allStageActsCompleted) {
        currentStageObj.status = 'completed';
        // Unlock next stage if exists
        if (targetStageIndex + 1 < route.stages.length) {
          const nextStageObj = route.stages[targetStageIndex + 1];
          if (nextStageObj.status === 'upcoming') {
            nextStageObj.status = 'current';
            route.currentStage = nextStageObj.stage;
            if (nextStageObj.activities[0] && nextStageObj.activities[0].status === 'locked') {
              nextStageObj.activities[0].status = 'in_progress';
            }
          }
        }
      }

      // Calculate total progress
      let totalActivities = 0;
      let completedActivities = 0;
      route.stages.forEach(s => {
        s.activities.forEach(a => {
          totalActivities++;
          if (a.status === 'completed') completedActivities++;
        });
      });
      route.overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 100;
      route.lastUpdated = new Date().toISOString();
      this.data.practicalRoutes[routeKey] = route;
    }

    // Sync with Learning Plan
    const planKey = `${userId}_${courseId}`;
    const plan = this.data.learningPlans[planKey];
    if (plan && targetActivity) {
      // Find matching item in plan
      const allItems = [...(plan.items || []), ...(plan.upcomingItems || [])];
      const matched = allItems.find(i => {
        if (route.learningPlanItemId && i.id === route.learningPlanItemId) return true;
        if (i.topicId && i.topicId.toLowerCase() === normTopic) {
          if (targetActivity.stage === 'build' && (i.type === 'code' || i.practicalRouteStage === 'build')) return true;
          if (targetActivity.stage === 'practice' && (i.type === 'practice' || i.practicalRouteStage === 'practice')) return true;
          if (targetActivity.stage === 'example' && (i.type === 'example' || i.practicalRouteStage === 'example')) return true;
          if (targetActivity.stage === 'understand' && (i.type === 'learn' || i.practicalRouteStage === 'theory')) return true;
          if (targetActivity.stage === 'apply' && (i.type === 'quiz' || i.practicalRouteStage === 'apply')) return true;
        }
        return false;
      });

      if (matched && !matched.completed) {
        matched.completed = true;
        matched.status = 'completed';
        matched.completedAt = new Date().toISOString();
      }
    }

    // Update Learning State
    state.completedActivitiesCount = (state.completedActivitiesCount || 0) + 1;
    state.examReadiness = Math.min(100, (state.examReadiness || 45) + 4);
    state.currentTopic = route.topicTitle;
    if (feedback.nextAction) {
      state.nextBestAction = feedback.nextAction;
    } else {
      state.nextBestAction = {
        title: `Continue ${route.topicTitle} Practical Route`,
        actionText: `Advance to the next stage in ${route.topicTitle}.`,
        reason: 'Sequential step along your personalized practical route.',
        estimatedMinutes: 15,
        actionType: 'practice',
        targetTopic: normTopic,
        buttonLabel: 'Continue Practice'
      };
    }

    // Activity Log
    if (targetActivity) {
      this.recordMeaningfulActivity(userId, 'practical', `Completed practical stage activity: ${targetActivity.title}`);
      this.addActivityLog(userId, {
        title: `Practical Route: ${targetActivity.title}`,
        type: 'practice',
        topic: route.topicTitle,
        score: feedback.score,
        status: 'completed',
        timestamp: 'Just now'
      });
    }

    this.save();
    return { route, state, plan };
  }
}

export const db = new DatabaseService();
