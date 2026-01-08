"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Upload,
    Calendar,
    MapPin,
    Mail,
    Phone,
    Shield,
    Activity,
    User,
    IndianRupee,
    Receipt,
    Plus,
    History,
    TrendingUp,
    Target,
    Check,
    Clock,
    Save,
    X,
    Pencil
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { updateStudent } from "@/lib/actions/students";
import type { Student, StudentFeeAccount, FeeTransaction, FeeAdjustment } from "@/db/schema";
import { format } from "date-fns";
import { formatClassSection } from "@/lib/utils";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface StudentProfileClientProps {
    student: Student;
    currentYear: string;
    feeAccount: StudentFeeAccount | null;
    feeHistory: {
        transactions: FeeTransaction[];
        adjustments: FeeAdjustment[];
    };
    attendanceHistory: Array<{
        id: string;
        date: string;
        status: string;
        remarks: string | null;
    }>;
    attendanceStats: {
        present: number;
        absent: number;
        late: number;
        leave: number;
        percentage: string;
    };
    allSections: string[];
}

const paymentModeLabels: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    online: "Online",
};

export function StudentProfileClient({
    student: initialStudent,
    currentYear,
    feeAccount,
    feeHistory,
    attendanceHistory,
    attendanceStats,
    allSections,
}: StudentProfileClientProps) {
    const router = useRouter();

    const [student, setStudent] = useState({
        ...initialStudent,
        dob: initialStudent.dateOfBirth,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateStudent(student.id, {
                firstName: student.firstName,
                lastName: student.lastName,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                bloodGroup: student.bloodGroup,
                email: student.email,
                phone: student.phone,
                address: student.address,
                city: student.city,
                state: student.state,
                pincode: student.pincode,
                guardianName: student.guardianName,
                guardianRelation: student.guardianRelation,
                guardianPhone: student.guardianPhone,
                guardianEmail: student.guardianEmail,
                guardianOccupation: student.guardianOccupation,
            });

            if (result.success) {
                toast.success("Student details updated successfully");
                setIsEditing(false);
            } else {
                toast.error("Failed to update student details");
            }
        } catch (error) {
            console.error("Error updating student:", error);
            toast.error("An error occurred while updating");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate fee progress
    const totalFee = feeAccount ? parseFloat(feeAccount.totalFee) : 0;
    const totalPaid = feeAccount ? parseFloat(feeAccount.totalPaid) : 0;
    const balance = feeAccount ? parseFloat(feeAccount.balance) : 0;
    const paidPercentage = totalFee > 0 ? (totalPaid / totalFee) * 100 : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-500";
            case "partial":
                return "bg-orange-500";
            case "overdue":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "paid":
                return "default";
            case "partial":
                return "secondary";
            case "overdue":
                return "destructive";
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header / Nav */}
            <HeaderUpdater
                title="Student Profile"
                description={`${student.firstName} ${student.lastName} (${student.admissionNumber})`}
                backLink={{
                    label: "Back to Class List",
                    href: "/operations/students"
                }}
            >
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={() => setIsEditing(false)}
                            >
                                <X className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Cancel</span>
                            </Button>
                            <Button size="sm" className="h-9" onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <span className="hidden sm:inline">Saving...</span>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Save Changes</span>
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" className="h-9" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Edit Profile</span>
                        </Button>
                    )}
                </div>
            </HeaderUpdater>
            <div className="flex flex-col gap-4">

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Student Photo */}
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-muted">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={student.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                                    <AvatarFallback className="text-2xl">{student.firstName[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full shadow-md h-8 w-8">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground flex-wrap">
                                <Badge variant="outline" className="text-sm font-normal py-1 px-3 bg-background">
                                    {formatClassSection(student.className, student.section || undefined, { allSections })}
                                </Badge>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1 text-sm">
                                    <Shield className="h-3.5 w-3.5" />
                                    {student.admissionNumber}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1 text-sm">
                                    <Activity className={`h-3.5 w-3.5 ${student.isActive ? 'text-green-500' : 'text-red-500'}`} />
                                    {student.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="details"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        Student Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger
                        value="fees"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        Fee History
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 pt-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={student.firstName}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0" : ""}
                                        onChange={(e) => setStudent({ ...student, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={student.lastName}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0" : ""}
                                        onChange={(e) => setStudent({ ...student, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={student.dateOfBirth}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0 pl-10" : "pl-10"}
                                            onChange={(e) => setStudent({ ...student, dateOfBirth: e.target.value })}
                                        />
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Input
                                        value={student.gender}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <Input
                                        value={student.bloodGroup || "N/A"}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <div className="relative">
                                        <Input
                                            value={student.email || "N/A"}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0 pl-10" : "pl-10"}
                                        />
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-2">
                                <Label>Residential Address</Label>
                                <div className="relative">
                                    <Textarea
                                        value={`${student.address || ""} ${student.city || ""} ${student.state || ""} ${student.pincode || ""}`.trim() || "N/A"}
                                        readOnly={!isEditing}
                                        className={`min-h-[80px] resize-none ${!isEditing ? "bg-muted/50 border-none focus-visible:ring-0 pl-10" : "pl-10"}`}
                                        onChange={(e) => setStudent({ ...student, address: e.target.value })}
                                    />
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guardian Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-primary" />
                                Guardian Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Name</Label>
                                        <Input
                                            value={student.guardianName}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                            onChange={(e) => setStudent({ ...student, guardianName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Relation</Label>
                                        <Input
                                            value={student.guardianRelation}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Phone</Label>
                                        <div className="relative">
                                            <Input
                                                value={student.guardianPhone}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-muted/50 border-none h-9 pl-8" : "h-9 pl-8"}
                                                onChange={(e) => setStudent({ ...student, guardianPhone: e.target.value })}
                                            />
                                            <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Email</Label>
                                        <Input
                                            value={student.guardianEmail || "N/A"}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Occupation</Label>
                                        <Input
                                            value={student.guardianOccupation || "N/A"}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-6 pt-6">
                    {/* Attendance Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-green-700">Present</div>
                                <div className="text-3xl font-bold text-green-600 mt-1">{attendanceStats.present}</div>
                                <div className="text-xs text-green-600/80 mt-1">Days</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-red-700">Absent</div>
                                <div className="text-3xl font-bold text-red-600 mt-1">{attendanceStats.absent}</div>
                                <div className="text-xs text-red-600/80 mt-1">Days</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-yellow-700">Late</div>
                                <div className="text-3xl font-bold text-yellow-600 mt-1">{attendanceStats.late}</div>
                                <div className="text-xs text-yellow-600/80 mt-1">Days</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-primary">Attendance Rate</div>
                                <div className="text-3xl font-bold text-primary mt-1">{attendanceStats.percentage}%</div>
                                <div className="text-xs text-primary/80 mt-1">Overall</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Attendance Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Attendance Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {attendanceHistory.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No attendance records found</p>
                                ) : (
                                    attendanceHistory.slice(0, 10).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-2 w-2 rounded-full ${log.status === 'present' ? 'bg-green-500' :
                                                    log.status === 'absent' ? 'bg-red-500' :
                                                        log.status === 'late' ? 'bg-yellow-500' : 'bg-blue-500'
                                                    }`} />
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {format(new Date(log.date), 'MMM dd, yyyy')}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {log.remarks || 'No remarks'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-medium capitalize ${log.status === 'present' ? 'text-green-600' :
                                                    log.status === 'absent' ? 'text-red-600' :
                                                        log.status === 'late' ? 'text-yellow-600' : 'text-blue-600'
                                                    }`}>{log.status}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fees" className="space-y-6 pt-6 animate-in slide-in-from-bottom-2 duration-500">
                    {/* Fee Summary Card */}
                    {feeAccount ? (
                        <div className="grid gap-6">
                            <Card className="overflow-hidden border-border/50 shadow-sm">
                                <CardHeader className="border-b bg-muted/30 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <Receipt className="h-5 w-5 text-primary" />
                                                Fee Overview
                                            </CardTitle>
                                            <CardDescription>Academic Year {currentYear}</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={getStatusBadgeVariant(feeAccount.status)}
                                                className="capitalize px-3 py-1 text-sm font-medium shadow-none"
                                            >
                                                {feeAccount.status}
                                            </Badge>
                                            {balance > 0 && (
                                                <Button asChild size="sm" className="h-9 px-4 font-medium shadow-sm transition-all hover:shadow-md">
                                                    <Link href={`/operations/fees/collect?student=${student.id}`}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Collect Fee
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                        {/* Fee Stats - Compact */}
                                        <div className="col-span-2 grid grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <Target className="h-3.5 w-3.5" />
                                                    Total Fee
                                                </p>
                                                <p className="text-2xl font-bold tracking-tight">₹{totalFee.toLocaleString("en-IN")}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <IndianRupee className="h-3.5 w-3.5" />
                                                    Paid
                                                </p>
                                                <p className="text-2xl font-bold tracking-tight text-green-600">₹{totalPaid.toLocaleString("en-IN")}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <TrendingUp className="h-3.5 w-3.5" />
                                                    Pending
                                                </p>
                                                <p className="text-2xl font-bold tracking-tight text-orange-600">₹{balance.toLocaleString("en-IN")}</p>
                                            </div>
                                        </div>

                                        {/* Progress Circle or Bar */}
                                        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-muted-foreground">Fee Collection Progress</span>
                                                <span className="font-bold">{paidPercentage.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={paidPercentage} className="h-2.5 w-full bg-muted/50" />
                                            <p className="text-xs text-muted-foreground text-center pt-1">
                                                {balance > 0 ? `₹${balance.toLocaleString("en-IN")} remaining to pay` : "All fees paid"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fee Calendar */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="px-6 py-4 border-b bg-muted/30">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                Monthly Fee Status
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                                <span>Paid</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2.5 w-2.5 rounded-full bg-muted shadow-inner border border-stone-200"></div>
                                                <span>Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                        {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((month, index) => {
                                            // Check explicit paid months first
                                            const paidMonthsList = (feeAccount?.paidMonths as string[]) || [];
                                            let isPaid = false;

                                            // Handle case where paidMonths exists
                                            if (paidMonthsList && paidMonthsList.length > 0) {
                                                isPaid = paidMonthsList.includes(month);
                                            } else {
                                                // Fallback to percentage calculation for backward compatibility
                                                const monthsPaid = totalFee > 0 ? Math.floor((totalPaid / totalFee) * 12) : 0;
                                                isPaid = index < monthsPaid;
                                            }
                                            return (
                                                <div
                                                    key={month}
                                                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 group
                                                        ${isPaid
                                                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm"
                                                            : "bg-card border-border/60 hover:border-border hover:bg-muted/20"
                                                        }
                                                    `}
                                                >
                                                    <div className="text-sm font-semibold mb-1 z-10">{month}</div>
                                                    {isPaid ? (
                                                        <div className="flex items-center gap-1 text-xs font-medium text-green-700 z-10">
                                                            <Check className="h-3.5 w-3.5" />
                                                            <span>Paid</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 z-10">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>Pending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transaction History */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="px-6 py-4 border-b bg-muted/30">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <History className="h-4 w-4 text-muted-foreground" />
                                                Recent Transactions
                                            </CardTitle>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" asChild>
                                            <Link href="/operations/fees/transactions" className="flex items-center gap-1">
                                                View Full History <ChevronLeft className="h-3 w-3 rotate-180" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {feeHistory.transactions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                <Receipt className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">No fees recorded yet</p>
                                            <p className="text-sm text-muted-foreground/60 max-w-xs mt-1">
                                                Fees for {currentYear} will appear here once collected.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {feeHistory.transactions.map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border border-green-200 shrink-0">
                                                            <IndianRupee className="h-5 w-5 text-green-700" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm text-foreground">
                                                                Fee Received
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                                                <span className="font-mono">{transaction.receiptNumber}</span>
                                                                <span>•</span>
                                                                <span>{format(new Date(transaction.transactionDate), "MMM dd, yyyy 'at' hh:mm a")}</span>
                                                            </div>
                                                            {transaction.paymentFor && (
                                                                <div className="text-xs text-muted-foreground/80 mt-1 capitalize bg-muted px-1.5 py-0.5 rounded w-fit">
                                                                    {transaction.paymentFor.replace("_", " ")}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-green-600">
                                                            +₹{parseFloat(transaction.amountPaid).toLocaleString("en-IN")}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1 capitalize flex justify-end">
                                                            <span className="bg-muted px-2 py-0.5 rounded-md border border-border/50 text-[10px] font-medium uppercase tracking-wider">
                                                                {paymentModeLabels[transaction.paymentMode] || transaction.paymentMode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Adjustments (if any) */}
                            {feeHistory.adjustments.length > 0 && (
                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader className="px-6 py-4 border-b bg-muted/30">
                                        <CardTitle className="text-base font-semibold">Fee Adjustments</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {feeHistory.adjustments.map((adjustment) => {
                                                const adjustmentAmount = parseFloat(adjustment.amount);
                                                const isDiscount = adjustmentAmount < 0;
                                                const adjustmentType = isDiscount ? "Discount/Waiver" : "Additional Fee";

                                                return (
                                                    <div key={adjustment.id} className="flex items-center justify-between px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">
                                                                {adjustmentType}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {adjustment.reason || "No reason provided"}
                                                            </div>
                                                        </div>
                                                        <div className="text-right font-medium">
                                                            {isDiscount ? (
                                                                <span className="text-green-600">-₹{Math.abs(adjustmentAmount).toLocaleString("en-IN")}</span>
                                                            ) : (
                                                                <span className="text-orange-600">+₹{adjustmentAmount.toLocaleString("en-IN")}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 bg-muted/10 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                                    <Receipt className="h-8 w-8 text-orange-600" />
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <h3 className="font-semibold text-lg">No Fee Account Found</h3>
                                    <p className="text-muted-foreground text-sm">
                                        This student doesn't have a fee account for {currentYear}.
                                        Please set up a fee structure for {student.className} first.
                                    </p>
                                </div>
                                <Button variant="outline" className="mt-4" asChild>
                                    <Link href="/operations/fees/structure">
                                        Set Up Fee Structure
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-6 pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Documents & Forms</CardTitle>
                            <CardDescription>
                                Manage official student records and uploaded files.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center border-2 border-dashed rounded-lg p-8 hover:bg-muted/20 cursor-pointer transition-colors">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="text-sm font-medium">Click to upload new document</div>
                                    <div className="text-xs text-muted-foreground">PDF, JPG or PNG up to 10MB</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
