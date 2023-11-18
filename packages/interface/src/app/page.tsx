"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Composition } from "@/components/ui/composition";
import { BalanceList } from "@/components/ui/balance-list";
import { TopUp } from "@/components/top-up";
import NoAllocation from "@/components/no-allocation";
import { AfterOnRamp } from "@/components/after-onramp";
import { useRouter } from "next/navigation";

import { OrderHistory } from "@/components/order-history";
import React from "react";

import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { MainNav } from "@/components/ui/main-nav";
import AuthenticationPage from "./login/page";
import { useComposition } from "@/store/allocationsContext";
import { getAllocationObject } from "@/lib/utils";

export default function Home() {
  const { isAuthenticated, ready } = useAccountAbstraction();
  const router = useRouter();
  const [fetched, setFetched] = React.useState(false);
  const { composition: compositionFromServer, fetchComposition } =
    useComposition();

  React.useEffect(() => {
    if (isAuthenticated && !fetched) {
      fetchComposition("1");
      setFetched(true);
    }
  }, [isAuthenticated, fetchComposition, fetched]);

  if (!ready) return null;

  if (!isAuthenticated) {
    return <AuthenticationPage />;
  }

  const composition = compositionFromServer
    ? getAllocationObject(compositionFromServer)
    : {};

  const hasAllocation = Object.values(composition).some(
    (value) => (value as number) > 0
  );

  return (
    <>
      <div className="flex-col md:flex md:px-8">
        <div className="border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <span className="px-4 text-2xl font-bold tracking-tight">
              Stacked
            </span>
            <MainNav className="mx-6" />
          </div>
        </div>
        <div className="flex-1 p-8 pt-6 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                    <div className="text-2xl font-bold">$45,231.89 USD</div>
                    <p className="text-xs text-muted-foreground">
                      $45,231.89 USD
                    </p>
                  </div>

                  {/* <BalanceList
                    balances={[
                      { symbol: "BTC", asset: "Bitcoin", balance: 4567 },
                      { symbol: "ETH", asset: "Ethereum", balance: 2400 },
                    ]}
                  /> */}
                  <TopUp wallet="TODO" />
                  <AfterOnRamp />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Composition</CardTitle>
              </CardHeader>
              <CardContent className="relative flex items-center justify-center pl-2">
                <Composition
                  allocations={
                    hasAllocation
                      ? composition
                      : getAllocationObject({
                          assets: ["BTC", "ETH", "SOL", "AVAX"],
                          allocations: [40, 20, 20, 20],
                        })
                  }
                />
                {!hasAllocation ? (
                  <NoAllocation allocations={composition} />
                ) : null}
              </CardContent>
            </Card>
          </div>
          {/* <Card>
              <OrderHistory wallet="" chainId={1}/>
            </Card> */}
        </div>
      </div>
    </>
  );
}
