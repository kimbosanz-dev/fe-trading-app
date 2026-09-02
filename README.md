# Trade Blotter Frontend

React + TypeScript + Vite frontend for a trade blotter UI.

> **Note:** This frontend requires the companion backend API to be cloned and running separately: [be-trading-app](https://github.com/kimbosanz-dev/be-trading-app.git). Refer to that repo's own README for its setup/run instructions — steps are not duplicated here.

## Prerequisites

- Node.js 20+ (recommended LTS)
- npm 10+
- Backend API running locally (default: `http://localhost:3001/api`) — see note above

## Setup after cloning

1. Clone and enter the repository:

```bash
git clone <your-repo-url>
cd fe-trading-app-assessment
```

2. Install dependencies:

```bash
npm install
```

3. Create your local environment file:

```bash
cp .env.example .env
```

4. Confirm API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

5. Start the frontend:

```bash
npm run dev
```

6. Open the app:

- `http://localhost:5173`

## Available scripts

- `npm run dev` – Start Vite dev server
- `npm run build` – Type-check and production build
- `npm run preview` – Preview production build locally
- `npm run lint` – Run ESLint

## Backend integration notes

- The frontend expects raw JSON responses:
  - `GET /trades` → `Trade[]`
  - `GET /trades/:id` → `Trade`
  - `POST /trades` → `Trade`
  - `PATCH /trades/:id` → `Trade`
  - `PATCH /trades/:id/cancel` → `Trade`
- API errors are expected as:

```ts
type ApiError = {
  message: string
  code?: string
  details?: unknown
}
```

## Troubleshooting

- If trades do not load, verify the backend repo is cloned and running on `http://localhost:3001` (see note at the top of this README).
- If requests fail in browser, check backend CORS allows `http://localhost:5173`.
- If environment changes are not picked up, restart `npm run dev`.
