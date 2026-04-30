// /bootcamp/session_assignment_answer

import { z } from "zod";
import { api } from "~/lib/api-client";

export const updateAssignmentAnswerInputSchema = z.object({
  answer_file_path: z.string().min(1, "Answer link is required"),
  user_id: z.string().min(1, "User id cant be empty"),
  assignment_id: z.string().min(1, "Assignment id cant be empty"),
});

export type UpdateAssignmentAnswerInput = z.infer<typeof updateAssignmentAnswerInputSchema>;

export const updateAssignmentAnswer = ({
  data,id
}: {
  data: UpdateAssignmentAnswerInput;
  id: string;
}): Promise<{ data: { id: string }; message: string }> => {
  return api.post(`bootcamp/session_assignment_answer/${id}`, data);
  
};
