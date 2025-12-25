import { requireOperations } from "@/lib/dal";
import { getTeachers, getTeachersCount } from "@/lib/actions/teachers";
import { TeachersClient } from "./teachers-client";

export default async function TeachersPage() {
    await requireOperations();

    const [teachers, stats] = await Promise.all([
        getTeachers(),
        getTeachersCount(),
    ]);

    // Calculate linked account count
    const withAccountCount = teachers.filter((t) => t.userId !== null).length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        👨‍🏫 Teachers
                    </h1>
                    <p className="text-muted-foreground">
                        Manage teacher records, documents, and class assignments
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Teachers</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold text-blue-600">{withAccountCount}</div>
                    <div className="text-sm text-muted-foreground">With Account</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-2xl font-bold text-orange-500">
                        {stats.total - withAccountCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Without Account</div>
                </div>
            </div>

            {/* Client Component */}
            <TeachersClient initialTeachers={teachers} />
        </div>
    );
}
