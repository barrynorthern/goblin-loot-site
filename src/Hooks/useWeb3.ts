import { useRef, useState, useEffect } from 'react';
import { createAlchemyWeb3, AlchemyWeb3 } from "@alch/alchemy-web3";
import truncateEthAddress from 'truncate-eth-address'

declare var window: Window & typeof globalThis & { ethereum: any };
declare var ethereum: any;

export function useWeb3() {

    // Using HTTPS
    const web3ref = useRef(createAlchemyWeb3(process.env['REACT_APP_ALCHEMY_API'] || ''));
    const web3: () => AlchemyWeb3 = () => web3ref.current;
    const [ connected, setConnected ] = useState(false);
    const [ address, setAddress ] = useState('');
    const [ display, setDisplay ] = useState('');

    const connectAccount = (accounts: string[]) => {
        if (accounts && accounts.length) {
            console.log("Metamask is ready to go!", accounts);
            setConnected(true);
            setAddress(accounts[0]);
            setDisplay(truncateEthAddress(accounts[0]));
        }
    };
    
    useEffect(() => {
        web3().eth.getAccounts().then(connectAccount);
    }, [])

    const connect = () => {
        setConnected(false);
        setAddress('');
        setDisplay(truncateEthAddress(''));
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
        const result = await web3().alchemy.getTokenMetadata(process.env['REACT_APP_CONTRACT_ADDRESS'] || '');
        return result;
    }

    return {
        connect,
        getTokenMetadata,
        connected,
        address,
        display
    };
}