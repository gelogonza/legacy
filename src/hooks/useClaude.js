import { useState, useCallback } from "react";

export const SYSTEM_PROMPTS = {}; // prompts now live server-side in FeatureType.java

function getUserType(profile) {
  const grade = profile?.grade ?? "";
  if (["9th", "10th", "11th", "12th"].includes(grade)) return "HIGH_SCHOOL";
  if (grade === "College") return "COLLEGE";
  if (grade === "Returning") return "RETURNING";
  return "GENERAL";
}

export function useClaude({ feature = "scholarships", profile = null, onScholarships = null, onRoadmap = null } = {}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const sendMessage = useCallback(
    async (userText) => {
      if (!userText?.trim()) return;
      setIsLoading(true);
      setError(null);

      const newMsg = { role: "user", content: userText };
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, newMsg]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature,
            userType: getUserType(profile),
            message: userText,
            history,
            profile: profile || null,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `Server error ${res.status}`);
        }

        const data = await res.json();
        const text = data.text ?? "";

        // Parse <scholarships> tags
        if (onScholarships) {
          const match = text.match(/<scholarships>([\s\S]*?)<\/scholarships>/);
          if (match) {
            try { onScholarships(JSON.parse(match[1])); } catch {}
          }
        }

        // Parse <roadmap> tags
        if (onRoadmap) {
          const match = text.match(/<roadmap>([\s\S]*?)<\/roadmap>/);
          if (match) {
            try { onRoadmap(JSON.parse(match[1])); } catch {}
          }
        }

        const displayText = text
          .replace(/<scholarships>[\s\S]*?<\/scholarships>/g, "")
          .replace(/<roadmap>[\s\S]*?<\/roadmap>/g, "")
          .trim();

        setMessages((prev) => [...prev, { role: "assistant", content: displayText }]);

        if (data.recommendations?.length > 0) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, feature, profile, onScholarships, onRoadmap]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setRecommendations([]);
  }, []);

  return { messages, isLoading, error, recommendations, sendMessage, clearMessages };
}
