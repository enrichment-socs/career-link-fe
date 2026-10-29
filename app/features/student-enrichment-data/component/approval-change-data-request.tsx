import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "~/components/ui/form"
import { Button } from "~/components/ui/button"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import type {ChangeDataRequest, StudentEnrichmentData} from "~/types/api";
import {
    approvalChangeDataRequest,
    type ApprovalChangeDataRequestInput,
    approvalChangeDataRequestInputSchema
} from "~/features/student-enrichment-data/api/approval-request-enrichment-data";
import {ChangeDataRequestType} from "~/types/enum";
import Dropdown from "~/components/ui/dropdown";
import {useEffect, useState} from "react";
import {
    getStudentRequestsEnrichmentDataByUserAndBatch
} from "~/features/student-enrichment-data/api/get-student-enrichment-data-by-user-and-batch";

interface Props {
    request: ChangeDataRequest,
    onSuccess: () => void
}

const ApprovalChangeDataRequest = ({request, onSuccess}:Props) => {

    const [oldEnrichmentData, setOldEnrichmentData] = useState<StudentEnrichmentData>()

    const fetchOldEnrichmentData = async () => {
        try {
            const res = await getStudentRequestsEnrichmentDataByUserAndBatch(request.user_id,request.enrichment_batch)
            setOldEnrichmentData(res.data)
        } catch (error) {

        }
    }
    useEffect(() => {
        fetchOldEnrichmentData()
    }, []);

    const form = useForm<ApprovalChangeDataRequestInput>({
        resolver: zodResolver(approvalChangeDataRequestInputSchema),
        defaultValues: {
            id: request?.id,
            status: request?.approval_status
        }
    })

    const onSubmit = async (data:ApprovalChangeDataRequestInput) => {
        const toastId = toast.loading("Responding request...")

        try {
            const res = await approvalChangeDataRequest({data})
            toast.success(res.message, {id: toastId})
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error), {id: toastId})
        }
    }

    return (
        <div className={"flex flex-col gap-2"}>

            <div className="flex flex-col gap-3 text-sm">
                <p className="font-semibold text-gray-900">Student Detail</p>

                <div className="grid grid-cols-[160px_1fr] gap-y-2">
                    <p className="text-gray-500">NIM</p>
                    <p className="font-medium">: {request.user.nim}</p>

                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">: {request.user.name}</p>

                    <p className="text-gray-500">Major</p>
                    <p className="font-medium">: {request.user.major}</p>

                    <p className="text-gray-500">Enrichment Track</p>
                    <p className="font-medium">: {request.user.enrichment_track}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-500">
                        Old Data
                    </p>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Company</p>
                            <p className="font-medium text-gray-900">
                                {oldEnrichmentData?.company ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Position</p>
                            <p className="font-medium text-gray-900">
                                {oldEnrichmentData?.position ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Batch</p>
                            <p className="font-medium text-gray-900">
                                {oldEnrichmentData?.enrichment_batch ?? "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-500">
                        Requested
                    </p>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Company</p>
                            <p className="font-medium text-gray-900">
                                {request.new_company ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Position</p>
                            <p className="font-medium text-gray-900">
                                {request.new_position ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Batch</p>
                            <p className="font-medium text-gray-900">
                                {request.enrichment_batch ?? "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4 flex flex-col justify-center"}>
                    <Dropdown name={"status"} label={"Approval Status"} values={Object.values(ChangeDataRequestType).map((status) => ({
                        value: status,
                        text: status.charAt(0).toUpperCase() + status.slice(1),
                    }))}
                    defaultValue={request.approval_status}/>
                    <Button
                        type="submit"
                        disabled={(form.formState.isSubmitting || request.updated_at !== null)}
                    >{request.updated_at ? "Already answered" :"Answer Request"}</Button>
                </form>
            </Form>
        </div>
    )
}

export default ApprovalChangeDataRequest