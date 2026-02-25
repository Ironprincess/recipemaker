import type { Ingredient } from "@prisma/client";
import { recipeResponseSchema, type RecipeRequestInput, type RecipeResponse } from "@/lib/schemas";

export function buildRecipePrompt(inventory: Ingredient[], options: RecipeRequestInput): string {
  const inventoryLines = inventory
    .map((item) => {
      const expiry = item.expiresAt ? `, expires: ${item.expiresAt.toISOString().slice(0, 10)}` : "";
      return `- ${item.name}: ${item.quantity} ${item.unit}${expiry}`;
    })
    .join("\n");

  const constraints = [
    `Servings: ${options.servings}`,
    options.maxCookMinutes ? `Max cook time: ${options.maxCookMinutes} minutes` : "",
    options.dietaryNote ? `Dietary note: ${options.dietaryNote}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "You are a recipe assistant.",
    "Use only the inventory list where possible and prioritize ingredients expiring soonest.",
    "If one or two minor pantry basics are missing, you may mention them briefly.",
    "",
    "Inventory:",
    inventoryLines || "- No ingredients available",
    "",
    "Constraints:",
    constraints,
    "",
    "Return only strict JSON with this shape:",
    '{"title":"string","estimatedMinutes":number,"servings":number,"ingredients":["string"],"steps":["string"],"tips":["string"]}'
  ].join("\n");
}

export function parseRecipeResponse(rawText: string): RecipeResponse {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Claude did not return valid JSON");
  }

  const jsonText = rawText.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(jsonText);
  return recipeResponseSchema.parse(parsed);
}
