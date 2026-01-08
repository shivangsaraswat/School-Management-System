"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    ArrowLeft,
    MapPin,
    GraduationCap,
    Users,
    Save,
    Loader2,
    Briefcase,
    FileText
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createStudent } from "@/lib/actions/students";
import { FileUpload } from "@/components/file-upload";
import { CustomDatePicker } from "@/components/custom-date-picker";
import { HeaderUpdater } from "@/components/dashboard/header-context";

const classes = [
    { id: "Nursery", name: "Nursery" },
    { id: "LKG", name: "LKG" },
    { id: "UKG", name: "UKG" },
    { id: "Class 1", name: "Class 1" },
    { id: "Class 2", name: "Class 2" },
    { id: "Class 3", name: "Class 3" },
    { id: "Class 4", name: "Class 4" },
    { id: "Class 5", name: "Class 5" },
    { id: "Class 6", name: "Class 6" },
    { id: "Class 7", name: "Class 7" },
    { id: "Class 8", name: "Class 8" },
    { id: "Class 9", name: "Class 9" },
    { id: "Class 10", name: "Class 10" },
    { id: "Class 11", name: "Class 11" },
    { id: "Class 12", name: "Class 12" },
];

const genders = ["Male", "Female", "Other"] as const;
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function AddStudentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedClass = searchParams.get("class") || "";

    // Get current academic year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const academicYear = currentMonth < 3
        ? `${currentYear - 1}-${currentYear}`
        : `${currentYear}-${currentYear + 1}`;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
    const [admissionDate, setAdmissionDate] = useState<Date | undefined>(new Date());

    const [formData, setFormData] = useState({
        // Personal
        firstName: "",
        lastName: "",
        gender: "" as "Male" | "Female" | "Other" | "",
        bloodGroup: "",
        religion: "",
        caste: "",
        photo: "",

        // Contact
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",

        // Academic
        className: preselectedClass,

        // Father
        fatherName: "",
        fatherPhone: "",
        fatherOccupation: "",
        fatherPhoto: "",
        fatherAadhaarNumber: "",
        fatherAadhaarCard: "", // URL

        // Mother
        motherName: "",
        motherPhone: "",
        motherOccupation: "",
        motherPhoto: "",
        motherAadhaarNumber: "",
        motherAadhaarCard: "", // URL

        // Guardian
        guardianName: "",
        guardianRelation: "Father",
        guardianPhone: "",
        guardianEmail: "",
        guardianOccupation: "",
        guardianPhoto: "",
        guardianAadhaarNumber: "",
        guardianAadhaarCard: "", // URL
        guardianAddress: "",

        // Student Documents
        aadhaarNumber: "",
        aadhaarCard: "", // URL
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name: string, url: string) => {
        setFormData(prev => ({ ...prev, [name]: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.firstName || !formData.lastName || !dateOfBirth || !formData.gender || !formData.className) {
            toast.error("Please fill in all required personal and academic fields");
            return;
        }

        if (!formData.fatherPhone && !formData.motherPhone && !formData.guardianPhone) {
            toast.error("Please provide at least one contact number (Father, Mother, or Guardian)");
            return;
        }

        setIsSubmitting(true);

        try {
            const dobString = dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : "";
            const admissionDateString = admissionDate ? admissionDate.toISOString().split('T')[0] : "";

            let finalGuardianName = formData.guardianName;
            let finalGuardianRelation = formData.guardianRelation;
            let finalGuardianPhone = formData.guardianPhone;
            let finalGuardianEmail = formData.guardianEmail;
            let finalGuardianOccupation = formData.guardianOccupation;
            let finalGuardianPhoto = formData.guardianPhoto;
            let finalGuardianAadhaarNumber = formData.guardianAadhaarNumber;
            let finalGuardianAadhaarCard = formData.guardianAadhaarCard;
            let finalGuardianAddress = formData.guardianAddress || formData.address;

            if (!finalGuardianName && formData.fatherName) {
                finalGuardianName = formData.fatherName;
                finalGuardianRelation = "Father";
                finalGuardianPhone = formData.fatherPhone;
                finalGuardianOccupation = formData.fatherOccupation;
                finalGuardianPhoto = formData.fatherPhoto;
                finalGuardianAadhaarNumber = formData.fatherAadhaarNumber;
                finalGuardianAadhaarCard = formData.fatherAadhaarCard;
            } else if (!finalGuardianName && formData.motherName) {
                finalGuardianName = formData.motherName;
                finalGuardianRelation = "Mother";
                finalGuardianPhone = formData.motherPhone;
                finalGuardianOccupation = formData.motherOccupation;
                finalGuardianPhoto = formData.motherPhoto;
                finalGuardianAadhaarNumber = formData.motherAadhaarNumber;
                finalGuardianAadhaarCard = formData.motherAadhaarCard;
            }

            if (!finalGuardianName || !finalGuardianPhone) {
                toast.error("Please provide Guardian details (or Father/Mother details)");
                setIsSubmitting(false);
                return;
            }

            const payload: any = {
                ...formData,
                dateOfBirth: dobString,
                admissionDate: admissionDateString,
                academicYear,
                section: "", // Explicitly empty

                // Guardian mapping
                guardianName: finalGuardianName,
                guardianRelation: finalGuardianRelation,
                guardianPhone: finalGuardianPhone,
                guardianEmail: finalGuardianEmail || null,
                guardianOccupation: finalGuardianOccupation || null,
                guardianPhoto: finalGuardianPhoto || null,
                guardianAadhaarNumber: finalGuardianAadhaarNumber || null,
                guardianAadhaarCard: finalGuardianAadhaarCard || null,
                guardianAddress: finalGuardianAddress || null,

                // Nullable field handling
                bloodGroup: formData.bloodGroup || null,
                email: formData.email || null,
                phone: formData.phone || null,
                address: formData.address || null,
                city: formData.city || null,
                state: formData.state || null,
                pincode: formData.pincode || null,
                religion: formData.religion || null,
                caste: formData.caste || null,
                photo: formData.photo || null,

                fatherName: formData.fatherName || null,
                fatherPhone: formData.fatherPhone || null,
                fatherOccupation: formData.fatherOccupation || null,
                fatherPhoto: formData.fatherPhoto || null,
                fatherAadhaarNumber: formData.fatherAadhaarNumber || null,
                fatherAadhaarCard: formData.fatherAadhaarCard || null,

                motherName: formData.motherName || null,
                motherPhone: formData.motherPhone || null,
                motherOccupation: formData.motherOccupation || null,
                motherPhoto: formData.motherPhoto || null,
                motherAadhaarNumber: formData.motherAadhaarNumber || null,
                motherAadhaarCard: formData.motherAadhaarCard || null,

                aadhaarNumber: formData.aadhaarNumber || null,
                aadhaarCard: formData.aadhaarCard || null,
            };

            const result = await createStudent(payload);

            if (result.success) {
                toast.success("Student added successfully!", {
                    description: `${formData.firstName} ${formData.lastName} has been enrolled in ${formData.className}`,
                });
                router.push("/operations/students");
            } else {
                toast.error("Failed to add student");
            }
        } catch (error) {
            console.error("Error creating student:", error);
            toast.error("An error occurred while adding the student");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in w-full pb-20">
            <HeaderUpdater
                title="Add New Student"
                description="Complete the form below to enroll a new student."
                backLink={{ label: "Students", href: "/operations/students" }}
            />

            <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto px-4 mt-4">

                {/* 1. Personal Information */}
                <Card className="rounded-sm shadow-none border bg-card">
                    <CardHeader className="bg-muted/5 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <User className="h-5 w-5 text-primary" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Basic identity details of the student</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8 p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Photo Upload - Left Side */}
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <Label className="font-semibold">Student Photo</Label>
                                <FileUpload
                                    label=""
                                    value={formData.photo}
                                    onChange={(url) => handleFileChange("photo", url)}
                                    folder="school_management/students/photos"
                                    className="w-full"
                                />
                            </div>

                            {/* Main Fields - Right Side */}
                            <div className="grid gap-6 md:grid-cols-2 flex-1">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="font-medium">First Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required
                                        placeholder="e.g. Rahul" className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="font-medium">Last Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required
                                        placeholder="e.g. Sharma" className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <CustomDatePicker
                                        label="Date of Birth *"
                                        date={dateOfBirth}
                                        setDate={setDateOfBirth}
                                        placeholder="Pick date of birth"
                                        className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="font-medium">Gender <span className="text-destructive">*</span></Label>
                                    <Select value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)} required>
                                        <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup" className="font-medium">Blood Group</Label>
                                    <Select value={formData.bloodGroup} onValueChange={(val) => handleSelectChange("bloodGroup", val)}>
                                        <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="religion" className="font-medium">Religion</Label>
                                    <Input
                                        id="religion" name="religion" value={formData.religion} onChange={handleChange}
                                        placeholder="e.g. Hindu" className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="caste" className="font-medium">Caste</Label>
                                    <Input
                                        id="caste" name="caste" value={formData.caste} onChange={handleChange}
                                        placeholder="e.g. General" className="rounded-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="aadhaarNumber" className="font-medium">Aadhaar Number</Label>
                                <Input
                                    id="aadhaarNumber" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                                    placeholder="XXXX-XXXX-XXXX" className="rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-medium">Upload Aadhaar (PDF)</Label>
                                <FileUpload
                                    label=""
                                    value={formData.aadhaarCard}
                                    onChange={(url) => handleFileChange("aadhaarCard", url)}
                                    folder="school_management/students/documents"
                                    className="h-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Contact & Address */}
                <Card className="rounded-sm shadow-none border bg-card">
                    <CardHeader className="bg-muted/5 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <MapPin className="h-5 w-5 text-primary" />
                            Contact & Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="font-medium">Student Phone</Label>
                            <Input
                                id="phone" name="phone" value={formData.phone} onChange={handleChange}
                                placeholder="+91..." className="rounded-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-medium">Student Email</Label>
                            <Input
                                id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                                placeholder="student@example.com" className="rounded-sm"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address" className="font-medium">Street Address</Label>
                            <Input
                                id="address" name="address" value={formData.address} onChange={handleChange}
                                placeholder="House No, Street, Landmark" className="rounded-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="font-medium">City</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleChange} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state" className="font-medium">State</Label>
                            <Input id="state" name="state" value={formData.state} onChange={handleChange} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode" className="font-medium">Pincode</Label>
                            <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} className="rounded-sm" />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Academic Information */}
                <Card className="rounded-sm shadow-none border bg-card">
                    <CardHeader className="bg-muted/5 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Academic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="className" className="font-medium">Class <span className="text-destructive">*</span></Label>
                            <Select value={formData.className} onValueChange={(val) => handleSelectChange("className", val)} required>
                                <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <CustomDatePicker
                                label="Admission Date *"
                                date={admissionDate}
                                setDate={setAdmissionDate}
                                className="rounded-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Father Details */}
                <Card className="rounded-sm shadow-none border bg-card">
                    <CardHeader className="bg-muted/5 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Users className="h-5 w-5 text-blue-600" />
                            Father&apos;s Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-8 p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <Label className="font-semibold">Father&apos;s Photo</Label>
                                <FileUpload
                                    label=""
                                    value={formData.fatherPhoto}
                                    onChange={(url) => handleFileChange("fatherPhoto", url)}
                                    folder="school_management/parents/fathers"
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 flex-1">
                                <div className="space-y-2">
                                    <Label htmlFor="fatherName" className="font-medium">Full Name</Label>
                                    <Input
                                        id="fatherName" name="fatherName" value={formData.fatherName} onChange={handleChange}
                                        placeholder="Father's full name" className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fatherPhone" className="font-medium">Phone Number</Label>
                                    <Input
                                        id="fatherPhone" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange}
                                        placeholder="+91..." className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="fatherOccupation" className="font-medium">Occupation</Label>
                                    <Input
                                        id="fatherOccupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange}
                                        className="rounded-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fatherAadhaarNumber" className="font-medium">Aadhaar Number</Label>
                                <Input
                                    id="fatherAadhaarNumber" name="fatherAadhaarNumber" value={formData.fatherAadhaarNumber} onChange={handleChange}
                                    placeholder="XXXX-XXXX-XXXX" className="rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-medium">Upload Aadhaar (PDF)</Label>
                                <FileUpload
                                    label=""
                                    value={formData.fatherAadhaarCard}
                                    onChange={(url) => handleFileChange("fatherAadhaarCard", url)}
                                    folder="school_management/parents/documents"
                                    className="h-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Mother Details */}
                <Card className="rounded-sm shadow-none border bg-card">
                    <CardHeader className="bg-muted/5 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Users className="h-5 w-5 text-pink-600" />
                            Mother&apos;s Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-8 p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <Label className="font-semibold">Mother&apos;s Photo</Label>
                                <FileUpload
                                    label=""
                                    value={formData.motherPhoto}
                                    onChange={(url) => handleFileChange("motherPhoto", url)}
                                    folder="school_management/parents/mothers"
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 flex-1">
                                <div className="space-y-2">
                                    <Label htmlFor="motherName" className="font-medium">Full Name</Label>
                                    <Input
                                        id="motherName" name="motherName" value={formData.motherName} onChange={handleChange}
                                        placeholder="Mother's full name" className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="motherPhone" className="font-medium">Phone Number</Label>
                                    <Input
                                        id="motherPhone" name="motherPhone" value={formData.motherPhone} onChange={handleChange}
                                        placeholder="+91..." className="rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="motherOccupation" className="font-medium">Occupation</Label>
                                    <Input
                                        id="motherOccupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange}
                                        className="rounded-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="motherAadhaarNumber" className="font-medium">Aadhaar Number</Label>
                                <Input
                                    id="motherAadhaarNumber" name="motherAadhaarNumber" value={formData.motherAadhaarNumber} onChange={handleChange}
                                    placeholder="XXXX-XXXX-XXXX" className="rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-medium">Upload Aadhaar (PDF)</Label>
                                <FileUpload
                                    label=""
                                    value={formData.motherAadhaarCard}
                                    onChange={(url) => handleFileChange("motherAadhaarCard", url)}
                                    folder="school_management/parents/documents"
                                    className="h-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Guardian Details */}
                <Card className="rounded-sm shadow-none border bg-card">
                    <CardHeader className="bg-muted/5 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                            Guardian Details (if different)
                        </CardTitle>
                        <CardDescription>
                            Leave empty if Father or Mother is the guardian.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8 p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <Label className="font-semibold">Guardian Photo</Label>
                                <FileUpload
                                    label=""
                                    value={formData.guardianPhoto}
                                    onChange={(url) => handleFileChange("guardianPhoto", url)}
                                    folder="school_management/guardians"
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 flex-1">
                                <div className="space-y-2">
                                    <Label htmlFor="guardianName" className="font-medium">Full Name</Label>
                                    <Input id="guardianName" name="guardianName" value={formData.guardianName} onChange={handleChange} className="rounded-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardianRelation" className="font-medium">Relation</Label>
                                    <Select value={formData.guardianRelation} onValueChange={(val) => handleSelectChange("guardianRelation", val)}>
                                        <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Father">Father</SelectItem>
                                            <SelectItem value="Mother">Mother</SelectItem>
                                            <SelectItem value="Grandfather">Grandfather</SelectItem>
                                            <SelectItem value="Grandmother">Grandmother</SelectItem>
                                            <SelectItem value="Uncle">Uncle</SelectItem>
                                            <SelectItem value="Aunt">Aunt</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardianPhone" className="font-medium">Phone Number</Label>
                                    <Input id="guardianPhone" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} className="rounded-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardianAddress" className="font-medium">Address (if different)</Label>
                                    <Input id="guardianAddress" name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} className="rounded-sm" />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="guardianAadhaarNumber" className="font-medium">Aadhaar Number</Label>
                                <Input
                                    id="guardianAadhaarNumber" name="guardianAadhaarNumber" value={formData.guardianAadhaarNumber} onChange={handleChange}
                                    placeholder="XXXX-XXXX-XXXX" className="rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-medium">Upload Aadhaar (PDF)</Label>
                                <FileUpload
                                    label=""
                                    value={formData.guardianAadhaarCard}
                                    onChange={(url) => handleFileChange("guardianAadhaarCard", url)}
                                    folder="school_management/guardians/documents"
                                    className="h-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>



                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-8 pb-20">
                    <Button type="button" variant="outline" asChild size="lg" className="w-full sm:w-auto rounded-sm">
                        <Link href="/operations/students">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto min-w-[200px] rounded-sm">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving Student...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save & Enroll Student
                            </>
                        )}
                    </Button>
                </div>
            </form >
        </div >
    );
}

export default function AddStudentPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AddStudentForm />
        </Suspense>
    );
}
