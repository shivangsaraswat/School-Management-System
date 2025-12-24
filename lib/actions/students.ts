"use server";

import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, like, ilike, or, count, sql, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireOperations } from "@/lib/dal";
import { createAuditLog } from "@/lib/internal/audit";
import { autoCreateFeeAccountForStudent } from "./fee-accounts";
import type { NewStudent } from "@/db/schema";

// ============================================
// GET STUDENTS
// ============================================
export async function getStudents(options?: {
    className?: string;
    section?: string;
    academicYear?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    const {
        className,
        section,
        academicYear,
        search,
        limit = 50,
        offset = 0,
    } = options || {};

    await requireAuth();

    const conditions = [];

    if (className) {
        conditions.push(eq(students.className, className));
    }
    if (section) {
        conditions.push(eq(students.section, section));
    }
    if (academicYear) {
        conditions.push(eq(students.academicYear, academicYear));
    }
    if (search) {
        conditions.push(
            or(
                ilike(students.firstName, `%${search}%`),
                ilike(students.lastName, `%${search}%`),
                ilike(students.admissionNumber, `%${search}%`)
            )
        );
    }

    conditions.push(eq(students.isActive, true));

    const result = await db
        .select()
        .from(students)
        .where(and(...conditions))
        .orderBy(asc(students.rollNumber), asc(students.firstName))
        .limit(limit)
        .offset(offset);

    return result;
}

// ============================================
// GET STUDENT BY ID
// ============================================
export async function getStudentById(id: string) {
    await requireAuth();
    const result = await db
        .select()
        .from(students)
        .where(eq(students.id, id))
        .limit(1);

    return result[0] || null;
}

// ============================================
// GET STUDENT BY ADMISSION NUMBER
// ============================================
export async function getStudentByAdmissionNumber(admissionNumber: string) {
    await requireAuth();
    const result = await db
        .select()
        .from(students)
        .where(eq(students.admissionNumber, admissionNumber))
        .limit(1);

    return result[0] || null;
}

// ============================================
// CREATE STUDENT
// ============================================
export async function createStudent(data: Omit<NewStudent, "id" | "admissionNumber" | "createdAt" | "updatedAt">) {
    const currentUser = await requireOperations();

    // Generate admission number
    const year = new Date().getFullYear();
    const countResult = await db
        .select({ count: count() })
        .from(students)
        .where(like(students.admissionNumber, `ADM${year}%`));

    const nextNumber = (countResult[0]?.count || 0) + 1;
    const admissionNumber = `ADM${year}${String(nextNumber).padStart(4, "0")}`;

    const result = await db
        .insert(students)
        .values({
            ...data,
            admissionNumber,
        })
        .returning();

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "student",
        entityId: result[0].id,
        description: `Created new student ${result[0].firstName} ${result[0].lastName}`,
        newValue: JSON.stringify(result[0]),
    });

    // Auto-create fee account for the new student
    try {
        await autoCreateFeeAccountForStudent(
            result[0].id,
            result[0].className,
            result[0].academicYear
        );
    } catch (error) {
        // Don't fail student creation if fee account creation fails
        console.error("Failed to auto-create fee account:", error);
    }

    revalidatePath("/operations/students");
    return { success: true, student: result[0] };
}

// ============================================
// UPDATE STUDENT
// ============================================
export async function updateStudent(
    id: string,
    data: Partial<Omit<NewStudent, "id" | "admissionNumber" | "createdAt">>
) {
    const currentUser = await requireOperations();

    // Get old student data
    const oldStudent = await db.select().from(students).where(eq(students.id, id)).limit(1);

    const result = await db
        .update(students)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(students.id, id))
        .returning();

    // Log action
    if (oldStudent.length > 0) {
        // Determine changes
        const changes = Object.keys(data).filter(key =>
            data[key as keyof typeof data] !== oldStudent[0][key as keyof typeof oldStudent[0]]
        );

        if (changes.length > 0) {
            await createAuditLog({
                userId: currentUser.id,
                action: "UPDATE",
                entityType: "student",
                entityId: id,
                description: `Updated student ${result[0].firstName} ${result[0].lastName}: changed ${changes.join(", ")}`,
                oldValue: JSON.stringify(oldStudent[0]),
                newValue: JSON.stringify(data),
            });
        }
    }

    revalidatePath("/operations/students");
    revalidatePath(`/operations/students/student/${id}`);
    return { success: true, student: result[0] };
}

