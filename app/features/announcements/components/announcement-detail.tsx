import { AnnouncementTag } from "~/components/announcement/announcement-tag";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { CalendarDays, Send, Users } from "lucide-react";
import type { Announcement, AnnouncementReply, User } from "~/types/api";
import CreateAnnouncementReply from "./create-announcement-reply";
import { useAuth } from "~/lib/auth";
import { Accordion } from "~/components/ui/accordion";
import AccordionLayout from "~/components/layouts/accordion-layout";
import {useEffect, useRef, useState} from "react";
import { getAnnouncementReplyByAnnouncement } from "../api/get-announcement-reply-by-announcement";
import { AnnouncementReplyCard } from "./announcement-reply-card";
import EmptyMessage from "~/components/ui/empty-message";
import { useRole } from "~/provider/role-testing-provider";
import { getAnnouncementReplyByUser } from "../api/get-announcement-reply-by-user";
import { Button } from "~/components/ui/button";
import SendAnnouncement from "./send-announcement";
import { sendAnnouncement } from "../api/send-email-announcement";
import toast from "react-hot-toast";
import { getUsers } from "~/features/home/api/get-student-data";
import { Modal } from "~/components/modal";
import {createAnnouncementApply} from "~/features/announcements/api/create-announcement-apply";
import {getUserApplied} from "~/features/announcements/api/get-user-applied";
import {useNavigate} from "react-router";
import {EmploymentStatus} from "~/types/enum";

interface Props {
  announcement: Announcement;
}

