"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { HeaderUpdater } from "@/components/dashboard/header-context";

export function TeachersHeader() {
    return (
        <HeaderUpdater
            title="Teachers"
            description="Manage teacher records, documents, and class assignments"
        >
            <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                <Link href="/operations/teachers/add">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Teacher</span>
                </Link>
            </Button>
        </HeaderUpdater>
    );
}
