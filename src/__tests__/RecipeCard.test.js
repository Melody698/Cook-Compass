
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

const mockRecipe = {
  id: 1,
  name: "Spaghetti Carbonara",
  description: "Classic Italian pasta with creamy sauce.",
  image: "/images/spaghetti.jpg"
};

describe("RecipeCard Component", () => {
  test("renders recipe name and description", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Spaghetti Carbonara/i)).toBeInTheDocument();
    expect(screen.getByText(/Classic Italian pasta/i)).toBeInTheDocument();
  });

  test("renders view and save buttons", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});
