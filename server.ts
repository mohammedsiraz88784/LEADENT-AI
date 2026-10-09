import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { COURSES, getCourseById } from './server/syllabus';
import {
  generateDiagnosticAssessment,
  evaluateDiagnosticAndBuildMap,
  generatePersonalizedLearningPlan,
  getTutorResponse,
  getPracticalTaskForTopic,
  evaluateCodeSubmission,
  generateQuizForTopic,
  evaluateQuizSubmission,
  transcribeAudio
} from './server/gemini';
import {
  getCuratedPracticalRoute,
  generateAdaptivePracticalRoute,
  evaluatePracticalActivitySubmission
} from './server/practicalEngine';
import {
  processLearningEvidence,
  determineNextBestAction,
  normalizeTopicId,
  calculateExamReadiness,
  calculateOverallLevel,
  calculateTopicTrend,
  identifyKnowledgeGaps,
  evaluatePrerequisites,
  getTopicTitle
} from './server/learningStateEngine';
import { getMasteryCategory } from './src/types';
import { otpService } from './server/otpService';
import { isEmailDeliveryConfigured, getRequiredEmailEnvVars } from './server/emailService';
import { getCourseResources } from './server/resourcesData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to extract user ID
function getAuthUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  if (req.headers['x-user-id'] && typeof req.headers['x-user-id'] === 'string') {
    return req.headers['x-user-id'].trim();
  }
  if (req.query.userId && typeof req.query.userId === 'string') {
    return req.query.userId.trim();
  }
  // Safe default demo student for unauthenticated local sessions
  return 'usr_alex_chen';
}

// Authentication middleware for protected endpoints
function requireAuth(req: Request, res: Response, next: express.NextFunction) {
  const userId = getAuthUserId(req);
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'User session expired or invalid. Please sign in again.' });
  }
  (req as any).user = user;
  (req as any).userId = userId;
  next();
}

function normalizeCourseId(courseId?: string): string {
  if (!courseId) return 'java-programming';
  const course = getCourseById(courseId);
  return course ? course.id : courseId.toLowerCase().trim();
}

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    product: 'LEADENT AI',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// -------------------------------------------------------------
// Authentication & Email OTP
// -------------------------------------------------------------
app.post('/api/auth/otp/send', async (req: Request, res: Response) => {
  const { email, purpose } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const validPurpose = purpose === 'login' || purpose === 'registration' ? purpose : 'verification';

  const result = await otpService.generateAndSendOtp(normalizedEmail, validPurpose);
  if (!result.success) {
    if (result.retryAfterSeconds) {
      return res.status(429).json(result);
    }
    return res.status(400).json(result);
  }

  return res.json(result);
});

app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
  const { email, otp, purpose } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  if (!otp || typeof otp !== 'string' || !otp.trim()) {
    return res.status(400).json({ error: 'Please enter the 6-digit verification code' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const verification = otpService.verifyOtp(normalizedEmail, otp.trim(), purpose);

  if (!verification.valid) {
    return res.status(400).json({
      error: verification.error || 'Invalid verification code. Please try again.',
      expired: Boolean(verification.expired),
      attemptsExceeded: Boolean(verification.attemptsExceeded),
      remainingAttempts: verification.remainingAttempts
    });
  }

  // Mark user verified in DB if already registered
  const updatedUser = db.markUserEmailVerified(normalizedEmail);
  const user = updatedUser || db.getUserByEmail(normalizedEmail);

  if (user) {
    return res.json({
      success: true,
      verified: true,
      user,
      token: user.id,
      message: 'Email verified successfully.'
    });
  }

  return res.json({
    success: true,
    verified: true,
    email: normalizedEmail,
    message: 'Email verified successfully. You may now complete account registration.'
  });
});

app.get('/api/auth/otp/status', (req: Request, res: Response) => {
  const email = typeof req.query.email === 'string' ? req.query.email : '';
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }
  const status = otpService.getStatus(email);
  res.json(status);
});

app.get('/api/auth/otp/config', (req: Request, res: Response) => {
  res.json({
    configured: isEmailDeliveryConfigured(),
    requiredEnvVars: getRequiredEmailEnvVars()
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, semester, college, otp } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'LEADENT AI password is required and must be at least 6 characters long' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let emailVerified = false;

  if (otp) {
    const verifyResult = otpService.verifyOtp(normalizedEmail, String(otp).trim(), 'registration');
    if (!verifyResult.valid) {
      return res.status(400).json({
        error: verifyResult.error || 'Invalid verification code. Please try again.',
        expired: Boolean(verifyResult.expired),
        attemptsExceeded: Boolean(verifyResult.attemptsExceeded),
        remainingAttempts: verifyResult.remainingAttempts
      });
    }
    emailVerified = true;
  }

  const result = db.registerUser({
    name: name.trim(),
    email: normalizedEmail,
    password,
    semester,
    college,
    emailVerified
  });
  if (result.error) {
    return res.status(result.status || 400).json({ error: result.error });
  }
  res.status(201).json({ user: result.user, token: result.user!.id, emailVerified });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Demo user quick login bypass
  if (normalizedEmail === 'alex.chen@university.edu' && (!password || password === 'password123' || password === 'demo123' || password === 'alex123')) {
    const user = db.getUserById('usr_alex_chen');
    if (user) {
      return res.json({ user, token: user.id });
    }
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'LEADENT AI password is required' });
  }

  const user = db.verifyUserCredentials(normalizedEmail, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials and try again.' });
  }

  return res.json({ user, token: user.id });
});

