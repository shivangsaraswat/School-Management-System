"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { Search } from "./search";
import type { Role } from "@/lib/constants";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-transparent">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 h-8 w-8" />
                <Separator orientation="vertical" className="h-5" />
            </div>

            <div className="flex items-center gap-3">
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
            </div>
        </header>
    );
}
