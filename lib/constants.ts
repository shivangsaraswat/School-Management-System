// Role definitions
export const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    OFFICE_STAFF: "office_staff",
    TEACHER: "teacher",
    STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];


// Blood groups
export const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
] as const;

// Genders
export const GENDERS = ["Male", "Female", "Other"] as const;

// Class names
export const CLASSES = [
    "Nursery",
    "LKG",
    "UKG",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
] as const;

// Sections
export const SECTIONS = ["A", "B", "C", "D", "E"] as const;

// Fee status
export const FEE_STATUS = {
    PENDING: "pending",
    PARTIAL: "partial",
    PAID: "paid",
    OVERDUE: "overdue",
} as const;

// Attendance status
export const ATTENDANCE_STATUS = {
    PRESENT: "present",
    ABSENT: "absent",
    LATE: "late",
    LEAVE: "leave",
} as const;

// Academic session months
export const MONTHS = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
] as const;

// Inquiry status
export const INQUIRY_STATUS = {
    NEW: "new",
    CONTACTED: "contacted",
    SCHEDULED: "scheduled",
    ENROLLED: "enrolled",
    DECLINED: "declined",
} as const;
