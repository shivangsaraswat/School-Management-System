"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    UserPlus,
    TrendingUp,
    ChevronRight,
    Settings,
    Eye,
} from "lucide-react";

// All classes in school from Nursery to 12th
const allClasses = [
    { id: "nursery", name: "Nursery", sections: ["A"], students: { A: 28 } },
    { id: "lkg", name: "LKG", sections: ["A", "B"], students: { A: 30, B: 28 } },
    { id: "ukg", name: "UKG", sections: ["A", "B"], students: { A: 32, B: 30 } },
    { id: "1", name: "Class 1", sections: ["A", "B", "C"], students: { A: 40, B: 38, C: 35 } },
    { id: "2", name: "Class 2", sections: ["A", "B", "C"], students: { A: 42, B: 40, C: 38 } },
    { id: "3", name: "Class 3", sections: ["A", "B"], students: { A: 45, B: 43 } },
    { id: "4", name: "Class 4", sections: ["A", "B"], students: { A: 44, B: 42 } },
    { id: "5", name: "Class 5", sections: ["A", "B", "C"], students: { A: 45, B: 44, C: 40 } },
    { id: "6", name: "Class 6", sections: ["A", "B"], students: { A: 48, B: 46 } },
    { id: "7", name: "Class 7", sections: ["A", "B"], students: { A: 46, B: 45 } },
    { id: "8", name: "Class 8", sections: ["A", "B", "C"], students: { A: 50, B: 47, C: 44 } },
    { id: "9", name: "Class 9", sections: ["A", "B"], students: { A: 48, B: 45 } },
    { id: "10", name: "Class 10", sections: ["A", "B", "C"], students: { A: 45, B: 42, C: 40 } },
    { id: "11", name: "Class 11", sections: ["A"], students: { A: 35 } },
    { id: "12", name: "Class 12", sections: ["A"], students: { A: 32 } },
];

const totalStudents = allClasses.reduce((acc, cls) =>
    acc + Object.values(cls.students).reduce((a, b) => a + b, 0), 0
);

export default function StudentsPage() {
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        allClasses.forEach(cls => {
            initial[cls.id] = cls.sections[0];
        });
        return initial;
    });

    const handleSectionChange = (classId: string, section: string) => {
        setSelectedSections(prev => ({ ...prev, [classId]: section }));
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Students
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Manage student records by class and section
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Manage Classes</span>
                    </Button>
                    <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                        <Link href="/operations/students/add">
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Student</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 text-white shadow-md">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                    <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium opacity-90">Total Students</div>
                        <div className="text-2xl md:text-3xl font-bold mt-1">{totalStudents.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-xs md:text-sm opacity-80 mt-0.5">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>+24 this month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Total Classes</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">{allClasses.length}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Nursery to Class 12</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Total Sections</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">
                            {allClasses.reduce((acc, cls) => acc + cls.sections.length, 0)}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">Across all classes</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Avg. per Section</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">
                            {Math.round(totalStudents / allClasses.reduce((acc, cls) => acc + cls.sections.length, 0))}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">Students</div>
                    </CardContent>
                </Card>
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
                                    <th className="text-center py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground w-[140px]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allClasses.map((cls) => (
                                    <tr
                                        key={cls.id}
                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 md:px-5">
                                            <div className="font-medium text-sm md:text-base">{cls.name}</div>
                                            <div className="text-xs md:text-sm text-muted-foreground">
                                                {Object.values(cls.students).reduce((a, b) => a + b, 0)} total
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
                                                {cls.students[selectedSections[cls.id] as keyof typeof cls.students]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:px-5 text-center">
                                            <Button asChild variant="default" size="sm" className="gap-1.5 h-8 md:h-9 text-xs md:text-sm">
                                                <Link href={`/operations/students/class/${cls.id}-${selectedSections[cls.id]}`}>
                                                    <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    <span className="hidden sm:inline">View</span>
                                                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
