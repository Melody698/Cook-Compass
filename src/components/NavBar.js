import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Switch } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useDarkMode } from "../utils/darkMode";
import AccessibilityPanel from "./AccessibilityPanel";
import { Drawer } from "@mui/material";

import logo from "../assets/logo.jpg"; // Adjust the path as necessary

function NavBar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
    document.body.style.transition = "background-color 0.3s";
  }, [darkMode]);

  useEffect(() => {
    document.body.style.transition = "background-color 0.3s";
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const userId = sessionStorage.getItem("userId");

    if (userId) {
      try {
        await fetch(`http://localhost:5000/api/recommendations?userId=${userId}`, {
          method: "DELETE",
        });
        console.log("User recommendations cleared on logout.");
      } catch (err) {
        console.error("Failed to clear recommendations on logout:", err);
      }
    }

    sessionStorage.clear();
    localStorage.clear();
    handleMenuClose();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/user-profile");
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: darkMode ? "#333" : "#3f51b5", padding: "5px 20px" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo and title */}
          <Link to="/home" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Cook Compass Logo"
              style={{ width: "40px", height: "40px", marginRight: "10px", borderRadius: "50%" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
              Cook Compass
            </Typography>
          </Link>
  
          {/* Navigation links + user icon */}
          <Box sx={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link to="/home" style={navButtonStyle}>Home</Link>
            <Link to="/recipe-list" style={navButtonStyle}>Recipe Index</Link>
            <Link to="/recipe-recommendations" style={navButtonStyle}>Recommendations</Link>
  
            {/* Always show user icon */}
            <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>
  
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
              <MenuItem>
                Dark Mode
                <Switch checked={darkMode} onChange={toggleDarkMode} />
              </MenuItem>
              <MenuItem onClick={() => { setOpenDrawer(true); handleMenuClose(); }}>
                Accessibility
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
  
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <AccessibilityPanel />
      </Drawer>
    </>
  );  
}

const navButtonStyle = {
  textDecoration: "none",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "8px 12px",
  borderRadius: "5px",
  transition: "background 0.3s",
};

export default NavBar;