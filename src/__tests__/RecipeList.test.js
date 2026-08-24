import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeList from "../components/RecipeList";
import { fetchRecipes } from "../api/chatgptApi";

// Mock fetchRecipes API call
jest.mock("../api/chatgptApi", () => ({
  fetchRecipes: jest.fn(),
}));

// Mock RecipeCard to avoid rendering full component
jest.mock("../components/RecipeCard", () => ({ recipe }) => (
  <div data-testid="recipe-card">{recipe.title}</div>
));

const mockRecipeData = {
  recipes: [
    {
      title: "Chicken and Rice",
      ingredients: ["Chicken", "Rice"],
      tags: ["High-Protein", "Dinner"],
    },
    {
      title: "Vegan Quinoa Bowl",
      ingredients: ["Quinoa", "Spinach"],
      tags: ["Vegan", "Lunch"],
    },
  ],
};

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  fetchRecipes.mockReset();
});

describe("RecipeList Component", () => {
  it("renders recipes matching the ingredients after API call", async () => {
    fetchRecipes.mockResolvedValueOnce(mockRecipeData);

    render(
      <RecipeList
        ingredients={["Chicken", "Rice"]}
        positiveFilters={[]}
        negativeFilters={[]}
      />
    );

    fireEvent.click(screen.getByText("Get Recipes"));

    await waitFor(() =>
      expect(screen.getByText("Chicken and Rice")).toBeInTheDocument()
    );

    expect(screen.queryByText("Vegan Quinoa Bowl")).toBeInTheDocument();
  });

  it("filters by positive tags", async () => {
    fetchRecipes.mockResolvedValueOnce(mockRecipeData);

    render(
      <RecipeList
        ingredients={["Quinoa"]}
        positiveFilters={["Vegan"]}
        negativeFilters={[]}
      />
    );

    fireEvent.click(screen.getByText("Get Recipes"));

    await waitFor(() =>
      expect(screen.getByText("Vegan Quinoa Bowl")).toBeInTheDocument()
    );
  });

  it("filters out recipes with negative tags", async () => {
    fetchRecipes.mockResolvedValueOnce({
      recipes: [
        {
          title: "Cheesy Pasta",
          ingredients: ["Cheese", "Pasta"],
          tags: ["Dinner"],
        },
      ],
    });

    render(
      <RecipeList
        ingredients={["Cheese", "Pasta"]}
        positiveFilters={[]}
        negativeFilters={["Dinner"]}
      />
    );

    fireEvent.click(screen.getByText("Get Recipes"));

    await waitFor(() =>
      expect(
        screen.queryByText("Cheesy Pasta")
      ).not.toBeInTheDocument()
    );
  });

  it("shows message if no recipes match", async () => {
    fetchRecipes.mockResolvedValueOnce({ recipes: [] });

    render(
      <RecipeList
        ingredients={["Tofu"]}
        positiveFilters={[]}
        negativeFilters={["All"]}
      />
    );

    fireEvent.click(screen.getByText("Get Recipes"));

    await waitFor(() =>
      expect(screen.getByText(/no recipes available/i)).toBeInTheDocument()
    );
  });

  it("shows prompt if no ingredients selected", () => {
    render(
      <RecipeList ingredients={[]} positiveFilters={[]} negativeFilters={[]} />
    );

    expect(screen.getByText("Select at least one ingredient.")).toBeInTheDocument();
  });
});
