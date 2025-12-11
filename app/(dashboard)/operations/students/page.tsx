"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    UserPlus,
    TrendingUp,
    ChevronRight,
    Settings,
    Eye,
    Calendar,
    Plus,
    X,
    Trash2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Initial data
interface ClassItem {
    id: string;
    name: string;
    sections: string[];
    students: Record<string, number>;
}

const initialClasses: ClassItem[] = [
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

export default function StudentsPage() {
    const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        initialClasses.forEach(cls => {
            initial[cls.id] = cls.sections[0];
        });
        return initial;
    });

    const [selectedYear, setSelectedYear] = useState("2024-2025");
    const [newSectionInput, setNewSectionInput] = useState<Record<string, string>>({});

    const totalStudents = classes.reduce((acc, cls) =>
        acc + Object.values(cls.students).reduce((a, b: any) => a + b, 0), 0
    );

    const handleSectionChange = (classId: string, section: string) => {
        setSelectedSections(prev => ({ ...prev, [classId]: section }));
    };

    const handleAddSection = (classId: string) => {
        const sectionToAdd = newSectionInput[classId]?.trim().toUpperCase();
        if (!sectionToAdd) return;

        setClasses(prev => prev.map(cls => {
            if (cls.id === classId) {
                if (cls.sections.includes(sectionToAdd)) {
                    toast.error(`Section ${sectionToAdd} already exists in ${cls.name}`);
                    return cls;
                }
                toast.success(`Section ${sectionToAdd} added to ${cls.name}`);
                return {
                    ...cls,
                    sections: [...cls.sections, sectionToAdd].sort(),
                    students: { ...cls.students, [sectionToAdd]: 0 }
                };
            }
            return cls;
        }));
        setNewSectionInput(prev => ({ ...prev, [classId]: "" }));
    };

    const handleRemoveSection = (classId: string, sectionToRemove: string) => {
        setClasses(prev => prev.map(cls => {
            if (cls.id === classId) {
                if (cls.sections.length <= 1) {
                    toast.error("A class must have at least one section");
                    return cls;
                }
                const newSections = cls.sections.filter(s => s !== sectionToRemove);
                // Adjust selected section if the currently selected one is removed
                if (selectedSections[classId] === sectionToRemove) {
                    setSelectedSections(prevSelected => ({
                        ...prevSelected,
                        [classId]: newSections[0]
                    }));
                }
                const newStudents = { ...cls.students };
                delete newStudents[sectionToRemove as keyof typeof newStudents];

                toast.success(`Section ${sectionToRemove} removed from ${cls.name}`);
                return {
                    ...cls,
                    sections: newSections,
                    students: newStudents
                };
            }
            return cls;
        }));
    };

    const academicYears = Array.from({ length: 11 }, (_, i) => {
        const startYear = 2025 - i;
        return `${startYear}-${startYear + 1}`;
    });

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
                <div className="flex flex-wrap gap-2 items-center">
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

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Manage Classes</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Manage Classes & Sections</DialogTitle>
                                <DialogDescription>
                                    Add or remove sections for each class.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/20">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">{cls.name}</h3>
                                            <div className="text-xs text-muted-foreground">
                                                {cls.sections.length} Sections
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center mt-1">
                                            {cls.sections.map((section) => (
                                                <Badge key={section} variant="secondary" className="pl-3 pr-1 py-1 h-7 flex items-center gap-1">
                                                    Section {section}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleRemoveSection(cls.id, section)}
                                                    >
                                                        <X className="h-2.5 w-2.5" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                            <div className="flex items-center gap-1 ml-1">
                                                <Input
                                                    className="h-7 w-16 px-2 text-xs"
                                                    placeholder="Add..."
                                                    maxLength={3}
                                                    value={newSectionInput[cls.id] || ""}
                                                    onChange={(e) => setNewSectionInput(prev => ({ ...prev, [cls.id]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddSection(cls.id);
                                                    }}
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7"
                                                    disabled={!newSectionInput[cls.id]}
                                                    onClick={() => handleAddSection(cls.id)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

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
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">{classes.length}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Nursery to Class 12</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Total Sections</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">
                            {classes.reduce((acc, cls) => acc + cls.sections.length, 0)}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">Across all classes</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Avg. per Section</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">
                            {Math.round(totalStudents / classes.reduce((acc, cls) => acc + cls.sections.length, 0))}
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
                                    <th className="text-center py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground">Year</th>
                                    <th className="text-center py-3 px-4 md:px-5 font-medium text-xs md:text-sm text-muted-foreground w-[140px]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((cls) => (
                                    <tr
                                        key={cls.id}
                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 md:px-5">
                                            <div className="font-medium text-sm md:text-base">{cls.name}</div>
                                            <div className="text-xs md:text-sm text-muted-foreground">
                                                {Object.values(cls.students).reduce((a, b: any) => a + b, 0)} total
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
                                                {/* Fallback to first section if selected doesn't exist anymore */}
                                                {cls.students[(selectedSections[cls.id] || cls.sections[0]) as keyof typeof cls.students] || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:px-5 text-center">
                                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                                                {selectedYear}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:px-5 text-center">
                                            <Button asChild variant="default" size="sm" className="gap-1.5 h-8 md:h-9 text-xs md:text-sm">
                                                <Link href={`/operations/students/class/${cls.id}-${selectedSections[cls.id] || cls.sections[0]}`}>
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
