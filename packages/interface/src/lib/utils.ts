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
  composition.allocations.forEach((symbol, index) => {
    cryptoAllocation[symbol] = composition.allocations[index];
  });
  return cryptoAllocation;
}

export function reverseAllocationObject(allocations: Allocations) {
  const allocationAPIFormat: Composition = {
    assets: [],
    allocations: [],
  };
  for (const symbol in allocations) {
    allocationAPIFormat.assets.push(symbol);
    allocationAPIFormat.allocations.push(allocations[symbol]);
  }
  return allocationAPIFormat;
}
