import { z } from "zod";
import { api } from "~/lib/api-client";

export const updateEvalAnswerInputSchema = z.object({
  question_id: z.string().min(1, "Question is required"),
  session_id: z.string().min(1, "Session id is required"),
  user_id: z.string().min(1, "User id is required"),
  answer: z.string().min(1, "Answer is required"),
});

export type UpdateEvalAnswerInput = z.infer<typeof updateEvalAnswerInputSchema>;

export const updateEvalAnswer = ({
  id,
  data,
}: {
  id: string;
  data: UpdateEvalAnswerInput;
}): Promise<{ data: { id: string }; message: string }> => {
  return api.put(`bootcamp/session_evaluation_answer/${id}`, data);
};
