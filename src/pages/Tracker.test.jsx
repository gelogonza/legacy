import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Tracker from "./Tracker";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockScholarships = [
  {
    name: "Gates Scholarship",
    amount: "$10,000",
    deadline: "2099-12-31",
    eligibility: "First-gen students",
    url: "https://example.com",
    match_reason: "GPA match",
  },
  {
    name: "Pell Grant Supplement",
    amount: "$5,000",
    deadline: "rolling",
    eligibility: "Low-income",
    url: "https://example.com/pell",
    match_reason: "Income match",
  },
];

function renderTracker() {
  return render(
    <MemoryRouter>
      <Tracker />
    </MemoryRouter>
  );
}

describe("Tracker page", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  // ── Empty state ─────────────────────────────────────────────────────────
  it("shows empty state when no scholarships saved", () => {
    renderTracker();
    expect(screen.getByText("No scholarships saved yet.")).toBeInTheDocument();
  });

  it("shows link to Scholarship Matcher in empty state", () => {
    renderTracker();
    expect(screen.getByText("Go to Scholarship Matcher")).toBeInTheDocument();
  });

  it("empty state button navigates to /scholarships", () => {
    renderTracker();
    fireEvent.click(screen.getByText("Go to Scholarship Matcher"));
    expect(mockNavigate).toHaveBeenCalledWith("/scholarships");
  });

  // ── With saved scholarships ─────────────────────────────────────────────
  it("renders saved scholarships", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify(mockScholarships));
    renderTracker();
    expect(screen.getByText("Gates Scholarship")).toBeInTheDocument();
    expect(screen.getByText("Pell Grant Supplement")).toBeInTheDocument();
  });

  it("shows status toggle for each scholarship", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify(mockScholarships));
    renderTracker();
    const buttons = screen.getAllByText("Not started");
    expect(buttons).toHaveLength(2);
  });

  // ── Status cycling ──────────────────────────────────────────────────────
  it("cycles status: Not started → In progress → Submitted → Not started", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify([mockScholarships[0]]));
    renderTracker();

    const statusBtn = screen.getByText("Not started");
    fireEvent.click(statusBtn);
    expect(screen.getByText("In progress")).toBeInTheDocument();

    fireEvent.click(screen.getByText("In progress"));
    expect(screen.getByText("Submitted")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Submitted"));
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("persists status changes to localStorage", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify([mockScholarships[0]]));
    renderTracker();

    fireEvent.click(screen.getByText("Not started"));

    const statuses = JSON.parse(localStorage.getItem("legacy_scholarship_status"));
    expect(statuses["Gates Scholarship"]).toBe("In progress");
  });

  // ── Remove ──────────────────────────────────────────────────────────────
  it("removes a scholarship when Remove is clicked", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify(mockScholarships));
    renderTracker();

    expect(screen.getByText("Gates Scholarship")).toBeInTheDocument();
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText("Gates Scholarship")).not.toBeInTheDocument();
    expect(screen.getByText("Pell Grant Supplement")).toBeInTheDocument();
  });

  it("persists removal to localStorage", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify(mockScholarships));
    renderTracker();

    fireEvent.click(screen.getAllByText("Remove")[0]);

    const saved = JSON.parse(localStorage.getItem("legacy_saved_scholarships"));
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Pell Grant Supplement");
  });

  it("shows empty state after removing all scholarships", () => {
    localStorage.setItem("legacy_saved_scholarships", JSON.stringify([mockScholarships[0]]));
    renderTracker();

    fireEvent.click(screen.getByText("Remove"));
    expect(screen.getByText("No scholarships saved yet.")).toBeInTheDocument();
  });

  // ── Navigation ──────────────────────────────────────────────────────────
  it("back button navigates to /", () => {
    renderTracker();
    const backBtn = screen.getByText(/Dashboard/);
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
