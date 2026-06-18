# Frontend — Clinic (React + Vite)

Starter React app. Vitest + React Testing Library are configured. The Vite dev
server proxies `/api` to the Django backend on `:8000`, so components can use
relative URLs like `fetch("/api/patients?q=john")` with no CORS setup.

## Requirements

- Node 18+ (Node 20+ recommended)

## Setup & run

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (expects backend on :8000)
```

## Tests

```bash
npm test           # vitest run
npm run test:watch
```

## Where the tasks live

| Task | File |
|------|------|
| 4 — Patient Search component | `src/components/PatientSearch.jsx` |
| 5 — Bug fix | `src/components/PatientList.jsx` (written answer) |
| 6 — State management discussion | written answer (see assignment) |
| 8 — Frontend test | `src/components/PatientSearch.test.jsx` |

`PatientList.jsx` is not wired into the app — it exists only as the subject of
the Task 5 bug-fix question.
