# Backend — Clinic Appointments (Django + DRF)

Starter project for the technical assessment. The `Patient` and `Appointment`
models, migrations, admin, a seed command, and stubbed API views are already in
place. The feature work lives in clearly-marked `TODO` blocks.

## Requirements

- Python 3.10+
- PostgreSQL (via Docker, or your own). SQLite fallback available — see below.

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Database

**Option A — Postgres (matches the assignment stack):**

```bash
docker compose up -d        # starts Postgres on :5432
python manage.py migrate
python manage.py seed       # synthetic demo data
```

**Option B — SQLite (no Docker):** set `USE_SQLITE=1` in `.env`, then
`migrate` + `seed` as above.

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
