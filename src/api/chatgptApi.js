import axios from "axios";

const API_URL = "http://localhost:5000/api"; 

export const fetchRecipes = async (ingredients, positiveFilters, negativeFilters, userId) => {
    try {
        const response = await axios.post(`${API_URL}/recipes`, {
            ingredients,
            positiveFilters,
            negativeFilters,
            userId // make sure this is passed if you're still using the POST version
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        throw error;
    }
};

export const createRecipeStream = (ingredients, positiveFilters, negativeFilters, userId) => {
    const params = new URLSearchParams({
        ingredients: JSON.stringify(ingredients),
        positiveFilters: JSON.stringify(positiveFilters),
        negativeFilters: JSON.stringify(negativeFilters),
        userId: userId // ✅ send userId in query
    });

    return new EventSource(`${API_URL}/recipes/stream?${params}`);
};
