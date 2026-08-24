import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import RecipeIndex from "./pages/RecipeIndex";
import RecipeRecommendations from "./pages/RecipeRecommendations";
import RecInstructions from "./pages/RecInstructions";
import GenInstructions from "./pages/GenInstructions";
import GenStepByStep from "./pages/GenStepByStep";
import RecStepByStep from "./pages/RecStepByStep";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import CreateUser from "./pages/CreateUser";
import SavedInstructions from "./pages/SavedInstructions.js";
import SavedStepByStep from "./pages/SavedStepByStep.js";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/recommendations")
      .then(response => response.json())
      .then(data => {
        if (data.data?.recipes) {
          // Optional: preload or cache recommendations
          sessionStorage.setItem("recipeRecommendations", JSON.stringify(data.data.recipes));
        }
      })
      .catch(err => console.error("Error prefetching recommendations:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recipe-list" element={<RecipeIndex />} />
        <Route path="/recipe-recommendations" element={<RecipeRecommendations />} />
        <Route path="/rec-instructions/:id" element={<RecInstructions />} />
        <Route path="/rec-step-by-step/:id" element={<RecStepByStep />} />
        <Route path="/gen-instructions/:id" element={<GenInstructions />} />
        <Route path="/gen-step-by-step/:id" element={<GenStepByStep />} />
        <Route path="/saved-instructions/:id" element={<SavedInstructions />} />
        <Route path="/saved-step-by-step/:id" element={<SavedStepByStep />} />

        {/* No auth required to view profile */}
        <Route path="/user-profile" element={<UserProfile />} />

        <Route path="/create-user" element={<CreateUser />} />
      </Routes>
    </Router>
  );
}

export default App;
