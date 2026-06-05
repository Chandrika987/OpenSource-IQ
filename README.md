# OpenSourceIQ

AI-powered GitHub contribution intelligence platform. Analyze repositories, issues, pull requests, and portfolio impact with live GitHub data and rule-based portfolio insights.

## Features

- **Dashboard** — GitHub profile overview with repository stats
- **Analytics** — Language distribution, stars, and activity charts
- **Repositories** — Search, filter, and explore all public repos
- **Issues & Pull Requests** — Aggregated views across repositories
- **Profile & Portfolio Review** — Consistency score, insights, and recommendations
- **Leaderboard** — Compare top open source contributors by IQ score
- **GitHub OAuth** — Optional server-side sign-in with JWT (requires OAuth app)

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite, Tailwind CSS, Recharts, Zustand |
| Backend | Spring Boot 3.2, Java 21, Spring Security, JWT, OAuth2 |
| Database | PostgreSQL 15 |

## Quick Start

### Prerequisites

- Node.js 18+
- Java 21+
- Docker (for PostgreSQL)
- Maven (or use the bundled `apache-maven-3.9.6`)

### 1. Start the database

```bash
docker compose up -d
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in values. For username-only mode (no OAuth), you can skip GitHub OAuth credentials.

```bash
cp .env.example .env
```

### 3. Start the backend (optional — for OAuth sign-in)

```bash
cd backend
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Usage

### Username connect (no backend required)

1. Click **Connect GitHub** on the landing page
2. Enter any public GitHub username
3. Explore Dashboard, Analytics, Repositories, Issues, PRs, and Profile

### GitHub OAuth sign-in (backend required)

1. Create a [GitHub OAuth App](https://github.com/settings/developers)
2. Set callback URL to `http://localhost:8080/login/oauth2/code/github`
3. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`
4. Start backend and frontend
5. Click **Sign in with GitHub** on the landing page

## Project Structure

```
OpenSource-IQ/
├── frontend/          # React SPA
│   └── src/
│       ├── pages/     # Dashboard, Analytics, Profile, Leaderboard, etc.
│       ├── services/  # GitHub API clients with caching
│       └── store/     # Zustand auth state
├── backend/           # Spring Boot API
│   └── src/main/java/com/opensourceiq/
│       ├── controller/
│       ├── entity/
│       └── security/
└── docker-compose.yml # PostgreSQL
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/dashboard` | Public | Sample dashboard stats |
| GET | `/api/auth/me` | JWT | Current authenticated user |
| GET | `/oauth2/authorization/github` | Public | Start GitHub OAuth flow |

## Rate Limits

The frontend fetches data directly from the GitHub REST API (60 requests/hour unauthenticated). Analytics and leaderboard data are cached in `localStorage` for 5–10 minutes to reduce API calls.

## License

MIT
