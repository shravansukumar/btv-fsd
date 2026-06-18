/*
 * TASK 8 — Frontend test
 *
 * Write a test for the Patient Search component that verifies:
 *   - the API is called
 *   - results are rendered correctly
 *
 * Uses React Testing Library + Vitest. A starting skeleton is below — the
 * `global.fetch` mock shows one way to stub the API. Replace the placeholder
 * assertion with real ones once Task 4 is implemented.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PatientSearch from "./PatientSearch.jsx";

describe("PatientSearch", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, name: "John Doe", email: "john@example.com" },
          ]),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the search input", () => {
    render(<PatientSearch />);
    expect(screen.getByPlaceholderText(/search patient/i)).toBeInTheDocument();
  });

  // TODO (Task 8): type into the input, assert fetch was called with ?q=,
  // and assert the returned patient is rendered.
});
