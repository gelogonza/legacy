import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
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
    localStorage.clear();
    mockNavigate.mockClear();
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
    const gradeSelect = screen.getAllByRole("combobox")[0]; // first select is grade
    expect(gradeSelect).toBeInTheDocument();
    // Check that high school grades are options
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
    // Select state but no grade
    const selects = screen.getAllByRole("combobox");
    const stateSelect = selects[1]; // second combobox is state
    fireEvent.change(stateSelect, { target: { value: "Texas" } });

    expect(screen.getByText("Save & continue →")).toBeDisabled();
  });

  it("Save button is enabled when all required fields filled", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));

    fireEvent.change(screen.getByPlaceholderText("Your first name"), { target: { value: "Alex" } });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "11th" } });  // grade
    fireEvent.change(selects[1], { target: { value: "Texas" } }); // state

    expect(screen.getByText("Save & continue →")).not.toBeDisabled();
  });

  // ── Save flow ───────────────────────────────────────────────────────────
  it("saves profile to localStorage and navigates to / on save", () => {
    renderProfile();
    fireEvent.click(screen.getByText("High school student"));

    fireEvent.change(screen.getByPlaceholderText("Your first name"), { target: { value: "Maria" } });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "11th" } });
    fireEvent.change(selects[1], { target: { value: "Texas" } });

    fireEvent.click(screen.getByText("Save & continue →"));

    // Check localStorage was written
    const stored = JSON.parse(localStorage.getItem("legacy_profile"));
    expect(stored.name).toBe("Maria");
    expect(stored.profileType).toBe("highschool");
    expect(stored.grade).toBe("11th");
    expect(stored.state).toBe("Texas");

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith("/");
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
    const existing = {
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
    localStorage.setItem("legacy_profile", JSON.stringify(existing));

    renderProfile();

    // Type should be pre-selected, form should be visible
    expect(screen.getByPlaceholderText("Your first name")).toHaveValue("Jordan");
    expect(screen.getByPlaceholderText("e.g. 3.4")).toHaveValue("3.6");
    expect(screen.getByPlaceholderText("e.g. Nursing, Computer Science")).toHaveValue("Biology");
  });
});
