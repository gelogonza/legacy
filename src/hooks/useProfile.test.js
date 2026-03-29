import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProfile, EMPTY_PROFILE } from "./useProfile";

// ── Supabase mock ────────────────────────────────────────────────────────────
const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }));

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
      upsert: mockUpsert,
      delete: mockDelete,
    })),
  },
}));

vi.mock("../lib/session", () => ({
  getSessionId: vi.fn(() => "test-session-id"),
}));

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockDeleteEq.mockResolvedValue({ error: null });
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
  it("initializes with EMPTY_PROFILE when no profile exists", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toEqual(EMPTY_PROFILE);
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("reads existing profile from Supabase on mount", async () => {
    mockSingle.mockResolvedValue({
      data: {
        session_id: "test-session-id",
        name: "Maria",
        profile_type: "highschool",
        grade: "11th",
        state: "Texas",
        gpa: "3.4",
        major_interest: "Nursing",
        first_gen: true,
        household_income: "under25k",
        notes: "",
      },
      error: null,
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile.name).toBe("Maria");
    expect(result.current.profile.profileType).toBe("highschool");
    expect(result.current.isProfileComplete).toBe(true);
  });

  it("handles PGRST116 error (no rows) gracefully", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "no rows" },
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toEqual(EMPTY_PROFILE);
  });

  // ── updateProfile ───────────────────────────────────────────────────────
  it("updateProfile merges fields and calls Supabase upsert", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateProfile({ name: "Alex", profileType: "college" });
    });

    expect(result.current.profile.name).toBe("Alex");
    expect(result.current.profile.profileType).toBe("college");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ session_id: "test-session-id", name: "Alex", profile_type: "college" }),
      { onConflict: "session_id" }
    );
  });

  it("updateProfile does optimistic update before Supabase resolves", async () => {
    // Make upsert hang forever
    mockUpsert.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Don't await — fire and forget
    act(() => {
      result.current.updateProfile({ name: "Alex" });
    });

    // Profile updated immediately even though upsert hasn't resolved
    expect(result.current.profile.name).toBe("Alex");
  });

  it("updateProfile merges without overwriting existing fields", async () => {
    mockSingle.mockResolvedValue({
      data: {
        session_id: "test-session-id",
        name: "Maria",
        profile_type: "highschool",
        grade: "11th",
        state: "Texas",
        gpa: "3.4",
        major_interest: "",
        first_gen: true,
        household_income: "",
        notes: "",
      },
      error: null,
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateProfile({ gpa: "3.8" });
    });

    expect(result.current.profile.name).toBe("Maria");
    expect(result.current.profile.state).toBe("Texas");
    expect(result.current.profile.gpa).toBe("3.8");
  });

  // ── clearProfile ────────────────────────────────────────────────────────
  it("clearProfile resets to EMPTY_PROFILE", async () => {
    mockSingle.mockResolvedValue({
      data: {
        session_id: "test-session-id",
        name: "Alex",
        profile_type: "highschool",
        grade: "10th",
        state: "TX",
        gpa: "",
        major_interest: "",
        first_gen: true,
        household_income: "",
        notes: "",
      },
      error: null,
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isProfileComplete).toBe(true);

    await act(async () => {
      await result.current.clearProfile();
    });

    expect(result.current.profile).toEqual(EMPTY_PROFILE);
    expect(result.current.isProfileComplete).toBe(false);
  });

  // ── isProfileComplete ───────────────────────────────────────────────────
  it("is false when profileType is missing", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateProfile({ name: "Alex", grade: "11th", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is false when name is missing", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateProfile({ profileType: "highschool", grade: "11th", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is false when grade is missing", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateProfile({ profileType: "highschool", name: "Alex", state: "TX" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is false when state is missing", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateProfile({ profileType: "highschool", name: "Alex", grade: "11th" });
    });
    expect(result.current.isProfileComplete).toBe(false);
  });

  it("is true when all four required fields are present", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateProfile({
        profileType: "highschool",
        name: "Alex",
        grade: "11th",
        state: "TX",
      });
    });
    expect(result.current.isProfileComplete).toBe(true);
  });

  // ── loading state ──────────────────────────────────────────────────────
  it("loading starts as true", () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.loading).toBe(true);
  });

  it("loading becomes false after Supabase resolves", async () => {
    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
