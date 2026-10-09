# LEADENT AI

> **Know Your Level. Plan Your Journey. Master Your Skills.**

---

## 📖 Project Overview

**LEADENT AI** is an intelligent academic learning platform and personal learning agent designed to guide students through structured, mastery-based education. Rather than providing passive answers, LEADENT AI helps students:

1. **Assess Their Knowledge:** Diagnose baseline proficiency across subjects and identify hidden conceptual learning gaps.
2. **Plan Their Journey:** Generate dynamic, adaptive learning roadmaps tailored to individual paces and milestones.
3. **Master Concepts with AI Tutoring:** Engage with an intelligent tutor equipped with Socratic inquiry, step-by-step problem breakdown, code debugging, and visual explanations.
4. **Practice & Test:** Solidify understanding through topic-specific quizzes, immediate solution analysis, and guided exercises.
5. **Evaluate & Track Progress:** Visualize mastery percentages, study streaks, active sessions, and subject completion over time.

---

## ✨ Key Features

All features listed below are implemented and integrated within the application:

### 1. Student Authentication & Profile Management
- Secure student registration and login with One-Time Password (OTP) verification sent via email (SMTP).
- Persistent student sessions and academic profile configuration (target exams, grade levels, and learning goals).

### 2. "Check My Level" Knowledge Assessment
- Interactive, multi-topic diagnostic evaluation tool to determine baseline student mastery.
- Automatic classification of academic levels (Beginner, Intermediate, Advanced) across prerequisite concepts.

### 3. Personalized Learning Plans
- Dynamic curriculum generation that maps out core units, subtopics, and estimated completion times.
- Real-time progress synchronization marking topics as *Not Started*, *In Progress*, or *Mastered*.

### 4. Multimodal AI Tutor
- **Four Distinct Modes:**
  - **Explain:** Clear, intuitive conceptual breakdowns with academic analogies.
  - **Socratic:** Guided inquiry that prompts students with reflective questions to build independent reasoning.
  - **Solve:** Structured step-by-step mathematical and analytical solutions.
  - **Debug:** Source code analysis with highlighted fixes and explanations for programming coursework.
- **Multimodal Visual & Camera Search:** Upload textbook photos, handwritten equations, or diagrams for instant OCR and reasoning.
- **Academic Diagrams & Visual Aids:** In-session visual concept renderings and interactive math/logic representations.
- **Voice Conversation & Speech:** Hands-free voice conversation with visual audio orb and text-to-speech (TTS) audio playback.

### 5. Productive Learning Guardrails
- **"Try First" Intervention:** Actively encourages students to attempt problems or outline their current thinking before viewing full solutions.
- **Academic Integrity:** Designed to cultivate problem-solving habits rather than shortcutting academic rigor.

### 6. Practice, Quizzes & Evaluation
- Topic-specific quizzes with instant scoring, answer explanations, and solution walkthroughs.
- Detailed question review modal highlighting strengths and areas for reinforcement.

### 7. Learning Progress Analytics
- Visual dashboard tracking total study time, current streaks, completed topics, and quiz accuracy.
- Subject-by-subject mastery bars and recent activity feeds.

### 8. Curated Study Resources
- Structured reference library providing textbooks, video lectures, cheat sheets, and official documentation links.

### 9. Gamification & Study Engagement
- Interactive waiting mini-games (academic trivia and quick-recall flashcards) while reasoning models formulate structured answers.
- Milestone celebration animations (confetti effects) upon completing quizzes and advancing learning levels.

---

## 🛠️ Technology Stack

