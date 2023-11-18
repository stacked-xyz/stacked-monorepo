"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Composition } from "@/components/ui/composition";
import { BalanceList } from "@/components/ui/balance-list";
import { TopUp } from "@/components/top-up";
import NoAllocation from "@/components/no-allocation";
import { AfterOnRamp } from "@/components/after-onramp";
import { useRouter } from "next/navigation";
import { OrderHistory } from "@/components/order-history";

import { getAllocationObject } from "@/lib/utils";
import { useComposition } from "@/store/allocationsContext";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";

export default function Home() {
  const { isAuthenticated } = useAccountAbstraction();
  const { composition } = useComposition();
  const router = useRouter();

  console.log({ composition });

  if (!isAuthenticated) {
    router.push("/login");
  }

  const allocations = getAllocationObject();
  const hasAllocation = Object.values(allocations).some((value) => value > 0);

  return (
    <>
      <div className="hidden flex-col md:flex md:px-8">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            {/* <TeamSwitcher /> */}
            {/* <MainNav className="mx-6" /> */}
            <div className="ml-auto flex items-center space-x-4">
              {/* <Search />
                <UserNav /> */}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Total Balance</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
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
                  <BalanceList
                    balances={[
                      { symbol: "BTC", asset: "Bitcoin", balance: 4567 },
                      { symbol: "ETH", asset: "Ethereum", balance: 2400 },
                    ]}
                  />
                  <TopUp wallet="TODO" />
                  <AfterOnRamp />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Composition</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 relative flex items-center justify-center">
                <Composition allocations={allocations} />
                {hasAllocation ? (
                  <NoAllocation allocations={allocations} />
                ) : null}
              </CardContent>
            </Card>
          </div>
            <Card>
              <OrderHistory wallet="" chainId={1}/>
            </Card>
        </div>
      </div>
    </>
  );
}
