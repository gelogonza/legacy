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
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
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
    // onAuthStateChange in useAuth will pick up the session
    // and the useEffect above will redirect to /
  };

  const toggleMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
  };

  return (
    <div style={styles.page}>
      <SkyBackground />
      <div style={styles.card}>
        <h1 style={styles.heading}>
          {mode === "signin" ? "Sign in to Legacy" : "Create your account"}
        </h1>
        <p style={styles.text}>
          {mode === "signin"
            ? "Enter your email and password."
            : "Sign up to start your college journey."}
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
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
        <button style={styles.link} onClick={toggleMode}>
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
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
    marginTop: 16,
  },
};
