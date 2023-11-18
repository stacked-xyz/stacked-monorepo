"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Allocations } from "./update-allocation";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { Token, useTokens } from "@/hooks/useTokens";

export const allocations = {
  BTC: 60,
  ETH: 40,
};

export function TokenSelector({
  allocations,
  selectedToken,
  setSelectedToken,
  ...props
}: {
  selectedToken: string | undefined;
  setSelectedToken: React.Dispatch<React.SetStateAction<string>>;
  allocations: Allocations;
}) {
  const { numChainId } = useAccountAbstraction()
  const { tokens, tokensBySymbol } = useTokens(numChainId)
  const [open, setOpen] = React.useState(false);

  const getAllocatedAndUnallocatedTokens = () => {
    const allocatedTokens: Token[] = [];
    const unallocatedTokens: Token[] = [];

    tokens.forEach((token) => {
      if (!allocations[token.symbol]) {
        unallocatedTokens.push(token);
      } else {
        allocatedTokens.push(token);
      }
    });

    return { allocatedTokens, unallocatedTokens };
  };

  const { allocatedTokens, unallocatedTokens } =
    getAllocatedAndUnallocatedTokens();

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Load a preset..."
          aria-expanded={open}
          className="flex-1 justify-between w-full"
        >
          {selectedToken
            ? tokensBySymbol.get(selectedToken)!.name
            : "Select a token..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 h-[200px]">
        <Command>
          <CommandInput placeholder="Search tokens..." />
          <CommandList>
            <CommandEmpty>No tokens found.</CommandEmpty>
            {allocatedTokens.length > 0 ? (
              <CommandGroup heading="Allocated Tokens">
                {allocatedTokens.map((token) => {
                  return (
                    <CommandItem
                      key={token.symbol}
                      className="flex gap-8"
                      onSelect={() => {
                        setSelectedToken(token.symbol);
                        setOpen(false);
                      }}
                    >
                      <span>{token.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {allocations[token.symbol]}%
                      </span>

                      {selectedToken && (
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedToken === token.symbol
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}
            <CommandGroup heading="Other Tokens">
              {unallocatedTokens.map((token) => (
                <CommandItem
                  key={token.symbol}
                  onSelect={() => {
                    setSelectedToken(token.symbol);
                    setOpen(false);
                  }}
                >
                  {token.name}
                  {selectedToken && (
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedToken === token.symbol
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
