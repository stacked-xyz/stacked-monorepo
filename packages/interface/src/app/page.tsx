
"use client";


import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Composition } from "@/components/ui/composition";
import { BalanceList } from "@/components/ui/balance-list";
import NoAllocation from "@/components/no-allocation";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { useComposition } from "@/store/allocationsContext";
import { TopUp } from "@/components/top-up";
import { AfterOnRamp } from "@/components/after-onramp";


import { getAllocationObject } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function Home() {

  const { isAuthenticated } = useAccountAbstraction();
  const { composition } = useComposition();
  const router = useRouter();

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
            <div className="ml-auto flex items-center space-x-4">
            <Card>
       <CardContent>
       <BalanceList
                    balances={[
                      { symbol: "BTC", asset: "Bitcoin", balance: 4567 },
                      { symbol: "ETH", asset: "Ethereum", balance: 2400 },
                    ]}
                  />
                  <TopUp wallet="TODO" />
                  <AfterOnRamp />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Composition</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 relative flex items-center justify-center ">
                {hasAllocation ? (
                  <NoAllocation allocations={allocations} />
                ) : (
                  <Composition allocations={allocations} />
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );

}
