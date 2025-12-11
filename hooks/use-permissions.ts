"use client";

import { useCurrentUser } from "./use-current-user";
import { hasPermission, hasAnyPermission, type Permission } from "@/lib/permissions";

export function usePermissions() {
    const { user, isLoading } = useCurrentUser();

    const can = (permission: Permission): boolean => {
        if (!user) return false;
        return hasPermission(user.role, permission);
    };

    const canAny = (permissions: Permission[]): boolean => {
        if (!user) return false;
        return hasAnyPermission(user.role, permissions);
    };

    return {
        can,
        canAny,
        isLoading,
        role: user?.role || null,
    };
}
