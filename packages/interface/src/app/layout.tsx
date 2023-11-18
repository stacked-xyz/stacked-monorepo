import "@/app/globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import Providers from "./Providers";

export const fontSans = FontSans({
   subsets: ["latin"],
   variable: "--font-sans",
});

interface RootLayoutProps {
   children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
   return (
      <>
         <html lang="en" suppressHydrationWarning>
            <head />
            <body
               className={cn(
                  "min-h-screen bg-background font-sans antialiased",
                  fontSans.variable
               )}
            >
               <div className="relative flex flex-col min-h-screen">
                  <div className="flex-1">
                     <Providers>{children}</Providers>
                  </div>
               </div>
            </body>
         </html>
      </>
   );
}
