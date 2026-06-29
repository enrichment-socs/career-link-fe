import { api } from "~/lib/api-client"
import type { Enrollment } from "~/types/api"

export const getAllEnrollments = (): Promise<{ data: Enrollment[] }> => {
    return api.get(`bootcamp/enrollment`)
}
