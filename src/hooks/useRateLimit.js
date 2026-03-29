import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const DAILY_LIMIT = 20;

export function useRateLimit() {
  const [count, setCount] = useState(0);
  const [limitLoading, setLimitLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLimitLoading(false); return; }
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("rate_limits")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();
      setCount(data?.message_count ?? 0);
      setLimitLoading(false);
    }
    load();
  }, []);

  const increment = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("rate_limits")
      .upsert({ user_id: user.id, date: today, message_count: count + 1 },
               { onConflict: "user_id,date" })
      .select("message_count")
      .single();
    if (data) setCount(data.message_count);
  }, [count]);

  const isLimited = count >= DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - count);

  return { count, remaining, isLimited, limitLoading, increment };
}
