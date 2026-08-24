import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ThemeProvider } from '@mui/material/styles';
import { DarkModeProvider, useDarkMode } from './utils/darkMode';
import { darkTheme, lightTheme } from './utils/theme';

const ThemedApp = () => {
  const { darkMode } = useDarkMode();

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <App />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DarkModeProvider>
      <ThemedApp />
    </DarkModeProvider>
  </React.StrictMode>
);

reportWebVitals();
