import { AccountAbstractionProvider } from "@/store/accountAbstractionContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
   return <AccountAbstractionProvider>{children}</AccountAbstractionProvider>;
};

export default Providers;
