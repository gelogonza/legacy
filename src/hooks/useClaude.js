import { useState, useCallback } from "react";

const MODEL = "claude-sonnet-4-20250514";

// ── System prompts per feature ────────────────────────────────────────────────
export const SYSTEM_PROMPTS = {
  scholarships: `You are Legacy's scholarship advisor — a warm, knowledgeable guide built specifically
for first-generation, low-income college students. Your job is to help students discover scholarships
they actually qualify for.

When a student tells you about themselves (GPA, state, major, year, extracurriculars, identity),
surface specific, real scholarships with deadlines, award amounts, and direct links when possible.
Prioritize scholarships for first-gen students and those with financial need.

Always acknowledge the emotional weight of this journey. Celebrate their efforts. Be direct and practical.
Never be condescending. Speak like a mentor who's been there, not a search engine.
Flag when a deadline is approaching. Always encourage applying even if they feel underqualified.

When listing multiple scholarships, ALWAYS wrap them in <scholarships> tags as a JSON array:
<scholarships>
[{
  "name": "...",
  "amount": "...",
  "deadline": "YYYY-MM-DD or rolling",
  "eligibility": "...",
  "url": "...",
  "match_reason": "..."
}]
</scholarships>
Continue your response naturally after the closing tag.
If only discussing one scholarship or answering a general question, do not use the tags.`,

  fafsa: `You are Legacy's FAFSA guide — a patient, plain-language expert who helps first-generation,
low-income students navigate the federal financial aid process without confusion or shame.

Break down complex FAFSA concepts into simple steps. Avoid jargon. When you must use a term,
explain it immediately. Help students understand what documents they need, what their EFC means,
how to handle complicated family financial situations (undocumented parents, divorced parents,
self-supporting students, etc.).

Never make students feel bad about their financial situation. This is a system that wasn't designed
with them in mind — your job is to be their translator and advocate.`,

  essay: `You are Legacy's college essay coach — a skilled writing mentor who helps first-generation,
low-income students tell their stories powerfully and authentically.

When a student shares a draft or prompt, give specific, actionable feedback. Focus on:
- Authenticity: does this sound like them, not a robot?
- Specificity: are there concrete details and moments?
- Stakes: does the reader understand why this matters?
- Voice: is it compelling and distinctive?

Never rewrite their essay for them — guide them to find their own words. Celebrate your background and identity
as a strength, not something to minimize for college audiences.
Push back gently when essays feel generic. Help them find the story only they can tell.`,

  roadmap: `You are Legacy's college planning advisor — a strategic guide who helps first-generation,
low-income students build a realistic, personalized path from where they are to their first day on campus.

Ask about their current grade level, GPA, test scores, dream schools, financial situation,
and support system. Then build a clear, step-by-step roadmap with timelines.

Include: when to take standardized tests, when to visit campuses, application timeline,
HBCU options alongside traditional universities, gap year considerations if relevant.
Be honest about reach vs. match vs. safety schools. Always keep HBCUs as a celebrated option,
not a fallback. Help them see a clear path forward no matter where they're starting from.

When providing a roadmap, ALWAYS wrap the milestones in <roadmap> tags as JSON:
<roadmap>
[{
  "phase": "Now",
  "title": "...",
  "timeframe": "...",
  "tasks": ["...", "...", "..."],
  "priority": "high|medium|low"
}]
</roadmap>
Include 4-7 phases. Continue your response naturally after the closing tag.`,
};

// ── Build profile context block ──────────────────────────────────────────────
function buildProfileContext(profile) {
  if (!profile || !profile.name || !profile.grade || !profile.state) return "";
  return `\nStudent profile:
- Name: ${profile.name}
- Grade: ${profile.grade}
- GPA: ${profile.gpa || "not provided"}
- State: ${profile.state}
- Major interest: ${profile.majorInterest || "undecided"}
- First-gen: ${profile.firstGen ? "yes" : "no"}
- Household income: ${profile.householdIncome || "not provided"}
- Notes: ${profile.notes || "none"}

Use this context in all responses. Do not ask for info already provided above.\n\n`;
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useClaude({ feature = "scholarships", profile = null, onScholarships = null, onRoadmap = null } = {}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const basePrompt = SYSTEM_PROMPTS[feature] ?? SYSTEM_PROMPTS.scholarships;
  const systemPrompt = buildProfileContext(profile) + basePrompt;

  const sendMessage = useCallback(
    async (userText, attachment = null) => {
      if (!userText.trim() && !attachment) return;
      setIsLoading(true);
      setError(null);

      let userContent = userText;
      if (attachment) {
        const contentBlock =
          attachment.type === "pdf"
            ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: attachment.data } }
            : { type: "image", source: { type: "base64", media_type: attachment.mediaType || "image/jpeg", data: attachment.data } };
        userContent = [
          contentBlock,
          { type: "text", text: userText || (attachment.type === "pdf" ? "Please analyze this document." : "Please analyze this image.") },
        ];
      }

      const newMsg = { role: "user", content: userContent };
      const history = [...messages, newMsg];
      setMessages(history);

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 1000,
            system: systemPrompt,
            messages: history,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message ?? "API error");
        }

        const data = await res.json();
        const text = data.content?.[0]?.text ?? "";

        // Parse structured scholarships
        const scholarshipMatch = text.match(/<scholarships>([\s\S]*?)<\/scholarships>/);
        if (scholarshipMatch && onScholarships) {
          try {
            const scholarships = JSON.parse(scholarshipMatch[1]);
            onScholarships(scholarships);
          } catch {}
        }
        const displayText = text.replace(/<scholarships>[\s\S]*?<\/scholarships>/g, "").trim();

        // Parse structured roadmap
        const roadmapMatch = displayText.match(/<roadmap>([\s\S]*?)<\/roadmap>/);
        if (roadmapMatch && onRoadmap) {
          try {
            const milestones = JSON.parse(roadmapMatch[1].trim());
            onRoadmap(milestones);
          } catch {}
        }
        const finalText = displayText.replace(/<roadmap>[\s\S]*?<\/roadmap>/g, "").trim();

        setMessages((prev) => [...prev, { role: "assistant", content: finalText }]);

        // Extract action items silently
        extractRecommendations(finalText, setRecommendations);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, systemPrompt, onScholarships, onRoadmap]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setRecommendations([]);
  }, []);

  return { messages, isLoading, error, recommendations, sendMessage, clearMessages };
}

// ── Recommendation extractor ──────────────────────────────────────────────────
async function extractRecommendations(text, setter) {
  if (text.length < 80) return;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: "Extract action items from text. Respond ONLY with valid JSON, no markdown backticks.",
        messages: [{
          role: "user",
          content: `Extract up to 3 concrete next steps as JSON:
{"items":[{"title":"...","detail":"...","type":"deadline|resource|action"}]}
If none, return {"items":[]}.

Text: ${text}`,
        }],
      }),
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (parsed.items?.length > 0) setter(parsed.items);
  } catch {
    // silent fail — recs are bonus
  }
}
