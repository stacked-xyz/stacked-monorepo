"use client";
import React, { createContext, useState, useContext } from "react";
import { CompositionRepo, Composition } from "@stacked-xyz/data-access/src/";

// Define the context shape
interface CompositionContextShape {
  composition: Composition | null;
  loading: boolean;
  error: string | null;
  fetchComposition: (userId: string) => Promise<void>;
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
      setComposition(userComposition);
    } catch (e) {
      const error = e as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateComposition = async (userId: string, composition, chain = 5) => {
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

  return (
    <CompositionContext.Provider
      value={{
        composition,
        loading,
        error,
        fetchComposition,
        updateComposition,
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
    throw new Error("useComposition must be used within a CompositionProvider");
  }
  return context;
};
