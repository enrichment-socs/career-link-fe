import { api } from "~/lib/api-client";

export const deleteCertificate = (id: string): Promise<{ data: { id: string }; message: string }> => {
  return api.delete(`bootcamp/certificate/${id}`);
};