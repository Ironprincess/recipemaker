import { describe, expect, it } from "vitest";
import { parseRecipeResponse } from "@/lib/recipe";

describe("recipe response parsing", () => {
  it("parses a valid JSON recipe payload", () => {
    const recipe = parseRecipeResponse(
      JSON.stringify({
        title: "Tomato Egg Scramble",
        estimatedMinutes: 15,
        servings: 2,
        ingredients: ["2 eggs", "1 tomato", "salt"],
        steps: ["Beat eggs", "Cook tomato", "Add eggs and scramble"],
        tips: ["Serve with toast"]
      })
    );

    expect(recipe.title).toBe("Tomato Egg Scramble");
    expect(recipe.steps).toHaveLength(3);
  });

  it("rejects payloads with missing required fields", () => {
    expect(() =>
      parseRecipeResponse(
        JSON.stringify({
          title: "Broken Recipe",
          servings: 2
        })
      )
    ).toThrow();
  });
});
