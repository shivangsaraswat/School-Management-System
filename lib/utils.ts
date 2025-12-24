import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: Date | string): string {
    return format(new Date(date), "MMM dd, yyyy HH:mm");
}

export function formatRelativeTime(date: Date | string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
}

export function generateAdmissionNumber(): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ADM${year}${random}`;
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Formats class and section display.
 * If there's only one section (A), returns just the class name.
 * If there are multiple sections, returns "Class - Section".
 * 
 * @param className - The class name (e.g., "Class 9", "Nursery")
 * @param section - The section letter (e.g., "A", "B")
 * @param totalSections - Number of sections for this class (if known)
 * @param allSections - Array of all sections for this class (alternative to totalSections)
 * @returns Formatted string
 */
export function formatClassSection(
    className: string,
    section: string,
    options?: { totalSections?: number; allSections?: string[] }
): string {
    // If we know there's only one section and it's "A", just return class name
    if (options?.totalSections === 1 && section === "A") {
        return className;
    }

    // If we have the sections array, check if it's only ["A"]
    if (options?.allSections && options.allSections.length === 1 && options.allSections[0] === "A") {
        return className;
    }

    // Default: show class with section
    return `${className} - ${section}`;
}

/**
 * Simple class-section formatter for when section count is unknown.
 * Shows "Class - Section" format.
 * Use formatClassSection() when you have section count info.
 */
export function formatClassDisplay(className: string, section: string): string {
    return `${className} - ${section}`;
}
