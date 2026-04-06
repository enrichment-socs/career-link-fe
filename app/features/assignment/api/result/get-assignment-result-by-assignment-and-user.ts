import { api } from "~/lib/api-client";
import type { AssignmentResult } from "~/types/api";

export const getAssignmentResultByAssignmentAndUser = (assignment_id: string, user_id: string): Promise<{ data: AssignmentResult[] }> => {
  return api.get(`bootcamp/session_assignment_result/user/${user_id}/assignment/${assignment_id}`);
};
