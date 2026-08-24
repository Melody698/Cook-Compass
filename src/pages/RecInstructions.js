import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Instructions.css";
import NavBar from "../components/NavBar.js";

function RecInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const res = await fetch(`http://localhost:5000/api/recommendations?userId=${userId}`);
        const data = await res.json();
        const match = data.find(r => r.id === parseInt(id));
        setSelectedRecipe(match || null);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchRecommendations();
  }, [id]);

  const handleStep = () => {
    navigate(`/rec-step-by-step/${id}`);
  };

  if (!selectedRecipe) {
    return (
      <>
        <NavBar />
        <p>Recipe not found.</p>
      </>
    );
  }

  return (
    <div className="container">
      <NavBar />
      <h1 className="header">Recipe Instructions</h1>
      <div className="recipe-details">
        <h2>{selectedRecipe.name}</h2>
        <img 
          src={selectedRecipe.image} 
          className="recipe-image"
          alt={selectedRecipe.name}
        />
        <div className="recipe-details">
          <p>{selectedRecipe.description}</p>
        </div>
        <div className="ingredients">
          <h2>Ingredients</h2>
          <ul>
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="instructions">
          <h2>Instructions</h2>
          <ul>
            {selectedRecipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
        <button className="step-btn" onClick={handleStep}>
          Step By Step Mode
        </button>
      </div>
    </div>
  );
}

export default RecInstructions;