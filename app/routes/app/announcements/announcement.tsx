import { AnnouncementDetail } from "~/features/announcements/components/announcement-detail";
import type { Route } from "./+types/announcement";
import { getAnnouncement } from "~/features/announcements/api/get-announcement";
import { useEffect, useState } from "react";
import type { Announcement } from "~/types/api";
import PageSpinner from "~/components/ui/page-spinner";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {

  const { announcementId } = params;
  if (!announcementId) throw new Error("no announcement id");

  return { id: announcementId };
};

export default function Announcement({ loaderData }: Route.ComponentProps) {
  const [announcement, setAnnouncement] = useState<Announcement>()
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      const {data: announcement} = await getAnnouncement({id: loaderData.id});
      setAnnouncement(announcement)
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncement()
  },[])

  if (loading) return <PageSpinner />;

  if (!announcement){
    return null;
  }
  return <AnnouncementDetail announcement={announcement} />;
}
