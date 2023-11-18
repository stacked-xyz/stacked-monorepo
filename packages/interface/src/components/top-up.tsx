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
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TopUp({ wallet }: { wallet: string }) {
  //const href = `https://onramp.gatefi.com/?merchantId=77f72e08-b9a5-47f9-9cbb-99856c8fffde&wallet=${wallet}&walletLock=1&cryptoCurrency=usdc&redirectUrl=stacked.com?isReturnUrl=true&backToButtonLabel=Return to Stake`
  return (
    <div>
      <Link
        href="https://onramp-sandbox.gatefi.com/?merchantId=1a3d8f5d-5adb-4525-8eee-efdbcc220285&cryptoCurrency=eth&wallet=0x717654f0E07450e47A53e6A33eE191852C47CaF8&walletLock=1&redirectUrl=http://localhost:3000?isReturnUrl=true&backToButtonLabel=Return to Stake"
        //href={href}
        className={cn(
          buttonVariants({ variant: "default" })
        )}>
        Top up Wallet
      </Link>
    </div>
  );
}
