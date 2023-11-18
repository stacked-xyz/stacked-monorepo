import { AccountAbstractionProvider } from "@/store/accountAbstractionContext";
import { CompositionProvider } from "@/store/allocationsContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
   return <AccountAbstractionProvider>
            <CompositionProvider>
               {children}
            </CompositionProvider>
         </AccountAbstractionProvider>;
};

export default Providers;
