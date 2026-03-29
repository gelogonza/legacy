import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import SkyBackground from "../components/SkyBackground";
import styles from "./Profile.module.css";

const PROFILE_TYPES = [
  { key: "highschool", icon: "🎒", label: "High school student", sub: "Planning for college" },
  { key: "college",    icon: "🎓", label: "College student",      sub: "Already enrolled" },
  { key: "returning",  icon: "🔄", label: "Returning adult",      sub: "Going back to school" },
  { key: "military",   icon: "🎖️", label: "Military",             sub: "Active, veteran, or dependent" },
];

const GRADE_OPTIONS = {
  highschool: ["9th", "10th", "11th", "12th"],
  college:    ["Freshman", "Sophomore", "Junior", "Senior"],
  returning:  ["Returning Adult"],
  military:   ["Active Duty", "Veteran", "Dependent"],
};

const INCOME_OPTIONS = [
  { value: "under25k",  label: "Under $25k" },
  { value: "25-50k",    label: "$25k–$50k" },
  { value: "50-75k",    label: "$50k–$75k" },
  { value: "75k+",      label: "$75k+" },
  { value: "prefer-not", label: "Prefer not to say" },
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

export default function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile, isProfileComplete } = useProfile();

  const [profileType, setProfileType] = useState(profile.profileType || "");
  const [name, setName] = useState(profile.name || "");
  const [grade, setGrade] = useState(profile.grade || "");
  const [state, setState] = useState(profile.state || "");
  const [gpa, setGpa] = useState(profile.gpa || "");
  const [majorInterest, setMajorInterest] = useState(profile.majorInterest || "");
  const [householdIncome, setHouseholdIncome] = useState(profile.householdIncome || "");
  const [notes, setNotes] = useState(profile.notes || "");
  const [firstGen, setFirstGen] = useState(profile.firstGen ?? true);

  const canSave = name.trim() && profileType && state;

  const handleSave = () => {
    updateProfile({
      profileType,
      name: name.trim(),
      grade,
      state,
      gpa: gpa.trim(),
      majorInterest: majorInterest.trim(),
      householdIncome,
      notes: notes.trim(),
      firstGen,
    });
    navigate("/");
  };

  const handleTypeSelect = (key) => {
    setProfileType(key);
    // Reset grade when switching type since options change
    if (key !== profileType) setGrade("");
  };

  return (
    <div className={styles.page}>
      <SkyBackground />

      <div className={styles.card}>
        {isProfileComplete && (
          <div className={styles.completeBadge}>
            <span>✓</span> Profile complete
          </div>
        )}

        <h1 className={styles.heading}>Who are you?</h1>

        {/* Step 1 — Profile type selector */}
        <div className={styles.typeGrid}>
          {PROFILE_TYPES.map((t) => (
            <button
              key={t.key}
              className={`${styles.tile} ${profileType === t.key ? styles.tileSelected : ""}`}
              onClick={() => handleTypeSelect(t.key)}
            >
              <span className={styles.tileIcon}>{t.icon}</span>
              <span className={styles.tileLabel}>{t.label}</span>
              <span className={styles.tileSub}>{t.sub}</span>
            </button>
          ))}
        </div>

        {/* Step 2 — Form (visible once type is selected) */}
        {profileType && (
          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Grade / Level</label>
              <select
                className={styles.select}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">Select...</option>
                {GRADE_OPTIONS[profileType].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <select
                className={styles.select}
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">Select...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>GPA <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. 3.4"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Major interest <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Nursing, Computer Science"
                value={majorInterest}
                onChange={(e) => setMajorInterest(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Household income <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
              <select
                className={styles.select}
                value={householdIncome}
                onChange={(e) => setHouseholdIncome(e.target.value)}
              >
                <option value="">Select...</option>
                {INCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Notes <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
              <textarea
                className={styles.textarea}
                placeholder="Anything else? Extracurriculars, background, goals..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className={styles.checkRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                id="firstGen"
                checked={firstGen}
                onChange={(e) => setFirstGen(e.target.checked)}
              />
              <label className={styles.checkLabel} htmlFor="firstGen">
                I am a first-generation college student
              </label>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.saveBtn}
                disabled={!canSave}
                onClick={handleSave}
              >
                Save & continue →
              </button>
              <button className={styles.skipLink} onClick={() => navigate("/")}>
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
