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
import { useComposition } from "@/store/allocationsContext";
import { reverseAllocationObject } from "@/lib/utils";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";

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
  const { composition, updateComposition, error, loading } = useComposition();
  const { ownerAddress } = useAccountAbstraction();
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  if (ownerAddress === undefined || ownerAddress === "") return null;

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

  const saveAllocation = async () => {
    const stateForDB = reverseAllocationObject(allocationState);

    try {
      const result = await updateComposition(ownerAddress, stateForDB, 1);
      setOpen(false);
      toast({
        title: "Success",
        description: "Your allocation has been updated.",
      });
    } catch (e) {
      const error = e as Error;
      toast({
        variant: "destructive",
        title: `Error updating your allocation`,
        description: `${error.name}: ${error.message}`,
      });
    }
  };

  console.log({
    error,
    allocationStateForDB: reverseAllocationObject(allocationState),
  });

  if (!allocations) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button disabled={loading} onClick={saveAllocation}>
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              <> Save changes </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
