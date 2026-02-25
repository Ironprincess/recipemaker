# Recipe History + Meal Planner Implementation Plan

## Scope

Add two production-ready features to the current app:
- persist generated recipes into database history
- add a meal planner view to schedule saved recipes by date

## Backend Changes

1. Extend Prisma schema:
   - `RecipeHistory` model to store generated recipe JSON + metadata
   - `MealPlanEntry` model to store scheduled date, meal type, and linked recipe
2. Persist generated recipe in `/api/recipes/generate` after successful Claude response
3. Add `GET /api/recipes/history` to fetch recent generated recipes
4. Add meal planner APIs:
   - `GET /api/meal-planner` (list entries by date)
   - `POST /api/meal-planner` (create entry)
   - `DELETE /api/meal-planner/:id` (remove entry)
5. Validate all inputs with `zod`

## Frontend Changes

1. Add Recipe History section:
   - list past generated recipes
   - include quick info (title, servings, minutes, created date)
2. Add Meal Planner section:
   - date picker + meal type selector + recipe selector
   - save planned meal
   - display upcoming planned meals in sorted order
   - allow entry deletion
3. Keep current inventory and recipe generation flow unchanged

## Data Flow

1. User generates recipe from current inventory
2. Backend calls Claude and validates response
3. Backend stores response in `RecipeHistory`
4. UI refreshes current recipe + history list
5. User schedules any saved recipe into planner entries

## Delivery Steps

1. Update schema + types
2. Add/extend route handlers
3. Wire UI for history and planner
4. Update tests and docs
