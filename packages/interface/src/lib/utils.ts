import { Allocations } from "@/components/update-allocation";
import { Composition } from "@stacked-xyz/data-access/src";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map allocations from API into an object
export function getAllocationObject(composition: Composition): Allocations {
  const cryptoAllocation: Allocations = {};
  composition.assets.forEach((symbol, index) => {
    cryptoAllocation[symbol] = composition.allocations[index];
  });
  return cryptoAllocation;
}

export function reverseAllocationObject(allocations: Allocations) {
  const allocationAPIFormat: { allocations: string[]; composition: number[] } =
    {
      allocations: [],
      composition: [],
    };
  for (const symbol in allocations) {
    allocationAPIFormat.allocations.push(symbol);
    allocationAPIFormat.composition.push(allocations[symbol]);
  }
  return allocationAPIFormat;
}
