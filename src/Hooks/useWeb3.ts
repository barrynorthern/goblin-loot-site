import { useState, useEffect } from "react";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import truncateEthAddress from "truncate-eth-address";

declare var window: Window & typeof globalThis & { ethereum: any };
declare var ethereum: any;

const web3 = createAlchemyWeb3(process.env["REACT_APP_ALCHEMY_API"] || "");

const contractABI = require("../contract-abi.json");
const contractAddress = process.env["REACT_APP_CONTRACT_ADDRESS"] || "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

export type MintStatus =
{ type: 'not-minting' } |
{ type: 'pending', quantity: number } |
{ type: 'success', tokenUris: string[] } |
{ type: 'fail', error: string };

export function useWeb3() {
  // user information
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  // contract information
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [totalSupply, setTotalSupply] = useState(0);
  const [freeMintAmount, setFreeMintAmount] = useState(0);
  const [mintPrice, setMintPrice] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  // mint information
  const [mintStatus, setMintStatus] = useState<MintStatus>({ type: 'not-minting' });

  const connectAccount = (accounts: string[]) => {
    if (accounts && accounts.length) {
      console.log("Metamask is ready to go!", accounts);
      setConnected(true);
      setAddress(accounts[0]);
      setDisplayAddress(truncateEthAddress(accounts[0]));
    }
  };

  async function initialise() {
    const _tokenMetadata = await getTokenMetadata();
    const _totalSupply = await getTotalSupply();
    const _maxSupply = await getMaxSupply();
    const _freeMintAMount = await getFreeMintAmount();
    const _mintPrice = await getMintPrice();
    setTokenMetadata(_tokenMetadata);
    setTotalSupply(_totalSupply);
    setMaxSupply(_maxSupply);
    setFreeMintAmount(_freeMintAMount);
    setMintPrice(_mintPrice);
  }

  useEffect(() => {
    try {
      web3.eth.getAccounts().then(connectAccount);
    } catch (e) {
      console.warn(e);
    }
    initialise();
  }, []);

  const connect = () => {
    setConnected(false);
    setAddress("");
    setDisplayAddress(truncateEthAddress(""));
    if (window.ethereum) {
      ethereum
        .enable()
        .then(connectAccount)
        .catch((reason: any) => {
          console.warn(reason);
        });
    } else {
      console.warn(`The user doesn't have Metamask installed.`);
    }
  };

  const getTokenMetadata = async () => {
    const result = await web3.alchemy.getTokenMetadata(
      process.env["REACT_APP_CONTRACT_ADDRESS"] || ""
    );
    return result;
  };

  const getTotalSupply = async () => {
    const total = await contract.methods.totalSupply().call();
    return total;
  };

  const getMaxSupply = async () => {
    const total = await contract.methods.MAX_SUPPLY().call();
    return total;
  };

  const getFreeMintAmount = async () => {
    const amount = await contract.methods.freeMintAmount().call();
    return amount;
  };

  const getMintPrice = async () => {
    const price = await contract.methods.mintPrice().call();
    return price;
  };

  const getBaseTokenURI = async () => {
    const uri = await contract.methods.baseTokenURI().call();
    return uri;
  }

  const getPayableAmount = (quantity: number) => {
    let price = 0;
    const newTotal = totalSupply + quantity;

    if (newTotal > freeMintAmount) {
      if (totalSupply < freeMintAmount) {
        const payableQuantity = newTotal - freeMintAmount;
        price = payableQuantity * mintPrice;
      } else {
        price = quantity * mintPrice;
      }
    }

    return price;
  };

  const delay = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

  const mint = async (quantity: number) => {
    
    if (!window.ethereum || address === null) {
      return {
        status:
          "Connect your Metamask wallet to mint",
      };
    }

    if (quantity < 1) {
      return {
        status: "You cannot mint less than 1!",
      };
    }

    try {
        setMintStatus({type: 'pending', quantity});
        
        const result = await contract.methods.mint(quantity).send({
          from: address,
          value: getPayableAmount(quantity)
        });

        console.log(result);

        if (result.status) {

          const baseURI = await getBaseTokenURI();
          const tokenIds: string[] = result.events.Transfer
            .filter((e: any) => e.event === 'Transfer')
            .map((e: any) => e.returnValues["tokenId"] as string);
          
          const tokenUris = tokenIds.map(id => `${baseURI}${id}`);
          
          setMintStatus({type: 'success', tokenUris});
        }
        else {
          setMintStatus({type: 'fail', error: 'dev'});
        }
    }
    catch (error: any) {
        setMintStatus({type: 'fail', error: "There was a problem"});
    }
  };

  return {
    connect,
    tokenMetadata,
    totalSupply,
    maxSupply,
    connected,
    address,
    displayAddress,
    hasMetamask: !!window.ethereum,
    mint,
    mintStatus,
    getPayableAmount
  };
}
