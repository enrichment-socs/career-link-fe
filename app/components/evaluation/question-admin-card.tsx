import type { EvaluationQuestion } from "~/types/api"
import { Card } from "../ui/card"
import Field from "../ui/form-field"
import { Form } from "../ui/form"
import { useForm } from "react-hook-form"
import SelectField from "../ui/select-field"
import { Button } from "../ui/button"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import { updateEvalQuestion, type UpdateEvalQuestionInput } from "~/features/evaluation/api/update-evaluation-question"
import { deleteEvaluationQuestion } from "~/features/evaluation/api/delete-evaluation-question"
import { useState } from "react"
import { Textarea } from "../ui/textarea"

interface Props {
    idx: number,
    question: EvaluationQuestion
    onSuccess: () => void
}

const EvaluationCard = ({idx, question, onSuccess}:Props) => {

    let [isUpdating, setUpdating] = useState(false)

    let form = useForm<UpdateEvalQuestionInput>({
        defaultValues: question
    })

    const watchedType = form.watch("type")

    let types = [
        {
            value: "ratio",
            text: "Ratio"
        },
        {
            value: "text",
            text: "Text"
        }
    ]

    const handleSubmit = async (data: UpdateEvalQuestionInput) => {
        const toastId = toast.loading(`Updating evaluation question...`);
        try {
            await updateEvalQuestion({
                data,
                id: question.id,
            })

            toast.success("Update evaluation question success", { id: toastId })
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error), {
            id: toastId,
            });
        }
    }

    let onDelete = async (question: EvaluationQuestion) => {
        setUpdating(false)
        const toastId = toast.loading(`Deleting evaluation question...`);

        try {
            await deleteEvaluationQuestion(question.id)
            toast.success("Delete evaluation question success", { id: toastId })
            
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error), {
            id: toastId,
            });
        }
    }

    let onSelect = (question:EvaluationQuestion) => {
        form.setValue('id', question.id)
        form.setValue('question', question.question)
        form.setValue('type', question.type)
        setUpdating(true)
    }

    return (
        <Card className="flex flex-row p-4 gap-2 w-full">
            <div className="w-full">
                <Form {...form}>
                    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className="flex justify-between w-full items-center gap-5 border-b-1 pb-5">
                            <h4 className="text-slate-700 text-xl font-bold p-0 m-0">{idx+1}.</h4>
                            
                            <div className="w-3/5" onClick={() => onSelect(question)}>
                                {!isUpdating? 
                                    <p>{question.question}</p>
                                    :
                                    <Field control={form.control} label="" name="question" placeholder="Question" />
                                }
                            </div>
                            <div className="w-1/5 flex justify-center items-center">
                                <SelectField control={form.control} label="" name="type" values={types}/>
                            </div>
                        </div>
                        <div className="w-full px-2">
                            <p className="text-xs text-slate-400 mb-2">Preview</p>
                            {watchedType === "ratio" ? (
                                <div className="flex justify-between w-full">
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <div key={index} className="flex gap-2 flex-col items-center">
                                            <h4 className="text-slate-400 text-sm font-bold">{index + 1}</h4>
                                            <input type="radio" disabled name={`preview-${idx}`} className="accent-primary opacity-50" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Textarea disabled placeholder="Student will type their answer here..." className="resize-none opacity-50 text-sm" />
                            )}
                        </div>
                        <div className="flex w-full gap-5 justify-end">
                            <Button className="w-1/5">Update</Button>
                            <Button className="w-1/5" variant={"destructive"} type="button" onClick={() => onDelete(question)}>Remove</Button>
                        </div>
                    </form>
                </Form>
            </div>
            

        </Card>
    )
}

export default EvaluationCard