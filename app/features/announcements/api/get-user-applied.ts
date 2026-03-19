import { api } from "~/lib/api-client";
import type { Announcement } from "~/types/api";

export const getUserApplied = ({
    user_id, announcement_id
}:{
    user_id:string, announcement_id:string
}): Promise<boolean> => {
    return api.get(`/announcement/user_applied`, {
        params: {
            user_id,
            announcement_id,
        },
    });
};
