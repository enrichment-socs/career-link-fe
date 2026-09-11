import { api } from "~/lib/api-client";

export const getBootcampBatch = (id:string): Promise<number> => {
  return api.get(`/bootcamp/batch/${id}`);
};
