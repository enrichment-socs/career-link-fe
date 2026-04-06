import { FaArrowLeft } from "react-icons/fa"
import { Link } from "react-router"
import TableLayout from "~/components/layouts/table-layout"
import { Button } from "~/components/ui/button"
import EmptyMessage from "~/components/ui/empty-message"
import { TableCell, TableRow } from "~/components/ui/table"
import { DefaultTableHeader } from "~/components/ui/table-header"
import type { Route } from "./+types/attendances"
import { getAttendanceBySession } from "~/features/attendance/api/get-attendance-by-session"
import { format } from "date-fns"
import { getBootcampSession } from "~/features/session/api/get-session"
import { exportToExcel } from "~/lib/excel"
import { type Session, type Attendance } from "~/types/api"
import { useEffect, useMemo, useState } from "react"
import PageSpinner from "~/components/ui/page-spinner"
import { CiSearch } from "react-icons/ci"

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {

    return {session: params.session}
    
}


interface AttendanceRow {
    nim: string,
    name: string,
    clock_in: string,
    clock_out: string
}


const Attendances = ({loaderData}:Route.ComponentProps) => {
    
    // const {attendances, session} = loaderData

    const [attendances, setAttendances] = useState<Attendance[]>([])
    const [session, setSession] = useState<Session>()
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    
    const fetchAttendances =async () => {
        try {
            const [
                {data: attendances},
                {data: session}
            ] = await Promise.all([
                getAttendanceBySession(loaderData.session),
                getBootcampSession(loaderData.session)
            ])
            setAttendances(attendances)
            setSession(session)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAttendances()
    }, [])
    
    function transform(attendances: Attendance[]): AttendanceRow[] {
        return attendances.sort((a,b) => a.user.nim!.localeCompare(b.user.nim!)).reduce((acc, curr) => {
            let record = acc.find(e => e.nim === curr.user.nim)

            if (!record) {
                record = {
                    nim: curr.user.nim ?? "-",
                    name: curr.user.name,
                    clock_in: "",
                    clock_out: ""
                }
                acc.push(record)
            }
            if (curr.attendance_type === "clock_in") {
                record.clock_in = format(curr.finished_at, 'MM/dd/yyyy HH:mm:ss')
            } else if (curr.attendance_type === "clock_out") {
                record.clock_out = format(curr.finished_at, 'MM/dd/yyyy HH:mm:ss')
            }
            return acc
        }, [] as AttendanceRow[])
    }

    if (loading) return <PageSpinner />;
    if (!session) return null

    const exportResult = () => {
        exportToExcel(`${session.title}-attendance`, transform(attendances))
    }

    return (
    <div className="flex flex-col w-full gap-y-4 bg-white rounded-lg shadow-md p-5">
            <div className={'w-full flex items-center'}>
                <Link to={`/bootcamps/${session.bootcamp.id}/session/${session.id}`}>
                    <button
                        className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
                        <FaArrowLeft/>
                    </button>
                </Link>
                <h2 className={'font-bold text-left w-full text-4xl text-slate-700 p-6 h-full'}>Session {session.session_number} Attendances</h2>
            </div>
            <div className="flex items-center gap-3">
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
                <Button onClick={exportResult} className="w-1/6">Export</Button>
            </div>
            
            <TableLayout header={<DefaultTableHeader columns={["NIM", "Name", "Clock in", "Clock out"]}/>}>
                {
                attendances.length < 1?
                <EmptyMessage title="No Attendances" text="The students hasn't attend yet."/>:
                transform(attendances).filter(e => {
                    const term = searchTerm.toLowerCase()
                    if (!term) return true
                    return e.nim.toLowerCase().includes(term) || e.name.toLowerCase().includes(term)
                }).map(e => 
                    <TableRow className="flex w-full border-b-1 border-gray-200">
                        <TableCell className="w-1/4 text-center">{e.nim ?? "-"}</TableCell>
                        <TableCell className="w-1/4 text-center">{e.name}</TableCell>
                        <TableCell className="w-1/4 text-center">{e.clock_in ? format(e.clock_in, 'MM/dd/yyyy HH:mm:ss'): "-"}</TableCell>
                        <TableCell className="w-1/4 text-center">{e.clock_out ? format(e.clock_out, 'MM/dd/yyyy HH:mm:ss'): "-"}</TableCell>
                    </TableRow>
                )
                }
            </TableLayout>
    </div>)
}

export default Attendances