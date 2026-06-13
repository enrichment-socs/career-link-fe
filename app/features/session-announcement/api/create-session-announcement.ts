import { z } from "zod";
import { api } from "~/lib/api-client";

export const createSessionAnnouncementInputSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    file: z.instanceof(File).refine(
        (file) =>
            [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
            ].includes(file.type),
        { message: "Invalid file type" }
    ).optional(),
    session_id: z.string().min(1, "Session id is required")
})

export type CreateSessionAnnouncementInput = z.infer<typeof createSessionAnnouncementInputSchema>;

export const createSessionAnnouncement = ({
                                      data,
                                  }: {
    data: CreateSessionAnnouncementInput;
}): Promise<{ data: { id: string }; message: string }> => {

    let formData = new FormData();

    for (let key in data) {
        const value = data[key as keyof CreateSessionAnnouncementInput];

        if (value !== undefined) {
            console.log(key, value)
            formData.append(key, value instanceof File ? value : String(value));
        }
    }

    return api.post("bootcamp/session_announcement", formData);
};
