"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface FeesHeaderProps {
    currentYear: string;
}

export function FeesHeader({ currentYear }: FeesHeaderProps) {
    return (
        <HeaderUpdater
            title="Fee Management"
            description={`${currentYear} • Balance-based fee tracking`}
        >
            <Button variant="outline" asChild size="sm" className="gap-1.5 h-9 text-sm">
                <Link href="/operations/fees/structure">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Fee Structure</span>
                </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                <Link href="/operations/fees/collect">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Collect Fee</span>
                </Link>
            </Button>
        </HeaderUpdater>
    );
}
