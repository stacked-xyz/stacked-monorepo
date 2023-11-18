import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";

export function MainNav({
   className,
   ...props
}: React.HTMLAttributes<HTMLElement>) {
   const { isAuthenticated, ownerAddress } = useAccountAbstraction();

   console.log("ownerAddress", ownerAddress);

   return (
      <nav
         className={cn("flex items-center space-x-4 lg:space-x-6", className)}
         {...props}
      >
         <div className="">
            <Button variant="outline" type="button">
               {isAuthenticated
                  ? shortenAddress(ownerAddress || "")
                  : "Connect Wallet"}
            </Button>
         </div>
      </nav>
   );
}

function shortenAddress(address: string) {
   if (!address) {
      return "";
   }
   const start = address.substring(0, 6);
   const end = address.substring(address.length - 4);

   return `${start}...${end}`;
}
