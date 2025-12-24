import { notFound } from "next/navigation";
import { requireOperations } from "@/lib/dal";
import { getStudentById } from "@/lib/actions/students";
import { getStudentFeeHistory } from "@/lib/actions/fee-accounts";
import { getStudentFeeAccount } from "@/lib/actions/fee-accounts";
import { getStudentAttendanceHistory, getAttendancePercentage } from "@/lib/actions/attendance";
import { getCurrentAcademicYear, getSectionsForClass } from "@/lib/actions/settings";
import { StudentProfileClient } from "./student-profile-client";

interface PageProps {
    params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
    await requireOperations();

    const { studentId } = await params;
    const currentYear = await getCurrentAcademicYear();

    // Fetch student data from database
    const student = await getStudentById(studentId);

    if (!student) {
        notFound();
    }

    // Fetch related data in parallel
    const [feeAccount, feeHistory, attendanceHistory, attendancePercentage, allSections] = await Promise.all([
        getStudentFeeAccount(studentId, currentYear),
        getStudentFeeHistory(studentId, currentYear),
        getStudentAttendanceHistory(studentId, { limit: 30 }),
        getAttendancePercentage(studentId),
        getSectionsForClass(student.className, currentYear),
    ]);

    // Calculate attendance stats from history
    const attendanceStats = attendanceHistory.reduce(
        (acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <StudentProfileClient
            student={student}
            currentYear={currentYear}
            feeAccount={feeAccount}
            feeHistory={feeHistory}
            attendanceHistory={attendanceHistory}
            attendanceStats={{
                present: attendanceStats["present"] || 0,
                absent: attendanceStats["absent"] || 0,
                late: attendanceStats["late"] || 0,
                leave: attendanceStats["leave"] || 0,
                percentage: attendancePercentage,
            }}
            allSections={allSections}
        />
    );
}
