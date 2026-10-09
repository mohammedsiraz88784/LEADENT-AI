# LEADENT AI

> **Know Your Level. Plan Your Journey. Master Your Skills.**

---

## 📖 Project Overview

**LEADENT AI** is an intelligent academic learning platform and personal learning agent designed to guide students through structured, mastery-based education. Rather than providing passive answers, LEADENT AI helps students:

1. **Assess Their Knowledge:** Diagnose baseline proficiency across subjects and identify hidden conceptual learning gaps.
2. **Plan Their Journey:** Follow adaptive, structured learning roadmaps organized by core units and milestones.
3. **Master Concepts with AI Tutoring:** Engage with an intelligent tutor equipped with pedagogical modes (Explain, Socratic, Solve, Debug), multimodal visual question analysis, and audio assistance.
4. **Practice & Test:** Solidify understanding through a 5-stage practical workflow, in-browser coding exercises, and topic-specific quizzes.
5. **Evaluate & Track Progress:** Visualize mastery percentages, study streaks, active sessions, and subject completion over time.

---

## ✨ Implemented Features

The following features are implemented and active in the current codebase:

### 1. Student Authentication & Profile Management
- **Registration & Login:** Student account creation and login with 6-digit One-Time Password (OTP) verification.
- **Email Delivery (SMTP):** Real email dispatch via Nodemailer when SMTP credentials are provided; falls back to dev server console logging for easy local development without an external mail provider.
- **Session Persistence:** Persistent student sessions stored in a local atomic JSON database engine (`server/db.ts`) with automatic snapshot backups.
- **Profile Customization:** Academic goals, target examinations, and grade level configuration.
- **Demo Account:** Built-in demo user sign-in for evaluation and testing.

### 2. "Check My Level" Knowledge Assessment
- **Diagnostic Testing:** Interactive multi-question assessment evaluating student baseline understanding across subject topics.
- **Proficiency Classification:** Automatic categorization into academic levels (*Beginner*, *Intermediate*, *Advanced*) with recommended starting points.

### 3. Personalized Learning Plans
- **Curriculum Roadmaps:** Structured units and subtopics with estimated completion durations.
- **Dynamic Status Tracking:** Topics categorized as *Not Started*, *In Progress*, or *Mastered* based on completed learning activities and quizzes.

### 4. Multimodal AI Tutor
- **Four Pedagogical Modes:**
  - **Explain:** Clear conceptual breakdowns with intuitive analogies.
  - **Socratic:** Guided inquiry prompting students to reason through problems independently.
  - **Solve:** Structured step-by-step mathematical and algorithmic solutions.
  - **Debug:** Source code analysis with root-cause identification and suggested fixes.
- **Multimodal Vision & Camera Search:** Upload textbook photos, handwritten formulas, code snippets, or diagrams via camera capture or file upload for multimodal analysis using Google Gemini models.
- **Interactive Markdown & Code Blocks:** Formatted responses with one-click code copying and "Send to Practice IDE" integration.
- **Voice Search & Speech Playback:** Browser-native speech recognition for voice queries and Web Speech API speech synthesis with audio player controls (play, pause, replay).
- **Curated Offline Fallbacks:** Pre-compiled academic knowledge bank providing responses if offline or during upstream API rate limits.

### 5. Productive Learning Guardrails
- **"Try First" Intervention:** Active prompt drawer that detects direct answer requests and encourages students to attempt the problem or explain their thinking before viewing complete solutions.
- **Integrity Enforcement:** Fosters critical thinking and learning retention rather than passive memorization.

### 6. Practice & Practical Coding (5-Stage Learning Pathway)
- **Structured Stages:** Follows a practical-first sequence: *Understand* → *Example* → *Practice* → *Real-World Application* → *Evaluation*.
- **In-Browser Code Editor:** Code workspace with test execution simulation, hint delivery, and AI-assisted answer evaluation.

### 7. Quizzes & Evaluation
- **Topic Quizzes:** Multi-question timed assessments with instant scoring.
- **Detailed Question Review:** Comprehensive review modal highlighting correct answers, rationale, and study recommendations.
- **Celebration Effects:** Confetti animations upon quiz completion and milestone achievements.

