import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filters from '../components/Filters';

const mockFilterList = [
  { category: "Dietary Preferences", filters: ["Vegetarian", "Vegan"] },
  { category: "Cuisine Type", filters: ["Mexican", "Italian"] },
  { category: "Allergen Filters", filters: ["Gluten-Free", "Nut-Free"] },
  { category: "Category Filters", filters: ["Proteins", "Dairy"] },
];

describe('Filters Component', () => {
  const handleSelectFilterChange = jest.fn();

  it('renders positive filter tabs and shows corresponding filters on tab click', async () => {
    render(
      <Filters
        filterList={mockFilterList}
        handleSelectFilterChange={handleSelectFilterChange}
      />
    );

    // Check default tab content
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();

    // Switch to Cuisine Type tab
    const cuisineTab = screen.getByRole('tab', { name: 'Cuisine Type' });
    await userEvent.click(cuisineTab);

    // Now "Mexican" should be visible
    expect(screen.getByText('Mexican')).toBeInTheDocument();
  });

  it('renders negative filters when exclusions button is clicked', async () => {
    render(
      <Filters
        filterList={mockFilterList}
        handleSelectFilterChange={handleSelectFilterChange}
      />
    );

    // Click the Exclusions button
    const exclusionsButton = screen.getByRole('button', { name: /Exclusions/i });
    await userEvent.click(exclusionsButton);

    // Check for a negative filter chip
    expect(screen.getByText('Gluten-Free')).toBeInTheDocument();
  });

  it('calls handleSelectFilterChange when a filter chip is clicked', async () => {
    render(
      <Filters
        filterList={mockFilterList}
        handleSelectFilterChange={handleSelectFilterChange}
      />
    );
  
    const chip = screen.getByText('Vegan');
    await userEvent.click(chip);
  
    expect(handleSelectFilterChange).toHaveBeenCalled();
  });
  
  

  

});
