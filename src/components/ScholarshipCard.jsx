import { useState } from "react";
import styles from "./ScholarshipCard.module.css";

function deadlineBadge(deadline) {
  if (!deadline || deadline.toLowerCase() === "rolling") {
    return { text: "Rolling", bg: "rgba(0,119,182,0.12)", color: "#0077b6" };
  }
  const ms = new Date(deadline) - new Date();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Passed", bg: "rgba(127,29,29,0.12)", color: "#7f1d1d" };
  if (days < 14) return { text: `${days} days left`, bg: "rgba(220,38,38,0.1)", color: "#dc2626" };
  if (days < 30) return { text: `${days} days left`, bg: "rgba(217,119,6,0.1)", color: "#d97706" };
  return { text: `${days} days left`, bg: "rgba(0,119,182,0.1)", color: "#0077b6" };
}

export default function ScholarshipCard({ scholarship, onSave, onRemove, showSave = true }) {
  const badge = deadlineBadge(scholarship.deadline);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const handleSave = async () => {
    if (saveState === "saving" || saveState === "saved") return;
    setSaveState("saving");
    try {
      const result = await onSave(scholarship);
      if (result === false) {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 2000);
      } else {
        setSaveState("saved");
      }
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.name}>{scholarship.name}</span>
        <span
          className={styles.badge}
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.text}
        </span>
      </div>

      <span className={styles.amount}>{scholarship.amount}</span>

      {scholarship.match_reason && (
        <span className={styles.matchReason}>{scholarship.match_reason}</span>
      )}

      {scholarship.eligibility && (
        <span className={styles.eligibility}>{scholarship.eligibility}</span>
      )}

      <div className={styles.actions}>
        {scholarship.url && scholarship.url !== "..." && (
          <a
            href={scholarship.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewLink}
          >
            View scholarship &rarr;
          </a>
        )}

        {showSave && onSave && (
          <button
            className={`${styles.saveBtn} ${saveState === "saved" ? styles.saveBtnSaved : ""} ${saveState === "error" ? styles.saveBtnError : ""}`}
            onClick={handleSave}
            disabled={saveState === "saving" || saveState === "saved"}
          >
            {saveState === "idle" && "Save"}
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved ✓"}
            {saveState === "error" && "Failed"}
          </button>
        )}

        {onRemove && (
          <button className={styles.removeBtn} onClick={() => onRemove(scholarship)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
