import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import styles from "./Landing.module.css";
import SkyBackground from "../components/SkyBackground";

const FEATURES = [
  {
    icon: "🎓",
    title: "Scholarship matcher",
    desc: "Personalized matches by GPA, state, major, and background.",
    color: "var(--orange)",
    route: "/scholarships",
  },
  {
    icon: "📋",
    title: "FAFSA guide",
    desc: "Step-by-step walkthroughs in plain language, no jargon.",
    color: "var(--green)",
    route: "/fafsa",
  },
  {
    icon: "✍️",
    title: "Essay coach",
    desc: "Feedback on essays from an AI that understands your voice.",
    color: "var(--amber)",
    route: "/essay",
  },
  {
    icon: "🗺️",
    title: "College roadmap",
    desc: "A personalized timeline from today to campus day one.",
    color: "var(--green-light)",
    route: "/roadmap",
  },
  {
    icon: "📍",
    title: "Local opportunities",
    desc: "Community programs, local scholarships, and regional resources near you.",
    color: "var(--green)",
    route: "/local",
  },
  {
    icon: "💼",
    title: "Career advisor",
    desc: "Connect your major to real careers and build toward your goals.",
    color: "var(--amber)",
    route: "/career",
  },
];

const STATS = [
  { num: "$7B+", label: "Scholarships unclaimed yearly" },
  { num: "1 in 4", label: "of college students are first-gen" },
  { num: "Free", label: "Always, for students" },
];

const CTA_MAP = {
  highschool: { text: "Find my scholarships →", route: "/scholarships" },
  college:    { text: "Check my roadmap →",      route: "/roadmap" },
  returning:  { text: "Explore FAFSA options →", route: "/fafsa" },
  military:   { text: "Find my benefits →",      route: "/scholarships" },
};

const TYPE_META = {
  highschool: { emoji: "🎒", label: "High school" },
  college:    { emoji: "🎓", label: "College" },
  returning:  { emoji: "🔄", label: "Returning" },
  military:   { emoji: "🎖️", label: "Military" },
};

