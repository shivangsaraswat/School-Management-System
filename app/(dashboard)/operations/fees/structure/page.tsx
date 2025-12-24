import { requireOperations } from "@/lib/dal";
import { getFeeStructures } from "@/lib/actions/fee-structure";
import { getAcademicYears, getCurrentAcademicYear, getSchoolClasses } from "@/lib/actions/settings";
import { FeeStructureClient } from "./client";

export default async function FeeStructurePage() {
    await requireOperations();

    const [currentYear, academicYears, classes] = await Promise.all([
        getCurrentAcademicYear(),
        getAcademicYears(),
        getSchoolClasses(),
    ]);

    const structures = await getFeeStructures(currentYear);

    return (
        <FeeStructureClient
            initialStructures={structures}
            initialAcademicYears={academicYears}
            initialCurrentYear={currentYear}
            initialClasses={classes}
        />
    );
}
