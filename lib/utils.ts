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
 * Formats class display.
 * Sections are no longer used - simply returns the class name.
 * 
 * @param className - The class name (e.g., "Class 9", "Nursery")
 * @param section - Deprecated, kept for backward compatibility
 * @returns Formatted string (just the class name)
 */
export function formatClassSection(
    className: string,
    _section?: string,
    _options?: { totalSections?: number; allSections?: string[] }
): string {
    return className;
}

/**
 * Simple class formatter.
 * Sections are no longer used - simply returns the class name.
 */
export function formatClassDisplay(className: string, _section?: string): string {
    return className;
}

