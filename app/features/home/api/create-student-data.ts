import { z } from "zod";
import { api } from "~/lib/api-client";
import type { User } from "~/types/api";
import {EmploymentStatus} from "~/types/enum";

export const createStudentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  nim: z.string().min(1, "NIM is required"),
  future_position: z.string().min(1, "Future Position is required"),
  phone: z.string().min(1, "Phone is required"),
  gpa: z.coerce.number().min(0).max(4).refine(val => Number.isFinite(val), "Invalid GPA"),
  status: z.nativeEnum(EmploymentStatus, {
    errorMap: () => ({ message: "Invalid job status value" }),
  }),
  cv: z.string().min(1, "CV Link is required"),
  major: z.string().min(1, "Major is required"),
  skill: z.string().min(1, "Skill is required"),
  cv_file: z.instanceof(File).optional(),
  company_name: z.string().optional(),
  business_type: z.string().optional(),
  university_name: z.string().optional(),
});

export type CreateStudentDataInput = z.infer<typeof createStudentInputSchema>;

export const createStudentData = (data: CreateStudentDataInput): Promise<{ data: User; message: string }> => {
  const formData = new FormData();
  for (const key in data) {
    const value = data[key as keyof CreateStudentDataInput];
    if (value !== undefined) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  }
  return api.post(`/user`, formData);
};
