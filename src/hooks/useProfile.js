import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
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
  }, []);

  const updateProfile = async (fields) => {
    const merged = { ...profile, ...fields };
    setProfile(merged); // optimistic update

    const { data: { user } } = await supabase.auth.getUser();
    console.log("[useProfile] updateProfile user:", user?.id);
    if (!user) {
      console.error("[useProfile] updateProfile called with no auth user — aborting");
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
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
      { onConflict: "user_id" }
    );
    if (error) console.error("updateProfile error:", error.message);
  };

  const clearProfile = async () => {
    setProfile(EMPTY_PROFILE);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", user.id);
    if (error) console.error("clearProfile error:", error.message);
  };

  const isProfileComplete = !!(
    profile.name && profile.profileType && profile.grade && profile.state
  );

  return { profile, updateProfile, clearProfile, isProfileComplete, loading };
}
