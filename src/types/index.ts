export type FamiliarityLevel = 'new' | 'familiar' | 'well_versed';

export type ProficiencyLevel = 'Beginner' | 'Weak' | 'Moderate' | 'Good' | 'Strong';

export type MasteryCategory = 'Strong' | 'Good' | 'Moderate' | 'Weak' | 'Beginner';

export type TopicTrend = 'improving' | 'stable' | 'struggling' | 'declining';

export type EvidenceSource = 'diagnostic' | 'quiz' | 'practical' | 'learning_activity' | 'tutor_eval';

export interface LearningEvidence {
  id: string;
  userId: string;
  courseId: string;
  topicId: string;
  topicTitle: string;
  source: EvidenceSource;
  score: number; // 0 to 100
  maxScore?: number;
  passed: boolean;
  details: string;
  timestamp: string;
  previousMastery?: number;
  newMastery?: number;
  conceptDemonstrated?: string;
  mistakesIdentified?: string[];
}

export function getMasteryCategory(score: number): MasteryCategory {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Weak';
  return 'Beginner';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  semester?: string;
  college?: string;
  accountType?: 'demo' | 'google' | 'student';
  googleId?: string;
  emailVerified?: boolean;
}

export type ConsistencyTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface StudentStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  tier: ConsistencyTier;
  nextTierTarget?: {
    tier: ConsistencyTier;
    daysRemaining: number;
    threshold: number;
  };
  totalMeaningfulActivities: number;
  lastActivityTimestamp?: string;
}

export interface UserEnrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  active: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  prerequisites: string[];
  subtopics: string[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  tagline: string;
  description: string;
  level: string;
  icon: string;
  totalTopics: number;
  estimatedHours: number;
  topics: Topic[];
}

export interface AssessmentQuestion {
  id: string | number;
  topic?: string;
  topicId?: string;
  topicTitle?: string;
  type?: 'mcq' | 'true_false' | 'short_answer' | 'code';
  questionType?: 'mcq' | 'true_false' | 'short_answer' | 'code';
  question: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'easy' | 'medium' | 'hard';
}

export interface DiagnosticAssessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title?: string;
  familiarity: FamiliarityLevel;
  questions: AssessmentQuestion[];
  instructions: string;
}

export interface KnowledgeMap {
  courseId: string;
  courseTitle: string;
  course?: string;
  overallScore?: number;
  overallLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  levelExplanation?: string;
  topicMastery?: Record<string, number>;
  topicProficiencies: Record<string, ProficiencyLevel>;
  strongAreas: string[];
  weakAreas?: string[];
  areasToImprove: string[];
  knowledgeGaps: string[];
  recommendedStartingPoint: string;
  recommendedStartingWhy?: string;
  generatedAt: string;
  summary: string;
  difficultyPerformance?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface ActivitySnippet {
  theory?: string;
  exampleCode?: string;
  practiceQuestion?: string;
  solutionHint?: string;
}

export interface LearningPlanItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  type: 'learn' | 'example' | 'practice' | 'code' | 'task' | 'quiz' | 'real_world';
  topicId: string;
  topicTitle: string;
  estimatedMinutes: number;
  completed: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  priority?: 'high' | 'medium' | 'low';
  reason?: string;
  learningObjective?: string;
  practicalRouteStage?: 'theory' | 'example' | 'practice' | 'build' | 'apply' | 'quiz';
  actionRoute?: string;
  completedAt?: string;
  snippet?: ActivitySnippet;
}

export interface LearningPlan {
  id: string;
  courseId: string;
  courseTitle: string;
  studentGoal: string;
  targetTopic: string;
  summary?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedTotalMinutes: number;
  items: LearningPlanItem[];
  upcomingItems?: LearningPlanItem[];
  completedItems?: LearningPlanItem[];
}

export interface NextBestAction {
  title: string;
  actionText: string;
  reason: string;
  estimatedMinutes: number;
  actionType: 'practice' | 'learn' | 'quiz' | 'review' | 'assessment';
  targetTopic: string;
  buttonLabel: string;
}

