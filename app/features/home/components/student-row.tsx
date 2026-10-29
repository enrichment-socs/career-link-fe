import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {useLocation, useRevalidator} from "react-router";
import toast from "react-hot-toast";
import TooltipLayout from "~/components/layouts/tooltip-layout";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { TableCell, TableRow } from "~/components/ui/table";
import type {Bootcamp, User} from "~/types/api";
import UpdateStudentData from "./update-student-data";
import { deleteStudentData } from "../api/delete-student-data";
import { getErrorMessage } from "~/lib/error";
import {deleteStudentEnrollment} from "~/features/enrollments/api/delete-student-enrollment";

interface Props {
  idx: number;
  cur: number;
  e: User;
  bootcamp_id?:string;
}

const StudentRow = ({ idx, cur, e, bootcamp_id }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const revalidator = useRevalidator();
  const { pathname } = useLocation();

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting student...");
    try {
        const pages = pathname.split("/")[1];
        let message = ""
        if (pages === "bootcamps" && bootcamp_id) {
            await deleteStudentEnrollment(bootcamp_id,e.id)
            message = "Student removed from bootcamp"
        } else if (pages === "home") {
            await deleteStudentData(e.id);
            message = "Student deleted successfully"
        }
      toast.success(message, { id: toastId });
      setConfirmDelete(false);
      revalidator.revalidate();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

    const skillNames = e?.skills?.map((skill) => skill.name).join(", ") || "";

  return (
    <TableRow className="shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full text-xs">
      <TableCell className="w-[2%] font-medium text-center">
        {idx + (cur - 1) * 10 + 1}
      </TableCell>

      <TableCell className="w-[6%] text-center truncate">{e?.nim ?? "-"}</TableCell>

      <TableCell className="w-[8%] text-center truncate">
        <TooltipLayout text={e?.name ?? "-"}>
          <p>{e?.name ?? "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[10%] text-center truncate">
        <TooltipLayout text={e?.email ?? "No email"}>
          <p>{e?.email ? e.email : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[7%] text-center truncate">
        <TooltipLayout text={e?.phone ?? "No phone"}>
          <p>{e?.phone ? e.phone.replace("+62", "0") : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[6%] text-center truncate">
        <TooltipLayout text={e?.major ?? "No major yet"}>
          <p>{e?.major ? e.major : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[3%] text-center truncate">
        <TooltipLayout text={e?.gpa ?? "No GPA yet"}>
          <p>{e?.gpa ? e.gpa : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[7%] text-center truncate">
        <TooltipLayout text={e?.status ?? "No status yet"}>
          <p>{e?.status ? e.status : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[7%] text-center truncate">
        <TooltipLayout text={e?.future_position ?? "No position yet"}>
          <p>{e?.future_position ? e.future_position : "-"}</p>
        </TooltipLayout>
      </TableCell>

        <TableCell className="w-[5%] text-center truncate">
          <TooltipLayout text={skillNames || "No skill yet"}>
            <p>{skillNames || "-"}</p>
          </TooltipLayout>
        </TableCell>

      <TableCell className="w-[5%] text-center truncate">
        <TooltipLayout text={e?.cv ?? "No CV yet"}>
          <p>{e?.cv ? e.cv : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[7%] text-center truncate">
        <TooltipLayout text={e?.company_name ?? "-"}>
          <p>{e?.company_name ? e.company_name : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[7%] text-center truncate">
        <TooltipLayout text={e?.business_type ?? "-"}>
          <p>{e?.business_type ? e.business_type : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[8%] text-center truncate">
        <TooltipLayout text={e?.university_name ?? "-"}>
          <p>{e?.university_name ? e.university_name : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[12%] flex gap-1 justify-center items-center">
        {confirmDelete ? (
          <div className="flex gap-1 items-center">
            <span className="text-xs text-red-600 whitespace-nowrap">Delete?</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2 text-xs"
              onClick={handleDelete}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => setConfirmDelete(false)}
            >
              No
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-red-500 hover:text-red-700"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Edit Student</SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-4 overflow-y-auto">
              <UpdateStudentData
                user={e}
                onSuccess={() => {
                  setEditOpen(false);
                  revalidator.revalidate();
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </TableCell>
    </TableRow>
  );
};

export default StudentRow;

