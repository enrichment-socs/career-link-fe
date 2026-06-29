import { api } from "~/lib/api-client"
import type { Enrollment } from "~/types/api"

export const createEnrollment = (email: string, bootcamp_id: string, short_name?: string): Promise<{ data: Enrollment[] }> => {
    const body: Record<string, string> = { email }
    if (short_name) {
        body.short_name = short_name
    } else {
        body.bootcamp_id = bootcamp_id
    }
    return api.post(`bootcamp/enrollment`, body)
}