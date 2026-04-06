import { getBootcampCategories } from "~/features/bootcamp-category/api/get-bootcamp-categories";
import { BootcampCategoriesList } from "~/features/bootcamp-category/components/bootcamp-categories-list.";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { Modal, type ModalType } from "~/components/modal";
import { CreateBootcampCategory } from "~/features/bootcamp-category/components/create-bootcamp-category";
import type { BootcampCategory } from "~/types/api";
import { DeleteBootcampCategory } from "~/features/bootcamp-category/components/delete-bootcamp-category";
import { UpdateBootcampCategory } from "~/features/bootcamp-category/components/update-bootcamp-category";
import { getErrorMessage } from "~/lib/error";
import PageSpinner from "~/components/ui/page-spinner";

const BootcampCategories = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<BootcampCategory | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [data, setdata] = useState<BootcampCategory[]>([])
  const [loading, setLoading] = useState(true)
  
    const fetchBootcampCategories = async () => {
      try {
        let {data: data} = await getBootcampCategories()
        setdata(data)
      } catch (error) {
        console.log(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    };
  
  
    useEffect(() => {
      fetchBootcampCategories()
    }, [])

  const onSuccess = () => {
    setActiveModal(null);
    fetchBootcampCategories();
  };

  const onUpdate = (category: BootcampCategory) => {
    setSelectedCategory(category);
    setActiveModal("update");
  };

  const onDelete = (category: BootcampCategory) => {
    setSelectedCategory(category);
    setActiveModal("delete");
  };

  if (loading) return <PageSpinner />;

  return (
    <>
      <Modal
        title="Add Category"
        isOpen={activeModal === "create"}
        onClose={() => setActiveModal(null)}
      >
        <CreateBootcampCategory onSuccess={onSuccess} />
      </Modal>

      <Modal
        title="Update category"
        isOpen={activeModal === "update"}
        onClose={() => setActiveModal(null)}
      >
        <UpdateBootcampCategory
          onSuccess={onSuccess}
          selectedCategory={selectedCategory!}
        />
      </Modal>

      <Modal
        title="Delete category"
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
      >
        <div>
          <DeleteBootcampCategory
            onSuccess={onSuccess}
            onClose={() => setActiveModal(null)}
            selectedCategory={selectedCategory!}
          />
        </div>
      </Modal>

      <div className="container flex flex-col mt-2">
        <h1 className="text-2xl text-primary font-bold mb-4">
          Bootcamp Categories
        </h1>
        <Button
          onClick={() => setActiveModal("create")}
          className="w-fit px-5 py-5"
        >
          Add Category
        </Button>
        <BootcampCategoriesList
          onDelete={onDelete}
          onUpdate={onUpdate}
          categories={data}
        />
      </div>
    </>
  );
};

export default BootcampCategories;
