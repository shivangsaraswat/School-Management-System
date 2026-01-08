"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string; // Allow passing extra classes if needed
}

export function PageContainer({ children, className }: PageContainerProps) {
    const pathname = usePathname();
    const isDashboard = pathname === "/";

    return (
        <main
            className={cn(
                "flex flex-1 flex-col gap-6 p-6",
                isDashboard ? "pt-0" : "pt-6",
                className
            )}
        >
            {children}
        </main>
    );
}
