import { api } from "~/lib/api-client";
import type { EvaluationAnswer } from "~/types/api";

export const getEvaluationAnswerBySessionAndUser = (
  sessionId: string,
  userId: string
): Promise<{ data: EvaluationAnswer[] }> => {
  return api.get(`bootcamp/session_evaluation_answer/session/${sessionId}/user/${userId}`);
};
