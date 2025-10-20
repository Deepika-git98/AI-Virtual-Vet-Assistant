# AI Virtual Vet Assistant

## Overview
The AI Virtual Vet Assistant is a full-stack application that helps pet owners log their pets, track symptom reports, and receive AI-assisted triage guidance. The project couples a React dashboard with an Express/Prisma API and integrates with OpenAI to generate veterinary-style analyses and follow-up actions.

## Plain-language explainer
If you are not a developer, think of the assistant as a digital notebook and adviser for your pets:

- You sign in on a secure website and add each of your animals.
- When a pet shows new symptoms, you fill in a simple form describing what you observe.
- The system stores the history for you and, if an AI key is configured, asks OpenAI for friendly guidance about possible next steps (for example, "monitor at home" or "see a vet soon").
- Every report is saved so you can show a vet later or compare how a pet is doing over time.

To try it yourself you only need a laptop, an internet browser, and the ability to install the tools listed below.

## Architecture
- **Frontend (`frontend/`)** – React 19 + TypeScript single-page app styled with Tailwind CSS. It uses React Router for client-side routing, React Hook Form for data capture, and a centralized auth context to persist user sessions and API tokens.
- **Backend (`backend/`)** – Node.js Express server written in TypeScript. It layers controllers, routes, and middleware, and relies on Prisma as the ORM to a PostgreSQL database. Authentication is handled with JWTs, password hashing via `bcryptjs`, and request validation through `express-validator`.
- **Database** – PostgreSQL schema managed by Prisma migrations. Core models include `User`, `Pet`, `SymptomReport`, and `SymptomAnalysis`, giving the API relational links between owners, pets, and AI-generated evaluations.
- **AI Integration** – Symptom reports can be analyzed through OpenAI’s Chat Completions API (`gpt-4o-mini`). The backend falls back to a rules-based severity matrix if an API key is not configured or a request fails, ensuring users always receive guidance.

## Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ instance accessible via connection string
- (Optional) OpenAI API key for automated symptom analysis

## Initial Setup
1. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

   > **Non-technical tip:** Installing Node.js also installs `npm`. Download the LTS installer for your operating system from [nodejs.org](https://nodejs.org/), run it like any other app installer, then reopen your terminal (Command Prompt, PowerShell, or Terminal on macOS/Linux) before pasting the commands above.

2. **Configure environment variables**
   Create a `.env` file in `backend/` with at least:
   ```ini
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   JWT_SECRET="replace-with-long-random-string"
   OPENAI_API_KEY="sk-..."            # optional but recommended
   PORT=3001                           # optional override of default port
   ```
   For the React app, optionally add a `frontend/.env` file to point at a non-default API origin:
   ```ini
   REACT_APP_API_URL="http://localhost:3001/api"
   ```

3. **Provision the database**
   From the `backend/` directory, run Prisma migrations and generate the client:
   ```bash
   npx prisma migrate dev     # creates schema and applies migrations locally
   npx prisma generate        # regenerates the Prisma client
   ```

   > **Non-technical tip:** These commands set up the database tables automatically. If you see an error that the database cannot be reached, double-check that PostgreSQL is running and that the username/password in `DATABASE_URL` are correct.

## Running the Project
Open two terminals and run the frontend and backend separately.

### Backend API
```bash
cd backend
npm run dev
```
This starts the Express server on `http://localhost:3001` by default. The API exposes routes for authentication (`/api/auth`), pet management (`/api/pets`), and symptom reporting plus AI analysis (`/api/symptoms`).

### Frontend App
```bash
cd frontend
npm start
```
The React development server runs on `http://localhost:3000` and proxies API calls to the backend via the configured `REACT_APP_API_URL`.

## Project Layout
```
AI-Virtual-Vet-Assistant/
├── backend/
│   ├── prisma/               # Database schema & migrations
│   └── src/
│       ├── controllers/      # Request handlers for auth, pets, symptoms
│       ├── middleware/       # Auth middleware attaching user context
│       ├── routes/           # Express routers mounted under /api
│       └── app.ts            # Express app bootstrap
├── frontend/
│   ├── src/
│   │   ├── components/       # UI and dashboard modules
│   │   ├── context/          # Auth context provider
│   │   ├── utils/            # API helper with token-aware fetch
│   │   └── types/            # Shared TypeScript interfaces
│   └── public/
└── README.md
```

## Useful Scripts
- `npm run dev` (backend) – Start the Express API with live reload via `ts-node-dev`.
- `npm run migrate` (backend) – Apply development migrations (`prisma migrate dev`).
- `npm run generate` (backend) – Regenerate the Prisma client.
- `npm start` (frontend) – Launch the React development server.
- `npm test` (frontend) – Execute the CRA testing harness.

## Environment Notes
- The backend expects valid JWTs on protected routes; the frontend stores the issued token in `localStorage` and attaches it automatically to API requests.
- Configuring `OPENAI_API_KEY` unlocks dynamic analyses. Without it, the API still responds using deterministic heuristics, but the output will lack LLM-generated nuance.
- Always remind users that AI recommendations are informational and not a replacement for licensed veterinary care.