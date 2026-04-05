import { FaFilter } from "react-icons/fa";
import type { User } from "~/types/api";
import TableLayout from "~/components/layouts/table-layout";
import Paginator from "~/components/ui/paginator";
import { Button } from "~/components/ui/button";
import { exportToExcel, importExcel } from "~/lib/excel";
import {useLocation, useNavigate, useRevalidator, useSearchParams} from "react-router";
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
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {EmploymentStatus} from "~/types/enum";
import Dropdown from "~/components/ui/dropdown";
import {Dock} from "lucide-react";

interface StudentProps {
  student: User[];
  cur: number;
  lastPage: number;
  search: string;
  major: string;
  minGpa: string;
  maxGpa: string;
  status: string;
  gpaSort: string;
  fetching: boolean;
}

const HomeAdmin = ({ student, cur, lastPage, search, major, minGpa, maxGpa, status, gpaSort, fetching }: StudentProps) => {

  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const majorRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const minGpaRef = useRef<HTMLInputElement>(null);
  const maxGpaRef = useRef<HTMLInputElement>(null);
  const gpaSortRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const [theParams] = useSearchParams();

  const buildParams = (overrides: Record<string, string>) => {
    const searchParams = new URLSearchParams(theParams);

    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    return searchParams.toString();
  };

  const triggerSearch = () => {
    const value = searchRef.current?.value ?? '';
    navigate(`/home?${buildParams({ search: value, page: '1' })}`);
  };

  const applyFilter = () => {
    const majorValue = majorRef.current?.value ?? '';
    const minGpaValue = minGpaRef.current?.value ?? '';
    const maxGpaValue = maxGpaRef.current?.value ?? '';
    const gpaSortValue = gpaSortRef.current?.value ?? '';
    const statusValue = statusRef.current?.value ?? '';
    navigate(
        `/home?${buildParams({
          major: majorValue,
          min_gpa: minGpaValue,
          max_gpa: maxGpaValue,
          gpa_sort: gpaSortValue,
          status: statusValue,
          page: '1',
        })}`
    );
    setFilterOpen(false);
  };

  const clearFilter = () => {
    if (majorRef.current) majorRef.current.value = '';
    if (minGpaRef.current) minGpaRef.current.value = '';
    if (maxGpaRef.current) maxGpaRef.current.value = '';
    if (gpaSortRef.current) gpaSortRef.current.value = '';
    if (statusRef.current) statusRef.current.value = '';

    navigate(`/home?page=1`);
    setFilterOpen(false);
  };

  const studentTemplate = [
    {
      nim: "",
      name: "",
      email: "",
      phone: "",
      major: "",
      gpa: "",
      status: "",
      cv: "",
      cv_file_path: ""
    }
  ];

  const mappingStudents = async (res: BatchUserInput[]) => {
    const toastId = toast.loading("Importing students...");
    try {
      const processedStudents = res.map(student => ({
        ...student,
        nim: String(student.nim || ''),
        phone: String(student.phone || ''),
        email: String(student.email || ''),
        name: String(student.name || ''),
        major: String(student.major || ''),
        gpa: Number(student.gpa || 0),
        status: String(student.status || ''),
        cv: String(student.cv || ''),
        cv_file_path: String(student.cv_file_path || '')
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
    if (cur === 1) return;
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.set("page", String(cur - 1));

    navigate(`/home?${searchParams.toString()}`);
  };

  const onNext = () => {
    if (cur === lastPage) return;
    console.log(window.location.search)
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.set("page", String(cur + 1));
    navigate(`/home?${searchParams.toString()}`);
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
    <div className="w-full px-6 flex flex-col">
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
          <label htmlFor="student-file" className="flex text-sm text-accent border border-accent bg-white items-center h-12 rounded-md gap-2 p-3 hover:text-white hover:bg-primary transition duration-400 cursor-pointer">
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
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                  variant="outline"
                  className={`flex items-center h-12 rounded-md gap-2 p-3 border ${
                      major || minGpa || maxGpa || status
                          ? "border-primary text-primary"
                          : "border-accent text-accent"
                  } bg-white hover:text-white transition duration-400`}
              >
                <FaFilter />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-72 p-4 flex flex-col gap-4" align="start">

              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Major</p>
                <input
                    ref={majorRef}
                    type="text"
                    placeholder="e.g. Computer Science"
                    defaultValue={major ?? ""}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">GPA</p>

                <div className="flex gap-2">
                  <input
                      ref={minGpaRef}
                      type="number"
                      step="0.01"
                      placeholder="Min"
                      defaultValue={minGpa ?? ""}
                      className="w-1/2 border border-gray-300 rounded-md px-2 py-2 text-sm"
                  />
                  <input
                      ref={maxGpaRef}
                      type="number"
                      step="0.01"
                      placeholder="Max"
                      defaultValue={maxGpa ?? ""}
                      className="w-1/2 border border-gray-300 rounded-md px-2 py-2 text-sm"
                  />
                </div>

                <select
                    ref={gpaSortRef}
                    defaultValue={gpaSort ?? ""}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">No sorting</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Employment Status</p>
                <select
                    ref={statusRef}
                    defaultValue={status ?? ""}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {Object.values(EmploymentStatus).map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={applyFilter} className="flex-1 h-9">
                  Apply
                </Button>
                <Button onClick={clearFilter} variant="outline" className="flex-1 h-9">
                  Clear
                </Button>
              </div>

            </PopoverContent>
          </Popover>
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
        ) : student.length === 0 ? (
          <tr>
            <td colSpan={10} className="py-16 text-center">
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-semibold text-gray-600">No Data Found</p>
                <p className="text-sm text-gray-400">No students match the current filters. Please adjust your search or filter criteria.</p>
              </div>
            </td>
          </tr>
        ) : (
            student.map((e, idx) => (
                <StudentRow
                    key={e.nim}
                    cur={cur}
                    idx={idx}
                    e={e}
                />
            ))
        )}
      </TableLayout>
      <Paginator cur={cur} student={student} onPrev={onPrev} onNext={onNext} lastPage={lastPage} />
    </div>
  );
};

export default HomeAdmin;
