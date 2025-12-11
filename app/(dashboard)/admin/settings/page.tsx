"use client";

import { Settings, Save, Building2, Calendar, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8 text-primary" />
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
                                defaultValue="Delhi Public School"
                                placeholder="Enter school name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortName">Short Name / Code</Label>
                            <Input
                                id="shortName"
                                defaultValue="DPS"
                                placeholder="Enter short code"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                defaultValue="123 Education Lane, New Delhi"
                                placeholder="Enter address"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Contact Number</Label>
                            <Input
                                id="phone"
                                defaultValue="+91 11 1234 5678"
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
                                defaultValue="2024-2025"
                                placeholder="e.g., 2024-2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sessionStart">Session Start Month</Label>
                            <Input
                                id="sessionStart"
                                defaultValue="April"
                                placeholder="e.g., April"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feeDueDay">Fee Due Day (Monthly)</Label>
                            <Input
                                id="feeDueDay"
                                type="number"
                                defaultValue="10"
                                placeholder="Day of month"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lateFee">Late Fee Penalty (%)</Label>
                            <Input
                                id="lateFee"
                                type="number"
                                defaultValue="5"
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
                                defaultValue="admin@school.com"
                                placeholder="Enter admin email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">Support Email</Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                defaultValue="support@school.com"
                                placeholder="Enter support email"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
