import { chains } from "../chains/chains";

export const getChain = (chainId?: string) => {
   const chain = chains.find((chain) => chain.id === chainId);
   return chain;
};
