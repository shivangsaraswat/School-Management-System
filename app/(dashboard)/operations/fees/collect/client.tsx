"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Search,
    IndianRupee,
    User,
    Printer,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Loader2,
    ChevronDown,
    ChevronUp,
    Wallet,
    CreditCard,
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
import { PrintableFeeReceipt } from "@/components/fees/fee-receipt";

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
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Payment form state
    const [amount, setAmount] = useState(preSelectedStudent?.feeAccount?.balance || "");
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
        studentAdmissionNumber: string;
        studentClassName: string;
        studentSection: string | null;
        paymentMode: string;
        paidMonths: string[];
        transactionDate: Date;
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
                setHighlightedIndex(0);
            } catch (error) {
                toast.error("Failed to search students");
            } finally {
                setIsSearching(false);
            }
        };
        search();
    }, [debouncedSearch, currentYear]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (searchResults.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (searchResults[highlightedIndex]) {
                    handleSelectStudent(searchResults[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setSearchQuery("");
                setSearchResults([]);
                break;
        }
    }, [searchResults, highlightedIndex]);

    // Select a student
    const handleSelectStudent = (student: StudentWithAccount) => {
        setSelectedStudent(student);
        setSearchQuery("");
        setSearchResults([]);
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
        // Focus search after clearing
        setTimeout(() => searchInputRef.current?.focus(), 100);
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
                    studentAdmissionNumber: selectedStudent.student.admissionNumber,
                    studentClassName: selectedStudent.student.className,
                    studentSection: selectedStudent.student.section,
                    paymentMode,
                    paidMonths: paidMonths,
                    transactionDate: new Date(),
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

    // COMMAND PALETTE SEARCH VIEW (No student selected)
    if (!selectedStudent) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex flex-col">
                <HeaderUpdater
                    title="Collect Fee"
                    description="Search for a student to collect their fee payment"
                />

                {/* Top-Upper Command Palette */}
                <div className="flex-1 flex justify-center pt-[15vh]">
                    <div className="w-full max-w-2xl px-4">
                        {/* Title Only - No Icon */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">
                                Search Student
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Enter student name, admission number, or class
                            </p>
                        </div>

                        {/* Large Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Start typing to search..."
                                className="h-12 pl-10 pr-4 text-base rounded-md border shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
                            )}
                        </div>

                        {/* Keyboard Hints */}
                        <div className="flex justify-center gap-4 mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border bg-background font-mono">↑</kbd>
                                <kbd className="px-1 py-0.5 rounded border bg-background font-mono">↓</kbd>
                                NAVIGATE
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border bg-background font-mono">↵</kbd>
                                SELECT
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border bg-background font-mono">ESC</kbd>
                                CLEAR
                            </span>
                        </div>

                        {/* Search Results Dropdown - Industrial/Clean Look */}
                        {(searchResults.length > 0 || (searchQuery.length >= 2 && !isSearching)) && (
                            <div className="mt-2 border rounded-md bg-background shadow-md overflow-hidden">
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        <p>No students found for "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="max-h-[320px] overflow-y-auto">
                                        {searchResults.map((result, index) => (
                                            <div
                                                key={result.student.id}
                                                className={`
                                                    px-4 py-3 cursor-pointer transition-colors flex items-center justify-between
                                                    ${index === highlightedIndex
                                                        ? "bg-muted/50"
                                                        : "hover:bg-muted/30"
                                                    }
                                                    ${index !== searchResults.length - 1 ? "border-b border-border/50" : ""}
                                                `}
                                                onClick={() => handleSelectStudent(result)}
                                                onMouseEnter={() => setHighlightedIndex(index)}
                                            >
                                                {/* Text Only - No Avatars */}
                                                <div>
                                                    <p className={`text-sm font-medium ${index === highlightedIndex ? "text-foreground" : "text-foreground/80"}`}>
                                                        {result.student.firstName} {result.student.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                                                        <span className="font-mono">{result.student.admissionNumber}</span> • {result.student.className}
                                                        {result.student.section ? ` - ${result.student.section}` : ""}
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    {result.feeAccount ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-semibold tracking-tight">
                                                                {formatCurrency(result.feeAccount.balance)}
                                                            </span>
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                                Pending
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                            No Account
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Success Dialog & Printable Receipt */}
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

                {lastReceipt && (
                    <div className="hidden print:block">
                        <PrintableFeeReceipt
                            receiptNumber={lastReceipt.receiptNumber}
                            date={lastReceipt.transactionDate}
                            academicYear={currentYear}
                            student={{
                                name: lastReceipt.studentName,
                                admissionNumber: lastReceipt.studentAdmissionNumber,
                                className: lastReceipt.studentClassName,
                                section: lastReceipt.studentSection,
                            }}
                            feeDetails={[
                                { component: "Fee Payment", amount: parseFloat(lastReceipt.amount) },
                            ]}
                            totalPaid={parseFloat(lastReceipt.amount)}
                            remainingBalance={parseFloat(lastReceipt.newBalance)}
                            paymentMode={lastReceipt.paymentMode}
                            paidMonths={lastReceipt.paidMonths}
                        />
                    </div>
                )}
            </div>
        );
    }

    // STUDENT FEE WALLET & PAYMENT VIEW (Student selected)
    return (
        <div className="max-w-3xl mx-auto space-y-8 pt-8">
            <HeaderUpdater
                title="Collect Fee"
                description="Record payment for selected student"
            />

            {/* Top Bar: Back & ID */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearStudent}
                    className="gap-2 text-muted-foreground hover:text-foreground pl-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Search
                </Button>
                <div className="text-sm font-mono text-muted-foreground">
                    ID: {selectedStudent.student.admissionNumber}
                </div>
            </div>

            {/* Student Account Summary - Industrial Card */}
            <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                            {selectedStudent.student.firstName} {selectedStudent.student.lastName}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {selectedStudent.student.className}
                            {selectedStudent.student.section ? ` - ${selectedStudent.student.section}` : ""}
                            {" • "}{currentYear}
                        </p>
                    </div>
                    {selectedStudent.feeAccount && (
                        <StatusBadge status={selectedStudent.feeAccount.status} />
                    )}
                </div>

                {/* Stats Row with Vertical Dividers */}
                {selectedStudent.feeAccount ? (
                    <div className="grid grid-cols-3 divide-x border-t bg-muted/20">
                        <div className="p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Fee</p>
                            <p className="text-xl font-bold font-heading">
                                {formatCurrency(selectedStudent.feeAccount.totalFee)}
                            </p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Paid</p>
                            <p className="text-xl font-bold font-heading text-green-600">
                                {formatCurrency(selectedStudent.feeAccount.totalPaid)}
                            </p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Balance</p>
                            <p className="text-xl font-bold font-heading text-orange-600">
                                {formatCurrency(selectedStudent.feeAccount.balance)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-t bg-orange-50 text-orange-600 flex items-center justify-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        No fee account found
                    </div>
                )}
            </div>

            {/* Payment Form - Clean & Structural */}
            {selectedStudent.feeAccount && (
                <div className="border rounded-lg bg-background shadow-sm">
                    <div className="p-6 border-b">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            Payment Details
                        </h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Amount Section */}
                        <div className="space-y-3">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (₹)</Label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-10 pl-9 font-mono text-lg"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-mono text-xs"
                                        onClick={() => setAmount(selectedStudent.feeAccount!.balance)}
                                    >
                                        Full
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-mono text-xs"
                                        onClick={() => {
                                            const half = parseFloat(selectedStudent.feeAccount!.balance) / 2;
                                            setAmount(half.toFixed(2));
                                        }}
                                    >
                                        50%
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-mono text-xs"
                                        onClick={() => {
                                            const quarter = parseFloat(selectedStudent.feeAccount!.balance) / 4;
                                            setAmount(quarter.toFixed(2));
                                        }}
                                    >
                                        25%
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Grid: Payment Mode & For */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Payment Mode</Label>
                                <Select
                                    value={paymentMode}
                                    onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}
                                >
                                    <SelectTrigger>
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
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                                <Select value={paymentFor} onValueChange={setPaymentFor}>
                                    <SelectTrigger>
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
                        </div>

                        {/* Months Grid - Cleaner */}
                        <div className="space-y-3">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Months Covered</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {MONTHS.map((month) => (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => toggleMonth(month)}
                                        className={`
                                            h-9 rounded border text-xs font-medium transition-all
                                            ${paidMonths.includes(month)
                                                ? "bg-foreground text-background border-foreground"
                                                : "bg-background hover:bg-muted border-input text-muted-foreground"
                                            }
                                        `}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Remarks</Label>
                            <Input
                                placeholder="Optional notes..."
                                className="h-9"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            className="w-full h-11 text-sm font-medium tracking-wide"
                            onClick={handleCollectFee}
                            disabled={!amount || isCollecting}
                        >
                            {isCollecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Collect Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

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
                                    <p className="font-heading font-bold text-lg text-green-600">
                                        {formatCurrency(lastReceipt.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">New Balance</p>
                                    <p className="font-heading font-bold text-lg">
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

            {/* Hidden Printable Receipt */}
            {lastReceipt && (
                <div className="hidden print:block">
                    <PrintableFeeReceipt
                        receiptNumber={lastReceipt.receiptNumber}
                        date={lastReceipt.transactionDate}
                        academicYear={currentYear}
                        student={{
                            name: lastReceipt.studentName,
                            admissionNumber: lastReceipt.studentAdmissionNumber,
                            className: lastReceipt.studentClassName,
                            section: lastReceipt.studentSection,
                        }}
                        feeDetails={[
                            { component: "Fee Payment", amount: parseFloat(lastReceipt.amount) },
                        ]}
                        totalPaid={parseFloat(lastReceipt.amount)}
                        remainingBalance={parseFloat(lastReceipt.newBalance)}
                        paymentMode={lastReceipt.paymentMode}
                        paidMonths={lastReceipt.paidMonths}
                    />
                </div>
            )}
        </div>
    );
}
