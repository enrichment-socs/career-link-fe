import { useRole } from "~/provider/role-testing-provider"
import { Button } from "../ui/button"
import { Modal, type ModalType } from "../modal"
import { useEffect, useState } from "react"
import { Link } from "react-router"
import CreateAssignment from "~/features/assignment/components/create-update-assignment"
import type { Assignment, AssignmentAnswer, AssignmentResult, Session } from "~/types/api"
import EmptyMessage from "../ui/empty-message"
import { AlertCircle } from "lucide-react"
import { createAssignmentAnswer } from "~/features/assignment/api/answer/create-assignment-answer"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import { updateAssignmentAnswer } from "~/features/assignment/api/answer/update-assignment-answer"
import { DeleteAssignment } from "~/features/assignment/components/delete-assignment"
import { useAuth } from "~/lib/auth"
import { getAssignmentAnswerByUserAndAssignment } from "~/features/assignment/api/answer/get-assignment-answer-by-user-and-assignment"
import { format } from "date-fns"

interface Props {
    session: Session,
    assignment?: Assignment | undefined,
    assignmentAnswer?: AssignmentAnswer | undefined,
    result?: AssignmentResult | undefined,
    onRefresh?: () => void,
}

const AssignmentCard = ({session, assignment, result, onRefresh}:Props) => {
    const [assignmentAnswer, setAssignmentAnswer] = useState<AssignmentAnswer>();
    const [answerLink, setAnswerLink] = useState("");
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const {user} = useAuth()

    const fetchAnswer = async () => {
        if (!assignment?.id || !user?.id) return;
        try {
            const {data: answers} = await getAssignmentAnswerByUserAndAssignment(assignment?.id ?? "", user?.id!)
            setAssignmentAnswer(answers)
            setAnswerLink(answers?.answer_file_path ?? "")
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAnswer()
    }, [user?.id, assignment?.id])

    const onSuccess = () => {
        setActiveModal(null);
        onRefresh?.();
    };

    const submitAnswerLink = async () => {
        if (!assignment?.id || !user?.id) return
        const trimmed = answerLink.trim()
        if (!trimmed) {
            toast.error("Answer link is required")
            return
        }
        const toastId = toast.loading("Submitting Answer...")
        try {
            const res = assignmentAnswer ? await updateAssignmentAnswer({
                data: {
                    answer_file_path: trimmed,
                    user_id: user?.id!,
                    assignment_id: assignment!.id,
                },
                id: assignmentAnswer.id
            }) : await createAssignmentAnswer({
                data: {
                    answer_file_path: trimmed,
                    user_id: user?.id!,
                    assignment_id: assignment!.id,
                }
            })
            toast.success(res.message, { id: toastId })
            onSuccess()
            setAssignmentAnswer({
                id: res.data.id,
                user_id: user?.id!,
                assignment_id: assignment?.id!,
                user: user!,
                answer_file_path: trimmed,
            })
        } catch (error) {
            toast.error(getErrorMessage(error), {
                id: toastId,
            })
        }
    }

    const {role} = useRole()
    console.log(assignmentAnswer)

    const getAssignmentLink = (path?: string) => {
        if (!path) return ""
        if (/^https?:\/\//i.test(path)) return path
        return `${import.meta.env.VITE_STORAGE_URL}${path}`
    }

    const isPastDeadline = assignment ? new Date().getTime() > new Date(assignment.close_date).getTime() : false

    return (
        <>
            <Modal 
                title={`${activeModal} Assignment`}
                isOpen={activeModal === "create" || activeModal === "update"}
                onClose={() => setActiveModal(null)}
            >
                <CreateAssignment assignment={assignment} onSuccess={onSuccess} sessionId={session.id} />
            </Modal>
            <Modal 
                title={`Delete Assignment`}
                isOpen={activeModal === "delete"}
                onClose={() => setActiveModal(null)}
            >
                <DeleteAssignment onSuccess={onSuccess} selectedCategory={assignment!} onClose={() => setActiveModal(null)} />
            </Modal>
            {assignment? <>
                <h4>Starts on : {format(assignment.open_date, "dd-MM-yyyy HH:mm")}</h4>
                <h4>Deadline  : {format(assignment.close_date, "dd-MM-yyyy HH:mm")}</h4>
                <p>
                    The assignment can be accessed <a href={getAssignmentLink(assignment.question_file_path)} target="_blank" className="text-blue-600 underline">here</a>.
                </p>
                {(user?.name == 'admin' || (assignment.is_shared && isPastDeadline)) ? <>
                    <p>
                        The assignment's answer can be accessed <a href={getAssignmentLink(assignment.answer_file_path)} target="_blank" className="text-blue-600 underline">here</a>.
                    </p>
                </>:<>
                    {isPastDeadline ? (
                        <p className="mt-5 text-red-600">
                            The submission deadline has passed. You can no longer submit a link.
                        </p>
                    ) : (
                    <p className="mt-5 text-red-600">
                        Please submit your answer as a public link. Recheck and make sure the link is accessible by anyone.
                    </p>
                    <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="https://..."
                            value={answerLink}
                            onChange={(e) => setAnswerLink(e.target.value)}
                        />
                        <Button onClick={submitAnswerLink} className="h-10">Submit Link</Button>
                    </div>
                    )}
                </>
                }
                {
                role == "user" && result ?
                    <div className="bg-green-200 border-green-700 border-1 p-3 rounded-md flex items-center gap-3 w-2/5">
                        <AlertCircle className="text-green-700" />
                        <p className="text-md font-bold text-green-700">
                            Your result: {result.result}
                        </p> 
                    </div>:
                    role == "user" && (!assignmentAnswer) && 
                    <div className="bg-red-200 border-red-700 border-1 p-3 rounded-md flex items-center gap-3 w-2/5">
                        <AlertCircle className="text-red-700" />
                        <p className="text-md font-bold text-red-700">
                            You haven't made any submission yet
                        </p> 
                    </div>
                }
            </>:
            <EmptyMessage text="There is no assignment. Please contact your instructor!" title="No Assignment Yet."/>
            }  
            {user?.name == 'admin' && <>
                <div className="flex gap-5 justify-start items-center">
                    
                    {assignment ? <>
                        <Link to={`assignment/${assignment.id}/answer`}>
                            <Button
                                className={'bg-purple-500 text-white rounded-md p-2 w-40 hover:bg-purple-700 transition duration-200 ease-in-out'}>
                                View Submissions
                            </Button>
                        </Link>
                        <Button
                        onClick={() => setActiveModal('update')}
                            className={'bg-[var(--accent)] text-white rounded-md p-2 w-40 hover:bg-[var(--secondary)] transition duration-200 ease-in-out'}>
                            Update
                        </Button>
                        <Button
                            onClick={() => setActiveModal('delete')}
                            className={'bg-red-500 text-white rounded-md p-2 w-40 hover:bg-red-700 transition duration-200 ease-in-out'}>
                            Delete
                        </Button>
                    </>:
                    <Button
                        className={'bg-slate-500 text-white rounded-md p-2 w-40 hover:bg-slate-700 transition duration-200 ease-in-out'}
                        onClick={() => setActiveModal('create')}
                    >
                        Add New Assignment
                    </Button>
                    }
                </div>
            </>}
        </>
    )
}

export default AssignmentCard