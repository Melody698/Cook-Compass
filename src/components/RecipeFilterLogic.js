import { useState, useEffect } from "react";

function useFilteredRecipes(selectedFilters, externalRecipes = []) {
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  useEffect(() => {
    // Update allRecipes when externalRecipes changes
    if (externalRecipes.length > 0) {
      setAllRecipes(externalRecipes);
    }
  }, [externalRecipes]);

  useEffect(() => {
    console.log("Selected Filters:", selectedFilters);

    // Separate positive and negative filters
    const positiveFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(([key, values]) =>
        values.every((v) => !v.startsWith("NOT "))
      )
    );

    const negativeFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(([key, values]) =>
        values.some((v) => v.startsWith("NOT "))
      )
    );

    console.log("Positive Filters:", positiveFilters);
    console.log("Negative Filters:", negativeFilters);

    const filterValues = Object.values(positiveFilters).flat().map(String);
    const exclusionValues = Object.entries(negativeFilters).reduce(
      (acc, [key, values]) => ({
        ...acc,
        [key]: values.map((v) => v.replace("NOT ", "")),
      }),
      {}
    );

    console.log("Filter Values:", filterValues);
    console.log("Exclusion Values:", exclusionValues);

    // If no filters are active, show all recipes
    if (filterValues.length === 0 && Object.keys(exclusionValues).length === 0) {
      setFilteredRecipes(allRecipes);
      console.log("No active filters, showing all recipes");
      return;
    }

    const matchesFilter = (recipe, val) => {
      // Check labels
      if (recipe.labels && recipe.labels.map((l) => l.toLowerCase()).includes(val.toLowerCase())) {
        return true;
      }
      // Check all nested filterDictionary categories
      if (recipe.filterDictionary) {
        return Object.values(recipe.filterDictionary).some((categoryObj) =>
          typeof categoryObj === "object" && categoryObj !== null
            ? categoryObj[val] === true
            : false
        );
      }
      return false;
    };

    const matchesExclusion = (recipe, exclusions) => {
      return Object.entries(exclusions).some(([category, values]) =>
        values.some((val) => matchesFilter(recipe, val))
      );
    };

    const filtered = allRecipes.filter(
      (recipe) =>
        filterValues.every((val) => matchesFilter(recipe, val)) &&
        !matchesExclusion(recipe, exclusionValues)
    );

    console.log("Filtered Recipes:", filtered);
    setFilteredRecipes(filtered);
  }, [allRecipes, selectedFilters]);

  return filteredRecipes;
}

export default useFilteredRecipes;
