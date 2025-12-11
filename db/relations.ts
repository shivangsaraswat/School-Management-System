import { relations } from "drizzle-orm";
import {
    users,
    students,
    feeTypes,
    fees,
    attendance,
    exams,
    marks,
    inquiries,
    auditLogs,
    documents,
} from "./schema";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
    feesCollected: many(fees),
    attendanceMarked: many(attendance),
    examsCreated: many(exams),
    marksEntered: many(marks),
    inquiriesHandled: many(inquiries),
    auditLogs: many(auditLogs),
    documentsUploaded: many(documents),
}));

// Student relations
export const studentsRelations = relations(students, ({ many }) => ({
    fees: many(fees),
    attendance: many(attendance),
    marks: many(marks),
    documents: many(documents),
}));

// Fee type relations
export const feeTypesRelations = relations(feeTypes, ({ many }) => ({
    fees: many(fees),
}));

// Fees relations
export const feesRelations = relations(fees, ({ one }) => ({
    student: one(students, {
        fields: [fees.studentId],
        references: [students.id],
    }),
    feeType: one(feeTypes, {
        fields: [fees.feeTypeId],
        references: [feeTypes.id],
    }),
    collectedBy: one(users, {
        fields: [fees.collectedBy],
        references: [users.id],
    }),
}));

// Attendance relations
export const attendanceRelations = relations(attendance, ({ one }) => ({
    student: one(students, {
        fields: [attendance.studentId],
        references: [students.id],
    }),
    markedBy: one(users, {
        fields: [attendance.markedBy],
        references: [users.id],
    }),
}));

// Exams relations
export const examsRelations = relations(exams, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [exams.createdBy],
        references: [users.id],
    }),
    marks: many(marks),
}));

// Marks relations
export const marksRelations = relations(marks, ({ one }) => ({
    student: one(students, {
        fields: [marks.studentId],
        references: [students.id],
    }),
    exam: one(exams, {
        fields: [marks.examId],
        references: [exams.id],
    }),
    enteredBy: one(users, {
        fields: [marks.enteredBy],
        references: [users.id],
    }),
}));

// Inquiries relations
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
    handledBy: one(users, {
        fields: [inquiries.handledBy],
        references: [users.id],
    }),
}));

// Audit logs relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));

// Documents relations
export const documentsRelations = relations(documents, ({ one }) => ({
    student: one(students, {
        fields: [documents.studentId],
        references: [students.id],
    }),
    uploadedBy: one(users, {
        fields: [documents.uploadedBy],
        references: [users.id],
    }),
}));
