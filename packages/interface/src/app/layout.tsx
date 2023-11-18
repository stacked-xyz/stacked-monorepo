import "@/app/globals.css";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import Providers from "./Providers";

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
            GeistSans.variable
          )}
        >
          <div className="relative flex min-h-screen flex-col">
            <Providers>{children}</Providers>
          </div>
        </body>
      </html>
    </>
  );
}
