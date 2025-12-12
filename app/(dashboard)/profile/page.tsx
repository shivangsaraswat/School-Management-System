import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/dal";
import { getUserById } from "@/lib/actions/users";
import ProfileClient from "./client";

export const metadata = {
    title: "My Profile | Ptbs School",
    description: "Manage your account settings and preferences",
};

export default async function ProfilePage() {
    const authUser = await requireAuth();

    // Fetch full user profile from database
    const userProfile = await getUserById(authUser.id);

    if (!userProfile) {
        redirect("/login");
    }

    return (
        <ProfileClient
            user={{
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone || "",
                role: userProfile.role,
                createdAt: userProfile.createdAt?.toISOString() || new Date().toISOString(),
            }}
        />
    );
}
