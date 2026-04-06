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

  if (!loading && !user) return null;

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full box-border bg-gray-50 overflow-hidden">
        <div className="w-full bg-primary flex items-center justify-between px-3 py-3">
          <div className="flex items-center">
            <h2 className="font-semibold text-white text-3xl mx-10">CareerLink</h2>
          </div>
        </div>
        <div className="flex-1">
          <PageSpinner />
        </div>
      </div>
    );
  }

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
