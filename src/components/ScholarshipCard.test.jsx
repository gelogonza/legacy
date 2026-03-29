import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ScholarshipCard from "./ScholarshipCard";

const mockScholarship = {
  name: "Gates Millennium Scholarship",
  amount: "$10,000",
  deadline: "2099-12-31",
  eligibility: "First-gen, low-income students",
  url: "https://example.com/apply",
  match_reason: "Matches your GPA and state",
};

describe("ScholarshipCard", () => {
  // ── Rendering ───────────────────────────────────────────────────────────
  it("renders scholarship name", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    expect(screen.getByText("Gates Millennium Scholarship")).toBeInTheDocument();
  });

  it("renders amount", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    expect(screen.getByText("$10,000")).toBeInTheDocument();
  });

  it("renders eligibility", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    expect(screen.getByText("First-gen, low-income students")).toBeInTheDocument();
  });

  it("renders match reason", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    expect(screen.getByText("Matches your GPA and state")).toBeInTheDocument();
  });

  it("renders apply link with correct href", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    const link = screen.getByText(/View scholarship/);
    expect(link).toHaveAttribute("href", "https://example.com/apply");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not render link when url is '...'", () => {
    render(<ScholarshipCard scholarship={{ ...mockScholarship, url: "..." }} />);
    expect(screen.queryByText(/View scholarship/)).not.toBeInTheDocument();
  });

  it("does not render link when url is missing", () => {
    const { url, ...noUrl } = mockScholarship;
    render(<ScholarshipCard scholarship={noUrl} />);
    expect(screen.queryByText(/View scholarship/)).not.toBeInTheDocument();
  });

  // ── Deadline badge ──────────────────────────────────────────────────────
  it("shows 'Rolling' for rolling deadlines", () => {
    render(<ScholarshipCard scholarship={{ ...mockScholarship, deadline: "rolling" }} />);
    expect(screen.getByText("Rolling")).toBeInTheDocument();
  });

  it("shows 'Rolling' for undefined deadline", () => {
    const { deadline, ...noDeadline } = mockScholarship;
    render(<ScholarshipCard scholarship={noDeadline} />);
    expect(screen.getByText("Rolling")).toBeInTheDocument();
  });

  it("shows 'Passed' for past deadlines", () => {
    render(<ScholarshipCard scholarship={{ ...mockScholarship, deadline: "2020-01-01" }} />);
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });

  it("shows days left for future deadlines", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    expect(screen.getByText(/days left/)).toBeInTheDocument();
  });

  // ── Save button ─────────────────────────────────────────────────────────
  it("shows Save button when onSave is provided and showSave is true", () => {
    const onSave = vi.fn();
    render(<ScholarshipCard scholarship={mockScholarship} onSave={onSave} showSave={true} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls onSave with scholarship when Save is clicked", () => {
    const onSave = vi.fn();
    render(<ScholarshipCard scholarship={mockScholarship} onSave={onSave} />);
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith(mockScholarship);
  });

  it("hides Save button when showSave is false", () => {
    const onSave = vi.fn();
    render(<ScholarshipCard scholarship={mockScholarship} onSave={onSave} showSave={false} />);
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  // ── Remove button ───────────────────────────────────────────────────────
  it("shows Remove button when onRemove is provided", () => {
    const onRemove = vi.fn();
    render(<ScholarshipCard scholarship={mockScholarship} onRemove={onRemove} />);
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("calls onRemove with scholarship when Remove is clicked", () => {
    const onRemove = vi.fn();
    render(<ScholarshipCard scholarship={mockScholarship} onRemove={onRemove} />);
    fireEvent.click(screen.getByText("Remove"));
    expect(onRemove).toHaveBeenCalledWith(mockScholarship);
  });

  it("does not show Remove button when onRemove is not provided", () => {
    render(<ScholarshipCard scholarship={mockScholarship} />);
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });
});
