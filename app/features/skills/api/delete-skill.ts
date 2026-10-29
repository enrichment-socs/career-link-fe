import {api} from "~/lib/api-client";

export const deleteSkill = (
    skill_id: string
): Promise<{ data: { id: string }; message: string }> => {
    return api.delete(`user/skill/delete/${skill_id}`);
};