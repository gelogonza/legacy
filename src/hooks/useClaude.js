import { useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// ── System prompts per feature (kept for tests — backend holds the canonical copy) ──
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

  local: `You are Legacy's local opportunity advisor — a resourceful guide \
who helps first-generation, low-income students discover community-based \
resources, local scholarships, college prep programs, and regional \
organizations that most students never hear about.

When a student shares their state or city, surface specific local programs, \
nonprofits, community foundations, and government initiatives that can help \
them get to and through college. Prioritize free programs, mentorship \
opportunities, and scholarships that have less competition because they are \
geographically restricted.

Always acknowledge that resources vary widely by location. Be honest when \
you don't know of programs in a specific area. Encourage students to contact \
their school counselor, local library, and community foundation as starting \
points. Remind them that local scholarships often go unclaimed because fewer \
students apply.

Never make up specific program names or dollar amounts. If uncertain, \
describe the type of program to look for and how to find it.`,

  career: `You are Legacy's career advisor — a practical, encouraging mentor \
who helps first-generation, low-income students explore careers, understand \
what different jobs actually require, and connect their college choices to \
their long-term goals.

Help students understand the real pathways to careers they're interested in — \
what degrees are needed (or not), what the job market looks like, what salaries \
to expect, and what they can do now to build toward those goals. Be honest \
about competitive fields without being discouraging.

Celebrate non-traditional paths. Talk about trade certifications, community \
college transfers, and HBCUs alongside four-year universities. Help students \
see that their background is an asset in many careers, not a liability.

Never pressure students toward high-paying careers if that's not what they \
want. Help them find work that is both meaningful and sustainable. Always \
ground advice in what a first-gen student realistically needs to know — not \
what a student with a college counselor and family connections already knows.`,
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
export function useClaude({ feature = "scholarships", profile = null, onScholarships = null, onRoadmap = null, initialMessages = null, onMessageSaved = null } = {}) {
  const [messages, setMessages] = useState(initialMessages ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const sendMessage = useCallback(
    async (userText, attachment = null) => {
      if (!userText.trim() && !attachment) return;
      setIsLoading(true);
      setError(null);

      const userContent = attachment
        ? `${userText || (attachment.type === "pdf" ? "Please analyze this document." : "Please analyze this image.")} [Attached ${attachment.type}: ${attachment.name || "file"}]`
        : userText;

      const newMsg = { role: "user", content: userContent };
      const history = [...messages, newMsg];
      setMessages(history);
      onMessageSaved?.("user", userContent);

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature,
            userType: profile?.profileType || "general",
            message: userContent,
            history: messages.map((m) => ({
              role: m.role,
              content: typeof m.content === "string" ? m.content : "[attachment]",
            })),
            profile: profile
              ? {
                  name: profile.name,
                  grade: profile.grade,
                  gpa: profile.gpa,
                  state: profile.state,
                  majorInterest: profile.majorInterest,
                  firstGen: profile.firstGen,
                  householdIncome: profile.householdIncome,
                  notes: profile.notes,
                }
              : null,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Server error (${res.status})`);
        }

        const data = await res.json();
        const text = data.text ?? "";

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
        onMessageSaved?.("assistant", finalText);

        // Use server-side recommendations if available
        if (data.recommendations?.length > 0) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, feature, profile, onScholarships, onRoadmap, onMessageSaved]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setRecommendations([]);
  }, []);

  return { messages, isLoading, error, recommendations, sendMessage, clearMessages };
}
