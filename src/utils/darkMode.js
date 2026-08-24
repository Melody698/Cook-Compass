import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const DarkModeContext = createContext();

// Provider component to wrap your app
export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);

    document.body.classList.remove("dark-mode", "light-mode");
    document.body.classList.add(darkMode ? "dark-mode" : "light-mode");
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// Hook to use in any component
export function useDarkMode() {
  return useContext(DarkModeContext);
}
