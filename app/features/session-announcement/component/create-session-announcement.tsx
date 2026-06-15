import { useForm } from "react-hook-form"
import { createSessionAnnouncement, type CreateSessionAnnouncementInput, createSessionAnnouncementInputSchema } from "../api/create-session-announcement"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Session } from "~/types/api"
import { Form } from "~/components/ui/form"
import Field from "~/components/ui/form-field"
import { Button } from "~/components/ui/button"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import FileField from "~/components/ui/file-field";
import {useState} from "react";

interface Props {
    session:Session,
    onSuccess: () => void
}

const CreateSessionAnnouncement = ({session, onSuccess}:Props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const form = useForm<CreateSessionAnnouncementInput>({
        resolver: zodResolver(createSessionAnnouncementInputSchema),
        defaultValues: {
            title: '',
            description: '',
            session_id: session.id
        }
    })

    const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setFileType(file.type);
        }
    };

    const onSubmit = async (data:CreateSessionAnnouncementInput) => {
        const toastId = toast.loading("Creating session announcement...")

        try {
            const res = await createSessionAnnouncement({data})
            toast.success(res.message, {id: toastId})
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error), {id: toastId})
        }
    }

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
                <Button>Create</Button>
            </form>
        </Form>
    </>)
}

export default CreateSessionAnnouncement;