app.post('/api/auth/demo', (req: Request, res: Response) => {
  const user = db.getUserById('usr_alex_chen') || db.createUser('Alex Chen', 'alex.chen@university.edu');
  res.json({ user, token: user.id });
});

app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      return res.status(400).json({ error: 'Google credential or access token is required' });
    }

    let googleProfile: { sub: string; email: string; name: string; picture?: string; email_verified?: boolean } | null = null;

    if (credential) {
      // Real verification of Google ID token (JWT) using Google's public tokeninfo endpoint
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleRes.ok) {
        const errJson = (await googleRes.json().catch(() => ({}))) as any;
        return res.status(401).json({
          error: errJson.error_description || 'Invalid Google ID token'
        });
      }
      const tokenData = (await googleRes.json()) as any;
      if (!tokenData.sub || !tokenData.email) {
        return res.status(401).json({ error: 'Incomplete Google token verification information' });
      }
      googleProfile = {
        sub: tokenData.sub,
        email: tokenData.email,
        name: tokenData.name || tokenData.email.split('@')[0],
        picture: tokenData.picture,
        email_verified: tokenData.email_verified === 'true' || tokenData.email_verified === true
      };
    } else if (accessToken) {
      // Real verification of Google OAuth2 access token using Google's userinfo endpoint
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!googleRes.ok) {
        const errJson = (await googleRes.json().catch(() => ({}))) as any;
        return res.status(401).json({
          error: errJson.error_description || 'Invalid Google access token'
        });
      }
      const tokenData = (await googleRes.json()) as any;
      if (!tokenData.sub || !tokenData.email) {
        return res.status(401).json({ error: 'Incomplete Google userinfo profile information' });
      }
      googleProfile = {
        sub: tokenData.sub,
        email: tokenData.email,
        name: tokenData.name || tokenData.email.split('@')[0],
        picture: tokenData.picture,
        email_verified: Boolean(tokenData.email_verified)
      };
    }

    if (!googleProfile) {
      return res.status(401).json({ error: 'Google identity verification failed' });
    }

    // Check if user already exists
    const existing = db.getUserByGoogleId(googleProfile.sub) || db.getUserByEmail(googleProfile.email);
    if (existing) {
      const updated = db.updateUserGoogleInfo(existing.id, {
        googleId: googleProfile.sub,
        avatar: googleProfile.picture || existing.avatar,
        accountType: 'google'
      });
      const finalUser = updated || existing;
      return res.json({ user: finalUser, token: finalUser.id, isNew: false });
    }

    // Create new Google student account with their own personal learning state
    const result = db.createGoogleUser({
      googleId: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      picture: googleProfile.picture
    });

    return res.status(201).json({ user: result.user, token: result.user.id, isNew: true });
  } catch (err: any) {
    console.error('Google authentication server error:', err);
    return res.status(500).json({ error: 'Internal server error during Google authentication verification' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  const token = authHeader.substring(7).trim();
  const user = db.getUserById(token);
  if (!user) {
    return res.status(401).json({ error: 'User not found or session expired' });
  }
  res.json({ user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// Courses & Syllabus
// -------------------------------------------------------------
app.get('/api/courses', (req: Request, res: Response) => {
  res.json({ courses: COURSES });
});

app.get('/api/courses/:id', (req: Request, res: Response) => {
  const course = getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json({ course });
});

// -------------------------------------------------------------
// Study Platforms & Tools (Course-Specific & Topic-Aware)
// -------------------------------------------------------------
app.get('/api/resources', (req: Request, res: Response) => {
  const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : '';
  const topicId = typeof req.query.topicId === 'string' ? req.query.topicId : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;

  if (!courseId) {
    return res.status(400).json({ error: 'Valid courseId is required to fetch course-specific study resources' });
  }

  const course = getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ error: `Course '${courseId}' not found` });
  }

  // Retrieve student's learning state if authenticated for personalized reasons
  let learningState: any = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = db.getUserById(token);
    if (user) {
      learningState = db.getLearningState(user.id, course.id);
    }
  }

  const resources = getCourseResources({
    courseId: course.id,
    topicId,
    category,
    learningState
  });

  res.json({
    courseId: course.id,
    courseTitle: course.title,
    total: resources.length,
    resources
  });
});

// -------------------------------------------------------------
// Student Enrollments
// -------------------------------------------------------------
app.get('/api/student/enrollments', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const enrollments = db.getUserEnrollments(userId);
  const activeEnrollment = db.getActiveEnrollment(userId);
  res.json({ enrollments, activeEnrollment });
});

