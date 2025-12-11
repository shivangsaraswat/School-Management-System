"use client";

import { useState } from "react";
import {
    Users,
    UserPlus,
    Search,
    MoreHorizontal,
    Shield,
    Mail,
    CheckCircle2,
    XCircle,
    Copy
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLES } from "@/lib/constants";

// Mock initial data
const INITIAL_USERS = [
    { id: 1, name: "Admin User", email: "admin@school.com", role: ROLES.SUPER_ADMIN, status: "Active", lastActive: "2 mins ago" },
    { id: 2, name: "John Principal", email: "principal@school.com", role: ROLES.ADMIN, status: "Active", lastActive: "1 hour ago" },
    { id: 3, name: "Sarah Office", email: "office@school.com", role: ROLES.OFFICE_STAFF, status: "Active", lastActive: "3 hours ago" },
    { id: 4, name: "Michael Teacher", email: "michael@school.com", role: ROLES.TEACHER, status: "Active", lastActive: "Yesterday" },
];

export default function UserManagementClient() {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: ROLES.TEACHER,
    });

    // New user credentials state (for displaying after creation)
    const [newUserCredentials, setNewUserCredentials] = useState<{ password: string, email: string } | null>(null);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate API call
        const tempPassword = generatePassword();
        const newUser = {
            id: users.length + 1,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: "Active",
            lastActive: "Just now"
        };

        setUsers([newUser, ...users]);
        setNewUserCredentials({ email: formData.email, password: tempPassword });
        setIsSheetOpen(false);

        // Reset form
        setFormData({ name: "", email: "", role: ROLES.TEACHER });

        toast.success("User created successfully");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
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
                                <Label htmlFor="role">Role</Label>
                                <div className="relative">
                                    <select
                                        id="role"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    >
                                        <option value={ROLES.TEACHER}>Teacher</option>
                                        <option value={ROLES.OFFICE_STAFF}>Office Staff</option>
                                        <option value={ROLES.ADMIN}>Admin</option>
                                        <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                                    </select>
                                    <div className="absolute right-3 top-2.5 pointer-events-none text-muted-foreground">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
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
                                <Button type="submit">Create Account</Button>
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
                        <p className="text-xs text-muted-foreground">Active accounts in system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN).length}
                        </div>
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
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`/avatars/${user.id}.png`} />
                                                        <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                                                    ${user.role === ROLES.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                                                        user.role === ROLES.ADMIN ? 'bg-blue-100 text-blue-800' :
                                                            user.role === ROLES.TEACHER ? 'bg-emerald-100 text-emerald-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                    {user.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                    {user.status}
                                                </span>
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
                                                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            Deactivate User
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
        </div>
    );
}
