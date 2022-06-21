import logo from './collection.svg';
import { Box, Typography, Button, Stack } from '@mui/material';
import './App.css';
import { useWeb3 } from './Hooks/useWeb3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

function App() {
  const { connect, connected, display } = useWeb3();

  return (
    <Box className="App">
      <Box className="App-header">
        {connected ?
        <Stack direction="row" justifyContent="flex-end" spacing={2} width={'100%'}>
          {display && <Typography sx={{fontSize: '48px', color: 'black', fontWeight: '800'}}>{display}</Typography>}
          {!display && <Typography sx={{fontSize: '48px', color: 'black', fontWeight: '800'}}>...</Typography>}
        </Stack> :
        <Button sx={{fontSize: '24px'}} className="connect-button" variant="contained" color="success" size="large" onClick={connect}>
          <Typography sx={{marginRight: '15px', fontSize: '36px'}}>Connect</Typography><FontAwesomeIcon icon={faEthereum}  />
        </Button>
        }
      </Box>
      <Box className="App-body">
        <Stack direction="column" justifyContent="space-between" alignItems="center" spacing={2} height='100%' width='100%'>
          <img src={logo} className="App-logo" alt="logo" />
          {connected && <Typography variant="h1" className="text-dim">
              Fanks fer connecting! Nuffin to do yet.
            </Typography>}
          {!connected && <Box>
            <Typography variant="h1" sx={{marginBottom: '25px'}}>
              Coming Soon
            </Typography>
            <Typography variant="h2" className="text-dim">
              (We iz stil lookin in caves fer fings)
            </Typography>
          </Box>}
        </Stack>
      </Box>
    </Box>
  );
}

export default App;
