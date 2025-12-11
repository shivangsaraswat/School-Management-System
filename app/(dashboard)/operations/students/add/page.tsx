"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    UserPlus,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Users,
    Save,
    Loader2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const classes = [
    { id: "nursery", name: "Nursery" },
    { id: "lkg", name: "LKG" },
    { id: "ukg", name: "UKG" },
    { id: "1", name: "Class 1" },
    { id: "2", name: "Class 2" },
    { id: "3", name: "Class 3" },
    { id: "4", name: "Class 4" },
    { id: "5", name: "Class 5" },
    { id: "6", name: "Class 6" },
    { id: "7", name: "Class 7" },
    { id: "8", name: "Class 8" },
    { id: "9", name: "Class 9" },
    { id: "10", name: "Class 10" },
    { id: "11", name: "Class 11" },
    { id: "12", name: "Class 12" },
];
const sections = ["A", "B", "C"];
const genders = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AddStudentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedClass = searchParams.get("class") || "";
    const preselectedSection = searchParams.get("section") || "";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        className: preselectedClass,
        section: preselectedSection,
        admissionDate: new Date().toISOString().split("T")[0],
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianOccupation: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Student added successfully!", {
            description: `${formData.firstName} ${formData.lastName} has been enrolled in Class ${formData.className}-${formData.section}`,
        });

        setIsSubmitting(false);
        router.push("/operations/students");
    };

    return (
        <div className="space-y-6 animate-fade-in w-full pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                <Link
                    href="/operations/students"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Students
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Add New Student
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Fill in the details to enroll a new student
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Basic details about the student</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(val) => handleSelectChange("gender", val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genders.map(g => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bloodGroup">Blood Group</Label>
                            <Select
                                value={formData.bloodGroup}
                                onValueChange={(val) => handleSelectChange("bloodGroup", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bloodGroups.map(bg => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="student@email.com"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                            Address
                        </CardTitle>
                        <CardDescription>Student&apos;s residential address</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House no, Street name, Area"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                                id="pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="110001"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                            Academic Information
                        </CardTitle>
                        <CardDescription>Class and admission details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="className">Class <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.className}
                                onValueChange={(val) => handleSelectChange("className", val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="section">Section <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.section}
                                onValueChange={(val) => handleSelectChange("section", val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(s => (
                                        <SelectItem key={s} value={s}>Section {s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admissionDate">Admission Date <span className="text-destructive">*</span></Label>
                            <Input
                                id="admissionDate"
                                name="admissionDate"
                                type="date"
                                value={formData.admissionDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Guardian Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                            Guardian Information
                        </CardTitle>
                        <CardDescription>Parent or guardian contact details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="guardianName">Guardian Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="guardianName"
                                name="guardianName"
                                value={formData.guardianName}
                                onChange={handleChange}
                                placeholder="Full name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianRelation">Relation <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.guardianRelation}
                                onValueChange={(val) => handleSelectChange("guardianRelation", val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Father">Father</SelectItem>
                                    <SelectItem value="Mother">Mother</SelectItem>
                                    <SelectItem value="Guardian">Guardian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianPhone">Guardian Phone <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="guardianPhone"
                                    name="guardianPhone"
                                    value={formData.guardianPhone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianEmail">Guardian Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="guardianEmail"
                                    name="guardianEmail"
                                    type="email"
                                    value={formData.guardianEmail}
                                    onChange={handleChange}
                                    placeholder="guardian@email.com"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="guardianOccupation">Occupation</Label>
                            <Input
                                id="guardianOccupation"
                                name="guardianOccupation"
                                value={formData.guardianOccupation}
                                onChange={handleChange}
                                placeholder="e.g., Business, Government Service, etc."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" asChild size="lg">
                        <Link href="/operations/students">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[150px]">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Enroll Student
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