app.post('/api/student/enroll', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { courseId } = req.body;
  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ error: 'Valid courseId is required for enrollment' });
  }

  try {
    const result = db.enrollUserInCourse(userId, courseId);
    res.status(201).json({
      success: true,
      enrollment: result.enrollment,
      isNew: result.isNew,
      activeEnrollment: result.enrollment
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to enroll in course' });
  }
});

app.post('/api/student/active-course', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { courseId } = req.body;
  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ error: 'Valid courseId is required' });
  }

  const activeEnrollment = db.setActiveCourse(userId, courseId);
  if (!activeEnrollment) {
    return res.status(404).json({ error: 'Could not set active course' });
  }
  res.json({ success: true, activeEnrollment });
});

// -------------------------------------------------------------
// Student Learning State & Streak System
// -------------------------------------------------------------
app.get('/api/student/streak', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const streak = db.getStudentStreak(userId);
  res.json({ streak });
});

app.post('/api/student/streak/activity', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { type, details } = req.body;
  const streak = db.recordMeaningfulActivity(userId, type || 'activity', details);
  res.json({ streak });
});

app.get('/api/student/state', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.query.courseId as string);
  const state = db.getLearningState(userId, courseId);
  res.json({ state });
});

app.post('/api/student/state', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.body.courseId);
  const updates = req.body.updates || {};
  const updatedState = db.updateLearningState(userId, courseId, updates);
  res.json({ state: updatedState });
});

app.get('/api/student/evidence', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.query.courseId as string);
  const evidences = db.getLearningEvidences(userId, courseId);
  res.json({ evidences });
});

app.post('/api/student/next-action', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.body.courseId as string);
    const state = db.getLearningState(userId, courseId);
    const nextAction = await determineNextBestAction({
      userId,
      courseId,
      topicMastery: state.topicMastery || {},
      weakTopics: state.weakTopics || [],
      moderateTopics: state.moderateTopics || [],
      strongTopics: state.strongTopics || []
    });
    const updatedState = db.updateLearningState(userId, courseId, { nextBestAction: nextAction });
    res.json({ state: updatedState, nextBestAction: nextAction });
  } catch (err) {
    console.error('Next action evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate next action' });
  }
});

// -------------------------------------------------------------
// Diagnostic Assessment ("CHECK MY LEVEL")
// -------------------------------------------------------------
app.post('/api/diagnostic/generate', async (req: Request, res: Response) => {
  try {
    const courseId = normalizeCourseId(req.body.courseId);
    const familiarity = req.body.familiarity || 'familiar';
    const studentGoal = req.body.studentGoal;
    const assessment = await generateDiagnosticAssessment(courseId, familiarity, studentGoal);
    res.json({ assessment });
  } catch (err: any) {
    console.error('Diagnostic generation error:', err);
    res.status(500).json({ error: 'Failed to generate diagnostic assessment' });
  }
});

