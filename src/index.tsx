import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import JinkyWoff from './fonts/Jinky.woff'
import JinkyWoff2 from './fonts/Jinky.woff2';

import { 
  ThemeProvider,
  CssBaseline
} from "@mui/material";
import {
  TypographyOptions
} from "@mui/material/styles/createTypography";
import {
  createTheme
} from "@mui/material";

const typography : TypographyOptions = {
  fontFamily: 'Jinky,Arial',
  fontSize: 13.5,
  button: {
      letterSpacing: "0.08em",
      textTransform: "none",
  },
  h1: {
      fontSize: '72px',
      fontWeight: 500,
      lineHeight: '60%'
  },
  h2: {
    fontSize: '64px',
    fontWeight: 500,
    lineHeight: '80%'
  },
  h3: {
    fontSize: '56px',
    fontWeight: 500,
    lineHeight: '80%'
  },
  h4: {
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  h5: {
      fontWeight: 500,
      fontSize: '2.5rem',
  },
  h6: {
      fontWeight: 400,
      size: "14px"
  }
};

const theme = createTheme({
  typography: typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Jinky';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Jinky'), url(${JinkyWoff}) format('woff'),  url(${JinkyWoff2}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);