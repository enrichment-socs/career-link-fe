import { CertificateLists } from "~/features/certificates/components/certificates-list";
import { NavbarContentLayout } from "~/components/layouts/navbar-content-layout";
import { getCertificateByUser } from "~/features/certificates/api/get-certificate-by-user";
import { useAuth } from "~/lib/auth";
import { useEffect, useState } from "react";
import type { Certificate } from "~/types/api";
import EmptyMessage from "~/components/ui/empty-message";
import PageSpinner from "~/components/ui/page-spinner";

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

  
  if (!user){
    return <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="You are prohibited to access this page. Please login first!" title="Unauthorized"/>
        <a href="/career-link/">Login here</a>
    </div>
  }

  if (loading) return <PageSpinner />;

  return (
    <NavbarContentLayout title="My Certificates">
      <CertificateLists certificates={certificates} />
    </NavbarContentLayout>
  );
};

export default Certificates;
