
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
