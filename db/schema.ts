import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    decimal,
    uuid,
    date,
    pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", [
    "super_admin",
    "admin",
    "office_staff",
    "teacher",
    "student",
]);

export const feeStatusEnum = pgEnum("fee_status", [
    "pending",
    "partial",
    "paid",
    "overdue",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
    "present",
    "absent",
    "late",
    "leave",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
    "new",
    "contacted",
    "scheduled",
    "enrolled",
    "declined",
]);

export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]);

// ============================================
// USERS TABLE - Staff accounts
// ============================================
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: roleEnum("role").notNull().default("teacher"),
    phone: text("phone"),
    avatar: text("avatar"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// STUDENTS TABLE
// ============================================
export const students = pgTable("students", {
    id: uuid("id").defaultRandom().primaryKey(),
    admissionNumber: text("admission_number").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    gender: genderEnum("gender").notNull(),
    bloodGroup: text("blood_group"),
    photo: text("photo"),
    // Contact
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    pincode: text("pincode"),
    // Academic
    className: text("class_name").notNull(),
    section: text("section").notNull(),
    rollNumber: integer("roll_number"),
    academicYear: text("academic_year").notNull(),
    admissionDate: date("admission_date").notNull(),
    // Guardian
    guardianName: text("guardian_name").notNull(),
    guardianRelation: text("guardian_relation").notNull(),
    guardianPhone: text("guardian_phone").notNull(),
    guardianEmail: text("guardian_email"),
    guardianOccupation: text("guardian_occupation"),
    // Status
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// FEE TYPES TABLE - Fee structure definitions
// ============================================
export const feeTypes = pgTable("fee_types", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    className: text("class_name"), // null means applicable to all
    academicYear: text("academic_year").notNull(),
    dueDay: integer("due_day").notNull().default(10), // Day of month
    isRecurring: boolean("is_recurring").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// FEES TABLE - Fee records
// ============================================
export const fees = pgTable("fees", {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
        .notNull()
        .references(() => students.id, { onDelete: "cascade" }),
    feeTypeId: uuid("fee_type_id")
        .notNull()
        .references(() => feeTypes.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
        .notNull()
        .default("0"),
    status: feeStatusEnum("status").notNull().default("pending"),
    dueDate: date("due_date").notNull(),
    paidDate: date("paid_date"),
    month: text("month").notNull(),
    academicYear: text("academic_year").notNull(),
    receiptNumber: text("receipt_number"),
    paymentMethod: text("payment_method"),
    notes: text("notes"),
    collectedBy: uuid("collected_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// ATTENDANCE TABLE
// ============================================
export const attendance = pgTable("attendance", {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
        .notNull()
        .references(() => students.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull(),
    remarks: text("remarks"),
    markedBy: uuid("marked_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// EXAMS TABLE
// ============================================
export const exams = pgTable("exams", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    className: text("class_name").notNull(),
    subject: text("subject").notNull(),
    date: date("date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    maxMarks: integer("max_marks").notNull(),
    passingMarks: integer("passing_marks").notNull(),
    academicYear: text("academic_year").notNull(),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// MARKS TABLE
// ============================================
export const marks = pgTable("marks", {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
        .notNull()
        .references(() => students.id, { onDelete: "cascade" }),
    examId: uuid("exam_id")
        .notNull()
        .references(() => exams.id, { onDelete: "cascade" }),
    marksObtained: integer("marks_obtained"),
    isAbsent: boolean("is_absent").notNull().default(false),
    remarks: text("remarks"),
    enteredBy: uuid("entered_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// INQUIRIES TABLE - Admission inquiries
// ============================================
export const inquiries = pgTable("inquiries", {
    id: uuid("id").defaultRandom().primaryKey(),
    studentName: text("student_name").notNull(),
    parentName: text("parent_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    classAppliedFor: text("class_applied_for").notNull(),
    previousSchool: text("previous_school"),
    status: inquiryStatusEnum("status").notNull().default("new"),
    notes: text("notes"),
    followUpDate: date("follow_up_date"),
    handledBy: uuid("handled_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// AUDIT LOGS TABLE
// ============================================
export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    action: text("action").notNull(), // CREATE, UPDATE, DELETE
    entityType: text("entity_type").notNull(), // student, fee, etc
    entityId: text("entity_id").notNull(),
    oldValue: text("old_value"), // JSON string
    newValue: text("new_value"), // JSON string
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// SETTINGS TABLE - Global configuration
// ============================================
export const settings = pgTable("settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// DOCUMENTS TABLE - File storage metadata
// ============================================
export const documents = pgTable("documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
        .notNull()
        .references(() => students.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // birth_certificate, transfer_certificate, etc
    url: text("url").notNull(),
    size: integer("size").notNull(),
    uploadedBy: uuid("uploaded_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type FeeType = typeof feeTypes.$inferSelect;
export type Fee = typeof fees.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type Mark = typeof marks.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Document = typeof documents.$inferSelect;
