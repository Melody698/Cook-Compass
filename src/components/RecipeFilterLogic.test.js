import { renderHook } from "@testing-library/react";
import useFilteredRecipes from "./RecipeFilterLogic";

test("filters recipes by selected filters", () => {
  const selectedFilters = { "Dietary Preferences": ["Vegan"] };
  const { result } = renderHook(() => useFilteredRecipes(selectedFilters));
  // Wait for useEffect to run
  expect(Array.isArray(result.current)).toBe(true);
  // Optionally, check that all recipes in result.current match the filter
  result.current.forEach(recipe => {
    expect(
      recipe.filterDictionary?.["Dietary Preferences"] === "Vegan" ||
      recipe.labels?.includes("Vegan")
    ).toBe(true);
  });
});
