import type { Route } from "./+types/bootcamp-progress-detail";
import { Link } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import PageSpinner from "~/components/ui/page-spinner";
import { Button } from "~/components/ui/button";
import { getBootcamp } from "~/features/bootcamp/api/get-bootcamp";
import { getBootcampReportByBootcampId } from "~/features/bootcamp-report/api/get-bootcamp-report-by-bootcamp-id";
import StudentProgressGrid from "~/features/bootcamp-report/components/student-progress-grid";
import type { Enrollment } from "~/types/api";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  return {
    id: params.bootcamp,
  };
};

const BootcampProgressDetail = ({ loaderData }: Route.ComponentProps) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBootcamp = async () => {
    setLoading(true);
    try {
      const [{ data: bootcamp }, { data: enrollments }] = await Promise.all([
        getBootcamp(loaderData.id),
        getBootcampReportByBootcampId(loaderData.id, true),
      ]);

      setSessionCount(bootcamp.sessions.length);
      setEnrollments(enrollments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootcamp();
  }, [loaderData.id]);

  if (loading) return <PageSpinner />;

  return (
    <div className="w-full">
      <div className="w-full flex items-center">
        <Link to="/admin/bootcamps/progress">
          <button className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-md">
            <FaArrowLeft />
          </button>
        </Link>
        <h2 className="font-bold text-left w-full text-4xl text-slate-700 p-6 h-full">
          Student Progress
        </h2>
        <Button onClick={fetchBootcamp} className="mr-6">Refresh</Button>
      </div>
      <StudentProgressGrid enrollments={enrollments} sessionCount={sessionCount} />
    </div>
  );
};

export default BootcampProgressDetail;
