import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useResources(category) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("resources")
        .select("*")
        .or(`category.eq.${category},category.eq.general`)
        .order("is_featured", { ascending: false });
      setResources(data || []);
      setLoading(false);
    }
    load();
  }, [category]);

  return { resources, loading };
}
