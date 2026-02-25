import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateIngredientSchema } from "@/lib/schemas";
import { jsonError } from "@/lib/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = updateIngredientSchema.parse(await request.json());
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name: payload.name?.trim(),
        quantity: payload.quantity,
        unit: payload.unit?.trim(),
        category: payload.category === undefined ? undefined : payload.category?.trim() ?? null,
        expiresAt: payload.expiresAt === undefined ? undefined : payload.expiresAt
      }
    });

    return NextResponse.json({ ingredient });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid update payload", 422);
    }
    return jsonError("Failed to update ingredient", 500);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.ingredient.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Failed to delete ingredient", 500);
  }
}
