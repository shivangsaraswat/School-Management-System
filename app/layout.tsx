import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

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
            <body className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans`}>
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

