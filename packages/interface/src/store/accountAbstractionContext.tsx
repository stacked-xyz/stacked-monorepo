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
import Safe, {
  EthersAdapter,
  SafeAccountConfig,
  predictSafeAddress,
  SafeFactory,
} from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";

import { Web3AuthModalPack } from "@safe-global/auth-kit";
import usePolling from "../hooks/usePolling";
import { initialChain } from "../chains/chains";
import { getChain } from "../utils/getChain";

const txServiceUrl = "https://safe-transaction-goerli.safe.global";
const RPC_URL = "https://eth-goerli.public.blastapi.io";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

type accountAbstractionContextValue = {
  ownerAddress?: string;
  chainId: string;
  safes: string[];
  isAuthenticated: boolean;
  web3Provider?: ethers.providers.Web3Provider;
  loginWeb3Auth: () => void;
  logoutWeb3Auth: () => void;
  setChainId: (chainId: string) => void;
  safeSelected?: string;
  safeBalance?: string;
  setSafeSelected: React.Dispatch<React.SetStateAction<string>>;
};

const initialState = {
  isAuthenticated: false,
  loginWeb3Auth: () => {},
  logoutWeb3Auth: () => {},
  relayTransaction: async () => {},
  setChainId: () => {},
  setSafeSelected: () => {},
  onRampWithStripe: async () => {},
  safes: [],
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

  // safes owned by the user
  const [safes, setSafes] = useState<string[]>([]);

  // chain selected
  const [chainId, setChainId] = useState<string>(() => {
    return initialChain.id;
  });

  // web3 provider to perform signatures
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider>();

  const isAuthenticated = !!ownerAddress && !!chainId;
  const chain = getChain(chainId) || initialChain;

  useEffect(() => {
    setOwnerAddress("");
    setSafes([]);
    setChainId(chain.id);
    setWeb3Provider(undefined);
    setSafeSelected("");
  }, [chain]);

  // authClient
  const [web3AuthModalPack, setWeb3AuthModalPack] =
    useState<Web3AuthModalPack>();

  useEffect(() => {
    (async () => {
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
    if (!web3AuthModalPack) return;

    try {
      const { safes, eoa } = await web3AuthModalPack.signIn();
      const provider =
        web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider;

      // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
      setChainId(chain.id);
      setOwnerAddress(eoa);
      setSafes(safes || []);
      setWeb3Provider(new ethers.providers.Web3Provider(provider));
    } catch (error) {
      console.log("error: ", error);
    }
  }, [chain, web3AuthModalPack]);

  useEffect(() => {
    if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
      (async () => {
        await loginWeb3Auth();
      })();
    }
  }, [web3AuthModalPack, loginWeb3Auth]);

  const logoutWeb3Auth = () => {
    web3AuthModalPack?.signOut();
    setOwnerAddress("");
    setSafes([]);
    setChainId(chain.id);
    setWeb3Provider(undefined);
    setSafeSelected("");
  };

  // current safe selected by the user
  const [safeSelected, setSafeSelected] = useState<string>("");

  // TODO: add disconnect owner wallet logic ?

  // conterfactual safe Address if its not deployed yet
  useEffect(() => {
    const getSafeAddress = async () => {
      if (web3Provider) {
        const signer = web3Provider.getSigner();

        // accountAbstraction.constructor(signer)
        if (!signer) return;
        const ethAdapter = new EthersAdapter({
          ethers,
          signerOrProvider: signer,
        });

        // accountAbstraction.init()
        const signerAddress = await signer.getAddress();
        const owners = [signerAddress];
        const threshold = 1;

        const safeAccountConfig: SafeAccountConfig = {
          owners,
          threshold,
        };

        const safeAddress = await predictSafeAddress({
          ethAdapter: ethAdapter,
          safeAccountConfig,
        });
        console.log("predicted safeAddress: ", safeAddress);

        const isSafeDeployed = await ethAdapter.isContractDeployed(safeAddress);

        console.log("isSafeDeployed: ", isSafeDeployed);

        let safeSdk;

        if (isSafeDeployed) {
          safeSdk = await Safe.create({
            ethAdapter: ethAdapter,
            safeAddress,
          });
        } else {
          safeSdk = await createSafe(signer, safeAccountConfig);
          const message = await signer.signMessage("hello");
          console.log("message: ", message);

          if (!safeSdk) {
            console.log("safeSdk is undefined, creation failed");
            safeSdk = await Safe.create({
              ethAdapter: ethAdapter,
              predictedSafe: { safeAccountConfig },
            });
          }

          console.log("newSafe: ", safeSdk);
        }

        const hasSafes = safes.length > 0;
        console.log("hasSafes: ", hasSafes);

        const safeSelected = hasSafes ? safes[0] : "address";

        setSafeSelected(safeSelected);
      }
    };

    getSafeAddress();
  }, [safes, web3Provider]);

  // fetch safe address balance with polling
  const fetchSafeBalance = useCallback(async () => {
    const balance = await web3Provider?.getBalance(safeSelected);

    return balance?.toString();
  }, [web3Provider, safeSelected]);

  const safeBalance = usePolling(fetchSafeBalance);

  const state = {
    ownerAddress,
    chainId,
    chain,
    safes,
    isAuthenticated,
    web3Provider,
    loginWeb3Auth,
    logoutWeb3Auth,
    setChainId,
    safeSelected,
    safeBalance,
    setSafeSelected,
  };

  return (
    <accountAbstractionContext.Provider value={state}>
      {children}
    </accountAbstractionContext.Provider>
  );
};

async function createSafe(
  connectedSigner: ethers.providers.JsonRpcSigner,
  safeConfig: SafeAccountConfig
) {
  let newSafe: Safe = {} as Safe;
  console.log("connectedSigner: ", connectedSigner);
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: connectedSigner,
  });

  // Need to send the transaction to relayer to create safe

  // const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter });
  const safeFactory = await SafeFactory.create({
    ethAdapter: ethAdapter,
  });

  console.log("Deploying safe for the first time");

  try {
    newSafe = await safeFactory.deploySafe({
      safeAccountConfig: safeConfig,
    });
    const safeAddress = await newSafe.getAddress();
    console.log(`https://goerli.etherscan.io/address/${safeAddress}`);
    console.log(`https://app.safe.global/gor:${safeAddress}`);
  } catch (error) {
    console.log("An error occurred while deploying Safe");
    console.log(error);
    console.log((error as Error).message);
  }

  return newSafe;
}

export { useAccountAbstraction, AccountAbstractionProvider };
