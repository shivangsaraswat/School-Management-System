"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
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
    sections: string[];
    students: Record<string, number>;
}

interface StudentsClientProps {
    initialClasses: ClassItem[];
    initialYear: string;
    allYears: string[];
}

export function StudentsClient({ initialClasses, initialYear, allYears }: StudentsClientProps) {
    const router = useRouter();
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        initialClasses.forEach(cls => {
            initial[cls.id] = cls.sections[0] || "A";
        });
        return initial;
    });

    const handleSectionChange = (classId: string, section: string) => {
        setSelectedSections(prev => ({ ...prev, [classId]: section }));
    };

    const handleYearChange = (year: string) => {
        // Navigate to update URL and trigger server-side data refresh
        router.push(`?year=${year}`, { scroll: false });
    };

    return (
        <>
            {/* Year Selector */}
            <div className="flex justify-end">
                <Select value={initialYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
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
                    const totalStudents = Object.values(cls.students).reduce((a, b) => a + b, 0);
                    const currentSection = selectedSections[cls.id] || cls.sections[0];
                    const sectionStudents = cls.students[currentSection] || 0;

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
                                {/* Compact Section Selector */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/40 overflow-x-auto no-scrollbar">
                                        {cls.sections.map((section) => (
                                            <button
                                                key={section}
                                                onClick={() => handleSectionChange(cls.id, section)}
                                                className={`
                                                    flex-1 min-w-[2rem] h-7 rounded-md text-xs font-semibold transition-all duration-200
                                                    ${selectedSections[cls.id] === section
                                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                                                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                                    }
                                                `}
                                            >
                                                {section}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Compact Stats & Action */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-baseline gap-1.5 pl-1">
                                        <span className="text-2xl font-bold text-foreground tracking-tight">
                                            {sectionStudents}
                                        </span>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Students</span>
                                            <span className="text-[10px] text-muted-foreground/70">in Sec {currentSection}</span>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        size="sm"
                                        className="h-8 px-4 text-xs font-medium shadow-sm active:scale-95 transition-all"
                                    >
                                        <Link href={`/operations/students/class/${encodeURIComponent(cls.name)}-${currentSection}?year=${initialYear}`}>
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
