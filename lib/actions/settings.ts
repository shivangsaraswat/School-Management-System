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
// GET SCHOOL CLASSES (from settings or default)
// ============================================
export async function getSchoolClasses() {
    const classesJson = await getSetting("school_classes");

    if (classesJson) {
        try {
            return JSON.parse(classesJson);
        } catch {
            return getDefaultClasses();
        }
    }

    return getDefaultClasses();
}

// ============================================
// SET SCHOOL CLASSES
// ============================================
export async function setSchoolClasses(classes: Array<{ name: string; sections: string[] }>) {
    return setSetting("school_classes", JSON.stringify(classes));
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

// ============================================
// GET ACADEMIC YEARS
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

function getDefaultAcademicYears() {
    const currentYear = new Date().getFullYear();
    return [
        `${currentYear}-${currentYear + 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear - 2}-${currentYear - 1}`,
    ];
}

// ============================================
// GET CURRENT ACADEMIC YEAR
// ============================================
export async function getCurrentAcademicYear() {
    const year = await getSetting("current_academic_year");
    if (year) return year;

    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
}