export interface StudentLearningState {
  studentId?: string;
  courseId: string;
  courseTitle: string;
  course?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  overallLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  overallScore?: number;
  overallMastery?: number;
  topicMastery?: Record<string, number>;
  topicProficiencies?: Record<string, ProficiencyLevel | MasteryCategory>;
  topicTrends?: Record<string, TopicTrend>;
  topicEvidenceCount?: Record<string, number>;
  strongTopics: string[];
  goodTopics?: string[];
  moderateTopics: string[];
  weakTopics: string[];
  beginnerTopics?: string[];
  knowledgeGaps: string[];
  prerequisiteRecommendations?: {
    topicId: string;
    missingPrerequisite: string;
    reason: string;
  }[];
  recommendedStartingTopic?: string;
  recommendedStartingWhy?: string;
  levelExplanation?: string;
  currentTopic: string;
  goal: string;
  learningGoal?: string;
  examReadiness: number | null;
  examReadinessStatus?: 'ready' | 'progressing' | 'needs_attention' | 'insufficient_data';
  lastUpdated: string;
  nextBestAction: NextBestAction;
  studyStreakDays: number;
  completedActivitiesCount: number;
  totalHoursStudied: number;
  totalEvidenceCount?: number;
  recentEvidence?: LearningEvidence[];
  difficultyPerformance?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export type PracticalStage = 'understand' | 'example' | 'practice' | 'build' | 'apply';

export type PracticalActivityType =
  | 'concept'
  | 'mcq'
  | 'short_answer'
  | 'coding'
  | 'debugging'
  | 'code_completion'
  | 'scenario'
  | 'mini_project'
  | 'case_study';

export interface PracticalActivity {
  id: string;
  courseId: string;
  topicId: string;
  topicTitle: string;
  stage: PracticalStage;
  type: PracticalActivityType;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjective: string;
  instructions: string;
  estimatedMinutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completionDate?: string;
  evaluationCriteria: string[];
  theoryContent?: string;
  keyTakeaways?: string[];
  exampleCode?: string;
  exampleExplanation?: string;
  codeSnippet?: string;
  starterCode?: string;
  solutionCode?: string;
  options?: { id: string; text: string; explanation?: string }[];
  correctOptionId?: string;
  testCases?: TestCase[];
  hints?: string[];
  scenarioContext?: string;
  deliverablePrompt?: string;
}

export interface PracticalRouteStage {
  stage: PracticalStage;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  activities: PracticalActivity[];
}

export interface PracticalRoute {
  id: string;
  courseId: string;
  topicId: string;
  topicTitle: string;
  currentStage: PracticalStage;
  currentActivityId?: string;
  studentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  stages: PracticalRouteStage[];
  overallProgress: number; // 0 to 100
  learningPlanItemId?: string;
  weakGapsTargeted?: string[];
  lastUpdated?: string;
}

export interface PracticalEvaluationFeedback {
  passed: boolean;
  score: number;
  whatWasDoneCorrectly: string;
  whatNeedsImprovement: string;
  mistakesExplanation?: string;
  suggestedImprovement: string;
  optionalHint?: string;
  recommendedNextStep: string;
  compilerOutput?: string;
  nextAction?: NextBestAction;
  adaptiveChange?: 'promoted' | 'reinforced' | 'steady';
}

export interface PracticalActivityAttempt {
  id: string;
  userId: string;
  courseId: string;
  topicId: string;
  activityId: string;
  stage: PracticalStage;
  activityType: PracticalActivityType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  submission: string;
  score: number;
  passed: boolean;
  feedback: PracticalEvaluationFeedback;
  timestamp: string;
}

export interface PracticalTask {
  id: string;
  title: string;
  topicId: string;
  topicTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scenario: string;
  theorySummary: string;
  practicalExample: string;
  taskInstructions: string[];
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  hints: string[];
  miniProjectRecommendation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  topicId: string;
  topicTitle: string;
  title?: string;
  questions: AssessmentQuestion[];
}

export interface QuizSubmissionMistake {
  questionId: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  topicTitle: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  topicPerformance: Record<string, number>;
  mistakes: QuizSubmissionMistake[];
  detailedFeedback: string;
  nextAction: NextBestAction;
}

export type TutorMode =
  | 'explain'
  | 'simplify'
  | 'example'
  | 'analogy'
  | 'hint'
  | 'practice'
  | 'test'
  | 'evaluation'
  | 'explain_mistake'
  | 'code_help'
  | 'debug'
  | 'application'
  | 'challenge'
  | 'solve'
  | 'guided_solution'
  | 'review_attempt'
  | 'socratic'
  | 'try_first'
  | 'concept'
  | 'summary';

export interface TutorEvaluation {
  isEvaluation: boolean;
  rating?: 'Correct' | 'Partially Correct' | 'Needs Review';
  whatWasCorrect?: string;
  whatWasMissing?: string;
  whatCouldBeImproved?: string;
  suggestedImprovedUnderstanding?: string;
}

export interface ProductiveInterventionAction {
  label: string;
  mode: TutorMode;
  promptText: string;
  iconType?: 'hint' | 'explain' | 'example' | 'guided' | 'review' | 'try_first' | 'debug';
}

export interface ProductiveIntervention {
  detected: boolean;
  title: string;
  message: string;
  relyingDisadvantage?: string;
  encouragement: string;
  topic?: string;
  courseTitle?: string;
  suggestedActions: ProductiveInterventionAction[];
}

export interface TutorImageAttachment {
  data: string; // base64 data
  mimeType: string; // image/jpeg, image/png, image/webp
  previewUrl?: string;
  name?: string;
  sizeBytes?: number;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: TutorMode | string;
  contextTopic?: string;
  contextActivity?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  codeSnippet?: string;
  imageUrl?: string;
  imageThumbnail?: string;
  suggestedQuestions?: string[];
  evaluation?: TutorEvaluation;
  isVerifiedConcept?: boolean;
  productiveIntervention?: ProductiveIntervention;
  positiveReinforcement?: string;
  reflectionPrompt?: string;
}

export interface PracticeTutorContext {
  courseId: string;
  courseTitle: string;
  subject?: string;
  topicId: string;
  topicTitle: string;
  stage: PracticalStage;
  activityId: string;
  activityTitle: string;
  activityType: PracticalActivityType;
  currentTask: string;
  currentProblem?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  studentLevel: string;
  instructions: string;
  constraints?: string[];
  evaluationCriteria?: string[];
  studentAttempt?: string;
  starterCode?: string;
  feedback?: {
    passed: boolean;
    whatWasDoneCorrectly?: string;
    whatNeedsImprovement?: string;
  };
}

export interface StudentTutorContext {
  studentName: string;
  semester?: string;
  college?: string;
  courseTitle: string;
  courseId: string;
  currentTopic: string;
  currentActivity?: {
    id?: string;
    stepNumber?: number;
    title: string;
    stage?: string;
    learningObjective?: string;
    type?: string;
  };
  overallLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  overallScore?: number;
  topicMastery?: Record<string, number>;
  topicProficiencies?: Record<string, string>;
  strongTopics: string[];
  weakTopics: string[];
  knowledgeGaps?: string[];
  recommendedStartingPoint?: string;
  recentMistakes?: {
    question?: string;
    studentAnswer?: string;
    correctAnswer?: string;
    topic?: string;
    feedback?: string;
  }[];
  recentAssessments?: {
    type: string;
    score: number;
    date?: string;
  }[];
  learningGoal?: string;
  availableTopics: { id: string; title: string; proficiency?: string }[];
}

export interface ActivityHistoryItem {
  id: string;
  title: string;
  type: 'diagnostic' | 'quiz' | 'practice' | 'tutor' | 'plan';
  topic: string;
  timestamp: string;
  score?: number;
  status: 'completed' | 'in_progress';
}

export type ResourceCategory =
  | 'Study Platforms'
  | 'Learn / Study'
  | 'Practice'
  | 'Interactive Visualization'
  | 'Documentation / Reference'
  | 'Coding / Development'
  | 'Problem Solving'
  | 'Video / Courses'
  | 'AI Learning Tools'
  | 'Simulators / Visualizers'
  | 'Project / Practical Learning';

export interface StudyResource {
  id: string;
  name: string;
  url: string;
  category: ResourceCategory;
  description: string;
  whyUseful: string;
  courseId: string;
  courseTitle: string;
  relevantTopics: string[];
  tags: string[];
  recommendedReason?: string;
  featured?: boolean;
}