app.post('/api/diagnostic/submit', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.body.courseId);
    const { familiarity, questions, answers } = req.body;

    const evaluation = await evaluateDiagnosticAndBuildMap(courseId, familiarity, questions, answers);

    // Save Knowledge Map
    db.saveKnowledgeMap(userId, courseId, evaluation.knowledgeMap);

    // Generate Personalized Learning Plan based on gaps
    const learningPlan = await generatePersonalizedLearningPlan(
      courseId,
      evaluation.knowledgeMap,
      'Semester Examination Prep'
    );
    db.saveLearningPlan(userId, courseId, learningPlan);

    // Record baseline evidence for each assessed topic from diagnostic
    const evaluatedMastery = evaluation.knowledgeMap.topicMastery || {};
    for (const [topicKey, scoreVal] of Object.entries(evaluatedMastery)) {
      const topicId = normalizeTopicId(topicKey, courseId);
      const scoreNum = typeof scoreVal === 'number' ? scoreVal : 50;
      db.saveLearningEvidence(userId, courseId, {
        id: `evi_diag_${Date.now()}_${topicId}`,
        userId,
        courseId,
        topicId,
        topicTitle: getTopicTitle(topicId, courseId),
        source: 'diagnostic',
        score: scoreNum,
        passed: scoreNum >= 60,
        details: `Diagnostic baseline: ${scoreNum}% assessed proficiency`,
        timestamp: 'Just now',
        newMastery: scoreNum,
        conceptDemonstrated: 'Diagnostic Assessment'
      });
    }

    const allEvidences = db.getLearningEvidences(userId, courseId);
    const { readiness, status: examStatus } = calculateExamReadiness(evaluatedMastery, allEvidences, courseId);
    const { recommendations: prereqRecs } = evaluatePrerequisites(evaluatedMastery, courseId);
    const calculatedLevel = calculateOverallLevel(evaluatedMastery, courseId);

    // Categorize topics with consistent thresholds
    const strongTopics: string[] = [];
    const goodTopics: string[] = [];
    const moderateTopics: string[] = [];
    const weakTopics: string[] = [];
    const beginnerTopics: string[] = [];
    const proficiencies: Record<string, any> = {};

    for (const [tKey, sVal] of Object.entries(evaluatedMastery)) {
      const cat = getMasteryCategory(sVal);
      proficiencies[tKey] = cat;
      const tTitle = getTopicTitle(tKey, courseId);
      if (cat === 'Strong') strongTopics.push(tTitle);
      else if (cat === 'Good') goodTopics.push(tTitle);
      else if (cat === 'Moderate') moderateTopics.push(tTitle);
      else if (cat === 'Weak') weakTopics.push(tTitle);
      else beginnerTopics.push(tTitle);
    }

    const masteryValues = Object.values(evaluatedMastery);
    const overallMastery = masteryValues.length > 0
      ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
      : (evaluation.knowledgeMap.overallScore ?? 64);

    const updatedState = db.updateLearningState(userId, courseId, {
      studentId: userId,
      course: 'Java',
      courseTitle: 'Java Programming',
      level: calculatedLevel,
      overallLevel: calculatedLevel,
      overallScore: overallMastery,
      overallMastery,
      topicMastery: evaluatedMastery,
      topicProficiencies: proficiencies,
      strongTopics,
      goodTopics,
      moderateTopics,
      weakTopics,
      beginnerTopics,
      knowledgeGaps: evaluation.knowledgeMap.knowledgeGaps || weakTopics,
      prerequisiteRecommendations: prereqRecs,
      recommendedStartingTopic: evaluation.knowledgeMap.recommendedStartingPoint || 'Inheritance',
      recommendedStartingWhy: evaluation.knowledgeMap.recommendedStartingWhy,
      levelExplanation: evaluation.knowledgeMap.levelExplanation,
      currentTopic: evaluation.knowledgeMap.recommendedStartingPoint || 'Inheritance',
      nextBestAction: evaluation.nextAction,
      difficultyPerformance: evaluation.knowledgeMap.difficultyPerformance,
      examReadiness: readiness,
      examReadinessStatus: examStatus,
      totalEvidenceCount: allEvidences.length,
      recentEvidence: allEvidences.slice(0, 10),
      lastUpdated: new Date().toISOString()
    });

    db.addActivityLog(userId, {
      title: 'Diagnostic Assessment Completed',
      type: 'diagnostic',
      topic: `${evaluation.knowledgeMap.courseTitle} Calibration`,
      timestamp: 'Just now',
      status: 'completed'
    });

    res.json({
      knowledgeMap: evaluation.knowledgeMap,
      learningPlan,
      learningState: updatedState
    });
  } catch (err: any) {
    console.error('Diagnostic submit error:', err);
    res.status(500).json({ error: 'Failed to evaluate diagnostic assessment' });
  }
});

// -------------------------------------------------------------
// Knowledge Map & Learning Plan
// -------------------------------------------------------------
app.get(['/api/knowledge-map', '/api/student/knowledge-map'], (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.query.courseId as string);
  const map = db.getKnowledgeMap(userId, courseId);
  res.json({ knowledgeMap: map || null });
});

app.get(['/api/learning-plan', '/api/plan'], (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.query.courseId as string);
  const plan = db.getLearningPlan(userId, courseId);
  res.json({ learningPlan: plan || null });
});

app.post(['/api/learning-plan/toggle', '/api/plan/toggle'], (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.body.courseId);
  const { itemId } = req.body;
  const result = db.toggleLearningPlanItem(userId, courseId, itemId);
  res.json({
    learningPlan: result?.plan,
    learningState: result?.state
  });
});

app.post(['/api/learning-plan/start', '/api/plan/start'], (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = normalizeCourseId(req.body.courseId);
  const { itemId } = req.body;
  const result = db.startLearningPlanActivity(userId, courseId, itemId);
  res.json({
    learningPlan: result?.plan,
    learningState: result?.state
  });
});

