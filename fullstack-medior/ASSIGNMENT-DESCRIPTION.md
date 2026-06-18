# Medior Full-Stack Developer Technical Assessment

## Overview

This assessment is designed to evaluate your ability to maintain and extend an existing full-stack application.

A working starter repository is provided (see `README.md`). The Django project, database models, migrations, seed data, and a React app with a configured test runner are already in place and run as-is. Your job is to implement the tasks below within it — search the codebase for `TODO` to find each one.

### Getting Started

**Fork this repository and do all of your work in your fork.** Commit regularly with clear messages — we review your commit history alongside the final result, so we can see how you worked, not just where you ended up. When you are done, share the link to your forked repository (make sure we have access) as your submission.

### Use of AI

You are welcome — and encouraged — to use AI tools and coding agents (Claude Code, Copilot, ChatGPT, etc.) however you normally would. We are not testing whether you can write boilerplate from memory; we are testing your judgment in directing these tools and reviewing what they produce. Because of that, please include with your submission the key prompts you used and a short note on where the agent got something wrong and how you caught and corrected it. An honest "the agent produced X, which was wrong because Y, so I changed it to Z" is exactly the signal we value most — far more than a polished result with no explanation. You remain fully responsible for every line you submit, so make sure you understand it and can defend it in a follow-up conversation.

### Stack

**Backend**

- Python
- Django
- Django REST Framework
- PostgreSQL

**Frontend**

- React

### Expected Duration

3–4 hours

### Submission Requirements

Please provide:

- A link to your forked repository containing all your work
- Any assumptions made
- Brief explanation of design decisions
- Tests where requested
- For the written-answer tasks, your reasoning (inline or in a `SOLUTION.md`)

### A Note on This Assignment (V1)

This is the first version of this assessment, and we are still refining it. If you run into anything that looks like a setup problem, a broken or unclear instruction, a typo, or an unintentional bug in the tooling, please let us know — flagging it genuinely helps us improve the assignment and will never count against you.

One caveat: some code in the starter repo is *intentionally* imperfect because reviewing and critiquing it is part of a task (for example, the endpoint in Task 9). You don't need to report those — that's the exercise.

---

# Business Context

You are joining a SaaS platform that helps clinics manage patient appointments.

The system already exists and requires maintenance and new feature development.

You have been asked to implement a small feature across both backend and frontend.

---

# Part 1 – Backend (Django)

## Existing Models

The `Patient` and `Appointment` models already exist in the starter repo
(`backend/appointments/models.py`), with migrations and seed data. You do not
need to create or modify them.

---

## Task 1 – Search Endpoint

The endpoint is already routed and returns all patients. Implement the search
behaviour in `backend/appointments/views.py` (marked `TODO`):

```http
GET /api/patients
```

### Requirements

Support searching by:

- Patient name (partial match)
- Patient email (partial match)

Optional query parameter:

```http
?q=john
```

### Example

```http
GET /api/patients?q=john
```

### Expected Response

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

---

## Task 2 – Appointment Validation

Prevent creating appointments in the past.

### Valid Request

```json
{
  "patient": 1,
  "scheduled_at": "2027-01-01T10:00:00Z"
}
```

### Invalid Request

```json
{
  "patient": 1,
  "scheduled_at": "2025-01-01T10:00:00Z"
}
```

### Requirements

- Validation should occur at the API layer.
- Return meaningful validation errors.
- Follow Django REST Framework best practices.

---

## Task 3 – API Performance Review

Review the following code:

```python
appointments = Appointment.objects.all()

data = []

for appointment in appointments:
    data.append({
        "patient_name": appointment.patient.name,
        "scheduled_at": appointment.scheduled_at,
    })
```

### Questions

1. What performance issue exists?
2. Why does it occur?
3. How would you improve it?
4. Show the improved implementation.

---

# Part 2 – Frontend (React)

The frontend calls the backend endpoint (the Vite dev server proxies `/api`):

```http
GET /api/patients?q=
```

If you complete Task 1, this returns live data; otherwise mock it.

---

## Task 4 – Patient Search Component

Implement the component stubbed at `frontend/src/components/PatientSearch.jsx`. It should:

- Display a search input
- Call the API while typing
- Show a loading state
- Display results
- Handle API errors gracefully

### Example UI

