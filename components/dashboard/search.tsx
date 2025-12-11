"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Search() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (query.trim()) {
                router.push(`/operations/students?search=${encodeURIComponent(query.trim())}`);
            }
        },
        [query, router]
    );

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search students..."
                className="w-full h-9 pl-9 pr-4 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    );
}
