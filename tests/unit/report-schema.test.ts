import { describe, expect, it } from "vitest";
import { createReportSchema, draftReportSchema, reportFiltersSchema } from "@/features/reports/schemas";

const validReport = {
  categoryId: "streetlight-category",
  title: "Broken streetlight",
  description: "The streetlight has been off for three consecutive nights.",
  address: "Mabini Street near the covered court",
  latitude: 14.5995,
  longitude: 120.9842,
  saveAsDraft: false,
};

describe("createReportSchema", () => {
  it("accepts a complete community report", () => {
    expect(createReportSchema.safeParse(validReport).success).toBe(true);
  });

  it("trims user-entered text", () => {
    const result = createReportSchema.parse({
      ...validReport,
      title: "  Broken streetlight  ",
    });

    expect(result.title).toBe("Broken streetlight");
  });

  it("rejects coordinates outside geographic bounds", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      latitude: 91,
    });

    expect(result.success).toBe(false);
  });

  it("rejects descriptions that do not give responders enough detail", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      description: "Broken light",
    });

    expect(result.success).toBe(false);
  });

  it("allows an incomplete description and location in a draft", () => {
    expect(draftReportSchema.safeParse({ ...validReport, description: "", address: "", saveAsDraft: true }).success).toBe(true);
  });

  it("requires a selected map location for submission", () => {
    expect(createReportSchema.safeParse({ ...validReport, latitude: null, longitude: null }).success).toBe(false);
  });

  it("rejects submitted coordinates outside the Philippines", () => {
    expect(createReportSchema.safeParse({ ...validReport, latitude: 40.7128, longitude: -74.006 }).success).toBe(false);
  });
});

describe("reportFiltersSchema", () => {
  it("normalizes a report search and accepts a supported status", () => {
    expect(reportFiltersSchema.parse({ q: "  streetlight  ", status: "IN_PROGRESS" })).toEqual({
      q: "streetlight",
      status: "IN_PROGRESS",
    });
  });

  it("ignores an unsupported status from the URL", () => {
    expect(reportFiltersSchema.parse({ q: "", status: "UNKNOWN" })).toEqual({
      q: "",
      status: undefined,
    });
  });
});
