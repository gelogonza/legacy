import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import SkyBackground from "../components/SkyBackground";

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("magic"); // "magic" | "signin" | "signup"
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
      },
    });

    setSending(false);

    if (error) {
      setError(error.message);
    } else {
      setMagicSent(true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSending(true);
    setError(null);

    let result;
    if (mode === "signup") {
      result = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
    }

    setSending(false);

    if (result.error) {
      setError(result.error.message);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setMagicSent(false);
  };

  const headings = {
    magic: "Sign in to Legacy",
    signin: "Sign in with password",
    signup: "Create your account",
  };

  const subtitles = {
    magic: "Enter your email and we'll send you a sign-in link.",
    signin: "Enter your email and password.",
    signup: "Sign up to start your college journey.",
  };

  return (
    <div style={styles.page}>
      <SkyBackground />
      <div style={styles.card}>
        <h1 style={styles.heading}>{headings[mode]}</h1>
        <p style={styles.text}>{subtitles[mode]}</p>

        {/* ── Magic link sent confirmation ── */}
        {magicSent ? (
          <div style={styles.sentBox}>
            <p style={{ fontSize: 15, color: "#fff", marginBottom: 8 }}>
              Check your email
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              We sent a sign-in link to <strong style={{ color: "#fff" }}>{email}</strong>.
              Click the link in the email to sign in.
            </p>
            <button
              style={{ ...styles.link, marginTop: 20 }}
              onClick={() => { setMagicSent(false); setEmail(""); }}
            >
              Use a different email
            </button>
          </div>
        ) : mode === "magic" ? (
          /* ── Magic link form ── */
          <form onSubmit={handleMagicLink} style={styles.form}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoFocus
            />
            <button
              type="submit"
              disabled={!email.trim() || sending}
              style={{
                ...styles.button,
                opacity: !email.trim() || sending ? 0.5 : 1,
              }}
            >
              {sending ? "Sending..." : "Send magic link"}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        ) : (
          /* ── Password form (signin / signup) ── */
          <form onSubmit={handlePasswordSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button
              type="submit"
              disabled={!email.trim() || !password || sending}
              style={{
                ...styles.button,
                opacity: !email.trim() || !password || sending ? 0.5 : 1,
              }}
            >
              {sending
                ? "Loading..."
                : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        )}

        {/* ── Mode switchers ── */}
        {!magicSent && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {mode === "magic" ? (
              <>
                <button style={styles.link} onClick={() => switchMode("signin")}>
                  Sign in with password instead
                </button>
                <button style={styles.link} onClick={() => switchMode("signup")}>
                  Don't have an account? Sign up
                </button>
              </>
            ) : mode === "signin" ? (
              <>
                <button style={styles.link} onClick={() => switchMode("magic")}>
                  Use magic link instead
                </button>
                <button style={styles.link} onClick={() => switchMode("signup")}>
                  Don't have an account? Sign up
                </button>
              </>
            ) : (
              <>
                <button style={styles.link} onClick={() => switchMode("magic")}>
                  Use magic link instead
                </button>
                <button style={styles.link} onClick={() => switchMode("signin")}>
                  Already have an account? Sign in
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    padding: "48px 40px",
    maxWidth: 400,
    width: "100%",
    textAlign: "center",
  },
  heading: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 12px",
  },
  text: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
    margin: "0 0 28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
  },
  button: {
    background: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 24px",
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
    cursor: "pointer",
  },
  error: {
    fontSize: 13,
    color: "#ff6b6b",
    margin: 0,
  },
  link: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    marginTop: 0,
  },
  sentBox: {
    padding: "20px 0",
  },
};
