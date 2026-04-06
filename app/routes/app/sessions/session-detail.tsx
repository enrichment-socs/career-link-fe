import AccordionLayout from "~/components/layouts/accordion-layout";
import TestCard from "~/components/test/test-card";
import { getBootcampSession } from "~/features/session/api/get-session";
import SessionCard from "~/components/session/session-card";
import AssignmentCard from "~/components/assignment/assignment-card";
import { TestType } from "~/types/enum";
import { getSessionTest } from "~/features/quiz/api/get-test-by-session";
import { getStudentAttemptByTest } from "~/features/quiz/api/attempt/get-student-attempt-by-test";
import { type EvaluationQuestion, type SessionTest, type Assignment, type AssignmentAnswer, type Attendance, type Session, type StudentAttempt, type StudentScore, type SessionData } from "~/types/api";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import { Modal, type ModalType } from "~/components/modal";
import EmptyMessage from "~/components/ui/empty-message";
import SessionTodolist from "~/features/session/components/session-todolist";
import { getAssignment } from "~/features/assignment/api/get-assignment";
import { getSessionDataBySession } from "~/features/session-data/api/session_data_by_session_id";
import { getAssignmentAnswerByUserAndAssignment } from "~/features/assignment/api/answer/get-assignment-answer-by-user-and-assignment";
import toast from "react-hot-toast";
import { getErrorMessage } from "~/lib/error";
import { createStudentAttendance } from "~/features/attendance/api/create-attendance";
import { getAttendanceByUserAndSession } from "~/features/attendance/api/get-attendance-by-user-and-session";
import { hasClockedIn, hasClockedOut } from "~/lib/validation";
import { format } from "date-fns";
import { getEvaluationQuestionBySession } from "~/features/evaluation/api/get-evaluation-question-by-session";
import type { Route } from "./+types/session-detail";
import { useAuth } from "~/lib/auth";
import TableLayout from "~/components/layouts/table-layout";
import { TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import PageSpinner from "~/components/ui/page-spinner";

export const loader = async ({ params }: Route.LoaderArgs) => {

    return {
        session: params.session
    }
};


const Session = ({loaderData}:Route.ComponentProps) => {

    const {user} = useAuth();

    const [session, setSession] = useState<Session>()
    const [sessionData, setSessionData] = useState<SessionData[]>([])
    const [assignment, setAssignment] = useState<Assignment>()
    const [preTest, setPretest] = useState<SessionTest>()
    const [postTest, setPosttest] = useState<SessionTest>()
    const [evaluationQuestions, setEvaluationQuestions] = useState<EvaluationQuestion[]>([])

    const [attemptsPretest, setAttemptPretest] = useState<StudentScore[]>([])
    const [attemptsPosttest, setAttemptPosttest] = useState<StudentScore[]>([])
    const [attendances, setAttendances] = useState<Attendance[]>([])
    const [activeModal, setActiveModal] = useState<ModalType>(null);    
    const revalidator = useRevalidator();
    const [loading, setLoading] = useState(true);
    
    
    const fetchAll = async () => {
        try {
            const { data: session } = await getBootcampSession(loaderData.session);
            setSession(session)

            const [
                {data: myAttendances},
                {data: tests},
                {data: sessionData},
                {data: evaluationQuestions},
                assignmentResult
            ] = await Promise.all([
                getAttendanceByUserAndSession(session.id, user?.id!),
                getSessionTest(session.id),
                getSessionDataBySession(session.id),
                getEvaluationQuestionBySession(loaderData.session),
                getAssignment(session.id).catch(() => ({data: undefined}))
            ])

            setAttendances(myAttendances)
            setSessionData(sessionData)
            setEvaluationQuestions(evaluationQuestions)
            setAssignment(assignmentResult.data)

            const preTest = tests.filter(e => e.type == TestType.PRE_TEST)[0]
            const postTest = tests.filter(e => e.type == TestType.POST_TEST)[0]
            setPretest(preTest)
            setPosttest(postTest)

            const [pretestResult, posttestResult] = await Promise.all([
                preTest ? getStudentAttemptByTest(preTest.id, user?.id!) : Promise.resolve({data: [] as StudentScore[]}),
                postTest ? getStudentAttemptByTest(postTest.id, user?.id!) : Promise.resolve({data: [] as StudentScore[]})
            ])

            setAttemptPretest(pretestResult.data)
            setAttemptPosttest(posttestResult.data)

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchAll()
    }, [user])
    
    if (loading) return <PageSpinner />;
    if (!session) return null



    const onSuccess = () => {
        setActiveModal(null);
        revalidator.revalidate();
    };


    const takeAttendance = async () => {
        const type = hasClockedIn(attendances) ? 'clock_out' : 'clock_in' as const;
        const toastId = toast.loading("Submitting Attendance...");
            try {
                
                const res = await createStudentAttendance({
                    data: {
                        attendance_type: type,
                        session_id: session.id,
                        user_id: user?.id!
                    }
                })
                setAttendances([...attendances, {
                    id: res.data.id,
                    attendance_type: type,
                    session_id: session.id,
                    user: user!,
                    finished_at: new Date()
                }])
                toast.success(res.message, { id: toastId });
                onSuccess()
            } catch (error) {
            toast.error(getErrorMessage(error), {
                id: toastId,
            });
        }
    }

    const attendanceHeader = () => (
        <TableHeader className="items-center flex w-full">
            <TableHead className="p-5 h-full w-1/2 text-center border-t-1 border-x-1 border-black">Clock in</TableHead>
            <TableHead className="p-5 h-full w-1/2 text-center border-t-1 border-x-1 border-black">Clock out</TableHead>
        </TableHeader>
    )

    const getAttendance = (type: 'clock_in' | 'clock_out') => format(attendances.filter(e => e.attendance_type == type).sort((a,b) => 
        new Date(type == 'clock_in'?a.finished_at:b.finished_at).getTime() - 
        new Date(type == 'clock_in'?b.finished_at:a.finished_at).getTime()
    )[0].finished_at, "dd/MM/yyyy HH:mm:ss")

    return (
    <>
        <Modal
            title={`Session Clock In / Clock Out`}
            isOpen={activeModal === "create"}
            onClose={() => setActiveModal(null)}
        >
            {attendances.length > 0 ? <TableLayout header={attendanceHeader()} className="w-full my-10">
                <TableRow className="grid grid-cols-2">
                    <TableCell className="p-5 text-center border-1 border-black">
                        <h4>{getAttendance('clock_in')}</h4>           
                    </TableCell>
                    <TableCell className="p-5 text-center border-1 border-black">
                        {attendances.length > 1 && 
                            <h4>{format(attendances.filter(e => e.attendance_type == 'clock_out').sort((a,b) => new Date(b.finished_at).getTime() - new Date(a.finished_at).getTime())[0].finished_at, "dd/MM/yyyy HH:mm:ss")}</h4>
                        }
                    </TableCell>
                </TableRow>
            </TableLayout>:<EmptyMessage 
                title="No Clock In / Clock Out yet." 
                text="You haven't clocked in/out. Please click the button below to take attendance."
            />}
            <Button 
                className="w-full mt-5"
                onClick={takeAttendance}
            >
                Clock {hasClockedIn(attendances) ? "Out" : "In"}
            </Button>
        </Modal>
        <div className={'flex flex-col w-full gap-y-4'}>
            <SessionCard 
                session={session}
            />
            <SessionTodolist 
                attendances={attendances}
                session={session} 
                sessionData={sessionData}
                assignment={assignment}
                attendanceOnClick={() => setActiveModal('create')} 
                attemptsPosttest={attemptsPosttest}
                attemptsPretest={attemptsPretest}
                postTest={postTest!}
                preTest={preTest!}
                evaluationQuestions={evaluationQuestions}
            />
        </div>
    </>
    )
}

export default Session