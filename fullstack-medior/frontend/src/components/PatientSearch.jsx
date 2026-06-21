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
import { useState, useEffect, useRef } from "react";

const DEBOUNCE_MS = 300;

export default function PatientSearch() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  async function fetchPatients(searchQuery) {
    // Cancel any in-flight request so stale results don't overwrite newer ones
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/patients?q=${encodeURIComponent(searchQuery)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();
      setPatients(data);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError("Something went wrong. Please try again.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search patient"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem 0.75rem",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "6px",
          boxSizing: "border-box",
        }}
      />

      {loading && (
        <p style={{ color: "#888", marginTop: "1rem" }}>Loading...</p>
      )}

      {error && (
        <p role="alert" style={{ color: "#c0392b", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem" }}>
          {patients.map((patient) => (
            <li
              key={patient.id}
              style={{
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{patient.name}</strong>
              <br />
              <span style={{ color: "#666", fontSize: "0.9rem" }}>
                {patient.email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
