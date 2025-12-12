import { notFound } from "next/navigation";
import { requireOperations } from "@/lib/dal";
import { getStudentById } from "@/lib/actions/students";
import { getFeesByStudent, getStudentFeeStatus } from "@/lib/actions/fees";
import { getStudentAttendanceHistory, getAttendancePercentage } from "@/lib/actions/attendance";
import { StudentProfileClient } from "./student-profile-client";

interface PageProps {
    params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
    await requireOperations();

    const { studentId } = await params;

    // Fetch student data from database
    const student = await getStudentById(studentId);

    if (!student) {
        notFound();
    }

    // Fetch related data in parallel
    const [fees, feeStatus, attendanceHistory, attendancePercentage] = await Promise.all([
        getFeesByStudent(studentId),
        getStudentFeeStatus(studentId),
        getStudentAttendanceHistory(studentId, { limit: 30 }),
        getAttendancePercentage(studentId),
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
            fees={fees}
            feeStatus={feeStatus}
            attendanceHistory={attendanceHistory}
            attendanceStats={{
                present: attendanceStats["present"] || 0,
                absent: attendanceStats["absent"] || 0,
                late: attendanceStats["late"] || 0,
                leave: attendanceStats["leave"] || 0,
                percentage: attendancePercentage,
            }}
        />
    );
}
