"use server";

import { db } from "@/db";
import { exams, marks, students } from "@/db/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAcademics } from "@/lib/dal";

// ============================================
// GET EXAMS
// ============================================
export async function getExams(options?: {
    className?: string;
    subject?: string;
    status?: string;
    academicYear?: string;
    limit?: number;
    offset?: number;
}) {
    await requireAcademics();
    const { className, subject, status, academicYear, limit = 50, offset = 0 } = options || {};
    const conditions = [];

    if (className) {
        conditions.push(eq(exams.className, className));
    }
    if (subject) {
        conditions.push(eq(exams.subject, subject));
    }
    if (status) {
        conditions.push(eq(exams.status, status as "scheduled" | "ongoing" | "completed" | "cancelled"));
    }
    if (academicYear) {
        conditions.push(eq(exams.academicYear, academicYear));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select()
        .from(exams)
        .where(whereClause)
        .orderBy(desc(exams.date))
        .limit(limit)
        .offset(offset);

    return result;
}

// ============================================
// GET EXAM BY ID
// ============================================
export async function getExamById(id: string) {
    await requireAcademics();
    const result = await db
        .select()
        .from(exams)
        .where(eq(exams.id, id))
        .limit(1);

    return result[0] || null;
}

// ============================================
// CREATE EXAM
// ============================================
export async function createExam(data: {
    name: string;
    className: string;
    section?: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    maxMarks: number;
    academicYear: string;
}) {
    await requireAcademics();
    const result = await db
        .insert(exams)
        .values({
            ...data,
            status: "scheduled",
        })
        .returning();

    revalidatePath("/academics/exams");
    return { success: true, exam: result[0] };
}

// ============================================
// UPDATE EXAM
// ============================================
export async function updateExam(
    id: string,
    data: Partial<{
        name: string;
        className: string;
        section: string;
        subject: string;
        date: string;
        startTime: string;
        endTime: string;
        maxMarks: number;
        status: "scheduled" | "ongoing" | "completed" | "cancelled";
    }>
) {
    await requireAcademics();
    const result = await db
        .update(exams)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(exams.id, id))
        .returning();

    revalidatePath("/academics/exams");
    return { success: true, exam: result[0] };
}

// ============================================
// DELETE EXAM
// ============================================
export async function deleteExam(id: string) {
    await requireAcademics();
    await db.delete(exams).where(eq(exams.id, id));
    revalidatePath("/academics/exams");
    return { success: true };
}

// ============================================
// GET EXAM STATISTICS
// ============================================
export async function getExamStatistics() {
    await requireAcademics();
    const result = await db
        .select({
            status: exams.status,
            count: count(),
        })
        .from(exams)
        .groupBy(exams.status);

    const stats = result.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
    }, {} as Record<string, number>);

    // Get pending marks entry count
    const pendingMarksResult = await db
        .select({ count: count() })
        .from(exams)
        .where(eq(exams.status, "completed"));

    return {
        upcoming: stats["scheduled"] || 0,
        ongoing: stats["ongoing"] || 0,
        completed: stats["completed"] || 0,
        pendingMarksEntry: pendingMarksResult[0]?.count || 0,
    };
}

// ============================================
// SAVE MARKS
// ============================================
export async function saveMarks(
    examId: string,
    marksData: Array<{
        studentId: string;
        marksObtained: number;
        remarks?: string;
    }>
) {
    await requireAcademics();
    // Delete existing marks for this exam
    await db.delete(marks).where(eq(marks.examId, examId));

    // Insert new marks
    const insertData = marksData.map((m) => ({
        examId,
        studentId: m.studentId,
        marksObtained: m.marksObtained,
        remarks: m.remarks || null,
    }));

    await db.insert(marks).values(insertData);

    revalidatePath("/academics/exams");
    return { success: true, count: marksData.length };
}

// ============================================
// GET MARKS BY EXAM
// ============================================
export async function getMarksByExam(examId: string) {
    await requireAcademics();
    const result = await db
        .select({
            id: marks.id,
            studentId: marks.studentId,
            studentName: sql<string>`CONCAT(${students.firstName}, ' ', ${students.lastName})`,
            rollNumber: students.rollNumber,
            marksObtained: marks.marksObtained,
            remarks: marks.remarks,
        })
        .from(marks)
        .leftJoin(students, eq(marks.studentId, students.id))
        .where(eq(marks.examId, examId))
        .orderBy(students.rollNumber);

    return result;
}
