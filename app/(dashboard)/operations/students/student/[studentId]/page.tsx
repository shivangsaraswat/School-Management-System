"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
    ChevronLeft,
    Save,
    Upload,
    Calendar,
    MapPin,
    Mail,
    Phone,
    School,
    FileText,
    Shield,
    Activity,
    BookOpen,
    Clock,
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

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.studentId as string;

    // Mock Data mimicking a DB fetch
    const [student, setStudent] = useState({
        id: studentId,
        firstName: "Rahul",
        lastName: "Sharma",
        rollNo: "12",
        admissionNo: "ADM20240100",
        class: "10",
        section: "A",
        dob: "2008-05-15",
        gender: "Male",
        bloodGroup: "B+",
        email: "rahul.sharma@example.com",
        phone: "+91 9876543210",
        address: "123, Gandhi Nagar, New Delhi",
        fatherName: "Rajesh Sharma",
        fatherPhone: "+91 9876543310",
        fatherOccupation: "Engineer",
        motherName: "Sunita Sharma",
        motherPhone: "+91 9876543311",
        motherOccupation: "Teacher",
        admissionDate: "2018-04-01",
        previousSchool: "St. Mary's Primary School",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsEditing(false);
        toast.success("Student details updated successfully");
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
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`} />
                                    <AvatarFallback className="text-2xl">{student.firstName[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full shadow-md h-8 w-8">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                <Badge variant="outline" className="text-sm font-normal py-1 px-3 bg-background">
                                    Class {student.class} - {student.section}
                                </Badge>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1 text-sm">
                                    <Shield className="h-3.5 w-3.5" />
                                    ADM: {student.admissionNo}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="flex items-center gap-1 text-sm">
                                    <Activity className="h-3.5 w-3.5 text-green-500" />
                                    Active
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
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        Documents & Forms
                    </TabsTrigger>
                    <TabsTrigger
                        value="academic"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        Academic History
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
                                            value={student.dob}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0 pl-10" : "pl-10"}
                                            onChange={(e) => setStudent({ ...student, dob: e.target.value })}
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
                                        value={student.bloodGroup}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/50 border-none focus-visible:ring-0" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <div className="relative">
                                        <Input
                                            value={student.email}
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
                                        value={student.address}
                                        readOnly={!isEditing}
                                        className={`min-h-[80px] resize-none ${!isEditing ? "bg-muted/50 border-none focus-visible:ring-0 pl-10" : "pl-10"}`}
                                        onChange={(e) => setStudent({ ...student, address: e.target.value })}
                                    />
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parents/Guardian Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-primary" />
                                Guardian Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                                {/* Father */}
                                <div className="space-y-4">
                                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                                        Father's Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Name</Label>
                                            <Input
                                                value={student.fatherName}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Occupation</Label>
                                            <Input
                                                value={student.fatherOccupation}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Phone</Label>
                                            <div className="relative">
                                                <Input
                                                    value={student.fatherPhone}
                                                    readOnly={!isEditing}
                                                    className={!isEditing ? "bg-muted/50 border-none h-9 pl-8" : "h-9 pl-8"}
                                                />
                                                <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mother */}
                                <div className="space-y-4">
                                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                                        Mother's Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Name</Label>
                                            <Input
                                                value={student.motherName}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Occupation</Label>
                                            <Input
                                                value={student.motherOccupation}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-muted/50 border-none h-9" : "h-9"}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Phone</Label>
                                            <div className="relative">
                                                <Input
                                                    value={student.motherPhone}
                                                    readOnly={!isEditing}
                                                    className={!isEditing ? "bg-muted/50 border-none h-9 pl-8" : "h-9 pl-8"}
                                                />
                                                <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                        </div>
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
                                <div className="text-3xl font-bold text-green-600 mt-1">156</div>
                                <div className="text-xs text-green-600/80 mt-1">Days this year</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-red-700">Absent</div>
                                <div className="text-3xl font-bold text-red-600 mt-1">12</div>
                                <div className="text-xs text-red-600/80 mt-1">Days this year</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-yellow-700">Late</div>
                                <div className="text-3xl font-bold text-yellow-600 mt-1">8</div>
                                <div className="text-xs text-yellow-600/80 mt-1">Days this year</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-primary">Attendance Rate</div>
                                <div className="text-3xl font-bold text-primary mt-1">92%</div>
                                <div className="text-xs text-primary/80 mt-1">Overall percentage</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendance Calendar */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Attendance Calendar
                                    </CardTitle>
                                    <CardDescription>December 2024</CardDescription>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <span className="text-muted-foreground">Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <span className="text-muted-foreground">Absent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                        <span className="text-muted-foreground">Late</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-muted" />
                                        <span className="text-muted-foreground">Holiday/Weekend</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {/* Weekday headers */}
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}
                                {/* Calendar days - December 2024 starts on Sunday */}
                                {Array.from({ length: 31 }, (_, i) => {
                                    const day = i + 1;
                                    const dayOfWeek = new Date(2024, 11, day).getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                    // Mock attendance data
                                    let status: 'present' | 'absent' | 'late' | 'holiday' = 'present';
                                    if (isWeekend) status = 'holiday';
                                    else if ([3, 17].includes(day)) status = 'absent';
                                    else if ([5, 11].includes(day)) status = 'late';
                                    else if (day > 12) status = 'holiday'; // Future days

                                    const statusColors = {
                                        present: 'bg-green-500 text-white hover:bg-green-600',
                                        absent: 'bg-red-500 text-white hover:bg-red-600',
                                        late: 'bg-yellow-500 text-white hover:bg-yellow-600',
                                        holiday: 'bg-muted text-muted-foreground',
                                    };

                                    return (
                                        <div
                                            key={day}
                                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${statusColors[status]}`}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Attendance Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Attendance Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { date: 'Dec 12, 2024', status: 'Present', time: '8:15 AM', note: 'On time' },
                                    { date: 'Dec 11, 2024', status: 'Late', time: '9:05 AM', note: 'Bus delay' },
                                    { date: 'Dec 10, 2024', status: 'Present', time: '8:10 AM', note: 'On time' },
                                    { date: 'Dec 9, 2024', status: 'Present', time: '8:20 AM', note: 'On time' },
                                    { date: 'Dec 6, 2024', status: 'Present', time: '8:05 AM', note: 'On time' },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-2 w-2 rounded-full ${log.status === 'Present' ? 'bg-green-500' :
                                                    log.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                            <div>
                                                <div className="font-medium text-sm">{log.date}</div>
                                                <div className="text-xs text-muted-foreground">{log.note}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-medium ${log.status === 'Present' ? 'text-green-600' :
                                                    log.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                                }`}>{log.status}</div>
                                            <div className="text-xs text-muted-foreground">{log.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6 pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Admission & Legal Documents</CardTitle>
                            <CardDescription>
                                Manage official student records and uploaded files.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Admission Form</div>
                                            <div className="text-xs text-muted-foreground">Uploaded on 12 Apr, 2018</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>

                                <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <School className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Transfer Certificate</div>
                                            <div className="text-xs text-muted-foreground">Verified Original</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>

                                <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Medical Record</div>
                                            <div className="text-xs text-muted-foreground">Updated 6 months ago</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            </div>

                            <Separator className="my-2" />

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

                <TabsContent value="academic" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Academic Progression</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6 border-l-2 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                    <div className="font-medium">Class 10 (Current)</div>
                                    <div className="text-sm text-muted-foreground">2024 - 2025</div>
                                </div>
                                <div className="relative opacity-70">
                                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-muted-foreground border-2 border-background" />
                                    <div className="font-medium">Class 9</div>
                                    <div className="text-sm text-muted-foreground">2023 - 2024</div>
                                    <div className="mt-1 text-sm font-medium text-green-600">Result: 92% (Passed)</div>
                                </div>
                                <div className="relative opacity-60">
                                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-muted-foreground border-2 border-background" />
                                    <div className="font-medium">Class 8</div>
                                    <div className="text-sm text-muted-foreground">2022 - 2023</div>
                                    <div className="mt-1 text-sm font-medium text-green-600">Result: 88% (Passed)</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
