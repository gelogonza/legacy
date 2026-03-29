import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Landing from "./Landing";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock useAuth — default: logged-in user
let mockUser = { id: "test-user-id", email: "test@test.com" };
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    authLoading: false,
    signOut: vi.fn(),
  }),
}));

// Mock useProfile — reads from localStorage synchronously
vi.mock("../hooks/useProfile", async () => {
  const actual = await vi.importActual("../hooks/useProfile");
  return {
    ...actual,
    useProfile: () => {
      let profile = actual.EMPTY_PROFILE;
      try {
        const saved = localStorage.getItem("legacy_profile");
        if (saved) profile = JSON.parse(saved);
      } catch {}
      const isProfileComplete = !!(
        profile.profileType && profile.name && profile.grade && profile.state
      );
      return {
        profile,
        updateProfile: vi.fn(),
        clearProfile: vi.fn(),
        isProfileComplete,
        loading: false,
      };
    },
  };
});

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
}

const completeProfile = {
  profileType: "highschool",
  name: "Maria",
  grade: "11th",
  state: "Texas",
  gpa: "3.4",
  majorInterest: "Nursing",
  firstGen: true,
  householdIncome: "under25k",
  notes: "",
};

describe("Landing page", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockUser = { id: "test-user-id", email: "test@test.com" };
  });

  // ── Default state (logged in, no profile) ──────────────────────────────
  it("shows 'Create your Legacy' when no profile", () => {
    renderLanding();
    const headline = screen.getByRole("heading", { level: 1 });
    expect(headline.textContent).toMatch(/Create your\s+Legacy/);
  });

  it("shows default subtext when no profile", () => {
    renderLanding();
    expect(screen.getAllByText(/college counselor every first-gen student deserves/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Set up profile' nav link when no profile", () => {
    renderLanding();
    expect(screen.getByText("Set up profile")).toBeInTheDocument();
  });

  it("shows 'Set up my profile' as secondary CTA when no profile", () => {
    renderLanding();
    expect(screen.getByText(/Set up my profile/)).toBeInTheDocument();
  });

  it("'Set up my profile' navigates to /profile", () => {
    renderLanding();
    fireEvent.click(screen.getByText(/Set up my profile/));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("does not show personalized banner when no profile", () => {
    renderLanding();
    expect(screen.queryByText(/High school/)).not.toBeInTheDocument();
  });

  // ── With complete profile ───────────────────────────────────────────────
  it("shows 'Welcome back, Maria.' when profile is complete", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    expect(screen.getByText(/Welcome back, Maria/)).toBeInTheDocument();
  });

  it("shows 'Pick up where you left off.' subtext", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    expect(screen.getByText("Pick up where you left off.")).toBeInTheDocument();
  });

  it("shows personalized banner with profile info", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    const banner = screen.getByText(/Texas/);
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain("3.4");
  });

  it("shows avatar with first initial when profile is complete", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    expect(screen.getByTitle("Maria")).toBeInTheDocument();
    expect(screen.getByTitle("Maria").textContent).toBe("M");
  });

  it("avatar menu navigates to /profile on click", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    fireEvent.click(screen.getByTitle("Maria"));
    fireEvent.click(screen.getAllByText("My Profile")[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  // ── CTA routing by profile type ─────────────────────────────────────────
  it("highschool profile shows 'Find my scholarships' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    expect(screen.getAllByText("Find my scholarships →").length).toBeGreaterThanOrEqual(1);
  });

  it("highschool CTA navigates to /scholarships", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    fireEvent.click(screen.getAllByText("Find my scholarships →")[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/scholarships");
  });

  it("college profile shows 'Check my roadmap' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, profileType: "college", grade: "Sophomore" }));
    renderLanding();
    expect(screen.getAllByText(/Check my roadmap/).length).toBeGreaterThanOrEqual(1);
  });

  it("returning profile shows 'Explore FAFSA options' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, profileType: "returning", grade: "Returning Adult" }));
    renderLanding();
    expect(screen.getAllByText(/Explore FAFSA options/).length).toBeGreaterThanOrEqual(1);
  });

  it("military profile shows 'Find my benefits' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, profileType: "military", grade: "Veteran" }));
    renderLanding();
    expect(screen.getAllByText(/Find my benefits/).length).toBeGreaterThanOrEqual(1);
  });

  // ── Feature cards ───────────────────────────────────────────────────────
  it("renders all six feature cards", () => {
    renderLanding();
    expect(screen.getAllByText("Scholarship Matcher").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("FAFSA Guide").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Essay Coach").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("College Roadmap").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Local Opportunities").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Career Advisor").length).toBeGreaterThanOrEqual(1);
  });

  it("feature card navigates to correct route", () => {
    renderLanding();
    fireEvent.click(screen.getAllByText("FAFSA Guide")[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/fafsa");
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  it("renders stats section", () => {
    renderLanding();
    expect(screen.getAllByText("~$100M").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1 in 4").length).toBeGreaterThanOrEqual(1);
  });

  // ── Banner edge cases ──────────────────────────────────────────────────
  it("banner shows major when provided", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    const banner = screen.getByText(/Nursing/);
    expect(banner).toBeInTheDocument();
  });

  it("banner omits GPA when not provided", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, gpa: "" }));
    renderLanding();
    const banner = screen.getByText(/Texas/);
    expect(banner.textContent).not.toContain("GPA");
  });

  // ── Logged-out state ───────────────────────────────────────────────────
  it("shows 'Sign in' nav link when not logged in", () => {
    mockUser = null;
    renderLanding();
    expect(screen.getAllByText("Sign in →").length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Get started free' CTA when not logged in", () => {
    mockUser = null;
    renderLanding();
    expect(screen.getAllByText(/Get started free/).length).toBeGreaterThanOrEqual(1);
  });
});
