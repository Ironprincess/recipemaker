import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createIngredientSchema } from "@/lib/schemas";
import { jsonError } from "@/lib/http";

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: [{ expiresAt: "asc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ ingredients });
}

export async function POST(request: Request) {
  try {
    const payload = createIngredientSchema.parse(await request.json());
    const ingredient = await prisma.ingredient.create({
      data: {
        name: payload.name.trim(),
        quantity: payload.quantity,
        unit: payload.unit.trim(),
        category: payload.category ? payload.category.trim() : null,
        expiresAt: payload.expiresAt
      }
    });

    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid ingredient payload", 422);
    }
    return jsonError("Failed to create ingredient", 500);
  }
}
