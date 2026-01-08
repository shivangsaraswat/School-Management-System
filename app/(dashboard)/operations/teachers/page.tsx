import { requireOperations } from "@/lib/dal";
import { getTeachers, getTeachersCount } from "@/lib/actions/teachers";
import { TeachersClient } from "./teachers-client";
import { HeaderUpdater } from "@/components/dashboard/header-context";

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
            <HeaderUpdater
                title="Teachers"
                description="Manage teacher records, documents, and class assignments"
            />

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
