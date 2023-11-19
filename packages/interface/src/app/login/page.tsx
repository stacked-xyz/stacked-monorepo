"use client";

import Link from "next/link";
import { UserAuthForm } from "@/components/user-auth-form";
import { useRouter } from "next/navigation";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";

export default function AuthenticationPage() {
   // const { isAuthenticated } = useAccountAbstraction();
   // const router = useRouter();

   // if (isAuthenticated) {
   //    router.push("/");
   // }

   return (
      <>
         <div className="container relative flex-col items-center justify-center hidden h-screen md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative flex-col hidden h-full p-10 text-white bg-muted dark:border-r lg:flex">
               <div className="absolute inset-0 bg-zinc-900" />
               <div className="relative z-20 flex items-center text-lg font-medium">
                  <img
                     src="/stacked-logo.svg"
                     alt="Stacked logo"
                     className="h-8 mr-2"
                  />
                  Staked
               </div>
               <div className="relative z-20 mt-auto">
                  <blockquote className="space-y-2">
                     <p className="text-lg">
                        &ldquo;The easiet way to build crypto portfolio for an average human.&rdquo;
                     </p>
                     <footer className="text-sm">With Love. Mento Labs.</footer>
                  </blockquote>
               </div>
            </div>
            <div>
               <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                  <div className="flex flex-col space-y-2 text-center">
                     <h1 className="text-2xl font-semibold tracking-tight">
                        Login to continue
                     </h1>
                  </div>
                  <UserAuthForm />
                  <p className="px-8 text-sm text-center text-muted-foreground">
                     By clicking continue, you agree to our{" "}
                     <Link
                        href="/terms"
                        className="underline underline-offset-4 hover:text-primary"
                     >
                        Terms of Service
                     </Link>{" "}
                     and{" "}
                     <Link
                        href="/privacy"
                        className="underline underline-offset-4 hover:text-primary"
                     >
                        Privacy Policy
                     </Link>
                     .
                  </p>
               </div>
            </div>
         </div>
      </>
   );
}
