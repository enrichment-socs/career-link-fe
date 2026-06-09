import { api } from "~/lib/api-client"
import type { Enrollment } from "~/types/api"

export const getEnrollmentByUser = (user_id: string): Promise<{ data: Enrollment[] }>  => {

    return api.get(`bootcamp/enrollment/user/${user_id}`)
}