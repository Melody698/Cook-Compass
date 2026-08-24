import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Instructions from "../pages/Instructions"; 
import RecRecipe from "../backend/public/recipes/Recommendations.json";
import { useParams } from "react-router-dom";

// This test case is outdated, and does not work with the changed structure of the Instructions cases
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useParams: jest.fn(),
    };
});

useParams.mockReturnValue({ id: testRecipe.id.toString() });

describe("Instructions Component", () => {
    test("renders recipe instructions correctly", () => {
        const testRecipe = RecRecipe.recipes[0]; // Use the first recipe from JSON
        require("react-router-dom").useParams.mockReturnValue({ id: testRecipe.id.toString() });

        render(
            <MemoryRouter initialEntries={[`/instructions/${testRecipe.id}`]}>
                <Routes>
                    <Route path="/instructions/:id" element={<Instructions />} />
                </Routes>
            </MemoryRouter>
        );

        // Check if recipe name appears
        expect(screen.getByText(testRecipe.name)).toBeInTheDocument();

        // Check if ingredients are rendered
        testRecipe.ingredients.forEach((ingredient) => {
            expect(screen.getByText(ingredient)).toBeInTheDocument();
        });

        // Check if instructions are displayed
        expect(screen.getByText(testRecipe.instructions)).toBeInTheDocument();
    });

    test("displays 'Recipe not found' when ID does not match", () => {
        require("react-router-dom").useParams.mockReturnValue({ id: "99999" }); // ID that doesn't exist

        render(
            <MemoryRouter initialEntries={["/instructions/99999"]}>
                <Routes>
                    <Route path="/instructions/:id" element={<Instructions />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Recipe not found.")).toBeInTheDocument();
    });
});