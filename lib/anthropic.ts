import Anthropic from "@anthropic-ai/sdk";
import type { Ingredient } from "@prisma/client";
import type { RecipeRequestInput, RecipeResponse } from "@/lib/schemas";
import { buildRecipePrompt, parseRecipeResponse } from "@/lib/recipe";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is missing");
  }
  return new Anthropic({ apiKey: key });
}

export async function generateRecipeWithClaude(
  inventory: Ingredient[],
  options: RecipeRequestInput
): Promise<RecipeResponse> {
  const client = getAnthropicClient();
  const prompt = buildRecipePrompt(inventory, options);
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;

  const response = await Promise.race([
    client.messages.create({
      model,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }]
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Claude request timed out")), 15000);
    })
  ]);

  const rawText = response.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("\n");

  return parseRecipeResponse(rawText);
}
