import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useClaude } from "../hooks/useClaude";
import { useProfile } from "../hooks/useProfile";
import ScholarshipCard from "../components/ScholarshipCard";
import RoadmapTimeline from "../components/RoadmapTimeline";
import { supabase } from "../lib/supabase";
import styles from "./ChatPage.module.css";

// ── Starter prompts per feature ───────────────────────────────────────────────
const STARTERS = {
  scholarships: [
    "I'm a first-gen student with a 3.4 GPA in Texas. What scholarships can I apply for?",
    "What scholarships exist specifically for first-gen students studying STEM?",
    "I need help finding scholarships with deadlines in the next 3 months.",
    "What are the biggest HBCU scholarships I should know about?",
  ],
  fafsa: [
    "I don't know where to start with FAFSA. Can you walk me through it?",
    "My parents are undocumented. How does that affect my financial aid?",
    "What does EFC mean and why does it matter?",
    "My parents are divorced. Whose income goes on the FAFSA?",
  ],
  essay: [
    "Can you give feedback on my Common App essay draft?",
    "I don't know what to write about. How do I find my essay topic?",
    "My essay feels generic. How do I make it more specific?",
    "How do I write about being first-gen without sounding like every other essay?",
  ],
  roadmap: [
    "I'm a junior in high school. What should I be doing right now for college?",
    "Help me make a realistic plan to get into a good school with a 3.0 GPA.",
    "What's the difference between applying to HBCUs vs. PWIs?",
    "I want to be a nurse. Help me build a college plan around that.",
  ],
  local: [
    "What college prep programs exist in my area for first-gen students?",
    "Are there any local scholarships or grants specific to my state?",
    "What community organizations help students like me pay for college?",
    "Are there any summer programs or internships I should apply for?",
  ],
  career: [
    "I want to be a nurse — what should I be doing in high school right now?",
    "What careers can I get into with a Computer Science degree?",
    "How do I figure out what to major in if I don't know what I want to do?",
    "What does a day in the life of an engineer actually look like?",
  ],
};

const FEATURE_META = {
  scholarships: { title: "Scholarship Matcher", icon: "🎓", color: "var(--orange)" },
  fafsa:        { title: "FAFSA Guide",         icon: "📋", color: "var(--green)" },
  essay:        { title: "Essay Coach",          icon: "✍️", color: "var(--amber)" },
  roadmap:      { title: "College Roadmap",      icon: "🗺️", color: "var(--green-light)" },
  local:        { title: "Local Opportunities", icon: "📍", color: "var(--green)" },
  career:       { title: "Career Advisor",      icon: "💼", color: "var(--amber)" },
};

