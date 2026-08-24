import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GenInstructions from '../pages/GenInstructions.js';

jest.mock('react-router-dom', () => {
    const original = jest.requireActual('react-router-dom');
    return {
        ...original,
        useParams: jest.fn(),
        useNavigate: jest.fn(),
    };
});

import { useParams, useNavigate } from 'react-router-dom';

jest.mock('../backend/public/recipes/recipes.json', () => ({
    recipes: [
      {
        "id": 1,
        "name": "Miso Glazed Salmon",
        "description": "A delicious and flavorful dish featuring tender salmon with a savory miso glaze.",
        "ingredients": [
        "4 salmon fillets",
        "1/4 cup white miso paste",
        "2 tbsp soy sauce",
        "2 tbsp honey",
        "1 tbsp rice vinegar",
        "1 tsp grated ginger",
        "2 cloves garlic, minced"
        ],
        "instructions": [
            "Preheat oven to 400°F (200°C).",
            "In a bowl, mix miso paste, soy sauce, honey, rice vinegar, ginger, and garlic.",
            "Place salmon fillets on a baking sheet lined with foil.",
            "Brush miso mixture over the salmon.",
            "Bake for 12-15 minutes, or until salmon is cooked through."
        ],
        "image": "https://www.simplyrecipes.com/thmb/xUZjbmfIjPonzap9gME4-MdAtaw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Miso-Salmon-LEAD-6-599f7d68d4d0430598e9d0a664329dce.jpg"
      },
    ],
  }));

import recipes from '../backend/public/recipes/recipes.json';


describe('Instructions Component', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('renders recipe details when a valid id is provided', () => {
        const recipe = recipes.recipes[0]; // using first recipe
        useParams.mockReturnValue({ id: recipe.id.toString() });

        render(
            <MemoryRouter>
                <GenInstructions />
            </MemoryRouter>
        );

        expect(screen.getByText('Recipe Instructions')).toBeInTheDocument();
        expect(screen.getByText(recipe.name)).toBeInTheDocument();
        expect(screen.getByText('Ingredients')).toBeInTheDocument();
        expect(screen.getByText('Instructions')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /step by step mode/i })).toBeInTheDocument();
    });

    it('shows "Recipe not found" if invalid id is provided', () => {
        useParams.mockReturnValue({ id: '999999' }); // id not in JSON

        render(
            <MemoryRouter>
                <GenInstructions />
            </MemoryRouter>
        );

        expect(screen.getByText('Recipe not found.')).toBeInTheDocument();
    });

    it('navigates to step-by-step mode when button is clicked', () => {
        const recipe = recipes.recipes[0];
        useParams.mockReturnValue({ id: recipe.id.toString() });

        render(
            <MemoryRouter>
                <GenInstructions />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /step by step mode/i }));
        expect(mockNavigate).toHaveBeenCalledWith(`/gen-step-by-step/${recipe.id}`);
    });
});