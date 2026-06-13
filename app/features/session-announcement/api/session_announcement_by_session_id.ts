import { api } from "~/lib/api-client";
import type {SessionAnnouncement, SessionData} from "~/types/api";

export const getSessionAnnouncementBySession = (id:string): Promise<{ data: SessionAnnouncement }> => {
  return api.get(`bootcamp/session_announcement/${id}`);
};
