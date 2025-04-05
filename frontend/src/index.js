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
  primaryColor: 'brand', 
  primaryShade: 5, 
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
            backgroundColor: ' #5b4f65',
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
          color: ' #f1e8f7',
        },
      },
    },
    Radio: {
      styles: (theme) => ({
        root: {
            '--radio-icon-size': '9px',
            '--radio-icon-color': '#5b4f65'
        },
      }),
    },
  },
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ColorSchemeScript forceColorScheme="dark" />
    <MantineProvider forceColorScheme="dark" theme={customTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
