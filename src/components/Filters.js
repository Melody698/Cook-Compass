import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Drawer, Button, IconButton, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function Filters({ filterList, handleSelectFilterChange }) {
  const [inclusionTab, setInclusionTab] = useState(0);
  const [exclusionTab, setExclusionTab] = useState(0);
  const [showExclusions, setShowExclusions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  const negativeFilterCategories = [
    "Category Filters",
    "Ingredient-Specific Filters",
  ];
  const positiveFilterCategories = [
    "Allergen Filters",
    "Dietary Preferences",
    "Cuisine Type",
    "Cooking Time",
    "Meal Type",
    "Cooking Method",
  ];

  const positiveFilters = filterList.filter((f) =>
    positiveFilterCategories.includes(f.category)
  );
  const negativeFilters = filterList.filter((f) =>
    negativeFilterCategories.includes(f.category)
  );

  const currentInclusionCategory = positiveFilters[inclusionTab];
  const currentExclusionCategory = negativeFilters[exclusionTab];

  const toggleFilter = (category, value, intent) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(value);

      const updated = isSelected
        ? current.filter((v) => v !== value)
        : [...current, value];

      console.log(`Toggling filter: ${value} in category: ${category}, intent: ${intent}`);
      handleSelectFilterChange(
        category,
        updated.map((val) => ({ value: val, label: val })),
        intent
      );

      return { ...prev, [category]: updated };
    });
  };

  return (
    <Box sx={{ padding: "24px" }}>
      {/* Preferences */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: "green" }}>
        Preferences
      </Typography>

      <Tabs
        value={inclusionTab}
        onChange={(e, newVal) => setInclusionTab(newVal)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {positiveFilters.map((category) => (
          <Tab key={category.category} label={category.category} />
        ))}
      </Tabs>

      {currentInclusionCategory && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {currentInclusionCategory.filters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              clickable
              onClick={() =>
                toggleFilter(currentInclusionCategory.category, filter, "positive")
              }
              color={
                selectedFilters[currentInclusionCategory.category]?.includes(filter)
                  ? "primary"
                  : "default"
              }
              variant={
                selectedFilters[currentInclusionCategory.category]?.includes(filter)
                  ? "filled"
                  : "outlined"
              }
            />
          ))}
        </Box>
      )}

      {/* Exclusions Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => setShowExclusions(true)}
          sx={{
            position: "fixed",
            top: "150px",
            right: "550px",
            zIndex: 1300,
            borderRadius: "20px",
            paddingX: "16px",
            paddingY: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          Exclusions
        </Button>
      </Box>

      {/* Exclusion Drawer */}
      <Drawer
        anchor="right"
        open={showExclusions}
        onClose={() => setShowExclusions(false)}
      >
        <Box sx={{ width: 520, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" color="error">
              Exclusions
            </Typography>
            <IconButton onClick={() => setShowExclusions(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Tabs
            value={exclusionTab}
            onChange={(e, newVal) => setExclusionTab(newVal)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {negativeFilters.map((category) => (
              <Tab key={category.category} label={category.category} />
            ))}
          </Tabs>

          {currentExclusionCategory && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {currentExclusionCategory.filters.map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  clickable
                  onClick={() =>
                    toggleFilter(currentExclusionCategory.category, filter, "negative")
                  }
                  color={
                    selectedFilters[currentExclusionCategory.category]?.includes(filter)
                      ? "secondary"
                      : "default"
                  }
                  variant={
                    selectedFilters[currentExclusionCategory.category]?.includes(filter)
                      ? "filled"
                      : "outlined"
                  }
                />
              ))}
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

export default Filters;
