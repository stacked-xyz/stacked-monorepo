"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Composition } from "@/components/ui/composition";
import { BalanceList } from "@/components/ui/balance-list";
import NoAllocation from "@/components/no-allocation";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { MainNav } from "@/components/ui/main-nav";
import { useComposition } from "@/store/allocationsContext";

export default function Home() {
   const { isAuthenticated } = useAccountAbstraction();
   const { composition } = useComposition();
   const router = useRouter();

   if (!isAuthenticated) {
      router.push("/login");
   }

   return (
      <>
         <div className="md:hidden">
            <Image
               src="/examples/dashboard-light.png"
               width={1280}
               height={866}
               alt="Dashboard"
               className="block dark:hidden"
            />
            <Image
               src="/examples/dashboard-dark.png"
               width={1280}
               height={866}
               alt="Dashboard"
               className="hidden dark:block"
            />
         </div>
         <div className="flex-col hidden md:flex md:px-8">
            <div className="border-b">
               <div className="flex items-center h-16 px-4">
                  <MainNav className="mx-6" />
                  <div className="flex items-center ml-auto space-x-4">
                     {/* <Search />
                <UserNav /> */}
                  </div>
               </div>
            </div>
            <div className="flex-1 p-8 pt-6 space-y-4">
               <div className="flex items-center justify-between space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                     Dashboard
                  </h2>
               </div>
               <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle>Total Balance</CardTitle>
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           className="w-4 h-4 text-muted-foreground"
                        >
                           <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                     </CardHeader>
                     <CardContent>
                        <div className="flex flex-col gap-8">
                           <div>
                              <div className="text-2xl font-bold">
                                 $45,231.89 USD
                              </div>
                              <p className="text-xs text-muted-foreground">
                                 $45,231.89 USD
                              </p>
                           </div>
                           <BalanceList
                              balances={[
                                 {
                                    symbol: "BTC",
                                    asset: "Bitcoin",
                                    balance: 4567,
                                 },
                                 {
                                    symbol: "ETH",
                                    asset: "Ethereum",
                                    balance: 2400,
                                 },
                              ]}
                           />
                        </div>
                     </CardContent>
                  </Card>
                  <Card className="col-span-3">
                     <CardHeader>
                        <CardTitle>Composition</CardTitle>
                     </CardHeader>
                     <CardContent className="relative flex items-center justify-center pl-2 ">
                        <NoAllocation />
                        <Composition />
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
      </>
   );
}
