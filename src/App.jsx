import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Tracker from "./pages/Tracker";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import "./tokens.css";

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return (
      <div style={{
        height: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}>
        {[0, 150, 300].map((delay) => (
          <span key={delay} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "rgba(255,255,255,0.4)",
            display: "inline-block",
            animation: `bounce 1.2s ${delay}ms infinite`,
          }} />
        ))}
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AuthCallback() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Implicit flow: Supabase redirects here with #access_token=...
    // The Supabase client auto-detects the hash and fires onAuthStateChange.
    // We wait for authLoading to resolve, then redirect.
    if (!authLoading) {
      navigate(user ? "/dashboard" : "/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  return null;
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/"             element={<Landing />} />
          <Route path="/scholarships" element={<ProtectedRoute><ChatPage feature="scholarships" /></ProtectedRoute>} />
          <Route path="/fafsa"        element={<ProtectedRoute><ChatPage feature="fafsa" /></ProtectedRoute>} />
          <Route path="/essay"        element={<ProtectedRoute><ChatPage feature="essay" /></ProtectedRoute>} />
          <Route path="/roadmap"      element={<ProtectedRoute><ChatPage feature="roadmap" /></ProtectedRoute>} />
          <Route path="/local"        element={<ProtectedRoute><ChatPage feature="local" /></ProtectedRoute>} />
          <Route path="/career"       element={<ProtectedRoute><ChatPage feature="career" /></ProtectedRoute>} />
          <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tracker"      element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
          <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
}