app.post(['/api/learning-plan/complete', '/api/plan/complete'], async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.body.courseId);
    const { itemId } = req.body;
    const planBefore = db.getLearningPlan(userId, courseId);
    const targetItem = planBefore?.items?.find(i => i.id === itemId);

    const result = db.completeLearningPlanActivity(userId, courseId, itemId);

    if (targetItem) {
      const topicId = targetItem.topicId || 'inheritance';
      const engineRes = await processLearningEvidence({
        userId,
        courseId,
        topicId,
        topicTitle: targetItem.topicTitle || getTopicTitle(topicId, courseId),
        source: 'learning_activity',
        score: 85,
        passed: true,
        details: `Completed curriculum task: ${targetItem.title}`,
        conceptDemonstrated: targetItem.title,
        updateLearningPlan: false
      });

      return res.json({
        learningPlan: result?.plan,
        learningState: engineRes.state
      });
    }

    res.json({
      learningPlan: result?.plan,
      learningState: result?.state
    });
  } catch (err) {
    console.error('Complete plan activity error:', err);
    res.status(500).json({ error: 'Failed to complete plan activity' });
  }
});

app.post(['/api/learning-plan/generate', '/api/learning-plan/regenerate', '/api/plan/generate', '/api/plan/regenerate'], async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.body.courseId);
    const { studentGoal = 'Semester Examination' } = req.body;
    let map = db.getKnowledgeMap(userId, courseId);
    if (!map) {
      const state = db.getLearningState(userId, courseId);
      map = {
        courseId,
        courseTitle: 'Java Programming',
        overallLevel: 'Intermediate',
        overallScore: 64,
        topicProficiencies: { 'inheritance': 'Weak', 'fundamentals': 'Strong' },
        strongAreas: state.strongTopics,
        areasToImprove: state.moderateTopics,
        knowledgeGaps: state.weakTopics,
        recommendedStartingPoint: state.currentTopic || 'Inheritance',
        generatedAt: new Date().toISOString(),
        summary: 'Generated from baseline learning state.'
      };
    }
    const newPlan = await generatePersonalizedLearningPlan(courseId, map, studentGoal);
    db.saveLearningPlan(userId, courseId, newPlan);

    // Synchronize first item to nextBestAction
    const firstItem = newPlan.items[0];
    const updatedState = db.updateLearningState(userId, courseId, {
      currentTopic: newPlan.targetTopic,
      goal: studentGoal,
      nextBestAction: firstItem ? {
        title: firstItem.title,
        actionText: firstItem.description,
        reason: firstItem.reason || `First step in your personalized plan for ${newPlan.targetTopic}.`,
        estimatedMinutes: firstItem.estimatedMinutes,
        actionType: firstItem.type === 'code' ? 'practice' : firstItem.type === 'quiz' ? 'quiz' : 'learn',
        targetTopic: firstItem.topicId,
        buttonLabel: firstItem.type === 'code' ? 'Code in IDE' : firstItem.type === 'quiz' ? 'Take Quiz' : 'Start Learning'
      } : undefined
    });

    res.json({
      learningPlan: newPlan,
      learningState: updatedState
    });
  } catch (err) {
    console.error('Error generating learning plan:', err);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

// -------------------------------------------------------------
// Contextual AI Tutor
// -------------------------------------------------------------
app.get('/api/tutor/context', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = (req.query.courseId as string) || 'java-programming';
  const topic = (req.query.topic as string) || undefined;
  const activityId = (req.query.activityId as string) || undefined;
  const context = db.getStudentTutorContext(userId, courseId, topic, activityId);
  res.json({ context });
});

app.post('/api/tutor/topic', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { courseId = 'java-programming', topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  db.setCurrentTutoringTopic(userId, courseId, topic);
  const context = db.getStudentTutorContext(userId, courseId, topic);
  res.json({ success: true, context });
});

app.get('/api/tutor/history', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = (req.query.courseId as string) || 'java-programming';
  const history = db.getTutorHistory(userId, courseId);
  res.json({ messages: history });
});

