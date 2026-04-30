import { api } from "~/lib/api-client"
import type { Enrollment } from "~/types/api"

export const getBootcampReportByBootcampId = (
    bootcamp_id: string,
    cacheBust = false
): Promise<{ data: Enrollment[] }>  => {
    const cacheParam = cacheBust ? `?t=${Date.now()}` : ""
    return api.get(`bootcamp/enrollment_detail/bootcamp/${bootcamp_id}${cacheParam}`)
}