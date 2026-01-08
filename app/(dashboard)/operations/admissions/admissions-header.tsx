"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HeaderUpdater } from "@/components/dashboard/header-context";

export function AdmissionsHeader() {
    return (
        <HeaderUpdater
            title="Admissions"
            description="Manage admission inquiries and applications"
        >
            <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                <Link href="/operations/admissions/new">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Inquiry</span>
                </Link>
            </Button>
        </HeaderUpdater>
    );
}
