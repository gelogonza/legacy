import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ScholarshipCard from "../components/ScholarshipCard";
import styles from "./Tracker.module.css";

const STATUSES = ["Not started", "In progress", "Submitted"];

export default function Tracker() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("saved_scholarships")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) console.error("Tracker load error:", error.message);
      setSaved(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const remove = useCallback(async (scholarship) => {
    setSaved((prev) => prev.filter((s) => s.id !== scholarship.id));
    const { error } = await supabase
      .from("saved_scholarships")
      .delete()
      .eq("id", scholarship.id);
    if (error) console.error("Tracker remove error:", error.message);
  }, []);

  const cycleStatus = useCallback(async (scholarship) => {
    const idx = STATUSES.indexOf(scholarship.status || "Not started");
    const newStatus = STATUSES[(idx + 1) % STATUSES.length];
    // Optimistic update
    setSaved((prev) =>
      prev.map((s) => s.id === scholarship.id ? { ...s, status: newStatus } : s)
    );
    const { error } = await supabase
      .from("saved_scholarships")
      .update({ status: newStatus })
      .eq("id", scholarship.id);
    if (error) console.error("Tracker cycleStatus error:", error.message);
  }, []);

  const statusClass = (status) => {
    if (status === "In progress") return styles.statusInProgress;
    if (status === "Submitted") return styles.statusSubmitted;
    return styles.statusNotStarted;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: "flex", justifyContent: "center",
                      alignItems: "center", height: "100vh" }}>
          <div style={{ display: "flex", gap: 5 }}>
            {[0, 150, 300].map((delay) => (
              <span key={delay} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "rgba(255,255,255,0.5)",
                animation: `bounce 1.2s ${delay}ms infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <div key={s.id} className={styles.cardWrapper}>
              <ScholarshipCard scholarship={s} onRemove={remove} showSave={false} />
              <button
                className={`${styles.statusBtn} ${statusClass(s.status)}`}
                onClick={() => cycleStatus(s)}
              >
                {s.status || "Not started"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
