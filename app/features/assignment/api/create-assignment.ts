import { z } from "zod";
import { api } from "~/lib/api-client";

export const createAssignmentInputSchema = z.object({
  session_id: z.string().min(1, "Session ID is required"),
  answer_file_path: z.string().url("Invalid answer link").optional(),
  is_shared: z.boolean(),
  open_date: z.date(),
  close_date: z.date(),
  question_file_path: z.string().url("Invalid question link").optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentInputSchema>;

export const createAssignment = ({
  data,
  id
}: {
  data: CreateAssignmentInput;
  id?:string
}): Promise<{ data: { id: string }; message: string }> => {
  let formData = new FormData();

  for (let key in data) {
    const value = data[key as keyof CreateAssignmentInput];
    if (value === undefined || value === null) continue;
    if (key === 'is_shared') {
      formData.append(key, value == true ? "1" : "0");
    }else{
      if (key.includes('date')){
        let newKey = key as 'open_date' | 'close_date'
        let date = data[newKey]
        formData.append(key, date.toISOString())
      }else{
        formData.append(key, String(value));
      }
    }
  }
  console.log("Form Data:", formData.get("open_date"));
  if (id){
    return api.post(`/bootcamp/session_assignment/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }else{
    return api.post(`/bootcamp/session_assignment`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

  }
};
