import { describe, expect, it } from "vitest";
import { isWithinPhilippines } from "@/lib/map/geography";

describe("isWithinPhilippines", () => {
  it("accepts representative Philippine coordinates", () => {
    expect(isWithinPhilippines(14.5995, 120.9842)).toBe(true);
    expect(isWithinPhilippines(10.3157, 123.8854)).toBe(true);
  });

  it("rejects coordinates outside the supported bounds", () => {
    expect(isWithinPhilippines(40.7128, -74.006)).toBe(false);
    expect(isWithinPhilippines(1.3521, 103.8198)).toBe(false);
  });
});
