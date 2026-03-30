import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useRateLimit } from "../hooks/useRateLimit";
import { useAllSessions } from "../hooks/useAllSessions";
import { supabase } from "../lib/supabase";
import ScholarshipCard from "../components/ScholarshipCard";

// ── Feature metadata ───────────────────────────────────────────────────────
const FEATURES = [
  { key: "scholarships", title: "Scholarship Matcher", icon: "🎓", color: "var(--orange)",       desc: "Find scholarships that fit your profile",    path: "/scholarships" },
  { key: "fafsa",        title: "FAFSA Guide",          icon: "📋", color: "var(--green)",        desc: "Navigate financial aid step by step",        path: "/fafsa" },
  { key: "essay",        title: "Essay Coach",           icon: "✍️", color: "var(--amber)",        desc: "Get feedback on your college essays",        path: "/essay" },
  { key: "roadmap",      title: "College Roadmap",       icon: "🗺️", color: "var(--green-light)",  desc: "Build your personalized college timeline",   path: "/roadmap" },
  { key: "local",        title: "Local Opportunities",   icon: "📍", color: "var(--green)",        desc: "Discover programs in your community",        path: "/local" },
  { key: "career",       title: "Career Advisor",        icon: "💼", color: "var(--amber)",        desc: "Explore career paths and salaries",          path: "/career" },
];

const FEATURE_MAP = Object.fromEntries(FEATURES.map((f) => [f.key, f]));

// ── Greeting helper ────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ── Profile type label ─────────────────────────────────────────────────────
function formatProfileType(type) {
  const map = {
    high_school:      "High School Student",
    college:          "College Student",
    returning:        "Returning Student",
    highschool:       "High School Student",
    "high school":    "High School Student",
  };
  return map[type] ?? type ?? null;
}

// ── Relative time helper ───────────────────────────────────────────────────
function timeAgo(dateString) {
  if (!dateString) return "";
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)             return "Just now";
  if (diff < 3600)           return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)          return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 2)      return "Yesterday";
  if (diff < 86400 * 7)      return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Avatar dropdown ────────────────────────────────────────────────────────
