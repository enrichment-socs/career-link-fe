import React, {useEffect, useState} from 'react';
import {getAllRequestsEnrichmentData} from "~/features/student-enrichment-data/api/get-all-requests-enrichment-data";
import PageSpinner from "~/components/ui/page-spinner";
import type {ChangeDataRequest} from "~/types/api";
import {CiSearch} from "react-icons/ci";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import TooltipLayout from "~/components/layouts/tooltip-layout";
import {Pencil} from "lucide-react";
import {Button} from "~/components/ui/button";
import {format} from "date-fns";
import {Modal, type ModalType} from "~/components/modal";
import ApprovalChange_data_request from "~/features/student-enrichment-data/component/approval-change-data-request";
import ApprovalChangeDataRequest from "~/features/student-enrichment-data/component/approval-change-data-request";

const Requests = () => {

    const [changeDataRequests, setDataRequests] = useState<ChangeDataRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRequest, setSelectedRequest] = useState<ChangeDataRequest|null>(null)
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const fetchRequests = async () => {
        try {
            const {data: enrollments} = await getAllRequestsEnrichmentData()
            setDataRequests(enrollments)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const onSuccess = async () => {
        setActiveModal(null);
        setSelectedRequest(null);
        await fetchRequests()
    };

    useEffect(() => {
        fetchRequests()
    }, [])

    if (loading) return <PageSpinner />;

    return (
        <div className="w-full flex flex-col gap-5">
            <Modal
                title="Request Approval"
                isOpen={activeModal === "request"}
                onClose={() => setActiveModal(null)}
            >
                <ApprovalChangeDataRequest request={selectedRequest!} onSuccess={onSuccess}/>
            </Modal>

            <h2 className={'font-bold text-left w-full text-4xl text-slate-700 p-6 h-full'}>Student New / Change Data Requests</h2>

            <div className={'w-full flex flex-col gap-5 items-center'}>
                {/*<div className="flex gap-3 w-full items-center">*/}
                {/*    <div className="flex items-center border bg-white px-3 py-2 rounded-md flex-1 max-w-sm">*/}
                {/*        <CiSearch className="text-gray-500 text-xl"/>*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            placeholder="Search by NIM, name, or email..."*/}
                {/*            className="bg-transparent outline-none px-2 py-1 text-gray-600 w-full text-sm"*/}
                {/*            value={searchTerm}*/}
                {/*            onChange={(e) => setSearchTerm(e.target.value)}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*</div>*/}
                <Table className="mt-5">
                    <TableHeader className="p-5 items-center flex w-full">
                        <TableRow className="flex w-full text-xs">
                            <TableHead className="h-full w-[5%] font-medium text-center">No.</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Student NIM</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Student Name</TableHead>
                            <TableHead className="h-full w-[15%] text-center">New Company</TableHead>
                            <TableHead className="h-full w-[15%] text-center">New Position</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Enrichment Period</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Approval Status</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Request Date</TableHead>
                            <TableHead className="h-full w-[15%] text-center">Response Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="grid">
                        {changeDataRequests.map((cdr, idx) => (
                            <TableRow
                                key={cdr.id}
                                className="shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full text-xs"
                                onClick={() => {
                                    setSelectedRequest(cdr)
                                    setActiveModal("request")
                                }}
                            >
                                <TableCell className="w-[5%] font-medium text-center">
                                    {idx + 1}
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <TooltipLayout text={cdr.user?.nim ?? "-"}>
                                        <p>{cdr.user?.nim ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <TooltipLayout text={cdr.user?.name ?? "-"}>
                                        <p>{cdr.user?.name ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <TooltipLayout text={cdr.new_company ?? "-"}>
                                        <p>{cdr.new_company ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <TooltipLayout text={cdr.new_position ?? "-"}>
                                        <p>{cdr.new_position ?? "-"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <p>{cdr.enrichment_batch ?? "-"}</p>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <TooltipLayout text={cdr.approval_status ?? "No status"}>
                                        <p>{cdr.approval_status
                                            ? cdr.approval_status.charAt(0).toUpperCase() + cdr.approval_status.slice(1)
                                            : "No status"}</p>
                                    </TooltipLayout>
                                </TableCell>
                                <TableCell className="w-[15%] text-center truncate">
                                    <p>{format(cdr.created_at, "MMMM dd, yyyy") ?? "-"}</p>
                                </TableCell>

                                <TableCell className="w-[15%] text-center truncate">
                                    <p>{cdr.updated_at ? format(cdr.updated_at, "MMMM dd, yyyy") : "Not answered yet"}</p>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Requests;