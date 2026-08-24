import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

const NutritionInfo = ({ open, onClose, nutrition }) => {
  const { calories, protein, carbs, fats } = nutrition;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Nutrition Info</DialogTitle>
      <DialogContent dividers>
        <Typography>Calories: {calories ?? "N/A"}</Typography>
        <Typography>Protein: {protein ?? "N/A"}g</Typography>
        <Typography>Carbs: {carbs ?? "N/A"}g</Typography>
        <Typography>Fats: {fats ?? "N/A"}g</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NutritionInfo;