export default function ChatPage({ feature }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null); // { data, type, mediaType, name }
  const [scholarships, setScholarships] = useState([]);
  const [roadmapMilestones, setRoadmapMilestones] = useState([]);
  const [autoStarted, setAutoStarted] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const meta = FEATURE_META[feature];
  const starters = STARTERS[feature] ?? [];

  const { profile, isProfileComplete } = useProfile();

  const handleScholarships = useCallback((results) => {
    setScholarships((prev) => [...prev, ...results]);
  }, []);

  const handleRoadmap = useCallback((milestones) => {
    setRoadmapMilestones(milestones);
  }, []);

  const saveScholarship = useCallback(async (scholarship) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("saved_scholarships")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", scholarship.name)
      .maybeSingle();

    if (existing) return;

    const { error } = await supabase.from("saved_scholarships").insert({
      user_id: user.id,
      name: scholarship.name,
      amount: scholarship.amount,
      deadline: scholarship.deadline,
      eligibility: scholarship.eligibility,
      url: scholarship.url,
      match_reason: scholarship.match_reason,
      status: "Not started",
    });
    if (error) console.error("saveScholarship error:", error.message);
  }, []);

  const { messages, isLoading, error, recommendations, sendMessage, clearMessages } = useClaude({
    feature,
    profile,
    onScholarships: feature === "scholarships" ? handleScholarships : null,
    onRoadmap: feature === "roadmap" ? handleRoadmap : null,
  });

  // Auto-send personalized opening message on mount
  useEffect(() => {
    if (!isProfileComplete || messages.length > 0) return;

    const openingMessages = {
      scholarships: `My name is ${profile.name}. I'm a ${profile.grade} student in ${profile.state}${profile.gpa ? ` with a ${profile.gpa} GPA` : ""}${profile.majorInterest ? `, interested in ${profile.majorInterest}` : ""}. What scholarships should I apply for?`,
      fafsa: `My name is ${profile.name}. I'm a ${profile.grade} student in ${profile.state} from a household income of ${profile.householdIncome || "not disclosed"}. I need help understanding FAFSA and what financial aid I might qualify for.`,
      essay: `My name is ${profile.name}. I'm a ${profile.grade} student in ${profile.state}${profile.majorInterest ? ` planning to study ${profile.majorInterest}` : ""}. I'm working on my college application essays and need help finding my story.`,
      roadmap: `My name is ${profile.name}. I'm a ${profile.grade} student in ${profile.state}${profile.gpa ? ` with a ${profile.gpa} GPA` : ""}${profile.majorInterest ? `, interested in ${profile.majorInterest}` : ""}. Can you build me a personalized college roadmap?`,
    };

    const msg = openingMessages[feature];
    if (msg) {
      setAutoStarted(true);
      const timer = setTimeout(() => sendMessage(msg), 600);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim() && !attachment) return;
    setInput("");
    await sendMessage(text.trim(), attachment);
    setAttachment(null);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFile = (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setAttachment({
        data: base64,
        type: isPdf ? "pdf" : "image",
        mediaType: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          ← Back
        </button>

        {!isProfileComplete && (
          <div
            className={styles.profileBanner}
            onClick={() => navigate("/profile")}
          >
            Complete your profile for personalized results →
          </div>
        )}

        <div className={styles.featureHeader}>
          <div className={styles.featureIcon} style={{ background: `${meta.color}22` }}>
            {meta.icon}
          </div>
          <h2 className={styles.featureTitle}>{meta.title}</h2>
        </div>

        {/* Action items */}
        {recommendations.length > 0 && (
          <div className={styles.recs}>
            <p className={styles.recsLabel}>Next steps</p>
            {recommendations.map((r, i) => (
              <div key={i} className={styles.recCard} style={{ borderLeftColor: meta.color }}>
                <span className={styles.recTitle}>{r.title}</span>
                <span className={styles.recDetail}>{r.detail}</span>
                <span className={styles.recType}>{r.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Scholarship matches */}
        {scholarships.length > 0 && (
          <div className={styles.recs}>
            <p className={styles.recsLabel}>Matches found</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scholarships.map((s, i) => (
                <ScholarshipCard key={s.name + i} scholarship={s} onSave={saveScholarship} />
              ))}
            </div>
          </div>
        )}

        {/* File upload */}
        <div className={styles.uploadSection}>
          <p className={styles.uploadLabel}>Upload a document or image</p>
          <div
            className={`${styles.dropZone} ${attachment ? styles.dropZoneFilled : ""}`}
            onClick={() => fileRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
          >
            {attachment
              ? attachment.type === "image"
                ? <img src={`data:${attachment.mediaType};base64,${attachment.data}`} alt="preview" className={styles.dropPreview} />
                : <span className={styles.dropHint} style={{ color: "var(--text)" }}>📄 {attachment.name}</span>
              : <span className={styles.dropHint}>Drop or click to upload</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
          {attachment && <p className={styles.imageReady}>✓ Ready — ask a question to analyze</p>}
        </div>

        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearMessages}>Clear conversation</button>
        )}
      </aside>

      {/* Chat */}
      <main className={styles.main}>
        <div className={styles.messages}>
          {messages.length === 0 && (
            autoStarted ? (
              <div className={styles.starters}>
                <p className={styles.startersLabel}>Personalizing your experience...</p>
                <div className={styles.thinking}><span /><span /><span /></div>
              </div>
            ) : (
              <div className={styles.starters}>
                <p className={styles.startersLabel}>Try asking:</p>
                <div className={styles.starterGrid}>
                  {starters.map((s, i) => (
                    <button key={i} className={styles.starterBtn} onClick={() => handleSend(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[`message_${msg.role}`]}`}>
              <span className={styles.messageLabel}>{msg.role === "user" ? "You" : "Legacy AI"}</span>
              <div className={styles.messageBubble}
                style={msg.role === "assistant" ? {} : { borderColor: meta.color }}>
                {Array.isArray(msg.content)
                  ? msg.content.map((b, j) =>
                      b.type === "text" ? <p key={j}>{b.text}</p>
                      : b.type === "image" ? <img key={j} src={`data:${b.source.media_type};base64,${b.source.data}`} alt="uploaded" className={styles.msgImage} />
                      : b.type === "document" ? <p key={j} style={{ fontSize: 12, color: "var(--text-50)" }}>📄 PDF attached</p>
                      : null
                    )
                  : msg.content.split("\n").map((line, j) => <p key={j}>{line}</p>)
                }
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.message_assistant}`}>
              <span className={styles.messageLabel}>Legacy AI</span>
              <div className={styles.messageBubble}>
                <div className={styles.thinking}><span /><span /><span /></div>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>⚠ {error}</div>}

          {roadmapMilestones.length > 0 && (
            <RoadmapTimeline milestones={roadmapMilestones} />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          {attachment && (
            <div className={styles.imagePreview}>
              {attachment.type === "image"
                ? <img src={`data:${attachment.mediaType};base64,${attachment.data}`} alt="preview" />
                : <span style={{ fontSize: 12, color: "var(--text-60)" }}>📄 {attachment.name}</span>
              }
              <button onClick={() => setAttachment(null)}>✕</button>
            </div>
          )}
          <div className={styles.inputRow}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything… (Shift+Enter for newline)"
              rows={2}
              className={styles.textarea}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && !attachment)}
              style={{ background: meta.color }}
            >
              {isLoading ? "…" : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