app.post('/api/tutor/chat', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const {
      courseId = 'java-programming',
      message = '',
      mode = 'explain',
      topic,
      activityId,
      activityTitle,
      codeSnippet,
      image,
      imageUrl
    } = req.body;

    const trimmedMsg = (message || '').trim();
    
    // Normalize image payload if passed as object or dataUrl
    let parsedImage: { data: string; mimeType: string; name?: string } | undefined = undefined;
    if (image && image.data) {
      const mime = image.mimeType || (image.data.startsWith('data:') ? image.data.match(/^data:([^;]+);base64,/)?.[1] : 'image/jpeg') || 'image/jpeg';
      const cleanData = image.data.replace(/^data:[^;]+;base64,/, '').trim();
      if (cleanData) {
        parsedImage = {
          data: cleanData,
          mimeType: mime === 'image/svg+xml' ? 'image/png' : mime,
          name: image.name || 'uploaded_image'
        };
      }
    } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      const mime = imageUrl.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
      const cleanData = imageUrl.replace(/^data:[^;]+;base64,/, '').trim();
      if (cleanData) {
        parsedImage = {
          data: cleanData,
          mimeType: mime === 'image/svg+xml' ? 'image/png' : mime,
          name: 'uploaded_image'
        };
      }
    }

    const hasImage = !!parsedImage;

    if (!trimmedMsg && !hasImage && !codeSnippet) {
      return res.status(400).json({ error: 'Please provide a message, question, image, or code snippet.' });
    }

    const studentContext = db.getStudentTutorContext(userId, courseId, topic, activityId);
    const history = db.getTutorHistory(userId, courseId);

    // Prepare stored image URL for user bubble
    let storedImageUrl: string | undefined = imageUrl;
    if (!storedImageUrl && parsedImage?.data) {
      storedImageUrl = `data:${parsedImage.mimeType};base64,${parsedImage.data}`;
    }

    const effectiveUserContent = trimmedMsg || (hasImage ? '📷 [Image Question Analysis Request]' : 'Please review my attached code.');

    // Append user message
    const userMsg = {
      id: `usr_msg_${Date.now()}`,
      role: 'user' as const,
      content: effectiveUserContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode,
      contextTopic: studentContext.currentTopic,
      contextActivity: activityTitle || studentContext.currentActivity?.title,
      codeSnippet,
      imageUrl: storedImageUrl
    };
    db.appendTutorMessage(userId, courseId, userMsg);

    // Call Gemini with full student learning context and image data
    const aiResponse = await getTutorResponse(studentContext, history, trimmedMsg, {
      mode,
      topic: studentContext.currentTopic,
      activityId,
      activityTitle: activityTitle || studentContext.currentActivity?.title,
      codeSnippet,
      image: parsedImage
    });

    const assistantMsg = {
      id: `ai_msg_${Date.now()}`,
      role: 'assistant' as const,
      content: aiResponse.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: aiResponse.mode,
      contextTopic: aiResponse.topic || studentContext.currentTopic,
      contextActivity: activityTitle || studentContext.currentActivity?.title,
      difficulty: aiResponse.difficulty,
      codeSnippet: aiResponse.codeSnippet,
      evaluation: aiResponse.evaluation,
      suggestedQuestions: aiResponse.suggestedQuestions,
      isVerifiedConcept: aiResponse.isVerifiedConcept,
      productiveIntervention: aiResponse.productiveIntervention,
      positiveReinforcement: aiResponse.positiveReinforcement,
      reflectionPrompt: aiResponse.reflectionPrompt
    };
    db.appendTutorMessage(userId, courseId, assistantMsg);

    // Log activity and record streak activity
    db.addActivityLog(userId, {
      type: 'tutor',
      title: `${hasImage ? 'Visual AI Search' : 'AI Tutor'}: ${aiResponse.topic || studentContext.currentTopic}`,
      topic: aiResponse.topic || studentContext.currentTopic,
      status: 'completed',
      timestamp: 'Just now'
    });

    // Meaningful learning activity for streak
    db.recordMeaningfulActivity(userId, 'tutor_question', `${hasImage ? 'Camera/Image query' : 'Tutoring query'}: ${aiResponse.topic || studentContext.currentTopic}`);

    res.json({ response: assistantMsg, message: assistantMsg, context: studentContext });
  } catch (err: any) {
    console.error('Tutor error:', err);
    res.status(500).json({ error: 'Tutor service error' });
  }
});

app.post('/api/tutor/clear', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = req.body.courseId || 'java-programming';
  db.clearTutorHistory(userId, courseId);
  res.json({ success: true });
});

app.post('/api/tutor/voice-transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const transcript = await transcribeAudio(audioData, mimeType || 'audio/webm');
    res.json({ transcript: transcript || '' });
  } catch (err: any) {
    console.error('Voice transcription error:', err);
    res.status(500).json({ error: 'Voice transcription failed' });
  }
});


// -------------------------------------------------------------
// Practical Route First (Coding Task & IDE Execution)
// -------------------------------------------------------------
app.get(['/api/practice/task', '/api/practice/tasks', '/api/practice/:topicId'], (req: Request, res: Response) => {
  let topicId = req.params.topicId;
  if (!topicId || topicId === 'task' || topicId === 'tasks') {
    topicId = (req.query.topicId as string) || (req.query.topic as string) || 'inheritance';
  }
  const task = getPracticalTaskForTopic(topicId);
  res.json({ task });
});

