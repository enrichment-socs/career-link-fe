import TableLayout from "~/components/layouts/table-layout";
import EmptyMessage from "~/components/ui/empty-message";
import { Progress } from "~/components/ui/progress";
import { TableHead, TableHeader, TableRow, TableCell } from "~/components/ui/table";
import type { Enrollment, StudentAttempt } from "~/types/api";
import { AssignmentResultType, TestType } from "~/types/enum";

interface Props {
  enrollments: Enrollment[];
  sessionCount: number;
}

const displayMaxScoreAttempt = (attempts: StudentAttempt[]) => {
  let res = Object.values(
    attempts.reduce<Record<string, StudentAttempt>>((prev, curr) => {
      const target = prev[curr.test_id];
      if (!target || (target.score && curr.score && target.score < curr.score)) {
        prev[curr.test_id] = curr;
      }
      return prev;
    }, {})
  );
  return res;
};

const ProgressTableHeader = () => {
  return (
    <TableHeader className="p-5 items-center flex w-full">
      <TableRow className="flex w-full">
        <TableHead className="h-full w-[4%] text-center">No.</TableHead>
        <TableHead className="h-full w-[12%] text-center">NIM</TableHead>
        <TableHead className="h-full w-[16%] text-center">Name</TableHead>
        <TableHead className="h-full w-[28%] text-center">Progress</TableHead>
        <TableHead className="h-full w-[8%] text-center">Clock In</TableHead>
        <TableHead className="h-full w-[8%] text-center">Clock Out</TableHead>
        <TableHead className="h-full w-[8%] text-center whitespace-normal word-break">
          Pre Test
        </TableHead>
        <TableHead className="h-full w-[8%] text-center whitespace-normal word-break">
          Post Test
        </TableHead>
        <TableHead className="h-full w-[8%] text-center whitespace-normal word-break">
          Assignment
        </TableHead>
        <TableHead className="h-full w-[8%] text-center whitespace-normal word-break">
          Grade A
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

const StudentProgressGrid = ({ enrollments, sessionCount }: Props) => {
  if (enrollments.length === 0) {
    return (
      <EmptyMessage
        title="No Enrolled Student"
        text="There is no enrolled student here"
      />
    );
  }

  const totalRequired = sessionCount * 6;

  return (
    <TableLayout header={<ProgressTableHeader />}>
      {enrollments.map((enrollment, idx) => {
        const clockInCount = enrollment.user.session_attendances.filter(
          (e) => e.attendance_type == "clock_in"
        ).length;
        const clockOutCount = enrollment.user.session_attendances.filter(
          (e) => e.attendance_type == "clock_out"
        ).length;
        const assignmentSubmittedCount =
          enrollment.user.session_assignment_results.length;
        const preTestSubmitted = displayMaxScoreAttempt(
          enrollment.user.student_attempts.filter(
            (e) => e.test.type == TestType.PRE_TEST
          )
        ).length;
        const assignmentGradeACount = enrollment.user.session_assignment_results.filter(
          (e) => e.result == AssignmentResultType.GOOD
        ).length;
        const postTestPassed = displayMaxScoreAttempt(
          enrollment.user.student_attempts.filter(
            (e) => e.test.type == TestType.POST_TEST
          )
        ).filter((e) => e.score && e.score.score >= e.test.minimum_score).length;

        const completed =
          clockInCount +
          clockOutCount +
          assignmentSubmittedCount +
          assignmentGradeACount +
          preTestSubmitted +
          postTestPassed;
        const percent = totalRequired > 0
          ? Math.min(100, Math.round((completed / totalRequired) * 100))
          : 0;

        return (
          <TableRow
            key={enrollment.user_id}
            className="shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full"
          >
            <TableCell className="w-[4%] text-center">{idx + 1}</TableCell>
            <TableCell className="w-[12%] text-center">
              {enrollment.user.nim ?? "-"}
            </TableCell>
            <TableCell className="w-[16%] text-center whitespace-normal break-words">
              {enrollment.user.name ?? "-"}
            </TableCell>
            <TableCell className="w-[28%]">
              <div className="flex items-center gap-3">
                <Progress value={percent} className="w-full" />
                <span className="text-sm font-semibold text-gray-700">
                  {percent}%
                </span>
              </div>
            </TableCell>
            <TableCell className="w-[8%] text-center">{clockInCount}</TableCell>
            <TableCell className="w-[8%] text-center">{clockOutCount}</TableCell>
            <TableCell className="w-[8%] text-center">{preTestSubmitted}</TableCell>
            <TableCell className="w-[8%] text-center">{postTestPassed}</TableCell>
            <TableCell className="w-[8%] text-center">{assignmentSubmittedCount}</TableCell>
            <TableCell className="w-[8%] text-center">{assignmentGradeACount}</TableCell>
          </TableRow>
        );
      })}
    </TableLayout>
  );
};

export default StudentProgressGrid;
