"use client";
import React, {
   createContext,
   useState,
   useContext,
   useCallback,
   use,
} from "react";
import { CompositionRepo, Composition } from "@stacked-xyz/data-access/dist/";
import { Contract, ethers } from "ethers";
import { sendOrders, TargetAllocation, AssetWeight } from "@stacked-xyz/orders";
import { OrderBookApi } from "@cowprotocol/cow-sdk";
import { useAccountAbstraction } from "./accountAbstractionContext";
import { Token } from "@/hooks/useTokens";

// Define the context shape
interface CompositionContextShape {
   composition: Composition | null;
   loading: boolean;
   error: string | null;
   fetchComposition: (userId: string) => Promise<void>;
   rebalanceComposition: (
      tokenBySymbol: Map<string, Token>,
      provider: ethers.providers.Web3Provider,
      cowApi: OrderBookApi
   ) => Promise<void>;
   updateComposition: (
      userId: string,
      composition: any,
      chain?: number
   ) => Promise<void>;
}

// Create the context
const CompositionContext = createContext<CompositionContextShape | null>(null);

// Provider component interface
interface CompositionProviderProps {
   children: React.ReactNode;
}

// Provider component
export const CompositionProvider = ({ children }: CompositionProviderProps) => {
   const { chain } = useAccountAbstraction();
   const [composition, setComposition] = useState<Composition | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);

   const compositionRepo = new CompositionRepo();
   compositionRepo.init();

   const fetchComposition = async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
         const userComposition = await compositionRepo.getComposition(userId);
         setComposition(userComposition);
      } catch (e) {
         const error = e as Error;
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   const updateComposition = async (
      userId: string,
      composition: Composition,
      chain = 5
   ) => {
      setLoading(true);
      setError(null);
      try {
         const result = await compositionRepo.updateComposition(
            userId,
            composition,
            chain
         );
         return result;
      } catch (e) {
         const error = e as Error;
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   async function rebalanceComposition(
      tokensBySymbol: Map<string, Token>,
      provider: ethers.providers.Web3Provider,
      cowApi: OrderBookApi
   ) {
      if (!composition) {
         alert("Rebalancing did not run as there is no composition");
         return;
      }

      try {
         console.log("Initiating rebalance");

         const signer = provider.getSigner();
         const signerAddress = await signer.getAddress();

         // Create a new target allocation based on the current composition
         const targetAllocation: TargetAllocation = composition.assets.map(
            (asset, index) => ({
               token: tokensBySymbol.get(asset)?.address!,
               weight: composition.allocations[index] / 100,
            })
         );

         // const ERC20_ABI = [
         //    "function balanceOf(address owner) view returns (uint256)",
         //    "function deposit() payable",
         // ];

         // const tokenContract = new Contract(
         //    "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
         //    ERC20_ABI,
         //    signer
         // );
         // await tokenContract.deposit({ value: ethers.utils.parseEther("0.1") });

         const sendResponse = await sendOrders(
            provider,
            signer,
            signerAddress,
            cowApi,
            targetAllocation,
            chain.baseAssetAddress
            // "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d" // TODO: Change the address
         );

         console.log("sendResponse: ");
         console.log({ sendResponse });

         // console.log(signatureTxResponse);
         // for (const order of orders) {
         //    console.log(order.id);
         // }
      } catch (error) {
         console.log("Rebalance failed");
         console.log("error: ", error);
      }
   }

   return (
      <CompositionContext.Provider
         value={{
            composition,
            loading,
            error,
            fetchComposition,
            updateComposition,
            rebalanceComposition,
         }}
      >
         {children}
      </CompositionContext.Provider>
   );
};

// Custom hook to use the context
export const useComposition = () => {
   const context = useContext(CompositionContext);
   if (!context) {
      throw new Error(
         "useComposition must be used within a CompositionProvider"
      );
   }
   return context;
};
