"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Database } from "@/utils/supabase/types";
import { supabase } from "@/utils/supabase/client";
import { useUserId } from "@/app/hooks/useUserId";
import toast from "react-hot-toast";
import ScheduleDialog from "./components/ScheduleDialog";

type Schedule = Database["public"]["Tables"]["study_schedules"]["Row"];
type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"];

type ScheduleForm = {
  group_id: string;
  creator_id: string;
  title: string;
  date: {
    from: Date;
    to?: Date;
  } | null;
  notes?: string;
  location?: string;
};

export default function Schedule() {
  const router = useRouter();
  const userId = useUserId();

  const [currentTitle, setCurrentTitle] = useState("");
  const [events, setEvents] = useState<Schedule[]>([]);
  const [myStudyGroup, setMyStudyGroup] = useState<StudyGroup[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      setCurrentTitle(api.view.title);
    }
  }, []);

  useEffect(() => {
    const fetchStudyGroup = async () => {
      const { data } = await supabase.from("study_groups").select("*").eq("leader_id", userId);
      if (data) setMyStudyGroup(data);
    };
    fetchStudyGroup();
  }, [userId]);

  const mapToEventInput = (apiEvents: Schedule[]) => {
    return apiEvents.map((item: Schedule) => ({
      id: String(item.id),
      title: item.title,
      start: item.start_time,
      end: item.end_time ?? undefined,
      extendedProps: {
        groupId: item.group_id,
        location: item.location,
        notes: item.notes,
      },
    }));
  };

  const handleDatesSet = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCurrentTitle(calendarApi.view.title);
    }
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
  };

  const handleDateClick = (arg: any) => {
    console.log(arg);
  };

  const onSubmit = async (data: ScheduleForm) => {
    const { date, ...rest } = data;
    setLoading(true);

    try {
      const { error } = await supabase.from("study_schedules").insert({
        ...rest,
        group_id: Number(data.group_id),
        creator_id: userId,
        start_time: date?.from.toISOString(),
        end_time: date?.to?.toISOString(),
      });

      if (error) {
        toast.error("일정 생성 중 오류가 발생하였습니다..ㅜ");
        return;
      }

      setDialogOpen(false);

      toast.success("일정이 생성되었습니다.!");
    } catch (error) {
      console.error(error);
      toast.error("일정 생성 중 오류가 발생하였습니다..ㅜ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="mb-5 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
          <span className="text-lg font-bold mb-1">일정 관리</span>
        </div>

        <Button onClick={() => setDialogOpen(true)}>일정 생성</Button>

        <ScheduleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          myStudyGroup={myStudyGroup}
          userId={userId}
          onSubmit={onSubmit}
          loading={loading}
        />
      </section>

      <section>
        <div className="flex items-center justify-between space-x-3">
          <Button type="button" onClick={handleToday}>
            오늘
          </Button>

          <h2 className="text-xl font-bold">{currentTitle}</h2>

          <div className="space-x-2">
            <Button type="button" onClick={handlePrev}>
              <ChevronLeft />
            </Button>

            <Button type="button" onClick={handleNext} disabled={loading}>
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="h-[410px] lg:h-[650px]">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={true}
            editable={true}
            events={mapToEventInput(events)}
            dateClick={handleDateClick}
            headerToolbar={{
              left: "",
              center: "",
              right: "",
            }}
            locale={"ko"}
            datesSet={handleDatesSet}
            height={"100%"}
            contentHeight={"100%"}
            dayMaxEventRows={3}
          />
        </div>
      </section>
    </div>
  );
}
