"use client";

import { Card } from "@/components/ui/card";

import { OrderHistory } from "@/components/order-history";
import React from "react";

import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { MainNav } from "@/components/ui/main-nav";
import AuthenticationPage from "./login/page";
import { useComposition } from "@/store/allocationsContext";
import { getAllocationObject } from "@/lib/utils";
import { TotalBalance } from "@/components/total-balance";
import { TargetAllocation } from "@/components/target-allocation";
import { Portfolio } from "@/components/portfolio";

export default function Home() {
   const { isAuthenticated, ready, web3Provider, cowApi } = useAccountAbstraction();
  if (!ready) return null;

   // Maybe not the best way to null check dependencies but works for now
   if (!isAuthenticated || !web3Provider || !cowApi) {
      return <AuthenticationPage />;
   }

  return (
    <>
      <div className="flex-col md:flex md:px-8">
        <div className="border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <span className="px-4 text-2xl font-bold tracking-tight flex items-center">
              <img
                src="/stacked-logo.svg"
                alt="Stacked logo"
                className="h-8 mr-2"
              />
              Stacked
            </span>
            <MainNav className="mx-6" />
          </div>
        </div>
        <div className="flex-1 p-8 pt-6 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Topup your balance. Choose assets and allocations. See how your
              protfolio grows.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <TotalBalance />
            <TargetAllocation />
            <Portfolio />
          </div>
          <Card>
            <OrderHistory />
          </Card>
        </div>
      </div>
    </>
  );
}
