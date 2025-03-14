import React, { useState } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import TrafficLightMap from './components/TrafficLightMap';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196F3',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1 }}>
          <TrafficLightMap />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
