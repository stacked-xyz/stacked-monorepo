import { useComposition } from "@/store/allocationsContext";
import { AfterOnRamp } from "./after-onramp";
import { RebalanceButton } from "./rebalance-button";
import { TopUp } from "./top-up";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo, useState } from "react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useNormalizedBalances } from "@/hooks/useNormalizedBalances";
import { BigNumber, ethers } from "ethers";
import { UnknownToken, useTokens } from "@/hooks/useTokens";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";

export function TotalBalance() {
    const { isAuthenticated, ready, web3Provider, ownerAddress, chain, numChainId } = useAccountAbstraction();
    const [fetched, setFetched] = useState(false);
    const {
        rebalanceComposition,
        composition: compositionFromServer,
    } = useComposition();

    const assets = useMemo(() => {
        return (compositionFromServer?.assets || []).concat([chain.baseAssetAddress])
    }, [compositionFromServer?.assets, chain.baseAssetAddress])


    const { balancesByAddress } = useTokenBalances(
        assets,
        ownerAddress,
        web3Provider
    )
    console.log(balancesByAddress);

    const { normalizedBalancesByAddress } = useNormalizedBalances(
        assets,
        balancesByAddress,
        numChainId,
        chain.baseAssetAddress,
        ownerAddress!
    )
    const doRebalance = async () => {
        if (!web3Provider) return;
        await rebalanceComposition(web3Provider);
    };

    const { tokensByAddress } = useTokens(numChainId)

    const baseAsset = useMemo(() => {
        return tokensByAddress.get(chain.baseAssetAddress.toLowerCase()) || UnknownToken
    }, [chain.baseAssetAddress, tokensByAddress])

    const totalBalance = useMemo((): string => {
        const sumOfBalances = assets.reduce(
            (acc, asset) => acc.add(normalizedBalancesByAddress.get(asset) || BigNumber.from(0)),
            BigNumber.from(0)
        )
        return ethers.utils.formatUnits(sumOfBalances, baseAsset.decimals)
    }, [assets, baseAsset.decimals, normalizedBalancesByAddress])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>Total Balance</CardTitle>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-8">
                    <div>
                        <div className="text-2xl font-bold">
                            {totalBalance} $
                        </div>
                    </div>

                    {/* <BalanceList
                    balances={[
                      { symbol: "BTC", asset: "Bitcoin", balance: 4567 },
                      { symbol: "ETH", asset: "Ethereum", balance: 2400 },
                    ]}
                  /> */}
                    <div className="flex flex-row gap-2">
                        <TopUp wallet="TODO" />
                        <RebalanceButton doRebalance={doRebalance} />
                    </div>
                    <AfterOnRamp />
                </div>
            </CardContent>
        </Card>
    )

}