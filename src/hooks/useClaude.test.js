import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPTS } from "./useClaude";

// ── System prompt content tests ──────────────────────────────────────────────
describe("SYSTEM_PROMPTS", () => {
  it("has all six feature prompts", () => {
    expect(SYSTEM_PROMPTS).toHaveProperty("scholarships");
    expect(SYSTEM_PROMPTS).toHaveProperty("fafsa");
    expect(SYSTEM_PROMPTS).toHaveProperty("essay");
    expect(SYSTEM_PROMPTS).toHaveProperty("roadmap");
    expect(SYSTEM_PROMPTS).toHaveProperty("local");
    expect(SYSTEM_PROMPTS).toHaveProperty("career");
  });

  it("scholarships prompt includes <scholarships> tag instructions", () => {
    expect(SYSTEM_PROMPTS.scholarships).toContain("<scholarships>");
    expect(SYSTEM_PROMPTS.scholarships).toContain("</scholarships>");
    expect(SYSTEM_PROMPTS.scholarships).toContain('"name"');
    expect(SYSTEM_PROMPTS.scholarships).toContain('"amount"');
    expect(SYSTEM_PROMPTS.scholarships).toContain('"deadline"');
  });

  it("roadmap prompt includes <roadmap> tag instructions", () => {
    expect(SYSTEM_PROMPTS.roadmap).toContain("<roadmap>");
    expect(SYSTEM_PROMPTS.roadmap).toContain("</roadmap>");
    expect(SYSTEM_PROMPTS.roadmap).toContain('"phase"');
    expect(SYSTEM_PROMPTS.roadmap).toContain('"tasks"');
    expect(SYSTEM_PROMPTS.roadmap).toContain('"priority"');
  });

  it("uses inclusive language — no 'Black students' references", () => {
    Object.values(SYSTEM_PROMPTS).forEach((prompt) => {
      expect(prompt).not.toContain("Black students");
      expect(prompt).not.toContain("first-generation Black");
    });
  });

  it("uses first-gen / low-income language", () => {
    Object.values(SYSTEM_PROMPTS).forEach((prompt) => {
      expect(prompt.toLowerCase()).toContain("first-generation");
    });
  });

  it("keeps HBCU references in roadmap", () => {
    expect(SYSTEM_PROMPTS.roadmap).toContain("HBCU");
  });

  it("local prompt warns against making up program names", () => {
    expect(SYSTEM_PROMPTS.local).toContain("Never make up");
  });

  it("career prompt mentions HBCUs", () => {
    expect(SYSTEM_PROMPTS.career).toContain("HBCU");
  });
});

// ── Scholarship parsing logic (extracted for unit testing) ───────────────────
describe("scholarship tag parsing", () => {
  const parseScholarships = (text) => {
    const match = text.match(/<scholarships>([\s\S]*?)<\/scholarships>/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch {
      return null;
    }
  };

  const stripScholarships = (text) =>
    text.replace(/<scholarships>[\s\S]*?<\/scholarships>/g, "").trim();

  it("extracts valid scholarship JSON from tags", () => {
    const text = `Here are some scholarships:
<scholarships>
[{"name":"Gates","amount":"$10,000","deadline":"2025-03-01","eligibility":"First-gen","url":"https://example.com","match_reason":"GPA match"}]
</scholarships>
Good luck applying!`;

    const result = parseScholarships(text);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Gates");
    expect(result[0].amount).toBe("$10,000");
  });

  it("returns null when no tags present", () => {
    expect(parseScholarships("Just a normal response")).toBeNull();
  });

  it("returns null for malformed JSON in tags", () => {
    expect(parseScholarships("<scholarships>NOT JSON</scholarships>")).toBeNull();
  });

  it("strips scholarship tags from display text", () => {
    const text = "Check these out:\n<scholarships>[{\"name\":\"Test\"}]</scholarships>\nGood luck!";
    const stripped = stripScholarships(text);
    expect(stripped).toBe("Check these out:\n\nGood luck!");
    expect(stripped).not.toContain("<scholarships>");
  });
});

// ── Roadmap parsing logic ────────────────────────────────────────────────────
describe("roadmap tag parsing", () => {
  const parseRoadmap = (text) => {
    const match = text.match(/<roadmap>([\s\S]*?)<\/roadmap>/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch {
      return null;
    }
  };

  const stripRoadmap = (text) =>
    text.replace(/<roadmap>[\s\S]*?<\/roadmap>/g, "").trim();

  it("extracts valid roadmap JSON from tags", () => {
    const text = `Here's your plan:
<roadmap>
[{"phase":"Now","title":"Research schools","timeframe":"This month","tasks":["Make a list","Visit websites"],"priority":"high"}]
</roadmap>
Let me know if you need help.`;

    const result = parseRoadmap(text);
    expect(result).toHaveLength(1);
    expect(result[0].phase).toBe("Now");
    expect(result[0].tasks).toHaveLength(2);
    expect(result[0].priority).toBe("high");
  });

  it("strips roadmap tags from display text", () => {
    const text = "Plan:\n<roadmap>[{\"phase\":\"Now\"}]</roadmap>\nGo!";
    expect(stripRoadmap(text)).toBe("Plan:\n\nGo!");
  });

  it("returns null for missing tags", () => {
    expect(parseRoadmap("No roadmap here")).toBeNull();
  });
});

// ── Profile context injection ────────────────────────────────────────────────
describe("profile context building", () => {
  // Replicate the buildProfileContext logic
  const buildProfileContext = (profile) => {
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
  };

  it("returns empty string when profile is null", () => {
    expect(buildProfileContext(null)).toBe("");
  });

  it("returns empty string when name is missing", () => {
    expect(buildProfileContext({ grade: "11th", state: "TX" })).toBe("");
  });

  it("returns empty string when grade is missing", () => {
    expect(buildProfileContext({ name: "Alex", state: "TX" })).toBe("");
  });

  it("returns empty string when state is missing", () => {
    expect(buildProfileContext({ name: "Alex", grade: "11th" })).toBe("");
  });

  it("builds context with all required fields", () => {
    const ctx = buildProfileContext({
      name: "Alex",
      grade: "11th",
      state: "Texas",
      gpa: "3.4",
      majorInterest: "CS",
      firstGen: true,
      householdIncome: "under25k",
      notes: "Plays soccer",
    });

    expect(ctx).toContain("Name: Alex");
    expect(ctx).toContain("Grade: 11th");
    expect(ctx).toContain("State: Texas");
    expect(ctx).toContain("GPA: 3.4");
    expect(ctx).toContain("Major interest: CS");
    expect(ctx).toContain("First-gen: yes");
    expect(ctx).toContain("Household income: under25k");
    expect(ctx).toContain("Notes: Plays soccer");
  });

  it("uses defaults for optional fields", () => {
    const ctx = buildProfileContext({ name: "Alex", grade: "11th", state: "TX" });
    expect(ctx).toContain("GPA: not provided");
    expect(ctx).toContain("Major interest: undecided");
    expect(ctx).toContain("Household income: not provided");
    expect(ctx).toContain("Notes: none");
  });
});
