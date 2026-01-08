"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    Phone,
    Briefcase,
    GraduationCap,
    Save,
    Plus,
    Trash2,
    FileText,
    BookOpen,
    User,
    MapPin,
    Upload,
    Edit,
    X,
    LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
    updateTeacher,
    assignClassToTeacher,
    removeClassFromTeacher,
} from "@/lib/actions/teachers";
import type { Teacher, TeacherClassAssignment, TeacherDocument } from "@/db/schema";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface LinkedUser {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
}

interface TeacherData {
    teacher: Teacher;
    linkedUser: LinkedUser | null;
    classAssignments: TeacherClassAssignment[];
    documents: TeacherDocument[];
}

interface ClassConfig {
    name: string;
    sections: string[];
}

interface TeacherProfileClientProps {
    data: TeacherData;
    schoolClasses: ClassConfig[];
    academicYears: string[];
    currentYear: string;
}

export function TeacherProfileClient({
    data,
    schoolClasses,
    academicYears,
    currentYear,
}: TeacherProfileClientProps) {
    const router = useRouter();
    const { teacher, linkedUser, classAssignments, documents } = data;

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [classDialogOpen, setClassDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email || "",
        phone: teacher.phone || "",
        dateOfBirth: teacher.dateOfBirth || "",
        gender: teacher.gender || "",
        bloodGroup: teacher.bloodGroup || "",
        address: teacher.address || "",
        city: teacher.city || "",
        state: teacher.state || "",
        pincode: teacher.pincode || "",
        qualifications: teacher.qualifications || "",
        specialization: teacher.specialization || "",
        experience: teacher.experience?.toString() || "",
        joiningDate: teacher.joiningDate || "",
        emergencyContact: teacher.emergencyContact || "",
        emergencyPhone: teacher.emergencyPhone || "",
    });

    // Class assignment form
    const [newAssignment, setNewAssignment] = useState({
        className: "",
        section: "",
        subject: "",
        isClassTeacher: false,
        academicYear: currentYear,
    });

    const getInitials = () => {
        return `${teacher.firstName[0] || ""}${teacher.lastName[0] || ""}`.toUpperCase();
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateTeacher(teacher.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || null,
                phone: formData.phone || null,
                dateOfBirth: formData.dateOfBirth || null,
                gender: (formData.gender as "Male" | "Female" | "Other") || null,
                bloodGroup: formData.bloodGroup || null,
                address: formData.address || null,
                city: formData.city || null,
                state: formData.state || null,
                pincode: formData.pincode || null,
                qualifications: formData.qualifications || null,
                specialization: formData.specialization || null,
                experience: formData.experience ? parseInt(formData.experience) : null,
                joiningDate: formData.joiningDate || null,
                emergencyContact: formData.emergencyContact || null,
                emergencyPhone: formData.emergencyPhone || null,
            });

            if (result.success) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignClass = async () => {
        if (!newAssignment.className || !newAssignment.section) {
            toast.error("Please select class and section");
            return;
        }

        setIsLoading(true);
        try {
            const result = await assignClassToTeacher(teacher.id, {
                className: newAssignment.className,
                section: newAssignment.section,
                subject: newAssignment.subject || undefined,
                isClassTeacher: newAssignment.isClassTeacher,
                academicYear: newAssignment.academicYear,
            });

            if (result.success) {
                toast.success("Class assigned successfully");
                setClassDialogOpen(false);
                setNewAssignment({
                    className: "",
                    section: "",
                    subject: "",
                    isClassTeacher: false,
                    academicYear: currentYear,
                });
                router.refresh();
            } else {
                toast.error(result.error || "Failed to assign class");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveClass = async (assignmentId: string) => {
        setIsLoading(true);
        try {
            const result = await removeClassFromTeacher(assignmentId);
            if (result.success) {
                toast.success("Class removed");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to remove class");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedClassSections = schoolClasses.find(
        (c) => c.name === newAssignment.className
    )?.sections || [];

    const inputClassName = (isReadOnly: boolean) =>
        isReadOnly ? "bg-muted/50 border-none focus-visible:ring-0" : "";

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <HeaderUpdater
                title="Teacher Profile"
                description="Manage teacher details and class assignments"
                backLink={{ label: "Teachers", href: "/operations/teachers" }}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={teacher.photo || linkedUser?.avatar || ""} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {teacher.firstName} {teacher.lastName}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Badge variant={teacher.isActive ? "default" : "destructive"}>
                                {teacher.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-muted-foreground">|</span>
                            <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {teacher.employeeId}
                            </span>
                            {teacher.phone && (
                                <>
                                    <span className="text-muted-foreground">|</span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {teacher.phone}
                                    </span>
                                </>
                            )}
                        </div>
                        {linkedUser && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                <LinkIcon className="h-3 w-3" />
                                Linked to account: {linkedUser.email}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="details"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        <User className="h-4 w-4 mr-2" />
                        Teacher Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="classes"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Classes & Subjects
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                    </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 pt-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={formData.firstName}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.lastName}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={formData.email}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input
                                    type={isEditing ? "date" : "text"}
                                    value={formData.dateOfBirth}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(v) => setFormData({ ...formData, gender: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={formData.gender || "-"}
                                        readOnly
                                        className={inputClassName(true)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Blood Group</Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.bloodGroup}
                                        onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        value={formData.bloodGroup || "-"}
                                        readOnly
                                        className={inputClassName(true)}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                                Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Address</Label>
                                <Input
                                    value={formData.address}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        value={formData.city}
                                        readOnly={!isEditing}
                                        className={inputClassName(!isEditing)}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={formData.state}
                                        readOnly={!isEditing}
                                        className={inputClassName(!isEditing)}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input
                                        value={formData.pincode}
                                        readOnly={!isEditing}
                                        className={inputClassName(!isEditing)}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                Professional Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Qualifications</Label>
                                <Input
                                    value={formData.qualifications}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Specialization</Label>
                                <Input
                                    value={formData.specialization}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Experience (Years)</Label>
                                <Input
                                    type="number"
                                    value={formData.experience}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Joining Date</Label>
                                <Input
                                    type={isEditing ? "date" : "text"}
                                    value={formData.joiningDate}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Phone className="h-5 w-5 text-primary" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contact Name</Label>
                                <Input
                                    value={formData.emergencyContact}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Phone</Label>
                                <Input
                                    value={formData.emergencyPhone}
                                    readOnly={!isEditing}
                                    className={inputClassName(!isEditing)}
                                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Classes Tab */}
                <TabsContent value="classes" className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Assigned Classes</h3>
                        <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Assign Class
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Assign Class</DialogTitle>
                                    <DialogDescription>
                                        Assign a class and subject to this teacher.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Class</Label>
                                        <Select
                                            value={newAssignment.className}
                                            onValueChange={(v) =>
                                                setNewAssignment({ ...newAssignment, className: v, section: "" })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {schoolClasses.map((c) => (
                                                    <SelectItem key={c.name} value={c.name}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Section</Label>
                                        <Select
                                            value={newAssignment.section}
                                            onValueChange={(v) =>
                                                setNewAssignment({ ...newAssignment, section: v })
                                            }
                                            disabled={!newAssignment.className}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedClassSections.map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subject (Optional)</Label>
                                        <Input
                                            value={newAssignment.subject}
                                            onChange={(e) =>
                                                setNewAssignment({ ...newAssignment, subject: e.target.value })
                                            }
                                            placeholder="e.g., Mathematics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Academic Year</Label>
                                        <Select
                                            value={newAssignment.academicYear}
                                            onValueChange={(v) =>
                                                setNewAssignment({ ...newAssignment, academicYear: v })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setClassDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAssignClass} disabled={isLoading}>
                                        {isLoading ? "Assigning..." : "Assign"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {classAssignments.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            <h3 className="mt-4 font-medium">No classes assigned</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Assign classes to this teacher using the button above.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classAssignments.map((assignment) => (
                                <Card key={assignment.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold">
                                                    {assignment.className} - {assignment.section}
                                                </h4>
                                                {assignment.subject && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {assignment.subject}
                                                    </p>
                                                )}
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    {assignment.academicYear}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleRemoveClass(assignment.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6 pt-6">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 font-medium">Upload Documents</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Drag and drop files here, or click to browse
                        </p>
                        <Button variant="outline" className="mt-4">
                            <Upload className="h-4 w-4 mr-2" />
                            Browse Files
                        </Button>
                    </div>

                    {documents.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                No documents uploaded yet
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map((doc) => (
                                <Card key={doc.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div>
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.type}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
