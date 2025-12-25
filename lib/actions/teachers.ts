"use server";

import { db } from "@/db";
import {
    teachers,
    teacherDocuments,
    teacherClassAssignments,
    users,
} from "@/db/schema";
import { eq, and, ilike, or, count, desc, asc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOperations } from "@/lib/dal";
import { createAuditLog } from "@/lib/internal/audit";
import type {
    Teacher,
    NewTeacher,
    TeacherDocument,
    TeacherClassAssignment,
} from "@/db/schema";

// ============================================
// GENERATE EMPLOYEE ID
// ============================================
function generateEmployeeId(): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TCH${year}${random}`;
}

// ============================================
// GET TEACHERS (standalone records)
// ============================================
export async function getTeachers(options?: {
    search?: string;
    limit?: number;
    offset?: number;
    isActive?: boolean;
}) {
    await requireOperations();

    const { search, limit = 50, offset = 0, isActive } = options || {};

    const conditions = [];

    if (search) {
        conditions.push(
            or(
                ilike(teachers.firstName, `%${search}%`),
                ilike(teachers.lastName, `%${search}%`),
                ilike(teachers.email, `%${search}%`),
                ilike(teachers.employeeId, `%${search}%`)
            )
        );
    }

    if (isActive !== undefined) {
        conditions.push(eq(teachers.isActive, isActive));
    }

    const result = await db
        .select()
        .from(teachers)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(teachers.firstName), asc(teachers.lastName))
        .limit(limit)
        .offset(offset);

    return result;
}

// ============================================
// GET TEACHER BY ID
// ============================================
export async function getTeacherById(teacherId: string) {
    await requireOperations();

    // Get teacher record
    const teacherResult = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, teacherId))
        .limit(1);

    const teacher = teacherResult[0];
    if (!teacher) return null;

    // Get linked user info if exists
    let linkedUser = null;
    if (teacher.userId) {
        const userResult = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                avatar: users.avatar,
            })
            .from(users)
            .where(eq(users.id, teacher.userId))
            .limit(1);
        linkedUser = userResult[0] || null;
    }

    // Get class assignments
    const classAssignments = await db
        .select()
        .from(teacherClassAssignments)
        .where(eq(teacherClassAssignments.teacherId, teacherId))
        .orderBy(asc(teacherClassAssignments.className));

    // Get documents
    const documents = await db
        .select()
        .from(teacherDocuments)
        .where(eq(teacherDocuments.teacherId, teacherId))
        .orderBy(desc(teacherDocuments.createdAt));

    return {
        teacher,
        linkedUser,
        classAssignments,
        documents,
    };
}

// ============================================
// CREATE TEACHER (standalone record)
// ============================================
export async function createTeacher(
    data: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: "Male" | "Female" | "Other";
        bloodGroup?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        qualifications?: string;
        specialization?: string;
        experience?: number;
        joiningDate?: string;
        emergencyContact?: string;
        emergencyPhone?: string;
    }
) {
    const currentUser = await requireOperations();

    const employeeId = generateEmployeeId();

    const result = await db
        .insert(teachers)
        .values({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || null,
            phone: data.phone || null,
            employeeId,
            dateOfBirth: data.dateOfBirth || null,
            gender: data.gender || null,
            bloodGroup: data.bloodGroup || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            pincode: data.pincode || null,
            qualifications: data.qualifications || null,
            specialization: data.specialization || null,
            experience: data.experience || null,
            joiningDate: data.joiningDate || null,
            emergencyContact: data.emergencyContact || null,
            emergencyPhone: data.emergencyPhone || null,
        })
        .returning();

    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "teacher",
        entityId: result[0].id,
        description: `Created teacher: ${data.firstName} ${data.lastName} (${employeeId})`,
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true, teacher: result[0] };
}

// ============================================
// UPDATE TEACHER
// ============================================
export async function updateTeacher(
    teacherId: string,
    data: Partial<Omit<Teacher, "id" | "userId" | "employeeId" | "createdAt">>
) {
    const currentUser = await requireOperations();

    const existing = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, teacherId))
        .limit(1);

    if (existing.length === 0) {
        return { success: false, error: "Teacher not found" };
    }

    const result = await db
        .update(teachers)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(teachers.id, teacherId))
        .returning();

    await createAuditLog({
        userId: currentUser.id,
        action: "UPDATE",
        entityType: "teacher",
        entityId: teacherId,
        description: `Updated teacher: ${result[0].firstName} ${result[0].lastName}`,
        oldValue: JSON.stringify(existing[0]),
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true, teacher: result[0] };
}

// ============================================
// DELETE TEACHER
// ============================================
export async function deleteTeacher(teacherId: string) {
    const currentUser = await requireOperations();

    const existing = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, teacherId))
        .limit(1);

    if (existing.length === 0) {
        return { success: false, error: "Teacher not found" };
    }

    await db.delete(teachers).where(eq(teachers.id, teacherId));

    await createAuditLog({
        userId: currentUser.id,
        action: "DELETE",
        entityType: "teacher",
        entityId: teacherId,
        description: `Deleted teacher: ${existing[0].firstName} ${existing[0].lastName}`,
        oldValue: JSON.stringify(existing[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true };
}

// ============================================
// GET TEACHERS COUNT
// ============================================
export async function getTeachersCount() {
    await requireOperations();

    const total = await db
        .select({ count: count() })
        .from(teachers);

    const active = await db
        .select({ count: count() })
        .from(teachers)
        .where(eq(teachers.isActive, true));

    return {
        total: total[0]?.count || 0,
        active: active[0]?.count || 0,
    };
}

// ============================================
// ASSIGN CLASS TO TEACHER
// ============================================
export async function assignClassToTeacher(
    teacherId: string,
    data: {
        className: string;
        section: string;
        subject?: string;
        isClassTeacher?: boolean;
        academicYear: string;
    }
) {
    const currentUser = await requireOperations();

    // Check if assignment already exists
    const existing = await db
        .select()
        .from(teacherClassAssignments)
        .where(
            and(
                eq(teacherClassAssignments.teacherId, teacherId),
                eq(teacherClassAssignments.className, data.className),
                eq(teacherClassAssignments.section, data.section),
                eq(teacherClassAssignments.academicYear, data.academicYear),
                data.subject
                    ? eq(teacherClassAssignments.subject, data.subject)
                    : undefined
            )
        )
        .limit(1);

    if (existing.length > 0) {
        return { success: false, error: "This class is already assigned" };
    }

    const result = await db
        .insert(teacherClassAssignments)
        .values({
            teacherId,
            className: data.className,
            section: data.section,
            subject: data.subject || null,
            isClassTeacher: data.isClassTeacher || false,
            academicYear: data.academicYear,
        })
        .returning();

    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "teacher_class_assignment",
        entityId: result[0].id,
        description: `Assigned ${data.className}-${data.section} to teacher`,
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true, assignment: result[0] };
}

// ============================================
// REMOVE CLASS FROM TEACHER
// ============================================
export async function removeClassFromTeacher(assignmentId: string) {
    const currentUser = await requireOperations();

    const existing = await db
        .select()
        .from(teacherClassAssignments)
        .where(eq(teacherClassAssignments.id, assignmentId))
        .limit(1);

    if (existing.length === 0) {
        return { success: false, error: "Assignment not found" };
    }

    await db
        .delete(teacherClassAssignments)
        .where(eq(teacherClassAssignments.id, assignmentId));

    await createAuditLog({
        userId: currentUser.id,
        action: "DELETE",
        entityType: "teacher_class_assignment",
        entityId: assignmentId,
        description: `Removed class assignment`,
        oldValue: JSON.stringify(existing[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true };
}

// ============================================
// GET TEACHER CLASSES
// ============================================
export async function getTeacherClasses(teacherId: string) {
    await requireOperations();

    return await db
        .select()
        .from(teacherClassAssignments)
        .where(eq(teacherClassAssignments.teacherId, teacherId))
        .orderBy(asc(teacherClassAssignments.className));
}

// ============================================
// UPLOAD TEACHER DOCUMENT
// ============================================
export async function uploadTeacherDocument(
    teacherId: string,
    data: {
        name: string;
        type: string;
        url: string;
        size: number;
    }
) {
    const currentUser = await requireOperations();

    const result = await db
        .insert(teacherDocuments)
        .values({
            teacherId,
            name: data.name,
            type: data.type,
            url: data.url,
            size: data.size,
            uploadedBy: currentUser.id,
        })
        .returning();

    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "teacher_document",
        entityId: result[0].id,
        description: `Uploaded document: ${data.name}`,
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true, document: result[0] };
}

// ============================================
// DELETE TEACHER DOCUMENT
// ============================================
export async function deleteTeacherDocument(documentId: string) {
    const currentUser = await requireOperations();

    const existing = await db
        .select()
        .from(teacherDocuments)
        .where(eq(teacherDocuments.id, documentId))
        .limit(1);

    if (existing.length === 0) {
        return { success: false, error: "Document not found" };
    }

    await db.delete(teacherDocuments).where(eq(teacherDocuments.id, documentId));

    await createAuditLog({
        userId: currentUser.id,
        action: "DELETE",
        entityType: "teacher_document",
        entityId: documentId,
        description: `Deleted document: ${existing[0].name}`,
        oldValue: JSON.stringify(existing[0]),
    });

    revalidatePath("/operations/teachers");

    return { success: true };
}

// ============================================
// GET TEACHER DOCUMENTS
// ============================================
export async function getTeacherDocuments(teacherId: string) {
    await requireOperations();

    return await db
        .select()
        .from(teacherDocuments)
        .where(eq(teacherDocuments.teacherId, teacherId))
        .orderBy(desc(teacherDocuments.createdAt));
}

// ============================================
// GET TEACHERS WITHOUT USER ACCOUNT (for linking in Admin)
// ============================================
export async function getTeachersWithoutUserAccount() {
    await requireOperations();

    return await db
        .select({
            id: teachers.id,
            firstName: teachers.firstName,
            lastName: teachers.lastName,
            email: teachers.email,
            employeeId: teachers.employeeId,
        })
        .from(teachers)
        .where(isNull(teachers.userId))
        .orderBy(asc(teachers.firstName));
}

// ============================================
// LINK USER ACCOUNT TO TEACHER
// ============================================
export async function linkUserToTeacher(teacherId: string, userId: string) {
    const currentUser = await requireOperations();

    // Check if user is already linked to another teacher
    const existingLink = await db
        .select()
        .from(teachers)
        .where(eq(teachers.userId, userId))
        .limit(1);

    if (existingLink.length > 0) {
        return { success: false, error: "User is already linked to another teacher" };
    }

    const result = await db
        .update(teachers)
        .set({ userId, updatedAt: new Date() })
        .where(eq(teachers.id, teacherId))
        .returning();

    if (result.length === 0) {
        return { success: false, error: "Teacher not found" };
    }

    await createAuditLog({
        userId: currentUser.id,
        action: "UPDATE",
        entityType: "teacher",
        entityId: teacherId,
        description: `Linked user account to teacher: ${result[0].firstName} ${result[0].lastName}`,
        newValue: JSON.stringify({ userId }),
    });

    revalidatePath("/operations/teachers");
    revalidatePath("/admin/users");

    return { success: true, teacher: result[0] };
}
