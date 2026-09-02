import { describe, expect, it } from "vitest";
import { createReportSchema } from "@/features/reports/schemas";

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
});

