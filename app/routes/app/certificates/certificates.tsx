import { CertificateLists } from "~/features/certificates/components/certificates-list";
import { NavbarContentLayout } from "~/components/layouts/navbar-content-layout";
import { getCertificateByUser } from "~/features/certificates/api/get-certificate-by-user";
import { useAuth } from "~/lib/auth";
import { useEffect, useState } from "react";
import type { Certificate } from "~/types/api";
import EmptyMessage from "~/components/ui/empty-message";
import PageSpinner from "~/components/ui/page-spinner";
import toast from "react-hot-toast";
import { deleteCertificate } from "~/features/certificates/api/delete-certificate";
import { getErrorMessage } from "~/lib/error";

const Certificates = () => {
  
  const {user} = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchCertificates = async () => {
    try {
      const {data: certificates} = await getCertificateByUser(user?.id!)
      setCertificates(certificates)
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleDeleteCertificate = async (id: string) => {
    const confirmed = window.confirm("Delete this certificate and undo the generation?");
    if (!confirmed) return;

    const toastId = toast.loading("Deleting certificate...");

    try {
      await deleteCertificate(id);
      setCertificates((current) => current.filter((certificate) => certificate.id !== id));
      toast.success("Certificate deleted.", { id: toastId });
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  }

  
  if (!user){
    return <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="You are prohibited to access this page. Please login first!" title="Unauthorized"/>
        <a href="/career-link/">Login here</a>
    </div>
  }

  if (loading) return <PageSpinner />;

  return (
    <NavbarContentLayout title="My Certificates">
      <CertificateLists certificates={certificates} onDelete={handleDeleteCertificate} />
    </NavbarContentLayout>
  );
};

export default Certificates;
