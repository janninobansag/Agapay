import { describe, expect, it } from "vitest";
import { reportUpdateEmail } from "@/features/notifications/email-templates";

describe("reportUpdateEmail", () => {
  it("renders text and HTML versions with a report link", () => {
    const email = reportUpdateEmail({ type: "REPORT_RESOLVED", recipientName: "Juan", reportPublicId: "AGP-1000", reportTitle: "Broken light", detail: "The light was replaced.", appUrl: "https://agapay.example" });
    expect(email.subject).toContain("AGP-1000");
    expect(email.text).toContain("https://agapay.example/reports/AGP-1000");
    expect(email.html).toContain("View report");
  });

  it("escapes user-controlled HTML", () => {
    const email = reportUpdateEmail({ type: "REPORT_UPDATED", recipientName: "<script>alert(1)</script>", reportPublicId: "AGP-1001", reportTitle: "A & B", detail: "<b>unsafe</b>", appUrl: "https://agapay.example" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;b&gt;unsafe&lt;/b&gt;");
    expect(email.html).toContain("A &amp; B");
  });
});
