import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import AssignmentCard from "~/components/assignment/assignment-card";
import EvaluationCard from "~/components/evaluation/question-user-card";
import AccordionLayout from "~/components/layouts/accordion-layout";
import SessionDataCard from "~/components/session/session-data-card";
import TestCard from "~/components/test/test-card";
import { Button } from "~/components/ui/button";
import EmptyMessage from "~/components/ui/empty-message";
import { Form } from "~/components/ui/form";
import { Progress } from "~/components/ui/progress";
import { createEvalAnswer } from "~/features/evaluation/api/create-evaluation-answer";
import { getEvaluationAnswerBySessionAndUser } from "~/features/evaluation/api/get-evaluation-answer-by-session-user";
import { updateEvalAnswer } from "~/features/evaluation/api/update-evaluation-answer";
import { getErrorMessage } from "~/lib/error";
import { useAuth } from "~/lib/auth";
import {
  hasClockedOut,
} from "~/lib/validation";
import { useRole } from "~/provider/role-testing-provider";
import type {
  Assignment,
  Attendance,
  EvaluationAnswer,
  EvaluationQuestion,
  Session,
  SessionData,
  SessionTest,
  StudentAttempt,
  StudentScore,
} from "~/types/api";
import { TestType } from "~/types/enum";

interface Props {
  attendanceOnClick: () => void;
  session: Session;
  attendances: Attendance[];
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
  const { user } = useAuth();
  const [answers, setAnswers] = useState<string[]>(evaluationQuestions.map(_ => ""))
  const [answerIds, setAnswerIds] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)


  const setAnswer = (idx:number, answer:string) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[idx] = answer
      return next
    })
  }

  const loadEvaluationAnswers = async () => {
    if (role !== "user" || !user?.id || !session?.id) return
    try {
      const { data } = await getEvaluationAnswerBySessionAndUser(session.id, user.id)
      const answersByQuestion: Record<string, EvaluationAnswer> = {}
      data.forEach((item) => {
        answersByQuestion[item.question_id] = item
      })

      setAnswerIds(Object.fromEntries(data.map((item) => [item.question_id, item.id])))
      setAnswers(evaluationQuestions.map((q) => answersByQuestion[q.id]?.answer ?? ""))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (evaluationQuestions.length === 0) return
    setAnswers(evaluationQuestions.map(() => ""))
    setAnswerIds({})
    loadEvaluationAnswers()
  }, [evaluationQuestions, session?.id, user?.id, role])

  const onSubmit = async (e:FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading(`Submitting Evaluation...`);

    try {
      console.log(answers)
      for (let i = 0; i < evaluationQuestions.length; i++) {
        const question = evaluationQuestions[i]
        const payload = {
          question_id: question.id,
          session_id: session.id,
          user_id: user?.id!,
          answer: answers[i],
        }
        const existingId = answerIds[question.id]

        if (existingId) {
          await updateEvalAnswer({ id: existingId, data: payload })
        } else {
          await createEvalAnswer({ data: payload })
        }

        setProgress(prev => prev + 100 / evaluationQuestions.length);
      }
      setProgress(100);
      toast.success("Evaluation Submitted!", { id: toastId })
      await loadEvaluationAnswers()
    } catch (error) {
      toast.error(getErrorMessage(error), {
          id: toastId,
      });
    } finally {
      setTimeout(() => {
          setProgress(0)
      }, 3000);
    }
  }

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
        <h2
          className={
            "font-semibold text-left text-3xl text-slate-700 w-full h-full mt-6"
          }
        >
          To-Do List
        </h2>
        <AccordionLayout text={"Pre Test"}>
          <TestCard
            testType={TestType.PRE_TEST}
            sessionId={session.id}
            test={preTest}
            attempts={attemptsPretest}
            onRefresh={onRefresh}
          />
        </AccordionLayout>
        <AccordionLayout
          text={"Material"}
          isLocked={role == "user" && attemptsPretest.length < 1}
          lockedMessage="Complete the Pre Test to unlock this section."
        >
          <SessionDataCard sessionData={sessionData} session={session} onRefresh={onRefresh} />
        </AccordionLayout>
        <AccordionLayout
          text={"Post Test"}
          isLocked={
            role == "user" &&
            (attemptsPretest.length < 1 || attendances.length < 1)
          }
          lockedMessage="Complete the Pre Test and Clock In to unlock this section."
        >
          <TestCard
            testType={TestType.POST_TEST}
            sessionId={session.id}
            test={postTest}
            attempts={attemptsPosttest}
            onRefresh={onRefresh}
          />
        </AccordionLayout>
        <AccordionLayout
          text={"Assignment"}
          isLocked={role == "user" && attemptsPosttest.length < 1}
          lockedMessage="Complete the Post Test to unlock this section."
        >
          <AssignmentCard
            session={session}
            assignment={assignment}
            onRefresh={onRefresh}
          />
        </AccordionLayout>
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
                    <EvaluationCard key={e.id} idx={idx} question={e} value={answers[idx] ?? ""} setAnswer={setAnswer}/>
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
