import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Slider, Box } from "@mui/material";

function AccessibilityPanel({ onSettingsChange }) {
  const [textSize, setTextSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--user-font-size", `${textSize}px`);
    document.body.classList.toggle("high-contrast", highContrast);
    document.body.classList.toggle("dyslexic-font", dyslexicFont);

    localStorage.setItem("accessibility", JSON.stringify({ textSize, highContrast, dyslexicFont }));
  }, [textSize, highContrast, dyslexicFont]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Accessibility Settings</Typography>

      <Box mt={2}>
        <Typography gutterBottom>Text Size</Typography>
        <Slider
          value={textSize}
          onChange={(e, val) => setTextSize(val)}
          min={12}
          max={24}
          step={1}
        />
      </Box>

      <FormControlLabel
        control={<Switch checked={highContrast} onChange={() => setHighContrast(!highContrast)} />}
        label="High Contrast Mode"
      />

      <FormControlLabel
        control={<Switch checked={dyslexicFont} onChange={() => setDyslexicFont(!dyslexicFont)} />}
        label="Use Dyslexia-Friendly Font"
      />
    </Box>
  );
}

export default AccessibilityPanel;
