import { z } from "zod";
import { api } from "~/lib/api-client";

export const createAnnouncementApplyInputSchema = z.object({
    user_id: z.string().min(1, "user id cant be empty"),
    announcement_id: z.string().min(1, "announcement id cant be empty")
})

export type CreateAnnouncementApplyInput = z.infer<typeof createAnnouncementApplyInputSchema>

export const createAnnouncementApply = (
    data: CreateAnnouncementApplyInput
): Promise<{ data: { id: string }; message: string }> => {
    return api.post("/announcement/apply", data);
};