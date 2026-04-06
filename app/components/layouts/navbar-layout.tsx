import Navbar from "../navbar";
import { Sidebar } from "~/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router";
import SidebarContent from "~/components/sidebar/sidebar-content";
import CenterLayout from "~/components/layouts/center-layout";
import { useAuth } from "~/lib/auth";
import { useEffect } from "react";
import PageSpinner from "~/components/ui/page-spinner";

const NavbarLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user]);

  if (loading) return <PageSpinner />;

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen w-full box-border bg-gray-50 overflow-hidden">
      <Navbar />
      <div className="flex-1 relative w-full box-border overflow-y-auto">
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
