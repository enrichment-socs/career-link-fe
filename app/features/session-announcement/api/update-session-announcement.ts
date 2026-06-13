import { z } from "zod";
import { api } from "~/lib/api-client";

export const updateSessionAnnouncementInputSchema = z.object({
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

export type UpdateSessionAnnouncementInput = z.infer<typeof updateSessionAnnouncementInputSchema>;

export const updateSessionAnnouncement = ({
                                      data,id
                                  }: {
    data: UpdateSessionAnnouncementInput;
    id: string;
}): Promise<{ data: { id: string }; message: string }> => {
    let formData = new FormData();

    for (let key in data) {
        const value = data[key as keyof UpdateSessionAnnouncementInput];

        if (value !== undefined) {
            console.log(key, value)
            formData.append(key, value instanceof File ? value : String(value));
        }
    }
    return api.put(`bootcamp/session_announcement/${id}`, formData);
};