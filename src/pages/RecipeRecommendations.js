import React, { useState, useEffect } from "react";
import "../styles/Recommendations.css";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

function RecipeRecommendations() {
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState(new Set());
  const [dislikedRecipes, setDislikedRecipes] = useState(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true); // <-- added

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      const userId = sessionStorage.getItem("userId");

      if (!userId) {
        console.warn("No userId found in sessionStorage.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/recommendations?userId=${userId}`);
        const data = await response.json();
        console.log("Fetched recommendations:", data);

        const recipes = Array.isArray(data) ? data : data.recipes;

        if (isMounted && Array.isArray(recipes)) {
          setRecommendedRecipes(recipes);
        } else {
          console.warn("Unexpected data structure:", data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewRecipe = (id) => {
    navigate(`/rec-instructions/${id}`);
  };

  const handleLike = (id) => {
    setLikedRecipes((prev) => new Set([...prev, id]));
    setDislikedRecipes((prev) => {
      const newDisliked = new Set(prev);
      newDisliked.delete(id);
      return newDisliked;
    });
  };

  const handleDislike = (id) => {
    setDislikedRecipes((prev) => new Set([...prev, id]));
    setLikedRecipes((prev) => {
      const newLiked = new Set(prev);
      newLiked.delete(id);
      return newLiked;
    });
  };

  const handleDismiss = (id) => {
    setRecommendedRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    setLikedRecipes((prev) => {
      const newLiked = new Set(prev);
      newLiked.delete(id);
      return newLiked;
    });
    setDislikedRecipes((prev) => {
      const newDisliked = new Set(prev);
      newDisliked.delete(id);
      return newDisliked;
    });
  };

  return (
    <div className="recommendations-container">
      <Navbar />
      <h1>Recipe Recommendations</h1>
      <p>Based on your selected ingredients, here are some recommended recipes:</p>

      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="recipe-grid">
          {recommendedRecipes.length === 0 ? (
            <p>No recipes found.</p>
          ) : (
            recommendedRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <h3>{recipe.name}</h3>
                <p><strong>Ingredients:</strong> {recipe.ingredients.join(", ")}</p>
                <p><strong>Instructions:</strong> {recipe.instructions.join(" ")}</p>

                <div className="button-container">
                  <button 
                    onClick={() => handleLike(recipe.id)} 
                    className={likedRecipes.has(recipe.id) ? "liked" : ""}
                  >
                    Like
                  </button>
                  <button 
                    onClick={() => handleDislike(recipe.id)} 
                    className={dislikedRecipes.has(recipe.id) ? "disliked" : ""}
                  >
                    Dislike
                  </button>
                  <button 
                    onClick={() => handleDismiss(recipe.id)} 
                    className="dismiss-button"
                  >
                    Dismiss
                  </button>
                </div>
                <button className="view-recipe-button" onClick={() => handleViewRecipe(recipe.id)}>
                  More Info
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedRecipe && (
        <div className="recipe-modal">
          <div className="modal-content">
            <h2>{selectedRecipe.name}</h2>
            <p><strong>Ingredients:</strong></p>
            <ul>
              {selectedRecipe.ingredients.map((ingredient, idx) => (
                <li key={idx}>{ingredient}</li>
              ))}
            </ul>
            <p><strong>Instructions:</strong> {selectedRecipe.instructions.join(" ")}</p>
            <button className="close-modal" onClick={() => setSelectedRecipe(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeRecommendations;
