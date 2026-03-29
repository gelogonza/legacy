import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Tracker from "./Tracker";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Supabase mock ────────────────────────────────────────────────────────────
let mockSavedData = [];
const mockOrder = vi.fn(function () { return Promise.resolve({ data: mockSavedData, error: null }); });
const mockSelectEq = vi.fn(function () { return { order: mockOrder }; });
const mockSelect = vi.fn(function () { return { eq: mockSelectEq }; });
const mockDeleteEq = vi.fn(function () { return Promise.resolve({ error: null }); });
const mockDeleteFn = vi.fn(function () { return { eq: mockDeleteEq }; });
const mockUpdateEq = vi.fn(function () { return Promise.resolve({ error: null }); });
const mockUpdate = vi.fn(function () { return { eq: mockUpdateEq }; });

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
    from: vi.fn(() => ({
      select: mockSelect,
      delete: mockDeleteFn,
      update: mockUpdate,
    })),
  },
}));

const mockScholarships = [
  {
    id: "uuid-1",
    name: "Gates Scholarship",
    amount: "$10,000",
    deadline: "2099-12-31",
    eligibility: "First-gen students",
    url: "https://example.com",
    match_reason: "GPA match",
    status: "Not started",
  },
  {
    id: "uuid-2",
    name: "Pell Grant Supplement",
    amount: "$5,000",
    deadline: "rolling",
    eligibility: "Low-income",
    url: "https://example.com/pell",
    match_reason: "Income match",
    status: "Not started",
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
    mockNavigate.mockClear();
    vi.clearAllMocks();
    mockSavedData = [];
    mockOrder.mockImplementation(() => Promise.resolve({ data: mockSavedData, error: null }));
    mockSelectEq.mockImplementation(() => ({ order: mockOrder }));
    mockSelect.mockImplementation(() => ({ eq: mockSelectEq }));
    mockDeleteEq.mockImplementation(() => Promise.resolve({ error: null }));
    mockDeleteFn.mockImplementation(() => ({ eq: mockDeleteEq }));
    mockUpdateEq.mockImplementation(() => Promise.resolve({ error: null }));
    mockUpdate.mockImplementation(() => ({ eq: mockUpdateEq }));
  });

  // ── Empty state ─────────────────────────────────────────────────────────
  it("shows empty state when no scholarships saved", async () => {
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("No scholarships saved yet.")).toBeInTheDocument();
    });
  });

  it("shows link to Scholarship Matcher in empty state", async () => {
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Go to Scholarship Matcher")).toBeInTheDocument();
    });
  });

  it("empty state button navigates to /scholarships", async () => {
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Go to Scholarship Matcher")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Go to Scholarship Matcher"));
    expect(mockNavigate).toHaveBeenCalledWith("/scholarships");
  });

  // ── With saved scholarships ─────────────────────────────────────────────
  it("renders saved scholarships", async () => {
    mockSavedData = [...mockScholarships];
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Gates Scholarship")).toBeInTheDocument();
    });
    expect(screen.getByText("Pell Grant Supplement")).toBeInTheDocument();
  });

  it("shows status toggle for each scholarship", async () => {
    mockSavedData = [...mockScholarships];
    renderTracker();
    await waitFor(() => {
      const buttons = screen.getAllByText("Not started");
      expect(buttons).toHaveLength(2);
    });
  });

  // ── Status cycling ──────────────────────────────────────────────────────
  it("cycles status: Not started → In progress → Submitted → Not started", async () => {
    mockSavedData = [{ ...mockScholarships[0] }];
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Not started")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Not started"));
    expect(screen.getByText("In progress")).toBeInTheDocument();

    fireEvent.click(screen.getByText("In progress"));
    expect(screen.getByText("Submitted")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Submitted"));
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("calls Supabase update on status change", async () => {
    mockSavedData = [{ ...mockScholarships[0] }];
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Not started")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Not started"));
    expect(mockUpdate).toHaveBeenCalledWith({ status: "In progress" });
  });

  // ── Remove ──────────────────────────────────────────────────────────────
  it("removes a scholarship when Remove is clicked", async () => {
    mockSavedData = [...mockScholarships];
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Gates Scholarship")).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText("Gates Scholarship")).not.toBeInTheDocument();
    expect(screen.getByText("Pell Grant Supplement")).toBeInTheDocument();
  });

  it("calls Supabase delete on removal", async () => {
    mockSavedData = [...mockScholarships];
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Gates Scholarship")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Remove")[0]);
    expect(mockDeleteFn).toHaveBeenCalled();
  });

  it("shows empty state after removing all scholarships", async () => {
    mockSavedData = [{ ...mockScholarships[0] }];
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText("Gates Scholarship")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Remove"));
    expect(screen.getByText("No scholarships saved yet.")).toBeInTheDocument();
  });

  // ── Navigation ──────────────────────────────────────────────────────────
  it("back button navigates to /", async () => {
    renderTracker();
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Dashboard/));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