// ============================================
// DELETE STUDENT (Soft delete)
// ============================================
export async function deleteStudent(id: string) {
    const currentUser = await requireOperations();

    const student = await db.select().from(students).where(eq(students.id, id)).limit(1);

    await db
        .update(students)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(students.id, id))
        .returning();

    // Log action
    if (student.length > 0) {
        await createAuditLog({
            userId: currentUser.id,
            action: "DEACTIVATE",
            entityType: "student",
            entityId: id,
            description: `Deactivated student ${student[0].firstName} ${student[0].lastName} (${student[0].admissionNumber})`,
        });
    }

    revalidatePath("/operations/students");
    return { success: true };
}

// ============================================
// GET STUDENTS COUNT
// ============================================
export async function getStudentsCount(options?: {
    className?: string;
    section?: string;
    academicYear?: string;
}) {
    await requireAuth();
    const { className, section, academicYear } = options || {};
    const conditions = [eq(students.isActive, true)];

    if (className) {
        conditions.push(eq(students.className, className));
    }
    if (section) {
        conditions.push(eq(students.section, section));
    }
    if (academicYear) {
        conditions.push(eq(students.academicYear, academicYear));
    }

    const result = await db
        .select({ count: count() })
        .from(students)
        .where(and(...conditions));

    return result[0]?.count || 0;
}

// ============================================
// GET CLASS STATISTICS
// ============================================
export async function getClassStatistics(academicYear?: string) {
    await requireAuth();
    const year = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    const result = await db
        .select({
            className: students.className,
            section: students.section,
            count: count(),
        })
        .from(students)
        .where(and(eq(students.isActive, true), eq(students.academicYear, year)))
        .groupBy(students.className, students.section)
        .orderBy(students.className, students.section);

    // Transform to the format needed by the UI
    const classMap = new Map<string, { name: string; sections: string[]; students: Record<string, number> }>();

    for (const row of result) {
        if (!classMap.has(row.className)) {
            classMap.set(row.className, {
                name: row.className,
                sections: [],
                students: {},
            });
        }
        const cls = classMap.get(row.className)!;
        if (!cls.sections.includes(row.section)) {
            cls.sections.push(row.section);
            cls.sections.sort();
        }
        cls.students[row.section] = row.count;
    }

    return Array.from(classMap.values());
}

// ============================================
// GET DASHBOARD STATISTICS
// ============================================
export async function getDashboardStatistics() {
    await requireAuth();
    const currentYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // Total students
    const totalStudentsResult = await db
        .select({ count: count() })
        .from(students)
        .where(and(eq(students.isActive, true), eq(students.academicYear, currentYear)));

    // Students by gender
    const genderResult = await db
        .select({
            gender: students.gender,
            count: count(),
        })
        .from(students)
        .where(and(eq(students.isActive, true), eq(students.academicYear, currentYear)))
        .groupBy(students.gender);

    // Recent admissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAdmissionsResult = await db
        .select({ count: count() })
        .from(students)
        .where(
            and(
                eq(students.isActive, true),
                sql`${students.createdAt} >= ${thirtyDaysAgo}`
            )
        );

    // Get unique classes count
    const classesResult = await db
        .select({ className: students.className })
        .from(students)
        .where(and(eq(students.isActive, true), eq(students.academicYear, currentYear)))
        .groupBy(students.className);

    // Get unique sections count
    const sectionsResult = await db
        .select({ className: students.className, section: students.section })
        .from(students)
        .where(and(eq(students.isActive, true), eq(students.academicYear, currentYear)))
        .groupBy(students.className, students.section);

    return {
        totalStudents: totalStudentsResult[0]?.count || 0,
        genderBreakdown: genderResult.reduce((acc, g) => {
            acc[g.gender] = g.count;
            return acc;
        }, {} as Record<string, number>),
        recentAdmissions: recentAdmissionsResult[0]?.count || 0,
        totalClasses: classesResult.length,
        totalSections: sectionsResult.length,
    };
}

// ============================================
// GET RECENT STUDENTS
// ============================================
export async function getRecentStudents(limit: number = 5) {
    await requireAuth();
    const result = await db
        .select({
            id: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
            className: students.className,
            section: students.section,
            admissionNumber: students.admissionNumber,
            createdAt: students.createdAt,
        })
        .from(students)
        .where(eq(students.isActive, true))
        .orderBy(desc(students.createdAt))
        .limit(limit);

    return result;
}
