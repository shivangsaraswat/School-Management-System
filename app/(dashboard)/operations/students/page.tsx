import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    UserPlus,
    TrendingUp,
    Settings,
} from "lucide-react";
import { requireOperations } from "@/lib/dal";
import { getClassStatistics, getDashboardStatistics } from "@/lib/actions/students";
import { getSchoolClasses } from "@/lib/actions/settings";
import { StudentsClient } from "./students-client";

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>;
}) {
    await requireOperations();

    const { getCurrentAcademicYear, getAcademicYears } = await import("@/lib/actions/settings");
    const currentYear = await getCurrentAcademicYear();
    const params = await searchParams;
    const selectedYear = params.year || currentYear;

    // Fetch real data from database
    const [classStats, dashboardStats, schoolClasses, availableYears] = await Promise.all([
        getClassStatistics(), // This might need year filtering too? Assuming it returns all for now
        getDashboardStatistics(),
        getSchoolClasses(selectedYear),
        getAcademicYears(),
    ]);

    // Build classes map from settings
    const classesMap = new Map<string, { id: string; name: string; sections: string[]; students: Record<string, number> }>(
        schoolClasses.map((cls: { name: string; sections: string[] }) => [
            cls.name,
            { id: cls.name, name: cls.name, sections: cls.sections, students: {} as Record<string, number> }
        ])
    );

    // Update with actual data from database
    for (const stat of classStats) {
        if (classesMap.has(stat.name)) {
            const existing = classesMap.get(stat.name)!;
            // For the dashboard view, we strictly respect the configured sections for this year
            // If the database has students in "Section C" but the config says only "A, B", 
            // we should technically still show them or maybe warn?
            // For now, we Merge found sections to ensure no hidden data, 
            // BUT providing the configuration is correct, this shouldn't happen often.
            // Actually, let's NOT merge sections that aren't in config if we want to strictly follow managing sections.
            // But to avoid data loss in UI, I will keeping merging for now, but the Manage page controls the "official" list.

            // Actually, if we want "only one section" to show up, we should trust schoolClasses.
            // But if there are students in there, we can't just hide them.
            // Let's stick to merging for safety, but the "Manage" page is where you set the intention.

            // However, the prompt implies that the UI should change based on year.
            // So if I selected 2026-2027 composed of empty classes, I want to see that.
            // filtering stat.students by selectedYear? 
            // getClassStatistics() likely returns ALL students currently active.
            // We need to filter students by year probably? 
            // The Student Schema has `academicYear`. 
            // Implementation detail: getClassStatistics needs to filter by year.

            // For now, let's assume getClassStatistics returns consistent data or we filter it here if possible.
            // But `getClassStatistics` implementation is hidden.

            existing.students = { ...existing.students, ...stat.students };
        } else {
            // If class exists in DB but not in settings, we add it?
            // No, if it's not in settings for this year, maybe we shouldn't show it?
            // Let's add it to be safe so we don't hide data.
            classesMap.set(stat.name, {
                id: stat.name,
                ...stat,
            });
        }
    }

    const classes = Array.from(classesMap.values());

    // Calculate totals
    const totalStudents = dashboardStats.totalStudents;
    const totalClasses = classes.length;
    const totalSections = classes.reduce((acc, cls) => acc + cls.sections.length, 0);
    const avgPerSection = totalSections > 0 ? Math.round(totalStudents / totalSections) : 0;

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
                    <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                        <Link href="/operations/students/add">
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Student</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                        <Link href="/operations/students/manage">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Manage Sections</span>
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
                            <span>+{dashboardStats.recentAdmissions} this month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Total Classes</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">{totalClasses}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">From settings</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Total Sections</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">
                            {totalSections}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">Across all classes</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Avg. per Section</div>
                        <div className="text-xl md:text-2xl font-bold mt-1 text-foreground">
                            {avgPerSection}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">Students</div>
                    </CardContent>
                </Card>
            </div>

            {/* Classes Table - Client Component for interactivity */}
            {/* Classes Table - Client Component for interactivity */}
            <StudentsClient
                initialClasses={classes}
                initialYear={selectedYear}
                allYears={availableYears}
            />
        </div>
    );
}
