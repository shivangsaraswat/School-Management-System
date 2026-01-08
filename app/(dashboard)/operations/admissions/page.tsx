import Link from "next/link";
import { UserPlus, Plus, Search, Phone, Mail, Calendar } from "lucide-react";
import { requireOperations } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { getInquiries, getInquiryStatistics } from "@/lib/actions/inquiries";
import { format } from "date-fns";
import { HeaderUpdater } from "@/components/dashboard/header-context";

export default async function AdmissionsPage() {
    await requireOperations();

    // Fetch real data from database
    const [inquiries, stats] = await Promise.all([
        getInquiries({ limit: 20 }),
        getInquiryStatistics(),
    ]);

    const statItems = [
        { label: "Total Inquiries", value: stats.total.toString(), status: "default" },
        { label: "New", value: stats.new.toString(), status: "pending" },
        { label: "Contacted", value: stats.contacted.toString(), status: "warning" },
        { label: "Scheduled", value: stats.scheduled.toString(), status: "pending" },
        { label: "Enrolled", value: stats.enrolled.toString(), status: "success" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <HeaderUpdater
                title="Admissions"
                description="Manage admission inquiries and applications"
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <Button asChild>
                    <Link href="/operations/admissions/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Inquiry
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                {statItems.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search inquiries..." className="pl-9" />
            </div>

            {/* Inquiries Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inquiries.length === 0 ? (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No inquiries yet</p>
                            <p className="text-sm mt-1">Create a new inquiry to get started</p>
                            <Button asChild className="mt-4">
                                <Link href="/operations/admissions/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Inquiry
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    inquiries.map((inquiry) => (
                        <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{inquiry.studentName}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Applying for {inquiry.classAppliedFor}
                                        </p>
                                    </div>
                                    <StatusBadge status={inquiry.status} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm">
                                    <p className="font-medium">{inquiry.parentName}</p>
                                    <p className="text-muted-foreground">Parent/Guardian</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {inquiry.phone}
                                </div>
                                {inquiry.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {inquiry.email}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(inquiry.createdAt), "MMM dd, yyyy")}
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        Call
                                    </Button>
                                    <Button size="sm" className="flex-1">
                                        Update
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
