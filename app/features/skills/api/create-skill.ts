import {api} from "~/lib/api-client";

export const createSkill = (
    skill: string[]
): Promise<{ data: { id: string }; message: string }> => {
    return api.post("user/skill/create", { 'name': skill });
};