import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
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
];

const STATS = [
  { num: "$7B+", label: "Scholarships unclaimed yearly" },
  { num: "1 in 3", label: "of college students are first-gen" },
  { num: "Free", label: "Always, for students" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isProfileComplete } = useProfile();
  const revealRefs = useRef([]);

  // Reset the list each render so stale DOM nodes don't linger
  revealRefs.current = [];

  function addReveal(el) {
    if (el) revealRefs.current.push(el);
  }

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
            <span className={styles.navLink} onClick={() => navigate("/profile")}>
              {isProfileComplete ? "Edit profile" : "Set up profile"}
            </span>
            <span className={styles.navLink} onClick={() => navigate("/tracker")}>
              My Scholarships
            </span>
          </div>
        </nav>

        <div className={styles.heroContent}>
          <h1 className={styles.headline}>
            Create your{" "}
            <i className={styles.headlinei}>Legacy</i>
          </h1>

          <p className={styles.subtext}>
            The AI-powered college guide built for first-generation, low-income students.
          </p>

          <div className={styles.ctaRow}>
            <button
              className={styles.ctaPrimary}
              onClick={() => navigate("/scholarships")}
            >
              Find my scholarships →
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => navigate("/fafsa")}
            >
              Learn more
            </button>
          </div>
        </div>

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