function AvatarMenu({ name, onEditProfile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initial = name ? name.trim()[0].toUpperCase() : "?";

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--orange)",
          border: "none",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#0d1f30",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            minWidth: 160,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        >
          {[
            { label: "Edit Profile", action: onEditProfile },
            { label: "Sign out",     action: onSignOut },
          ].map(({ label, action }) => (
            <button
              key={label}
              role="menuitem"
              onClick={() => { setOpen(false); action(); }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 16px",
                background: "none",
                border: "none",
                color: "var(--text)",
                fontFamily: "var(--font-display)",
                fontSize: 14,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, progress, linkLabel, onLink }) {
  return (
    <div style={{
      flex: "1 1 180px",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 20px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <span style={{ fontSize: 12, color: "var(--text-60)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 13, color: "var(--text-60)" }}>{sub}</span>
      )}
      {progress != null && (
        <div style={{
          marginTop: 4,
          height: 4,
          borderRadius: 99,
          background: "var(--border)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, progress * 100)}%`,
            background: "var(--orange)",
            borderRadius: 99,
            transition: "width 0.4s ease",
          }} />
        </div>
      )}
      {linkLabel && onLink && (
        <button
          onClick={onLink}
          style={{
            marginTop: 2,
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--green)",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-display)",
          }}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({ feature, onClick, preview }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--surface-hover)" : "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 20px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "background 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        fontFamily: "var(--font-display)",
        color: "var(--text)",
      }}
    >
      <span style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: feature.color + "22",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        flexShrink: 0,
      }}>
        {feature.icon}
      </span>
      <div>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{feature.title}</p>
        <p style={{ fontSize: 13, color: "var(--text-60)", lineHeight: 1.5 }}>{feature.desc}</p>
      </div>
      {preview && (
        <p style={{
          fontSize: 12,
          color: "var(--text-40)",
          lineHeight: 1.5,
          borderTop: "1px solid var(--border)",
          paddingTop: 10,
          marginTop: 2,
        }}>
          {preview}
        </p>
      )}
    </button>
  );
}

// ── Activity row ───────────────────────────────────────────────────────────
function ActivityRow({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  const feature = FEATURE_MAP[session.feature];
  const icon = feature?.icon ?? "💬";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        background: hovered ? "var(--surface-hover)" : "transparent",
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        fontFamily: "var(--font-display)",
        color: "var(--text)",
        transition: "background 0.12s",
      }}
    >
      <span style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0,
      }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {session.title || feature?.title || "Untitled session"}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-40)", flexShrink: 0 }}>
        {timeAgo(session.updated_at)}
      </span>
    </button>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const { user, signOut }         = useAuth();
  const { profile, isProfileComplete } = useProfile();
  const { remaining }             = useRateLimit();
  const { sessions }              = useAllSessions();
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [lastMessages, setLastMessages] = useState({});

  // Fetch saved scholarships
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("saved_scholarships")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setSavedScholarships(data || []));
  }, [user?.id]);

  // Fetch last assistant message per feature from most recent sessions
  useEffect(() => {
    if (!user?.id || sessions.length === 0) return;
    // Get one session per feature (most recent)
    const seen = {};
    const perFeature = [];
    for (const s of sessions) {
      if (!seen[s.feature]) {
        seen[s.feature] = true;
        perFeature.push(s);
      }
    }
    Promise.all(
      perFeature.map(async (s) => {
        const { data } = await supabase
          .from("chat_messages")
          .select("content")
          .eq("session_id", s.id)
          .eq("role", "assistant")
          .order("created_at", { ascending: false })
          .limit(1);
        return { feature: s.feature, preview: data?.[0]?.content || null };
      })
    ).then((results) => {
      const map = {};
      for (const r of results) {
        if (r.preview) {
          // Strip markdown/tags, take first 120 chars
          const clean = r.preview
            .replace(/<[^>]+>/g, "")
            .replace(/[#*_~`>\-]/g, "")
            .replace(/\n+/g, " ")
            .trim();
          map[r.feature] = clean.length > 120 ? clean.slice(0, 120) + "..." : clean;
        }
      }
      setLastMessages(map);
    });
  }, [user?.id, sessions]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const used = 20 - remaining;
  const profileTypeLabel = formatProfileType(profile.profileType);
  const recentSessions = sessions.slice(0, 5);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-display)", color: "var(--text)" }}>

      {/* Profile completion banner */}
      {!isProfileComplete && (
        <div style={{
          background: "rgba(144, 224, 239, 0.08)",
          borderBottom: "1px solid rgba(144, 224, 239, 0.2)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 14, color: "var(--amber)" }}>
            Complete your profile to get personalized results
          </span>
          <button
            onClick={() => navigate("/profile")}
            style={{
              background: "var(--amber)",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "#020c18",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Set up profile →
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(2, 12, 24, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span
          style={{ fontWeight: 700, fontSize: 18, color: "#fff", cursor: "pointer", letterSpacing: "-0.01em" }}
          onClick={() => navigate("/dashboard")}
        >
          Legacy
        </span>
        <AvatarMenu
          name={profile.name}
          onEditProfile={() => navigate("/profile")}
          onSignOut={handleSignOut}
        />
      </nav>

      {/* Page body */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Hero */}
        <section style={{ padding: "48px 0 32px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 12,
            letterSpacing: "-0.02em",
          }}>
            {profile.name ? `${getGreeting()}, ${profile.name.split(" ")[0]}` : "Welcome back"}
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-60)" }}>
            {profileTypeLabel ? (
              profileTypeLabel
            ) : (
              <button
                onClick={() => navigate("/profile")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--green)",
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(0,180,216,0.4)",
                  padding: 0,
                }}
              >
                Tell us about yourself
              </button>
            )}
          </p>
        </section>

        {/* Stats row */}
        <section
          aria-label="Usage statistics"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <StatCard
            label="Messages Today"
            value={`${used} / 20`}
            sub={remaining === 0 ? "Daily limit reached" : `${remaining} remaining`}
            progress={used / 20}
          />
          <StatCard
            label="Saved Scholarships"
            value={savedScholarships.length}
            sub="in your tracker"
            linkLabel="View tracker"
            onLink={() => navigate("/tracker")}
          />
          <StatCard
            label="Chat Sessions"
            value={sessions.length}
            sub="total conversations"
          />
        </section>

        {/* Feature grid */}
        <section aria-label="Your Tools" style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}>
            Your Tools
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}>
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.key}
                feature={feature}
                onClick={() => navigate(feature.path)}
                preview={lastMessages[feature.key]}
              />
            ))}
          </div>
        </section>

        {/* Saved scholarships */}
        {savedScholarships.length > 0 && (
          <section aria-label="Saved Scholarships" style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.01em",
              }}>
                Saved Scholarships
              </h2>
              <button
                onClick={() => navigate("/tracker")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--green)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                }}
              >
                View all →
              </button>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}>
              {savedScholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} showSave={false} />
              ))}
            </div>
          </section>
        )}

        {/* Recent activity */}
        <section aria-label="Recent Activity">
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}>
            Recent Activity
          </h2>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "8px",
          }}>
            {recentSessions.length === 0 ? (
              <p style={{
                padding: "24px 16px",
                textAlign: "center",
                fontSize: 14,
                color: "var(--text-40)",
              }}>
                No recent activity. Start a conversation above.
              </p>
            ) : (
              recentSessions.map((session) => (
                <ActivityRow
                  key={session.id}
                  session={session}
                  onClick={() => navigate(FEATURE_MAP[session.feature]?.path ?? "/")}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
