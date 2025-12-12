import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "School Management System",
        template: "%s | School Management System",
    },
    description: "Industrial-grade school management system for 10,000+ students",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={outfit.className}>
                <SessionProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <TooltipProvider delayDuration={0}>
                            {children}
                            <Toaster position="top-right" />
                        </TooltipProvider>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