app.post(['/api/practice/submit', '/api/practice/run', '/api/practice/execute', '/api/practice/compile'], async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    let { topicId, submittedCode, code, taskId, courseId = 'java-programming' } = req.body;
    if (!submittedCode && code) {
      submittedCode = code;
    }
    if (!topicId) {
      if (req.body.topic) {
        topicId = req.body.topic;
      } else if (taskId) {
        topicId = taskId.replace(/^task_java_|^task_/, '').replace(/_\d+$/, '');
      } else {
        topicId = 'inheritance';
      }
    }
    const task = getPracticalTaskForTopic(topicId);

    const result = await evaluateCodeSubmission(task, submittedCode || '');

    db.recordPracticalSubmission(userId, task.id, submittedCode || '', result.passed);

    // Update learning state through adaptive evaluation engine
    const engineRes = await processLearningEvidence({
      userId,
      courseId,
      topicId,
      topicTitle: task.title,
      source: 'practical',
      score: result.score,
      passed: result.passed,
      details: `Coding Task: ${task.title} - ${result.passed ? 'Passed tests' : 'Incomplete/Errors'}`,
      conceptDemonstrated: task.title,
      mistakesIdentified: result.passed ? [] : [result.feedback || 'Test case failure in practical submission'],
      updateLearningPlan: result.passed
    });

    res.json({ result, state: engineRes.state });
  } catch (err: any) {
    console.error('Practice submission error:', err);
    res.status(500).json({ error: 'Failed to evaluate practical code submission' });
  }
});

// -------------------------------------------------------------
// STEP 5: Practical Route Engine (5-Stage Progression)
// -------------------------------------------------------------
app.get(['/api/practical-route/:courseId/:topicId', '/api/practical-route'], async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.params.courseId || (req.query.courseId as string) || 'java-programming');
    const topicId = (req.params.topicId || (req.query.topicId as string) || (req.query.topic as string) || 'inheritance').toLowerCase();

    let route = db.getPracticalRoute(userId, courseId, topicId);
    if (!route) {
      const state = db.getLearningState(userId, courseId);
      const studentLevel = state.overallLevel || 'Intermediate';
      const knowledgeMap = db.getKnowledgeMap(userId, courseId);
      const gaps = knowledgeMap?.knowledgeGaps || state.weakTopics || [];

      route = await generateAdaptivePracticalRoute({
        courseId,
        topicId,
        studentLevel,
        knowledgeGaps: gaps,
        weakTopics: state.weakTopics || [],
        learningGoal: state.goal
      });
      db.savePracticalRoute(userId, courseId, topicId, route);
    }
    res.json({ route });
  } catch (err) {
    console.error('Practical route fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve practical route' });
  }
});

app.post(['/api/practical-route/generate', '/api/practical-route/regenerate'], async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.body.courseId || 'java-programming');
    const topicId = (req.body.topicId || req.body.topic || 'inheritance').toLowerCase();
    const state = db.getLearningState(userId, courseId);
    const studentLevel = req.body.level || state.overallLevel || 'Intermediate';
    const knowledgeMap = db.getKnowledgeMap(userId, courseId);
    const gaps = knowledgeMap?.knowledgeGaps || state.weakTopics || [];

    const route = await generateAdaptivePracticalRoute({
      courseId,
      topicId,
      topicTitle: req.body.topicTitle,
      studentLevel,
      knowledgeGaps: gaps,
      weakTopics: state.weakTopics || [],
      learningGoal: state.goal,
      currentPlanItemId: req.body.planItemId
    });
    db.savePracticalRoute(userId, courseId, topicId, route);
    res.json({ route });
  } catch (err) {
    console.error('Practical route generation error:', err);
    res.status(500).json({ error: 'Failed to generate practical route' });
  }
});

