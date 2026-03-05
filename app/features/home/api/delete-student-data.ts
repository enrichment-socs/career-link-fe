import { api } from "~/lib/api-client";

export const deleteStudentData = (id: string): Promise<{ message: string }> => {
  return api.delete(`/user/${id}`);
};
