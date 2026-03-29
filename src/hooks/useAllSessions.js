import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAllSessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("chat_sessions")
        .select("id, feature, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(30);
      setSessions(data || []);
    }
    load();
  }, []);

  return { sessions };
}
