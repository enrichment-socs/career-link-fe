import BootcampDetailCard from "~/components/bootcamp/bootcamp-detail-card";
import { getBootcamp } from "~/features/bootcamp/api/get-bootcamp";
import type { Route } from "./+types/bootcamp-detail";
import { Modal, type ModalType } from "~/components/modal";
import { useState } from "react";
import { useRevalidator } from "react-router";
import { CreateUpdateSession } from "~/features/session/components/create-session";
import SessionsGrid from "~/features/session/components/sessions-grid";
import { type Session } from "~/types/api";
import { DeleteSession } from "~/features/session/components/delete-session";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  const { data } = await getBootcamp(params.bootcamp);
  return { bootcamp: data };
};

const BootcampDetail = ({ loaderData }: Route.ComponentProps) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSession, setSelectedSession] = useState<Session>();
  const revalidator = useRevalidator();

  const bootcamp = loaderData.bootcamp;

  const onUpdateSession = (session: Session) => {
    setSelectedSession(session);
    setActiveModal("update");
  };

  const onDeleteSession = (session: Session) => {
    setSelectedSession(session);
    setActiveModal("delete");
  };

  const onSuccess = () => {
    setActiveModal(null);
    revalidator.revalidate();
  };

  if (!bootcamp || !bootcamp.category || !bootcamp.type){
    return null;
  }

  return (
    <>
      <Modal
        title="Add Bootcamp's Session"
        isOpen={activeModal === "create"}
        onClose={() => setActiveModal(null)}
      >
        <CreateUpdateSession bootcamp={bootcamp} onSuccess={onSuccess} />
      </Modal>
      <Modal
        title="Update Bootcamp's Session"
        isOpen={activeModal === "update"}
        onClose={() => setActiveModal(null)}
      >
        <CreateUpdateSession
          bootcamp={bootcamp}
          onSuccess={onSuccess}
          session={selectedSession}
        />
      </Modal>
      <Modal
        title="Delete Bootcamp's Session"
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
      >
        <DeleteSession onSuccess={onSuccess} question={selectedSession} />
      </Modal>
      <div className={"container flex flex-col gap-8"}>
        <BootcampDetailCard
          id={bootcamp.id}
          name={bootcamp.name}
          description={bootcamp.description}
          category={bootcamp.category}
          type={bootcamp.type}
          image={bootcamp.image_path}
          onClick={() => setActiveModal("create")}
        />
        <SessionsGrid
          onDeleteSession={onDeleteSession}
          onUpdateSession={onUpdateSession}
          bootcampId={bootcamp.id}
          sessions={bootcamp.sessions ?? []}
          onRefresh={() => revalidator.revalidate()}
        />
      </div>
    </>
  );
};

export default BootcampDetail;
