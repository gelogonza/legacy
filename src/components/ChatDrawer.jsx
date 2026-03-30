import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FEATURE_META = {
  scholarships: { icon: "🎓", label: "Scholarship Matcher" },
  fafsa:        { icon: "📋", label: "FAFSA Guide"         },
  essay:        { icon: "✍️", label: "Essay Coach"          },
  roadmap:      { icon: "🗺️", label: "College Roadmap"      },
  local:        { icon: "📍", label: "Local Opportunities"  },
  career:       { icon: "💼", label: "Career Advisor"       },
};

export default function ChatDrawer({
  isOpen, onClose, currentFeature,
  sessions, resources,
  onSelectSession, onNewChat,
  profile, onSignOut
}) {
  const navigate = useNavigate();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleFeatureClick = (feature) => {
    navigate(`/${feature}`);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: 300,
        zIndex: 201,
        background: "#060d18",
        borderRight: "0.5px solid rgba(255,255,255,0.08)",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}>

        {/* Header — avatar + user info + close */}
        <div style={{
          padding: "52px 16px 16px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "#0077b6", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
          }}>
            {profile?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f0ede6",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.name || "Student"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(240,237,230,0.4)", marginTop: 2 }}>
              {[profile?.profileType, profile?.state, profile?.gpa && `GPA ${profile.gpa}`]
                .filter(Boolean).join(" · ")}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.08)", border: "none",
                     borderRadius: 6, color: "rgba(255,255,255,0.5)",
                     width: 28, height: 28, fontSize: 12, cursor: "pointer",
                     display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>

        {/* FEATURES section */}
        <div style={{ padding: "16px 8px 8px" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em", padding: "0 8px 10px", margin: 0 }}>
            FEATURES
          </p>
          {Object.entries(FEATURE_META).map(([key, meta]) => {
            const isActive = key === currentFeature;
            return (
              <button
                key={key}
                onClick={() => handleFeatureClick(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "9px 10px",
                  background: isActive ? "rgba(0,119,182,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(0,119,182,0.5)" : "1px solid transparent",
                  borderRadius: 8, cursor: "pointer",
                  marginBottom: 2, textAlign: "left",
                }}
              >
                <span style={{ fontSize: 15 }}>{meta.icon}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#f0ede6" : "rgba(240,237,230,0.6)",
                  flex: 1,
                }}>
                  {meta.label}
                </span>
                {isActive && (
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#00b4d8", flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />

        {/* RECENT CHATS section */}
        <div style={{ padding: "12px 8px 8px" }}>
          <div style={{ display: "flex", alignItems: "center",
                        justifyContent: "space-between", padding: "0 8px 10px" }}>
            <p style={{ fontSize: 9, fontWeight: 700,
                        color: "rgba(255,255,255,0.35)",
                        letterSpacing: "0.1em", margin: 0 }}>
              RECENT CHATS
            </p>
            <button
              onClick={() => { onNewChat(); onClose(); }}
              style={{
                background: "rgba(0,119,182,0.15)",
                border: "1px solid rgba(0,119,182,0.4)",
                borderRadius: 12, color: "#48cae4",
                fontSize: 10, fontWeight: 700, padding: "3px 10px",
                cursor: "pointer",
              }}
            >
              + New
            </button>
          </div>

          {sessions.length === 0 ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)",
                        padding: "8px 10px", margin: 0 }}>
              No conversations yet
            </p>
          ) : (
            sessions.slice(0, 8).map((s) => {
              const meta = FEATURE_META[s.feature];
              return (
                <button
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); onClose(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "9px 10px",
                    background: "transparent",
                    border: "1px solid transparent",
                    borderRadius: 8, cursor: "pointer",
                    marginBottom: 2, textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 13, flexShrink: 0 }}>
                    {meta?.icon || "💬"}
                  </span>
                  <span style={{
                    fontSize: 12, color: "rgba(240,237,230,0.55)",
                    flex: 1, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {s.title || "New conversation"}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)",
                                  flexShrink: 0 }}>
                    {formatRelativeTime(s.updated_at)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />

        {/* RESOURCES section */}
        <div style={{ padding: "12px 8px 8px", flex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em", padding: "0 8px 10px", margin: 0 }}>
            RESOURCES
          </p>
          {resources.slice(0, 5).map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "8px 10px", borderRadius: 8, textDecoration: "none",
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 13, marginTop: 1 }}>
                {r.is_featured ? "⭐" : "🔗"}
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700,
                              color: "rgba(240,237,230,0.7)" }}>
                  {r.title}
                </div>
                {r.description && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)",
                                marginTop: 2, lineHeight: 1.4 }}>
                    {r.description}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Bottom — Profile + Sign out */}
        <div style={{
          borderTop: "0.5px solid rgba(255,255,255,0.07)",
          padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button
            onClick={() => { navigate("/profile"); onClose(); }}
            style={{ background: "none", border: "none", fontSize: 12,
                     color: "rgba(240,237,230,0.55)", cursor: "pointer", padding: 0 }}
          >
            ⚙️  Profile settings
          </button>
          <button
            onClick={() => { onSignOut(); onClose(); }}
            style={{ background: "none", border: "none", fontSize: 12,
                     color: "rgba(220,60,60,0.8)", cursor: "pointer", padding: 0 }}
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// Relative time helper
function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins < 2 ? "now" : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
