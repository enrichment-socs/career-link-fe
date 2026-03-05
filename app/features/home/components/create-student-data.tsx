import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { createStudentData, createStudentInputSchema, type CreateStudentDataInput } from "../api/create-student-data";
import { getErrorMessage } from "~/lib/error";
import { Form } from "~/components/ui/form";
import Field from "~/components/ui/form-field";
import FileField from "~/components/ui/file-field";
import { Button } from "~/components/ui/button";

interface Props {
  onSuccess: () => void;
}

const CreateStudentData = ({ onSuccess }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const form = useForm<CreateStudentDataInput>({
    resolver: zodResolver(createStudentInputSchema),
    defaultValues: {
      name: "",
      email: "",
      nim: "",
      future_position: "",
      phone: "",
      major: "",
      skill: "",
    },
  });

  const onSubmit = async (data: CreateStudentDataInput) => {
    const toastId = toast.loading("Creating student...");
    try {
      const res = await createStudentData(data);
      toast.success(res.message, { id: toastId });
      form.reset();
      setPreviewUrl(null);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setFileType(file.type);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field control={form.control} placeholder="Enter NIM" label="NIM" type="text" name="nim" />
        <Field control={form.control} placeholder="Enter name" label="Name" type="text" name="name" />
        <Field control={form.control} placeholder="Enter email" label="Email" type="email" name="email" />
        <Field control={form.control} placeholder="Enter phone" label="Phone" type="text" name="phone" />
        <Field control={form.control} placeholder="Enter major" label="Major" type="text" name="major" />
        <Field control={form.control} placeholder="Enter future position" label="Future Position" type="text" name="future_position" />
        <Field control={form.control} placeholder="Enter skills (comma separated)" label="Skill" type="text" name="skill" />
        <FileField control={form.control} handlePreview={handleImagePreview} label="CV (PDF)" name="cv_file" />
        {previewUrl && (
          <div className="mt-4">
            {fileType === "application/pdf" ? (
              <embed src={previewUrl} type="application/pdf" className="w-full h-64 rounded-md border" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full max-h-32 object-cover rounded-md border" />
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={form.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateStudentData;
