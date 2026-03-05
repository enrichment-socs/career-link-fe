import { FaFilter } from "react-icons/fa";
import type { User } from "~/types/api";
import TableLayout from "~/components/layouts/table-layout";
import Paginator from "~/components/ui/paginator";
import { Button } from "~/components/ui/button";
import { exportToExcel, importExcel } from "~/lib/excel";
import { useNavigate, useRevalidator } from "react-router";
import { syncUser } from "../api/sync-student-data";
import { getUsers } from "../api/get-student-data";
import { useRef, useState, type ChangeEvent } from "react";
import { MasterDataTableHeader } from "~/components/ui/table-header";
import StudentRow from "./student-row";
import { compare } from "~/lib/utils";
import toast from "react-hot-toast";
import { getErrorMessage } from "~/lib/error";
import { Progress } from "~/components/ui/progress";
import { createBatchUsers, type BatchUserInput } from "../api/create-batch-users";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import CreateStudentData from "./create-student-data";

interface StudentProps {
  student: User[];
  cur: number;
  lastPage: number;
  search: string;
  fetching: boolean;
}

const HomeAdmin = ({ student, cur, lastPage, search, fetching }: StudentProps) => {

  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const triggerSearch = () => {
    const value = searchRef.current?.value ?? '';
    const params = new URLSearchParams();
    if (value) params.set('search', value);
    params.set('page', '1');
    navigate(`/home?${params}`);
  };

  // Student data template based on User type
  const studentTemplate = [
    {
      nim: "",
      name: "",
      email: "",
      phone: "",
      major: "",
      cv_file_path: ""
    }
  ];

  const mappingStudents = async (res: BatchUserInput[]) => {
    const toastId = toast.loading("Importing students...");
    try {
      // Convert numeric fields to strings
      const processedStudents = res.map(student => ({
        ...student,
        nim: String(student.nim || ''),
        phone: String(student.phone || ''),
        email: String(student.email || ''),
        name: String(student.name || ''),
        major: String(student.major || ''),
        cv_file_path: String(student.cv_file_path || '') // Always send as string, never null
      }));

      await createBatchUsers(processedStudents);
      toast.success("Students imported successfully", { id: toastId });
      setTimeout(() => {
        setProgress(0);
        revalidator.revalidate();
      }, 2000);
    } catch (error) {
      toast.error(getErrorMessage(error), {
        id: toastId,
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const importStudents = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = (event) => importExcel<BatchUserInput>(event, (res) => mappingStudents(res));
    reader.readAsArrayBuffer(e.target.files![0]);
  };

  const onPrev = () => {
    if (cur == 1) return;
    navigate(`/home?page=${cur - 1}`);
  };
  const onNext = () => {
    if (lastPage == cur) return;
    navigate(`/home?page=${cur + 1}`);
  };
  const sync = () => {
    setLoading(true);
    const toastId = toast.loading("Syncing data...")
    syncUser().then(() => {
      toast.success("Sync success", { id: toastId })

      setTimeout(() => {
        setLoading(false);
        navigate(`/?page=${1}`);
      }, 2000);

    });
  };

  const downloadAllStudents = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Fetching all student data...");
    try {
      const { data: all } = await getUsers(1, 99999);
      exportToExcel("student-data-master", all);
      toast.success("Download complete", { id: toastId });
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container flex flex-col">
      <h1 className="text-2xl text-primary font-bold mb-4">Student Lists</h1>
      <div className="mb-4 flex gap-2 w-full max-w-md">
        <input
          ref={searchRef}
          type="text"
          placeholder="Search by name, NIM, or email..."
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={triggerSearch} className="h-9 px-4">
          Search
        </Button>
      </div>
      <div className="flex justify-between items-center">

        <div className="flex gap-4">
          <Button
            onClick={downloadAllStudents}
            disabled={isDownloading}
            className="flex text-accent border border-accent bg-white items-center h-12 rounded-md gap-2 p-3 hover:text-white transition duration-400"
          >
            {isDownloading ? "Downloading..." : "Download Student Data"}
          </Button>
          <label htmlFor="student-file" className="flex text-accent border border-accent bg-white items-center h-12 rounded-md gap-2 p-3 hover:text-white hover:bg-primary transition duration-400 cursor-pointer">
            Import Student Data from Excel
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="student-file"
            hidden
            accept=".xlsx,.xls"
            onChange={importStudents}
          />
          <Button
            onClick={() => exportToExcel("student-data-template", studentTemplate)}
            className="flex text-accent border border-accent bg-white items-center h-12 rounded-md gap-2 p-3 hover:text-white transition duration-400"
          >
            Download Student Data Excel Template
          </Button>
          <Button
            onClick={sync}
            className="flex text-accent border border-accent bg-white items-center h-12 rounded-md gap-2 p-3 hover:text-white transition duration-400"
          >
            {isLoading ? "Syncing..." : "Sync Data"}
          </Button>
          <div className="flex text-accent border border-accent bg-white items-center h-12 rounded-md gap-2 p-3">
            <FaFilter />
            <div>Filter</div>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="flex items-center h-12 rounded-md gap-2 p-3"
          >
            + Add New Student
          </Button>
        </div>
      </div>
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Student</SheetTitle>
          </SheetHeader>
          <div className="mt-4 px-4">
            <CreateStudentData
              onSuccess={() => {
                setAddOpen(false);
                revalidator.revalidate();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
      {progress > 0 && <Progress value={progress} className="w-full" />}
      <Paginator cur={cur} student={student} onPrev={onPrev} onNext={onNext} lastPage={lastPage} />
      <TableLayout
        header={<MasterDataTableHeader />}
      >
        {fetching ? (
          <tr>
            <td colSpan={10} className="py-10 text-center text-sm text-gray-400">
              Loading...
            </td>
          </tr>
        ) : (
          student.sort((a, b) => compare(a.nim ?? '', b.nim ?? '')).map(
            (e, idx) => (
              <StudentRow key={e.nim ?? idx} cur={cur} idx={idx} e={e} />
            )
          )
        )}
      </TableLayout>
      <Paginator cur={cur} student={student} onPrev={onPrev} onNext={onNext} lastPage={lastPage} />
    </div>
  );
};

export default HomeAdmin;
