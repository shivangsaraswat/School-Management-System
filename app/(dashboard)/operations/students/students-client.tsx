"use client";

import { useState, useEffect } from "react";
import { formatClassDisplay } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { getStudents } from "@/lib/actions/students";
import type { Student } from "@/db/schema";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverAnchor,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ClassItem {
    id: string;
    name: string;
    sections: string[]; // Kept for backward compatibility, but not used
    students: Record<string, number>; // Kept for backward compatibility
    studentCount?: number; // New field - total students in class
}

interface StudentsClientProps {
    initialClasses: ClassItem[];
    initialYear: string;
    allYears: string[];
}

function StudentSearch() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [data, setData] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setData([]);
            setOpen(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await getStudents({ search: query, limit: 5 });
                setData(results);
                setOpen(true);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="w-full md:w-[400px]">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            placeholder="Search by name or admission no..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => { if (query && data.length > 0) setOpen(true); }}
                            className="pl-9 h-9 bg-background"
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    className="p-0 w-[400px]"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <Command shouldFilter={false}>
                        <CommandList>
                            {loading && <div className="p-4 text-xs text-muted-foreground text-center flex items-center justify-center"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Searching...</div>}
                            {!loading && query && data.length === 0 && (
                                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No student found.</CommandEmpty>
                            )}
                            <CommandGroup>
                                {data.map((student) => (
                                    <CommandItem
                                        key={student.id}
                                        value={student.id}
                                        onSelect={() => {
                                            setOpen(false);
                                            router.push(`/operations/students/student/${student.id}`);
                                        }}
                                        className="flex flex-col items-start gap-1 p-2 cursor-pointer aria-selected:bg-muted"
                                    >
                                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{student.admissionNumber} • {formatClassDisplay(student.className)}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export function StudentsClient({ initialClasses, initialYear, allYears }: StudentsClientProps) {
    const router = useRouter();

    const handleYearChange = (year: string) => {
        router.push(`?year=${year}`, { scroll: false });
    };

    return (
        <>
            {/* Year Selector & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <StudentSearch />
                <Select value={initialYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-full md:w-[140px] h-9 text-sm">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {allYears.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {initialClasses.map((cls) => {
                    // Get student count - use new studentCount or fallback to summing students
                    const totalStudents = cls.studentCount ?? Object.values(cls.students).reduce((a, b) => a + b, 0);

                    return (
                        <Card key={cls.id} className="group hover:shadow-md transition-all duration-300 border-border/50 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/80 to-primary/40" />

                            <CardHeader className="pb-2 pt-4 px-4 space-y-0">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-lg font-bold text-foreground">
                                            {cls.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {totalStudents} Total Students
                                        </p>
                                    </div>
                                    <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-muted text-muted-foreground border border-border/50">
                                        {initialYear}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-4 pb-4 space-y-4">
                                {/* Stats & Action */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-baseline gap-1.5 pl-1">
                                        <span className="text-2xl font-bold text-foreground tracking-tight">
                                            {totalStudents}
                                        </span>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Students</span>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        size="sm"
                                        className="h-8 px-4 text-xs font-medium shadow-sm active:scale-95 transition-all"
                                    >
                                        <Link href={`/operations/students/class/${encodeURIComponent(cls.name)}?year=${initialYear}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
