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
import Dropdown from "~/components/ui/dropdown";
import {EmploymentStatus} from "~/types/enum";

interface Props {
  onSuccess: () => void;
}

const CreateStudentData = ({ onSuccess }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const statusValues = Object.values(EmploymentStatus).map((val) => ({
    value: val,
    text: val,
  }));

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
      gpa:0,
      cv:"",
      company_name: "",
      business_type: "",
      university_name: ""
    },
  });

  const watchedStatus = form.watch("status");

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
        <Field control={form.control} placeholder="Enter Name" label="Name" type="text" name="name" />
        <Field control={form.control} placeholder="Enter Email" label="Email" type="email" name="email" />
        <Field control={form.control} placeholder="Enter Phone" label="Phone" type="text" name="phone" />
        <Field control={form.control} placeholder="Enter Major" label="Major" type="text" name="major" />
        <Field control={form.control} placeholder="Enter GPA" label="GPA" type="number" name="gpa" />
        <Dropdown control={form.control} label="Employment Status" name="status" values={statusValues} defaultValue={EmploymentStatus.NOT_EMPLOYED}/>
        <Field control={form.control} placeholder="Enter CV Link" label="Link CV" type="text" name="cv" />
        <Field control={form.control} placeholder={watchedStatus === EmploymentStatus.ENTREPRENEUR ? "e.g. CEO, Founder, Business Owner" : "e.g. Software Engineer, Data Analyst"} label={watchedStatus === EmploymentStatus.EMPLOYED ? "Position" : "Future Position"} type="text" name="future_position" />
        {watchedStatus === EmploymentStatus.EMPLOYED && (
          <Field control={form.control} placeholder="e.g. Google, Tokopedia, BCA" label="Company Name" type="text" name="company_name" />
        )}
        {watchedStatus === EmploymentStatus.ENTREPRENEUR && (
          <Field control={form.control} placeholder="e.g. F&B, E-Commerce, SaaS, Consulting" label="Business Type" type="text" name="business_type" />
        )}
        {watchedStatus === EmploymentStatus.STUDY && (
          <Field control={form.control} placeholder="e.g. Universitas Indonesia, NUS, MIT" label="University / Institution" type="text" name="university_name" />
        )}
        <Field control={form.control} placeholder="Enter Skills (comma separated)" label="Skill" type="text" name="skill" />
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
