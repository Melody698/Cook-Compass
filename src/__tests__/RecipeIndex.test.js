
import { render, screen, fireEvent } from "@testing-library/react";
import RecipeIndex from "../pages/RecipeIndex";
import { MemoryRouter } from "react-router-dom";

describe("RecipeIndex Component", () => {
  test("renders All Recipes and Saved Recipes tabs", () => {
    render(
      <MemoryRouter>
        <RecipeIndex />
      </MemoryRouter>
    );
    expect(screen.getByText(/All Recipes/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Recipes/i)).toBeInTheDocument();
  });

  test("renders cuisine tabs and filters recipes", () => {
    render(
      <MemoryRouter>
        <RecipeIndex />
      </MemoryRouter>
    );
    // Check that at least one "Italian" tab is rendered
    expect(screen.getAllByText("Italian").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText("Italian")[0]);
    expect(screen.getByText(/Spaghetti Carbonara/i)).toBeInTheDocument();
  });
});
