"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Receipt,
    Search,
    Printer,
    Calendar,
    IndianRupee,
    ArrowUpDown,
    MoreHorizontal,
    Trash2,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getFeeTransactionsNew, deleteFeeTransaction } from "@/lib/actions/fees";
import { HeaderUpdater } from "@/components/dashboard/header-context";

import { FeeTransaction } from "@/db/schema";

interface Transaction {
    transaction: FeeTransaction;
    student: {
        id: string;
        admissionNumber: string;
        firstName: string;
        lastName: string;
        className: string;
        section: string | null;
    } | null;
}

interface TransactionsClientProps {
    initialTransactions: Transaction[];
    currentYear: string;
    academicYears: string[];
}

const paymentModeLabels: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    online: "Online",
};

export function TransactionsClient({
    initialTransactions,
    currentYear,
    academicYears,
}: TransactionsClientProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteFeeTransaction(id);
            if (result.success) {
                toast.success("Transaction deleted successfully");
                setTransactions((prev) => prev.filter((t) => t.transaction.id !== id));
            } else {
                toast.error(result.error || "Failed to delete transaction");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
            setTransactionToDelete(null);
        }
    };

    // Fetch transactions when year changes
    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const data = await getFeeTransactionsNew(selectedYear);
                setTransactions(data as Transaction[]);
            } catch (error) {
                console.error("Failed to load transactions");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [selectedYear]);

    // Filter transactions by search
    const filteredTransactions = transactions.filter((t) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            t.transaction.receiptNumber.toLowerCase().includes(query) ||
            t.student?.firstName.toLowerCase().includes(query) ||
            t.student?.lastName.toLowerCase().includes(query) ||
            t.student?.admissionNumber.toLowerCase().includes(query)
        );
    });

    const formatCurrency = (amount: string) => {
        return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
    };

    // Calculate total collected for the filtered results
    const totalCollected = filteredTransactions.reduce(
        (sum, t) => sum + parseFloat(t.transaction.amountPaid),
        0
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <HeaderUpdater
                title="Fee Transactions"
                description="View all fee payments and receipts"
            />

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4 items-center">
                    <div>
                        <Label className="sr-only">Academic Year</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by receipt, name..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Collected</p>
                    <p className="text-xl font-bold text-green-600">
                        {formatCurrency(totalCollected.toFixed(2))}
                    </p>
                </div>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? "s" : ""}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Receipt No.</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <TableRow key={t.transaction.id}>
                                        <TableCell className="text-sm">
                                            {format(new Date(t.transaction.transactionDate), "MMM dd, yyyy")}
                                            <br />
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(t.transaction.transactionDate), "hh:mm a")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {t.transaction.receiptNumber}
                                        </TableCell>
                                        <TableCell>
                                            {t.student ? (
                                                <>
                                                    <p className="font-medium">
                                                        {t.student.firstName} {t.student.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t.student.admissionNumber}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {t.student ? (
                                                t.student.section
                                                    ? `${t.student.className} - ${t.student.section}`
                                                    : t.student.className
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell className="font-semibold text-green-600">
                                            {formatCurrency(t.transaction.amountPaid)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted capitalize">
                                                {paymentModeLabels[t.transaction.paymentMode] || t.transaction.paymentMode}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.print()}>
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Print Receipt
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setTransactionToDelete(t.transaction.id)}
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-100"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Transaction
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction
                            and revert the student's fee balance.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (transactionToDelete) handleDelete(transactionToDelete);
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Transaction"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
