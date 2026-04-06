import { useRef, useState, type ChangeEvent } from "react"
import toast from "react-hot-toast"
import { Button } from "~/components/ui/button"
import { getErrorMessage } from "~/lib/error"
import { exportToExcel, importExcel } from "~/lib/excel"
import { createEvalQuestion } from "../api/create-evaluation-question"
import { Progress } from "~/components/ui/progress"
import type { EvaluationQuestion } from "~/types/api"
import EvaluationCard from "~/components/evaluation/question-admin-card"
import EmptyMessage from "~/components/ui/empty-message"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createEvalQuestionInputSchema, type CreateEvalQuestionInput } from "../api/create-evaluation-question"
import { Form } from "~/components/ui/form"
import Field from "~/components/ui/form-field"
import SelectField from "~/components/ui/select-field"


interface Template {
    number: number,
    question: string,
    type: string,
}


interface Props {
    sessionId: string,
    id: string,
    onSuccess: () => void,
    questions: EvaluationQuestion[]
}


const EvaluationAdminGrid = ({sessionId, id, onSuccess, questions}: Props) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0)

    const form = useForm<CreateEvalQuestionInput>({
        resolver: zodResolver(createEvalQuestionInputSchema),
        defaultValues: {
            question: "",
            session_id: sessionId,
            type: "ratio"
        }
    })

    const typeValues = [
        { value: "ratio", text: "Ratio" },
        { value: "text", text: "Text" }
    ]

    const handleCreate = async (data: CreateEvalQuestionInput) => {
        const toastId = toast.loading("Adding evaluation question...")
        try {
            await createEvalQuestion({ data })
            toast.success("Question added successfully", { id: toastId })
            form.reset({ question: "", session_id: sessionId, type: "ratio" })
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        }
    }

    const template: Template[]  = [{
        number: 1,
        question: "Rate your satisfaction on this bootcamp session",
        type: "ratio"
    }]
    const importEval =  (e:ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader()
        reader.onload = (event) => importExcel<Template>(event, async (res) => {
            const toastId = toast.loading(`Importing Test...`);
            try {
                for (let i = 0;i< res.length;i++){
                    setProgress(prev => prev + 100 / res.length);
                    await createEvalQuestion({ 
                        data: {
                            question: res[i].question,
                            session_id: sessionId,
                            type: res[i].type
                        }
                    });
                }
                setProgress(100);
                toast.success("Import Test Success!", { id: toastId })
                onSuccess()
            } catch (error) {
                toast.error(getErrorMessage(error), {
                    id: toastId,
                });
            }finally {
                setTimeout(() => {
                    setProgress(0)
                    if (fileInputRef.current){
                        fileInputRef.current.value = "";
                    }
                }, 3000);
            }
        })
        reader.readAsArrayBuffer(e.target.files![0])
    }
    

    return (
        <>
            <div className="flex justify-between items-start gap-10 w-full">
                <div className="w-3/5 p-2">
                    {progress > 0 && <Progress value={progress} className="w-full"/>}
                    <div className="flex flex-col gap-5">
                        {questions.length === 0 ? (
                            <EmptyMessage title="No Evaluation Questions" text="There are no evaluation questions for this session yet. Add one manually or import from Excel." />
                        ) : (
                            questions.map((e, idx) => (
                                <EvaluationCard key={e.id} onSuccess={onSuccess} idx={idx} question={e} />
                            ))
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-5 w-2/5">
                    <div className="bg-white rounded-lg shadow-md p-5">
                        <h3 className="text-lg font-semibold text-primary mb-4">Add Question</h3>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleCreate)} className="flex flex-col gap-4">
                                <Field control={form.control} label="Question" name="question" placeholder="e.g. Rate your satisfaction on this session" type="text" />
                                <SelectField control={form.control} label="Type" name="type" values={typeValues} />
                                <Button type="submit" disabled={form.formState.isSubmitting} className={form.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""}>
                                    {form.formState.isSubmitting ? "Adding..." : "+ Add Question"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                        <h3 className="text-lg font-semibold text-primary mb-4">Import from Excel</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => exportToExcel('template', template)} className="bg-purple-500 hover:bg-purple-400">
                                Download Template
                            </Button>
                            <label htmlFor="file" className="bg-green-600 hover:bg-green-500 px-2 text-sm rounded-md text-white flex items-center justify-center cursor-pointer">
                                Import Evaluation
                            </label>
                            <input type="file" name="" id="file" ref={fileInputRef} hidden onChange={importEval}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EvaluationAdminGrid