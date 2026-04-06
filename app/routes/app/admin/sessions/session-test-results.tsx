import { getAllStudentAttemptByTest } from "~/features/quiz/api/attempt/get-all-student-attempt-by-test"
import type { Route } from "./+types/session-test-results"
import TableLayout from "~/components/layouts/table-layout"
import { DefaultTableHeader } from "~/components/ui/table-header"
import EmptyMessage from "~/components/ui/empty-message"
import { getTest } from "~/features/quiz/api/get-test"
import { FaArrowLeft } from "react-icons/fa"
import TestInformationCard from "~/components/test/test-information-card"
import { Link } from "react-router"
import { TableCell, TableRow } from "~/components/ui/table"
import { format } from "date-fns"
import { Button } from "~/components/ui/button"
import { exportToExcel } from "~/lib/excel"
import { type Enrollment, type StudentAttempt, type SessionTest, type StudentScore } from "~/types/api"
import { getEnrollmentByBootcamp } from "~/features/enrollments/api/get-enrollment-by-bootcamp"
import { useEffect, useMemo, useState } from "react"
import PageSpinner from "~/components/ui/page-spinner"



export const loader = async ({ params }: Route.LoaderArgs) => {
    return {test: params.test, session: params.session, bootcamp: params.bootcamp}
}

const SessionTestResults = ({loaderData}:Route.ComponentProps) => {

    const [test, setTest] = useState<SessionTest>()
    const [attempts, setAttempts] = useState<StudentScore[]>([])
    const [loading, setLoading] = useState(true)
    const [highestOnly, setHighestOnly] = useState(true)

    const displayedAttempts = useMemo(() => {
        if (!highestOnly) return attempts
        const bestMap = new Map<string, StudentScore>()
        for (const score of attempts) {
            const existing = bestMap.get(score.user_id)
            if (!existing || score.score > existing.score) {
                bestMap.set(score.user_id, score)
            }
        }
        return Array.from(bestMap.values())
    }, [attempts, highestOnly])

    const fetchAll = async () => {
        try {
            const [
                {data: test},
                {data: attempts},
                {data: enrollments}
            ] = await Promise.all([
                getTest(loaderData.test).catch(() => ({data: null as SessionTest | null})),
                getAllStudentAttemptByTest(loaderData.test).catch(() => ({data: [] as StudentScore[]})),
                getEnrollmentByBootcamp(loaderData.bootcamp).catch(() => ({data: [] as Enrollment[]}))
            ])

            if (test) setTest(test)

            const usersWithScores = new Set(attempts.map(a => a.user_id))

            const allAttempts: StudentScore[] = [...attempts]

            for (const enroll of enrollments) {
                if (!usersWithScores.has(enroll.user_id)) {
                    allAttempts.push({
                        user: enroll.user,
                        user_id: enroll.user_id,
                        score: 0,
                        attempt: undefined,
                        attempt_id: "",
                        id: "",
                    } as StudentScore)
                }
            }

            allAttempts.sort((a, b) => {
                const nameCompare = a.user.name.localeCompare(b.user.name)
                if (nameCompare !== 0) return nameCompare
                if (!a.attempt) return 1
                if (!b.attempt) return -1
                return new Date(a.attempt.done_at).getTime() - new Date(b.attempt.done_at).getTime()
            })

            setAttempts(allAttempts)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const exportResult = () => {
        exportToExcel(`${test?.title}-result`, displayedAttempts.map((e) => (
            {
                nim: e.user.nim,
                name: e.user.name,
                attempt: e.attempt ? displayedAttempts.filter(a => a.user_id === e.user_id).indexOf(e) + 1 : "-",
                doneAt: e.attempt? e.attempt.done_at: "-",
                score: Math.ceil(e.score),
                status: (e.score >= test!.minimum_score)? "Passed":"Not passed",
            }
        )))
    }

    if (loading) return <PageSpinner />;

    return (
    <div className="flex flex-col w-full gap-y-4 bg-white rounded-lg shadow-md p-5">
            <div className={'w-full flex items-center'}>
                <Link to={`/bootcamps/${loaderData.bootcamp}/session/${loaderData.session}`}>
                    <button
                        className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
                        <FaArrowLeft/>
                    </button>
                </Link>
                <h2 className={'font-bold text-left w-full text-4xl text-slate-700 p-6 h-full'}>Test Result</h2>
            </div>
            {test && <TestInformationCard test={test}/>}
            <div className="flex items-center justify-between">
                <Button onClick={exportResult} className="w-1/6">Export</Button>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={highestOnly}
                        onChange={(e) => setHighestOnly(e.target.checked)}
                        className="w-4 h-4 accent-accent cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Show highest score only</span>
                </label>
            </div>
            <TableLayout header={<DefaultTableHeader columns={["NIM", "Name", "Attempt", "Done at", "Score", "Status"]}/>}>
                {
                displayedAttempts.length < 1?
                <EmptyMessage title="No attempts." text="The students hasn't made any attempts yet."/>:
                displayedAttempts.map((e, idx) => 
                    <TableRow key={e.id || `enroll-${e.user_id}`} className="flex w-full border-b-1 border-gray-200">
                        <TableCell className="w-1/6 text-center">{e.user.nim ?? "-"}</TableCell>
                        <TableCell className="w-1/6 text-center">{e.user.name}</TableCell>
                        <TableCell className="w-1/6 text-center">{
                            e.attempt ? displayedAttempts.filter(a => a.user_id === e.user_id).indexOf(e) + 1 : "-"
                        }</TableCell>
                        <TableCell className="w-1/6 text-center">{
                            e.attempt? format(new Date(e.attempt.done_at), "MM/dd/yyyy HH:mm:ss"):'-'
                        }</TableCell>
                        <TableCell className="w-1/6 text-center">{Math.ceil(e.score)}</TableCell>
                        <TableCell className="w-1/6 text-center">{(e.score >= test!.minimum_score)?"Passed":"Not passed"}</TableCell>
                    </TableRow>
                )
                }
            </TableLayout>
    </div>)
}

export default SessionTestResults