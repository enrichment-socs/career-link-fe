import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type {Session, SessionAnnouncement} from "~/types/api"
import { Form } from "~/components/ui/form"
import Field from "~/components/ui/form-field"
import { Button } from "~/components/ui/button"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import { updateSessionAnnouncement, updateSessionAnnouncementInputSchema, type UpdateSessionAnnouncementInput } from "../api/update-session-announcement"
import {useState} from "react";
import FileField from "~/components/ui/file-field";

interface Props {
    session:Session,
    sessionAnnouncement: SessionAnnouncement,
    onSuccess: () => void
}

const UpdateSessionAnnouncement = ({session, sessionAnnouncement, onSuccess}:Props) => {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);

    const form = useForm<UpdateSessionAnnouncementInput>({
        resolver: zodResolver(updateSessionAnnouncementInputSchema),
        defaultValues: {
            title: sessionAnnouncement.title,
            description: sessionAnnouncement.description,
            session_id: session.id
        }
    })

    const onSubmit = async (data:UpdateSessionAnnouncementInput) => {
        const toastId = toast.loading("Updating session announcement...")
        try {
            const res = await updateSessionAnnouncement({data, id:sessionAnnouncement.id})
            toast.success(res.message, {id: toastId})
        } catch (error) {
            toast.error(getErrorMessage(error), {id: toastId})
            
        }
        onSuccess()
    }

    const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setFileType(file.type);
        }
    };

    return (<>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4 flex flex-col justify-center"}>
                <Field control={form.control} label="Title" name="title" placeholder="Ex. Introduction" />
                <Field control={form.control} label="Description" name="description" placeholder="This session is discussing about..." />
                <FileField
                    control={form.control}
                    handlePreview={handleImagePreview}
                    label="Attach File"
                    name="file"
                />
                {previewUrl && (
                    <div className="mt-4">
                        {fileType === "application/pdf" ? (
                            <embed
                                src={previewUrl}
                                type="application/pdf"
                                className="w-full h-96 rounded-md border"
                            />
                        ) : (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full max-h-32 object-cover rounded-md border"
                            />
                        )}
                    </div>
                )}
                <Button>Update</Button>
            </form>
        </Form>
    </>)
}

export default UpdateSessionAnnouncement;