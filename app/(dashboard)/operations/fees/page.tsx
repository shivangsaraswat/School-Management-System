import Link from "next/link";
import { Receipt, Plus, Search, IndianRupee, TrendingUp, AlertCircle } from "lucide-react";
import { requireOperations } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { getFeeStatistics, getRecentFeeCollections } from "@/lib/actions/fees";
import { format } from "date-fns";

// Helper to format currency
function formatCurrency(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
}

export default async function FeesPage() {
    await requireOperations();

    // Fetch real data from database
    const [feeStats, recentFees] = await Promise.all([
        getFeeStatistics(),
        getRecentFeeCollections(10),
    ]);

    const total = feeStats.collected + feeStats.pending + feeStats.overdue;
    const collectionRate = total > 0 ? ((feeStats.collected / total) * 100).toFixed(1) : "0";

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
                            <span className="text-2xl font-bold">{formatCurrency(feeStats.collected)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Collected This Month</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <span className="text-2xl font-bold">{formatCurrency(feeStats.pending)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-2xl font-bold">{formatCurrency(feeStats.overdue)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Overdue</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-blue-600" />
                            <span className="text-2xl font-bold">{collectionRate}%</span>
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
                                    <th className="p-4 font-medium">Receipt No.</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentFees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No fee collections yet. Start by collecting fees from students.
                                        </td>
                                    </tr>
                                ) : (
                                    recentFees.map((fee) => (
                                        <tr key={fee.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{fee.studentName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {fee.className} - {fee.section}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-mono">{fee.receiptNumber || "N/A"}</td>
                                            <td className="p-4 text-sm font-medium">
                                                ₹{parseFloat(fee.amount || "0").toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {fee.paidDate ? format(new Date(fee.paidDate), "MMM dd, yyyy") : "N/A"}
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm">
                                                    Receipt
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
