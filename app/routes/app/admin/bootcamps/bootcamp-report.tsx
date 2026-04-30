import type { Route } from "./+types/bootcamp-report"
import { Link } from "react-router"
import { FaArrowLeft } from "react-icons/fa"
import BootcampReportGrid from "~/features/bootcamp-report/components/bootcamp-report-grid"
import { getBootcampReportByBootcampId } from "~/features/bootcamp-report/api/get-bootcamp-report-by-bootcamp-id"
import { getBootcamp } from "~/features/bootcamp/api/get-bootcamp"
import { getCertificateByBootcamp } from "~/features/certificates/api/get-certificate-by-bootcamp"
import { useEffect, useState } from "react"
import { type Enrollment } from "~/types/api"
import { CertificateType } from "~/types/enum"
import PageSpinner from "~/components/ui/page-spinner"

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
        </div>
        <BootcampReportGrid bootcampid={loaderData.id} session={sessionCount} enrollments={enrollments} certificates={certificates} onRefresh={fetchBootcamp}/>
    </div>
    </>)
}

export default BootcampReport