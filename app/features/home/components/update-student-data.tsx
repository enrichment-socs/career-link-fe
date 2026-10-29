import { useForm } from "react-hook-form";
import { updateStudentData, updateStudentInputSchema, type UpdateStudentDataInput } from "../api/update-student-data";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getErrorMessage } from "~/lib/error";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import Field from "~/components/ui/form-field";
import { Button } from "~/components/ui/button";
import type {Skill, User} from "~/types/api";
import {EmploymentStatus} from "~/types/enum";
import Dropdown from "~/components/ui/dropdown";
import {
    updateStudentEnrichmentData,
    type UpdateStudentEnrichmentDataInput, updateStudentEnrichmentDataInputSchema
} from "~/features/student-enrichment-data/api/update-student-enrichment-data";
import {useEffect, useMemo, useState} from "react";
import {useRole} from "~/provider/role-testing-provider";
import {SkillsInput} from "~/features/home/components/skills-input";
import {getAllSkills} from "~/features/skills/api/get-all-skills";

const UpdateStudentData = ({user,onSuccess}:Props) => {

    const DEFAULT_SUGGESTIONS = [
        "C", "C++", "C#", "Java", "JavaScript", "TypeScript", "Python", "Go",
        "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "Docker", "Git",
    ];

    const statusValues = Object.values(EmploymentStatus).map((val) => ({
        value: val,
        text: val,
    }));

    const { role } = useRole();

    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
    const [allSkills, setAllSkills] = useState<Skill[]>([])

    const studentForm = useForm<UpdateStudentDataInput>({
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
            university_name: user.university_name ?? "",
            skills: user.skills ?? []
        },
    });

    const studentEnrichmentDataForm= useForm<UpdateStudentEnrichmentDataInput>({
        resolver: zodResolver(updateStudentEnrichmentDataInputSchema),
        defaultValues: {
            company: "",
            position: "",
        },
    });

    const watchedStatus = studentForm.watch("status");

    const selectEnrichmentBatch = (batch: number) => {
        setSelectedBatch(batch);

        const enrichment = user.student_enrichment_data?.find(
            (data) => data.enrichment_batch === batch
        );
        if (enrichment) {
            setSelectedRequestId(enrichment.id)
        }else{
            setSelectedRequestId(null);
        }

        studentEnrichmentDataForm.reset({
            company: enrichment?.company ?? "",
            position: enrichment?.position ?? "",
        });
    };

    const onSubmit = async (data: UpdateStudentDataInput) => {
        const toastId = toast.loading("Updating future plan...");

        try {
            const res = await updateStudentData({data, id: user.id})
            toast.success(res.message, { id: toastId });

            studentForm.reset();

            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error), {
                id: toastId,
            });
        }
    };

    const onSubmitStudentEnrichmentData = async (data: UpdateStudentEnrichmentDataInput) => {
        const toastId = toast.loading("Updating student enrichment data...");

        if(!selectedBatch || !selectedRequestId){
            toast.error(getErrorMessage(new Error("Enrichment data must be chosen")), {
                id: toastId,
            });
            return
        }

        try {
            const res = await updateStudentEnrichmentData({data, id: selectedRequestId})
            toast.success(res.message, { id: toastId });

            studentEnrichmentDataForm.reset();

            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error), {
                id: toastId,
            });
        }
    };

    const fetchAllSkills = async () =>{
        try{
            let res = await getAllSkills()
            setAllSkills(res.data)
        }catch(error){

        }
    }

    useEffect(() => {
        fetchAllSkills();
    }, []);

    const suggestions = useMemo(() => {
        const seen = new Set<string>();
        const merged: string[] = [];

        [...allSkills.map((s) => s.name), ...DEFAULT_SUGGESTIONS].forEach((name) => {
            const key = name.trim().toLowerCase();
            if (key && !seen.has(key)) {
                seen.add(key);
                merged.push(name.trim());
            }
        });

        return merged;
    }, [allSkills]);

    const positionLabel = watchedStatus === EmploymentStatus.EMPLOYED ? "Position" : "Future Position";
    const positionPlaceholder = watchedStatus === EmploymentStatus.ENTREPRENEUR
        ? "e.g. CEO, Founder, Business Owner"
        : "e.g. Software Engineer, Data Analyst";

    return (
        <div className={"flex flex-col gap-5"}>
            <Form {...studentForm}>
                <form onSubmit={studentForm.handleSubmit(onSubmit)} className="space-y-4">
                    <Field control={studentForm.control} placeholder="Enter GPA" label="GPA" type="number" name="gpa"
                           step="0.01"/>
                    <Dropdown control={studentForm.control} label="Employment Status" name="status"
                              values={statusValues}/>
                    <Field control={studentForm.control} placeholder={positionPlaceholder} label={positionLabel}
                           type="text" name="future_position"/>
                    {watchedStatus === EmploymentStatus.EMPLOYED && (
                        <Field control={studentForm.control} placeholder="e.g. Google, Tokopedia, BCA"
                               label="Company Name" type="text" name="company_name"/>
                    )}
                    {watchedStatus === EmploymentStatus.ENTREPRENEUR && (
                        <Field control={studentForm.control} placeholder="e.g. F&B, E-Commerce, SaaS, Consulting"
                               label="Business Type" type="text" name="business_type"/>
                    )}
                    {watchedStatus === EmploymentStatus.STUDY && (
                        <Field control={studentForm.control} placeholder="e.g. Universitas Indonesia, NUS, MIT"
                               label="University / Institution" type="text" name="university_name"/>
                    )}
                    <FormField
                        control={studentForm.control}
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Skill</FormLabel>
                                <FormControl>
                                    <SkillsInput
                                        value={(field.value ?? []).map((s) => s.name)}
                                        onChange={(names) => {
                                            const current = field.value ?? [];
                                            field.onChange(
                                                names.map(
                                                    (name) =>
                                                        current.find((s) => s.name.toLowerCase() === name.toLowerCase()) ??
                                                        allSkills.find((s) => s.name.toLowerCase() === name.toLowerCase()) ?? { name }
                                                )
                                            );
                                        }}

                                        suggestions={suggestions}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Field control={studentForm.control} placeholder="Enter Major" label="Major" type="text"
                           name="major"/>
                    <Field control={studentForm.control} placeholder="Enter CV Link" label="CV Link" type="text"
                           name="cv"/>
                    {role === "user" && (
                        <p className={"text-sm text-justify"}>Please ensure that the data provided relates to you and not to someone else.</p>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={studentForm.formState.isSubmitting}
                            className={
                                studentForm.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                            }
                        >
                            {studentForm.formState.isSubmitting ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </form>
            </Form>

            {role === "admin" && (
                <>
                    <div className="flex gap-2">
                        {user.student_enrichment_data?.map((enrichment) => (
                            <Button
                                key={enrichment.enrichment_batch}
                                type="button"
                                onClick={() =>
                                    selectEnrichmentBatch(enrichment.enrichment_batch)
                                }
                            >
                                Batch {enrichment.enrichment_batch}
                            </Button>
                        ))}
                    </div>

                    <Form {...studentEnrichmentDataForm}>
                        <form onSubmit={studentEnrichmentDataForm.handleSubmit(onSubmitStudentEnrichmentData)}
                              className="space-y-4">

                            <p className={"text-sm"}>Chosen
                                Batch: {selectedBatch ? selectedBatch : "No batch selected"}</p>
                            <Field
                                control={studentEnrichmentDataForm.control}
                                label="Company"
                                placeholder="Enter company"
                                type="text"
                                name="company"
                            />

                            <Field
                                control={studentEnrichmentDataForm.control}
                                label="Position"
                                placeholder="Enter position"
                                type="text"
                                name="position"
                            />
                            <div className="flex justify-end">
                                <Button type="submit">
                                    Update Student Enrichment Data
                                </Button>
                            </div>

                        </form>
                    </Form>
                </>
            )}


        </div>


    )
}

interface Props {
    onSuccess: () => void;
    user: User;
}

export default UpdateStudentData