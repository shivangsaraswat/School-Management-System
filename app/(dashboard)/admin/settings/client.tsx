"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Building2, Calendar, Mail, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setSetting } from "@/lib/actions/settings";

interface SettingsClientProps {
    initialSettings: Record<string, string>;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState({
        schoolName: initialSettings.school_name || "",
        shortName: initialSettings.school_short_name || "",
        address: initialSettings.school_address || "",
        phone: initialSettings.school_phone || "",
        academicYear: initialSettings.current_academic_year || "",
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

            {/* Academic Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Academic Settings
                    </CardTitle>
                    <CardDescription>
                        Configure academic year and session details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Current Academic Year</Label>
                            <Input
                                id="academicYear"
                                value={settings.academicYear}
                                onChange={handleChange}
                                placeholder="e.g., 2024-2025"
                            />
                        </div>
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
