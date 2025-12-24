"use server";

import { db } from "@/db";
import { feeStructures } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOperations } from "@/lib/dal";
import { createAuditLog } from "@/lib/internal/audit";
import { createFeeAccountsForExistingStudents } from "./fee-accounts";

// ============================================
// GET ALL FEE STRUCTURES
// ============================================
export async function getFeeStructures(academicYear?: string) {
    await requireOperations();

    if (academicYear) {
        return await db
            .select()
            .from(feeStructures)
            .where(eq(feeStructures.academicYear, academicYear))
            .orderBy(feeStructures.className);
    }

    return await db
        .select()
        .from(feeStructures)
        .orderBy(desc(feeStructures.academicYear), feeStructures.className);
}

// ============================================
// GET FEE STRUCTURE BY CLASS
// ============================================
export async function getFeeStructureByClass(
    className: string,
    academicYear: string
) {
    await requireOperations();

    const result = await db
        .select()
        .from(feeStructures)
        .where(
            and(
                eq(feeStructures.className, className),
                eq(feeStructures.academicYear, academicYear),
                eq(feeStructures.isActive, true)
            )
        )
        .limit(1);

    return result[0] || null;
}

// ============================================
// CREATE FEE STRUCTURE
// ============================================
export async function createFeeStructure(data: {
    academicYear: string;
    className: string;
    totalFee: string;
    breakdown?: string; // JSON string
}) {
    const currentUser = await requireOperations();

    // Check if structure already exists
    const existing = await getFeeStructureByClass(data.className, data.academicYear);
    if (existing) {
        return {
            success: false,
            error: `Fee structure already exists for ${data.className} in ${data.academicYear}`,
        };
    }

    const result = await db
        .insert(feeStructures)
        .values({
            academicYear: data.academicYear,
            className: data.className,
            totalFee: data.totalFee,
            breakdown: data.breakdown,
            isActive: true,
        })
        .returning();

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "fee_structure",
        entityId: result[0].id,
        description: `Created fee structure for ${data.className} - ${data.academicYear}: ₹${data.totalFee}`,
        newValue: JSON.stringify(result[0]),
    });

    // Auto-create fee accounts for all existing students in this class
    const accountsResult = await createFeeAccountsForExistingStudents(
        data.className,
        data.academicYear,
        data.totalFee
    );
    console.log(`Auto-created ${accountsResult.created} fee accounts for ${data.className}`);

    revalidatePath("/operations/fees/structure");
    revalidatePath("/operations/students");
    return {
        success: true,
        feeStructure: result[0],
        accountsCreated: accountsResult.created,
    };
}

// ============================================
// UPDATE FEE STRUCTURE
// ============================================
export async function updateFeeStructure(
    id: string,
    data: {
        totalFee?: string;
        breakdown?: string;
        isActive?: boolean;
    }
) {
    const currentUser = await requireOperations();

    // Get current record for audit
    const existing = await db
        .select()
        .from(feeStructures)
        .where(eq(feeStructures.id, id))
        .limit(1);

    if (!existing.length) {
        return { success: false, error: "Fee structure not found" };
    }

    const result = await db
        .update(feeStructures)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(feeStructures.id, id))
        .returning();

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "UPDATE",
        entityType: "fee_structure",
        entityId: id,
        description: `Updated fee structure for ${existing[0].className}`,
        oldValue: JSON.stringify(existing[0]),
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/fees/structure");
    return { success: true, feeStructure: result[0] };
}

// ============================================
// DELETE FEE STRUCTURE
// ============================================
export async function deleteFeeStructure(id: string) {
    const currentUser = await requireOperations();

    // Get current record for audit
    const existing = await db
        .select()
        .from(feeStructures)
        .where(eq(feeStructures.id, id))
        .limit(1);

    if (!existing.length) {
        return { success: false, error: "Fee structure not found" };
    }

    await db.delete(feeStructures).where(eq(feeStructures.id, id));

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "DELETE",
        entityType: "fee_structure",
        entityId: id,
        description: `Deleted fee structure for ${existing[0].className} - ${existing[0].academicYear}`,
        oldValue: JSON.stringify(existing[0]),
    });

    revalidatePath("/operations/fees/structure");
    return { success: true };
}

// ============================================
// COPY FEE STRUCTURES FROM PREVIOUS YEAR
// ============================================
export async function copyFeeStructuresFromYear(
    fromYear: string,
    toYear: string
) {
    const currentUser = await requireOperations();

    // Get all structures from source year
    const sourceStructures = await db
        .select()
        .from(feeStructures)
        .where(
            and(
                eq(feeStructures.academicYear, fromYear),
                eq(feeStructures.isActive, true)
            )
        );

    if (sourceStructures.length === 0) {
        return {
            success: false,
            error: `No fee structures found for ${fromYear}`,
        };
    }

    // Check if target year already has structures
    const existingInTarget = await db
        .select()
        .from(feeStructures)
        .where(eq(feeStructures.academicYear, toYear));

    if (existingInTarget.length > 0) {
        return {
            success: false,
            error: `Fee structures already exist for ${toYear}. Please delete them first if you want to copy.`,
        };
    }

    // Copy all structures to target year
    const newStructures = sourceStructures.map((s) => ({
        academicYear: toYear,
        className: s.className,
        totalFee: s.totalFee,
        breakdown: s.breakdown,
        isActive: true,
    }));

    await db.insert(feeStructures).values(newStructures);

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "fee_structure",
        entityId: toYear,
        description: `Copied ${sourceStructures.length} fee structures from ${fromYear} to ${toYear}`,
        newValue: JSON.stringify({ count: sourceStructures.length, fromYear, toYear }),
    });

    revalidatePath("/operations/fees/structure");
    return {
        success: true,
        count: sourceStructures.length,
        message: `Successfully copied ${sourceStructures.length} fee structures from ${fromYear} to ${toYear}`,
    };
}

// ============================================
// GET UNIQUE ACADEMIC YEARS WITH STRUCTURES
// ============================================
export async function getYearsWithFeeStructures() {
    await requireOperations();

    const results = await db
        .selectDistinct({ academicYear: feeStructures.academicYear })
        .from(feeStructures)
        .orderBy(desc(feeStructures.academicYear));

    return results.map((r) => r.academicYear);
}

// ============================================
// SYNC FEE ACCOUNTS FOR A CLASS
// Create fee accounts for existing students who don't have one yet
// ============================================
export async function syncFeeAccountsForClass(
    feeStructureId: string
) {
    const currentUser = await requireOperations();

    // Get the fee structure
    const structure = await db
        .select()
        .from(feeStructures)
        .where(eq(feeStructures.id, feeStructureId))
        .limit(1);

    if (!structure.length) {
        return { success: false, error: "Fee structure not found" };
    }

    const { className, academicYear, totalFee } = structure[0];

    // Create fee accounts for existing students
    const result = await createFeeAccountsForExistingStudents(
        className,
        academicYear,
        totalFee
    );

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "student_fee_account",
        entityId: feeStructureId,
        description: `Synced fee accounts for ${className}: ${result.created} new accounts created`,
        newValue: JSON.stringify(result),
    });

    revalidatePath("/operations/fees");
    revalidatePath("/operations/students");

    return {
        success: true,
        created: result.created,
        skipped: result.skipped,
        message: `Created ${result.created} new fee accounts for ${className}`,
    };
}
