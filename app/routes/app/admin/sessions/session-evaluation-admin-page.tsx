import EvaluationAdminGrid from "~/features/evaluation/components/evaluation-admin-grid"
import type { Route } from "./+types/session-evaluation-admin-page";
import { getEvaluationQuestionBySession } from "~/features/evaluation/api/get-evaluation-question-by-session";
import { useRevalidator } from "react-router";
import { useEffect, useState } from "react";
import { type EvaluationQuestion } from "~/types/api";
import PageSpinner from "~/components/ui/page-spinner";


export const loader = async ({ params }: Route.LoaderArgs) => {
    return {session: params.session}
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
        <>
           <EvaluationAdminGrid onSuccess={onSuccess} id="" sessionId={loaderData.session} questions={evaluationQuestions}/> 
        </>
    )
}

export default SessionEvaluationAdminPage