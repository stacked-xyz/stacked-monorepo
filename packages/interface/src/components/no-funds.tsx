import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function NoFunds() {
   return (
      <>
         <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Alert className="w-1/2">
               <AlertTitle>Allocate</AlertTitle>
               <AlertDescription className="flex flex-col gap-6">
                  Allocate funds to see your porfolio composition
                  {/* <UpdateAllocation allocations={getAllocationObject()} /> */}
               </AlertDescription>
            </Alert>
         </div>
      </>
   );
}

export default NoFunds;
