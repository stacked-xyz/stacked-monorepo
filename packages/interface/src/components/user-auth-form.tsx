"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
   const [isLoading, setIsLoading] = React.useState<boolean>(false);
   const { loginWeb3Auth } = useAccountAbstraction();

   async function onSubmit(event: React.SyntheticEvent) {
      event.preventDefault();
      setIsLoading(true);

      setTimeout(() => {
         setIsLoading(false);
      }, 3000);
   }

   return (
      <div className={cn("grid gap-6", className)} {...props}>
         <form onSubmit={onSubmit}>
            <div className="grid gap-2">
               <div className="grid gap-1"></div>
               <Button disabled={isLoading} onClick={loginWeb3Auth}>
                  {isLoading && (
                     <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Sign In
               </Button>
            </div>
         </form>
         <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
               <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
               </span>
            </div>
         </div>
         <Button variant="outline" type="button" disabled={isLoading}>
            {isLoading ? (
               <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
            ) : (
               <Icons.gitHub className="w-4 h-4 mr-2" />
            )}{" "}
            Github
         </Button>
      </div>
   );
}
