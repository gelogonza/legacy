import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Landing from "./Landing";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// useProfile is now async (Supabase). Mock it to read from localStorage
// synchronously so existing tests keep working without changes.
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
  });

  // ── Default state (no profile) ──────────────────────────────────────────
  it("shows 'Create your Legacy' when no profile", () => {
    renderLanding();
    expect(screen.getByText(/Create your/)).toBeInTheDocument();
    expect(screen.getAllByText("Legacy").length).toBeGreaterThanOrEqual(1);
  });

  it("shows default subtext when no profile", () => {
    renderLanding();
    expect(screen.getByText(/AI-powered college guide/)).toBeInTheDocument();
  });

  it("shows 'Get started' nav link when no profile", () => {
    renderLanding();
    expect(screen.getByText(/Get started/)).toBeInTheDocument();
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
    // Should contain state and GPA
    const banner = screen.getByText(/Texas/);
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain("3.4");
  });

  it("shows avatar with first initial when profile is complete", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    expect(screen.getByText("M")).toBeInTheDocument(); // Maria's initial
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });

  it("avatar navigates to /profile on click", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    fireEvent.click(screen.getByText("Maria"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  // ── CTA routing by profile type ─────────────────────────────────────────
  it("highschool profile shows 'Find my scholarships' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    expect(screen.getByText("Find my scholarships →")).toBeInTheDocument();
  });

  it("highschool CTA navigates to /scholarships", () => {
    localStorage.setItem("legacy_profile", JSON.stringify(completeProfile));
    renderLanding();
    fireEvent.click(screen.getByText("Find my scholarships →"));
    expect(mockNavigate).toHaveBeenCalledWith("/scholarships");
  });

  it("college profile shows 'Check my roadmap' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, profileType: "college", grade: "Sophomore" }));
    renderLanding();
    expect(screen.getByText(/Check my roadmap/)).toBeInTheDocument();
  });

  it("returning profile shows 'Explore FAFSA options' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, profileType: "returning", grade: "Returning Adult" }));
    renderLanding();
    expect(screen.getByText(/Explore FAFSA options/)).toBeInTheDocument();
  });

  it("military profile shows 'Find my benefits' CTA", () => {
    localStorage.setItem("legacy_profile", JSON.stringify({ ...completeProfile, profileType: "military", grade: "Veteran" }));
    renderLanding();
    expect(screen.getByText(/Find my benefits/)).toBeInTheDocument();
  });

  // ── Feature cards ───────────────────────────────────────────────────────
  it("renders all four feature cards", () => {
    renderLanding();
    expect(screen.getByText("Scholarship matcher")).toBeInTheDocument();
    expect(screen.getByText("FAFSA guide")).toBeInTheDocument();
    expect(screen.getByText("Essay coach")).toBeInTheDocument();
    expect(screen.getByText("College roadmap")).toBeInTheDocument();
  });

  it("feature card navigates to correct route", () => {
    renderLanding();
    fireEvent.click(screen.getByText("FAFSA guide"));
    expect(mockNavigate).toHaveBeenCalledWith("/fafsa");
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  it("renders stats section", () => {
    renderLanding();
    expect(screen.getByText("$7B+")).toBeInTheDocument();
    expect(screen.getByText("1 in 4")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
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
});
