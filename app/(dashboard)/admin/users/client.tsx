"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    UserPlus,
    Search,
    MoreHorizontal,
    Shield,
    Mail,
    CheckCircle2,
    XCircle,
    Copy,
    Pencil,
    Phone,
    User as UserIcon,
    Trash2,
    AlertTriangle,
    RefreshCw,
    UserX
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLES } from "@/lib/constants";
import { createUser, deleteUser, updateUser, permanentlyDeleteUser, reactivateUser } from "@/lib/actions/users";

type RoleType = "super_admin" | "admin" | "office_staff" | "teacher" | "student";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    isActive: boolean;
    lastActive: string;
    phone?: string | null;
}

interface UserManagementClientProps {
    initialUsers: User[];
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state for creating new user
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: ROLES.TEACHER,
        phone: "",
    });

    // Edit profile state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        role: "",
        phone: "",
    });
    const [isEditLoading, setIsEditLoading] = useState(false);

    // View profile state
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    // New user credentials state (for displaying after creation)
    const [newUserCredentials, setNewUserCredentials] = useState<{ password: string, email: string } | null>(null);

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().replace('_', ' ').includes(query) ||
            user.status.toLowerCase().includes(query) ||
            (user.phone && user.phone.includes(query))
        );
    });

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const tempPassword = generatePassword();

            const result = await createUser({
                name: formData.name,
                email: formData.email,
                password: tempPassword,
                role: formData.role as RoleType,
                phone: formData.phone || undefined,
            });

            if (result.success && result.user) {
                setNewUserCredentials({ email: formData.email, password: tempPassword });
                setIsSheetOpen(false);

                // Reset form
                setFormData({ name: "", email: "", role: ROLES.TEACHER, phone: "" });

                // Refresh the page to get updated data
                router.refresh();

                toast.success("User created successfully");
            } else {
                toast.error(result.error || "Failed to create user");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error("An error occurred while creating the user");
        } finally {
            setIsLoading(false);
        }
    };

    // Deactivate confirmation state
    const [deactivateConfirmUser, setDeactivateConfirmUser] = useState<User | null>(null);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const openDeactivateConfirmation = (user: User) => {
        setDeactivateConfirmUser(user);
        setIsDeactivateDialogOpen(true);
    };

    const handleDeactivateUser = async () => {
        if (!deactivateConfirmUser) return;

        setIsDeactivating(true);
        try {
            const result = await deleteUser(deactivateConfirmUser.id);
            if (result.success) {
                // Update local state immediately for instant UI feedback
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.id === deactivateConfirmUser.id
                            ? { ...u, isActive: false, status: 'Deactivated' }
                            : u
                    )
                );
                toast.success("User deactivated successfully");
                setIsDeactivateDialogOpen(false);
                setDeactivateConfirmUser(null);
                router.refresh();
            }
        } catch {
            toast.error("Failed to deactivate user");
        } finally {
            setIsDeactivating(false);
        }
    };

    // Reactivate state
    const [reactivateConfirmUser, setReactivateConfirmUser] = useState<User | null>(null);
    const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);

    const openReactivateConfirmation = (user: User) => {
        setReactivateConfirmUser(user);
        setIsReactivateDialogOpen(true);
    };

    const handleReactivateUser = async () => {
        if (!reactivateConfirmUser) return;

        setIsReactivating(true);
        try {
            const result = await reactivateUser(reactivateConfirmUser.id);
            if (result.success) {
                // Update local state immediately for instant UI feedback
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.id === reactivateConfirmUser.id
                            ? { ...u, isActive: true, status: 'Active' }
                            : u
                    )
                );
                toast.success("User reactivated successfully");
                setIsReactivateDialogOpen(false);
                setReactivateConfirmUser(null);
                router.refresh();
            }
        } catch {
            toast.error("Failed to reactivate user");
        } finally {
            setIsReactivating(false);
        }
    };

    // Delete confirmation state
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handlePermanentDelete = async () => {
        if (!deleteConfirmUser) return;

        setIsDeleting(true);
        try {
            const result = await permanentlyDeleteUser(deleteConfirmUser.id);
            if (result.success) {
                // Update local state immediately for instant UI feedback
                setUsers(prevUsers => prevUsers.filter(u => u.id !== deleteConfirmUser.id));
                toast.success("User permanently deleted");
                setIsDeleteDialogOpen(false);
                setDeleteConfirmUser(null);
                router.refresh();
            }
        } catch {
            toast.error("Failed to delete user");
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteConfirmation = (user: User) => {
        setDeleteConfirmUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsEditLoading(true);

        try {
            const result = await updateUser(editingUser.id, {
                name: editFormData.name,
                email: editFormData.email,
                role: editFormData.role as RoleType,
                phone: editFormData.phone || undefined,
            });

            if (result.success) {
                setIsEditDialogOpen(false);
                setEditingUser(null);
                router.refresh();
                toast.success("User updated successfully");
            } else {
                toast.error("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("An error occurred while updating the user");
        } finally {
            setIsEditLoading(false);
        }
    };

    const handleViewProfile = (user: User) => {
        setViewingUser(user);
        setIsViewDialogOpen(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const adminCount = users.filter(u => u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN).length;
    const activeCount = users.filter(u => u.isActive).length;
    const deactivatedCount = users.filter(u => !u.isActive).length;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case ROLES.SUPER_ADMIN:
                return 'bg-purple-100 text-purple-800';
            case ROLES.ADMIN:
                return 'bg-blue-100 text-blue-800';
            case ROLES.TEACHER:
                return 'bg-emerald-100 text-emerald-800';
            case ROLES.OFFICE_STAFF:
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 pt-5 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Accounts</h1>
                    <p className="text-muted-foreground">
                        Manage system access and roles for staff members.
                    </p>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Create User
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Create New User</SheetTitle>
                            <SheetDescription>
                                Add a new user to the system. They will receive a temporary password.
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={handleCreateUser} className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    required
                                    placeholder="e.g. Jane Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="e.g. jane@school.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="e.g. +91 9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value as typeof ROLES.TEACHER })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ROLES.TEACHER}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                                Teacher
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={ROLES.OFFICE_STAFF}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                                Office Staff
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={ROLES.ADMIN}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                Admin
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={ROLES.SUPER_ADMIN}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                                Super Admin
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Assigning the correct role ensures proper access control.
                                </p>
                            </div>

                            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                                <div className="flex gap-2">
                                    <Shield className="h-5 w-5 shrink-0 text-blue-600" />
                                    <div className="space-y-1">
                                        <p className="font-medium">Security Note</p>
                                        <p>A temporary password will be generated automatically. The user will be required to change it upon first login.</p>
                                    </div>
                                </div>
                            </div>

                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </SheetClose>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Creating..." : "Create Account"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Success Credential Display */}
            {newUserCredentials && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-emerald-900">User Successfully Created!</h3>
                                <p className="text-sm text-emerald-800 mt-1">
                                    Please share these credentials with the user immediately.
                                    For security, this password will not be shown again.
                                </p>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 border border-emerald-200 shadow-sm">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm font-medium">{newUserCredentials.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 border border-emerald-200 shadow-sm">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Password:</span>
                                        <span className="text-sm font-mono font-bold">{newUserCredentials.password}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-1 hover:bg-emerald-50"
                                            onClick={() => copyToClipboard(newUserCredentials.password)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
                            onClick={() => setNewUserCredentials(null)}
                        >
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Accounts in system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
                        <UserX className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-500">{deactivatedCount}</div>
                        <p className="text-xs text-muted-foreground">Temporarily disabled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminCount}</div>
                        <p className="text-xs text-muted-foreground">With advanced permissions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                A list of all users having access to the dashboard.
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Last Active</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/5">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className={`h-8 w-8 ${!user.isActive ? 'opacity-60' : ''}`}>
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                                        <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                    </Avatar>
                                                    <div className={!user.isActive ? 'opacity-70' : ''}>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRoleBadgeColor(user.role)} ${!user.isActive ? 'opacity-60' : ''}`}>
                                                    {user.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                                                        Deactivated
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.lastActive}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                                                            <UserIcon className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {user.isActive ? (
                                                            <DropdownMenuItem
                                                                className="text-amber-600"
                                                                onClick={() => openDeactivateConfirmation(user)}
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Deactivate User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                className="text-green-600"
                                                                onClick={() => openReactivateConfirmation(user)}
                                                            >
                                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                                Reactivate User
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => openDeleteConfirmation(user)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Permanently
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5" />
                            Edit User Profile
                        </DialogTitle>
                        <DialogDescription>
                            Make changes to the user&apos;s profile. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone">Phone Number</Label>
                                <Input
                                    id="edit-phone"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editFormData.role}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ROLES.TEACHER}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                                Teacher
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={ROLES.OFFICE_STAFF}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                                Office Staff
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={ROLES.ADMIN}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                Admin
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={ROLES.SUPER_ADMIN}>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                                Super Admin
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isEditLoading}>
                                {isEditLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Profile Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-[90vw] sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <UserIcon className="h-4 w-4" />
                            User Profile
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            View detailed information about this user.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingUser && (
                        <div className="py-2 sm:py-4">
                            <div className="flex items-center justify-center mb-4 sm:mb-6">
                                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${viewingUser.name}`} />
                                    <AvatarFallback className="text-xl sm:text-2xl">{viewingUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="text-center mb-4 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-semibold">{viewingUser.name}</h3>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize mt-1.5 ${getRoleBadgeColor(viewingUser.role)}`}>
                                    {viewingUser.role.replace("_", " ")}
                                </span>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Email</p>
                                        <p className="text-xs sm:text-sm font-medium truncate">{viewingUser.email}</p>
                                    </div>
                                </div>
                                {viewingUser.phone && (
                                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Phone</p>
                                            <p className="text-xs sm:text-sm font-medium">{viewingUser.phone}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-muted/50">
                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Status</p>
                                            <p className="text-xs sm:text-sm font-medium flex items-center gap-1">
                                                <span className={`h-1.5 w-1.5 rounded-full ${viewingUser.isActive ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                                                <span className="truncate">{viewingUser.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-muted/50">
                                        <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Last Active</p>
                                            <p className="text-xs sm:text-sm font-medium truncate">{viewingUser.lastActive}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setIsViewDialogOpen(false)}>
                            Close
                        </Button>
                        {viewingUser && (
                            <Button size="sm" className="w-full sm:w-auto" onClick={() => {
                                setIsViewDialogOpen(false);
                                handleEditUser(viewingUser);
                            }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit Profile
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Permanently Delete User
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the user account and remove all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteConfirmUser && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${deleteConfirmUser.name}`} />
                                    <AvatarFallback>{deleteConfirmUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{deleteConfirmUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{deleteConfirmUser.email}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Are you sure you want to permanently delete this user? They will not be able to log in and all their data will be removed.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handlePermanentDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deactivate Confirmation Dialog */}
            <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <UserX className="h-5 w-5" />
                            Deactivate User
                        </DialogTitle>
                        <DialogDescription>
                            This will temporarily disable the user&apos;s access. You can reactivate them later.
                        </DialogDescription>
                    </DialogHeader>
                    {deactivateConfirmUser && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${deactivateConfirmUser.name}`} />
                                    <AvatarFallback>{deactivateConfirmUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{deactivateConfirmUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{deactivateConfirmUser.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                                <p className="font-medium text-amber-700 mb-1">What happens when you deactivate?</p>
                                <ul className="text-muted-foreground space-y-1 text-xs">
                                    <li>• User cannot log in to the dashboard</li>
                                    <li>• Their data is preserved in the system</li>
                                    <li>• You can reactivate them at any time</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={handleDeactivateUser}
                            disabled={isDeactivating}
                        >
                            {isDeactivating ? "Deactivating..." : "Deactivate User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reactivate Confirmation Dialog */}
            <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <RefreshCw className="h-5 w-5" />
                            Reactivate User
                        </DialogTitle>
                        <DialogDescription>
                            This will restore the user&apos;s access to the system.
                        </DialogDescription>
                    </DialogHeader>
                    {reactivateConfirmUser && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reactivateConfirmUser.name}`} />
                                    <AvatarFallback>{reactivateConfirmUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{reactivateConfirmUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{reactivateConfirmUser.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                                <p className="font-medium text-green-700 mb-1">What happens when you reactivate?</p>
                                <ul className="text-muted-foreground space-y-1 text-xs">
                                    <li>• User can log in to the dashboard again</li>
                                    <li>• All their previous data is restored</li>
                                    <li>• Their permissions remain unchanged</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReactivateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={handleReactivateUser}
                            disabled={isReactivating}
                        >
                            {isReactivating ? "Reactivating..." : "Reactivate User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
