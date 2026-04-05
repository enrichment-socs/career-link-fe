import { api } from "~/lib/api-client";
import type { User } from "~/types/api";

export type AnnouncementApplicant = {
  id: string;
  announcement_id: string;
  user_id: string;
  user: User;
  created_at: string;
};

export const getAnnouncementApplicants = ({
  announcementId,
}: {
  announcementId: string;
}): Promise<{ data: AnnouncementApplicant[] }> => {
  return api.get(`/announcement/${announcementId}/apply`);
};
