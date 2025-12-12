"use server";

import { db } from "@/db";
import { students, fees } from "@/db/schema";
import { eq, and, like, or, count, sql, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { NewStudent, Student } from "@/db/schema";

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
                like(students.firstName, `%${search}%`),
                like(students.lastName, `%${search}%`),
                like(students.admissionNumber, `%${search}%`)
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
    const result = await db
        .update(students)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(students.id, id))
        .returning();

    revalidatePath("/operations/students");
    revalidatePath(`/operations/students/student/${id}`);
    return { success: true, student: result[0] };
}

// ============================================
// DELETE STUDENT (Soft delete)
// ============================================
export async function deleteStudent(id: string) {
    const result = await db
        .update(students)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(students.id, id))
        .returning();

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
