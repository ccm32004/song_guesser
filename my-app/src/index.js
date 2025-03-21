import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter} from 'react-router-dom';
import { MantineProvider, ColorSchemeScript, createTheme} from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';

const customTheme = createTheme({
  colorScheme: 'dark',
  autoContrast: true, 
  colors: {
    // Define your custom colors here
    brand: ['#2c1c39', '#44354f', '#5b4f65', '#73687b', '#8a8191', '#a19aa7', '#b9b3bd', '#d0cdd3', '#e8e6e9', '#ffffff'],
    // Override other colors if needed
    dark: ['#2c1c39', '#44354f', '#5b4f65', '#73687b', '#8a8191', '#a19aa7', '#b9b3bd', '#d0cdd3', '#e8e6e9', '#ffffff'],
    text: ['#ffffff'], // Define custom text color
  },
  primaryColor: 'brand', // Set your primary color
  primaryShade: 5, // Set the primary shade
  components: {
    Button: {
      styles: (theme) => ({
        root: {
          backgroundColor: 'transparent',
          borderColor: '#8a8191',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          color: 'white',
          '&:hover': {
            color: 'white',
            backgroundColor: theme.colors.brand[8],
          },
        },
      }),
    },
    Card: {
      styles: (theme) => ({
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }),
    },
    Title: {
      styles: {
        root: {
          color: '#f1e8f7', // Set the welcome text color to purple
        },
      },
    },
  },
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ColorSchemeScript forceColorScheme="dark" />
    <MantineProvider theme={customTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
