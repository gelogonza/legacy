import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScholarshipCard from "../components/ScholarshipCard";
import styles from "./Tracker.module.css";

const SAVED_KEY = "legacy_saved_scholarships";
const STATUS_KEY = "legacy_scholarship_status";
const STATUSES = ["Not started", "In progress", "Submitted"];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

function loadStatuses() {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
  } catch {
    return {};
  }
}

export default function Tracker() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(loadSaved);
  const [statuses, setStatuses] = useState(loadStatuses);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  }, [statuses]);

  const remove = (scholarship) => {
    setSaved((prev) => prev.filter((s) => s.name !== scholarship.name));
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[scholarship.name];
      return next;
    });
  };

  const cycleStatus = (name) => {
    setStatuses((prev) => {
      const current = prev[name] || "Not started";
      const idx = STATUSES.indexOf(current);
      return { ...prev, [name]: STATUSES[(idx + 1) % STATUSES.length] };
    });
  };

  const statusClass = (name) => {
    const s = statuses[name] || "Not started";
    if (s === "In progress") return styles.statusInProgress;
    if (s === "Submitted") return styles.statusSubmitted;
    return styles.statusNotStarted;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          &larr; Dashboard
        </button>
        <h1 className={styles.title}>Saved Scholarships</h1>
      </div>

      {saved.length === 0 ? (
        <div className={styles.empty}>
          <p>No scholarships saved yet.</p>
          <button className={styles.emptyLink} onClick={() => navigate("/scholarships")}>
            Go to Scholarship Matcher
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {saved.map((s) => (
            <div key={s.name} className={styles.cardWrapper}>
              <ScholarshipCard scholarship={s} onRemove={remove} showSave={false} />
              <button
                className={`${styles.statusBtn} ${statusClass(s.name)}`}
                onClick={() => cycleStatus(s.name)}
              >
                {statuses[s.name] || "Not started"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
