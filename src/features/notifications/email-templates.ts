import type { NotificationType } from "@prisma/client";

type ReportEmailInput = {
  type: NotificationType;
  recipientName: string;
  reportPublicId: string;
  reportTitle: string;
  detail: string;
  appUrl: string;
};

const headings: Record<NotificationType, string> = {
  REPORT_SUBMITTED: "We received your report",
  REPORT_VERIFIED: "Your report was verified",
  REPORT_ASSIGNED: "A response team was assigned",
  REPORT_UPDATED: "Your report has an update",
  REPORT_RESOLVED: "Your report was resolved",
  REPORT_REJECTED: "Your report could not be verified",
};

export function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function reportUpdateEmail(input: ReportEmailInput) {
  const heading = headings[input.type];
  const reportUrl = new URL(`/reports/${encodeURIComponent(input.reportPublicId)}`, input.appUrl).toString();
  const subject = `${heading} · ${input.reportPublicId}`;
  const text = `${heading}\n\nHello ${input.recipientName},\n\n${input.reportTitle}\n${input.detail}\n\nView report: ${reportUrl}\n\nAgapay`;
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#f7f8f3;color:#17362f;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:32px 20px"><div style="font-size:22px;font-weight:700;color:#19765b">Agapay</div><div style="margin-top:24px;background:#fff;border:1px solid #dfe5dc;border-radius:20px;padding:28px"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#19765b">${escapeHtml(input.reportPublicId)}</p><h1 style="margin:0 0 20px;font-size:26px">${escapeHtml(heading)}</h1><p>Hello ${escapeHtml(input.recipientName)},</p><p><strong>${escapeHtml(input.reportTitle)}</strong></p><p style="line-height:1.6;color:#66756f">${escapeHtml(input.detail)}</p><a href="${escapeHtml(reportUrl)}" style="display:inline-block;margin-top:12px;border-radius:999px;background:#19765b;padding:12px 20px;color:#fff;text-decoration:none;font-weight:700">View report</a></div><p style="margin-top:20px;font-size:12px;color:#66756f">You received this service update because you submitted this report through Agapay.</p></div></body></html>`;
  return { subject, text, html };
}
