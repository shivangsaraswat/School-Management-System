import Link from "next/link";
import { UserPlus, Plus, Search, Phone, Mail, Calendar } from "lucide-react";
import { requireOperations } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";

// Mock inquiry data
const inquiries = [
    {
        id: "1",
        studentName: "Arjun Verma",
        parentName: "Rajesh Verma",
        phone: "+91 9876543220",
        email: "rajesh.verma@email.com",
        classAppliedFor: "Class 5",
        status: "new",
        createdAt: "2024-12-11",
    },
    {
        id: "2",
        studentName: "Ananya Reddy",
        parentName: "Suresh Reddy",
        phone: "+91 9876543221",
        email: "suresh.r@email.com",
        classAppliedFor: "Class 8",
        status: "contacted",
        createdAt: "2024-12-10",
    },
    {
        id: "3",
        studentName: "Kabir Khan",
        parentName: "Ahmed Khan",
        phone: "+91 9876543222",
        email: "ahmed.k@email.com",
        classAppliedFor: "Class 6",
        status: "scheduled",
        createdAt: "2024-12-09",
    },
    {
        id: "4",
        studentName: "Meera Joshi",
        parentName: "Prakash Joshi",
        phone: "+91 9876543223",
        email: "prakash.j@email.com",
        classAppliedFor: "Class 9",
        status: "enrolled",
        createdAt: "2024-12-08",
    },
];

export default async function AdmissionsPage() {
    await requireOperations();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <UserPlus className="h-8 w-8 text-primary" />
                        Admissions
                    </h1>
                    <p className="text-muted-foreground">
                        Manage admission inquiries and applications
                    </p>
                </div>
                <Button asChild>
                    <Link href="/operations/admissions/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Inquiry
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                {[
                    { label: "Total Inquiries", value: "48", status: "default" },
                    { label: "New", value: "12", status: "pending" },
                    { label: "Contacted", value: "15", status: "warning" },
                    { label: "Scheduled", value: "8", status: "pending" },
                    { label: "Enrolled", value: "13", status: "success" },
                ].map((stat) => (
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
                {inquiries.map((inquiry) => (
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
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {inquiry.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {inquiry.createdAt}
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
                ))}
            </div>
        </div>
    );
}
