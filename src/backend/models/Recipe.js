import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  ingredients: [String],
  instructions: [String],
  image: String,
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to the user
});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
