/*import React, { useState } from "react";
import {
  Grid,
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import Navbar from "../components/NavBar";
import RecipeCard from "../components/RecipeCard";
import { useTheme } from "@mui/material/styles";

const recipes = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    cuisine: "Italian",
    description: "Classic Italian pasta with creamy sauce.",
    image: "/images/spaghetti.jpg"
  },
  {
    id: 2,
    name: "Chicken Curry",
    cuisine: "Indian",
    description: "Spiced chicken in rich curry sauce.",
    image: "/images/curry.jpg"
  },
  {
    id: 3,
    name: "Pancakes",
    cuisine: "American",
    description: "Fluffy pancakes with syrup.",
    image: "/images/pancakes.jpg"
  },
  {
    id: 4,
    name: "Caesar Salad",
    cuisine: "American",
    description: "Crisp romaine with Caesar dressing.",
    image: "/images/caesar.jpg"
  },
  {
    id: 5,
    name: "Tacos al Pastor",
    cuisine: "Mexican",
    description: "Pork tacos with pineapple and cilantro.",
    image: "/images/tacos.jpg"
  },
  {
    id: 6,
    name: "Pho",
    cuisine: "Vietnamese",
    description: "Beef noodle soup with herbs.",
    image: "/images/pho.jpg"
  },
  {
    id: 7,
    name: "Pad Thai",
    cuisine: "Thai",
    description: "Stir-fried rice noodles with tamarind and peanuts.",
    image: "/images/padthai.jpg"
  },
  {
    id: 8,
    name: "Kung Pao Chicken",
    cuisine: "Chinese",
    description: "Spicy stir-fried chicken with peanuts.",
    image: "/images/kungpao.jpg"
  }
];


const cuisineTypes = [
  "All",
  "Italian",
  "Indian",
  "American",
  "Mexican",
  "Vietnamese",
  "Thai",
  "Chinese"
];*/

import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import Navbar from "../components/NavBar";
import RecipeCard from "../components/RecipeCard";
import { useTheme } from "@mui/material/styles";

const cuisineTypes = [
  "All",
  "Italian",
  "Indian",
  "American",
  "Mexican",
  "Vietnamese",
  "Thai",
  "Chinese"
];

function RecipeIndex() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [allRecipes, setAllRecipes] = useState([]);

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const allResponse = await fetch("http://localhost:5000/api/recipes");
        const savedResponse = await fetch(`http://localhost:5000/api/saved-recipes?userId=${userId}`);
  
        const allData = await allResponse.json();
        const savedData = await savedResponse.json();
  
        setAllRecipes(allData.recipes || []);
        setSavedRecipes(savedData.recipes || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    };
  
    if (userId) {
      fetchRecipes();
    }
  }, [userId]);

  const handleSave = async (recipe) => {
    if (!savedRecipes.find((r) => r.id === recipe.id)) {
      try {
        await fetch("http://localhost:5000/api/save-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeData: recipe, userId }), // ✅ include userId
        });

        const resSaved = await fetch(`http://localhost:5000/api/saved-recipes?userId=${userId}`);
        const dataSaved = await resSaved.json();
        setSavedRecipes(dataSaved.recipes || []);
      } catch (err) {
        console.error("Error saving recipe:", err);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCuisineChange = (event, newCuisineIndex) => {
    setSelectedCuisine(cuisineTypes[newCuisineIndex]);
  };

  const filteredRecipes = (tab === 0 ? allRecipes : savedRecipes).filter(
    (recipe) => selectedCuisine === "All" || recipe.cuisine === selectedCuisine
  );

  return (
    <>
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{
          marginTop: "80px",
          backgroundColor: theme.palette.background.paper,
          padding: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 3 }}>
          Recipe Index
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 2 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { backgroundColor: "#000" } }}
            textColor="inherit"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Tab label="All Recipes" />
            <Tab label={`Saved Recipes (${savedRecipes.length})`} />
          </Tabs>
        </Box>

        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
          }}
        >
          <Tabs
            value={cuisineTypes.indexOf(selectedCuisine)}
            onChange={handleCuisineChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
              },
            }}
          >
            {cuisineTypes.map((type) => (
              <Tab key={type} label={type} />
            ))}
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={3} key={recipe._id}>
                <RecipeCard recipe={recipe} onSave={handleSave} />
              </Grid>
            ))
          ) : (
            <Typography variant="body1" sx={{ padding: 2 }}>
              No recipes found in this category.
            </Typography>
          )}
        </Grid>
      </Container>
    </>
  );
}

export default RecipeIndex;