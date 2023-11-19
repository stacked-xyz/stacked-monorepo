import { useComposition } from "@/store/allocationsContext";
import NoAllocation from "./no-allocation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Composition } from "./ui/composition";
import { getAllocationObject } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { UpdateAllocation } from "./update-allocation";

export function TargetAllocation() {
  const { isAuthenticated, ready, web3Provider, ownerAddress, cowApi } =
    useAccountAbstraction();
  const [fetched, setFetched] = useState(false);
  const { composition: compositionFromServer, fetchComposition } =
    useComposition();

  useEffect(() => {
    const fetchComp = async () => {
      await fetchComposition(ownerAddress as string);
      setFetched(true);
    };
    if (isAuthenticated && !fetched && ownerAddress) {
      fetchComp();
    }
  }, [isAuthenticated, fetchComposition, fetched, ownerAddress]);

  const composition = compositionFromServer
    ? getAllocationObject(compositionFromServer)
    : {};

  const hasAllocation = Object.values(composition).some(
    (value) => (value as number) > 0
  );

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Target Allocation</CardTitle>
      </CardHeader>
      <CardContent className="relative flex-col items-center justify-center pl-2">
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
        {hasAllocation ? (
          <div className="flex flex-col items-center justify-center">
            <UpdateAllocation allocations={composition} />
          </div>
        ) : null}
        {!hasAllocation ? <NoAllocation allocations={composition} /> : null}
      </CardContent>
    </Card>
  );
}
