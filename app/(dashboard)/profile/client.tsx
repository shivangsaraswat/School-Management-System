"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Save, Camera, Mail, Phone, Shield, Calendar, Eye, EyeOff, CheckCircle2, X, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateOwnProfile, changePassword } from "@/lib/actions/users";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
}

interface ProfileClientProps {
    user: UserProfile;
}

export default function ProfileClient({ user }: ProfileClientProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile form state
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Format role for display
    const formatRole = (role: string) => {
        return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // Format join date
    const formatJoinDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // Handle profile update
    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateOwnProfile(user.id, {
                name: name.trim(),
                phone: phone.trim() || undefined,
            });

            if (result.success) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setName(user.name);
        setPhone(user.phone);
        setIsEditing(false);
    };

    // Handle password change
    const handleChangePassword = async () => {
        if (!currentPassword) {
            toast.error("Current password is required");
            return;
        }
        if (!newPassword) {
            toast.error("New password is required");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            const result = await changePassword(user.id, currentPassword, newPassword);

            if (result.success) {
                toast.success("Password changed successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(result.error || "Failed to change password");
            }
        } catch {
            toast.error("Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "super_admin":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "admin":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "office_staff":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "teacher":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Header with Actions */}
            <HeaderUpdater
                title="My Profile"
                description="Manage your account settings and preferences"
            >
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                            >
                                <X className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Cancel</span>
                            </Button>
                            <Button size="sm" className="h-9" onClick={handleSaveProfile} disabled={isSaving}>
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Save Changes</span>
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" className="h-9" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Edit Profile</span>
                        </Button>
                    )}
                </div>
            </HeaderUpdater>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                                disabled
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                        <div>
                            <CardTitle className="text-xl">{user.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                    <Shield className="h-3 w-3" />
                                    {formatRole(user.role)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Member since {formatJoinDate(user.createdAt)}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditing}
                                className={isEditing ? "border-primary/50" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Email Address
                                <span className="text-xs text-muted-foreground">(cannot be changed)</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                disabled={!isEditing}
                                className={isEditing ? "border-primary/50" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                Role
                                <span className="text-xs text-muted-foreground">(set by admin)</span>
                            </Label>
                            <Input
                                id="role"
                                value={formatRole(user.role)}
                                disabled
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {newPassword && newPassword.length < 6 && (
                                <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                            {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Passwords match
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                        >
                            {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
