"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ChevronLeft,
    Upload,
    Calendar,
    MapPin,
    Mail,
    Phone,
    Shield,
    Activity,
    User
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
import { toast } from "sonner";
import { updateStudent } from "@/lib/actions/students";
import type { Student } from "@/db/schema";
import { format } from "date-fns";

interface StudentProfileClientProps {
    student: Student;
    fees: Array<{
        id: string;
        amount: string;
        status: string;
        month: string;
        dueDate: string;
        feeType?: { name: string } | null;
    }>;
    feeStatus: string;
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
}

export function StudentProfileClient({
    student: initialStudent,
    fees,
    feeStatus,
    attendanceHistory,
    attendanceStats,
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

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header / Nav */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit p-0 hover:bg-transparent text-muted-foreground hover:text-foreground no-underline"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Class List
                </Button>

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
                                    {student.className} - {student.section}
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

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        )}
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

                <TabsContent value="fees" className="space-y-6 pt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Fee History</CardTitle>
                                <Badge variant={
                                    feeStatus === 'paid' ? 'default' :
                                        feeStatus === 'overdue' ? 'destructive' : 'secondary'
                                } className="capitalize">
                                    {feeStatus}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {fees.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No fee records found</p>
                            ) : (
                                <div className="space-y-3">
                                    {fees.map((fee) => (
                                        <div key={fee.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                            <div>
                                                <div className="font-medium">{fee.feeType?.name || 'Fee'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {fee.month} • Due: {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">₹{parseFloat(fee.amount).toLocaleString()}</div>
                                                <Badge variant={
                                                    fee.status === 'paid' ? 'default' :
                                                        fee.status === 'overdue' ? 'destructive' : 'secondary'
                                                } className="capitalize mt-1">
                                                    {fee.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
