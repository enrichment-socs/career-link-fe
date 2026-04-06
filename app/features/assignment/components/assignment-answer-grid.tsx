import { useRef, useState, useMemo, type ChangeEvent } from "react";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import { exportToExcel, importExcel } from "~/lib/excel";
import type { AssignmentAnswer, AssignmentResult, Enrollment } from "~/types/api";
import { AssignmentResultType } from "~/types/enum";
import { updateAssignmentResult } from "../api/result/update-assignment-result";
import { createAssignmentResult } from "../api/result/create-assignment-result";
import { getErrorMessage } from "~/lib/error";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { DefaultTableHeader } from "~/components/ui/table-header";
import TableLayout from "~/components/layouts/table-layout";
import EmptyMessage from "~/components/ui/empty-message";
import AssignmentAnswerRow from "~/components/assignment/assignment-answer-row";

interface Props {
    assignment: string;
    enrollments: Enrollment[];
    results: Record<string, AssignmentResult>;
    answers: Record<string, AssignmentAnswer>;
    onRefresh?: () => void;
}

interface Template {
    nim: string,
    name: string,
    result: AssignmentResultType,
}

const AssignmentAnswerGrid = ({assignment, enrollments, results, answers, onRefresh}:Props) => {

    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEnrollments = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return enrollments;
        return enrollments.filter((e) =>
            (e.user.nim ?? "").toLowerCase().includes(term) ||
            e.user.name.toLowerCase().includes(term)
        );
    }, [enrollments, searchTerm]);
    

    const mappingGrade=  async (res:Template[]) => {
        const toastId = toast.loading("Grading students...");
        try {
            for (let i = 0; i < res.length; i++){
                if (res[i].result !== AssignmentResultType.NO_FILE){
                    const user = enrollments[i].user
                    const data = {
                        result: res[i].result,
                        user_id: user.id,
                        assignment_id: assignment,
                    }
                    if (results[user.id]){
                        await updateAssignmentResult({ data, id: results[user.id].id })
                    }else{
                        await createAssignmentResult({ data })
                    }
                }
                setProgress(prev => prev + 100 / res.length);
            }
            toast.success("Student grades has successfully imported", { id: toastId });
            setTimeout(() => {
                setProgress(0)
                onRefresh?.()
            }, 3000);
        } catch (error) {
        toast.error(getErrorMessage(error), {
            id: toastId,
        });
        }finally{
            if (fileInputRef.current){
                fileInputRef.current.value = "";
            }
        }

    }
    
    const importGrade = (e:ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader()
        reader.onload = (event) => importExcel<Template>(event, (res) => mappingGrade(res))
        reader.readAsArrayBuffer(e.target.files![0])
    }
    
    const exportGrading = (type: "result" | "template") => {
        exportToExcel(`${assignment}-grading-template`, enrollments.map(e => ({
            nim: e.user.nim ?? "-",
            name: e.user.name,
            result: answers[e.user_id] ? (results[e.user_id]? results[e.user_id].result : "") : "No file",
        })))
    }

    return (
        <>
            <div className="flex gap-3">
                <div className="flex items-center border bg-white px-3 py-2 rounded-md flex-1 max-w-sm">
                    <CiSearch className="text-gray-500 text-xl" />
                    <input
                        type="text"
                        placeholder="Search by NIM or name..."
                        className="bg-transparent outline-none px-2 py-1 text-gray-600 w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => exportGrading('result')} className="w-1/5 bg-slate-600 hover:bg-slate-500">Export</Button>
                <Button className="w-1/5 bg-orange-600 hover:bg-orange-500" onClick={() => exportGrading('template')}>Download Grading Template</Button>
                <label htmlFor="file" className="bg-green-600 hover:bg-green-500 px-2 w-1/5 rounded-md text-white text-sm font-medium flex items-center justify-center">
                    Import Excel
                </label>
                <input ref={fileInputRef} type="file" name="" id="file" hidden onChange={importGrade}/>
            </div>
            {progress > 0 && <Progress value={progress} className="w-full"/>}
            <TableLayout header={<DefaultTableHeader columns={["NIM", "Name", "Answer", "Result"]}/>}>
                {
                enrollments.length < 1?
                <EmptyMessage title="No Student" text="There is no students yet."/>:
                filteredEnrollments.map(e => 
                    <AssignmentAnswerRow 
                        user={e.user}
                        assignment_id={assignment}
                        answerFilePath={answers[e.user_id] ? answers[e.user_id].answer_file_path : undefined}
                        result={results[e.user_id]}
                        onRefresh={onRefresh}
                    />
                )
                }
            </TableLayout>
        </>
    )
}

export default AssignmentAnswerGrid;