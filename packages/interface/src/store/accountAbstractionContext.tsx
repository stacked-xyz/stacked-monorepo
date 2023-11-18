"use client";

import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react";
import { ethers, utils } from "ethers";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { Web3AuthModalPack } from "@safe-global/auth-kit";
import { initialChain } from "../chains/chains";
import { getChain } from "../utils/getChain";

const RPC_URL = "https://eth-goerli.public.blastapi.io";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

type accountAbstractionContextValue = {
   ownerAddress?: string;
   chainId: string;
   isAuthenticated: boolean;
   ready: boolean;
   web3Provider?: ethers.providers.Web3Provider;
   loginWeb3Auth: () => void;
   logoutWeb3Auth: () => void;
   setChainId: (chainId: string) => void;
};

const initialState = {
   isAuthenticated: false,
   ready: false,
   loginWeb3Auth: () => {},
   logoutWeb3Auth: () => {},
   setChainId: () => {},
   chainId: initialChain.id,
};

const accountAbstractionContext =
   createContext<accountAbstractionContextValue>(initialState);

const useAccountAbstraction = () => {
   const context = useContext(accountAbstractionContext);

   if (!context) {
      throw new Error(
         "useAccountAbstraction should be used within a AccountAbstraction Provider"
      );
   }

   return context;
};

const AccountAbstractionProvider = ({
   children,
}: {
   children: React.ReactNode;
}) => {
   // owner address from the email  (provided by web3Auth)
   const [ownerAddress, setOwnerAddress] = useState<string>("");

   // chain selected
   const [chainId, setChainId] = useState<string>(() => {
      return initialChain.id;
   });

   const [ready, setReady] = useState<boolean>(false);

   // web3 provider to perform signatures
   const [web3Provider, setWeb3Provider] =
      useState<ethers.providers.Web3Provider>();

   const isAuthenticated = !!ownerAddress && !!chainId;
   const chain = getChain(chainId) || initialChain;

   useEffect(() => {
      setOwnerAddress("");
      setChainId(chain.id);
      setWeb3Provider(undefined);
   }, [chain]);

   // authClient
   const [web3AuthModalPack, setWeb3AuthModalPack] =
      useState<Web3AuthModalPack>();

   // This effect is initializing the auth kit when chain changes
   useEffect(() => {
      (async () => {
         // Create options for auth kit
         const options: Web3AuthOptions = {
            clientId:
               process.env.REACT_APP_WEB3AUTH_CLIENT_ID ||
               "BNgmLOYGOV5Zw0VsoCKlZ6i1ylOqMuCBvkxlTAISsyBX6-9YvHhFmu228dSeigr0XZEx9xFVNwf0AsR7B_ed4LI",
            web3AuthNetwork: "testnet",
            chainConfig: {
               chainNamespace: CHAIN_NAMESPACES.EIP155,
               chainId: chain.id,
               rpcTarget: chain.rpcUrl,
            },
            uiConfig: {
               theme: "dark",
               loginMethodsOrder: ["google", "facebook"],
            },
         };

         // Config for login modal
         const modalConfig = {
            [WALLET_ADAPTERS.TORUS_EVM]: {
               label: "torus",
               showOnModal: false,
            },
            [WALLET_ADAPTERS.METAMASK]: {
               label: "metamask",
               showOnDesktop: true,
               showOnMobile: false,
            },
         };

         // Init openlogin
         const openloginAdapter = new OpenloginAdapter({
            loginSettings: {
               mfaLevel: "mandatory",
            },
            adapterSettings: {
               uxMode: "popup",
               whiteLabel: {
                  name: "Safe",
               },
            },
         });

         const web3AuthModalPack = new Web3AuthModalPack({
            txServiceUrl: chain.transactionServiceUrl,
         });

         await web3AuthModalPack.init({
            options,
            adapters: [openloginAdapter],
            modalConfig,
         });

         setWeb3AuthModalPack(web3AuthModalPack);
      })();
   }, [chain]);

   // auth-kit implementation
   const loginWeb3Auth = useCallback(async () => {
      if (!web3AuthModalPack) {
         return;
      }

      try {
         const { safes, eoa } = await web3AuthModalPack.signIn();
         const provider =
            web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider;

         // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
         setChainId(chain.id);
         setOwnerAddress(eoa);
         setWeb3Provider(new ethers.providers.Web3Provider(provider));
      } catch (error) {
         console.log("error: ", error);
      }
   }, [chain, web3AuthModalPack]);

   // This effect will try to see if the user is logged in already
   useEffect(() => {
      if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
         (async () => {
            await loginWeb3Auth();
            setReady(true);
         })();
      } else {
         setReady(true);
      }
   }, [web3AuthModalPack, loginWeb3Auth]);

   const logoutWeb3Auth = () => {
      web3AuthModalPack?.signOut();
      setOwnerAddress("");
      setChainId(chain.id);
      setWeb3Provider(undefined);
   };

   const state = {
      ownerAddress,
      chainId,
      chain,
      isAuthenticated,
      web3Provider,
      loginWeb3Auth,
      logoutWeb3Auth,
      setChainId,
      ready,
   };

   return (
      <accountAbstractionContext.Provider value={state}>
         {children}
      </accountAbstractionContext.Provider>
   );
};

export { useAccountAbstraction, AccountAbstractionProvider };
