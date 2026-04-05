//'sdf', 'william', 'william@gmail.com', 'william'

import { z } from "zod";
import { api } from "~/lib/api-client";
import type { User } from "~/types/api";
import {EmploymentStatus} from "~/types/enum";

export const updateStudentInputSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  nim: z.string().optional(),
  future_position: z.string().optional(),
  phone: z.string().optional(),
  gpa: z.coerce.number().min(0).max(4).optional(),
  status: z.nativeEnum(EmploymentStatus).optional(),
  cv: z.string().optional(),
  major: z.string().optional(),
  skill: z.string().optional(),
  cv_file: z.instanceof(File).optional(),
});

export type UpdateStudentDataInput = z.infer<typeof updateStudentInputSchema>;

export const updateStudentData = ({
  data,
  id
}: {
  data: UpdateStudentDataInput;
  id: string;
}): Promise<{ data: User; message: string }> => {

  let formData = new FormData();
  
    for (let key in data) {
      const value = data[key as keyof UpdateStudentDataInput];
      
      if (value !== undefined) {
        console.log(key, value)
        formData.append(key, value instanceof File ? value : String(value));
      }
    }
    
  return api.post(`/user/${id}`, formData);
};
