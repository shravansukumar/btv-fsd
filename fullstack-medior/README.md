# Medior Full-Stack Assessment — Starter Repo

This repo is the "existing application" referenced in
[`ASSIGNMENT-DESCRIPTION.md`](./ASSIGNMENT-DESCRIPTION.md). Your job is to extend
and maintain it — most tasks are small changes to code that already runs.

```
backend/    Django + DRF + Postgres. Models, migrations, admin, seed, and
            stubbed API views are in place. Feature work is marked with TODO.
frontend/   React + Vite. Vitest + React Testing Library configured.
```

## Quick start (Docker — recommended)

One command runs the whole stack (Postgres + Django + React). The database is
migrated and seeded automatically on first start.

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/patients · Admin: http://localhost:8000/admin

Source is bind-mounted, so editing files on the host hot-reloads inside the
containers. Stop with `Ctrl-C`; reset everything (including the DB) with
`docker compose down -v`.

## Quick start (without Docker)

Run the apps on your host. The simplest database option is SQLite (no services
to start); see `backend/README.md` for using Postgres instead.

```bash
# Backend — uses SQLite, so no database service is needed
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then set USE_SQLITE=1 in .env
python manage.py migrate && python manage.py seed
python manage.py runserver    # http://127.0.0.1:8000

# Frontend (new terminal)
cd frontend
npm install && npm run dev    # http://localhost:5173
```

Backend: http://127.0.0.1:8000 · Frontend: http://localhost:5173

## Submitting

Per the assignment: source code, run instructions, assumptions, brief design
notes, and the requested tests. Where a task is a written answer (Tasks 3, 5, 6,
9, 10, 11), add a `SOLUTION.md` (or inline comments) with your reasoning.

Search the codebase for `TODO` to find each implementation task; the per-task
file map is in `backend/README.md` and `frontend/README.md`.
