import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useClaude } from "../hooks/useClaude";
import { useProfile } from "../hooks/useProfile";
import ScholarshipCard from "../components/ScholarshipCard";
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
};

const FEATURE_META = {
  scholarships: { title: "Scholarship Matcher", icon: "🎓", color: "var(--orange)" },
  fafsa:        { title: "FAFSA Guide",         icon: "📋", color: "var(--green)" },
  essay:        { title: "Essay Coach",          icon: "✍️", color: "var(--amber)" },
  roadmap:      { title: "College Roadmap",      icon: "🗺️", color: "var(--green-light)" },
};

const SAVED_KEY = "legacy_saved_scholarships";

export default function ChatPage({ feature }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const meta = FEATURE_META[feature];
  const starters = STARTERS[feature] ?? [];

  const { profile } = useProfile();

  const handleScholarships = useCallback((results) => {
    setScholarships((prev) => [...prev, ...results]);
  }, []);

  const saveScholarship = useCallback((scholarship) => {
    try {
      const existing = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (!existing.some((s) => s.name === scholarship.name)) {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...existing, scholarship]));
      }
    } catch {}
  }, []);

  const { messages, isLoading, error, recommendations, sendMessage, clearMessages } = useClaude({
    feature,
    profile,
    onScholarships: feature === "scholarships" ? handleScholarships : null,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim() && !image) return;
    setInput("");
    await sendMessage(text.trim(), image);
    setImage(null);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          ← Back
        </button>

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

        {/* Image upload */}
        <div className={styles.uploadSection}>
          <p className={styles.uploadLabel}>Upload a document or image</p>
          <div
            className={`${styles.dropZone} ${image ? styles.dropZoneFilled : ""}`}
            onClick={() => fileRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
          >
            {image
              ? <img src={`data:image/jpeg;base64,${image}`} alt="preview" className={styles.dropPreview} />
              : <span className={styles.dropHint}>Drop or click to upload</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
          {image && <p className={styles.imageReady}>✓ Ready — ask a question to analyze</p>}
        </div>

        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearMessages}>Clear conversation</button>
        )}
      </aside>

      {/* Chat */}
      <main className={styles.main}>
        <div className={styles.messages}>
          {messages.length === 0 && (
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
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[`message_${msg.role}`]}`}>
              <span className={styles.messageLabel}>{msg.role === "user" ? "You" : "Legacy AI"}</span>
              <div className={styles.messageBubble}
                style={msg.role === "assistant" ? {} : { borderColor: meta.color }}>
                {Array.isArray(msg.content)
                  ? msg.content.map((b, j) =>
                      b.type === "text" ? <p key={j}>{b.text}</p>
                      : b.type === "image" ? <img key={j} src={`data:image/jpeg;base64,${b.source.data}`} alt="uploaded" className={styles.msgImage} />
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
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          {image && (
            <div className={styles.imagePreview}>
              <img src={`data:image/jpeg;base64,${image}`} alt="preview" />
              <button onClick={() => setImage(null)}>✕</button>
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
              disabled={isLoading || (!input.trim() && !image)}
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
