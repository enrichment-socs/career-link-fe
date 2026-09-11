import { FaArrowLeft } from "react-icons/fa"
import { Link } from "react-router"
import { getAllEnrollments } from "~/features/enrollments/api/get-all-enrollments"
import GlobalEnrollmentGrid from "~/features/enrollments/components/global-enrollment-grid"
import { useEffect, useState } from "react"
import type { Enrollment } from "~/types/api"
import PageSpinner from "~/components/ui/page-spinner"

const GlobalEnrollments = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEnrollments = async () => {
        try {
            const { data: enrollments } = await getAllEnrollments()
            setEnrollments(enrollments)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEnrollments()
    }, [])

    if (loading) return <PageSpinner />

    return (
        <div className="w-full flex flex-col gap-5">
            <div className="w-full flex items-center">
                <Link to="/admin/bootcamps">
                    <button className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
                        <FaArrowLeft />
                    </button>
                </Link>
                <h2 className="font-bold text-left w-full text-4xl text-slate-700 p-6 h-full">
                    All Enrolled Students
                </h2>
            </div>
            <GlobalEnrollmentGrid enrollments={enrollments} onRefresh={fetchEnrollments} />
        </div>
    )
}

export default GlobalEnrollments
