"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { HeaderUpdater } from "@/components/dashboard/header-context";

export function StudentsHeader() {
    return (
        <HeaderUpdater
            title="Students"
            description="Manage student records by class"
        >
            <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                <Link href="/operations/students/add">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Student</span>
                </Link>
            </Button>
        </HeaderUpdater>
    );
}
