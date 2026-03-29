import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getSessionId } from "../lib/session";

export const EMPTY_PROFILE = {
  profileType: "",
  name: "",
  grade: "",
  gpa: "",
  state: "",
  majorInterest: "",
  firstGen: true,
  householdIncome: "",
  notes: "",
};

export function useProfile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      // PGRST116 = no rows found — not a real error, just a new user
      if (data && !error) {
        setProfile({
          name: data.name || "",
          profileType: data.profile_type || "",
          grade: data.grade || "",
          gpa: data.gpa || "",
          state: data.state || "",
          majorInterest: data.major_interest || "",
          firstGen: data.first_gen ?? true,
          householdIncome: data.household_income || "",
          notes: data.notes || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const updateProfile = async (fields) => {
    const merged = { ...profile, ...fields };
    setProfile(merged); // optimistic update
    const { error } = await supabase.from("profiles").upsert(
      {
        session_id: sessionId,
        name: merged.name,
        profile_type: merged.profileType,
        grade: merged.grade,
        gpa: merged.gpa,
        state: merged.state,
        major_interest: merged.majorInterest,
        first_gen: merged.firstGen,
        household_income: merged.householdIncome,
        notes: merged.notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );
    if (error) console.error("useProfile updateProfile error:", error.message);
  };

  const clearProfile = async () => {
    setProfile(EMPTY_PROFILE);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("session_id", sessionId);
    if (error) console.error("useProfile clearProfile error:", error.message);
  };

  const isProfileComplete = !!(
    profile.name && profile.profileType && profile.grade && profile.state
  );

  return { profile, updateProfile, clearProfile, isProfileComplete, loading };
}
