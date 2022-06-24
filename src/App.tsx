import { useState } from "react";
import logo from "./collection.svg";
import metamaskLogo from "./metamask.svg";
import lineImage from "./line.png";
import { Box, Typography, Button, Stack, Link, Slider } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import "./App.css";
import { useWeb3, MintStatus } from "./Hooks/useWeb3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

const DEFAULT_QUANTITY = 5;

function App() {
  const { 
    hasMetamask, 
    connect, 
    connected, 
    displayAddress, 
    totalSupply, 
    maxSupply,
    mint,
    mintStatus } = useWeb3();

  return (
    <Box className="App">

      <AppHeader 
        totalSupply={totalSupply} 
        maxSupply={maxSupply} 
        connected={connected} 
        displayAddress={displayAddress} 
        connect={connect} 
        hasMetamask={hasMetamask} />

      <Box className="App-body">
        <Stack direction="column" spacing={2}>
          <AppBodyBranding/>
          {!hasMetamask && <MetaMaskInstall/>}
          {hasMetamask && !connected && <MetaMaskConnect connect={connect}/>}
          {connected && <MintingContainer mint={mint} mintStatus={mintStatus}/>}
        </Stack>
      </Box>
    </Box>
  );
}

const EthereumIcon = () => <FontAwesomeIcon icon={faEthereum} />;

interface AppHeaderProps {
  totalSupply: number;
  maxSupply: number;
  connected: boolean;
  displayAddress: string;
  connect: () => void;
  hasMetamask: boolean;
}

function AppHeader({
  totalSupply,
  maxSupply,
  connected,
  displayAddress,
  connect,
  hasMetamask
}
: AppHeaderProps) {
  return (
  <Stack direction="row" justifyContent="space-between" className="App-header">
    <Stack direction="row" justifyContent="flex-start" spacing={1}>
      <Typography>
        {totalSupply}/{maxSupply}
      </Typography>
    </Stack>
    {connected ? (
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        {displayAddress && (
          <Stack direction="row" alignContent="center">
            <Typography sx={{ marginRight: "15px" }}>Connected</Typography>
            <Typography>{displayAddress}</Typography>
          </Stack>
        )}
        {!displayAddress && <Typography>...</Typography>}
      </Stack>
    ) : hasMetamask ? (
      <Button
        sx={{ fontSize: "24px" }}
        className="connect-button"
        variant="contained"
        color="success"
        size="medium"
        onClick={connect}
      >
        <Typography sx={{ marginRight: "15px", fontWeight: "800" }}>
          Connect
        </Typography>
        <EthereumIcon/>
      </Button>
    ) : (
      <></>
    )}
  </Stack>
  );
}

function AppBodyBranding() {
  return (<Box>
    <img src={logo} className="App-logo" alt="logo" />
    <Typography variant="h2" className="text-dim">
      WTF! Iz mostly CRUD!
    </Typography>
    <img className="line-image" src={lineImage} alt="line-break"></img>
  </Box>);
}

function MetaMaskInstall() {
  return (
    <Stack direction="column">
      <Typography variant="h5">
        Please install metamask to connect your wallet
      </Typography>
      <Link
        sx={{ fontSize: "32px" }}
        target="_blank"
        rel="noopener"
        component="button"
        href={`https://metamask.io/download.html`}
      >
        <img
          src={metamaskLogo}
          className="App-mm-logo"
          alt="metamask logo"
        />
      </Link>
    </Stack>
  );
}

interface MetaMaskConnectProps {
  connect: () => void;
}

function MetaMaskConnect({connect}: MetaMaskConnectProps) {
  return (
    <Stack direction="column">
      <Button
        className="mm-connect-button"
        variant="contained"
        color="success"
        size="medium"
        onClick={connect}
      >
        <img
          src={metamaskLogo}
          className="App-mm-logo"
          alt="metamask logo"
        />
      </Button>
    </Stack>
  );
}

interface MintPanelProps {
  mint: (quantity: number) => void;
}

function MintPanel({mint}: MintPanelProps) {
  const valuetext = (value: number, index: number) => `${value}`;
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const handleQuantityChange = (value: number | number[]) => setQuantity(value as number);

  return (
    <Stack direction="column" className="mint-panel">
      <Slider
        aria-label="quantity"
        defaultValue={DEFAULT_QUANTITY}
        getAriaValueText={valuetext}
        valueLabelDisplay="on"
        step={1}
        marks
        min={1}
        max={20}
        onChange={(e, value) => handleQuantityChange(value)}
      />
      <Button
        sx={{ fontSize: "24px" }}
        className="mint-button"
        variant="contained"
        color="success"
        size="medium"
        onClick={() => mint(quantity)}
      >
        <Typography sx={{ fontSize: "78px", marginRight: "20px" }}>Mint</Typography><EthereumIcon/>
      </Button>
    </Stack>
  )
}

function MintingInProgress() {
  return (<Box>
    <Typography>Minting</Typography>
    <CircularProgress color="inherit" size={64}/>
  </Box>);
}

interface MintSuccessProps {
  txHash: string;
  txHashUrl: string;
}

function MintSuccess({txHash, txHashUrl}: MintSuccessProps) {
  return (<Stack direction="column" spacing="4" className="large">
    <Typography variant="h1">Transaction Confirmed</Typography>
    <Typography variant="h5">
      Follow progress here: <Link target="_blank" rel="noopener" href={txHashUrl}>{txHash}</Link>
    </Typography>
  </Stack>);
}

interface MintingContainerProps {
  mintStatus: MintStatus;
  mint: (quantity: number) => void;
}

function MintingContainer({mintStatus, mint}: MintingContainerProps) {
  return (<Box>
    {mintStatus.type === 'not-minting' && <MintPanel mint={mint}/>}
    {mintStatus.type === 'pending' && <MintingInProgress/>}
    {mintStatus.type === 'success' && <MintSuccess txHash={mintStatus.txHash} txHashUrl={mintStatus.txHashUrl}/>}
    {mintStatus.type === 'fail' && <Typography sx={{color: 'red'}}>{mintStatus.error}</Typography>}
  </Box>);
}

export default App;
