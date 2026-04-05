import Navbar from "../navbar";
import { Sidebar } from "~/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router";
import SidebarContent from "~/components/sidebar/sidebar-content";
import CenterLayout from "~/components/layouts/center-layout";
import { useAuth } from "~/lib/auth";
import { useEffect } from "react";

const NavbarLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user]);

  if (loading) return null;

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen w-full box-border bg-gray-50">
      <Navbar />
      <div className="flex-grow relative min-h-screen w-full box-border">
        <Sidebar className={"absolute min-h-full"} side={"left"}>
          <SidebarContent />
        </Sidebar>
        <div className="mx-auto max-w-[1800px] w-full h-full">
          <CenterLayout>
            <Outlet />
          </CenterLayout>
        </div>
      </div>
    </div>
  );
};

export default NavbarLayout;
