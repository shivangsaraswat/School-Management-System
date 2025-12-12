"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    Eye,
} from "lucide-react";
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
}

export function StudentsClient({ initialClasses }: StudentsClientProps) {
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        initialClasses.forEach(cls => {
            initial[cls.id] = cls.sections[0] || "A";
        });
        return initial;
    });

    const [selectedYear, setSelectedYear] = useState(() => {
        const currentYear = new Date().getFullYear();
        const month = new Date().getMonth();
        // Academic year starts in April (month 3)
        if (month < 3) {
            return `${currentYear - 1}-${currentYear}`;
        }
        return `${currentYear}-${currentYear + 1}`;
    });

    const handleSectionChange = (classId: string, section: string) => {
        setSelectedSections(prev => ({ ...prev, [classId]: section }));
    };

    const academicYears = Array.from({ length: 11 }, (_, i) => {
        const startYear = 2025 - i;
        return `${startYear}-${startYear + 1}`;
    });

    return (
        <>
            {/* Year Selector */}
            <div className="flex justify-end">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Classes Table */}
            <Card>
                <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                    <CardTitle className="text-sm md:text-base font-medium">All Classes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground w-[180px]">Class</th>
                                    <th className="text-left py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground">Section</th>
                                    <th className="text-center py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground">Students</th>
                                    <th className="text-center py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground">Year</th>
                                    <th className="text-center py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground w-[140px]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialClasses.map((cls) => {
                                    const totalStudents = Object.values(cls.students).reduce((a, b) => a + b, 0);
                                    const currentSection = selectedSections[cls.id] || cls.sections[0];
                                    const sectionStudents = cls.students[currentSection] || 0;

                                    return (
                                        <tr
                                            key={cls.id}
                                            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="py-3 px-4 md:px-5">
                                                <div className="font-medium text-sm md:text-base">{cls.name}</div>
                                                <div className="text-xs md:text-sm text-muted-foreground">
                                                    {totalStudents} total
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 md:px-5">
                                                {cls.sections.length === 1 ? (
                                                    <span className="inline-flex items-center justify-center h-8 px-4 rounded-full text-xs md:text-sm bg-primary/10 text-primary font-medium">
                                                        Section {cls.sections[0]}
                                                    </span>
                                                ) : (
                                                    <div className="inline-flex items-center rounded-full border bg-muted/40 p-1">
                                                        {cls.sections.map((section) => (
                                                            <button
                                                                key={section}
                                                                onClick={() => handleSectionChange(cls.id, section)}
                                                                className={`min-w-[2.5rem] px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${selectedSections[cls.id] === section
                                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                                    }`}
                                                            >
                                                                {section}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 md:px-5 text-center">
                                                <span className="text-lg md:text-xl font-semibold">
                                                    {sectionStudents}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 md:px-5 text-center">
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                                                    {selectedYear}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 md:px-5 text-center">
                                                <Button asChild variant="default" size="sm" className="gap-1.5 h-8 md:h-9 text-xs md:text-sm">
                                                    <Link href={`/operations/students/class/${encodeURIComponent(cls.name)}-${currentSection}?year=${selectedYear}`}>
                                                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                        <span className="hidden sm:inline">View</span>
                                                        <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
