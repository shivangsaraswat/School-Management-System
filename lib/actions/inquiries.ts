"use server";

import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { eq, and, like, or, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOperations } from "@/lib/dal";

// ============================================
// GET INQUIRIES
// ============================================
export async function getInquiries(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    await requireOperations();
    const { status, search, limit = 50, offset = 0 } = options || {};
    const conditions = [];

    if (status) {
        conditions.push(eq(inquiries.status, status as "new" | "contacted" | "scheduled" | "enrolled" | "declined"));
    }
    if (search) {
        conditions.push(
            or(
                like(inquiries.studentName, `%${search}%`),
                like(inquiries.parentName, `%${search}%`),
                like(inquiries.phone, `%${search}%`)
            )
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select()
        .from(inquiries)
        .where(whereClause)
        .orderBy(desc(inquiries.createdAt))
        .limit(limit)
        .offset(offset);

    return result;
}

// ============================================
// GET INQUIRY BY ID
// ============================================
export async function getInquiryById(id: string) {
    await requireOperations();
    const result = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, id))
        .limit(1);

    return result[0] || null;
}

// ============================================
// CREATE INQUIRY
// ============================================
export async function createInquiry(data: {
    studentName: string;
    parentName: string;
    phone: string;
    email?: string | null;
    classAppliedFor: string;
    source?: string | null;
    notes?: string | null;
}) {
    await requireOperations();
    const result = await db
        .insert(inquiries)
        .values({
            ...data,
            status: "new",
        })
        .returning();

    revalidatePath("/operations/admissions");
    return { success: true, inquiry: result[0] };
}

// ============================================
// UPDATE INQUIRY STATUS
// ============================================
export async function updateInquiryStatus(
    id: string,
    status: "new" | "contacted" | "scheduled" | "enrolled" | "declined"
) {
    await requireOperations();
    const result = await db
        .update(inquiries)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(eq(inquiries.id, id))
        .returning();

    revalidatePath("/operations/admissions");
    return { success: true, inquiry: result[0] };
}

// ============================================
// UPDATE INQUIRY
// ============================================
export async function updateInquiry(
    id: string,
    data: Partial<{
        studentName: string;
        parentName: string;
        phone: string;
        email: string | null;
        classAppliedFor: string;
        source: string | null;
        notes: string | null;
        status: "new" | "contacted" | "scheduled" | "enrolled" | "declined";
        followUpDate: string | null;
    }>
) {
    await requireOperations();
    const result = await db
        .update(inquiries)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(inquiries.id, id))
        .returning();

    revalidatePath("/operations/admissions");
    return { success: true, inquiry: result[0] };
}

// ============================================
// DELETE INQUIRY
// ============================================
export async function deleteInquiry(id: string) {
    await requireOperations();
    await db.delete(inquiries).where(eq(inquiries.id, id));
    revalidatePath("/operations/admissions");
    return { success: true };
}

// ============================================
// GET INQUIRY STATISTICS
// ============================================
export async function getInquiryStatistics() {
    await requireOperations();
    const result = await db
        .select({
            status: inquiries.status,
            count: count(),
        })
        .from(inquiries)
        .groupBy(inquiries.status);

    const stats = result.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
    }, {} as Record<string, number>);

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    return {
        total,
        new: stats["new"] || 0,
        contacted: stats["contacted"] || 0,
        scheduled: stats["scheduled"] || 0,
        enrolled: stats["enrolled"] || 0,
        declined: stats["declined"] || 0,
    };
}