### 8. Learning Analytics Dashboard
- **Progress Tracking:** Overview of total study minutes, current streaks, completed units, and quiz accuracy.
- **Visual Mastery:** Subject-by-subject progress bars and recent activity logs.

### 9. Curated Study Tools & Resources
- **Resource Directory:** Categorized links to verified interactive simulators, visualizers, reference cheat sheets, official documentation, and learning platforms.

### 10. Gamification & Waiting Activities
- **Interactive Mini-Games:** Academic trivia and flashcard recall activities presented while reasoning models formulate structured answers.

---

## 🛠️ Technology Stack

LEADENT AI is built with a modern full-stack TypeScript architecture:

### Frontend
- **Framework:** [React 19](https://react.dev/) (`react` 19.0.1, `react-dom` 19.0.1)
- **Build Tool:** [Vite 6](https://vitejs.dev/) (`vite` 6.2.3)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (TypeScript ~5.8.2)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **UI Icons:** [Lucide React](https://lucide.dev/) (`lucide-react` 0.546.0)
- **Animations:** [Motion](https://motion.dev/) (Framer Motion `12.23.24`) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Speech API:** Browser-native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

### Backend & Server
- **Server:** [Express 4](https://expressjs.com/) (`express` 4.21.2) on [Node.js](https://nodejs.org/)
- **Runtime & Execution:** [tsx](https://github.com/privatenumber/tsx) (development) and [esbuild](https://esbuild.github.io/) (production bundling)
- **Email Delivery:** [Nodemailer](https://nodemailer.com/) (`nodemailer` 10.0.9) for SMTP OTP dispatch
- **Data Persistence:** Custom file-backed JSON database (`server/db.ts`) with atomic write buffers and snapshot backups (`leadent_db.json`)
- **Environment Management:** [dotenv](https://github.com/motdotla/dotenv) (`dotenv` 17.2.3)

### AI & Reasoning Engine
- **SDK:** Google Gen AI TypeScript SDK (`@google/genai` 2.4.0)
- **Models:** Multimodal reasoning models (`gemini-3.6-flash`, `gemini-3.1-flash-lite`) supporting text, code, and vision input with server-side cascading fallback logic.

---

## 📂 Project Structure

```text
leadent-ai/
├── .env.example              # Sample environment variable template
├── .gitignore                # Git ignore rules for node_modules, dist, .env, and local state
├── index.html                # Single-page application entry HTML
├── metadata.json             # Applet metadata, title, and permissions
├── package.json              # Project dependencies and npm scripts
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite build configuration with Tailwind CSS plugin
├── server.ts                 # Full-stack Express server integrating Vite middleware & API endpoints
├── data/                     # Local file-based database and snapshot backups
│   ├── leadent_db.json
│   └── leadent_db.backup.json
├── server/                   # Server-side business logic and API services
│   ├── db.ts                 # Atomic JSON database operations
│   ├── emailService.ts       # SMTP email dispatcher with console fallback
│   ├── gemini.ts             # Gemini SDK initialization, prompt templates, and fallback cascade
│   ├── learningStateEngine.ts# Student progress and curriculum state engine
│   ├── otpService.ts         # Secure OTP generation and verification
│   ├── practicalEngine.ts    # Diagnostic evaluation and practical task scoring
│   ├── resourcesData.ts      # Curated educational resource catalog
│   ├── syllabus.ts           # Courses, units, topics, and assessment question banks
│   └── tutorKnowledge.ts     # Offline academic knowledge bank for fallback responses
└── src/                      # Frontend client application
    ├── App.tsx               # Primary layout and view routing
    ├── main.tsx              # React client mount entry
    ├── index.css             # Global stylesheet importing Tailwind CSS
    ├── components/           # Reusable UI components
    │   ├── AuthModal.tsx
    │   ├── CameraSearchModal.tsx
    │   ├── GlobalVoiceSearchModal.tsx
    │   ├── Navbar.tsx
    │   ├── ProductiveInterventionCard.tsx
    │   ├── Sidebar.tsx
    │   ├── TryFirstDrawer.tsx
    │   ├── TutorEvaluationCard.tsx
    │   ├── TutorMarkdown.tsx
    │   ├── TutorSpeechPlayer.tsx
    │   ├── VoiceAssistantButton.tsx
    │   ├── VoiceConversationOrb.tsx
    │   └── WaitingLearningGame.tsx
    ├── context/              # React Context providers (AuthContext, LearningContext)
    ├── data/                 # Client schemas, reference courses, and sample data
    ├── services/             # Client API bridges, TTS helpers, and utilities
    ├── types/                # Shared TypeScript type definitions
    └── views/                # Primary application screens
        ├── AITutorView.tsx
        ├── CheckMyLevelModal.tsx
        ├── CoursesView.tsx
        ├── DashboardView.tsx
        ├── LearningPlanView.tsx
        ├── PracticeView.tsx
        ├── ProgressView.tsx
        ├── QuizView.tsx
        └── StudyToolsView.tsx
```

---

## 🚀 Setup & Installation

Follow these steps to run LEADENT AI locally:

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (bundled with Node.js)

### 1. Clone or Download the Repository
```bash
git clone <your-repository-url>
cd leadent-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```
Open `.env` and configure your API keys and optional SMTP settings (see [Environment Configuration](#-environment-configuration)).

### 4. Start the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with hot module replacement (HMR) and Express API endpoints.

### 5. Type Checking & Code Quality
```bash
npm run lint
```
Runs `tsc --noEmit` to verify TypeScript types across both client and server files.

### 6. Build and Run for Production
```bash
npm run build
npm start
```
`npm run build` compiles client assets with Vite and bundles the server into `dist/server.cjs` with esbuild. `npm start` launches the bundled production server.

---

## ⚙️ Environment Configuration

Environment variables are configured in `.env`. Use `.env.example` as a template:

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key used for tutoring and multimodal reasoning | **Yes** (for live AI features) | `your_gemini_api_key_here` |
| `APP_URL` | Public or local base URL of the application | Optional | `http://localhost:3000` |
| `PORT` | Port number for the HTTP server | Optional (default: `3000`) | `3000` |
| `SMTP_HOST` | Hostname of your SMTP email provider | Optional (for live email OTP) | `smtp.example.com` |
| `SMTP_PORT` | SMTP server port (`587` for TLS, `465` for SSL) | Optional (default: `587`) | `587` |
| `SMTP_SECURE` | Set to `true` for port 465 SSL, or `false` for port 587 TLS | Optional (default: `false`) | `false` |
| `SMTP_USER` | SMTP username or service account email | Optional | `your_smtp_username` |
| `SMTP_PASS` | SMTP password or provider API key | Optional | `your_smtp_password_here` |
| `SMTP_FROM` | Sender display name and email address | Optional | `"LEADENT AI <no-reply@leadent.ai>"` |

> **Development Tip:** If SMTP credentials are not configured, OTP verification codes are automatically printed to the terminal console during development, enabling complete authentication flows without an external mail account.

---

## 🔒 Security & Data Privacy

1. **Protect Credentials:** Never commit your `.env` file, API keys, or email server credentials to a public Git repository. Keep `.env` listed in `.gitignore`.
2. **Student Data Privacy:** Do not publish production database files (`data/leadent_db.json`, `data/leadent_db.backup.json`) or real student account records to public repositories.
3. **Server-Side API Keys:** The Gemini API key (`GEMINI_API_KEY`) is stored strictly server-side and accessed by Express API routes in `server/gemini.ts`. It is never exposed to client browsers or bundled into static assets.

---

## 🔮 Future Development

The following enhancements are planned for future releases:
- **Instructor & Classroom Dashboard:** Dedicated portal for teachers and professors to assign custom modules, monitor cohort progress, and track student mastery.
- **Offline PWA Capabilities:** Service worker caching and offline database synchronization for low-bandwidth educational environments.
- **Learning Summary Exports:** Automated generation of study summaries into exportable formats (PDF cheat sheets, Anki flashcard decks, and markdown).
- **Expanded Subject Curricula:** Additional specialized engineering, mathematics, and natural science courses.

---

## 📄 License & Attribution

LEADENT AI — Built for empowered, self-directed student mastery.  
All rights reserved.
