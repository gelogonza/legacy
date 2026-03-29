const cardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "0.5px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 12,
  padding: "18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const nameStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#f0ede6",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const amountStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#0077b6",
};

const detailStyle = {
  fontSize: 12,
  color: "rgba(240, 237, 230, 0.55)",
  lineHeight: 1.5,
};

const linkStyle = {
  fontSize: 12,
  color: "#0077b6",
  textDecoration: "underline",
};

const btnStyle = {
  background: "#0077b6",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  padding: "8px 16px",
  cursor: "pointer",
  alignSelf: "flex-start",
  marginTop: 4,
};

function deadlineBadge(deadline) {
  if (!deadline || deadline.toLowerCase() === "rolling") {
    return { text: "Rolling", color: "#0096c7" };
  }
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Passed", color: "#7f1d1d" };
  if (days < 14) return { text: `${days}d left`, color: "#dc2626" };
  if (days < 30) return { text: `${days}d left`, color: "#d97706" };
  return { text: `${days}d left`, color: "#0096c7" };
}

export default function ScholarshipCard({ scholarship, onSave, onRemove }) {
  const badge = deadlineBadge(scholarship.deadline);

  return (
    <div style={cardStyle}>
      <div style={rowStyle}>
        <span style={nameStyle}>{scholarship.name}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
            background: `${badge.color}22`,
            color: badge.color,
          }}
        >
          {badge.text}
        </span>
      </div>

      <span style={amountStyle}>{scholarship.amount}</span>

      {scholarship.eligibility && (
        <span style={detailStyle}>{scholarship.eligibility}</span>
      )}

      {scholarship.match_reason && (
        <span style={{ ...detailStyle, fontStyle: "italic" }}>
          Why it fits: {scholarship.match_reason}
        </span>
      )}

      {scholarship.url && scholarship.url !== "..." && (
        <a href={scholarship.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Apply &rarr;
        </a>
      )}

      {onSave && (
        <button style={btnStyle} onClick={() => onSave(scholarship)}>
          Save
        </button>
      )}

      {onRemove && (
        <button
          style={{ ...btnStyle, background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", color: "#fca5a5" }}
          onClick={() => onRemove(scholarship)}
        >
          Remove
        </button>
      )}
    </div>
  );
}
