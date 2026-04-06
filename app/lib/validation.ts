import type { Attendance, Session } from "~/types/api"

export const isClockInOpen = (session:Session) => (
    new Date().getTime() >= new Date(session.start_attendance_date).getTime() 
)

export const isClockInRange = (session:Session) => ( 
    new Date().getTime() <= new Date(session.start_attendance_date).getTime() + 1000 * 60 * 60
)

export const isClockOutOpen = (session:Session) => {
    const now = new Date().getTime()
    const start = new Date(session.end_date).getTime()
    const end = start + 1000 * 60 * 60
    return now >= start && now <= end
}

export const hasClockedIn = (attendances: Attendance[]) =>
    attendances.some(a => a.attendance_type === 'clock_in')

export const hasClockedOut = (attendances: Attendance[]) =>
    attendances.some(a => a.attendance_type === 'clock_out')