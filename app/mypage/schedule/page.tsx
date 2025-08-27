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
import ScheduleCreateDialog from "./components/ScheduleCreateDialog";
import useSWR from "swr";
import { getCalendarEndDate } from "@/utils/dateUtils";
import ScheduleDialog from "./components/ScheduleDialog";

export type StudySchedule = Database["public"]["Tables"]["study_schedules"]["Row"];
export type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"];

export default function Schedule() {
  const router = useRouter();
  const userId = useUserId();

  const fetcher = async (userId: string) => {
    const { data: myGroups } = await supabase.from("group_members").select("group_id").eq("user_id", userId);

    const groupIds = myGroups?.map((item) => item.group_id);

    const { data } = await supabase
      .from("study_schedules")
      .select("*")
      .in("group_id", groupIds ?? []);

    return data;
  };
  const { data, mutate } = useSWR(userId, fetcher);

  const [currentTitle, setCurrentTitle] = useState("");
  const [myStudyGroup, setMyStudyGroup] = useState<StudyGroup[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [studySchedule, setStudySchedule] = useState<StudySchedule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) setCurrentTitle(api.view.title);
  }, []);

  useEffect(() => {
    const fetchStudyGroup = async () => {
      const { data } = await supabase.from("study_groups").select("*").eq("leader_id", userId);
      if (data) setMyStudyGroup(data);
    };
    fetchStudyGroup();
  }, [userId]);

  const mapToEventInput = (apiEvents: StudySchedule[]) => {
    return apiEvents.map((item: StudySchedule) => ({
      id: String(item.id),
      title: item.title,
      start: item.start_time,
      end: item.end_time ? getCalendarEndDate(item.end_time) : undefined,
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

  const handleEventClick = (info: any) => {
    const schedule = data?.find((item) => item.id === Number(info.event.id)) ?? null;
    setStudySchedule(schedule);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <section className="mb-5 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
          <span className="text-lg font-bold mb-1">일정 관리</span>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>일정 생성</Button>

        <ScheduleCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          myStudyGroup={myStudyGroup}
          userId={userId}
        />
      </section>

      <section>
        <ScheduleDialog
          studySchedule={studySchedule}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          myStudyGroup={myStudyGroup}
          userId={userId}
          data={data}
          mutate={mutate}
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

            <Button type="button" onClick={handleNext}>
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
            events={mapToEventInput(data ?? [])}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "",
              center: "",
              right: "",
            }}
            locale={"ko"}
            datesSet={handleDatesSet}
            height={"100%"}
            contentHeight={"100%"}
          />
        </div>
      </section>
    </div>
  );
}
