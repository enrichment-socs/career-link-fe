// /bootcamp/session_assignment_answer

import { z } from "zod";
import { api } from "~/lib/api-client";

export const createAssignmentAnswerInputSchema = z.object({
  answer_file_path: z.string().min(1, "Answer link is required"),
  user_id: z.string().min(1, "User id cant be empty"),
  assignment_id: z.string().min(1, "Assignment id cant be empty"),
});

export type CreateAssignmentAnswerInput = z.infer<typeof createAssignmentAnswerInputSchema>;

export const createAssignmentAnswer = ({
  data,
}: {
  data: CreateAssignmentAnswerInput;
}): Promise<{ data: { id: string }; message: string }> => {
  return api.post("bootcamp/session_assignment_answer", data);
};
