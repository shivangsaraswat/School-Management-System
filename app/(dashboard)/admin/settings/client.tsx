"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Building2, Calendar, Mail, Loader2, Plus, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { setSetting, addAcademicYear } from "@/lib/actions/settings";

interface SettingsClientProps {
    initialSettings: Record<string, string>;
    academicYears: string[];
    currentAcademicYear: string;
}

export default function SettingsClient({ initialSettings, academicYears, currentAcademicYear }: SettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingYear, setIsAddingYear] = useState(false);
    const [newYear, setNewYear] = useState("");
    const [settings, setSettings] = useState({
        schoolName: initialSettings.school_name || "",
        shortName: initialSettings.school_short_name || "",
        address: initialSettings.school_address || "",
        phone: initialSettings.school_phone || "",
        academicYear: initialSettings.current_academic_year || currentAcademicYear,
        sessionStart: initialSettings.session_start_month || "April",
        feeDueDay: initialSettings.fee_due_day || "10",
        lateFee: initialSettings.late_fee_penalty || "5",
        adminEmail: initialSettings.admin_email || "",
        supportEmail: initialSettings.support_email || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                setSetting("school_name", settings.schoolName),
                setSetting("school_short_name", settings.shortName),
                setSetting("school_address", settings.address),
                setSetting("school_phone", settings.phone),
                setSetting("current_academic_year", settings.academicYear),
                setSetting("session_start_month", settings.sessionStart),
                setSetting("fee_due_day", settings.feeDueDay),
                setSetting("late_fee_penalty", settings.lateFee),
                setSetting("admin_email", settings.adminEmail),
                setSetting("support_email", settings.supportEmail),
            ]);

            toast.success("Settings saved successfully");
            router.refresh();
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAcademicYear = async () => {
        if (!newYear) {
            toast.error("Please enter a valid academic year");
            return;
        }

        // Validate format (e.g., 2027-2028)
        const yearPattern = /^\d{4}-\d{4}$/;
        if (!yearPattern.test(newYear)) {
            toast.error("Please enter year in format YYYY-YYYY (e.g., 2027-2028)");
            return;
        }

        const [start, end] = newYear.split("-").map(Number);
        if (end !== start + 1) {
            toast.error("End year must be start year + 1");
            return;
        }

        setIsAddingYear(true);
        try {
            await addAcademicYear(newYear);
            toast.success(`Academic year ${newYear} added successfully`);
            setNewYear("");
            router.refresh();
        } catch (error) {
            console.error("Error adding academic year:", error);
            toast.error("Failed to add academic year");
        } finally {
            setIsAddingYear(false);
        }
    };

    const handleSetCurrentYear = async (year: string) => {
        setIsLoading(true);
        try {
            await setSetting("current_academic_year", year);
            setSettings(prev => ({ ...prev, academicYear: year }));
            toast.success(`Current academic year set to ${year}`);
            router.refresh();
        } catch (error) {
            console.error("Error setting current year:", error);
            toast.error("Failed to set current year");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                    <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    Global Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage school-wide configuration and preferences
                </p>
            </div>

            {/* School Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        School Information
                    </CardTitle>
                    <CardDescription>
                        Basic details about your institution
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">School Name</Label>
                            <Input
                                id="schoolName"
                                value={settings.schoolName}
                                onChange={handleChange}
                                placeholder="Enter school name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortName">Short Name / Code</Label>
                            <Input
                                id="shortName"
                                value={settings.shortName}
                                onChange={handleChange}
                                placeholder="Enter short code"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={settings.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Contact Number</Label>
                            <Input
                                id="phone"
                                value={settings.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Academic Session Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Academic Sessions
                    </CardTitle>
                    <CardDescription>
                        Manage academic years and create new sessions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current Academic Year */}
                    <div className="space-y-2">
                        <Label>Current Academic Year</Label>
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-sm px-3 py-1">
                                {settings.academicYear || currentAcademicYear}
                            </Badge>
                            <span className="text-sm text-muted-foreground">(Active session)</span>
                        </div>
                    </div>

                    {/* Add New Academic Year */}
                    <div className="space-y-2">
                        <Label>Create New Academic Session</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                placeholder="e.g., 2027-2028"
                                className="max-w-[200px]"
                            />
                            <Button
                                onClick={handleAddAcademicYear}
                                disabled={isAddingYear || !newYear}
                                size="sm"
                            >
                                {isAddingYear ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Add Year
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Create upcoming academic sessions. Format: YYYY-YYYY (e.g., 2027-2028)
                        </p>
                    </div>

                    {/* Available Academic Years */}
                    <div className="space-y-2">
                        <Label>Available Academic Years</Label>
                        <div className="flex flex-wrap gap-2">
                            {academicYears.map((year) => (
                                <div
                                    key={year}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm ${year === settings.academicYear
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted/50 hover:bg-muted cursor-pointer"
                                        }`}
                                    onClick={() => year !== settings.academicYear && handleSetCurrentYear(year)}
                                >
                                    {year}
                                    {year === settings.academicYear && (
                                        <Check className="h-3.5 w-3.5" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Click on a year to set it as the current academic session
                        </p>
                    </div>

                    {/* Other Academic Settings */}
                    <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="sessionStart">Session Start Month</Label>
                            <Input
                                id="sessionStart"
                                value={settings.sessionStart}
                                onChange={handleChange}
                                placeholder="e.g., April"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feeDueDay">Fee Due Day (Monthly)</Label>
                            <Input
                                id="feeDueDay"
                                type="number"
                                value={settings.feeDueDay}
                                onChange={handleChange}
                                placeholder="Day of month"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lateFee">Late Fee Penalty (%)</Label>
                            <Input
                                id="lateFee"
                                type="number"
                                value={settings.lateFee}
                                onChange={handleChange}
                                placeholder="Percentage"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Notification Settings
                    </CardTitle>
                    <CardDescription>
                        Configure email and SMS notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input
                                id="adminEmail"
                                type="email"
                                value={settings.adminEmail}
                                onChange={handleChange}
                                placeholder="Enter admin email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">Support Email</Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                value={settings.supportEmail}
                                onChange={handleChange}
                                placeholder="Enter support email"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
