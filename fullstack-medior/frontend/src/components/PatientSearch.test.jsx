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
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("calls the API with the search query", async () => {
    const user = userEvent.setup();
    render(<PatientSearch />);

    await user.type(screen.getByPlaceholderText(/search patient/i), "john");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("q=john"),
        expect.anything()
      );
    });
  });

  it("renders results from the API", async () => {
    const user = userEvent.setup();
    render(<PatientSearch />);

    await user.type(screen.getByPlaceholderText(/search patient/i), "john");

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
  
  it("displays an error message when the API fails", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const user = userEvent.setup();
    render(<PatientSearch />);

    await user.type(screen.getByPlaceholderText(/search patient/i), "fail");

    expect(
      await screen.findByText(/something went wrong/i)
    ).toBeInTheDocument();
  });
});