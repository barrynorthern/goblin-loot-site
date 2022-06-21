import React from 'react';
import logo from './collection.svg';
import { Box, Typography /*, Button*/ } from '@mui/material';
import './App.css';
//import { useWeb3 } from './Hooks/useWeb3';

function App() {
  // const { connect } = useWeb3();

  return (
    <Box className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Typography variant="h1">
          Coming Soon
        </Typography>
        <Typography variant="h2" className="text-dim">
          (We iz stil lookin in caves fer fings)
        </Typography>
        {/* <button onClick={connect}>Connect</button> */}
      </header>
    </Box>
  );
}

export default App;
