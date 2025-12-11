"use client";

import { useState } from "react";
import { ClipboardCheck, Calendar, Check, X, Clock, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Mock students
const students = [
    { id: "1", name: "Rahul Sharma", rollNo: 1, status: "present" },
    { id: "2", name: "Priya Singh", rollNo: 2, status: "present" },
    { id: "3", name: "Amit Kumar", rollNo: 3, status: "absent" },
    { id: "4", name: "Neha Gupta", rollNo: 4, status: "present" },
    { id: "5", name: "Vikram Patel", rollNo: 5, status: "late" },
    { id: "6", name: "Anjali Reddy", rollNo: 6, status: null },
    { id: "7", name: "Sanjay Mehta", rollNo: 7, status: null },
    { id: "8", name: "Kavya Nair", rollNo: 8, status: null },
];

type AttendanceStatus = "present" | "absent" | "late" | "leave" | null;

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
        Object.fromEntries(students.map((s) => [s.id, s.status as AttendanceStatus]))
    );

    const markAttendance = (studentId: string, status: AttendanceStatus) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const markedCount = Object.values(attendance).filter((s) => s !== null).length;
    const presentCount = Object.values(attendance).filter((s) => s === "present").length;
    const absentCount = Object.values(attendance).filter((s) => s === "absent").length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardCheck className="h-8 w-8 text-primary" />
                        Attendance
                    </h1>
                    <p className="text-muted-foreground">
                        Mark daily attendance for your class
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                        <p className="text-xs text-muted-foreground">Present</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                        <p className="text-xs text-muted-foreground">Absent</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {markedCount}/{students.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Marked</p>
                    </CardContent>
                </Card>
            </div>

            {/* Class Selector */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Class 10 - Section A</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newAttendance: Record<string, AttendanceStatus> = {};
                                    students.forEach((s) => (newAttendance[s.id] = "present"));
                                    setAttendance(newAttendance);
                                }}
                            >
                                Mark All Present
                            </Button>
                            <Button size="sm">Save Attendance</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(student.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Roll No: {student.rollNo}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant={attendance[student.id] === "present" ? "default" : "outline"}
                                        className={
                                            attendance[student.id] === "present"
                                                ? "bg-green-500 hover:bg-green-600"
                                                : ""
                                        }
                                        onClick={() => markAttendance(student.id, "present")}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant={attendance[student.id] === "absent" ? "default" : "outline"}
                                        className={
                                            attendance[student.id] === "absent"
                                                ? "bg-red-500 hover:bg-red-600"
                                                : ""
                                        }
                                        onClick={() => markAttendance(student.id, "absent")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant={attendance[student.id] === "late" ? "default" : "outline"}
                                        className={
                                            attendance[student.id] === "late"
                                                ? "bg-yellow-500 hover:bg-yellow-600"
                                                : ""
                                        }
                                        onClick={() => markAttendance(student.id, "late")}
                                    >
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant={attendance[student.id] === "leave" ? "default" : "outline"}
                                        onClick={() => markAttendance(student.id, "leave")}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
