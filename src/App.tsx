import React from 'react';
import logo from './collection.jpg';
import './App.css';
import { useWeb3 } from './Hooks/useWeb3';

function App() {
  // const { connect } = useWeb3();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>
          Coming Soon
        </h1>
        <h2 className="text-dim">
          (We iz stil lookin in caves fer fings)
        </h2>
        {/* <button onClick={connect}>Connect</button> */}
      </header>
    </div>
  );
}

export default App;