function buildBannerText(profile) {
  const meta = TYPE_META[profile.profileType];
  if (!meta) return null;
  const parts = [meta.emoji + " " + meta.label];
  if (profile.grade) parts[0] += " " + profile.grade.toLowerCase();
  if (profile.state) parts.push(profile.state);
  if (profile.gpa) parts.push("GPA " + profile.gpa);
  if (profile.majorInterest) parts.push(profile.majorInterest);
  return parts.join(" · ");
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, authLoading, signOut } = useAuth();
  const { profile, isProfileComplete, loading } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const revealRefs = useRef([]);
  const cta = CTA_MAP[profile.profileType] || CTA_MAP.highschool;
  const isLoading = authLoading || loading;

  // Reset the list each render so stale DOM nodes don't linger
  revealRefs.current = [];

  function addReveal(el) {
    if (el) revealRefs.current.push(el);
  }

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <SkyBackground />

      {/* ── Section 1: Hero ── */}
      <section className={styles.heroSection}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <span className={styles.logoText}>Legacy</span>
          </div>
          <div className={styles.navLinks}>
            {!isLoading && user && isProfileComplete && (
              <div className={styles.avatarPill} onClick={() => navigate("/profile")}>
                <div className={styles.avatarCircle}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className={styles.avatarName}>{profile.name}</span>
              </div>
            )}
            {!isLoading && user && !isProfileComplete && (
              <span className={styles.navLink} onClick={() => navigate("/profile")}>
                Get started →
              </span>
            )}
            {!isLoading && !user && (
              <span className={styles.navLink} onClick={() => navigate("/auth")}>
                Sign up →
              </span>
            )}
            {user && (
              <span className={styles.navLink} onClick={() => navigate("/tracker")}>
                My Scholarships
              </span>
            )}
            {user && (
              <span className={styles.navLink} onClick={signOut}>
                Sign out
              </span>
            )}
          </div>

          {/* Burger button — mobile only */}
          <button
            className={styles.burgerBtn}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="3" y1="6" x2="19" y2="6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="11" x2="19" y2="11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="16" x2="19" y2="16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </nav>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            {!isLoading && user && isProfileComplete && (
              <div
                className={styles.mobileMenuItem}
                onClick={() => { navigate("/profile"); setMenuOpen(false); }}
              >
                {profile.name}
              </div>
            )}
            {user && (
              <div
                className={styles.mobileMenuItem}
                onClick={() => { navigate("/tracker"); setMenuOpen(false); }}
              >
                My Scholarships
              </div>
            )}
            {!isLoading && user && !isProfileComplete && (
              <div
                className={styles.mobileMenuItem}
                onClick={() => { navigate("/profile"); setMenuOpen(false); }}
              >
                Set up profile →
              </div>
            )}
            {user && (
              <div
                className={styles.mobileMenuItem}
                style={{ color: "rgba(255,255,255,0.45)" }}
                onClick={() => { signOut(); setMenuOpen(false); }}
              >
                Sign out
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className={styles.heroContent}>
            <div style={{ width: 320, height: 72, background: "rgba(255,255,255,0.12)",
                          borderRadius: 6, marginBottom: 24,
                          animation: "pulse 1.8s ease-in-out infinite" }} />
            <div style={{ width: 240, height: 20, background: "rgba(255,255,255,0.08)",
                          borderRadius: 6, marginBottom: 40,
                          animation: "pulse 1.8s ease-in-out infinite" }} />
            <div style={{ width: 180, height: 48, background: "rgba(255,255,255,0.1)",
                          borderRadius: 10,
                          animation: "pulse 1.8s ease-in-out infinite" }} />
          </div>
        ) : (
          <div className={styles.heroContent}>
            {user && isProfileComplete && (
              <div className={styles.profileBanner}>
                {buildBannerText(profile)}
              </div>
            )}

            {user && isProfileComplete ? (
              <h1 className={styles.headline}>
                Welcome back, {profile.name}.
              </h1>
            ) : (
              <h1 className={styles.headline}>
                Create your{" "}
                <i className={styles.headlinei}>Legacy</i>
              </h1>
            )}

            <p className={styles.subtext}>
              {user && isProfileComplete
                ? "Pick up where you left off."
                : "The AI-powered college guide built for first-generation, low-income students."}
            </p>

            <div className={styles.ctaRow}>
              {user && isProfileComplete ? (
                <button
                  className={styles.ctaPrimary}
                  onClick={() => navigate(cta.route)}
                >
                  {cta.text}
                </button>
              ) : user ? (
                <>
                  <button
                    className={styles.ctaPrimary}
                    onClick={() => navigate("/scholarships")}
                  >
                    Find my scholarships →
                  </button>
                  <button
                    className={styles.ctaSecondary}
                    onClick={() => navigate("/profile")}
                  >
                    Set up my profile →
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.ctaPrimary}
                    onClick={() => navigate("/auth")}
                  >
                    Get started free →
                  </button>
                  <button
                    className={styles.ctaSecondary}
                    onClick={() => navigate("/auth")}
                  >
                    Sign in →
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.scrollHint}>Scroll to explore ↓</div>
      </section>

      {/* ── Section 2: Stats ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsRow}>
          {STATS.map((s, i) => (
            <div
              key={s.num}
              ref={addReveal}
              className={`${styles.statGroup} ${styles.reveal}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Feature cards ── */}
      <section className={styles.featuresSection}>
        <h2
          ref={addReveal}
          className={`${styles.sectionHeadline} ${styles.reveal}`}
        >
          Everything you need to get there
        </h2>

        <div className={styles.cards}>
          {FEATURES.map((f, i) => (
            <button
              key={f.title}
              ref={addReveal}
              className={`${styles.card} ${styles.reveal}`}
              style={{ transitionDelay: `${i * 100}ms` }}
              onClick={() => navigate(f.route)}
            >
              <div
                className={styles.cardIcon}
                style={{ background: `${f.color}22` }}
              >
                {f.icon}
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Section 4: Mission ── */}
      <section className={styles.missionSection}>
        <p
          ref={addReveal}
          className={`${styles.missionQuote} ${styles.reveal}`}
        >
          "Billions in scholarships go unclaimed every year.{" "}
          <em className={styles.missionAccent}>Legacy</em> exists to change that."
        </p>
      </section>
    </div>
  );
}
