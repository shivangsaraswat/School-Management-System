"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addAcademicYear, setSchoolClasses } from "@/lib/actions/settings";
import Link from "next/link";

interface ClassConfig {
    name: string;
    sections: string[];
}

interface ManageClientProps {
    initialYear: string;
    allYears: string[];
    initialClasses: ClassConfig[];
}

// Master list of all possible classes to show in the UI
const MASTER_CLASS_LIST = [
    "Nursery", "LKG", "UKG",
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11", "Class 12"
];

export function ManageClient({ initialYear, allYears, initialClasses }: ManageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedYear, setSelectedYear] = useState(initialYear);

    // State for new year creation
    const [isCreatingYear, setIsCreatingYear] = useState(false);
    const [newYearInput, setNewYearInput] = useState("");

    // State for classes configuration
    // We convert the initialClasses array into a map for easier editing
    // key: Class Name, value: sections array. If missing/empty, it's "disabled" or has no sections
    const [classConfig, setClassConfig] = useState<Record<string, string[]>>(() => {
        const config: Record<string, string[]> = {};
        // Initialize from props
        initialClasses.forEach(c => {
            config[c.name] = c.sections;
        });
        return config;
    });

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        // Navigate to the same page with new query param to fetch data for that year
        router.push(`/operations/students/manage?year=${year}`);
    };

    const handleCreateYear = async () => {
        if (!newYearInput.match(/^\d{4}-\d{4}$/)) {
            toast.error("Invalid format. Use YYYY-YYYY (e.g. 2026-2027)");
            return;
        }

        startTransition(async () => {
            await addAcademicYear(newYearInput);
            setIsCreatingYear(false);
            setNewYearInput("");
            toast.success(`Academic year ${newYearInput} created`);
            handleYearChange(newYearInput); // Switch to new year
        });
    };

    const toggleClass = (className: string, enabled: boolean) => {
        setClassConfig(prev => {
            const next = { ...prev };
            if (enabled) {
                // Enable with default section A if it didn't exist
                if (!next[className] || next[className].length === 0) {
                    next[className] = ["A"];
                }
            } else {
                // Disable (remove sections) or empty array? 
                // Let's keep it but empty sections implies disabled/no students
                // OR we can just remove it from the final list
                delete next[className];
            }
            return next;
        });
    };

    const addSection = (className: string) => {
        const currentSections = classConfig[className] || [];
        const lastSection = currentSections[currentSections.length - 1];
        let nextChar = 'A';

        if (lastSection) {
            // Simple logic to increment character
            // Check if it's single char
            if (lastSection.length === 1) {
                nextChar = String.fromCharCode(lastSection.charCodeAt(0) + 1);
            } else {
                // Fallback or more complex logic if needed
                nextChar = lastSection + "1";
            }
        }

        setClassConfig(prev => ({
            ...prev,
            [className]: [...(prev[className] || []), nextChar]
        }));
    };

    const removeSection = (className: string, sectionToRemove: string) => {
        setClassConfig(prev => ({
            ...prev,
            [className]: (prev[className] || []).filter(s => s !== sectionToRemove)
        }));
    };

    const handleSave = () => {
        startTransition(async () => {
            // Convert map back to array
            const classesToSave: ClassConfig[] = Object.entries(classConfig)
                .filter(([_, sections]) => sections.length > 0) // Only save classes with sections
                .map(([name, sections]) => ({
                    name,
                    sections
                }));

            await setSchoolClasses(classesToSave, selectedYear);
            toast.success(`Configuration for ${selectedYear} saved successfully`);
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Year Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/operations/students">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold">Class Configuration</h2>
                        <p className="text-sm text-muted-foreground">Manage classes and sections for each academic year</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-[180px]">
                        <Select value={selectedYear} onValueChange={handleYearChange} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {allYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="outline" size="icon" onClick={() => setIsCreatingYear(!isCreatingYear)}>
                        <CalendarPlus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* New Year Input */}
            {isCreatingYear && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 flex items-end gap-3">
                        <div className="grid gap-1.5 flex-1">
                            <Label htmlFor="new-year">New Academic Session</Label>
                            <Input
                                id="new-year"
                                placeholder="YYYY-YYYY (e.g. 2026-2027)"
                                value={newYearInput}
                                onChange={(e) => setNewYearInput(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreateYear} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create Session
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Main Configuration Grid */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-3 bg-muted/30 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                            Configure Classes for {selectedYear}
                        </CardTitle>
                        <Button onClick={handleSave} disabled={isPending} className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                    <CardDescription>
                        Toggle classes to enable them for this year and manage their sections.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {MASTER_CLASS_LIST.map((className) => {
                            const isEnabled = !!classConfig[className];
                            const sections = classConfig[className] || [];

                            return (
                                <div key={className} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 transition-colors ${isEnabled ? 'bg-card' : 'bg-muted/10 opacity-70 hover:opacity-100'}`}>
                                    {/* Class Enable/Disable */}
                                    <div className="flex items-center gap-4 w-[200px] shrink-0">
                                        <Switch
                                            id={`switch-${className}`}
                                            checked={isEnabled}
                                            onCheckedChange={(checked) => toggleClass(className, checked)}
                                        />
                                        <Label htmlFor={`switch-${className}`} className="text-base font-medium cursor-pointer">
                                            {className}
                                        </Label>
                                    </div>

                                    {/* Sections Manager */}
                                    {isEnabled && (
                                        <div className="flex-1 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                            <div className="mr-2 text-sm text-muted-foreground font-medium">Sections:</div>
                                            {sections.map((section) => (
                                                <Badge key={section} variant="secondary" className="h-8 px-2 text-sm font-medium gap-1 hover:bg-destructive hover:text-destructive-foreground transition-colors group cursor-pointer" onClick={() => removeSection(className, section)}>
                                                    {section}
                                                    <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                                </Badge>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 rounded-full border-dashed border-2 ml-1"
                                                onClick={() => addSection(className)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
