import { useParams } from "react-router-dom";

function RecipeDetails() {
  let { id } = useParams();
  return <h2>Recipe Details for ID: {id}</h2>;
}

export default RecipeDetails;