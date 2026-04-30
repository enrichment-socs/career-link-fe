import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import TooltipLayout from "~/components/layouts/tooltip-layout";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { TableCell, TableRow } from "~/components/ui/table";
import { createCertificate } from "~/features/certificates/api/create-certificate";
import type { Enrollment, StudentAttempt, User } from "~/types/api";
import { AssignmentResultType, CertificateType, TestType } from "~/types/enum";
import { Modal } from "~/components/modal";

interface Props {
  idx: number;
  cur: number;
  e: Enrollment;
  sessionCount: number;
  onSelect: (e: Enrollment, idx:number) => void;
  isSelected: boolean;
  isEligible: number;
  certificateTypes: CertificateType[];
}

const displayMaxScoreAttempt = (attempts: StudentAttempt[]) => {
  let res = Object.values(attempts.reduce<Record<string, StudentAttempt>>((prev, curr) => {
      const target = prev[curr.test_id]
      if (!target || (target.score && curr.score && target.score < curr.score)){
          prev[curr.test_id] = curr
      }
      return prev
  }, {}))
  return res
}

const displayOrDash = (value?: string, limit = 10) => {
  if (!value || value.trim() === "") return "-";
  if (value.length <= limit) return value;
  return value.slice(0, limit) + "...";
};


const StudentReportRow = ({ idx, cur, onSelect, e, sessionCount, isSelected, isEligible, certificateTypes }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);

  const assignmentGradeACount = e?.user.session_assignment_results.filter(e => e.result == AssignmentResultType.GOOD).length ?? 0
  const isGradeAEligible = sessionCount > 0 && assignmentGradeACount === sessionCount
  const hasNormalCertificate = certificateTypes.includes(CertificateType.NORMAL)
  const hasPremiumCertificate = certificateTypes.includes(CertificateType.PREMIUM)
  const hasAnyCertificate = hasNormalCertificate || hasPremiumCertificate

  const generateCertificate = async (e: Enrollment, type: "accomplished" | "grade_a") => {

    const toastId = toast.loading("Generating certificate...")
    
    try {
      await createCertificate({
        data: {
          bootcamp_id: e.bootcamp_id,
          user_id: e.user_id,
          type: type === "grade_a" ? CertificateType.PREMIUM : CertificateType.NORMAL,
        }
      })
      toast.success(`Generate certificate for ${e.user.name} success!`, {
        id: toastId
      })
    } catch (error) {
      toast.error(`Generate certificate for ${e.user.name} failed!`, {
        id: toastId
      })
      
    }

  }

  const validateSelect = () => {
    if (!hasAnyCertificate) onSelect(e, idx)
  }
  return (
    <>
    <Modal
      title="Generate Certificate"
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => {
            setModalOpen(false);
            generateCertificate(e, "accomplished");
          }}
          disabled={isEligible === 0 || hasNormalCertificate}
        >
          Accomplished
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setModalOpen(false);
            generateCertificate(e, "grade_a");
          }}
          disabled={!isGradeAEligible || hasPremiumCertificate}
        >
          Grade A (All Assignments)
        </Button>
      </div>
    </Modal>
    <TableRow className={`shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full ${isEligible?"":"bg-red-200 hover:bg-red-300"} ${!hasAnyCertificate?"":"bg-green-200 hover:bg-green-300"}`}>
      <TableCell className="w-[3%] font-medium text-center">
        <Checkbox onCheckedChange={validateSelect} checked={isSelected} className="border-black"/>
      </TableCell>

      <TableCell className="w-[12%] text-center">{e?.user.nim ?? "-"}</TableCell>

      <TableCell className="w-[15%] text-center whitespace-normal break-words">
        {e?.user.name ?? "-"}
      </TableCell>

      <TableCell className="w-[8%] text-center">
        {e?.user.session_attendances.filter(e => e.attendance_type == 'clock_in').length ?? "-"}
      </TableCell>

      <TableCell className="w-[8%] text-center">
        {e?.user.session_attendances.filter(e => e.attendance_type == 'clock_out').length ?? "-"}
      </TableCell>

      <TableCell className="w-[11%] text-center whitespace-normal break-words">
        {displayMaxScoreAttempt(e?.user.student_attempts.filter(e => e.test.type == TestType.PRE_TEST)).length}
      </TableCell>
      <TableCell className="w-[11%] text-center whitespace-normal break-words">
        {displayMaxScoreAttempt(e?.user.student_attempts.filter(e => e.test.type == TestType.POST_TEST)).filter(e => e.score && e.score.score >= e.test.minimum_score).length}
      </TableCell>
      <TableCell className="w-[11%] text-center whitespace-normal break-words">
        {e?.user.session_assignment_results.length ?? "-"}
      </TableCell>

      <TableCell className="w-[11%] text-center whitespace-normal break-words">
        {e?.user.session_assignment_results.filter(e => e.result == AssignmentResultType.GOOD).length ?? "-"}
      </TableCell>
      <TableCell className="w-[11%] text-center whitespace-normal break-words">
        <Button className={` ${!hasAnyCertificate?"":"bg-green-300 hover:bg-green-400 text-white"}`} disabled={hasNormalCertificate && hasPremiumCertificate} variant={`${isEligible?"outline":"destructive"}`} onClick={() => setModalOpen(true)}>
          Generate
        </Button>
      </TableCell>
    </TableRow>
    </>
  );
};

export default StudentReportRow;