```text
[ Search patient ]

Loading...

John Doe
john@example.com

Jane Doe
jane@example.com
```

### Notes

You may use:

- Fetch API
- Axios

Either approach is acceptable.

---

## Task 5 – Bug Fix

Review the following code:

```jsx
function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, [patients]);

  async function fetchPatients() {
    const response = await fetch("/api/patients");
    const data = await response.json();
    setPatients(data);
  }

  return (
    <div>
      {patients.map(patient => (
        <div>{patient.name}</div>
      ))}
    </div>
  );
}
```

### Questions

1. What bug exists?
2. Why does it happen?
3. How would you fix it?
4. Are there any additional improvements you would make?

---

## Task 6 – State Management Discussion

This is a hypothetical design question — none of the state below exists in the
starter repo yet. Imagine the frontend grows to manage:

- Logged-in user information
- Feature flags
- Current clinic selection
- Appointment filters

### Question

Which state management approach would you choose and why?

Options:

- React Context
- Redux
- Zustand
- Local component state

Explain your reasoning and trade-offs.

---

# Part 3 – Testing

## Task 7 – Backend Test

Write a test verifying:

> Appointments cannot be created in the past.

Use either:

- Django TestCase
- pytest

Both are acceptable.

---

## Task 8 – Frontend Test

Write a test for the Patient Search component that verifies:

- The API is called
- Results are rendered correctly

Use:

- React Testing Library

---

# Part 4 – Architecture & Maintenance

## Task 9 – API Design Review

While working in the codebase you find this endpoint (implemented in
`backend/appointments/views.py` as `update_status`, routed at
`backend/appointments/urls.py`):

```http
POST /api/appointments/update-status
```

Request body:

```json
{
  "appointment_id": 123,
  "status": "completed"
}
```

It works for the happy path, but it was written quickly. Review the actual
implementation in the repo.

### Questions

1. Is this endpoint RESTful?
2. What concerns do you have with the design **and the implementation**? Consider
   what happens with malformed input, unknown IDs, and invalid status values.
3. How would you redesign it?
4. Which HTTP method(s) would you use?

---

## Task 10 – Production Maintenance Scenario

A production issue is reported:

> The patient list page loads slowly when there are 50,000 patients.

Describe:

### Investigation

- How would you diagnose the problem?
- What metrics would you inspect?

### Backend Optimizations

Examples may include:

- Pagination
- Query optimization
- Database indexing
- Caching

### Frontend Optimizations

Examples may include:

- Pagination
- Infinite scrolling
- Virtualized rendering
- Request optimization

### Monitoring

Which tools or techniques would you use to monitor and troubleshoot the issue?

---

# Bonus (Optional)

## Task 11 – Refactoring

Review the following function:

```python
def create_appointment(patient, scheduled_at):
    if patient:
        if scheduled_at:
            if scheduled_at > timezone.now():
                appointment = Appointment.objects.create(
                    patient=patient,
                    scheduled_at=scheduled_at,
                    status="scheduled"
                )
                return appointment
```

### Refactor Goals

Improve:

- Readability
- Maintainability
- Error handling
- Validation

Explain any decisions you make.

---

# Part 5 – Security

## Task 12 – Authentication & Authorization Scope

The API currently has no authentication — every endpoint is public. Suppose you
were asked to add an authentication and authorization system.

The endpoints that exist today are:

- `GET /api/patients` — search/list patients
- `GET /api/appointments` — list appointments
- `POST /api/appointments` — create an appointment
- `POST /api/appointments/update-status` — change an appointment's status

### Questions

1. Which of these endpoints should require authentication, and which (if any)
   should stay public? Explain your reasoning.
2. Beyond authentication (*who* you are), what authorization rules (*what you
   are allowed to do*) would each endpoint need — for example, in a multi-clinic
   setup where a user should only see their own clinic's data?
3. What clarifying questions would you ask the product owner before implementing
   this?

---

# What We Are Looking For

A successful candidate will demonstrate:

- Clean, readable code
- Good understanding of Django and Django REST Framework
- React fundamentals and hooks knowledge
- REST API design principles
- Debugging and maintenance skills
- Awareness of performance considerations
- Ability to write tests
- Ability to explain technical decisions and trade-offs

We are interested in how you think and communicate, not only whether the solution works.