import {
  StudentLearningState,
  LearningEvidence,
  EvidenceSource,
  TopicTrend,
  MasteryCategory,
  getMasteryCategory,
  NextBestAction,
  LearningPlan,
  Topic
} from '../src/types';
import { db } from './db';
import { COURSES } from './syllabus';
import { safeGenerateContent } from './gemini';

// Topic knowledge gap heuristics mapping
const TOPIC_CONCEPT_GAPS: Record<string, string[]> = {
  fundamentals: [
    'Reference vs primitive value semantics in stack memory',
    'Loop boundary conditions and off-by-one termination',
    'Method signature matching and parameter scopes'
  ],
  oop: [
    'Encapsulation boundaries and private field mutation',
    'Constructor overloading and defensive copying',
    'Static vs instance state isolation'
  ],
  inheritance: [
    'Superclass constructor chaining using super(...)',
    'Method overriding vs overloading semantics',
    'Preventing inheritance with final keyword',
    'Access control with protected keyword in packages'
  ],
  polymorphism: [
    'Dynamic method dispatch at runtime',
    'Safe downcasting with instanceof verification',
    'Covariant return types in overriding methods'
  ],
  abstraction: [
    'Designing abstract class template methods',
    'Pure abstraction vs partial implementation contracts',
    'Abstract method obligations in concrete subclasses'
  ],
  interfaces: [
    'Multiple interface implementation contracts',
    'Default and static interface method conflict resolution',
    'Functional interface single-abstract-method constraints'
  ],
  'exception-handling': [
    'Checked vs unchecked exception propagation',
    'Resource management with try-with-resources (AutoCloseable)',
    'Creating robust custom business exception classes'
  ],
  collections: [
    'List vs Set vs Map algorithmic selection and Big-O',
    'Implementing equals() and hashCode() contract for Hash collections',
    'Type safety with Java generics bounded wildcards'
  ],
  'file-handling': [
    'Character streams (Reader/Writer) vs Byte streams (Stream)',
    'Buffering performance with BufferedReader and Scanner',
    'Serialization UID and transient field protection'
  ],
  multithreading: [
    'Thread lifecycle and synchronization primitives',
    'Avoiding race conditions and deadlocks with synchronized blocks',
    'ExecutorService thread pooling vs manual Thread creation'
  ],
  jdbc: [
    'PreparedStatement SQL injection defense',
    'Transaction commit and rollback semantics',
    'Closing Connection and ResultSet safely'
  ]
};

// Evidence weight table based on rigour of evidence source
const EVIDENCE_WEIGHTS: Record<EvidenceSource, number> = {
  diagnostic: 0.45,
  quiz: 0.35,
  practical: 0.30,
  tutor_eval: 0.25,
  learning_activity: 0.10
};

/**
 * Normalizes any topic string or slug to standard course topic ID
 */
export function normalizeTopicId(topic: string, courseId: string = 'java-programming'): string {
  const normalized = (topic || '').trim().toLowerCase().replace(/[\s_]+/g, '-');
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const matched = course.topics.find(
    t => t.id === normalized || t.title.toLowerCase() === normalized || normalized.includes(t.id)
  );
  return matched ? matched.id : normalized || 'fundamentals';
}

/**
 * Gets topic display title from course syllabus
 */
export function getTopicTitle(topicId: string, courseId: string = 'java-programming'): string {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const matched = course.topics.find(t => t.id === topicId || t.title.toLowerCase() === topicId.toLowerCase());
  return matched ? matched.title : topicId.charAt(0).toUpperCase() + topicId.slice(1).replace('-', ' ');
}

/**
 * Computes updated topic mastery using weighted moving average with volatility dampening
 */
export function calculateNewMastery(
  currentMastery: number,
  score: number,
  source: EvidenceSource
): { newMastery: number; delta: number } {
  const weight = EVIDENCE_WEIGHTS[source] || 0.25;

  // Raw weighted delta
  const rawDelta = (score - currentMastery) * weight;

  // Clamping prevents wild swings from a single session
  // Max +24 improvement, max -20 drop per single evidence event
  const clampedDelta = Math.max(-20, Math.min(24, Math.round(rawDelta)));
  const newMastery = Math.max(0, Math.min(100, currentMastery + clampedDelta));

  return { newMastery, delta: clampedDelta };
}

/**
 * Evaluates performance trends across historical evidence records
 */
