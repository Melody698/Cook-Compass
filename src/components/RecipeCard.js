import { React, useState, useEffect } from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box, IconButton, Tooltip, Snackbar } from "@mui/material";
import { useNavigate, Link } from "react-router-dom"; 
import NutritionInfo from "../components/NutritionInfo";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { X } from "@mui/icons-material";


const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [openNutrition, setOpenNutrition] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const userId = sessionStorage.getItem("userId"); // Get userId once

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/saved-recipes?userId=${userId}`);
        const data = await res.json();
        const exists = data.recipes.some((r) => r.id === recipe.id);
        setIsSaved(exists);
      } catch (err) {
        console.error("Failed to check saved recipes", err);
      }
    };
    if (userId) {
      checkSavedStatus();
    }
  }, [recipe.id, userId]);

  const handleToggleSave = async () => {
    try {
      if (!isSaved) {
        await fetch("http://localhost:5000/api/save-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeData: recipe, userId }), // ✅ Include userId
        }); 
        setIsSaved(true);
      } else {
        await fetch("http://localhost:5000/api/save-recipe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: recipe.id, userId }), // ✅ Optionally include userId
        });
        setIsSaved(false);
      }
    } catch (err) {
      console.error("Toggle save failed:", err);
    }
  };

  const handleCopyIngredients = () => {
    const text = recipe.ingredients?.join(", ") || "No ingredients found";
    navigator.clipboard.writeText(text);
    setSnackbarOpen(true);
  };
  
  

  const handleOpenNutrition = () => setOpenNutrition(true);
  const handleCloseNutrition = () => setOpenNutrition(false);

  return (
    <>
<Card sx={{ width: "100%", height: "100%", boxShadow: 3, borderRadius: "10px", overflow: "hidden", position: "relative" }}>
  {/* Floating Copy Button */}
{/* Floating Copy Button */}
<Tooltip title="Copy Ingredients">
  <IconButton
    onClick={handleCopyIngredients}
    sx={{
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      zIndex: 2,
    }}
  >
    <ContentCopyIcon fontSize="small" />
  </IconButton>
</Tooltip>


  {recipe.image && (
    <CardMedia
      component="img"
      height="140"
      image={recipe.image}
      alt={recipe.name}
    />
  )}


        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {recipe.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
            {recipe.description}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenNutrition}
              variant="contained"
              size="small"
            >
              Nutrition Info
            </Button>
            <Button
              component={Link}
              to={`/gen-instructions/${recipe.id}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="small"
            >
              View
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleToggleSave}
            >
              {isSaved ? "Remove" : "Save"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <NutritionInfo
        open={openNutrition}
        onClose={handleCloseNutrition}
        nutrition={{
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fats: recipe.fats
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Ingredients copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

    </>
  );
};

export default RecipeCard;
