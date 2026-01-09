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

                {/* Centered Command Palette */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-2xl px-4">
                        {/* Search Icon & Title */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <CreditCard className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground mb-2">
                                Search Student
                            </h2>
                            <p className="text-muted-foreground">
                                Enter student name, admission number, or class
                            </p>
                        </div>

                        {/* Large Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Start typing to search..."
                                className="h-14 pl-12 pr-4 text-lg rounded-xl border-2 focus:border-primary shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground animate-spin" />
                            )}
                        </div>

                        {/* Keyboard Hints */}
                        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑</kbd>
                                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↓</kbd>
                                to navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Enter</kbd>
                                to select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd>
                                to clear
                            </span>
                        </div>

                        {/* Search Results Dropdown */}
                        {(searchResults.length > 0 || (searchQuery.length >= 2 && !isSearching)) && (
                            <div className="mt-4 border-2 rounded-xl bg-background shadow-lg overflow-hidden">
                                {searchResults.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <p>No students found for "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="max-h-[320px] overflow-y-auto">
                                        {searchResults.map((result, index) => (
                                            <div
                                                key={result.student.id}
                                                className={`
                                                    p-4 cursor-pointer transition-colors flex items-center justify-between
                                                    ${index === highlightedIndex
                                                        ? "bg-primary/10 border-l-4 border-l-primary"
                                                        : "hover:bg-muted/50 border-l-4 border-l-transparent"
                                                    }
                                                    ${index !== searchResults.length - 1 ? "border-b" : ""}
                                                `}
                                                onClick={() => handleSelectStudent(result)}
                                                onMouseEnter={() => setHighlightedIndex(index)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-base">
                                                            {result.student.firstName} {result.student.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {result.student.admissionNumber} • {result.student.className}
                                                            {result.student.section ? ` - ${result.student.section}` : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {result.feeAccount ? (
                                                        <>
                                                            <p className="font-semibold text-orange-600">
                                                                {formatCurrency(result.feeAccount.balance)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">pending</p>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-orange-600 font-medium">No fee account</span>
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
        <div className="space-y-6">
            <HeaderUpdater
                title="Collect Fee"
                description="Record payment for selected student"
            />

            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClearStudent}
                className="gap-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
            </Button>

            {/* Student Wallet Card */}
            <Card className="border-2">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        {/* Student Info */}
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {selectedStudent.student.firstName} {selectedStudent.student.lastName}
                                </h2>
                                <p className="text-muted-foreground">
                                    {selectedStudent.student.admissionNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedStudent.student.className}
                                    {selectedStudent.student.section ? ` - ${selectedStudent.student.section}` : ""}
                                    {" • "}{currentYear}
                                </p>
                            </div>
                        </div>

                        {/* Fee Status Badge */}
                        {selectedStudent.feeAccount && (
                            <StatusBadge status={selectedStudent.feeAccount.status} />
                        )}
                    </div>

                    {/* Fee Wallet Summary */}
                    {selectedStudent.feeAccount ? (
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-muted/50 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Total Fee</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(selectedStudent.feeAccount.totalFee)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-green-500/10 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(selectedStudent.feeAccount.totalPaid)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-orange-500/10 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Balance Due</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(selectedStudent.feeAccount.balance)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 p-4 rounded-xl bg-orange-500/10 text-orange-600 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>No fee account found. Please set up fee structure first.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Form */}
            {selectedStudent.feeAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Payment Details
                        </CardTitle>
                        <CardDescription>
                            Enter the payment information to collect fee
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Amount */}
                        <div>
                            <Label className="text-base">Amount (₹) *</Label>
                            <div className="relative mt-2">
                                <IndianRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    className="h-12 pl-10 text-xl font-semibold"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="mt-3 flex gap-2">
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const quarter = parseFloat(selectedStudent.feeAccount!.balance) / 4;
                                        setAmount(quarter.toFixed(2));
                                    }}
                                >
                                    Quarter
                                </Button>
                            </div>
                        </div>

                        {/* Months */}
                        <div>
                            <Label className="text-base">Months Covered (Optional)</Label>
                            <div className="grid grid-cols-6 gap-2 mt-2">
                                {MONTHS.map((month) => (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => toggleMonth(month)}
                                        className={`
                                            py-2 rounded-lg border text-sm font-medium transition-all
                                            ${paidMonths.includes(month)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background hover:bg-muted border-border text-muted-foreground"
                                            }
                                        `}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <Label className="text-base">Payment Mode *</Label>
                            <Select
                                value={paymentMode}
                                onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}
                            >
                                <SelectTrigger className="mt-2 h-11">
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

                        {/* Payment For */}
                        <div>
                            <Label className="text-base">Payment For (Optional)</Label>
                            <Select value={paymentFor} onValueChange={setPaymentFor}>
                                <SelectTrigger className="mt-2 h-11">
                                    <SelectValue placeholder="Select category..." />
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

                        {/* Remarks */}
                        <div>
                            <Label className="text-base">Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Add any notes..."
                                className="mt-2"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            className="w-full h-12 text-base"
                            onClick={handleCollectFee}
                            disabled={!amount || isCollecting}
                        >
                            {isCollecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Collect {amount ? formatCurrency(amount) : "Fee"}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
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
