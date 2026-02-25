import { describe, expect, it } from "vitest";
import { createIngredientSchema, updateIngredientSchema } from "@/lib/schemas";

describe("inventory validation", () => {
  it("accepts valid ingredient create payload", () => {
    const parsed = createIngredientSchema.parse({
      name: "Milk",
      quantity: 2,
      unit: "bottles",
      expiresAt: "2026-03-01"
    });

    expect(parsed.name).toBe("Milk");
    expect(parsed.quantity).toBe(2);
    expect(parsed.expiresAt).toBeInstanceOf(Date);
  });

  it("rejects ingredient without positive quantity", () => {
    expect(() =>
      createIngredientSchema.parse({
        name: "Eggs",
        quantity: 0,
        unit: "pcs"
      })
    ).toThrow();
  });

  it("accepts partial ingredient updates", () => {
    const parsed = updateIngredientSchema.parse({ quantity: 4 });
    expect(parsed.quantity).toBe(4);
  });
});
