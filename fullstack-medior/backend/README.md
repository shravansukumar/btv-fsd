# Backend — Clinic Appointments (Django + DRF)

Starter project for the technical assessment. The `Patient` and `Appointment`
models, migrations, admin, a seed command, and stubbed API views are already in
place. The feature work lives in clearly-marked `TODO` blocks.

> Prefer the one-command setup? Run the whole stack with Docker instead — see
> the repo-root `README.md` (`docker compose up --build`). The steps below are
> for running the backend directly on your host.

## Requirements

- Python 3.10+
- A database: SQLite (zero setup) or PostgreSQL — see below.

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Database

**Option A — SQLite (simplest, no services):** set `USE_SQLITE=1` in `.env`,
then:

```bash
python manage.py migrate
python manage.py seed        # synthetic demo data
```

**Option B — Postgres (matches the assignment stack):** start just the database
from the repo root, then point Django at it. The container publishes Postgres on
host port **5433**, so set `USE_SQLITE=0` and `POSTGRES_PORT=5433` in `.env`.

```bash
(cd .. && docker compose up -d db)   # Postgres on 127.0.0.1:5433
python manage.py migrate
python manage.py seed                # synthetic demo data
```

(Using your own local Postgres instead? Set `POSTGRES_*` in `.env` to match it.)

### Run

```bash
python manage.py runserver   # http://127.0.0.1:8000
```

- `GET /api/patients` — list (Task 1 adds `?q=` search)
- `GET/POST /api/appointments` — list/create (Task 2 adds validation)
- `/admin` — create a superuser with `python manage.py createsuperuser`

## Tests

```bash
pytest                       # or: python manage.py test
```

## Where the tasks live

| Task | File |
|------|------|
| 1 — Search endpoint | `appointments/views.py` (`PatientListView`) |
| 2 — Appointment validation | `appointments/serializers.py` (`AppointmentSerializer`) |
| 3 — Performance review | written answer (see assignment) |
| 7 — Backend test | `appointments/tests.py` |
| 11 — Refactor (bonus) | written answer |

## Notes / intentional choices

- No global DRF pagination is configured — Task 10 asks you to reason about
  scaling, so that decision is left to you.
- `APPEND_SLASH = False` so routes match the assignment (`/api/patients`,
  no trailing slash).
- The seed data is **synthetic**. Do not load real patient data into this
  exercise database.
