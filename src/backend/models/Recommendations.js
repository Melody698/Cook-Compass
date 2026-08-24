import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  ingredients: [String],
  instructions: [String],
  image: String,
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
export default Recommendation;
