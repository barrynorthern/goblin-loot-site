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
import useFetch from "react-fetch-hook";

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
    mintStatus,
    getPayableAmount } = useWeb3();

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
          {connected && <MintingContainer mint={mint} getPayableAmount={getPayableAmount} mintStatus={mintStatus}/>}
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
  getPayableAmount: (quantity: number) => number;
}

function MintPanel({mint, getPayableAmount}: MintPanelProps) {
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
      <Stack direction="row" sx={{marginTop: '15px'}}>
        <Typography variant="h3" sx={{marginRight: '15px'}}>{getPayableAmount(quantity)}</Typography><EthereumIcon/>
      </Stack>
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
  tokenUris: string[]
}

function MintSuccess({tokenUris}: MintSuccessProps) {
  return (<Stack direction="column" spacing="4" className="large">
    <Typography variant="h1">Kongratyewlashuns!</Typography>
    <Stack direction="row" className="nft-container">
      {tokenUris.map((uri, index) => <TokenDisplay key={`token-display-${index}`} uri={uri}/>)}
    </Stack>
  </Stack>);
}

interface MintingContainerProps {
  mintStatus: MintStatus;
  mint: (quantity: number) => void;
  getPayableAmount: (quantity: number) => number;
}

function MintingContainer({mintStatus, mint, getPayableAmount}: MintingContainerProps) {
  return (<Box>
    {mintStatus.type === 'not-minting' && <MintPanel mint={mint} getPayableAmount={getPayableAmount}/>}
    {mintStatus.type === 'pending' && <MintingInProgress/>}
    {mintStatus.type === 'success' && <MintSuccess tokenUris={mintStatus.tokenUris}/>}
    {mintStatus.type === 'fail' && <Typography sx={{color: 'red'}}>{mintStatus.error}</Typography>}
  </Box>);
}

interface Token {
  image: string;
  name: string;
  description: string;
  attributes: TokenAttribute[];
}

interface TokenAttribute {
  trait_type: string,
  value: string;
}

interface TokenDisplayProps {
  uri: string;
}

function TokenDisplay({ uri }: TokenDisplayProps) {
  const { isLoading, data } = useFetch<Token>(uri);

  return (
    <Box className="nft">
      {data && <Box className="nft-image" sx={{backgroundImage: `url(${data.image})`}}></Box>}
      {isLoading && <Box className="nft-image" sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <CircularProgress color="inherit" size={64}/>
        </Box>}
      <Box className="nft-id">
        {data && <Typography variant="h4">{data.name}</Typography>}
        {isLoading && <Typography variant="h4">Loading...</Typography>}
      </Box>
    </Box>
  );
};

export default App;
