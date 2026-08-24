import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Alert, TextField, Autocomplete, Button } from "@mui/material";
import Select from "react-select";
import { useDarkMode } from "../utils/darkMode";
import { validateIngredient, getIngredientSuggestions } from "../utils/spoonacularApi";

function Sidebar({ ingredientsList, handleSelectIngredientChange, customIngredients, setCustomIngredients }) {
  const [newIngredient, setNewIngredient] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const theme = useTheme();           
  const { darkMode } = useDarkMode();   

  useEffect(() => {
    if (newIngredient.length > 2) {
      const fetchSuggestions = async () => {
        const results = await getIngredientSuggestions(newIngredient);
        setSuggestions(results);
      };
      fetchSuggestions();
    }
  }, [newIngredient]);

  const handleAddCustomIngredient = async () => {
    if (!newIngredient) return;
    
    setIsValidating(true);
    setValidationError("");
    
    const isValid = await validateIngredient(newIngredient);
    
    if (isValid && !customIngredients.includes(newIngredient)) {
      setCustomIngredients((prev) => [...prev, newIngredient]);
      handleSelectIngredientChange("Custom", [{ value: newIngredient, label: newIngredient }]);
      setNewIngredient("");
    } else if (!isValid) {
      setValidationError("This ingredient is not recognized. Please try another one.");
    }
    
    setIsValidating(false);
  };

  const handleRemoveCustomIngredient = (ingredient) => {
    setCustomIngredients((prev) => prev.filter((item) => item !== ingredient));
    handleSelectIngredientChange("Custom", []);
  };

  return (
    <Box
      sx={{
        width: "300px",  // Fixed width sidebar
        height: "100vh", // Full height of the screen
        position: "fixed", // Stays fixed while scrolling
        top: 50,
        left: 0,
        overflow: "auto",
        backgroundColor: theme.palette.background.paper, // ✅ dynamic background!
        padding: "35px",
        boxShadow: "2px 0 5px rgba(255, 255, 255, 0.1)", // Subtle shadow
        color: theme.palette.text.primary, // ✅ dynamic text color
      }}
    >
      <Typography variant="h5" gutterBottom>
        Select Ingredients
      </Typography>
      {ingredientsList.map((category) => (
        <Box key={category.category} sx={{ marginBottom: "15px" }}>
          <Typography variant="h6">{category.category}</Typography>
          <Select
            options={[
              ...category.ingredients.map((ingredient) => ({
                value: ingredient,
                label: ingredient,
              })),
              ...customIngredients.map((ingredient) => ({
                value: ingredient,
                label: ingredient,
              })),
            ]}
            isMulti
            onChange={(selectedOptions) =>
              handleSelectIngredientChange(category.category, selectedOptions)
            }
            className="ingredient-dropdown"
            placeholder={`Select ${category.category}...`}
          />
        </Box>
      ))}

      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Custom Ingredients</Typography>
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px", 
          marginBottom: "10px" 
        }}>
          <Autocomplete
            freeSolo
            options={suggestions}
            inputValue={newIngredient}
            onInputChange={(event, newValue) => {
              setNewIngredient(newValue);
              setValidationError("");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Enter ingredient"
                variant="outlined"
                fullWidth
                error={!!validationError}
                helperText={validationError}
              />
            )}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleAddCustomIngredient}
            disabled={isValidating}
            sx={{ 
              height: '45px',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            {isValidating ? "Validating..." : "Add Ingredient"}
          </Button>
        </Box>

        {customIngredients.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {customIngredients.map((ingredient, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  marginBottom: "8px",
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: "4px",
                }}
              >
                <Typography>{ingredient}</Typography>
                <Button 
                  size="small"
                  color="error"
                  onClick={() => handleRemoveCustomIngredient(ingredient)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Sidebar;
