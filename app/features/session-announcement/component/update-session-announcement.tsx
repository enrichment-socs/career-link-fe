import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type {Session, SessionAnnouncement} from "~/types/api"
import { Form } from "~/components/ui/form"
import Field from "~/components/ui/form-field"
import { Button } from "~/components/ui/button"
import toast from "react-hot-toast"
import { getErrorMessage } from "~/lib/error"
import { updateSessionAnnouncement, updateSessionAnnouncementInputSchema, type UpdateSessionAnnouncementInput } from "../api/update-session-announcement"

interface Props {
    session:Session,
    sessionAnnouncement: SessionAnnouncement,
    onSuccess: () => void
}

const UpdateSessionAnnouncement = ({session, sessionAnnouncement, onSuccess}:Props) => {

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

    return (<>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4 flex flex-col justify-center"}>
                <Field control={form.control} label="Title" name="title" placeholder="Ex. Introduction" />
                <Field control={form.control} label="Description" name="description" placeholder="This session is discussing about..." />
                <Field control={form.control} placeholder="Attach File" label="File" type="file" name="file" />
                <Button>Update</Button>
            </form>
        </Form>
    </>)
}

export default UpdateSessionAnnouncement;