import EvaluationAdminGrid from "~/features/evaluation/components/evaluation-admin-grid"
import type { Route } from "./+types/session-evaluation-admin-page";
import { getEvaluationQuestionBySession } from "~/features/evaluation/api/get-evaluation-question-by-session";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { type EvaluationQuestion } from "~/types/api";
import PageSpinner from "~/components/ui/page-spinner";
import { FaArrowLeft } from "react-icons/fa";


export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
    return {session: params.session, bootcamp: params.bootcamp}
};

const SessionEvaluationAdminPage = ({loaderData}:Route.ComponentProps) => {


    const [evaluationQuestions, setEvaluationQuestions] = useState<EvaluationQuestion[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEvaluationQuestions = async () => {
        try {
            let {data: evaluationQuestions} = await getEvaluationQuestionBySession(loaderData.session)
            setEvaluationQuestions(evaluationQuestions)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvaluationQuestions()
    }, [])

    const onSuccess = async () => {
        await fetchEvaluationQuestions()
    }

    if (loading) return <PageSpinner />;

    return (
        <div className="flex flex-col w-full gap-5">
            <div className={'w-full flex items-center'}>
                <Link to={`/bootcamps/${loaderData.bootcamp}/session/${loaderData.session}`}>
                    <button
                        className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
                        <FaArrowLeft/>
                    </button>
                </Link>
                <h2 className={'font-bold text-left w-full text-4xl text-slate-700 p-6 h-full'}>Manage Evaluation</h2>
            </div>
            <EvaluationAdminGrid onSuccess={onSuccess} id="" sessionId={loaderData.session} questions={evaluationQuestions}/>
        </div>
    )
}

export default SessionEvaluationAdminPage