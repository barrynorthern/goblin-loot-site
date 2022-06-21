import { useRef } from 'react';
import { createAlchemyWeb3, AlchemyWeb3 } from "@alch/alchemy-web3";
import dotenv from 'dotenv';
dotenv.config();

declare var window: Window & typeof globalThis & { ethereum: any };
declare var ethereum: any;

export function useWeb3() {

    // Using HTTPS
    const web3ref = useRef(createAlchemyWeb3(process.env['ALCHEMY_API'] || ''));
    const web3: () => AlchemyWeb3 = () => web3ref.current;

    const connect = () => {
        if (window.ethereum) {
            ethereum
              .enable()
              .then((accounts: any) => {
                console.log("Metamask is ready to go!", accounts);
              })
              .catch((reason: any) => {
                console.warn(reason);
              });
          } else {
            console.warn(`The user doesn't have Metamask installed.`);
          }
    };

    const getTokenMetadata = async () => {
        const result = await web3().alchemy.getTokenMetadata(process.env['CONTRACT_ADDRESS'] || '');
        return result;
    }

    return {
        connect,
        getTokenMetadata
    };
}