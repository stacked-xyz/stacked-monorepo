"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { Allocations, UpdateAllocation } from "./update-allocation";

const NoAllocation = ({ allocations }: { allocations: Allocations }) => {
  return (
    <>
      <div className="z-10 bg-background/80 backdrop-blur-sm absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
        <Alert className="w-1/2">
          <AlertTitle>Allocate</AlertTitle>
          <AlertDescription className="flex flex-col gap-6">
            Allocate funds to see your porfolio composition
            <UpdateAllocation allocations={allocations} />
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};

export default NoAllocation;
