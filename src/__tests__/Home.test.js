
import { render, screen } from "@testing-library/react";
import Home from "../pages/Home";
import { MemoryRouter } from "react-router-dom";

describe("Home Component", () => {
  test("renders layout and sections", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cook Compass/i)).toBeInTheDocument();
    expect(screen.getByText(/Recipe Suggestions/i)).toBeInTheDocument();
  });
});
