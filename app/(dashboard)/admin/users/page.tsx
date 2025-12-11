import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/dal";
import { canAccessSuperAdmin } from "@/lib/permissions";
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

    return <UserManagementClient />;
}
