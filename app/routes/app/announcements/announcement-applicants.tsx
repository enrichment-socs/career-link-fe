import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import TooltipLayout from "~/components/layouts/tooltip-layout";
import EmptyMessage from "~/components/ui/empty-message";
import { useAuth } from "~/lib/auth";
import { getAnnouncement } from "~/features/announcements/api/get-announcement";
import {
  getAnnouncementApplicants,
  type AnnouncementApplicant,
} from "~/features/announcements/api/get-announcement-applicants";
import type { Announcement } from "~/types/api";
import type { Route } from "./+types/announcement-applicants";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { announcementId } = params;
  if (!announcementId) throw new Error("No announcement ID provided");
  return { announcementId };
};

export default function AnnouncementApplicants({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement>();
  const [applicants, setApplicants] = useState<AnnouncementApplicant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [announcementRes, applicantsRes] = await Promise.all([
      getAnnouncement({ id: loaderData.announcementId }),
      getAnnouncementApplicants({ announcementId: loaderData.announcementId }),
    ]);
    setAnnouncement(announcementRes.data);
    setApplicants(applicantsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [loaderData.announcementId]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="You are prohibited to access this page. Please login first!" title="Unauthorized" />
        <a href="/career-link/">Login here</a>
      </div>
    );
  }

  if (user.name !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="Only administrators can view this page." title="Access Denied" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <div>
          <h1 className="text-2xl text-primary font-bold">
            Applicants
          </h1>
          {announcement && (
            <p className="text-sm text-gray-500">
              {announcement.title}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Total Applicants: {applicants.length}
      </div>

      <Table className="mt-2">
        <TableHeader className="p-5 items-center flex w-full">
          <TableRow className="flex w-full">
            <TableHead className="h-full w-[5%] font-medium text-center">No.</TableHead>
            <TableHead className="h-full w-[12%] text-center">NIM</TableHead>
            <TableHead className="h-full w-[15%] text-center">Name</TableHead>
            <TableHead className="h-full w-[18%] text-center">Email</TableHead>
            <TableHead className="h-full w-[12%] text-center">Major</TableHead>
            <TableHead className="h-full w-[8%] text-center">GPA</TableHead>
            <TableHead className="h-full w-[12%] text-center">Employment Status</TableHead>
            <TableHead className="h-full w-[18%] text-center">Applied At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="grid">
          {loading ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-sm text-gray-400">
                Loading...
              </td>
            </tr>
          ) : applicants.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-semibold text-gray-600">No Applicants Yet</p>
                  <p className="text-sm text-gray-400">No students have applied to this announcement.</p>
                </div>
              </td>
            </tr>
          ) : (
            applicants.map((applicant, idx) => (
              <TableRow
                key={applicant.id}
                className="shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full"
              >
                <TableCell className="w-[5%] font-medium text-center">
                  {idx + 1}
                </TableCell>
                <TableCell className="w-[12%] text-center">
                  {applicant.user?.nim ?? "-"}
                </TableCell>
                <TableCell className="w-[15%] text-center whitespace-normal break-words">
                  {applicant.user?.name ?? "-"}
                </TableCell>
                <TableCell className="w-[18%] text-center">
                  <TooltipLayout text={applicant.user?.email ?? "no email"}>
                    <p>{applicant.user?.email ?? "-"}</p>
                  </TooltipLayout>
                </TableCell>
                <TableCell className="w-[12%] text-center whitespace-normal break-words">
                  <TooltipLayout text={applicant.user?.major ?? "no major"}>
                    <p>{applicant.user?.major ?? "-"}</p>
                  </TooltipLayout>
                </TableCell>
                <TableCell className="w-[8%] text-center">
                  {applicant.user?.gpa ?? "-"}
                </TableCell>
                <TableCell className="w-[12%] text-center whitespace-normal break-words">
                  {applicant.user?.status ?? "-"}
                </TableCell>
                <TableCell className="w-[18%] text-center">
                  {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
