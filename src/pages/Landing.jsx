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
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const revealRefs = useRef([]);
  const cta = CTA_MAP[profile.profileType] || CTA_MAP.highschool;
  const isLoading = authLoading || loading;

  // Reset the list each render so stale DOM nodes don't linger
  revealRefs.current = [];

  function addReveal(el) {
    if (el) revealRefs.current.push(el);
  }

  // Close avatar menu on outside click
  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handler = () => setAvatarMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [avatarMenuOpen]);

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

      {/* ── Floating pill navbar ── */}
      <div className={styles.navWrapper}>
        <div className={styles.navPill}>
          {/* Home button — inside the pill */}
          <button
            className={styles.navItem}
            onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
            title="Home"
          >
            <svg className={styles.navItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>

          <div className={styles.navDivider} />

          {/* Nav items — hidden on mobile, visible on desktop */}
          <button
            className={styles.navItem}
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            <svg className={styles.navItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span className={styles.navItemLabel}>Features</span>
          </button>

          <button
            className={styles.navItem}
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
          >
            <svg className={styles.navItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span className={styles.navItemLabel}>How It Works</span>
          </button>

          <button
            className={styles.navItem}
            onClick={() => document.getElementById("mission")?.scrollIntoView({ behavior: "smooth" })}
          >
            <svg className={styles.navItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className={styles.navItemLabel}>Mission</span>
          </button>

          {user && (
            <button
              className={styles.navItem}
              onClick={() => navigate("/tracker")}
            >
              <svg className={styles.navItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span className={styles.navItemLabel}>My Scholarships</span>
            </button>
          )}

          <div className={styles.navDivider} />

          {!isLoading && user && isProfileComplete ? (
            <div className={styles.avatarWrap}>
              <div
                className={styles.navAvatar}
                onClick={(e) => { e.stopPropagation(); setAvatarMenuOpen((v) => !v); }}
                title={profile.name}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              {avatarMenuOpen && (
                <div className={styles.avatarMenu} onClick={(e) => e.stopPropagation()}>
                  <button className={styles.avatarMenuItem} onClick={() => { navigate("/profile"); setAvatarMenuOpen(false); }}>
                    My Profile
                  </button>
                  <button className={styles.avatarMenuItem} onClick={() => { signOut(); setAvatarMenuOpen(false); }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : !isLoading && user ? (
            <button className={styles.navSignIn} onClick={() => navigate("/profile")}>
              Set up profile
            </button>
          ) : !isLoading ? (
            <button className={styles.navSignIn} onClick={() => navigate("/auth")}>
              Sign in →
            </button>
          ) : null}

          {/* Hamburger — only visible on mobile */}
          <button
            className={styles.navHamburger}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <button className={styles.mobileMenuItem} onClick={() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
              Features
            </button>
            <button className={styles.mobileMenuItem} onClick={() => { document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
              How It Works
            </button>
            <button className={styles.mobileMenuItem} onClick={() => { document.getElementById("mission")?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
              Mission
            </button>
            {user && (
              <button className={styles.mobileMenuItem} onClick={() => { navigate("/tracker"); setMenuOpen(false); }}>
                My Scholarships
              </button>
            )}
            <div className={styles.mobileMenuDivider} />
            {!isLoading && user && isProfileComplete ? (
              <>
                <button className={styles.mobileMenuItem} onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                  My Profile
                </button>
                <button className={styles.mobileMenuItem} onClick={() => { signOut(); setMenuOpen(false); }}>
                  Sign out
                </button>
              </>
            ) : !isLoading && user ? (
              <button className={styles.mobileMenuItem} onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                Set up profile
              </button>
            ) : !isLoading ? (
              <button className={styles.mobileMenuItem} onClick={() => { navigate("/auth"); setMenuOpen(false); }}>
                Sign in
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Section 1: Hero ── */}
      <section id="hero" className={styles.heroSection}>
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

            {!user && (
              <div className={styles.heroBadge}>
                <span style={{ color: "#48cae4" }}>✦</span>
                {" "}AI-powered college guidance · Free for students
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
                : "The college counselor every first-gen student deserves but never gets. Scholarships, FAFSA, essays, roadmaps — all in one place."}
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

            {!user && (
              <p className={styles.heroTrust}>
                Trusted by first-gen students across Indiana and beyond
                · No credit card · Always free
              </p>
            )}
          </div>
        )}

        <div className={styles.scrollHint}>Scroll to explore ↓</div>
      </section>

      {/* ── Section 2: Problem statement ── */}
      <section id="problem" className={styles.problemSection}>
        <div className={styles.problemInner}>
          <div className={styles.problemLeft}>
            <p className={styles.sectionEyebrow}>The problem</p>
            <h2 className={styles.problemHeadline}>
              The college system wasn't built for you.
            </h2>
            <p className={styles.problemBody}>
              Students with college-educated parents have a massive advantage —
              they get guidance, connections, and insider knowledge that first-gen
              students simply don't have access to. Legacy closes that gap.
            </p>
          </div>
          <div className={styles.problemStats}>
            {[
              { num: "$7B+",   label: "in scholarships go unclaimed every year" },
              { num: "1 in 4", label: "college students are first-generation" },
              { num: "40%",    label: "of first-gen students don't complete FAFSA" },
              { num: "Free",   label: "forever for students" },
            ].map((s) => (
              <div key={s.num} className={styles.problemStat}>
                <span className={styles.problemStatNum}>{s.num}</span>
                <span className={styles.problemStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Feature cards ── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <p className={styles.sectionEyebrow}>What Legacy does</p>
          <h2 className={styles.sectionHeadline}>
            Everything you need to get to — and through — college
          </h2>
          <p className={styles.featuresSubtext}>
            Six AI-powered tools built specifically for first-gen students.
            Each one replaces something that wealthy students get from their parents.
          </p>
        </div>

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

      {/* ── Section 4: How it works ── */}
      <section id="how-it-works" className={styles.howSection}>
        <p className={styles.sectionEyebrow} style={{ textAlign: "center" }}>
          How it works
        </p>
        <h2 className={`${styles.sectionHeadline} ${styles.howHeadline}`}>
          Up and running in 60 seconds
        </h2>
        <div className={styles.howSteps}>
          {[
            {
              num: "01",
              title: "Create your account",
              desc: "Sign up free with your email. No credit card, no trial — always free for students.",
              icon: "✉️",
            },
            {
              num: "02",
              title: "Build your profile",
              desc: "Tell us your grade, state, GPA, and goals. Takes 2 minutes. Unlocks fully personalized guidance.",
              icon: "👤",
            },
            {
              num: "03",
              title: "Get your roadmap",
              desc: "Legacy's AI immediately surfaces scholarships you qualify for, explains your FAFSA options, and builds your college timeline.",
              icon: "🗺️",
            },
          ].map((step, i) => (
            <div key={i} className={styles.howStep}>
              <div className={styles.howStepNum}>{step.num}</div>
              <div className={styles.howStepIcon}>{step.icon}</div>
              <h3 className={styles.howStepTitle}>{step.title}</h3>
              <p className={styles.howStepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Mission ── */}
      <section id="mission" className={styles.missionSection}>
        <div className={styles.missionInner}>
          <p className={styles.sectionEyebrow} style={{ textAlign: "center" }}>
            Our mission
          </p>
          <p
            ref={addReveal}
            className={`${styles.missionQuote} ${styles.reveal}`}
          >
            "Billions in scholarships go unclaimed every year.{" "}
            <em className={styles.missionAccent}>Legacy</em> exists to change that —
            one first-gen student at a time."
          </p>
          <div className={styles.missionCTA}>
            <button
              className={styles.ctaPrimary}
              onClick={() => navigate(user ? (isProfileComplete ? cta.route : "/profile") : "/auth")}
            >
              {user ? (isProfileComplete ? cta.text : "Set up your profile →") : "Get started free →"}
            </button>
            <p className={styles.missionNote}>
              Free forever · No credit card · Built for first-gen students
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
