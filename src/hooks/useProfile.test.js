import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useProfile, EMPTY_PROFILE } from "./useProfile";

describe("useProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── EMPTY_PROFILE shape ─────────────────────────────────────────────────
  it("EMPTY_PROFILE includes profileType field", () => {
    expect(EMPTY_PROFILE).toHaveProperty("profileType", "");
  });

  it("EMPTY_PROFILE includes all required fields", () => {
    expect(EMPTY_PROFILE).toHaveProperty("name");
    expect(EMPTY_PROFILE).toHaveProperty("grade");
    expect(EMPTY_PROFILE).toHaveProperty("state");
    expect(EMPTY_PROFILE).toHaveProperty("gpa");
    expect(EMPTY_PROFILE).toHaveProperty("majorInterest");
    expect(EMPTY_PROFILE).toHaveProperty("firstGen", true);
    expect(EMPTY_PROFILE).toHaveProperty("householdIncome");
    expect(EMPTY_PROFILE).toHaveProperty("notes");
  });

  // ── Initialization ──────────────────────────────────────────────────────
  it("initializes with EMPTY_PROFILE when localStorage is empty", () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toEqual(EMPTY_PROFILE);
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("reads existing profile from localStorage on mount", () => {
    const saved = { ...EMPTY_PROFILE, profileType: "highschool", name: "Maria", grade: "11th", state: "Texas" };
    localStorage.setItem("legacy_profile", JSON.stringify(saved));

    const { result } = renderHook(() => useProfile());
    expect(result.current.profile.name).toBe("Maria");
    expect(result.current.profile.profileType).toBe("highschool");
    expect(result.current.isProfileComplete).toBe(true);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("legacy_profile", "NOT_VALID_JSON{{{");

    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toEqual(EMPTY_PROFILE);
  });

  // ── updateProfile ───────────────────────────────────────────────────────
  it("updates profile fields and persists to localStorage synchronously", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.updateProfile({ name: "Alex", profileType: "college" });
    });

    expect(result.current.profile.name).toBe("Alex");
    expect(result.current.profile.profileType).toBe("college");

    // Should be written to localStorage synchronously (not just via useEffect)
    const stored = JSON.parse(localStorage.getItem("legacy_profile"));
    expect(stored.name).toBe("Alex");
    expect(stored.profileType).toBe("college");
  });

  it("merges fields without overwriting existing ones", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.updateProfile({ name: "Alex", state: "NY" });
    });
    act(() => {
      result.current.updateProfile({ gpa: "3.8" });
    });

    expect(result.current.profile.name).toBe("Alex");
    expect(result.current.profile.state).toBe("NY");
    expect(result.current.profile.gpa).toBe("3.8");
  });

  // ── clearProfile ────────────────────────────────────────────────────────
  it("clears profile back to EMPTY_PROFILE", () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.updateProfile({ name: "Alex", profileType: "highschool", grade: "10th", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(true);

    act(() => {
      result.current.clearProfile();
    });
    expect(result.current.profile).toEqual(EMPTY_PROFILE);
    expect(result.current.isProfileComplete).toBe(false);

    const stored = JSON.parse(localStorage.getItem("legacy_profile"));
    expect(stored).toEqual(EMPTY_PROFILE);
  });

  // ── isProfileComplete ───────────────────────────────────────────────────
  it("is false when profileType is missing", () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ name: "Alex", grade: "11th", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is false when name is missing", () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ profileType: "highschool", grade: "11th", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is false when grade is missing", () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ profileType: "highschool", name: "Alex", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is false when state is missing", () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ profileType: "highschool", name: "Alex", grade: "11th" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is true when all four required fields are present", () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({
        profileType: "highschool",
        name: "Alex",
        grade: "11th",
        state: "TX",
      });
    });
    expect(result.current.isProfileComplete).toBe(true);
  });

  // ── Cross-component sync (the bug we fixed) ────────────────────────────
  it("new hook instance reads updated profile from localStorage", () => {
    const { result: writer } = renderHook(() => useProfile());

    act(() => {
      writer.current.updateProfile({
        profileType: "college",
        name: "Jordan",
        grade: "Sophomore",
        state: "California",
        gpa: "3.6",
      });
    });

    // Simulate a new component mounting and reading localStorage
    const { result: reader } = renderHook(() => useProfile());
    expect(reader.current.profile.name).toBe("Jordan");
    expect(reader.current.profile.profileType).toBe("college");
    expect(reader.current.isProfileComplete).toBe(true);
  });
});
