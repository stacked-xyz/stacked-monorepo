import { Allocations } from "@/components/update-allocation";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const allocationFromAPI = {
  allocations: ["BTC", "ETH", "SOL", "AVAX"],
  composition: [40, 20, 20, 20],
};
// Map allocations from API into an object
export function getAllocationObject(): Allocations {
  const cryptoAllocation: Allocations = {};
  allocationFromAPI.allocations.forEach((symbol, index) => {
    cryptoAllocation[symbol] = allocationFromAPI.composition[index];
  });
  return cryptoAllocation;
}
