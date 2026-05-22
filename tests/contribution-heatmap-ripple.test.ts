import { describe, expect, test } from "vitest";
import { getCellResponse } from "@/components/ContributionHeatmap";

describe("ContributionHeatmap pointer ripple", () => {
  test("keeps the existing circular hover response when the pointer is nearly still", () => {
    const center = { weekIndex: 8, dayIndex: 3 };
    const response = getCellResponse(center, 9, 3);

    expect(response.energy).toBeGreaterThan(0);
    expect(response.offsetX).toBeGreaterThan(0);
    expect(Math.abs(response.offsetY)).toBe(0);
  });

  test("expands the ripple radius when pointer velocity is high", () => {
    const center = { weekIndex: 8, dayIndex: 3 };

    expect(getCellResponse(center, 11, 3).energy).toBe(0);
    expect(
      getCellResponse(center, 11, 3, {
        directionX: 1,
        directionY: 0,
        speed: 0.9,
        radius: 3.8,
        hasMotion: true,
      }).energy,
    ).toBeGreaterThan(0);
  });

  test("pushes cells sideways more than forward during directional pointer movement", () => {
    const center = { weekIndex: 8, dayIndex: 3 };
    const trend = {
      directionX: 1,
      directionY: 0,
      speed: 0.9,
      radius: 3.8,
      hasMotion: true,
    };

    const side = getCellResponse(center, 8, 5, trend);
    const front = getCellResponse(center, 10, 3, trend);

    expect(Math.abs(side.offsetY)).toBeGreaterThan(Math.abs(front.offsetY));
    expect(Math.abs(side.offsetY)).toBeGreaterThan(Math.abs(side.offsetX));
  });
});
