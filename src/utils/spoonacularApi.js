const SPOON_API = '76c62d50416045a19ac46031fe792a08'; // Replace with your actual API key
// Rate limiting helper
const rateLimiter = {
  lastCall: 0,
  minDelay: 500, // minimum 500ms between calls
  async waitForLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastCall));
    }
    this.lastCall = Date.now();
  }
};
export const validateIngredient = async (ingredient) => {
  if (!ingredient || ingredient.trim().length === 0) {
    return false;
  }
  try {
    await rateLimiter.waitForLimit();
    const response = await fetch(
      `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(ingredient.trim())}&apiKey=${SPOON_API}&number=1`
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error('Error validating ingredient:', error);
    return false;
  }
};
export const getIngredientSuggestions = async (query) => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&apiKey=${SPOON_API}&number=5`
    );
    const data = await response.json();
    return data.map(item => item.name);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};