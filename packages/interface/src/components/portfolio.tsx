import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Composition } from "./ui/composition";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { useComposition } from "@/store/allocationsContext";
import { UnknownToken, useTokens } from "@/hooks/useTokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useNormalizedBalances } from "@/hooks/useNormalizedBalances";
import { BigNumber } from "ethers";
import { getAllocationObject } from "@/lib/utils";

export function Portfolio() {
    const { isAuthenticated, ready, web3Provider, ownerAddress, chain, cowApi, numChainId } = useAccountAbstraction();
    const [fetched, setFetched] = useState(false);
    const {
        rebalanceComposition,
        composition: compositionFromServer,
    } = useComposition();

    console.log(compositionFromServer);

    const { tokensByAddress, tokensBySymbol } = useTokens(numChainId)

    const baseAsset = useMemo(() => {
        return tokensByAddress.get(chain.baseAssetAddress.toLowerCase()) || UnknownToken
    }, [chain.baseAssetAddress, tokensByAddress])

    const assets = useMemo(() => {
        const tokensFromComposition = (compositionFromServer?.assets || []).map((symbol) => {
            return (tokensBySymbol.get(symbol) || UnknownToken).address
        })
        return Array.from(new Set(tokensFromComposition.concat([chain.baseAssetAddress])))
    }, [compositionFromServer?.assets, chain.baseAssetAddress])

    const { balancesByAddress } = useTokenBalances(
        assets,
        ownerAddress,
        web3Provider
    )

    const { normalizedBalancesByAddress } = useNormalizedBalances(
        assets,
        balancesByAddress,
        numChainId,
        chain.baseAssetAddress,
        ownerAddress!
    )

    const totalBalance = useMemo((): BigNumber => {
        return assets.reduce(
            (acc, asset) => acc.add(normalizedBalancesByAddress.get(asset) || BigNumber.from(0)),
            BigNumber.from(0)
        )
    }, [assets, baseAsset.decimals, normalizedBalancesByAddress])

    const allocation = useMemo(() => {
        return {
            assets: assets.map((asset) => {
                return tokensByAddress.get(asset.toLocaleLowerCase())?.symbol || "N/A"
            }),
            allocations: assets.map((asset) => {
                const balance = normalizedBalancesByAddress.get(asset) || BigNumber.from(0)
                console.log(balance.toString())
                if (totalBalance.isZero()) return 0;
                const pct = balance.mul(1000000).div(totalBalance).toNumber() / 10000
                console.log(pct);
                return pct;
            })
        }
    }, [assets, normalizedBalancesByAddress, tokensByAddress])

    return (
        <Card className="col-span-2">
        <CardHeader>
            <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center pl-2">
            <Composition allocations={getAllocationObject(allocation)} />
        </CardContent>
        </Card>
    )

}