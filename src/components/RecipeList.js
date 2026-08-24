import React, { useState, useEffect } from "react";
import { CircularProgress, Typography } from "@mui/material";
import RecipeCard from "./RecipeCard";
import { Grid } from "@mui/material";
import useFilteredRecipes from "./RecipeFilterLogic";
import { fetchRecipes } from "../api/chatgptApi"; // Import your API function

const RecipeList = ({
  ingredients,
  positiveFilters,
  negativeFilters,
  useLocalFilter = false,
  selectedFilters = {},
}) => {
  const [recipes, setRecipes] = useState(() => {
    const savedRecipes = localStorage.getItem('currentGeneratingRecipes');
    return savedRecipes ? JSON.parse(savedRecipes) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredRecipes = useFilteredRecipes(selectedFilters, recipes);

  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem('currentGeneratingRecipes', JSON.stringify(recipes));
    }
  }, [recipes]);

  const handleFetchRecipes = async () => {
    // Validate ingredients before proceeding
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      setError("Please select at least one valid ingredient before generating recipes.");
      return;
    }

    setLoading(true);
    setRecipes([]);
    localStorage.removeItem('currentGeneratingRecipes');
    setError(null);

    try {
      const userId = sessionStorage.getItem("userId"); // ✅ Get userId from session

      const params = new URLSearchParams({
        ingredients: JSON.stringify(ingredients || []),
        positiveFilters: JSON.stringify(positiveFilters || []),
        negativeFilters: JSON.stringify(negativeFilters || []),
        userId: userId // ✅ Inject userId into query
      });

      const eventSource = new EventSource(`http://localhost:5000/api/recipes/stream?${params}`);

      let hasReceivedData = false;
      const timeout = setTimeout(() => {
        if (!hasReceivedData) {
          setError("Recipe generation timed out. Please try again.");
          setLoading(false);
          eventSource.close();
        }
      }, 30000); // 30 second timeout

      eventSource.onmessage = (event) => {
        hasReceivedData = true;
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
            setLoading(false);
            eventSource.close();
          } else if (data.recipe) {
            setRecipes(prev => {
              const newRecipes = [...prev, data.recipe];
              localStorage.setItem('currentGeneratingRecipes', JSON.stringify(newRecipes));
              return newRecipes;
            });
          } else if (data.done) {
            clearTimeout(timeout);
            setLoading(false);
            eventSource.close();
          }
        } catch (err) {
          console.error('Error parsing event data:', err);
          setError("An error occurred while generating recipes.");
          setLoading(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        clearTimeout(timeout);
        setError("Lost connection to server. Please try again.");
        setLoading(false);
        eventSource.close();
      };

      const storageListener = (e) => {
        if (e.key === 'currentGeneratingRecipes' && e.newValue) {
          const storedRecipes = JSON.parse(e.newValue);
          setRecipes(storedRecipes);
        }
      };
      window.addEventListener('storage', storageListener);

      return () => {
        eventSource.close();
        window.removeEventListener('storage', storageListener);
      };
    } catch (error) {
      setError('Failed to start recipe generation');
      setLoading(false);
    }
  };

  return (
    <div className="recipe-suggestions">
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Recipe Suggestions
      </Typography>

      <button 
        onClick={handleFetchRecipes} 
        disabled={loading}
        style={{ marginBottom: '20px' }}
      >
        {loading ? (
          <CircularProgress color="primary" size={24} />
        ) : recipes.length > 0 ? (
          "Regenerate Recipes"
        ) : (
          "Get Recipes"
        )}
      </button>

      {error && (
        <Typography color="error" sx={{ marginY: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
        <Typography sx={{ marginY: 2 }}>
          Generating recipes...
        </Typography>
      )}

      {recipes.length > 0 && (
        <Grid container spacing={3} sx={{ marginTop: 3 }}>
          {filteredRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={3} key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && recipes.length === 0 && !error && (
        <Typography>No recipes available. Click "Get Recipes" to generate some!</Typography>
      )}
    </div>
  );
};

export default RecipeList;
