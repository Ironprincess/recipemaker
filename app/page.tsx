"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiresAt: string | null;
  category: string | null;
};

type Recipe = {
  title: string;
  estimatedMinutes: number;
  servings: number;
  ingredients: string[];
  steps: string[];
  tips: string[];
};

const initialIngredientForm = {
  name: "",
  quantity: "1",
  unit: "pcs",
  expiresAt: "",
  category: ""
};

export default function HomePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientForm, setIngredientForm] = useState(initialIngredientForm);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [savingIngredient, setSavingIngredient] = useState(false);
  const [inventoryError, setInventoryError] = useState<string>("");

  const [servings, setServings] = useState("2");
  const [maxCookMinutes, setMaxCookMinutes] = useState("40");
  const [dietaryNote, setDietaryNote] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState<string>("");

  const lowStockCount = useMemo(
    () => ingredients.filter((item) => item.quantity <= 1).length,
    [ingredients]
  );

  async function loadInventory() {
    try {
      setLoadingInventory(true);
      setInventoryError("");
      const response = await fetch("/api/inventory", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load inventory");
      }
      setIngredients(data.ingredients ?? []);
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Failed to load inventory");
    } finally {
      setLoadingInventory(false);
    }
  }

  useEffect(() => {
    void loadInventory();
  }, []);

  async function onAddIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSavingIngredient(true);
      setInventoryError("");
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ingredientForm,
          quantity: Number(ingredientForm.quantity),
          expiresAt: ingredientForm.expiresAt || undefined,
          category: ingredientForm.category || undefined
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add ingredient");
      }

      setIngredientForm(initialIngredientForm);
      setIngredients((prev) => [data.ingredient, ...prev]);
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Failed to add ingredient");
    } finally {
      setSavingIngredient(false);
    }
  }

  async function updateQuantity(id: string, nextQuantity: number) {
    if (nextQuantity <= 0) {
      return;
    }

    try {
      setInventoryError("");
      const response = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQuantity })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update ingredient");
      }

      setIngredients((prev) => prev.map((item) => (item.id === id ? data.ingredient : item)));
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Failed to update ingredient");
    }
  }

  async function deleteIngredient(id: string) {
    try {
      setInventoryError("");
      const response = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete ingredient");
      }
      setIngredients((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Failed to delete ingredient");
    }
  }

  async function generateRecipe() {
    try {
      setGeneratingRecipe(true);
      setRecipeError("");
      setRecipe(null);

      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servings: Number(servings),
          maxCookMinutes: maxCookMinutes ? Number(maxCookMinutes) : undefined,
          dietaryNote: dietaryNote || undefined
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate recipe");
      }
      setRecipe(data.recipe);
    } catch (error) {
      setRecipeError(error instanceof Error ? error.message : "Failed to generate recipe");
    } finally {
      setGeneratingRecipe(false);
    }
  }

  return (
    <main className="stack">
      <div className="stack">
        <h1>Fridge Recipe Builder</h1>
        <p className="muted">
          Track what is in your fridge and generate AI recipes that prioritize expiring ingredients.
        </p>
      </div>

      <div className="grid">
        <section className="card stack">
          <h2>Add Ingredient</h2>
          <form className="stack" onSubmit={onAddIngredient}>
            <input
              required
              placeholder="Ingredient name"
              value={ingredientForm.name}
              onChange={(event) => setIngredientForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <div className="row">
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Qty"
                value={ingredientForm.quantity}
                onChange={(event) =>
                  setIngredientForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
              />
              <input
                required
                placeholder="Unit (pcs, g, ml)"
                value={ingredientForm.unit}
                onChange={(event) => setIngredientForm((prev) => ({ ...prev, unit: event.target.value }))}
              />
            </div>
            <div className="row">
              <input
                type="date"
                value={ingredientForm.expiresAt}
                onChange={(event) =>
                  setIngredientForm((prev) => ({ ...prev, expiresAt: event.target.value }))
                }
              />
              <input
                placeholder="Category (optional)"
                value={ingredientForm.category}
                onChange={(event) =>
                  setIngredientForm((prev) => ({ ...prev, category: event.target.value }))
                }
              />
            </div>
            <button type="submit" disabled={savingIngredient}>
              {savingIngredient ? "Saving..." : "Add Ingredient"}
            </button>
          </form>
          {inventoryError ? <p className="error">{inventoryError}</p> : null}
        </section>

        <section className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2>Inventory</h2>
            <button className="secondary" onClick={() => void loadInventory()}>
              Refresh
            </button>
          </div>

          <p className="muted">
            {ingredients.length} items in fridge{" "}
            {lowStockCount > 0 ? <span className="badge">{lowStockCount} low-stock</span> : null}
          </p>

          {loadingInventory ? <p className="muted">Loading inventory...</p> : null}

          {!loadingInventory && ingredients.length === 0 ? (
            <p className="muted">No ingredients yet. Add your first item.</p>
          ) : null}

          <div className="stack">
            {ingredients.map((item) => (
              <article className="listItem stack" key={item.id}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{item.name}</strong>
                  {item.quantity <= 1 ? <span className="badge">Low stock</span> : null}
                </div>
                <p className="muted">
                  {item.quantity} {item.unit}
                  {item.category ? ` • ${item.category}` : ""}
                </p>
                {item.expiresAt ? (
                  <p className="muted">
                    Expires: {new Date(item.expiresAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                ) : null}
                <div className="row">
                  <button
                    className="secondary"
                    onClick={() => void updateQuantity(item.id, Number((item.quantity - 1).toFixed(2)))}
                  >
                    -1
                  </button>
                  <button
                    className="secondary"
                    onClick={() => void updateQuantity(item.id, Number((item.quantity + 1).toFixed(2)))}
                  >
                    +1
                  </button>
                  <button className="danger" onClick={() => void deleteIngredient(item.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="card stack">
        <h2>Generate Recipe</h2>
        <div className="row">
          <input
            type="number"
            min="1"
            max="12"
            value={servings}
            onChange={(event) => setServings(event.target.value)}
            placeholder="Servings"
          />
          <input
            type="number"
            min="5"
            max="240"
            value={maxCookMinutes}
            onChange={(event) => setMaxCookMinutes(event.target.value)}
            placeholder="Max cook time (minutes)"
          />
          <input
            value={dietaryNote}
            onChange={(event) => setDietaryNote(event.target.value)}
            placeholder="Dietary note (optional)"
          />
          <button onClick={() => void generateRecipe()} disabled={generatingRecipe}>
            {generatingRecipe ? "Generating..." : "Generate Recipe"}
          </button>
        </div>

        {recipeError ? <p className="error">{recipeError}</p> : null}

        {recipe ? (
          <article className="recipeBlock stack">
            <h3>{recipe.title}</h3>
            <p className="muted">
              {recipe.estimatedMinutes} min • serves {recipe.servings}
            </p>
            <div className="grid">
              <div>
                <strong>Ingredients</strong>
                <ul>
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Steps</strong>
                <ol>
                  {recipe.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            {recipe.tips.length > 0 ? (
              <div>
                <strong>Tips</strong>
                <ul>
                  {recipe.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ) : (
          <p className="muted">Generated recipes will appear here.</p>
        )}
      </section>
    </main>
  );
}
