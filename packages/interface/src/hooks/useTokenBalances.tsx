import { BigNumber, providers } from "ethers";

export function useTokenBalances(
    tokens: string[],
    ownerAddress: string,
    provider: providers.Provider,
): { balancesByAddress: Map<string, BigNumber> } {
    return { balancesByAddress: new Map<string, BigNumber>() };
}