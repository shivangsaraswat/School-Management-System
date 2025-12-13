
import { requireOperations } from "@/lib/dal";
import { getAcademicYears, getSchoolClasses, getCurrentAcademicYear } from "@/lib/actions/settings";
import { ManageClient } from "./manage-client";

export default async function ManageClassesPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>;
}) {
    await requireOperations();

    // 1. Get all available academic years
    const allYears = await getAcademicYears();

    // 2. Determine which year we are editing
    // If no search param, use the configured "current" academic year or the first one in list
    const params = await searchParams;
    let yearToEdit = params.year;
    if (!yearToEdit) {
        yearToEdit = await getCurrentAcademicYear();
    }

    // 3. Get configuration for that specific year
    // Note: getSchoolClasses handles the logic of falling back to legacy config if year specific config is missing
    const classesConfig = await getSchoolClasses(yearToEdit);

    // Sort classes for display consistency
    const specialClasses: Record<string, number> = {
        "Nursery": 0,
        "LKG": 1,
        "UKG": 2
    };

    classesConfig.sort((a: { name: string }, b: { name: string }) => {
        const orderA = specialClasses[a.name];
        const orderB = specialClasses[b.name];

        if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
        if (orderA !== undefined) return -1;
        if (orderB !== undefined) return 1;

        const getNum = (str: string) => {
            const match = str.match(/Class\s+(\d+)/i);
            return match ? parseInt(match[1]) : 999;
        };

        const numA = getNum(a.name);
        const numB = getNum(b.name);

        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="space-y-6 container mx-auto py-6 max-w-5xl animate-fade-in">
            <ManageClient
                key={yearToEdit}
                initialYear={yearToEdit}
                allYears={allYears}
                initialClasses={classesConfig}
            />
        </div>
    );
}