export function calculateTopicTrend(
  evidences: LearningEvidence[],
  topicId: string
): TopicTrend {
  const topicEvidences = evidences.filter(e => e.topicId === topicId);

  // If fewer than 2 data points, rule mandates no artificial trend
  if (topicEvidences.length < 2) {
    return 'stable';
  }

  // Topic evidences are chronologically descending (newest first)
  const recent = topicEvidences[0].score;
  const previous = topicEvidences[1].score;
  const avgRecent = topicEvidences.slice(0, 3).reduce((sum, e) => sum + e.score, 0) / Math.min(3, topicEvidences.length);

  if (recent - previous >= 8) {
    return 'improving';
  }
  if (previous - recent >= 10) {
    return 'declining';
  }
  if (avgRecent < 50) {
    return 'struggling';
  }
  return 'stable';
}

/**
 * Computes overall academic level based on demonstrated foundational, intermediate and advanced mastery
 */
export function calculateOverallLevel(
  topicMastery: Record<string, number>,
  courseId: string = 'java-programming'
): 'Beginner' | 'Intermediate' | 'Advanced' {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const topics = course.topics;

  const foundational = topics.filter(t => t.order <= 3);
  const intermediate = topics.filter(t => t.order >= 4 && t.order <= 7);
  const advanced = topics.filter(t => t.order >= 8);

  const getAvg = (list: Topic[]) => {
    if (list.length === 0) return 50;
    const scores = list.map(t => topicMastery[t.id] ?? 35);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const foundAvg = getAvg(foundational);
  const interAvg = getAvg(intermediate);
  const advAvg = getAvg(advanced);

  if (foundAvg < 50) {
    return 'Beginner';
  }
  if (foundAvg >= 75 && interAvg >= 70 && advAvg >= 65) {
    return 'Advanced';
  }
  return 'Intermediate';
}

/**
 * Computes exam readiness index or returns null if insufficient data
 */
export function calculateExamReadiness(
  topicMastery: Record<string, number>,
  evidences: LearningEvidence[],
  courseId: string = 'java-programming'
): { readiness: number | null; status: 'ready' | 'progressing' | 'needs_attention' | 'insufficient_data' } {
  if (evidences.length < 2) {
    return { readiness: null, status: 'insufficient_data' };
  }

  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const allTopicIds = course.topics.map(t => t.id);

  // Overall average mastery
  const masteryValues = Object.values(topicMastery);
  const avgMastery = masteryValues.length > 0
    ? masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length
    : 45;

  // Syllabus coverage: topics that have demonstrated evidence
  const demonstratedTopicIds = new Set(evidences.map(e => e.topicId));
  const coverageRatio = demonstratedTopicIds.size / allTopicIds.length;

  // Average score on formal assessments (quizzes and practicals)
  const formalEvidences = evidences.filter(e => e.source === 'quiz' || e.source === 'practical' || e.source === 'diagnostic');
  const avgFormalScore = formalEvidences.length > 0
    ? formalEvidences.reduce((sum, e) => sum + e.score, 0) / formalEvidences.length
    : avgMastery;

  const rawReadiness = Math.round(
    avgMastery * 0.50 +
    (coverageRatio * 100) * 0.25 +
    avgFormalScore * 0.25
  );

  const readiness = Math.max(15, Math.min(96, rawReadiness));

  let status: 'ready' | 'progressing' | 'needs_attention' = 'progressing';
  if (readiness >= 75) status = 'ready';
  else if (readiness < 50) status = 'needs_attention';

  return { readiness, status };
}

/**
 * Checks prerequisite dependency bottlenecks in syllabus
 */
export function evaluatePrerequisites(
  topicMastery: Record<string, number>,
  courseId: string = 'java-programming'
): {
  recommendations: { topicId: string; missingPrerequisite: string; reason: string }[];
  bottleneckTopicId?: string;
} {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const recommendations: { topicId: string; missingPrerequisite: string; reason: string }[] = [];
  let bottleneckTopicId: string | undefined;

  for (const topic of course.topics) {
    for (const prereqId of topic.prerequisites) {
      const prereqMastery = topicMastery[prereqId] ?? 35;
      if (prereqMastery < 50) {
        const prereqTopic = course.topics.find(t => t.id === prereqId);
        const prereqTitle = prereqTopic ? prereqTopic.title : prereqId;
        recommendations.push({
          topicId: topic.id,
          missingPrerequisite: prereqTitle,
          reason: `${topic.title} depends on ${prereqTitle}. Your current mastery is ${prereqMastery}% (< 50%). Strengthen this prerequisite first.`
        });
        if (!bottleneckTopicId) {
          bottleneckTopicId = prereqId;
        }
      }
    }
  }

  return { recommendations, bottleneckTopicId };
}

/**
 * Synthesizes topic-specific knowledge gaps based on weak topics, mistakes, and prerequisite bottlenecks
 */
export function identifyKnowledgeGaps(
  topicMastery: Record<string, number>,
  weakTopics: string[],
  evidences: LearningEvidence[]
): string[] {
  const gaps: string[] = [];

  // Look for recorded mistakes in recent evidence
  for (const evi of evidences.slice(0, 5)) {
    if (evi.mistakesIdentified && evi.mistakesIdentified.length > 0) {
      for (const m of evi.mistakesIdentified) {
        if (!gaps.includes(m)) gaps.push(m);
      }
    }
  }

  // Add specific curriculum gaps for weak topics (< 50%)
  for (const topicId of weakTopics) {
    const topicGaps = TOPIC_CONCEPT_GAPS[topicId];
    if (topicGaps) {
      for (const g of topicGaps.slice(0, 2)) {
        if (!gaps.includes(g)) gaps.push(g);
      }
    }
  }

  // Fallback defaults if none identified
  if (gaps.length === 0) {
    gaps.push(
      'Superclass constructor chaining using super(...)',
      'Method overriding vs overloading semantics',
      'Interface implementation contracts'
    );
  }

  return gaps.slice(0, 5);
}

/**
 * Generates the Next Best Action using hybrid rules + AI reasoning
 */
export async function determineNextBestAction(params: {
  userId: string;
  courseId: string;
  topicMastery: Record<string, number>;
  weakTopics: string[];
  moderateTopics: string[];
  strongTopics: string[];
  prerequisiteBottleneck?: string;
  latestEvidence?: LearningEvidence;
}): Promise<NextBestAction> {
  const {
    courseId,
    topicMastery,
    weakTopics,
    moderateTopics,
    prerequisiteBottleneck,
    latestEvidence
  } = params;

  const course = COURSES.find(c => c.id === courseId) || COURSES[0];

  // 1. Check prerequisite bottleneck
  let targetTopicId = prerequisiteBottleneck;

  // 2. Otherwise pick weakest topic or moderate topic needing reinforcement
  if (!targetTopicId) {
    if (weakTopics.length > 0) {
      targetTopicId = weakTopics[0];
    } else if (moderateTopics.length > 0) {
      targetTopicId = moderateTopics[0];
    } else {
      targetTopicId = course.topics[0]?.id || 'inheritance';
    }
  }

  const targetTopicObj = course.topics.find(t => t.id === targetTopicId);
  const targetTopicTitle = targetTopicObj ? targetTopicObj.title : getTopicTitle(targetTopicId, courseId);
  const targetScore = topicMastery[targetTopicId] ?? 40;

  // Determine action type based on state
  let actionType: 'practice' | 'learn' | 'quiz' | 'review' | 'assessment' = 'practice';
  let title = `Practice Java ${targetTopicTitle}`;
  let buttonLabel = 'Start Practice';
  let estimatedMinutes = 20;

  if (targetScore < 40) {
    // Very weak -> tutor conceptual review or practical understand
    actionType = 'learn';
    title = `Review Core Concepts: ${targetTopicTitle}`;
    buttonLabel = 'Open Tutor Session';
    estimatedMinutes = 15;
  } else if (targetScore >= 40 && targetScore < 70) {
    // Moderate -> hands-on practical coding
    actionType = 'practice';
    title = `Hands-On Coding: ${targetTopicTitle}`;
    buttonLabel = 'Start Practical Task';
    estimatedMinutes = 20;
  } else {
    // Strong -> formal quiz challenge to lock in mastery
    actionType = 'quiz';
    title = `Validate Mastery: ${targetTopicTitle} Quiz`;
    buttonLabel = 'Take Quiz';
    estimatedMinutes = 12;
  }

  // Generate pedagogical reasoning
  let ruleReason = `${targetTopicTitle} mastery is currently at ${targetScore}%. Dedicated ${actionType} will bridge critical knowledge gaps before advancing to dependent syllabus concepts.`;
  if (prerequisiteBottleneck) {
    ruleReason = `Prerequisite focus: Strengthening ${targetTopicTitle} (${targetScore}%) unlocks subsequent topics in the Java OOP hierarchy.`;
  } else if (latestEvidence && latestEvidence.topicId === targetTopicId) {
    ruleReason = `Following your recent ${latestEvidence.source} session (${latestEvidence.score}%), targeted ${actionType} will reinforce this topic.`;
  }

  // Attempt fast Gemini semantic enhancement
  let enrichedReason = ruleReason;
  try {
    const prompt = `You are the LEADENT AI Academic Evaluation Engine.
Generate a single concise, direct pedagogical explanation (maximum 2 sentences, ~30 words) for a Java student's next step:
Target Topic: "${targetTopicTitle}"
Current Mastery: ${targetScore}%
Action: ${title} (${actionType})
Reasoning context: ${ruleReason}
Tone: Academic, encouraging, constructive. No promotional fluff. Direct instructions.`;

    const aiRes = await safeGenerateContent(prompt);
    if (aiRes && aiRes.text && aiRes.text.length > 20 && !aiRes.text.includes('API key')) {
      enrichedReason = aiRes.text.trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // Keep deterministic fallback
  }

  return {
    title,
    actionText: `Execute ${title.toLowerCase()} to strengthen syllabus outcomes.`,
    reason: enrichedReason,
    estimatedMinutes,
    actionType,
    targetTopic: targetTopicId,
    buttonLabel
  };
}

/**
 * Main Central Pipeline: processes new evidence and dynamically updates learning state
 */
export async function processLearningEvidence(params: {
  userId: string;
  courseId: string;
  topicId: string;
  topicTitle?: string;
  source: EvidenceSource;
  score: number;
  passed: boolean;
  details: string;
  conceptDemonstrated?: string;
  mistakesIdentified?: string[];
  updateLearningPlan?: boolean;
}): Promise<{
  state: StudentLearningState;
  evidence: LearningEvidence;
  delta: number;
  learningPlan?: LearningPlan;
}> {
  const {
    userId,
    courseId,
    topicId: rawTopicId,
    source,
    score,
    passed,
    details,
    conceptDemonstrated,
    mistakesIdentified,
    updateLearningPlan = true
  } = params;

  const topicId = normalizeTopicId(rawTopicId, courseId);
  const topicTitle = params.topicTitle || getTopicTitle(topicId, courseId);

  // 1. Fetch current learning state
  const currentState = db.getLearningState(userId, courseId);
  const previousTopicMastery = currentState.topicMastery?.[topicId] ?? (
    currentState.topicProficiencies?.[topicId] === 'Strong' ? 80 :
    currentState.topicProficiencies?.[topicId] === 'Good' ? 65 :
    currentState.topicProficiencies?.[topicId] === 'Moderate' ? 50 :
    currentState.topicProficiencies?.[topicId] === 'Weak' ? 35 : 25
  );

  // 2. Compute updated mastery with volatility protection
  const { newMastery, delta } = calculateNewMastery(previousTopicMastery, score, source);

  // 3. Persist individual evidence entry (never overwriting historical logs)
  const evidence: LearningEvidence = {
    id: `evi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    courseId,
    topicId,
    topicTitle,
    source,
    score,
    passed,
    details,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    previousMastery: previousTopicMastery,
    newMastery,
    conceptDemonstrated,
    mistakesIdentified
  };

  db.saveLearningEvidence(userId, courseId, evidence);
  const allEvidences = db.getLearningEvidences(userId, courseId);

  // 4. Update topic mastery map
  const updatedTopicMastery: Record<string, number> = {
    ...(currentState.topicMastery || {}),
    [topicId]: newMastery
  };

  // 5. Categorize topics with consistent thresholds
  const strongTopics: string[] = [];
  const goodTopics: string[] = [];
  const moderateTopics: string[] = [];
  const weakTopics: string[] = [];
  const beginnerTopics: string[] = [];
  const updatedProficiencies: Record<string, MasteryCategory> = {};

  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  for (const topic of course.topics) {
    const tId = topic.id;
    const masteryVal = updatedTopicMastery[tId] ?? (
      currentState.topicMastery?.[tId] ?? 35
    );
    updatedTopicMastery[tId] = masteryVal;

    const cat = getMasteryCategory(masteryVal);
    updatedProficiencies[tId] = cat;

    if (cat === 'Strong') strongTopics.push(tId);
    else if (cat === 'Good') goodTopics.push(tId);
    else if (cat === 'Moderate') moderateTopics.push(tId);
    else if (cat === 'Weak') weakTopics.push(tId);
    else beginnerTopics.push(tId);
  }

  // 6. Calculate trends for all topics
  const updatedTrends: Record<string, TopicTrend> = {};
  for (const topic of course.topics) {
    updatedTrends[topic.id] = calculateTopicTrend(allEvidences, topic.id);
  }

  // 7. Check prerequisite bottlenecks
  const { recommendations: prereqRecs, bottleneckTopicId } = evaluatePrerequisites(updatedTopicMastery, courseId);

  // 8. Identify knowledge gaps
  const knowledgeGaps = identifyKnowledgeGaps(updatedTopicMastery, weakTopics, allEvidences);

  // 9. Recompute overall level and exam readiness
  const overallLevel = calculateOverallLevel(updatedTopicMastery, courseId);
  const { readiness, status: examStatus } = calculateExamReadiness(updatedTopicMastery, allEvidences, courseId);

  // Overall mastery is average of active topics
  const masteryValues = Object.values(updatedTopicMastery);
  const overallMastery = Math.round(
    masteryValues.reduce((a, b) => a + b, 0) / Math.max(1, masteryValues.length)
  );

  // 10. Generate Next Best Action
  const nextBestAction = await determineNextBestAction({
    userId,
    courseId,
    topicMastery: updatedTopicMastery,
    weakTopics,
    moderateTopics,
    strongTopics,
    prerequisiteBottleneck: bottleneckTopicId,
    latestEvidence: evidence
  });

  // 11. Optionally synchronize learning plan item
  let updatedPlan: LearningPlan | undefined;
  if (updateLearningPlan) {
    const currentPlan = db.getLearningPlan(userId, courseId);
    if (currentPlan && currentPlan.items) {
      let planModified = false;
      const newItems = currentPlan.items.map(item => {
        const itemTopic = normalizeTopicId(item.topicId || (item as any).targetTopic || '', courseId);
        if (itemTopic === topicId && !item.completed) {
          if (passed || score >= 70) {
            planModified = true;
            return {
              ...item,
              status: 'completed' as const,
              completed: true,
              completedAt: new Date().toISOString()
            };
          }
        }
        return item;
      });

      if (planModified) {
        updatedPlan = {
          ...currentPlan,
          items: newItems,
          updatedAt: new Date().toISOString()
        };
        db.saveLearningPlan(userId, courseId, updatedPlan);
      } else {
        updatedPlan = currentPlan;
      }
    }
  }

  // 12. Update academic activity log
  const newCompletedCount = (currentState.completedActivitiesCount || 0) + (passed ? 1 : 0);
  const logType: 'diagnostic' | 'quiz' | 'practice' =
    source === 'quiz' ? 'quiz' : source === 'practical' ? 'practice' : 'diagnostic';
  db.addActivityLog(userId, {
    type: logType,
    title: `${topicTitle}: ${source === 'quiz' ? 'Quiz Assessment' : source === 'practical' ? 'Practical Activity' : 'Assessment'}`,
    topic: topicTitle,
    score,
    status: 'completed',
    timestamp: 'Just now'
  });

  // 13. Assemble and persist authoritative state
  const updatedState: StudentLearningState = {
    ...currentState,
    studentId: userId,
    courseId,
    courseTitle: course.title,
    overallLevel,
    overallMastery,
    overallScore: overallMastery,
    currentTopic: topicTitle,
    topicMastery: updatedTopicMastery,
    topicProficiencies: updatedProficiencies,
    topicTrends: updatedTrends,
    strongTopics: strongTopics.map(id => getTopicTitle(id, courseId)),
    goodTopics: goodTopics.map(id => getTopicTitle(id, courseId)),
    moderateTopics: moderateTopics.map(id => getTopicTitle(id, courseId)),
    weakTopics: weakTopics.map(id => getTopicTitle(id, courseId)),
    beginnerTopics: beginnerTopics.map(id => getTopicTitle(id, courseId)),
    knowledgeGaps,
    prerequisiteRecommendations: prereqRecs,
    examReadiness: readiness,
    examReadinessStatus: examStatus,
    nextBestAction,
    completedActivitiesCount: newCompletedCount,
    totalEvidenceCount: allEvidences.length,
    recentEvidence: allEvidences.slice(0, 10),
    lastUpdated: new Date().toISOString()
  };

  db.updateLearningState(userId, courseId, updatedState);

  // Synchronize knowledge map as well
  const currentKMap = db.getKnowledgeMap(userId, courseId);
  if (currentKMap) {
    db.saveKnowledgeMap(userId, courseId, {
      ...currentKMap,
      topicProficiencies: updatedProficiencies,
      strongAreas: strongTopics.map(id => getTopicTitle(id, courseId)),
      weakAreas: weakTopics.map(id => getTopicTitle(id, courseId)),
      areasToImprove: weakTopics.map(id => getTopicTitle(id, courseId)),
      knowledgeGaps
    });
  }

  return {
    state: updatedState,
    evidence,
    delta,
    learningPlan: updatedPlan
  };
}
