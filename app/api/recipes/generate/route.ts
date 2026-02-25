import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recipeRequestSchema } from "@/lib/schemas";
import { generateRecipeWithClaude } from "@/lib/anthropic";
import { isRateLimited } from "@/lib/rate-limit";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (isRateLimited(ip, 8)) {
      return jsonError("Too many recipe requests. Please wait a minute.", 429);
    }

    const options = recipeRequestSchema.parse(await request.json());
    const inventory = await prisma.ingredient.findMany({
      orderBy: [{ expiresAt: "asc" }, { updatedAt: "desc" }]
    });

    if (inventory.length === 0) {
      return jsonError("Your fridge is empty. Add ingredients first.", 400);
    }

    const recipe = await generateRecipeWithClaude(inventory, options);
    return NextResponse.json({ recipe });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid recipe request", 422);
    }
    return jsonError(error instanceof Error ? error.message : "Failed to generate recipe", 500);
  }
}
