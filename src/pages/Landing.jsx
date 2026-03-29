import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import styles from "./Landing.module.css";
import SkyBackground from "../components/SkyBackground";

const FEATURE_DETAILS = [
  {
    icon: "🎓",
    title: "Scholarship Matcher",
    eyebrow: "Find money you didn't know existed",
    desc: "Tell Legacy your GPA, state, major, and background. Our AI surfaces real scholarships you actually qualify for — not generic lists, but personalized matches with deadlines, amounts, and direct links. Save the ones you want and track your application status.",
    bullets: ["Filtered by your exact profile", "Deadline alerts", "Save to your tracker"],
    color: "var(--orange)",
    route: "/scholarships",
  },
  {
    icon: "📋",
    title: "FAFSA Guide",
    eyebrow: "No more confusion, no more shame",
    desc: "FAFSA is complicated on purpose — or at least it feels that way. Legacy walks you through every step in plain language. Undocumented parents? Divorced parents? Self-supporting? We handle every situation without making you feel lost.",
    bullets: ["Step-by-step in plain English", "Handles complex family situations", "Explains what your EFC actually means"],
    color: "var(--green)",
    route: "/fafsa",
  },
  {
    icon: "✍️",
    title: "Essay Coach",
    eyebrow: "Your story, in your voice",
    desc: "Legacy never rewrites your essay for you — that would defeat the point. Instead, it gives you specific, actionable feedback: what's working, what's generic, where to add detail. It helps you find the story that only you can tell.",
    bullets: ["Feedback on drafts you share", "Helps find your unique angle", "Never writes it for you"],
    color: "var(--amber)",
    route: "/essay",
  },
  {
    icon: "🗺️",
    title: "College Roadmap",
    eyebrow: "A plan from where you are to where you're going",
    desc: "Tell us your grade, GPA, dream schools, and situation. Legacy builds you a personalized timeline — when to take tests, when to visit campuses, when to apply, which schools are reaches vs. matches. HBCUs always included as real options, not fallbacks.",
    bullets: ["Personalized milestones", "HBCUs always included", "Visual timeline you can check off"],
    color: "var(--green-light)",
    route: "/roadmap",
  },
  {
    icon: "📍",
    title: "Local Opportunities",
    eyebrow: "The resources hiding in your own community",
    desc: "Most students don't know about the programs, nonprofits, and local scholarships in their own backyard. Local scholarships have less competition because fewer students apply. Legacy surfaces what's near you — community foundations, college prep programs, regional grants.",
    bullets: ["State and city-specific results", "Less competition than national scholarships", "Free programs and mentorship"],
    color: "var(--green)",
    route: "/local",
  },
  {
    icon: "💼",
    title: "Career Advisor",
    eyebrow: "Connect your major to your future",
    desc: "What does a CS degree actually get you? What jobs exist in nursing? What does a software engineer make in Indiana? Legacy gives you honest answers about career paths, salary ranges, and what you can do right now to build toward your goals.",
    bullets: ["Real salary and job market data", "Major-to-career pathways", "What to do at every stage"],
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

      {/* ── Floating pill navbar (unchanged) ── */}
      <div className={styles.navWrapper}>
        <div className={styles.navPill}>
          <button
            className={styles.navItem}
            onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
            title="Home"
          >
            <svg className={styles.navItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>

          <div className={styles.navDivider} />

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
                ✦ &nbsp; AI-powered college guidance for first-gen students
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
                : "The college counselor every first-gen student deserves — but never gets. Scholarships, FAFSA, essays, career planning, and your personal roadmap. All in one place."}
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

      {/* ── Section 2: Problem statement with dashed grid ── */}
      <section id="problem" className={styles.problemSection}>
        <div className={styles.dashedGrid} />

        <div className={styles.problemContent}>
          <p className={styles.eyebrow}>The problem</p>
          <h2 className={styles.problemHeadline}>
            The college system has a hidden curriculum.
            <br />
            <span className={styles.problemHeadlineAccent}>
              First-gen students don't get the memo.
            </span>
          </h2>
          <p className={styles.problemBody}>
            Students whose parents went to college grow up knowing which
            scholarships to apply for, how to navigate FAFSA, how to write
            a compelling essay, and what deadlines actually matter.
            First-gen students figure it out alone — or don't figure it out at all.
            Roughly $100 million in scholarship money goes unclaimed every year because students
            don't know it exists. Legacy changes that.
          </p>

          <div className={styles.problemStats}>
            {[
              { num: "~$100M", label: "in scholarships go unclaimed annually" },
              { num: "1 in 4", label: "college students are first-generation" },
            ].map((s, i) => (
              <div key={i} ref={addReveal}
                   className={`${styles.problemStat} ${styles.reveal}`}
                   style={{ transitionDelay: `${i * 80}ms` }}>
                <span className={styles.problemStatNum}>{s.num}</span>
                <span className={styles.problemStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Feature deep-dives ── */}
      <section id="features" className={styles.featuresDeepSection}>
        <div className={styles.featuresSectionHeader}>
          <p className={styles.eyebrow}>Six tools. One mission.</p>
          <h2 className={styles.sectionHeadline}>
            Everything a first-gen student needs —<br />
            in one place
          </h2>
        </div>

        <div className={styles.featuresDeepGrid}>
          {FEATURE_DETAILS.map((f, i) => (
            <div
              key={f.title}
              ref={addReveal}
              className={`${styles.featureDeepCard} ${styles.reveal}`}
              style={{ transitionDelay: `${i * 60}ms` }}
              onClick={() => navigate(f.route)}
            >
              <div className={styles.featureDeepTop}>
                <div className={styles.featureDeepIconWrap}
                     style={{ background: `${f.color}18`,
                              border: `0.5px solid ${f.color}40` }}>
                  <span className={styles.featureDeepIcon}>{f.icon}</span>
                </div>
                <p className={styles.featureDeepEyebrow} style={{ color: f.color }}>
                  {f.eyebrow}
                </p>
              </div>

              <h3 className={styles.featureDeepTitle}>{f.title}</h3>
              <p className={styles.featureDeepDesc}>{f.desc}</p>

              <ul className={styles.featureDeepBullets}>
                {f.bullets.map((b) => (
                  <li key={b} className={styles.featureDeepBullet}>
                    <span style={{ color: f.color }}>✓</span> {b}
                  </li>
                ))}
              </ul>

              <div className={styles.featureDeepCTA} style={{ color: f.color }}>
                Try it now →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: How it works ── */}
      <section id="how-it-works" className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.featuresSectionHeader}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.sectionHeadline}>Up and running in 2 minutes</h2>
          </div>

          <div className={styles.howSteps}>
            {[
              {
                num: "01",
                icon: "✉️",
                title: "Create your free account",
                desc: "Sign up with your email — it only takes a minute. Legacy is built by students, for students.",
              },
              {
                num: "02",
                icon: "👤",
                title: "Build your profile",
                desc: "Tell us your grade, state, GPA, major interest, and goals. Takes 2 minutes. Unlocks fully personalized AI guidance across all 6 tools.",
              },
              {
                num: "03",
                icon: "🚀",
                title: "Get your personalized plan",
                desc: "Legacy immediately surfaces scholarships you qualify for, explains your FAFSA options, and builds a college timeline tailored to you.",
              },
            ].map((step, i) => (
              <div
                key={i}
                ref={addReveal}
                className={`${styles.howStep} ${styles.reveal}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={styles.howStepNum}>{step.num}</div>
                <div className={styles.howStepIcon}>{step.icon}</div>
                <h3 className={styles.howStepTitle}>{step.title}</h3>
                <p className={styles.howStepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Stats bar ── */}
      <section className={styles.statsBar}>
        {[
          { num: "~$100M", label: "unclaimed scholarships" },
          { num: "1 in 4", label: "students are first-gen" },
        ].map((s, i) => (
          <div key={i} className={styles.statBarItem}>
            <span className={styles.statBarNum}>{s.num}</span>
            <span className={styles.statBarLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Section 6: Mission + Final CTA ── */}
      <section id="mission" className={styles.missionSection}>
        <div className={styles.missionInner}>
          <p className={styles.eyebrow} style={{ textAlign: "center" }}>Our mission</p>
          <p
            ref={addReveal}
            className={`${styles.missionQuote} ${styles.reveal}`}
          >
            "Legacy isn't a chatbot. It's the college counselor every
            first-gen student deserves — but never gets."
          </p>
          <div className={styles.missionCTARow}>
            <button
              className={styles.ctaPrimary}
              onClick={() => navigate(
                user
                  ? isProfileComplete ? cta.route : "/profile"
                  : "/auth"
              )}
            >
              {user
                ? isProfileComplete ? cta.text : "Set up your profile →"
                : "Get started free →"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoText}>Legacy</span>
            </div>
            <p className={styles.footerTagline}>
              AI-powered college guidance for first-generation students.
            </p>
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColLabel}>Features</p>
            {[
              { label: "Scholarship Matcher", route: "/scholarships" },
              { label: "FAFSA Guide",         route: "/fafsa"        },
              { label: "Essay Coach",         route: "/essay"        },
              { label: "College Roadmap",     route: "/roadmap"      },
              { label: "Local Opportunities", route: "/local"        },
              { label: "Career Advisor",      route: "/career"       },
            ].map((f) => (
              <button
                key={f.route}
                className={styles.footerLink}
                onClick={() => navigate(f.route)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className={styles.footerCol}>
            <p className={styles.footerColLabel}>Account</p>
            {!user ? (
              <>
                <button className={styles.footerLink} onClick={() => navigate("/auth")}>
                  Sign in
                </button>
                <button className={styles.footerLink} onClick={() => navigate("/auth")}>
                  Create account
                </button>
              </>
            ) : (
              <>
                <button className={styles.footerLink} onClick={() => navigate("/profile")}>
                  My Profile
                </button>
                <button className={styles.footerLink} onClick={() => navigate("/tracker")}>
                  My Scholarships
                </button>
                <button className={styles.footerLink} onClick={signOut}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Legacy. Built by students, for students.
          </p>
          <p className={styles.footerCopy}>
            <a
              href="https://trylegacy.tech"
              className={styles.footerBottomLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              trylegacy.tech
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
