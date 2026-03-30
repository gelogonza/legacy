import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useChatHistory(feature) {
  const [sessionId, setSessionId] = useState(null);
  const [savedMessages, setSavedMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    async function loadOrCreateSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHistoryLoading(false); return; }

      // Find most recent session for this feature
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("feature", feature)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      let sid;
      if (existing) {
        sid = existing.id;
        // Load messages for this session
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("session_id", sid)
          .order("created_at", { ascending: true });
        setSavedMessages(msgs || []);
      } else {
        // Create new session
        const { data: newSession } = await supabase
          .from("chat_sessions")
          .insert({ user_id: user.id, feature, title: null })
          .select("id")
          .single();
        sid = newSession?.id;
      }
      setSessionId(sid);
      setHistoryLoading(false);
    }
    loadOrCreateSession();
  }, [feature]);

  const saveMessage = useCallback(async (role, content) => {
    if (!sessionId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content: typeof content === "string" ? content : JSON.stringify(content),
    });

    // Update session timestamp and auto-title from first user message
    const updates = { updated_at: new Date().toISOString() };
    if (role === "user" && typeof content === "string") {
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("title")
        .eq("id", sessionId)
        .single();
      if (!existing?.title) {
        updates.title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
      }
    }
    await supabase.from("chat_sessions")
      .update(updates)
      .eq("id", sessionId);
  }, [sessionId]);

  const startNewSession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, feature, title: null })
      .select("id")
      .single();
    if (data) {
      setSessionId(data.id);
      setSavedMessages([]);
    }
  }, [feature]);

  return { sessionId, savedMessages, historyLoading, saveMessage, startNewSession };
}