LEADENT AI is built with a modern full-stack TypeScript architecture:

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animation & Effects:** [Motion](https://motion.dev/) (Framer Motion) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio & Speech:** Web Speech API (SpeechRecognition & SpeechSynthesis)

### Backend & Server
- **Server:** [Express 4](https://expressjs.com/) on [Node.js](https://nodejs.org/)
- **Execution & Bundling:** [tsx](https://github.com/privatenumber/tsx) (development) and [esbuild](https://esbuild.github.io/) (production bundling)
- **Email Delivery:** [Nodemailer](https://nodemailer.com/) (SMTP transport for OTP authentication)
- **Data Persistence:** Lightweight local JSON database engine (`server/db.ts`) with atomic write buffers and snapshot backups.

### AI Engine
- **SDK:** Google Gen AI SDK (`@google/genai`)
- **Models:** Gemini multimodal reasoning models (`gemini-3.6-flash`, `gemini-3.1-flash-lite`) supporting text, code, and vision analysis.

---

## 📂 Project Structure

```text
leadent-ai/
├── .env.example              # Sample environment variable configuration
├── .gitignore                # Git ignore rules for node_modules, dist, and local envs
├── index.html                # Single-page application entry HTML
├── metadata.json             # Application metadata, title, and permissions
├── package.json              # Project dependencies and operational scripts
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite build configuration with Tailwind CSS plugin
├── server.ts                 # Full-stack Express server integrating Vite middleware & API routes
├── data/                     # Local application storage (database JSON & backups)
│   ├── leadent_db.json
│   └── leadent_db.backup.json
├── server/                   # Server-side business logic and services
│   ├── db.ts                 # Persistent JSON database operations
│   ├── emailService.ts       # SMTP email dispatcher
│   ├── gemini.ts             # Gemini API initialization & prompt pipelines
│   ├── learningStateEngine.ts# Curriculum and student progress tracking
│   ├── otpService.ts         # Secure OTP generation and verification
│   ├── practicalEngine.ts    # Diagnostic evaluation logic
│   ├── resourcesData.ts      # Educational resource directory
│   ├── syllabus.ts           # Course syllabi, topics, and question banks
│   └── tutorKnowledge.ts     # Specialized academic knowledge base
└── src/                      # Frontend client application
    ├── App.tsx               # Main layout and top-level view routing
    ├── main.tsx              # React client root mount
    ├── index.css             # Global Tailwind CSS imports
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
    ├── context/              # React Context providers (Auth, Learning State)
    ├── data/                 # Client mock schemas & reference courses
    ├── services/             # Client API bridges, TTS, and local helpers
    ├── types/                # Shared TypeScript interface and type definitions
    └── views/                # Primary screen views
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
- `npm` (or `bun` / `pnpm`)

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
Copy `.env.example` to create a local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and fill in your configuration values (see [Environment Configuration](#-environment-configuration)).

### 4. Start the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 5. Build for Production
To bundle both the client and server for deployment:
```bash
npm run build
npm start
```

---

## ⚙️ Environment Configuration

Environment variables are configured in `.env`. Use `.env.example` as a template:

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key used for tutoring and multimodal reasoning | **Yes** | `AIzaSy...` |
| `APP_URL` | Public or local base URL of the application | Optional | `http://localhost:3000` |
| `SMTP_HOST` | Hostname of your SMTP email provider | Optional (for live email OTP) | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port (e.g., 587 for TLS, 465 for SSL) | Optional | `587` |
| `SMTP_SECURE` | Set to `true` for port 465, or `false` for port 587 | Optional | `false` |
| `SMTP_USER` | SMTP username or API key user | Optional | `apikey` |
| `SMTP_PASS` | SMTP password or API token | Optional | `your_smtp_token` |
| `SMTP_FROM` | Sender display name and email address | Optional | `"LEADENT AI <no-reply@leadent.ai>"` |

> **Note:** If SMTP credentials are not configured, OTP codes will be logged to the server console during local development for easy testing without an external mail provider.

---

## 🔒 Security & Data Privacy

1. **Protect Secrets:** Never commit your `.env` file, API keys, or email server credentials to a public Git repository. Ensure `.env` remains in `.gitignore`.
2. **Student Data Privacy:** Do not commit production databases or real student records (`data/leadent_db.json`, `data/leadent_db.backup.json`) to public source control.
3. **API Key Safety:** The Gemini API key is accessed exclusively server-side in `server/gemini.ts` through backend Express routes. It is never exposed in client bundles or browser network requests.

---

## 🔮 Future Development

Potential enhancements planned for subsequent phases:
- Dedicated classroom dashboards for teachers and tutors to assign custom modules.
- Offline-first progressive web application (PWA) caching for low-connectivity environments.
- Support for additional export formats for learning summaries (PDF, Anki flashcard decks, Notion integration).
- Multi-language academic tutoring support for international curricula.

---

## 📄 License & Attribution

LEADENT AI — Built for empowered, self-directed student mastery.
All rights reserved.
