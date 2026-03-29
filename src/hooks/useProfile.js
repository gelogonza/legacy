import { useState, useEffect } from "react";

export const EMPTY_PROFILE = {
  profileType: "",   // "highschool" | "college" | "returning" | "military"
  name: "",
  grade: "",         // "9th" | "10th" | "11th" | "12th" | "College"
  gpa: "",
  state: "",
  majorInterest: "",
  firstGen: true,
  householdIncome: "", // "under25k" | "25-50k" | "50-75k" | "75k+"
  notes: "",           // free text: extracurriculars, background, identity
};

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("legacy_profile");
      return saved ? JSON.parse(saved) : EMPTY_PROFILE;
    } catch {
      return EMPTY_PROFILE;
    }
  });

  useEffect(() => {
    localStorage.setItem("legacy_profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (fields) =>
    setProfile((prev) => {
      const next = { ...prev, ...fields };
      localStorage.setItem("legacy_profile", JSON.stringify(next));
      return next;
    });

  const clearProfile = () => {
    localStorage.setItem("legacy_profile", JSON.stringify(EMPTY_PROFILE));
    setProfile(EMPTY_PROFILE);
  };

  const isProfileComplete = !!(
    profile.profileType && profile.name && profile.grade && profile.state
  );

  return { profile, updateProfile, clearProfile, isProfileComplete };
}
