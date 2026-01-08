"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search,
    IndianRupee,
    User,
    Printer,
    CheckCircle,
    AlertCircle,
    Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { searchStudentsForFeeCollection, collectFee } from "@/lib/actions/fees";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface StudentWithAccount {
    student: {
        id: string;
        admissionNumber: string;
        firstName: string;
        lastName: string;
        className: string;
        section: string | null;
    };
    feeAccount: {
        id: string;
        totalFee: string;
        totalPaid: string;
        balance: string;
        status: "pending" | "partial" | "paid" | "overdue";
    } | null;
}

interface CollectFeeClientProps {
    currentYear: string;
    preSelectedStudent?: StudentWithAccount | null;
}

export function CollectFeeClient({ currentYear, preSelectedStudent }: CollectFeeClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<StudentWithAccount[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithAccount | null>(
        preSelectedStudent || null
    );
    const [isSearching, setIsSearching] = useState(false);
    const [isCollecting, setIsCollecting] = useState(false);

    // Payment form state - pre-fill amount if student is pre-selected
    const [amount, setAmount] = useState(
        preSelectedStudent?.feeAccount?.balance || ""
    );
    const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "bank_transfer" | "cheque" | "online">("cash");
    const [paymentFor, setPaymentFor] = useState("");
    const [remarks, setRemarks] = useState("");
    const [paidMonths, setPaidMonths] = useState<string[]>([]);

    const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    const toggleMonth = (month: string) => {
        if (paidMonths.includes(month)) {
            setPaidMonths(paidMonths.filter((m) => m !== month));
        } else {
            setPaidMonths([...paidMonths, month]);
        }
    };

    // Success dialog
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [lastReceipt, setLastReceipt] = useState<{
        receiptNumber: string;
        amount: string;
        newBalance: string;
        studentName: string;
    } | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Search students
    useEffect(() => {
        const search = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchStudentsForFeeCollection(debouncedSearch, currentYear);
                setSearchResults(results);
            } catch (error) {
                toast.error("Failed to search students");
            } finally {
                setIsSearching(false);
            }
        };
        search();
    }, [debouncedSearch, currentYear]);

    // Select a student
    const handleSelectStudent = (student: StudentWithAccount) => {
        setSelectedStudent(student);
        setSearchQuery("");
        setSearchResults([]);
        // Pre-fill remaining balance as amount
        if (student.feeAccount) {
            setAmount(student.feeAccount.balance);
        }
    };

    // Clear selected student
    const handleClearStudent = () => {
        setSelectedStudent(null);
        setAmount("");
        setPaymentMode("cash");
        setPaymentFor("");
        setRemarks("");
        setPaidMonths([]);
    };

    // Collect fee
    const handleCollectFee = async () => {
        if (!selectedStudent || !amount || !paymentMode) {
            toast.error("Please fill all required fields");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsCollecting(true);
        try {
            const result = await collectFee({
                studentId: selectedStudent.student.id,
                academicYear: currentYear,
                amount,
                paymentMode,
                paymentFor: paymentFor || undefined,
                remarks: remarks || undefined,
                paidMonths: paidMonths.length > 0 ? paidMonths : undefined,
            });

            if (result.success) {
                setLastReceipt({
                    receiptNumber: result.receiptNumber!,
                    amount,
                    newBalance: result.newBalance!,
                    studentName: `${selectedStudent.student.firstName} ${selectedStudent.student.lastName}`,
                });
                setSuccessDialogOpen(true);
                handleClearStudent();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to collect fee");
        } finally {
            setIsCollecting(false);
        }
    };

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        return `₹${num.toLocaleString("en-IN")}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <HeaderUpdater
                title="Collect Fee"
                description="Search for a student and collect their fee payment"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Search & Select Student */}
                <Card>
                    <CardHeader>
                        <CardTitle>1. Select Student</CardTitle>
                        <CardDescription>
                            Search by name or admission number
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedStudent ? (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search student..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                                        {searchResults.map((result) => (
                                            <div
                                                key={result.student.id}
                                                className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => handleSelectStudent(result)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">
                                                            {result.student.firstName} {result.student.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {result.student.admissionNumber} • {result.student.className} - {result.student.section}
                                                        </p>
                                                    </div>
                                                    {result.feeAccount ? (
                                                        <StatusBadge status={result.feeAccount.status} />
                                                    ) : (
                                                        <span className="text-xs text-orange-600">No fee account</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isSearching && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Searching...
                                    </p>
                                )}

                                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No students found
                                    </p>
                                )}
                            </>
                        ) : (
                            // Selected Student Card
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">
                                                {selectedStudent.student.firstName} {selectedStudent.student.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedStudent.student.admissionNumber}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedStudent.student.className} - {selectedStudent.student.section}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleClearStudent}>
                                        Change
                                    </Button>
                                </div>

                                {/* Fee Summary */}
                                {selectedStudent.feeAccount ? (
                                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 rounded-lg bg-background">
                                            <p className="text-xs text-muted-foreground">Total Fee</p>
                                            <p className="font-semibold text-lg">
                                                {formatCurrency(selectedStudent.feeAccount.totalFee)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-500/10">
                                            <p className="text-xs text-muted-foreground">Paid</p>
                                            <p className="font-semibold text-lg text-green-600">
                                                {formatCurrency(selectedStudent.feeAccount.totalPaid)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-orange-500/10">
                                            <p className="text-xs text-muted-foreground">Balance</p>
                                            <p className="font-semibold text-lg text-orange-600">
                                                {formatCurrency(selectedStudent.feeAccount.balance)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-4 rounded-lg bg-orange-500/10 text-orange-600 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        <p className="text-sm">
                                            No fee account found. Please set up fee structure first.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>2. Enter Payment Details</CardTitle>
                        <CardDescription>
                            Record the payment information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Amount (₹) *</Label>
                            <div className="relative mt-2">
                                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    className="pl-9 text-lg font-semibold"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={!selectedStudent?.feeAccount}
                                />
                            </div>
                            {selectedStudent?.feeAccount && (
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAmount(selectedStudent.feeAccount!.balance)}
                                    >
                                        Full Balance
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const half = parseFloat(selectedStudent.feeAccount!.balance) / 2;
                                            setAmount(half.toFixed(2));
                                        }}
                                    >
                                        Half
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Select Months (Optional)</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                                {MONTHS.map((month) => (
                                    <div
                                        key={month}
                                        onClick={() => selectedStudent?.feeAccount && toggleMonth(month)}
                                        className={`
                                            cursor-pointer text-center text-sm py-2 px-1 rounded-md border transition-all
                                            ${paidMonths.includes(month)
                                                ? "bg-primary text-primary-foreground border-primary font-medium"
                                                : "bg-background hover:bg-muted border-border text-muted-foreground"
                                            }
                                            ${!selectedStudent?.feeAccount ? "opacity-50 pointer-events-none" : ""}
                                        `}
                                    >
                                        {month}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Payment Mode *</Label>
                            <Select
                                value={paymentMode}
                                onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}
                                disabled={!selectedStudent?.feeAccount}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Payment For (Optional)</Label>
                            <Select
                                value={paymentFor}
                                onValueChange={setPaymentFor}
                                disabled={!selectedStudent?.feeAccount}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly Fee</SelectItem>
                                    <SelectItem value="quarterly">Quarterly Fee</SelectItem>
                                    <SelectItem value="half_yearly">Half-Yearly Fee</SelectItem>
                                    <SelectItem value="annual">Annual Fee</SelectItem>
                                    <SelectItem value="exam_fee">Exam Fee</SelectItem>
                                    <SelectItem value="transport">Transport Fee</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Add any notes..."
                                className="mt-2"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={!selectedStudent?.feeAccount}
                            />
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleCollectFee}
                            disabled={!selectedStudent?.feeAccount || !amount || isCollecting}
                        >
                            {isCollecting ? (
                                "Processing..."
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Collect Fee
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Success Dialog */}
            <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-6 w-6" />
                            Payment Successful!
                        </DialogTitle>
                    </DialogHeader>
                    {lastReceipt && (
                        <div className="space-y-4 py-4">
                            <div className="text-center p-6 border rounded-lg bg-muted/30">
                                <p className="text-sm text-muted-foreground">Receipt Number</p>
                                <p className="font-mono font-bold text-xl">{lastReceipt.receiptNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                                    <p className="font-semibold text-lg text-green-600">
                                        {formatCurrency(lastReceipt.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">New Balance</p>
                                    <p className="font-semibold text-lg">
                                        {formatCurrency(lastReceipt.newBalance)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                for {lastReceipt.studentName}
                            </p>
                        </div>
                    )}
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setSuccessDialogOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
