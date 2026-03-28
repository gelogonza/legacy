import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScholarshipCard from "../components/ScholarshipCard";

const STORAGE_KEY = "legacy_saved_scholarships";
const STATUSES = ["Not started", "In progress", "Submitted"];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export default function Tracker() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(loadSaved);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const remove = (scholarship) => {
    setSaved((prev) => prev.filter((s) => s.name !== scholarship.name));
  };

  const cycleStatus = (index) => {
    setSaved((prev) => {
      const next = [...prev];
      const current = STATUSES.indexOf(next[index].status || "Not started");
      next[index] = {
        ...next[index],
        status: STATUSES[(current + 1) % STATUSES.length],
      };
      return next;
    });
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <button style={backStyle} onClick={() => navigate("/")}>
          &larr; Back
        </button>
        <h1 style={titleStyle}>My Scholarships</h1>
      </div>

      {saved.length === 0 ? (
        <p style={emptyStyle}>
          No scholarships saved yet. Head to the{" "}
          <span
            style={{ color: "#0077b6", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/scholarships")}
          >
            Scholarship Matcher
          </span>{" "}
          to find ones that fit you.
        </p>
      ) : (
        <div style={gridStyle}>
          {saved.map((s, i) => (
            <div key={s.name + i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ScholarshipCard scholarship={s} onRemove={remove} />
              <button
                style={statusBtnStyle(s.status || "Not started")}
                onClick={() => cycleStatus(i)}
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

// ── Styles ───────────────────────────────────────────────────────────────────

const pageStyle = {
  minHeight: "100vh",
  background: "var(--bg)",
  padding: "40px",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  marginBottom: 40,
};

const backStyle = {
  background: "none",
  border: "0.5px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  color: "rgba(240,237,230,0.6)",
  fontSize: 13,
  padding: "8px 14px",
  cursor: "pointer",
};

const titleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: 24,
  fontWeight: 700,
  color: "#f0ede6",
};

const emptyStyle = {
  fontSize: 14,
  color: "rgba(240,237,230,0.5)",
  lineHeight: 1.6,
  maxWidth: 480,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 16,
  maxWidth: 960,
};

function statusBtnStyle(status) {
  const colors = {
    "Not started": { bg: "rgba(255,255,255,0.05)", color: "rgba(240,237,230,0.5)" },
    "In progress": { bg: "rgba(0,119,182,0.12)", color: "#0096c7" },
    "Submitted":   { bg: "rgba(72,202,228,0.12)", color: "#48cae4" },
  };
  const c = colors[status] || colors["Not started"];
  return {
    background: c.bg,
    border: "none",
    borderRadius: 8,
    color: c.color,
    fontSize: 12,
    fontWeight: 600,
    padding: "7px 14px",
    cursor: "pointer",
    textAlign: "center",
  };
}
