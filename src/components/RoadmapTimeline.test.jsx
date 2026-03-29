import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RoadmapTimeline from "./RoadmapTimeline";

const mockMilestones = [
  {
    phase: "Now",
    title: "Research Schools",
    timeframe: "This month",
    tasks: ["Make a list of schools", "Visit school websites"],
    priority: "high",
  },
  {
    phase: "3 Months",
    title: "Prepare Applications",
    timeframe: "January - March",
    tasks: ["Write personal statement", "Get recommendation letters", "Fill out Common App"],
    priority: "medium",
  },
  {
    phase: "6 Months",
    title: "Submit & Wait",
    timeframe: "April - June",
    tasks: ["Submit applications"],
    priority: "low",
  },
];

describe("RoadmapTimeline", () => {
  // ── Rendering ───────────────────────────────────────────────────────────
  it("renders nothing when milestones is empty", () => {
    const { container } = render(<RoadmapTimeline milestones={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when milestones is null", () => {
    const { container } = render(<RoadmapTimeline milestones={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all milestone titles", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    expect(screen.getByText("Research Schools")).toBeInTheDocument();
    expect(screen.getByText("Prepare Applications")).toBeInTheDocument();
    expect(screen.getByText("Submit & Wait")).toBeInTheDocument();
  });

  it("renders phase labels", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("3 Months")).toBeInTheDocument();
    expect(screen.getByText("6 Months")).toBeInTheDocument();
  });

  it("renders timeframes", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByText("January - March")).toBeInTheDocument();
  });

  it("renders all tasks across all milestones", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    expect(screen.getByText("Make a list of schools")).toBeInTheDocument();
    expect(screen.getByText("Write personal statement")).toBeInTheDocument();
    expect(screen.getByText("Submit applications")).toBeInTheDocument();
  });

  // ── Checkbox interaction ────────────────────────────────────────────────
  it("tasks start unchecked", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    const task = screen.getByText("Make a list of schools");
    expect(task).not.toHaveClass("taskTextChecked");
  });

  it("clicking a task toggles strikethrough", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    const task = screen.getByText("Make a list of schools");

    // Click to check
    fireEvent.click(task);
    expect(task).toHaveClass("taskTextChecked");

    // Click to uncheck
    fireEvent.click(task);
    expect(task).not.toHaveClass("taskTextChecked");
  });

  it("checking one task does not affect others", () => {
    render(<RoadmapTimeline milestones={mockMilestones} />);
    const task1 = screen.getByText("Make a list of schools");
    const task2 = screen.getByText("Visit school websites");

    fireEvent.click(task1);
    expect(task1).toHaveClass("taskTextChecked");
    expect(task2).not.toHaveClass("taskTextChecked");
  });

  // ── Milestone without tasks ─────────────────────────────────────────────
  it("renders milestone with no tasks", () => {
    const noTasks = [{ phase: "Now", title: "Start", timeframe: "Today", tasks: [], priority: "high" }];
    render(<RoadmapTimeline milestones={noTasks} />);
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("renders milestone with missing tasks field", () => {
    const noTasks = [{ phase: "Now", title: "Start", timeframe: "Today", priority: "high" }];
    render(<RoadmapTimeline milestones={noTasks} />);
    expect(screen.getByText("Start")).toBeInTheDocument();
  });
});
