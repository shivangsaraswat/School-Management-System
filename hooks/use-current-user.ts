"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/lib/constants";

interface CurrentUser {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export function useCurrentUser(): {
    user: CurrentUser | null;
    isLoading: boolean;
} {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return { user: null, isLoading: true };
    }

    if (!session?.user) {
        return { user: null, isLoading: false };
    }

    return {
        user: {
            id: session.user.id,
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role,
        },
        isLoading: false,
    };
}
