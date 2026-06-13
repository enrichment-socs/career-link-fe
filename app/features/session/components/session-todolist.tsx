import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {Link, useRevalidator} from "react-router";
import AssignmentCard from "~/components/assignment/assignment-card";
import EvaluationCard from "~/components/evaluation/question-user-card";
import AccordionLayout from "~/components/layouts/accordion-layout";
import SessionDataCard from "~/components/session/session-data-card";
import TestCard from "~/components/test/test-card";
import { Button } from "~/components/ui/button";
import EmptyMessage from "~/components/ui/empty-message";
import { Progress } from "~/components/ui/progress";
import { createEvalAnswer } from "~/features/evaluation/api/create-evaluation-answer";
import { getErrorMessage } from "~/lib/error";
import {
  hasClockedOut,
} from "~/lib/validation";
import { useRole } from "~/provider/role-testing-provider";
import type {
  Assignment,
  AssignmentAnswer,
  Attendance,
  EvaluationQuestion,
  Session, SessionAnnouncement,
  SessionData,
  SessionTest,
  StudentAttempt,
  StudentScore,
} from "~/types/api";
import { TestType } from "~/types/enum";
import {Modal, type ModalType} from "~/components/modal";
import CreateSessionAnnouncement from "~/features/session-announcement/component/create-session-announcement";
import UpdateSessionAnnouncement from "~/features/session-announcement/component/update-session-announcement";
import {deleteSessionAnnouncement} from "~/features/session-announcement/api/delete-session-announcement";
import {deleteSession} from "~/features/session/api/delete-session";

interface Props {
  attendanceOnClick: () => void;
  session: Session;
  attendances: Attendance[];
  announcement: SessionAnnouncement | undefined;
  sessionData: SessionData[];
  preTest: SessionTest;
  postTest: SessionTest;
  assignment?: Assignment | undefined;
  attemptsPretest: StudentScore[];
  attemptsPosttest: StudentScore[];
  evaluationQuestions: EvaluationQuestion[];
  onRefresh?: () => void;
}

