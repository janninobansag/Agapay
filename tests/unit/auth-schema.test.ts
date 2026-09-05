import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";

describe("authentication schemas", () => {
  it("normalizes email addresses during sign in", () => {
    const result = signInSchema.parse({
      email: "  Resident@Agapay.Local ",
      password: "AgapayDemo123!",
    });

    expect(result.email).toBe("resident@agapay.local");
  });

  it("requires a strong registration password", () => {
    const result = signUpSchema.safeParse({
      name: "New Resident",
      email: "resident@example.com",
      password: "weak-password",
      confirmPassword: "weak-password",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a strong eight-character registration password", () => {
    const result = signUpSchema.safeParse({
      name: "New Resident",
      email: "resident@example.com",
      password: "Strong8A",
      confirmPassword: "Strong8A",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a strong password shorter than eight characters", () => {
    const result = signUpSchema.safeParse({
      name: "New Resident",
      email: "resident@example.com",
      password: "Short1A",
      confirmPassword: "Short1A",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched registration passwords", () => {
    const result = signUpSchema.safeParse({
      name: "New Resident",
      email: "resident@example.com",
      password: "SecurePassword123",
      confirmPassword: "DifferentPassword123",
    });

    expect(result.success).toBe(false);
  });
});
