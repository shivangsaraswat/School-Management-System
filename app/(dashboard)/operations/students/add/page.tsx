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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Student added successfully!", {
            description: `${formData.firstName} ${formData.lastName} has been enrolled in Class ${formData.className}-${formData.section}`,
        });

        setIsSubmitting(false);
        router.push("/operations/students");
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <Link
                    href="/operations/students"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Students
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Add New Student
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Fill in the details to enroll a new student
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader className="py-4 md:py-5 px-4 md:px-6">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <User className="h-4 w-4 md:h-5 md:w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">Basic details about the student</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                className="h-9 md:h-10 text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                className="h-9 md:h-10 text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="h-9 md:h-10 text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="text-sm">Gender *</Label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full h-9 md:h-10 px-3 rounded-md border border-input bg-background text-sm"
                                required
                            >
                                <option value="">Select gender</option>
                                {genders.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bloodGroup" className="text-sm">Blood Group</Label>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="w-full h-9 md:h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">Select blood group</option>
                                {bloodGroups.map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="pl-10 h-9 md:h-10 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="student@email.com"
                                    className="pl-10 h-9 md:h-10 text-sm"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader className="py-4 md:py-5 px-4 md:px-6">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                            Address
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">Student&apos;s residential address</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address" className="text-sm">Street Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House no, Street name, Area"
                                className="h-9 md:h-10 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="h-9 md:h-10 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-sm">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="h-9 md:h-10 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode" className="text-sm">Pincode</Label>
                            <Input
                                id="pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="110001"
                                className="h-9 md:h-10 text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                    <CardHeader className="py-4 md:py-5 px-4 md:px-6">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                            Academic Information
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">Class and admission details</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="className" className="text-sm">Class *</Label>
                            <select
                                id="className"
                                name="className"
                                value={formData.className}
                                onChange={handleChange}
                                className="w-full h-9 md:h-10 px-3 rounded-md border border-input bg-background text-sm"
                                required
                            >
                                <option value="">Select class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="section" className="text-sm">Section *</Label>
                            <select
                                id="section"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                className="w-full h-9 md:h-10 px-3 rounded-md border border-input bg-background text-sm"
                                required
                            >
                                <option value="">Select section</option>
                                {sections.map(s => (
                                    <option key={s} value={s}>Section {s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admissionDate" className="text-sm">Admission Date *</Label>
                            <Input
                                id="admissionDate"
                                name="admissionDate"
                                type="date"
                                value={formData.admissionDate}
                                onChange={handleChange}
                                className="h-9 md:h-10 text-sm"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Guardian Information */}
                <Card>
                    <CardHeader className="py-4 md:py-5 px-4 md:px-6">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 md:h-5 md:w-5" />
                            Guardian Information
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">Parent or guardian contact details</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="guardianName" className="text-sm">Guardian Name *</Label>
                            <Input
                                id="guardianName"
                                name="guardianName"
                                value={formData.guardianName}
                                onChange={handleChange}
                                placeholder="Full name"
                                className="h-9 md:h-10 text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianRelation" className="text-sm">Relation *</Label>
                            <select
                                id="guardianRelation"
                                name="guardianRelation"
                                value={formData.guardianRelation}
                                onChange={handleChange}
                                className="w-full h-9 md:h-10 px-3 rounded-md border border-input bg-background text-sm"
                                required
                            >
                                <option value="">Select relation</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Guardian">Guardian</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianPhone" className="text-sm">Guardian Phone *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="guardianPhone"
                                    name="guardianPhone"
                                    value={formData.guardianPhone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="pl-10 h-9 md:h-10 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianEmail" className="text-sm">Guardian Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="guardianEmail"
                                    name="guardianEmail"
                                    type="email"
                                    value={formData.guardianEmail}
                                    onChange={handleChange}
                                    placeholder="guardian@email.com"
                                    className="pl-10 h-9 md:h-10 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="guardianOccupation" className="text-sm">Occupation</Label>
                            <Input
                                id="guardianOccupation"
                                name="guardianOccupation"
                                value={formData.guardianOccupation}
                                onChange={handleChange}
                                placeholder="e.g., Business, Government Service, etc."
                                className="h-9 md:h-10 text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button type="button" variant="outline" asChild className="h-9 md:h-10 text-sm">
                        <Link href="/operations/students">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="gap-2 h-9 md:h-10 text-sm">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding Student...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Add Student
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
