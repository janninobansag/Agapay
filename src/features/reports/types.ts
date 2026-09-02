export type ReportStatus =
  | "Draft"
  | "Submitted"
  | "Verified"
  | "In Progress"
  | "Resolved"
  | "Rejected";

export type ReportSummary = {
  id: string;
  title: string;
  category: string;
  location: string;
  submittedAt: string;
  status: ReportStatus;
};
