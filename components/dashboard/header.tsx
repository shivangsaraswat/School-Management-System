"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { Search } from "./search";
import type { Role } from "@/lib/constants";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useHeader } from "./header-context";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface HeaderProps {
    user: {
        name: string;
        email: string;
        role: Role;
        avatar?: string | null;
    };
}

export function Header({ user }: HeaderProps) {
    const { theme, setTheme } = useTheme();
    const { title, description, backLink, actions } = useHeader();

    // Only show title/description if explicitly set via HeaderUpdater
    const displayTitle = title || "";
    const isDashboard = !displayTitle && !actions;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background/50 backdrop-blur-sm border-b sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 h-8 w-8" />
                <Separator orientation="vertical" className="h-5" />

                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {backLink && (
                            <>
                                <Link href={backLink.href} className="hover:text-foreground transition-colors">
                                    {backLink.label}
                                </Link>
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                        {displayTitle && <span className="font-semibold text-foreground">{displayTitle}</span>}
                    </div>
                    {description && (
                        <p className="text-[10px] md:text-xs text-muted-foreground -mt-0.5 hidden xs:block">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isDashboard ? (
                    <>
                        <div className="hidden md:flex md:w-72 lg:w-80">
                            <Search />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <UserNav user={user} />
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
