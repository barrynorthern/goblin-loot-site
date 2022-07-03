import { useState, useEffect, useCallback } from "react";
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
{ type: 'success'/*, tokenUris: string[]*/ } |
{ type: 'fail', error: string };

export function useWeb3() {
  // user information
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  // contract information
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

  const initialise = useCallback(async () => {
    console.log("initialising...");
    try {
      const _totalSupply = await getTotalSupply();
      const _maxSupply = await getMaxSupply();
      const _freeMintAMount = await getFreeMintAmount();
      const _mintPrice = getMintPrice();
      setTotalSupply(_totalSupply);
      setMaxSupply(_maxSupply);
      setFreeMintAmount(_freeMintAMount);
      setMintPrice(_mintPrice);
      console.log("initialised");
    }
    catch(error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    try {
      web3.eth.getAccounts().then(connectAccount);
    } catch (e) {
      console.warn(e);
    }
    initialise();
  }, [initialise]);

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

  const getTotalSupply = async () => {
    const total = await contract.methods.totalSupply().call();
    return parseInt(total, 10);
  };

  const getMaxSupply = async () => {
    const total = await contract.methods.MAX_SUPPLY().call();
    return parseInt(total, 10);
  };

  const getFreeMintAmount = async () => {
    const amount = await contract.methods.FREE_MINT_AMOUNT().call();
    return parseInt(amount, 10);
  };

  const getMintPrice = () => {
    // const price = await contract.methods.mintPrice().call();
    // return price;
    return 0.025; /*ether*/
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

          // const baseURI = await getBaseTokenURI();
          // const tokenIds: string[] = result.events.Transfer
          //   .filter((e: any) => e.event === 'Transfer')
          //   .map((e: any) => e.returnValues["tokenId"] as string);
          
          // const tokenUris = tokenIds.map(id => `${baseURI}${id}`);
          
          setMintStatus({type: 'success'});
        }
        else {
          setMintStatus({type: 'fail', error: 'dev'});
        }
    }
    catch (error: any) {
        console.error(error);
        setMintStatus({type: 'fail', error: "There was a problem"});
    }
  };

  return {
    connect,
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