app.post('/api/practical-route/submit', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const courseId = normalizeCourseId(req.body.courseId || 'java-programming');
    const topicId = (req.body.topicId || req.body.topic || 'inheritance').toLowerCase();
    const { activityId, submission, code } = req.body;
    const finalSubmission = (submission !== undefined && submission !== null) ? String(submission) : (code ? String(code) : '');

    let route = db.getPracticalRoute(userId, courseId, topicId);
    if (!route) {
      route = getCuratedPracticalRoute(courseId, topicId);
      db.savePracticalRoute(userId, courseId, topicId, route);
    }

    // Find the target activity
    let targetActivity: any = null;
    for (const st of route.stages) {
      for (const act of st.activities) {
        if (act.id === activityId) {
          targetActivity = act;
          break;
        }
      }
      if (targetActivity) break;
    }

    if (!targetActivity) {
      const curStageObj = route.stages.find(s => s.stage === route.currentStage) || route.stages[0];
      targetActivity = curStageObj.activities[0];
    }

    const state = db.getLearningState(userId, courseId);
    const feedback = await evaluatePracticalActivitySubmission({
      activity: targetActivity,
      submission: finalSubmission,
      studentLevel: route.studentLevel || state.overallLevel || 'Intermediate',
      topicTitle: route.topicTitle
    });

    // Record attempt
    db.recordPracticalAttempt(userId, {
      id: `att_${Date.now()}`,
      userId,
      courseId,
      topicId,
      activityId: targetActivity.id,
      stage: targetActivity.stage,
      activityType: targetActivity.type,
      difficulty: targetActivity.difficulty,
      submission: finalSubmission,
      score: feedback.score,
      passed: feedback.passed,
      feedback,
      timestamp: new Date().toISOString()
    });

    // Process evidence through adaptive evaluation engine
    const engineRes = await processLearningEvidence({
      userId,
      courseId,
      topicId,
      topicTitle: route.topicTitle,
      source: 'practical',
      score: feedback.score,
      passed: feedback.passed,
      details: `${targetActivity.stage.toUpperCase()}: ${targetActivity.title} - ${feedback.whatNeedsImprovement || feedback.suggestedImprovement || 'Practical evaluation'}`,
      conceptDemonstrated: targetActivity.title,
      mistakesIdentified: feedback.mistakesExplanation ? [feedback.mistakesExplanation] : feedback.whatNeedsImprovement ? [feedback.whatNeedsImprovement] : [],
      updateLearningPlan: feedback.passed
    });

    let updatedRoute = route;
    let updatedPlan = engineRes.learningPlan;

    if (feedback.passed) {
      const completionResult = db.completePracticalActivity(userId, courseId, topicId, targetActivity.id, feedback);
      updatedRoute = completionResult.route;
      if (!updatedPlan) {
        updatedPlan = completionResult.plan;
      }
    }

    res.json({
      feedback,
      route: updatedRoute,
      state: engineRes.state,
      plan: updatedPlan
    });
  } catch (err) {
    console.error('Practical submission error:', err);
    res.status(500).json({ error: 'Failed to process practical submission' });
  }
});

app.get('/api/practical-route/attempts', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const courseId = req.query.courseId as string;
  const topicId = req.query.topicId as string;
  const attempts = db.getPracticalAttempts(userId, courseId, topicId);
  res.json({ attempts });
});

// -------------------------------------------------------------
// Quiz System & Next Best Action
// -------------------------------------------------------------
app.get(['/api/quiz/questions', '/api/quiz/:topicId'], async (req: Request, res: Response) => {
  try {
    let topicId = req.params.topicId;
    if (!topicId || topicId === 'questions') {
      topicId = (req.query.topic as string) || (req.query.topicId as string) || 'inheritance';
    }
    const courseId = (req.query.courseId as string) || 'java-programming';
    const forceRegenerate = req.query.regenerate === 'true';

    // 1. Check database cache first to prevent repeated LLM calls & quota exhaustion
    if (!forceRegenerate) {
      const cached = db.getQuiz(courseId, topicId);
      if (cached && cached.questions && cached.questions.length > 0) {
        return res.json({ quiz: cached, fromCache: true });
      }
    }

    const quiz = await generateQuizForTopic(courseId, topicId);
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      db.saveQuiz(courseId, topicId, quiz);
    }
    res.json({ quiz, fromCache: false });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.post('/api/quiz/submit', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { quiz, answers, courseId = 'java-programming' } = req.body;
    const state = db.getLearningState(userId, courseId);

    const result = await evaluateQuizSubmission(quiz, answers, state);

    db.saveQuizResult(userId, courseId, result);

    // Extract mistakes from quiz evaluation if any
    const mistakes: string[] = [];
    if (result.mistakes && Array.isArray(result.mistakes)) {
      for (const m of result.mistakes) {
        if (m.explanation) {
          mistakes.push(m.explanation.split('.')[0]);
        }
      }
    }

    // Process evidence through adaptive evaluation engine
    const engineRes = await processLearningEvidence({
      userId,
      courseId,
      topicId: quiz.topicId,
      topicTitle: quiz.topicTitle,
      source: 'quiz',
      score: result.percentage,
      passed: result.passed,
      details: `Topic Quiz: ${result.score}/${result.totalQuestions} questions correct (${result.percentage}%)`,
      conceptDemonstrated: quiz.topicTitle,
      mistakesIdentified: mistakes,
      updateLearningPlan: result.passed
    });

    res.json({ result, state: engineRes.state });
  } catch (err: any) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to evaluate quiz' });
  }
});

// -------------------------------------------------------------
// Activity Logs
// -------------------------------------------------------------
app.get(['/api/activity-logs', '/api/student/activities', '/api/activities'], (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const logs = db.getActivityLogs(userId);
  res.json({ logs });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LEADENT AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
