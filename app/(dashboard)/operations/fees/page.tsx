import Link from "next/link";
import { Receipt, Plus, IndianRupee, TrendingUp, AlertCircle, Settings, History, Target } from "lucide-react";
import { requireOperations } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFeeTransactionsNew } from "@/lib/actions/fees";
import { getFeeAccountStatistics, getStudentsWithPendingFees, getClassWisePendingSummary } from "@/lib/actions/fee-accounts";
import { getCurrentAcademicYear } from "@/lib/actions/settings";
import { format } from "date-fns";
import { HeaderUpdater } from "@/components/dashboard/header-context";

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

    const currentYear = await getCurrentAcademicYear();

    // Fetch data from new balance-based system
    const [feeStats, recentTransactions, classSummary, pendingStudents] = await Promise.all([
        getFeeAccountStatistics(currentYear),
        getFeeTransactionsNew(currentYear, undefined, 10),
        getClassWisePendingSummary(currentYear),
        getStudentsWithPendingFees(currentYear, undefined, 5),
    ]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <HeaderUpdater
                title="Fee Management"
                description={`${currentYear} • Balance-based fee tracking`}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/operations/fees/structure">
                            <Settings className="mr-2 h-4 w-4" />
                            Fee Structure
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/operations/fees/collect">
                            <Plus className="mr-2 h-4 w-4" />
                            Collect Fee
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            <span className="text-2xl font-bold">{formatCurrency(feeStats.totalExpected)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Total Expected</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-green-600" />
                            <span className="text-2xl font-bold">{formatCurrency(feeStats.totalCollected)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Collected</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <span className="text-2xl font-bold">{formatCurrency(feeStats.totalPending)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-purple-600" />
                            <span className="text-2xl font-bold">{feeStats.collectionRate}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Collection Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Students with Pending Fees */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Students with Pending Fees</CardTitle>
                            <CardDescription>Top students with highest outstanding balance</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/operations/fees/collect">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {pendingStudents.length === 0 ? (
                                <p className="p-6 text-center text-muted-foreground">
                                    No pending fees! All students are up to date.
                                </p>
                            ) : (
                                pendingStudents.map((item) => (
                                    <div
                                        key={item.account.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.student?.firstName} {item.student?.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.student?.className} - {item.student?.section}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-orange-600">
                                                ₹{parseFloat(item.account.balance).toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">pending</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest fee payments received</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/operations/fees/transactions">
                                <History className="mr-2 h-4 w-4" />
                                View All
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentTransactions.length === 0 ? (
                                <p className="p-6 text-center text-muted-foreground">
                                    No fee collections yet. Start by collecting fees from students.
                                </p>
                            ) : (
                                recentTransactions.map((item) => (
                                    <div
                                        key={item.transaction.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.student?.firstName} {item.student?.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {item.transaction.receiptNumber}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                +₹{parseFloat(item.transaction.amountPaid).toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(item.transaction.transactionDate), "MMM dd")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Class-wise Summary */}
            {classSummary.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Class-wise Fee Summary</CardTitle>
                        <CardDescription>Collection status across all classes</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                                        <th className="p-4 font-medium">Class</th>
                                        <th className="p-4 font-medium text-right">Students</th>
                                        <th className="p-4 font-medium text-right">Total Fee</th>
                                        <th className="p-4 font-medium text-right">Collected</th>
                                        <th className="p-4 font-medium text-right">Pending</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classSummary.map((row) => (
                                        <tr key={row.className} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4 font-medium">{row.className}</td>
                                            <td className="p-4 text-right">{row.totalStudents}</td>
                                            <td className="p-4 text-right">
                                                ₹{parseFloat(row.totalFees).toLocaleString("en-IN")}
                                            </td>
                                            <td className="p-4 text-right text-green-600">
                                                ₹{parseFloat(row.totalCollected).toLocaleString("en-IN")}
                                            </td>
                                            <td className="p-4 text-right text-orange-600 font-medium">
                                                ₹{parseFloat(row.totalPending).toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
