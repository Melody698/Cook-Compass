import mongoose from "mongoose";

const saveRecipeSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  ingredients: [String],
  instructions: [String],
  image: String,
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ Link saved recipe to user
});

const SaveRecipe = mongoose.model("SaveRecipe", saveRecipeSchema);
export default SaveRecipe;