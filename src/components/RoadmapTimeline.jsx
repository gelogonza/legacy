import { useState } from "react";
import styles from "./RoadmapTimeline.module.css";

const PRIORITY_COLORS = {
  high:   "#0077b6",
  medium: "#0096c7",
  low:    "#48cae4",
};

export default function RoadmapTimeline({ milestones }) {
  const [checked, setChecked] = useState({});

  const toggle = (phaseIdx, taskIdx) => {
    const key = `${phaseIdx}-${taskIdx}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!milestones || milestones.length === 0) return null;

  return (
    <div className={styles.container}>
      {milestones.map((m, pi) => {
        const color = PRIORITY_COLORS[m.priority] || PRIORITY_COLORS.medium;
        const isLast = pi === milestones.length - 1;

        return (
          <div key={pi} className={styles.milestone}>
            {/* Rail */}
            <div className={styles.rail}>
              <div
                className={styles.dot}
                style={{ borderColor: color, backgroundColor: pi === 0 ? color : undefined }}
              />
              {!isLast && <div className={styles.line} style={{ background: color }} />}
            </div>

            {/* Card */}
            <div className={styles.card}>
              <div className={styles.phase} style={{ color }}>
                {m.phase}
              </div>
              <div className={styles.title}>{m.title}</div>
              {m.timeframe && (
                <div className={styles.timeframe}>{m.timeframe}</div>
              )}

              {m.tasks && m.tasks.length > 0 && (
                <div className={styles.tasks}>
                  {m.tasks.map((task, ti) => {
                    const key = `${pi}-${ti}`;
                    const isChecked = !!checked[key];

                    return (
                      <div
                        key={ti}
                        className={styles.task}
                        onClick={() => toggle(pi, ti)}
                      >
                        <div
                          className={`${styles.taskCheckbox} ${isChecked ? styles.taskCheckboxChecked : ""}`}
                        >
                          {isChecked && <span className={styles.checkmark}>✓</span>}
                        </div>
                        <span
                          className={`${styles.taskText} ${isChecked ? styles.taskTextChecked : ""}`}
                        >
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
