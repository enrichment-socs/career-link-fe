import { useForm } from "react-hook-form";
import { updateStudentData, updateStudentInputSchema, type UpdateStudentDataInput } from "../api/update-student-data";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getErrorMessage } from "~/lib/error";
import { Form } from "~/components/ui/form";
import Field from "~/components/ui/form-field";
import { Button } from "~/components/ui/button";
import type { User } from "~/types/api";
import {EmploymentStatus} from "~/types/enum";
import Dropdown from "~/components/ui/dropdown";

interface Props {
  onSuccess: () => void;
  user: User;
}

const UpdateStudentData = ({user,onSuccess}:Props) => {
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
            gpa: user.gpa,
            company_name: user.company_name ?? "",
            business_type: user.business_type ?? "",
            university_name: user.university_name ?? ""
        },
      });

      const watchedStatus = form.watch("status");
    
      const onSubmit = async (data: UpdateStudentDataInput) => {
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

      const positionLabel = watchedStatus === EmploymentStatus.EMPLOYED ? "Position" : "Future Position";
      const positionPlaceholder = watchedStatus === EmploymentStatus.ENTREPRENEUR
          ? "e.g. CEO, Founder, Business Owner"
          : "e.g. Software Engineer, Data Analyst";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field control={form.control} placeholder="Enter GPA" label="GPA" type="number" name="gpa" step="0.01"/>
            <Dropdown control={form.control} label="Employment Status" name="status" values={statusValues}/>
            <Field control={form.control} placeholder={positionPlaceholder} label={positionLabel} type="text" name="future_position"/>
            {watchedStatus === EmploymentStatus.EMPLOYED && (
                <Field control={form.control} placeholder="e.g. Google, Tokopedia, BCA" label="Company Name" type="text" name="company_name"/>
            )}
            {watchedStatus === EmploymentStatus.ENTREPRENEUR && (
                <Field control={form.control} placeholder="e.g. F&B, E-Commerce, SaaS, Consulting" label="Business Type" type="text" name="business_type"/>
            )}
            {watchedStatus === EmploymentStatus.STUDY && (
                <Field control={form.control} placeholder="e.g. Universitas Indonesia, NUS, MIT" label="University / Institution" type="text" name="university_name"/>
            )}
            <Field control={form.control} placeholder="Enter here (separated by comma) ex: C,C++" label="Skill" type="text" name="skill"/>
            <Field control={form.control} placeholder="Enter Major" label="Major" type="text" name="major" />
            <Field control={form.control} placeholder="Enter CV Link" label="CV Link" type="text" name="cv" />
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