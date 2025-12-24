"use server";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============================================
// GET SETTING
// ============================================
export async function getSetting(key: string): Promise<string | null> {
    const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

    return result[0]?.value || null;
}

// ============================================
// GET ALL SETTINGS
// ============================================
export async function getAllSettings() {
    const result = await db.select().from(settings);

    return result.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
    }, {} as Record<string, string>);
}

// ============================================
// SET SETTING
// ============================================
export async function setSetting(key: string, value: string) {
    const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(settings)
            .set({ value, updatedAt: new Date() })
            .where(eq(settings.key, key));
    } else {
        await db.insert(settings).values({ key, value });
    }

    revalidatePath("/admin/settings");
    return { success: true };
}

// ============================================
// DELETE SETTING
// ============================================
export async function deleteSetting(key: string) {
    await db.delete(settings).where(eq(settings.key, key));
    revalidatePath("/admin/settings");
    return { success: true };
}

// ============================================
// ACADEMIC YEAR MANAGEMENT
// ============================================

export async function getAcademicYears() {
    const yearsJson = await getSetting("academic_years");

    if (yearsJson) {
        try {
            return JSON.parse(yearsJson) as string[];
        } catch {
            return getDefaultAcademicYears();
        }
    }

    return getDefaultAcademicYears();
}

export async function addAcademicYear(year: string) {
    const years = await getAcademicYears();
    if (!years.includes(year)) {
        // Add new year and sort descending
        const newYears = [year, ...years].sort().reverse();
        await setSetting("academic_years", JSON.stringify(newYears));
        revalidatePath("/operations/students/manage");
    }
    return { success: true };
}

export async function getCurrentAcademicYear() {
    const year = await getSetting("current_academic_year");
    if (year) return year;
    return calculateCurrentAcademicYear();
}

// Calculate current academic year based on date
// Indian academic year runs April to March
// If current month is Jan-Mar, academic year is (prevYear)-(currentYear)
// If current month is Apr-Dec, academic year is (currentYear)-(nextYear)
function calculateCurrentAcademicYear(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed, Jan=0, Dec=11

    if (currentMonth < 3) {
        // Jan-Mar: Academic year started in previous year
        return `${currentYear - 1}-${currentYear}`;
    } else {
        // Apr-Dec: Academic year started in current year
        return `${currentYear}-${currentYear + 1}`;
    }
}

function getDefaultAcademicYears() {
    const currentAcademicYear = calculateCurrentAcademicYear();
    const [startYear] = currentAcademicYear.split("-").map(Number);

    // Generate 10 years: 2 future + current + 7 past
    const years: string[] = [];
    for (let i = -2; i <= 7; i++) {
        const year = startYear - i;
        years.push(`${year}-${year + 1}`);
    }
    return years;
}

// ============================================
// CLASS CONFIGURATION MANAGEMENT
// ============================================

// Get classes for a specific year (or default/current if not specified)
export async function getSchoolClasses(year?: string) {
    // If year is provided, try to fetch specific config
    if (year) {
        const yearConfig = await getSetting(`classes_config_${year}`);
        if (yearConfig) {
            try {
                return JSON.parse(yearConfig);
            } catch {
                // validation failed, fall back
            }
        }

        // If specific year config not found, check if it's the "legacy" default key
        // This provides backward compatibility
        const legacyConfig = await getSetting("school_classes");
        if (legacyConfig) {
            try {
                // For now, return legacy config as a starting point for any year
                // This ensures we don't start with empty lists
                return JSON.parse(legacyConfig);
            } catch { }
        }
    } else {
        // No year specified - try "legacy" key
        const classesJson = await getSetting("school_classes");
        if (classesJson) {
            try {
                return JSON.parse(classesJson);
            } catch { }
        }
    }

    return getDefaultClasses();
}

export async function setSchoolClasses(classes: Array<{ name: string; sections: string[] }>, year?: string) {
    if (year) {
        // Save for specific year
        await setSetting(`classes_config_${year}`, JSON.stringify(classes));
        // Also update legacy/current if this is the "current" year (optional, but good for safety)
        // For now, we only update the year-specific key
    } else {
        // Update legacy key
        await setSetting("school_classes", JSON.stringify(classes));
    }
    revalidatePath("/operations/students");
    return { success: true };
}

// Default class structure for Indian schools
function getDefaultClasses() {
    return [
        { name: "Nursery", sections: ["A"] },
        { name: "LKG", sections: ["A", "B"] },
        { name: "UKG", sections: ["A", "B"] },
        { name: "Class 1", sections: ["A", "B", "C"] },
        { name: "Class 2", sections: ["A", "B", "C"] },
        { name: "Class 3", sections: ["A", "B"] },
        { name: "Class 4", sections: ["A", "B"] },
        { name: "Class 5", sections: ["A", "B", "C"] },
        { name: "Class 6", sections: ["A", "B"] },
        { name: "Class 7", sections: ["A", "B"] },
        { name: "Class 8", sections: ["A", "B", "C"] },
        { name: "Class 9", sections: ["A", "B"] },
        { name: "Class 10", sections: ["A", "B", "C"] },
        { name: "Class 11", sections: ["A"] },
        { name: "Class 12", sections: ["A"] },
    ];
}
