import React from "react";
import { Button } from "@/components/ui/button";

export function RebalanceButton({
   doRebalance,
}: {
   doRebalance: () => Promise<void>;
}) {
   return (
      <div>
         <Button variant="outline" type="button" onClick={doRebalance}>
            {"Rebalance"}
         </Button>
      </div>
   );
}
