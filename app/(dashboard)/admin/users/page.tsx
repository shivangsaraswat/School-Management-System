import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/dal";
import { canAccessSuperAdmin } from "@/lib/permissions";
import { getUsers } from "@/lib/actions/users";
import UserManagementClient from "./client";

export const metadata = {
    title: "User Management | Ptbs School",
    description: "Manage system users and access controls",
};

export default async function UserManagementPage() {
    const user = await requireAuth();

    if (!canAccessSuperAdmin(user.role)) {
        redirect("/");
    }

    // Fetch ALL users from database (including inactive)
    const users = await getUsers({ limit: 100, includeAll: true });

    // Transform to the format expected by the client
    const transformedUsers = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.isActive ? "Active" : "Deactivated",
        isActive: u.isActive,
        lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "Never",
        phone: u.phone,
    }));

    return <UserManagementClient initialUsers={transformedUsers} />;
}
