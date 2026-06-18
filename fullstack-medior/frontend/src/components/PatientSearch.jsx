/*
 * TASK 4 — Patient Search Component
 *
 * Build a component that:
 *   - displays a search input
 *   - calls GET /api/patients?q=<input> while typing
 *   - shows a loading state
 *   - renders the results (name + email)
 *   - handles API errors gracefully
 *
 * The endpoint returns: [{ id, name, email }, ...]
 * You may use fetch or axios. This stub is intentionally minimal — replace it.
 */
import { useState } from "react";

export default function PatientSearch() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Search patient"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {/* TODO (Task 4): loading state, results list, error handling */}
    </div>
  );
}
