import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import "../styles/Recommendations.css"
import RecipeList from "../components/RecipeList";
import Navbar from "../components/NavBar"; 
import Sidebar from "../components/Sidebar"; 
import Filters from "../components/Filters";


function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [customIngredients, setCustomIngredients] = useState([]); // Track custom ingredients
  const [positiveFilters, setPositiveFilters] = useState({});
  const [negativeFilters, setNegativeFilters] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state
  const [selectedFilters, setSelectedFilters] = useState({});

  const ingredientsList = [
    { category: "Vegetables", ingredients: ["Tomato", "Onion", "Garlic", "Spinach", "Mushroom"] },
    { category: "Proteins", ingredients: ["Chicken", "Beef", "Eggs", "Tofu"] },
    { category: "Dairy", ingredients: ["Cheese", "Milk", "Butter", "Yogurt"] },
    { category: "Grains", ingredients: ["Rice", "Quinoa", "Bread", "Pasta"] },
    { category: "Fruits", ingredients: ["Apple", "Banana", "Orange", "Lemon"] },
    { category: "Herbs & Spices", ingredients: ["Basil", "Cilantro", "Rosemary", "Oregano"] }
  ];

  const filterList = [
    { category: "Dietary Preferences", filters: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "High-Protein", "Low-Carb"] },
    { category: "Cuisine Type", filters: ["Italian", "Mexican", "Asian", "Mediterranean", "American"] },
    { category: "Cooking Time", filters: ["Under 15 minutes", "15-30 minutes", "30-60 minutes", "Over 60 minutes"] },
    { category: "Meal Type", filters: ["Breakfast", "Lunch", "Dinner", "Snacks"] },
    { category: "Cooking Method", filters: ["Stovetop", "Oven-Baked", "Grilled", "Slow Cooker"] },
    { category: "Allergen Filters", filters: ["Dairy-Free", "Nut-Free", "Egg-Free", "Gluten-Free"] },
    { category: "Category Filters", filters: ["Vegetables", "Proteins", "Dairy", "Grains", "Fruits", "Herbs & Spices"] },
    { category: "Ingredient-Specific Filters", filters: ["Tomato", "Onion", "Garlic", "Spinach", "Mushroom", "Chicken", "Beef", "Eggs", "Tofu", "Cheese", "Milk", "Butter", "Yogurt", "Rice", "Quinoa", "Bread", "Pasta", "Apple", "Banana", "Orange", "Lemon", "Basil", "Cilantro", "Rosemary", "Oregano"] }
  ]


  const handleSelectIngredientChange = (category, selectedOptions) => {
    setSelectedIngredients((prev) => ({
      ...prev,
      [category]: selectedOptions.map((option) => option.value),
    }));
  };

  const handleSelectFilterChange = (category, selectedOptions, filterType) => {
    const selectedValues = selectedOptions.map((option) => option.value);
  
    if (filterType === "negative") {
      setNegativeFilters((prev) => ({ ...prev, [category]: selectedValues }));
      console.log("Updated Negative Filters:", selectedValues); // Debug
    } else if (filterType === "positive") {
      setPositiveFilters((prev) => ({ ...prev, [category]: selectedValues }));
      console.log("Updated Positive Filters:", selectedValues); // Debug
    }
  };

  const handleFilterChange = (category, value) => {
    setSelectedFilters((prev) => {
      const prevValues = prev[category] || [];
      const newValues = prevValues.includes(value)
        ? prevValues.filter((v) => v !== value)
        : [...prevValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  // Combine positiveFilters and negativeFilters into selectedFilters
  useEffect(() => {
    setSelectedFilters({
      ...positiveFilters,
      ...Object.fromEntries(
        Object.entries(negativeFilters).map(([key, values]) => [
          key,
          values.map((v) => `NOT ${v}`), // Prefix negative filters with "NOT"
        ])
      ),
    });
  }, [positiveFilters, negativeFilters]);

  console.log("Selected Filters in Home:", selectedFilters); // Log selectedFilters in parent

  return (
    <div className="home-container">
      <Navbar />
  
      <div className="main-content">
        {/* Sidebar for Ingredient Selection */}
        <Sidebar
          ingredientsList={ingredientsList}
          handleSelectIngredientChange={handleSelectIngredientChange}
          customIngredients={customIngredients}
          setCustomIngredients={setCustomIngredients} // Pass custom ingredients handlers
        />
  
        {/* Main Content: Tabs + Recipe List */}
        <div style={{ flex: 1, padding: "24px" }}>
          {/* Filters (Tabs + Pills) */}
          <Filters
            filterList={filterList}
            handleSelectFilterChange={handleSelectFilterChange}
            useLocalFilter={true}
            selectedFilters={selectedFilters}
          />
  
          {/* White Recipe Suggestion Box */}
          <section
            className="recipe-section"
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "16px",
              marginTop: "24px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <RecipeList
              ingredients={[
                ...Object.values(selectedIngredients).flat(),
                ...customIngredients, // Include custom ingredients
              ]}
              positiveFilters={Object.values(positiveFilters).flat()}
              negativeFilters={Object.values(negativeFilters).flat()}
              useLocalFilter={true}
              selectedFilters={selectedFilters}
            />
          </section>
        </div>
      </div>
    </div>
  );
  
}


export default Home;