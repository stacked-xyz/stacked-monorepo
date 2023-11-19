"use client";
import React, { createContext, useState, useContext, useCallback } from "react";
import { CompositionRepo, Composition } from "@stacked-xyz/data-access/src/";
import { ethers } from "ethers";

// Define the context shape
interface CompositionContextShape {
   composition: Composition | null;
   loading: boolean;
   error: string | null;
   fetchComposition: (userId: string) => Promise<void>;
   rebalanceComposition: (
      provider: ethers.providers.Web3Provider
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
   const [composition, setComposition] = useState<Composition | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);

   const compositionRepo = new CompositionRepo();
   compositionRepo.init();

   const fetchComposition = async (userId: string) => {
      setLoading(true);
      try {
         const userComposition = await compositionRepo.getComposition(userId);
         console.log(userComposition);
         setComposition(userComposition);
      } catch (e) {
         const error = e as Error;
         setError(error.message);
         // TODO Remove:
         setComposition({
            assets: [
               "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
               "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252"
            ],
            allocations: [
               0.5,
               0.5
            ]
         })
      } finally {
         setLoading(false);
      }
   };

   const updateComposition = async (
      userId: string,
      composition: Composition,
      chain = 5
   ) => {
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

   async function rebalanceComposition(signer: ethers.providers.Web3Provider) {
      if (!composition) {
         alert("Rebalancing did not run as there is no composition");
         return;
      }

      try {
         console.log("Initiating rebalance");

         alert("Rebalancing Baby!");
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
