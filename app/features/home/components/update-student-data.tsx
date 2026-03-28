import { useForm } from "react-hook-form";
import { updateStudentData, updateStudentInputSchema, type UpdateStudentDataInput } from "../api/update-student-data";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getErrorMessage } from "~/lib/error";
import { Form } from "~/components/ui/form";
import Field from "~/components/ui/form-field";
import { Button } from "~/components/ui/button";
import type { User } from "~/types/api";
import FileField from "~/components/ui/file-field";
import { useState } from "react";
import {EmploymentStatus} from "~/types/enum";
import Dropdown from "~/components/ui/dropdown";

interface Props {
  onSuccess: () => void;
  user: User;
}

const UpdateStudentData = ({user,onSuccess}:Props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const statusValues = Object.values(EmploymentStatus).map((val) => ({
        value: val,
        text: val,
    }));
    const form = useForm<UpdateStudentDataInput>({
        resolver: zodResolver(updateStudentInputSchema),
        defaultValues: {
            email: user.email,
            future_position: user.future_position ?? "",
            major: user.major,
            name: user.name,
            nim: user.nim,
            phone: user.phone,
            skill: user.skill ?? "",
            cv:user.cv,
            status: user.status,
            gpa: user.gpa
        },
      });
    
      const onSubmit = async (data: UpdateStudentDataInput) => {
          console.log(data)
        const toastId = toast.loading("Updating future plan...");
    
        try {
          const res = await updateStudentData({data, id: user.id})
          toast.success(res.message, { id: toastId });
    
          form.reset();
    
          onSuccess();
        } catch (error) {
          toast.error(getErrorMessage(error), {
            id: toastId,
          });
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
            <Field control={form.control} placeholder="Enter here" label="Future Position" type="text" name="future_position"/>
            <Field control={form.control} placeholder="Enter here (separated by comma) ex: C,C++" label="Skill" type="text" name="skill"/>
            <Field control={form.control} placeholder="Enter GPA" label="GPA" type="number" name="gpa" step="0.01"/>
            <Dropdown control={form.control} label="Employment Status" name="status" values={statusValues}/>
            <Field control={form.control} placeholder="Enter CV Link" label="Link CV" type="text" name="cv" />
            <FileField
              control={form.control}
              handlePreview={handleImagePreview}
              label="CV"
              name="cv_file"
            />
            {previewUrl && (
              <div className="mt-4">
                {fileType === "application/pdf" ? (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    className="w-full h-96 rounded-md border"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-32 object-cover rounded-md border"
                  />
                )}
              </div>
            )} 
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className={
                        form.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }
                >
                {form.formState.isSubmitting ? "Updating..." : "Update"}
                </Button>
            </div>
            </form>
        </Form>
    )
}

export default UpdateStudentData