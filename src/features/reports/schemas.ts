import { z } from "zod";
import { isWithinPhilippines } from "@/lib/map/geography";

const reportFields = z.object({
  categoryId: z.string().trim().min(1, "Choose an issue category."),
  title: z.string().trim().min(8, "Use at least 8 characters.").max(100),
  description: z.string().trim().min(20, "Add enough detail for the response team.").max(1000),
  address: z.string().trim().min(5, "Enter a recognizable location.").max(240),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  saveAsDraft: z.boolean().default(false),
});

export const createReportSchema = reportFields.superRefine((report, context) => {
  if (report.latitude == null || report.longitude == null) {
    context.addIssue({ code: "custom", path: ["address"], message: "Search for and select a location on the map." });
    return;
  }
  if (!isWithinPhilippines(report.latitude, report.longitude)) {
    context.addIssue({ code: "custom", path: ["address"], message: "Choose a location within the Philippines." });
  }
});

export const draftReportSchema = reportFields.extend({
  title: z.string().trim().min(3, "Use at least 3 characters.").max(100),
  description: z.string().trim().max(1000),
  address: z.string().trim().max(240),
});

export const staffTransitionSchema = z.object({
  reportId: z.string().trim().min(1),
  transition: z.enum(["verify", "reject", "assign", "start", "resolve"]),
  note: z.string().trim().max(500).optional(),
  assignedTeamId: z.string().trim().optional(),
  assignedStaffId: z.string().trim().optional(),
});

export const reportFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  status: z.enum(["DRAFT", "SUBMITTED", "VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CANCELLED"]).optional().catch(undefined),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