const SessionTodolist = ({
  attendanceOnClick,
  attendances,
  announcement,
  session,
  sessionData,
  preTest,
  postTest,
  assignment,
  attemptsPretest,
  attemptsPosttest,
  evaluationQuestions,
  onRefresh,
}: Props) => {
  const { role } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>(evaluationQuestions.map(_ => ""))
  const [progress, setProgress] = useState(0)
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const revalidator = useRevalidator();

  const setAnswer = (idx:number, answer:string) => {
    setAnswers((prev) => {
      console.log(answer)
      prev[idx] = answer
      return prev
    })
  }

  const onSubmit = async (e:FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading(`Submitting Evaluation...`);

    try {
      console.log(answers)
      for(let i = 0;i < evaluationQuestions.length;i++){
        await createEvalAnswer({ 
          data: {
            question_id: evaluationQuestions[i].id,
            session_id: session.id,
            answer: answers[i],
          }
        });
        setProgress(prev => prev + 100 / evaluationQuestions.length);
      }
      setProgress(100);
      toast.success("Evaluation Submitted!", { id: toastId })
    } catch (error) {
      toast.error(getErrorMessage(error), {
          id: toastId,
      });
    }finally{
      setAnswers(evaluationQuestions.map(_ => ""))
      setTimeout(() => {
          setProgress(0)
      }, 3000);
    }
  }

  const onDeleteSessionAnnouncement = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Deleting session announcement...");

    try {
      if (announcement) await deleteSessionAnnouncement(announcement.id)
      toast.success("Delete session announcement success", { id: toastId });

      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const onSuccess = () => {
    setActiveModal(null);
    revalidator.revalidate();
    onRefresh?.();
  };

  return (
    <>
      <div className={"flex flex-col gap-y-4 mb-8"}>
        {role == "user" ? (
          !hasClockedOut(attendances) && (
            <Button onClick={attendanceOnClick} className="cursor-pointer py-6">
              Session Clock In / Clock Out
            </Button>
          )
        ) : (
          <Link to={`attendance`}>
            <Button className="w-1/6">View Attendances</Button>
          </Link>
        )}

        {announcement ? (
            <AccordionLayout text={"Announcement"} defaultValue={"Announcement"}>
              <h2 className="font-bold text-xl mb-2">{announcement.title}</h2>
              <h4>{announcement.description}</h4>
              {announcement.file_path }
              {role == "admin" && (
                  <div className={"flex flex-row gap-x-4"}>
                    <Button onClick={() => {setActiveModal('update') }}>Update Announcement</Button>
                    <Button
                        variant="destructive"
                        onClick={() => {setActiveModal('delete') }}
                    >Delete Announcement</Button>
                  </div>
              )}
            </AccordionLayout>
        ) : (
            <>
              {role == "admin" && (
                  <Button onClick={() => {setActiveModal('create') }}>Create Announcement</Button>
              )}
            </>
        )}

        {role == "admin" && !announcement && (
            <Modal
                title={"Create Announcement"}
                isOpen={activeModal === "create"}
                onClose={() => {setActiveModal(null)}}
            >
              <CreateSessionAnnouncement onSuccess={onSuccess} session={session} />
            </Modal>
        )}

        {announcement && (
            <Modal
                title={"Delete Announcement"}
                isOpen={activeModal === "delete"}
                onClose={() => {
                  setActiveModal(null)
                }}
            >
              <div className={"flex flex-col gap-4 justify-center"}>
                <p className={"text-center"}>Are you sure to delete this announcement?</p>
                <Button
                    variant="destructive"
                    onClick={onDeleteSessionAnnouncement}
                >Delete</Button>
              </div>
            </Modal>
        )}
        {announcement && (
            <Modal
                title={"Update Announcement"}
                isOpen={activeModal === "update"}
                onClose={() => {
                  setActiveModal(null)
                }}
            >
              <UpdateSessionAnnouncement onSuccess={onSuccess} session={session} sessionAnnouncement={announcement}/>
            </Modal>
        )}

        <h2
            className={
              "font-semibold text-left text-3xl text-slate-700 w-full h-full mt-6"
          }
        >
          To-Do List
        </h2>

        {(preTest || role == 'admin') && (
            <AccordionLayout text={"Pre Test"}>
              <TestCard
                  testType={TestType.PRE_TEST}
                  sessionId={session.id}
                  test={preTest}
                  attempts={attemptsPretest}
                  onRefresh={onRefresh}
              />
            </AccordionLayout>
        )}
        {(sessionData.length > 0 || role == 'admin') && (
            <AccordionLayout
                text={"Material"}
                isLocked={role == "user" && (!preTest || (preTest && attemptsPretest.length < 1))}
                lockedMessage={`${preTest ? "Complete the Pre Test to unlock this section." : "No pre-test yet."}`}
            >
              <SessionDataCard sessionData={sessionData} session={session} onRefresh={onRefresh} />
            </AccordionLayout>
        )}

        {(postTest || role == 'admin') && (
            <AccordionLayout
                text={"Post Test"}
                isLocked={
                    role == "user" &&
                    (!preTest || (preTest && attemptsPretest.length < 1) || attendances.length < 1)
                }
                lockedMessage={`${postTest ? "Complete the Pre Test and Clock In to unlock this section." : "No post-test yet."}`}
            >
              <TestCard
                  testType={TestType.POST_TEST}
                  sessionId={session.id}
                  test={postTest}
                  attempts={attemptsPosttest}
                  onRefresh={onRefresh}
              />
            </AccordionLayout>
        )}

        {(assignment || role == 'admin') && (
            <AccordionLayout
                text={"Assignment"}
                isLocked={role == "user" && (!postTest || (postTest && attemptsPretest.length < 1))}
                lockedMessage={`${postTest ? "Complete the Post Test to unlock this section." : "No assignment yet."}`}
            >
              <AssignmentCard
                  session={session}
                  assignment={assignment}
                  onRefresh={onRefresh}
              />
            </AccordionLayout>
        )}
        
        <AccordionLayout text={"Evaluation"} isLocked={false}>
          {progress > 0 && <Progress value={progress} className="w-full"/>}
          {role == "admin" ? (
            <Button className={"p-2 w-40 bg-purple-600 hover:bg-purple-500"}>
              <Link to={"evaluation"}>Manage Evaluation</Link>
            </Button>
          ) : (
              evaluationQuestions.length > 0 ?
              <form onSubmit={onSubmit}>
                  {evaluationQuestions.map((e, idx) => (
                    <EvaluationCard idx={idx} question={e} setAnswer={setAnswer}/>
                  ))}
                  <Button>Submit</Button>
              </form>
              :
              <>
                <EmptyMessage text="There is no evaluation. Please contact your instructor!" title="No evaluation form yet."/>
              </>
          )}
        </AccordionLayout>
      </div>
    </>
  );
};

export default SessionTodolist;
