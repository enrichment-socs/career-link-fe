import { useRef, useState, useMemo, type ChangeEvent } from "react"
import { CiSearch } from "react-icons/ci"
import { Button } from "~/components/ui/button"
import EmptyMessage from "~/components/ui/empty-message"
import { exportToExcel, importExcel } from "~/lib/excel"
import type { Enrollment } from "~/types/api"
import { createEnrollment } from "../api/create-enrollment"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import { Progress } from "~/components/ui/progress"
import { TableCell, TableRow } from "~/components/ui/table"
import { TableHead, TableHeader } from "~/components/ui/table"
import { Table, TableBody } from "~/components/ui/table"
import TooltipLayout from "~/components/layouts/tooltip-layout"
import { compare } from "~/lib/utils"

interface Props {
    enrollments: Enrollment[]
    onRefresh?: () => void
}

interface Template {
    email: string
    short_name: string
}

const GlobalEnrollmentGrid = ({ enrollments, onRefresh }: Props) => {
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredEnrollments = useMemo(() => {
        const term = searchTerm.toLowerCase()
        if (!term) return enrollments
        return enrollments.filter((e) =>
            (e.user?.nim ?? "").toLowerCase().includes(term) ||
            (e.user?.name ?? "").toLowerCase().includes(term) ||
            (e.user?.email ?? "").toLowerCase().includes(term) ||
            (e.bootcamp?.short_name ?? "").toLowerCase().includes(term)
        )
    }, [enrollments, searchTerm])

    const sortedEnrollments = useMemo(() => {
        return [...filteredEnrollments].sort((a, b) => {
            const bootcampCompare = compare(a.bootcamp?.short_name ?? "", b.bootcamp?.short_name ?? "")
            if (bootcampCompare !== 0) return bootcampCompare
            return compare(a.user?.nim ?? "", b.user?.nim ?? "")
        })
    }, [filteredEnrollments])

    const template: Template[] = [
        {
            email: "axel.kurniawan@binus.ac.id",
            short_name: "NM,AS"
        }
    ]

    const exportCurrentData = () => {
        const grouped = new Map<string, string[]>()
        for (const e of enrollments) {
            const email = e.user?.email ?? ""
            const sn = e.bootcamp?.short_name ?? ""
            if (!email) continue
            const existing = grouped.get(email)
            if (existing) {
                if (!existing.includes(sn)) existing.push(sn)
            } else {
                grouped.set(email, [sn])
            }
        }
        const data = Array.from(grouped.entries()).map(([email, shortNames]) => ({
            email,
            short_name: shortNames.join(",")
        }))
        exportToExcel("all-enrolled-students", data.length > 0 ? data : template)
    }

    const mappingStudent = async (res: Template[]) => {
        const toastId = toast.loading("Enrolling students...")
        const rows: { email: string; short_name: string }[] = []
        for (const row of res) {
            const shortNames = row.short_name.split(",").map((s) => s.trim()).filter(Boolean)
            for (const sn of shortNames) {
                rows.push({ email: row.email, short_name: sn })
            }
        }

        for (let i = 0; i < rows.length; i++) {
            try {
                await createEnrollment(rows[i].email, "", rows[i].short_name)
            } catch (error) {
                console.log(`Failed to enroll ${rows[i].email} to ${rows[i].short_name}: ${getErrorMessage(error)}`)
            }
            setProgress((prev) => prev + 100 / rows.length)
        }
        toast.success("Students imported", { id: toastId })
        setTimeout(() => {
            setProgress(0)
            onRefresh?.()
        }, 3000)
    }

    const importStudent = (e: ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader()
        reader.onload = (event) => importExcel<Template>(event, (res) => mappingStudent(res))
        reader.readAsArrayBuffer(e.target.files![0])
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <>
            <div className="flex gap-3 w-full items-center">
                <div className="flex items-center border bg-white px-3 py-2 rounded-md flex-1 max-w-sm">
                    <CiSearch className="text-gray-500 text-xl" />
                    <input
                        type="text"
                        placeholder="Search by NIM, name, email, or bootcamp..."
                        className="bg-transparent outline-none px-2 py-1 text-gray-600 w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button className="bg-blue-500 hover:bg-blue-400" onClick={exportCurrentData}>
                    Download Current Data
                </Button>
                <Button className="bg-purple-500 hover:bg-purple-400" onClick={() => exportToExcel("enroll-students-template", template)}>
                    Download Excel Template
                </Button>
                <label htmlFor="global-enroll-file" className="bg-green-600 hover:bg-green-500 px-2 py-2 rounded-md text-white text-sm font-medium flex items-center justify-center cursor-pointer">
                    Import Excel
                </label>
                <input ref={fileInputRef} type="file" id="global-enroll-file" hidden onChange={importStudent} />
            </div>
            {progress > 0 && <Progress value={progress} className="w-full" />}
            {enrollments.length < 1 ? (
                <EmptyMessage
                    text="There are no enrolled students. You can import students using the Excel template."
                    title="No Enrolled Students"
                />
            ) : (
                <Table className="mt-5">
                    <TableHeader className="p-5 items-center flex w-full">
                        <TableRow className="flex w-full text-xs">
                            <TableHead className="h-full w-[5%] font-medium text-center">No.</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Bootcamp</TableHead>
                            <TableHead className="h-full w-[15%] text-center">NIM</TableHead>
                            <TableHead className="h-full w-[25%] text-center">Name</TableHead>
                            <TableHead className="h-full w-[40%] text-center">Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="grid">
                        {sortedEnrollments.map((e, idx) => (
                            <TableRow
                                key={e.id}
                                className="shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full text-xs"
                            >
                                <TableCell className="w-[5%] font-medium text-center">
                                    {idx + 1}
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <TooltipLayout text={e.bootcamp?.short_name ?? "-"}>
                                        <p>{e.bootcamp?.short_name ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    {e.user?.nim ?? "-"}
                                </TableCell>
                                <TableCell className="w-[25%] text-center truncate">
                                    <TooltipLayout text={e.user?.name ?? "-"}>
                                        <p>{e.user?.name ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[40%] text-center truncate">
                                    <TooltipLayout text={e.user?.email ?? "-"}>
                                        <p>{e.user?.email ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}

export default GlobalEnrollmentGrid
