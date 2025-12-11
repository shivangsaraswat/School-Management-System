import { ROLES, type Role } from "./constants";

// ============================================
// PERMISSION TYPES
// ============================================
type Permission =
    // Super Admin Only
    | "view_revenue"
    | "view_audit_logs"
    | "manage_settings"
    | "manage_staff_permissions"
    // Office Staff Operations (controlled by Super Admin)
    | "view_students"
    | "manage_students"
    | "manage_admissions"
    | "manage_fees"
    | "collect_fees"
    // Teacher Operations
    | "view_own_class_students"
    | "manage_attendance"
    | "enter_marks"
    | "view_own_classes"
    // Student Operations
    | "view_own_results";

// ============================================
// ROLE PERMISSION MATRIX
// ============================================
const rolePermissions: Record<Role, Permission[]> = {
    // Super Admin - Full access to EVERYTHING
    [ROLES.SUPER_ADMIN]: [
        "view_revenue",
        "view_audit_logs",
        "manage_settings",
        "manage_staff_permissions",
        "view_students",
        "manage_students",
        "manage_admissions",
        "manage_fees",
        "collect_fees",
        "view_own_class_students",
        "manage_attendance",
        "enter_marks",
        "view_own_classes",
        "view_own_results",
    ],
    // Admin - Same as Super Admin but might be restricted later
    [ROLES.ADMIN]: [
        "view_revenue",
        "view_audit_logs",
        "manage_settings",
        "view_students",
        "manage_students",
        "manage_admissions",
        "manage_fees",
        "collect_fees",
        "manage_attendance",
        "enter_marks",
        "view_own_classes",
    ],
    // Office Staff - Operations only, NO revenue access
    [ROLES.OFFICE_STAFF]: [
        "view_students",
        "manage_students",
        "manage_admissions",
        "manage_fees",
        "collect_fees",
    ],
    // Teacher - Only their class students
    [ROLES.TEACHER]: [
        "view_own_class_students",
        "manage_attendance",
        "enter_marks",
        "view_own_classes",
    ],
    // Student - Only their own results
    [ROLES.STUDENT]: [
        "view_own_results",
    ],
};

// ============================================
// PERMISSION CHECK FUNCTIONS
// ============================================
export function hasPermission(role: Role, permission: Permission): boolean {
    return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

// ============================================
// ROUTE ACCESS CHECKERS
// ============================================

// Super Admin only routes (Revenue, Audit Logs, Settings, Staff Management)
export function canAccessSuperAdmin(role: Role): boolean {
    return role === ROLES.SUPER_ADMIN;
}

// Admin routes (includes Super Admin)
export function canAccessAdmin(role: Role): boolean {
    return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

// Office/Operations routes - Super Admin, Admin, Office Staff
export function canAccessOperations(role: Role): boolean {
    return ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OFFICE_STAFF] as Role[]).includes(role);
}

// Academic routes - Super Admin, Admin, Teacher
export function canAccessAcademics(role: Role): boolean {
    return ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER] as Role[]).includes(role);
}

// Student routes - Students only
export function canAccessStudentPortal(role: Role): boolean {
    return role === ROLES.STUDENT;
}

// Revenue access - Super Admin only (Office Staff CANNOT see this)
export function canViewRevenue(role: Role): boolean {
    return role === ROLES.SUPER_ADMIN;
}

// ============================================
// FEATURE FLAGS (Can be controlled by Super Admin later)
// ============================================
export interface OfficeStaffPermissions {
    canViewFeeReports: boolean;
    canExportData: boolean;
    canDeleteRecords: boolean;
    canSendNotifications: boolean;
}

// Default permissions for office staff (Super Admin can modify these)
export const defaultOfficeStaffPermissions: OfficeStaffPermissions = {
    canViewFeeReports: true,
    canExportData: false,
    canDeleteRecords: false,
    canSendNotifications: false,
};

export type { Permission };
