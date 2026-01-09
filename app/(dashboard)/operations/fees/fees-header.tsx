"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface FeesHeaderProps {
    currentYear: string;
}

export function FeesHeader({ currentYear }: FeesHeaderProps) {
    return (
        <HeaderUpdater
            title="Fee Overview"
            description={`${currentYear} • Analytics & Oversight`}
        >
            <Button variant="outline" asChild size="sm" className="gap-1.5 h-9 text-sm">
                <Link href="/operations/fees/structure">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Fee Structure</span>
                </Link>
            </Button>
        </HeaderUpdater>
    );
}

