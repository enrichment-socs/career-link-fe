import { getCertificate } from "~/features/certificates/api/get-certificate";
import {CertificatePreview} from "~/features/certificates/components/certificate-preview";
import type { Route } from "./+types/certificate";
import { useEffect, useState } from "react";
import { type Certificate } from "~/types/api";
import PageSpinner from "~/components/ui/page-spinner";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
    return {id: params.id}
}

export default function Certificate({loaderData}: Route.ComponentProps) {

    const [certificate, setCertificate] = useState<Certificate>()
    const [loading, setLoading] = useState(true);
    
    const fetchCertificate = async () => {
        try {
            const {data: certificate} = await getCertificate(loaderData.id)
            setCertificate(certificate)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCertificate()
    }, [])

    if (loading) return <PageSpinner />;

    if (!certificate){
        return null
    }

    return <CertificatePreview certificate={certificate}/>;
}
