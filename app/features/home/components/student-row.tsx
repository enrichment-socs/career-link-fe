import { useState } from "react";
import { Pencil, Trash2, Eye, Download } from "lucide-react";
import { useRevalidator } from "react-router";
import toast from "react-hot-toast";
import TooltipLayout from "~/components/layouts/tooltip-layout";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { TableCell, TableRow } from "~/components/ui/table";
import type { User } from "~/types/api";
import UpdateStudentData from "./update-student-data";
import { deleteStudentData } from "../api/delete-student-data";
import { getErrorMessage } from "~/lib/error";

interface Props {
  idx: number;
  cur: number;
  e: User;
}

const StudentRow = ({ idx, cur, e }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const revalidator = useRevalidator();

  const isExternalCv = e.cv_file_path?.startsWith("http") ?? false;

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting student...");
    try {
      await deleteStudentData(e.id);
      toast.success("Student deleted successfully", { id: toastId });
      setConfirmDelete(false);
      revalidator.revalidate();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

  const cvUrl = e.cv_file_path
    ? (e.cv_file_path.startsWith("http") ? e.cv_file_path : `${import.meta.env.VITE_STORAGE_URL}${e.cv_file_path}`)
    : null;

  return (
    <TableRow className="shadow-md p-5 border-box bg-white rounded-lg items-center my-2 flex w-full">
      <TableCell className="w-[3%] font-medium text-center">
        {idx + (cur - 1) * 10 + 1}
      </TableCell>

      <TableCell className="w-[10%] text-center">{e?.nim ?? "-"}</TableCell>

      <TableCell className="w-[12%] text-center whitespace-normal break-words">
        {e?.name ?? "-"}
      </TableCell>

      <TableCell className="w-[17%] text-center">
        <TooltipLayout text={e?.email ?? "no email"}>
          <p>{e?.email ? e.email : "-"}</p>
        </TooltipLayout>
      </TableCell>

      {/*<TableCell className="w-[12%] text-center">*/}
      {/*  {e?.phone ? e.phone.replace("+62", "0") : "-"}*/}
      {/*</TableCell>*/}

      <TableCell className="w-[8%] text-center whitespace-normal break-words">
        <TooltipLayout text={e?.major ?? "no major yet"}>
          <p>{e?.major ? e.major : "-"}</p>
        </TooltipLayout>
      </TableCell>

        <TableCell className="w-[8%] text-center whitespace-normal break-words">
            <TooltipLayout text={e?.gpa ?? "no gpa yet"}>
                <p>{e?.gpa ? e.gpa : "-"}</p>
            </TooltipLayout>
        </TableCell>

        <TableCell className="w-[8%] text-center whitespace-normal break-words">
            <TooltipLayout text={e?.status ?? "no status yet"}>
                <p>{e?.status ? e.status : "-"}</p>
            </TooltipLayout>
        </TableCell>

      <TableCell className="w-[9%] text-center whitespace-normal break-words">
        <TooltipLayout text={e?.future_position ?? "no future position yet"}>
          <p>{e?.future_position ? e.future_position : "-"}</p>
        </TooltipLayout>
      </TableCell>

      <TableCell className="w-[7%] text-center whitespace-normal break-words">
        <TooltipLayout text={e?.skill ?? "no skill yet"}>
          <p>{e?.skill ? e.skill : "-"}</p>
        </TooltipLayout>
      </TableCell>

        <TableCell className="w-[7%] text-center whitespace-normal break-words">
            <TooltipLayout text={e?.skill ?? "no cv yet"}>
                <p>{e?.cv ? e.cv : "-"}</p>
            </TooltipLayout>
        </TableCell>

      {/*<TableCell className="w-[6%] text-center">*/}
      {/*  {cvUrl ? (*/}
      {/*    <div className="flex gap-1 justify-center">*/}
      {/*      {isExternalCv ? (*/}
      {/*        <Button variant="outline" size="icon" asChild>*/}
      {/*          <a href={cvUrl} target="_blank" rel="noreferrer">*/}
      {/*            <Eye className="h-4 w-4" />*/}
      {/*          </a>*/}
      {/*        </Button>*/}
      {/*      ) : (*/}
      {/*        <Button variant="outline" size="icon" onClick={() => window.open(cvUrl, "_blank")}>*/}
      {/*          <Eye className="h-4 w-4" />*/}
      {/*        </Button>*/}
      {/*      )}*/}
      {/*      <Button variant="outline" size="icon" asChild>*/}
      {/*        <a href={cvUrl} download target="_blank" rel="noreferrer">*/}
      {/*          <Download className="h-4 w-4" />*/}
      {/*        </a>*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*  ) : (*/}
      {/*    <span className="text-muted-foreground text-xs">-</span>*/}
      {/*  )}*/}
      {/*</TableCell>*/}

      <TableCell className="w-[16%] flex gap-1 justify-center items-center">
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

