import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock useProfile with a controllable store
let profileStore = {};
const mockUpdateProfile = vi.fn((fields) => {
  profileStore = { ...profileStore, ...fields };
  return Promise.resolve();
});

vi.mock("../hooks/useProfile", async () => {
  const actual = await vi.importActual("../hooks/useProfile");
  return {
    ...actual,
    useProfile: () => {
      const profile = { ...actual.EMPTY_PROFILE, ...profileStore };
      const isProfileComplete = !!(
        profile.profileType && profile.name && profile.grade && profile.state
      );
      return {
        profile,
        updateProfile: mockUpdateProfile,
        clearProfile: vi.fn(),
        isProfileComplete,
        loading: false,
      };
    },
  };
});

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

describe("Profile page", () => {
  beforeEach(() => {
    profileStore = {};
    mockNavigate.mockClear();
    mockUpdateProfile.mockClear();
    mockUpdateProfile.mockImplementation((fields) => {
      profileStore = { ...profileStore, ...fields };
      return Promise.resolve();
    });
  });

  // ── Initial render ──────────────────────────────────────────────────────
  it("shows 'Who are you?' heading", () => {
    renderProfile();
    expect(screen.getByText("Who are you?")).toBeInTheDocument();
  });

  it("shows all four profile type tiles", () => {
    renderProfile();
    expect(screen.getByText("High school student")).toBeInTheDocument();
    expect(screen.getByText("College student")).toBeInTheDocument();
    expect(screen.getByText("Returning adult")).toBeInTheDocument();
    expect(screen.getByText("Military")).toBeInTheDocument();
  });

  it("does not show form fields before selecting a profile type", () => {
    renderProfile();
    expect(screen.queryByPlaceholderText("Your first name")).not.toBeInTheDocument();
  });

  // ── Profile type selection ──────────────────────────────────────────────
  it("shows form fields after selecting a profile type", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    expect(screen.getByPlaceholderText("Your first name")).toBeInTheDocument();
  });

  it("shows correct grade options for high school", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    const gradeSelect = screen.getAllByRole("combobox")[0];
    expect(gradeSelect).toBeInTheDocument();
    expect(screen.getByText("9th")).toBeInTheDocument();
    expect(screen.getByText("12th")).toBeInTheDocument();
  });

  it("shows correct grade options for college", () => {
    renderProfile();
    fireEvent.click(screen.getByText("College student"));
    expect(screen.getByText("Freshman")).toBeInTheDocument();
    expect(screen.getByText("Senior")).toBeInTheDocument();
  });

  it("shows correct grade options for military", () => {
    renderProfile();
    fireEvent.click(screen.getByText("Military"));
    expect(screen.getByText("Active Duty")).toBeInTheDocument();
    expect(screen.getByText("Veteran")).toBeInTheDocument();
    expect(screen.getByText("Dependent")).toBeInTheDocument();
  });

  // ── Save button validation ──────────────────────────────────────────────
  it("Save button is disabled when required fields are empty", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    const saveBtn = screen.getByText("Save & continue →");
    expect(saveBtn).toBeDisabled();
  });

  it("Save button is disabled without grade selected", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    fireEvent.change(screen.getByPlaceholderText("Your first name"), { target: { value: "Alex" } });
    const selects = screen.getAllByRole("combobox");
    const stateSelect = selects[1];
    fireEvent.change(stateSelect, { target: { value: "Texas" } });
    expect(screen.getByText("Save & continue →")).toBeDisabled();
  });

  it("Save button is enabled when all required fields filled", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    fireEvent.change(screen.getByPlaceholderText("Your first name"), { target: { value: "Alex" } });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "11th" } });
    fireEvent.change(selects[1], { target: { value: "Texas" } });
    expect(screen.getByText("Save & continue →")).not.toBeDisabled();
  });

  // ── Save flow ───────────────────────────────────────────────────────────
  it("calls updateProfile and navigates to / on save", async () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    fireEvent.change(screen.getByPlaceholderText("Your first name"), { target: { value: "Maria" } });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "11th" } });
    fireEvent.change(selects[1], { target: { value: "Texas" } });

    fireEvent.click(screen.getByText("Save & continue →"));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Maria",
          profileType: "highschool",
          grade: "11th",
          state: "Texas",
        })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  // ── Skip ────────────────────────────────────────────────────────────────
  it("Skip for now navigates to / without saving", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    fireEvent.click(screen.getByText("Skip for now"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // ── First-gen checkbox ──────────────────────────────────────────────────
  it("first-gen checkbox is checked by default", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("first-gen checkbox can be unchecked", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  // ── Edit existing profile ───────────────────────────────────────────────
  it("pre-fills form with existing profile data", () => {
    profileStore = {
      profileType: "college",
      name: "Jordan",
      grade: "Sophomore",
      state: "California",
      gpa: "3.6",
      majorInterest: "Biology",
      householdIncome: "25-50k",
      notes: "Pre-med track",
      firstGen: false,
    };

    renderProfile();

    expect(screen.getByPlaceholderText("Your first name")).toHaveValue("Jordan");
    expect(screen.getByPlaceholderText("e.g. 3.4")).toHaveValue("3.6");
    expect(screen.getByPlaceholderText("e.g. Nursing, Computer Science")).toHaveValue("Biology");
  });
});
