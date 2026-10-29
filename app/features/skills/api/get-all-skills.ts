import {api} from "~/lib/api-client";
import type {Skill} from "~/types/api";

export const getAllSkills = (): Promise<{ data: Skill[] }> => {
    return api.get(`user/skills`)
}