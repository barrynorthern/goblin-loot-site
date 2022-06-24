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
{ type: 'success', txHash: string, txHashUrl: string } |
{ type: 'fail', error: any };

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

    //set up transaction parameters
    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: address, // must match user's active address.
      value: getPayableAmount(quantity),
      data: contract.methods
        .mint(quantity)
        .encodeABI(),
    };

    //sign the transaction
    try {
        setMintStatus({type: 'pending', quantity});
    
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });

        // test:
        // await delay(3);
        // const txHash = "0x235413e4d783e5a1575d5505391cec3f3f1e67ab5d961f1dcff8ce719f60bb91";
        
        setMintStatus({type: 'success', txHash: truncateEthAddress(txHash), txHashUrl: `https://goerli.etherscan.io/tx/${txHash}`});
    }
    catch (error: any) {
        setMintStatus({type: 'fail', error});
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
    mintStatus
  };
}
