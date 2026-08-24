import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Recipe from "./models/Recipe.js";
import Recommendations from "./models/Recommendations.js";
import User from "./models/User.js";
import SaveRecipe from "./models/SaveRecipe.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in the environment variables.");
  process.exit(1); // Exit the server if the API key is missing
}

const TEXT_API_URL = "https://api.openai.com/v1/chat/completions";

const fetchGoogleImage = async (recipeName) => {
  if (!recipeName) return "https://via.placeholder.com/300";

  const GOOGLE_KEY = process.env.Google_API_KEY;
  const CX = process.env.CX;

  if (!GOOGLE_KEY || !CX) return "https://via.placeholder.com/300";

  try {
    const query = encodeURIComponent(recipeName.trim());
    const GOOGLE_URL = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${CX}&searchType=image&num=1&key=${GOOGLE_KEY}`;

    const response = await axios.get(GOOGLE_URL);
    const data = response.data;

    if (data.items && data.items.length > 0) {
      return data.items[0].link;
    } else {
      return "https://via.placeholder.com/300";
    }
  } catch (error) {
    console.error("Image API error:", error.message);
    return "https://via.placeholder.com/300";
  }
};

// ---------------- USER ROUTES ----------------

// Create User
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get User Profile (Fixed to send id, username, email)
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update User (Only secured version)
app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});
// ---------------- NUTRITION INFO HELPER FUNCTION ----------------

async function getNutritionInfo(recipe) {
  const prompt = `
Estimate the total nutritional content of the following recipe. Return only a JSON object with calories, protein, carbs, and fats. Do not include any other text or explanation.

Name: ${recipe.name}
Ingredients: ${recipe.ingredients.join(", ")}
Instructions: ${recipe.instructions.join(" ")}

Return format:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}
`.trim();

  try {
    const nutritionRes = await axios.post(
      TEXT_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful nutritionist assistant." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = nutritionRes.data.choices[0].message.content;

    // Extract JSON block safely using regex
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in response");

    const nutrition = JSON.parse(jsonMatch[0]);

    return nutrition;
  } catch (error) {
    console.error("Failed to fetch nutrition info:", error.message);
    return {
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
    };
  }
}

// ---------------- GET RECIPES ----------------

app.get("/api/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(10);
    res.json({ message: "Fetched recipes from database", data: recipes });
  } catch (error) {
    console.error("Error fetching from DB:", error);
    res.status(500).json({ error: "Failed to fetch from database" });
  }
});

// ---------------- GET or GENERATE RECOMMENDATIONS IF NONE EXIST ----------------
app.get("/api/recommendations", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Check for existing recommendations
    const existingRecs = await Recommendations.find({ user: userId });

    if (existingRecs.length > 0) {
      return res.json(existingRecs); // Return cached recommendations
    }

    // If no recommendations, generate new ones
    const chatResponse = await axios.post(
      TEXT_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful chef that suggests unique daily recipes." },
          { role: "user", content: `Suggest 4 popular recipes in JSON format. Only respond with JSON. The format should be:
          {
            "recipes": [
              {"id": int, "name": string, "description": string, "ingredients": [string], "instructions": [string] }
            ]
          }` },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY || "test-api-key"}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = chatResponse.data.choices[0].message.content.replace(/```json\s*|\s*```/g, "");
    const recommendationsData = JSON.parse(content);

    const imagePromises = recommendationsData.recipes.map(async (recipe) => {
      recipe.image = await fetchGoogleImage(recipe.name);
      return recipe;
    });

    recommendationsData.recipes = await Promise.all(imagePromises);

    const recipesWithUser = recommendationsData.recipes.map((r) => ({
      ...r,
      user: userId
    }));

    await Recommendations.insertMany(recipesWithUser);

    const recommendationsFilePath = path.join(process.cwd(), "public", "recipes", "Recommendations.json");
    fs.writeFileSync(recommendationsFilePath, JSON.stringify({ recipes: recipesWithUser }, null, 2));

    res.json(recipesWithUser);
  } catch (error) {
    console.error("Error fetching or generating recommendations:", error.message);
    res.status(500).json({ error: "Failed to fetch or generate recommendations" });
  }
});

// ---------------- DELETE RECOMMENDATIONS ON LOGOUT ----------------
app.delete("/api/recommendations", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    await Recommendations.deleteMany({ user: userId });
    res.json({ message: "Recommendations cleared on logout" });
  } catch (err) {
    console.error("Error deleting recommendations:", err);
    res.status(500).json({ error: "Failed to clear recommendations" });
  }
});

// ---------------- GENERATE RECIPES ----------------

const checkRecipeSimilarity = (recipe1, recipe2) => {
  // Exact name matches (ignoring "and" and articles)
  const cleanName = (name) => name.toLowerCase()
    .replace(/\band\b|\bthe\b|\ba\b/g, '')
    .trim();
  const nameMatch = cleanName(recipe1.name) === cleanName(recipe2.name);
  
  // Check if base dishes are the same (e.g., "soup" vs "stew" vs "casserole")
  const getDishType = (name) => {
    const types = ['soup', 'stew', 'casserole', 'stir-fry', 'salad', 'tacos', 'pasta'];
    return types.find(type => name.toLowerCase().includes(type));
  };
  
  const sameBaseType = getDishType(recipe1.name) === getDishType(recipe2.name);
  
  // Check cooking method
  const sameCookingMethod = recipe1.filterDictionary?.["Cooking Method"] &&
    recipe2.filterDictionary?.["Cooking Method"] &&
    Object.entries(recipe1.filterDictionary["Cooking Method"]).every(
      ([method, value]) => value === recipe2.filterDictionary["Cooking Method"][method]
    );

  // Only consider it similar if BOTH name matches AND cooking method matches
  return nameMatch && sameCookingMethod && sameBaseType;
};

const generatePrompt = (ingredients, positiveFilters, negativeFilters, existingRecipes = []) => `
You are a recipe recommendation system. 
Generate a unique REAL, detailed recipe that strictly follow these rules.

1. **Quantity**: You must generate a single recipe. Each recipe must be distinct and not a trivial variation of another.

2. **Ingredients**: 
   - Every recipe must include a complete "ingredients" array  listing every single ingredient and measurments used in the recipe, with no omissions.

3. **Instructions**: 
   - The "instructions" array must be step-by-step, with each step clear, specific, and detailed enough for a beginner to follow.

4. **Filters**:
   - Each recipe must include a "filterDictionary" object with **every possible filter key** from the following categories, even if the value is false or not present:
     - "Dietary Preferences": "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "High-Protein", "Low-Carb"
     - "Cuisine Type": "Italian", "Mexican", "Asian", "Mediterranean", "American"
     - "Cooking Time": "Under 15 minutes", "15-30 minutes", "30-60 minutes", "Over 60 minutes"
     - "Meal Type": "Breakfast", "Lunch", "Dinner", "Snacks"
     - "Cooking Method": "Stovetop", "Oven-Baked", "Grilled", "Slow Cooker"
     - "Allergen Filters": "Dairy-Free", "Nut-Free", "Egg-Free", "Gluten-Free"
     - "Category Filters": "Vegetables", "Proteins", "Dairy", "Grains", "Fruits", "Herbs & Spices"
     - "Ingredient-Specific Filters": "Tomato", "Onion", "Garlic", "Spinach", "Mushroom", "Chicken", "Beef", "Eggs", "Tofu", "Cheese", "Milk", "Butter", "Yogurt", "Rice", "Quinoa", "Bread", "Pasta", "Apple", "Banana", "Orange", "Lemon", "Basil", "Cilantro", "Rosemary", "Oregano"
   - For each key, set the value to true if the recipe matches/contains it, otherwise false.

5. **Labels**:
   - The "labels" array must include all relevant tags from the above filter values that apply to the recipe (e.g., "Vegetarian", "Mexican", "Dinner", "Stovetop", etc.).

6. **Active Filters**:
   - Recipes must match **all positive filters** (e.g., if "Vegetarian" and "Mexican" are selected, the recipe must be vegetarian and Mexican).
   - Recipes must **not** match any negative filters.

7. **Format**:
   - Return the result as a JSON object in this format:
{
  "recipes": [
    {
      "id": int,
      "name": string,
      "description": string,
      "ingredients": [string],
      "instructions": [string],
      "labels": [string],
      "filterDictionary": {
        // include every key from all filter categories above, each as true or false
      },
      "image": string
    }
  ]
}

Ingredients to use: ${ingredients.join(", ")}
Positive filters (must match all): ${positiveFilters.join(", ")}
Negative filters (must match none): ${negativeFilters.join(", ")}

Generate only recipes that strictly follow all these requirements.
Do not add any additional information or commentary.
Do not include any text outside the JSON response. ONLY respond with the JSON object.
The response MUST BE A VALID JSON WITH NO THER TEXT!!!

Additional Rules:
- The recipe MUST be completely different from these existing recipes: ${existingRecipes.map(r => r.name).join(", ")}
- Do not suggest variations of the same dish
`;

// ---------------- SSE endpoint for streaming recipes ----------------
app.get("/api/recipes/stream", async (req, res) => {
  try {
    const ingredients = JSON.parse(req.query.ingredients || '[]');
    const positiveFilters = JSON.parse(req.query.positiveFilters || '[]');
    const negativeFilters = JSON.parse(req.query.negativeFilters || '[]');
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (ingredients.length === 0) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Clear old recipes for this user
    await Recipe.deleteMany({ user: userId });

    const recipesDir = path.join(process.cwd(), "public", "recipes");
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }

    const filePath = path.join(recipesDir, "recipes.json");
    const generatedRecipes = [];

    let attempts = 0;
    const maxAttempts = 20;

    while (generatedRecipes.length < 8 && attempts < maxAttempts) {
      attempts++;
      try {
        const chatResponse = await axios.post(
          TEXT_API_URL,
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: generatePrompt(ingredients, positiveFilters, negativeFilters, generatedRecipes)
              }
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        let content = chatResponse.data.choices[0].message.content.trim();
        content = content.replace(/^[^{]*({.*})[^}]*$/s, '$1');

        let recipeData;
        try {
          recipeData = JSON.parse(content);
        } catch (parseError) {
          console.error("JSON Parse error:", parseError);
          continue;
        }

        if (!recipeData?.recipes?.[0]) continue;

        let recipe = recipeData.recipes[0];

        const isSimilar = generatedRecipes.some(existingRecipe =>
          checkRecipeSimilarity(existingRecipe, recipe)
        );

        if (isSimilar) {
          console.log("Skipping similar recipe:", recipe.name);
          continue;
        }

        recipe.id = generatedRecipes.length + 1;
        recipe.image = await fetchGoogleImage(recipe.name);
        const nutrition = await getNutritionInfo(recipe);
        Object.assign(recipe, nutrition);

        // Save to DB with userId
        const savedRecipe = new Recipe({ ...recipe, user: userId });
        await savedRecipe.save();

        generatedRecipes.push(recipe);

        fs.writeFileSync(filePath, JSON.stringify({ recipes: generatedRecipes }, null, 2));
        res.write(`data: ${JSON.stringify({ recipe })}\n\n`);
      } catch (iterationError) {
        console.error(`Error in iteration ${attempts}:`, iterationError);
        continue;
      }
    }

    res.write('data: {"done": true}\n\n');
    res.end();
  } catch (error) {
    console.error("Error in SSE:", error);
    res.write('data: {"error": "Failed to generate recipes"}\n\n');
    res.end();
  }
});

// ---------------- GENERATE RECIPES (POST) ----------------
app.post("/api/recipes", async (req, res) => {
  let { ingredients = [], negativeFilters = [], positiveFilters = [], userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  // Handle query param fallback
  if (Object.keys(req.body).length === 0 && req.query) {
    try {
      ingredients = JSON.parse(req.query.ingredients || '[]');
      positiveFilters = JSON.parse(req.query.positiveFilters || '[]');
      negativeFilters = JSON.parse(req.query.negativeFilters || '[]');
    } catch (error) {
      console.error('Error parsing query parameters:', error);
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  }

  if (ingredients.length === 0) {
    return res.status(400).json({ error: "No ingredients provided" });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write('data: {"status": "connected"}\n\n');

  try {
    // 🧹 Delete previous recipes from this user
    await Recipe.deleteMany({ user: userId });

    const generatedRecipes = [];

    for (let i = 0; i < 8; i++) {
      try {
        const chatResponse = await axios.post(
          TEXT_API_URL,
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: generatePrompt(ingredients, positiveFilters, negativeFilters)
              }
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        let content = chatResponse.data.choices[0].message.content.trim();
        content = content.replace(/```json\n?|\n?```/g, '');

        let recipeData;
        try {
          recipeData = JSON.parse(content);
        } catch (parseError) {
          console.error("JSON Parse error:", parseError);
          continue;
        }

        if (!recipeData.recipes?.[0]) continue;

        let recipe = recipeData.recipes[0];
        recipe.id = i + 1;

        recipe.image = await fetchGoogleImage(recipe.name);
        const nutrition = await getNutritionInfo(recipe);
        Object.assign(recipe, nutrition);

        // 👉 Attach user ID before saving
        const savedRecipe = new Recipe({ ...recipe, user: userId });
        await savedRecipe.save();

        generatedRecipes.push(recipe);
        res.write(`data: ${JSON.stringify({ recipe })}\n\n`);
      } catch (iterationError) {
        console.error(`Error in iteration ${i}:`, iterationError);
        continue;
      }
    }

    const recipesDir = path.join(process.cwd(), "public", "recipes");
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }
    const filePath = path.join(recipesDir, "recipes.json");
    fs.writeFileSync(filePath, JSON.stringify({ recipes: generatedRecipes }, null, 2));

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error generating recipes:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to generate recipes" })}\n\n`);
    res.end();
  }
});

