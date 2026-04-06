import { api } from "~/lib/api-client";

export const getUserAppliedBatch = (user_id: string): Promise<{ data: string[] }> => {
  return api.get(`/announcement/user_applied_batch/${user_id}`);
};
