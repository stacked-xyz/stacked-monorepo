import { BigNumber, providers } from "ethers";

export function useTokenExchangeRates(
    tokens: string[],
    referenceAsset: string,
    ownerAddress: string,
    chainId: number
): { ratesByAddress: Map<string, number> } {
    return { ratesByAddress: new Map<string, number>() };
}