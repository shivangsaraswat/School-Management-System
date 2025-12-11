import Link from "next/link";
import { Receipt, Plus, Search, IndianRupee, TrendingUp, AlertCircle } from "lucide-react";
import { requireOperations } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";

// Mock fee data
const recentFees = [
    {
        id: "1",
        studentName: "Rahul Sharma",
        className: "Class 10A",
        feeType: "Tuition Fee",
        amount: 5000,
        status: "paid",
        dueDate: "2024-12-10",
        paidDate: "2024-12-08",
    },
    {
        id: "2",
        studentName: "Priya Singh",
        className: "Class 10A",
        feeType: "Tuition Fee",
        amount: 5000,
        status: "pending",
        dueDate: "2024-12-10",
        paidDate: null,
    },
    {
        id: "3",
        studentName: "Amit Kumar",
        className: "Class 9B",
        feeType: "Transport Fee",
        amount: 2500,
        status: "partial",
        dueDate: "2024-12-10",
        paidDate: null,
    },
    {
        id: "4",
        studentName: "Neha Gupta",
        className: "Class 9A",
        feeType: "Tuition Fee",
        amount: 5000,
        status: "overdue",
        dueDate: "2024-11-10",
        paidDate: null,
    },
];

export default async function FeesPage() {
    await requireOperations();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <Receipt className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Fee Management
                    </h1>
                    <p className="text-muted-foreground">
                        Track and collect student fees
                    </p>
                </div>
                <Button asChild>
                    <Link href="/operations/fees/collect">
                        <Plus className="mr-2 h-4 w-4" />
                        Collect Fee
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-green-600" />
                            <span className="text-2xl font-bold">₹18.2L</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Collected This Month</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <span className="text-2xl font-bold">₹4.8L</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-2xl font-bold">₹1.5L</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Overdue</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-blue-600" />
                            <span className="text-2xl font-bold">91.2%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Collection Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by student name or receipt number..." className="pl-9" />
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Student</th>
                                    <th className="p-4 font-medium">Fee Type</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentFees.map((fee) => (
                                    <tr key={fee.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{fee.studentName}</p>
                                                <p className="text-sm text-muted-foreground">{fee.className}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">{fee.feeType}</td>
                                        <td className="p-4 text-sm font-medium">
                                            ₹{fee.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm">{fee.dueDate}</td>
                                        <td className="p-4">
                                            <StatusBadge status={fee.status} />
                                        </td>
                                        <td className="p-4">
                                            {fee.status === "paid" ? (
                                                <Button variant="ghost" size="sm">
                                                    Receipt
                                                </Button>
                                            ) : (
                                                <Button size="sm">Collect</Button>
                                            )}
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
