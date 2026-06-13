import { useEffect, useState } from "react";
import { Link } from "react-router";
import { NavbarContentLayout } from "~/components/layouts/navbar-content-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import PageSpinner from "~/components/ui/page-spinner";
import { getBootcamps } from "~/features/bootcamp/api/get-bootcamps";
import type { Bootcamp } from "~/types/api";

const BootcampProgressList = () => {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBootcamps = async () => {
    try {
      const { data } = await getBootcamps();
      setBootcamps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootcamps();
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <NavbarContentLayout
      title="Student Progress"
      subtitle="Monitor student progress by bootcamp"
    >
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {bootcamps.map((bootcamp) => (
          <Card key={bootcamp.id} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.VITE_STORAGE_URL}${bootcamp.image_path}`}
                  alt={bootcamp.name}
                  className="h-14 w-20 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {bootcamp.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {bootcamp.description}
                  </p>
                </div>
              </div>
              <Link to={`/admin/bootcamps/${bootcamp.id}/progress`}>
                <Button className="w-full">View Progress</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </NavbarContentLayout>
  );
};

export default BootcampProgressList;