// ---------------- SAVE RECIPE ----------------


app.post("/api/save-recipe", async (req, res) => {
  const { recipeData, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const savedRecipe = new SaveRecipe({
      ...recipeData,
      user: userId, // Link to user
    });

    await savedRecipe.save();
    res.status(200).json({ message: "Recipe saved successfully" });
  } catch (err) {
    console.error("Save recipe error:", err);
    res.status(500).json({ message: "Failed to save recipe" });
  }
});

app.get("/api/saved-recipes", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const recipes = await SaveRecipe.find({ user: userId }); // ✅ Only that user's saved recipes
    res.json({ recipes });
  } catch (err) {
    console.error("Error fetching saved recipes:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/save-recipe", async (req, res) => {
  const { id } = req.body;
  try {
    const deleted = await SaveRecipe.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ message: "Recipe not found in favorites" });
    }
    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (err) {
    console.error("Remove recipe error:", err);
    res.status(500).json({ message: "Failed to remove recipe" });
  }
});

// ---------------- GENERATE TTS VOICE ----------------

app.post("/api/tts", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required for TTS." });
  }

  try {
    const ttsResponse = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "tts-1",
        voice: "nova", 
        input: text,
        response_format: "mp3"
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // important for binary audio
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(ttsResponse.data));
  } catch (error) {
    console.error("TTS API error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate speech audio." });
  }
});

const PORT = process.env.PORT || 5000;
if (!process.env.JEST_WORKER_ID) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export { app };
