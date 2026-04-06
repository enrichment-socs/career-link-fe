import { getAssignmentAnswerByAssignment } from "~/features/assignment/api/answer/get-assignment-answer-by-assignment"
import type { Route } from "./+types/assignment-answers"
import { Link } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { type Enrollment, type AssignmentAnswer, type AssignmentResult } from "~/types/api";
import { getAssignmentResultByAssignment } from "~/features/assignment/api/result/get-assignment-result-by-assignment";
import { getEnrollmentByBootcamp } from "~/features/enrollments/api/get-enrollment-by-bootcamp";
import { useEffect, useState } from "react";
import AssignmentAnswerGrid from "~/features/assignment/components/assignment-answer-grid";
import PageSpinner from "~/components/ui/page-spinner";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
    return {
        assignment: params.assignment, 
        session: params.session, 
        bootcamp: params.bootcamp
    }
}


const AssignmentAnswers = ({loaderData}:Route.ComponentProps) => {

    const {assignment, session, bootcamp} = loaderData

    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [answers, setAnswers] = useState<Record<string, AssignmentAnswer>>({})
    const [results, setResults] = useState<Record<string, AssignmentResult>>({})
    const [loading, setLoading] = useState(true)
    
    
    const fetchData = async () => {
        try {
            const [
                {data: answers},
                {data: results},
                {data: enrollments}
            ] = await Promise.all([
                getAssignmentAnswerByAssignment(assignment).catch(() => ({data: [] as AssignmentAnswer[]})),
                getAssignmentResultByAssignment(assignment).catch(() => ({data: [] as AssignmentResult[]})),
                getEnrollmentByBootcamp(bootcamp).catch(() => ({data: [] as Enrollment[]}))
            ])

            setAnswers(answers.reduce((acc, item) => {
                acc[item.user_id] = item;
                return acc;  
            }, {} as Record<string, AssignmentAnswer>))
            setResults(results.reduce((acc, item) => {
                acc[item.user_id] = item;
                return acc;
            }, {} as Record<string, AssignmentResult>))
            setEnrollments(enrollments)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) return <PageSpinner />;

    return (
    <div className="flex flex-col w-full gap-y-4 bg-white rounded-lg shadow-md p-5">
            <div className={'w-full flex items-center'}>
                <Link to={`/bootcamps/${bootcamp}/session/${session}`}>
                    <button
                        className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
                        <FaArrowLeft/>
                    </button>
                </Link>
                <h2 className={'font-bold text-left w-full text-4xl text-slate-700 p-6 h-full'}>Assignment Answers</h2>
            </div>
            
            <AssignmentAnswerGrid   
                assignment={assignment}
                enrollments={enrollments}
                results={results}
                answers={answers}
                onRefresh={fetchData}
            />
    </div>)
}

export default AssignmentAnswers