export const AnnouncementDetail = ({ announcement }: Props) => {
  const navigate = useNavigate()
  const {user} = useAuth()
  const [replies, setReplies] = useState<AnnouncementReply[]>([])
  const [isSend, setSend] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isApplied, setIsApplied] = useState<boolean>(false)
  const [status, setStatus] = useState<string>("")
  const minGpaRef = useRef<HTMLInputElement>(null);
  const maxGpaRef = useRef<HTMLInputElement>(null);
  const gpaSortRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const majorRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({
    major: "",
    minGpa: "",
    maxGpa: "",
    status: "",
  });

  const activeFilters = [
    filters.major && {
      key: "major",
      label: `Major: ${filters.major}`,
    },
    (filters.minGpa || filters.maxGpa) && {
      key: "gpa",
      label: `GPA: ${filters.minGpa || "0"} - ${filters.maxGpa || "4"}`,
    },
    filters.status && {
      key: "status",
      label: `Status: ${filters.status}`,
    },
  ].filter(Boolean);

  const getReplies = async () => {

    const {data: replies} = user?.name == 'admin' ? 
    await getAnnouncementReplyByAnnouncement({announcementId: announcement.id}): 
    await getAnnouncementReplyByUser({userId: user?.id ?? ""})
    
    setReplies(replies)
  }
  const getAllUsers = async () => {
    const {data: users} = await getUsers(1,10000,
        undefined,
        filters.major || undefined,
        filters.minGpa || undefined,
        filters.maxGpa || undefined,
        undefined,
        status || undefined)
    setUsers(users)
    console.log(users)
  }

  const applyJob = async () => {
    const toastId = toast.loading("Sending applications...")
    try {
      if (user){
        await createAnnouncementApply({ user_id: user.id, announcement_id: announcement.id })
      }
      toast.success("Application successfully sent", {id: toastId})
      setIsApplied(true)
    } catch (error) {
      toast.error("Application failed to sent", {id: toastId})
      setIsApplied(false)
    }
  }

  const getAnnouncementStatus = async () => {
    if(user){
      let response = await getUserApplied({user_id: user.id, announcement_id: announcement.id})
      setIsApplied(response)
    }else{
      setIsApplied(false)
    }
  }

  const applyFilter = () => {
    const filters = {
      major: majorRef.current?.value ?? "",
      minGpa: minGpaRef.current?.value ?? "",
      maxGpa: maxGpaRef.current?.value ?? "",
      status: statusRef.current?.value ?? "",
    };
    setFilters(filters)
  };

  const clearAllFilters = () => {
    if (majorRef.current) majorRef.current.value = '';
    if (minGpaRef.current) minGpaRef.current.value = '';
    if (maxGpaRef.current) maxGpaRef.current.value = '';
    if (gpaSortRef.current) gpaSortRef.current.value = '';
    if (statusRef.current) statusRef.current.value = '';
    setFilters({
      major: "",
      minGpa: "",
      maxGpa: "",
      status: "",
    });
  };

  const removeFilter = (key: string) => {
    if (key === "gpa") {
      if (minGpaRef.current) minGpaRef.current.value = "";
      if (maxGpaRef.current) maxGpaRef.current.value = "";
    }

    if (key === "major" && majorRef.current) {
      majorRef.current.value = "";
    }

    if (key === "status" && statusRef.current) {
      statusRef.current.value = "";
    }

    setFilters((prev) => {
      if (key === "gpa") {
        return { ...prev, minGpa: "", maxGpa: "" };
      }
      return { ...prev, [key]: "" };
    });
  };

  useEffect(() => {
    getReplies()
    getAnnouncementStatus()
  }, [])

  const blastAnnouncement = async () =>{
    getAllUsers()
    setSend(true)
  }


  if (!user){
    return <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="You are prohibited to access this page. Please login first!" title="Unauthorized"/>
        <a href="/career-link/">Login here</a>
    </div>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col gap-3">
      <Button className={"absolute left-10"} onClick={()=> {navigate(-1)}}>Back</Button>
        <Modal onClose={() => setSend(false)} isOpen={isSend}>
          <SendAnnouncement announcement={announcement} users={users} />
        </Modal>
      {user.name == 'admin' && (
          <>
          <AccordionLayout text={"Blast Announcement"}>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Major</p>
              <input
                  ref={majorRef}
                  type="text"
                  placeholder="e.g. Computer Science"
                  defaultValue={filters.major ?? ""}
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
                    defaultValue={filters.minGpa ?? ""}
                    className="w-1/2 border border-gray-300 rounded-md px-2 py-2 text-sm"
                />
                <input
                    ref={maxGpaRef}
                    type="number"
                    step="0.01"
                    placeholder="Max"
                    defaultValue={filters.maxGpa ?? ""}
                    className="w-1/2 border border-gray-300 rounded-md px-2 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Employment Status</p>
              <select
                  ref={statusRef}
                  defaultValue={filters.status ?? ""}
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
              <Button onClick={clearAllFilters} variant="outline" className="flex-1 h-9">
                Clear
              </Button>
            </div>

            <Separator/>
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No filter is implemented
                  </p>
              ) : (
                  <div className={"flex flex-col gap-2"}>
                    <p className="text-sm italic">
                      Implemented Filter:
                    </p>
                    <div className={"flex flex-row gap-2"}>
                      {activeFilters.map((f: any) => (
                          <div
                              key={f.key}
                              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{f.label}</span>

                            <button
                                onClick={() => removeFilter(f.key)}
                                className="text-gray-500 hover:text-black"
                            >
                              ✕
                            </button>
                          </div>
                      ))}
                      <button
                          onClick={clearAllFilters}
                          className="text-sm text-red-500 underline ml-2"
                      >
                        Clear All
                      </button>
                    </div>

                  </div>
              )}
            </div>

            <Button size="sm" onClick={blastAnnouncement}>
              <Send className="h-4 w-4"/>
              Blast Announcements
            </Button>
          </AccordionLayout>

          <Button
            onClick={() => navigate(`/announcements/${announcement.id}/applicants`)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            View Applicants
          </Button>
          </>
      )}
      <AccordionLayout text={announcement.title} defaultValue={announcement.title}>
        <Card className="w-full">

          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <AnnouncementTag type={announcement.type}/>
              <Badge variant="outline" className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3"/>
                {announcement.created_at}
              </Badge>
            </div>
          </CardHeader>

          <Separator/>

          <CardContent className="space-y-6 pt-6">
            {announcement.image_path ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${announcement.image_path}`}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                  />
                </div>
            ) : (
                <div
                    className="w-full aspect-video rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    No image available
                  </p>
                </div>
            )}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {announcement.description}
              </p>
            </div>
            <Button onClick={applyJob} disabled={isApplied}>
              {isApplied ? "Already applied" : "Apply Job"}
            </Button>
          </CardContent>
        </Card>
      </AccordionLayout>
      <Card>
        <CardHeader className="space-y-4">
          <CreateAnnouncementReply announcementId={announcement.id} userId={user?.id ?? ""} onSuccess={getReplies}/>
        </CardHeader>
        <Separator/>
        <CardContent>
          {replies.map(e => <AnnouncementReplyCard reply={e} onSuccess={getReplies}/>)}
        </CardContent>
      </Card>
    </div>
  );
};
