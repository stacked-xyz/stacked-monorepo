"use client";

import React from "react";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  Dialog,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TokenSelector } from "@/components/token-selector";
import { Composition } from "@/components/ui/composition";

import AllocationSlider from "./allocation-slider";

export type Allocations = {
  [key: string]: number;
};

export function UpdateAllocation({
  allocations,
}: {
  allocations: Allocations;
}) {
  const [selectedToken, setSelectedToken] = React.useState<string>("");
  const [allocationState, setAllocations] =
    React.useState<Allocations>(allocations);

  const updateAllocations = (newPercentage: number) => {
    // Update or add the selected token's percentage
    const newAllocations = {
      ...allocationState,
      [selectedToken]: newPercentage,
    };

    const newAllocationsAdjusted = adjustOtherAllocations(
      newAllocations,
      selectedToken,
      newPercentage
    );

    setAllocations(newAllocationsAdjusted);
  };

  const adjustOtherAllocations = (
    newAllocations: Allocations,
    selectedToken: string,
    newPercentage: number
  ) => {
    // Calculate the total percentage allocated to other tokens
    const totalOtherAllocations = Object.entries(newAllocations)
      .filter(([token, _]) => token !== selectedToken)
      .reduce((sum, [_, percentage]) => sum + percentage, 0);

    // Calculate the adjustment ratio for other allocations
    const adjustmentRatio = (100 - newPercentage) / totalOtherAllocations;

    // Adjust the percentages of other tokens
    Object.keys(newAllocations).forEach((token) => {
      if (token !== selectedToken) {
        newAllocations[token] = Math.round(
          newAllocations[token] * adjustmentRatio
        );
      }
    });

    return newAllocations;
  };

  if (!allocations) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Update Allocation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Alloction</DialogTitle>
          <DialogDescription>
            Make changes to your allocation here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <Composition allocations={allocationState} />
        <TokenSelector
          allocations={allocations}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
        {selectedToken ? (
          <AllocationSlider
            defaultValue={allocationState[selectedToken]}
            onChange={updateAllocations}
          />
        ) : null}
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
