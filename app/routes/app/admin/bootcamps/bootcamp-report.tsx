import type { Route } from "./+types/bootcamp-report"
import { Link } from "react-router"
import { FaArrowLeft } from "react-icons/fa"
import BootcampReportGrid from "~/features/bootcamp-report/components/bootcamp-report-grid"
import { getBootcampReportByBootcampId } from "~/features/bootcamp-report/api/get-bootcamp-report-by-bootcamp-id"
import { getBootcampAssignmentAnswers, getBootcampEvaluationAnswers, getBootcampPosttestAnswers, getBootcampPretestAnswers } from "~/features/bootcamp-report/api/get-bootcamp-exports"
import { getBootcamp } from "~/features/bootcamp/api/get-bootcamp"
import { getCertificateByBootcamp } from "~/features/certificates/api/get-certificate-by-bootcamp"
import { useEffect, useState } from "react"
import { type Enrollment } from "~/types/api"
import { CertificateType } from "~/types/enum"
import PageSpinner from "~/components/ui/page-spinner"
import { Button } from "~/components/ui/button"
import toast from "react-hot-toast"
import { exportToExcel } from "~/lib/excel"

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {

    return {
        id: params.bootcamp, 
    }
}

const BootcampReport = ({loaderData}:Route.ComponentProps) => {

    const [certificates, setCertificates] = useState<Record<string, CertificateType[]>>({})
    const [sessionCount, setSessionCount] = useState(0)
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)
    const [bootcampName, setBootcampName] = useState("")


    const fetchBootcamp = async () => {
        try {
            const [
                {data: bootcamp},
                {data: certificates},
                {data: enrollments}
            ] = await Promise.all([
                getBootcamp(loaderData.id),
                getCertificateByBootcamp(loaderData.id),
                getBootcampReportByBootcampId(loaderData.id, true)
            ])

            const byUser = certificates.reduce<Record<string, CertificateType[]>>((acc, cert) => {
                if (!acc[cert.user_id]) acc[cert.user_id] = []
                acc[cert.user_id].push(cert.type as CertificateType)
                return acc
            }, {})
            setCertificates(byUser)
            setSessionCount(bootcamp.sessions.length)
            setEnrollments(enrollments)
            setBootcampName(bootcamp.short_name || bootcamp.name)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBootcamp()
    }, [])  

    if (loading) return <PageSpinner />;

    const exportAnswers = async (
        label: string,
        filename: string,
        loader: () => Promise<any[]>
    ) => {
        const toastId = toast.loading(`Preparing ${label} export...`)
        try {
            const data = await loader()
            if (!data.length) {
                toast.error(`No ${label} data found.`, { id: toastId })
                return
            }
            exportToExcel(filename, data)
            toast.success(`${label} export ready.`, { id: toastId })
        } catch (error) {
            console.error(error)
            toast.error(`Failed to export ${label}.`, { id: toastId })
        }
    }
    
    return (<>
    <div className="w-full">
        <div className={'w-full flex items-center'}>
            <Link to={`/bootcamps/${loaderData.id}`}>
                <button
                    className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
                    <FaArrowLeft/>
                </button>
            </Link>
            <h2 className={'font-bold text-left w-full text-4xl text-slate-700 p-6 h-full'}>Student Report Summary</h2>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => exportAnswers(
                        "pre-test answers",
                        `${bootcampName || loaderData.id}-pretest-answers`,
                        () => getBootcampPretestAnswers(loaderData.id)
                    )}
                >
                    Download Pre-Test
                </Button>
                <Button
                    variant="outline"
                    onClick={() => exportAnswers(
                        "post-test answers",
                        `${bootcampName || loaderData.id}-posttest-answers`,
                        () => getBootcampPosttestAnswers(loaderData.id)
                    )}
                >
                    Download Post-Test
                </Button>
                <Button
                    variant="outline"
                    onClick={() => exportAnswers(
                        "assignment answers",
                        `${bootcampName || loaderData.id}-assignment-answers`,
                        () => getBootcampAssignmentAnswers(loaderData.id)
                    )}
                >
                    Download Assignments
                </Button>
                <Button
                    variant="outline"
                    onClick={() => exportAnswers(
                        "evaluation answers",
                        `${bootcampName || loaderData.id}-evaluation-answers`,
                        () => getBootcampEvaluationAnswers(loaderData.id)
                    )}
                >
                    Download Evaluations
                </Button>
            </div>
        </div>
        <BootcampReportGrid bootcampid={loaderData.id} session={sessionCount} enrollments={enrollments} certificates={certificates} onRefresh={fetchBootcamp}/>
    </div>
    </>)
}

export default BootcampReport