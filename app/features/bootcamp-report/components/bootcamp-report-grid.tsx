import TableLayout from "~/components/layouts/table-layout"
import EmptyMessage from "~/components/ui/empty-message"
import { ReportDataTableHeader } from "~/components/ui/table-header"
import { compare } from "~/lib/utils"
import type { Enrollment, StudentAttempt } from "~/types/api"
import StudentReportRow from "./student-report-row"
import { Button } from "~/components/ui/button"
import { useState, useMemo } from "react"
import { CiSearch } from "react-icons/ci"
import { AssignmentResultType, CertificateType, TestType } from "~/types/enum"
import toast from "react-hot-toast"
import { createCertificate } from "~/features/certificates/api/create-certificate"
import { Progress } from "~/components/ui/progress"
import { exportToExcel } from "~/lib/excel"
import { Checkbox } from "~/components/ui/checkbox"
import { Modal } from "~/components/modal"

interface Props {
    enrollments: Enrollment[]
    session: number
    bootcampid: string
    certificates: Record<string, CertificateType[]>
    onRefresh?: () => void
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

interface EligibilityCriteria {
    clockIn: boolean
    clockOut: boolean
    preTest: boolean
    postTest: boolean
    assignmentSubmitted: boolean
    assignmentGradeA: boolean
}

const getEligibilityMetrics = (enrollment: Enrollment) => {
    const clockInCount = enrollment.user.session_attendances.filter(e => e.attendance_type == 'clock_in').length 
    const clockOutCount = enrollment.user.session_attendances.filter(e => e.attendance_type == 'clock_out').length
    const assignmentSubmittedCount = enrollment.user.session_assignment_results.length
    const preTestSubmitted = displayMaxScoreAttempt(enrollment.user.student_attempts.filter(e => e.test.type == TestType.PRE_TEST)).length
    const assignmentGradeACount = enrollment.user.session_assignment_results.filter(e => e.result == AssignmentResultType.GOOD).length
    const postTestPassed = displayMaxScoreAttempt(enrollment.user.student_attempts.filter(e => e.test.type == TestType.POST_TEST)).filter(e => e.score && e.score.score >= e.test.minimum_score).length

    return {
        clockInCount,
        clockOutCount,
        assignmentSubmittedCount,
        preTestSubmitted,
        assignmentGradeACount,
        postTestPassed,
    }
}

const evaluateEligibility = (
    metrics: ReturnType<typeof getEligibilityMetrics>,
    sessionCount: number,
    criteria: EligibilityCriteria
) => {
    const requiredCounts: number[] = []
    const fullCounts: number[] = []

    if (criteria.clockIn) {
        requiredCounts.push(metrics.clockInCount)
        fullCounts.push(metrics.clockInCount)
    }
    if (criteria.clockOut) {
        requiredCounts.push(metrics.clockOutCount)
        fullCounts.push(metrics.clockOutCount)
    }
    if (criteria.preTest) {
        requiredCounts.push(metrics.preTestSubmitted)
        fullCounts.push(metrics.preTestSubmitted)
    }
    if (criteria.postTest) {
        requiredCounts.push(metrics.postTestPassed)
        fullCounts.push(metrics.postTestPassed)
    }
    if (criteria.assignmentSubmitted) {
        requiredCounts.push(metrics.assignmentSubmittedCount)
        fullCounts.push(metrics.assignmentSubmittedCount)
    }
    if (criteria.assignmentGradeA) {
        requiredCounts.push(metrics.assignmentGradeACount)
        fullCounts.push(metrics.assignmentGradeACount)
    }

    if (requiredCounts.length === 0) return 1

    const minimumRequired = Math.max(1, Math.floor(sessionCount / 2))

    if (requiredCounts.some(e => e < minimumRequired)) {
        return 0
    }
    if (sessionCount > 0 && fullCounts.every(e => e == sessionCount)) {
        return 2
    }
    return 1
}


const BootcampReportGrid = ({enrollments, session, bootcampid, certificates, onRefresh}:Props) => {
    
    const [selected, setSelected] = useState<string[]>([])
    const [progress, setProgress] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [bulkModalOpen, setBulkModalOpen] = useState(false)
    const [criteria, setCriteria] = useState<EligibilityCriteria>({
        clockIn: true,
        clockOut: true,
        preTest: true,
        postTest: true,
        assignmentSubmitted: true,
        assignmentGradeA: true,
    })

    const sortedEnrollments = useMemo(() => (
        enrollments.slice().sort((a, b) => compare(a.user.nim ?? '', b.user.nim ?? ''))
    ), [enrollments])

    const filteredEnrollments = useMemo(() => {
        const term = searchTerm.toLowerCase()
        if (!term) return sortedEnrollments
        return sortedEnrollments.filter((e) =>
            (e.user.nim ?? "").toLowerCase().includes(term) ||
            e.user.name.toLowerCase().includes(term)
        )
    }, [sortedEnrollments, searchTerm])

    const eligibilityByUserId = useMemo(() => {
        return sortedEnrollments.reduce<Record<string, number>>((acc, enrollment) => {
            const metrics = getEligibilityMetrics(enrollment)
            acc[enrollment.user_id] = evaluateEligibility(metrics, session, criteria)
            return acc
        }, {})
    }, [sortedEnrollments, session, criteria])

    const gradeAEligibleByUserId = useMemo(() => {
        return sortedEnrollments.reduce<Record<string, boolean>>((acc, enrollment) => {
            const metrics = getEligibilityMetrics(enrollment)
            acc[enrollment.user_id] = session > 0 && metrics.assignmentGradeACount === session
            return acc
        }, {})
    }, [sortedEnrollments, session])

    const onSelect = (e: Enrollment, idx:number) => {
        setSelected((prev) => {
            if (prev.includes(e.user_id)) {
                return prev.filter((id) => id !== e.user_id)
            }
            return [...prev, e.user_id]
        })
        
    }

    
    const exportResult = () => {
        exportToExcel(`${bootcampid}-studentreport`, enrollments.map(e => (
            {
                nim: e.user.nim,
                name: e.user.name,
                "clock in": e?.user.session_attendances.filter(e => e.attendance_type == 'clock_in').length,
                "clock out": e?.user.session_attendances.filter(e => e.attendance_type == 'clock_out').length,
                "pre test": displayMaxScoreAttempt(e?.user.student_attempts.filter(e => e.test.type == TestType.PRE_TEST)).length,
                "post-test passed": displayMaxScoreAttempt(e?.user.student_attempts.filter(e => e.test.type == TestType.POST_TEST)).filter(e => e.score && e.score.score >= e.test.minimum_score).length,
                "assignment submitted": e?.user.session_assignment_results.length,
                "assignment grade A": e?.user.session_assignment_results.filter(e => e.result == AssignmentResultType.GOOD).length,
            }
        )))
    }

    const hasCertificateType = (userId: string, type: CertificateType) =>
        (certificates[userId] ?? []).includes(type)

    const selectAll = () => {
        const eligibleIds = sortedEnrollments
            .filter((e) => eligibilityByUserId[e.user_id] != 0)
            .map((e) => e.user_id)
        setSelected(eligibleIds)
    }

    const generateAll = async (type: "accomplished" | "grade_a") => {

        const toastId = toast.loading("Generating certificate...")
        
        if (selected.length == 0) {
            toast.error(`You must select the user!`, {
                id: toastId
            })
            return
        }

        const eligibleIds = selected.filter((userId) => {
            if (type === "grade_a") {
                return gradeAEligibleByUserId[userId] && !hasCertificateType(userId, CertificateType.PREMIUM)
            }
            return eligibilityByUserId[userId] != 0 && !hasCertificateType(userId, CertificateType.NORMAL)
        })

        if (eligibleIds.length === 0) {
            toast.error(`No selected users match the certificate criteria.`, {
                id: toastId
            })
            return
        }

        try {
            for (let i = 0;i < eligibleIds.length;i++){
                await createCertificate({
                    data: {
                        bootcamp_id: bootcampid,
                        user_id: eligibleIds[i],
                        type: type === "grade_a" ? CertificateType.PREMIUM : CertificateType.NORMAL,
                    }
                })
                setProgress(prev => prev + 100 / eligibleIds.length);
            }
            setProgress(100)
            toast.success(`Generate certificate for selected user success!`, {
                id: toastId
            })
        } catch (error) {
            toast.error(`Generate certificate for selected user failed!`, {
                id: toastId
            })
            
        } finally {
            setTimeout(() => {
                setProgress(0)
                onRefresh?.()
            }, 3000);
        }
    }
    
    
    return (<>
        <Modal
            title="Generate Certificate"
            isOpen={bulkModalOpen}
            onClose={() => setBulkModalOpen(false)}
        >
            <div className="flex flex-col gap-3">
                <Button onClick={() => { setBulkModalOpen(false); generateAll("accomplished"); }}>
                    Accomplished
                </Button>
                <Button variant="outline" onClick={() => { setBulkModalOpen(false); generateAll("grade_a"); }}>
                    Grade A (All Assignments)
                </Button>
            </div>
        </Modal>
        {/* <div className="flex items-center gap-10">
            <h4 className="text-2xl font-semibold">Legend:</h4>
            <div className="flex gap-5 items-center">
                <span className="w-5 h-5 border-black border-1"></span>
                <h4 className="text-xl">Eligible for certificate</h4>
            </div>
            <div className="flex gap-5 items-center">
                <span className="w-5 h-5 border-black border-1 bg-red-200"></span>
                <h4 className="text-xl">Not Eligible for certificate</h4>
            </div>
        </div> */}
        {
            enrollments.length < 1 ? <EmptyMessage text="There is no enrolled student here" title="No Enrolled Student"/>:
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center border bg-white px-3 py-2 rounded-md flex-1 max-w-sm">
                        <CiSearch className="text-gray-500 text-xl" />
                        <input
                            type="text"
                            placeholder="Search by NIM or name..."
                            className="bg-transparent outline-none px-2 py-1 text-gray-600 w-full text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg shadow-sm px-4 py-2">
                        <span className="text-sm font-semibold">Eligibility Criteria:</span>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={criteria.clockIn} onCheckedChange={(checked) => setCriteria({ ...criteria, clockIn: Boolean(checked) })} />
                            Clock In
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={criteria.clockOut} onCheckedChange={(checked) => setCriteria({ ...criteria, clockOut: Boolean(checked) })} />
                            Clock Out
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={criteria.preTest} onCheckedChange={(checked) => setCriteria({ ...criteria, preTest: Boolean(checked) })} />
                            Pre Test Submitted
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={criteria.postTest} onCheckedChange={(checked) => setCriteria({ ...criteria, postTest: Boolean(checked) })} />
                            Post Test Passed
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={criteria.assignmentSubmitted} onCheckedChange={(checked) => setCriteria({ ...criteria, assignmentSubmitted: Boolean(checked) })} />
                            Assignment Submitted
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={criteria.assignmentGradeA} onCheckedChange={(checked) => setCriteria({ ...criteria, assignmentGradeA: Boolean(checked) })} />
                            Assignment Grade A
                        </label>
                    </div>
                    <Button onClick={exportResult} variant={'success'}>Export to Excel</Button>
                    <Button onClick={selectAll} variant={'accent'}>Select by Criteria</Button>
                    <Button onClick={() => setBulkModalOpen(true)}>Generate</Button>
                    {selected.length + " Selected"}
                </div>
                {progress > 0 && <Progress value={progress} className="w-full"/>}
                <TableLayout
                    header = {<ReportDataTableHeader />}
                >
                    {filteredEnrollments.map((e, idx) => (
                        <StudentReportRow
                            certificateTypes={certificates[e.user_id] ?? []}
                            cur={1}
                            idx={idx}
                            e={e}
                            sessionCount={session}
                            onSelect={onSelect}
                            isSelected={selected.includes(e.user_id)}
                            isEligible={eligibilityByUserId[e.user_id] ?? 0}
                        />
                    ))}
                </TableLayout>
            </div>
        }
    </>)
}

export default BootcampReportGrid