import { OrderBookApi, OrderKind, OrderQuoteRequest, OrderQuoteSideKindSell, PartialApiContext } from "@cowprotocol/cow-sdk";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";

export function useNormalizedBalances(
    assets: string[],
    balances: Map<string, BigNumber>,  
    chainId: number,
    referenceAsset: string,
    ownerAddress: string,
): { 
    normalizedBalancesByAddress: Map<string, BigNumber>; 
    loaded: boolean; 
    error: Error | undefined 
} {
    const [ loaded, setLoaded ] = useState(false);
    const [normalizedBalancesByAddress, setNormalizedBalancesByAddress] = useState<Map<string, BigNumber>>(new Map<string, BigNumber>());
    const [ error, setError ] = useState<Error>();

    useEffect(() => {
        (async () => {
            const orderBookApi = new OrderBookApi({ chainId });
            let normalizedBalances = new Map<string, BigNumber>();
            for (const asset of assets) {
                if (asset === referenceAsset) {
                    normalizedBalances.set(asset, balances.get(asset) || BigNumber.from(0));
                    continue;
                }

                const resp = await orderBookApi.getQuote({
                    sellToken: asset,
                    buyToken: referenceAsset,
                    kind: OrderKind.SELL as unknown as OrderQuoteSideKindSell,
                    sellAmountBeforeFee: (balances.get(asset) || BigNumber.from(0)).toString(),
                    from: ownerAddress,
                });
                normalizedBalances.set(asset, BigNumber.from(resp.quote.buyAmount));
            }
            setNormalizedBalancesByAddress(normalizedBalances);
            setLoaded(true);
        })().catch((error: Error) => {
            setError(error);
        })
    }, [referenceAsset, ownerAddress, chainId, setLoaded, setError, assets, balances])

    return { normalizedBalancesByAddress, loaded, error };
}