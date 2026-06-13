import { api } from "~/lib/api-client";

export const deleteSessionAnnouncement = (id: string) => {
  return api.delete(`bootcamp/session_announcement/${id}`);
};
