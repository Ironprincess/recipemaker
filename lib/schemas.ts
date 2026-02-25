import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1).max(20),
  expiresAt: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : null))
    .refine((value) => value === null || !Number.isNaN(value.getTime()), {
      message: "expiresAt must be a valid date"
    }),
  category: z.string().max(50).optional().nullable()
});

export const updateIngredientSchema = createIngredientSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export const recipeRequestSchema = z.object({
  servings: z.coerce.number().int().min(1).max(12).optional().default(2),
  maxCookMinutes: z.coerce.number().int().min(5).max(240).optional(),
  dietaryNote: z.string().max(200).optional().default("")
});

export const recipeResponseSchema = z.object({
  title: z.string().min(1),
  estimatedMinutes: z.number().int().min(1),
  servings: z.number().int().min(1),
  ingredients: z.array(z.string().min(1)).min(1),
  steps: z.array(z.string().min(1)).min(1),
  tips: z.array(z.string()).default([])
});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
export type RecipeRequestInput = z.infer<typeof recipeRequestSchema>;
export type RecipeResponse = z.infer<typeof recipeResponseSchema>;
