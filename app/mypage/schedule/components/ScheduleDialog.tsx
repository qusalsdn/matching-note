import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StudyGroup, StudySchedule } from "../page";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";
import useSWR, { KeyedMutator } from "swr";
import { Database } from "@/utils/supabase/types";
import Image from "next/image";
import { User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const scheduleSchema = z.object({
  title: z.string().min(3, "제목은 3~20자 이내여야 합니다.").max(20, "제목은 3~20자 이내여야 합니다."),
  date: z
    .object({
      from: z.date({ required_error: "시작일을 선택해주세요." }),
      to: z.date({ required_error: "종료일을 선택해주세요." }).optional(),
    })
    .nullable(),
  notes: z.string().max(100, "메모는 최대 100자까지 입력 가능합니다.").optional(),
  location: z.string().max(50, "장소는 최대 50자까지 입력 가능합니다.").optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

type ScheduleDialogProps = {
  studySchedule: StudySchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myStudyGroup: StudyGroup[];
  userId: string;
  data: StudySchedule[] | null | undefined;
  mutate: KeyedMutator<
    | {
        creator_id: string;
        end_time: string | null;
        group_id: number;
        id: number;
        location: string | null;
        notes: string | null;
        start_time: string;
        title: string;
      }[]
    | null
  >;
};

const LOADING_TEXT = "...";
const IMAGE_SIZE = 17;

export default function ScheduleDialog({
  studySchedule,
  open,
  onOpenChange,
  myStudyGroup,
  userId,
  data: studySchedules,
  mutate,
}: ScheduleDialogProps) {
  const form = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: "",
      date: { from: new Date() },
      notes: "",
      location: "",
    },
  });

  const fetcher = async () => {
    if (!studySchedule?.id) return;

    try {
      const { data, error } = await supabase
        .from("schedule_attendances")
        .select("*, users(*)")
        .eq("schedule_id", studySchedule.id);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("참석 정보를 가져오는 중 오류:", error);
      toast.error("참석 정보를 불러오는 도중 오류가 발생하였습니다..ㅜ");
    }
  };

  const { data: scheduleAttendances, mutate: mutateSchedule } = useSWR(`${studySchedule?.id}/${userId}`, fetcher);

  const [date, setDate] = useState<DateRange>({ from: new Date() });
  const [loading, setLoading] = useState(false);

  const isCreator = studySchedule?.creator_id === userId;
  const disabled = !isCreator;

  const scheduleChecked = useMemo(
    () => scheduleAttendances?.some((item) => item.user_id === userId && item.status) ?? false,
    [scheduleAttendances, userId]
  );

  const attendingUsers = useMemo(() => scheduleAttendances?.filter((item) => item.status === true), [scheduleAttendances]);

  const notAttendingUsers = useMemo(() => scheduleAttendances?.filter((item) => item.status === false), [scheduleAttendances]);

  useEffect(() => {
    if (studySchedule) {
      const startDate = new Date(studySchedule.start_time);
      const endDate = studySchedule.end_time ? new Date(studySchedule.end_time) : undefined;

      form.reset({
        title: studySchedule.title,
        date: {
          from: startDate,
          to: endDate,
        },
        notes: studySchedule.notes ?? "",
        location: studySchedule.location ?? "",
      });

      setDate({
        from: startDate,
        to: endDate,
      });
    }
  }, [form, studySchedule]);

  const handleReset = () => {
    form.reset();
    setDate({
      from: studySchedule?.start_time ? new Date(studySchedule.start_time) : new Date(),
      to: studySchedule?.end_time ? new Date(studySchedule.end_time) : undefined,
    });
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const onSubmit = async (data: ScheduleForm) => {
    if (!studySchedule?.id || loading) return;

    setLoading(true);

    const { date: dateRange, ...rest } = data;

    try {
      await mutate(
        async () => {
          const updatedData = studySchedules?.map((item) =>
            item.id === studySchedule.id
              ? {
                  ...item,
                  title: data.title,
                  start_time: formatDateToYYYYMMDD(dateRange?.from ?? new Date()),
                  end_time: dateRange?.to ? formatDateToYYYYMMDD(dateRange.to) : null,
                  notes: data.notes ?? null,
                  location: data.location ?? null,
                }
              : item
          );

          const { error } = await supabase
            .from("study_schedules")
            .update({
              ...rest,
              start_time: formatDateToYYYYMMDD(dateRange?.from ?? new Date()),
              end_time: dateRange?.to ? formatDateToYYYYMMDD(dateRange.to) : null,
            })
            .eq("id", studySchedule.id);

          if (error) throw error;

          onOpenChange(false);

          toast.success("일정이 수정되었습니다!");

          return updatedData;
        },
        { rollbackOnError: true, populateCache: true, revalidate: false }
      );
    } catch (error) {
      console.error("일정 수정 오류:", error);
      toast.error("일정 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudyScheduleDelete = async () => {
    if (!studySchedule?.id || loading) return;

    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!isConfirmed) return;

    setLoading(true);

    try {
      await mutate(
        async () => {
          const updatedData = studySchedules?.filter((item) => item.id !== studySchedule.id) ?? [];

          const { error } = await supabase.from("study_schedules").delete().eq("id", studySchedule.id);

          if (error) throw error;

          onOpenChange(false);

          toast.success("일정이 삭제되었습니다!");

          return updatedData;
        },
        { rollbackOnError: true, populateCache: true, revalidate: false }
      );
    } catch (error) {
      console.error("일정 삭제 오류:", error);
      toast.error("일정 삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onCheckedChange = async (checked: boolean) => {
    if (!studySchedule?.id || loading) return;

    setLoading(true);

    try {
      mutateSchedule(
        async () => {
          const updatedData = scheduleAttendances?.map((item) => (item.user_id === userId ? { ...item, status: checked } : item));

          const { error } = await supabase
            .from("schedule_attendances")
            .update({ status: checked })
            .eq("schedule_id", studySchedule.id)
            .eq("user_id", userId)
            .select("id")
            .single();

          if (error) throw error;

          return updatedData;
        },
        { rollbackOnError: true, populateCache: true, revalidate: false }
      );

      toast.success(checked ? "참석으로 변경되었습니다!" : "미참석으로 변경되었습니다!");
    } catch (error) {
      console.error("참석여부 변경 오류:", error);
      toast.error("참석여부 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const UserProfile = ({ user }: { user: Database["public"]["Tables"]["users"]["Row"] }) => (
    <div className="flex items-center space-x-1">
      {user.profile_image_url ? (
        <Image
          alt={`${user.username} 프로필`}
          src={user.profile_image_url}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          className="rounded-full"
        />
      ) : (
        <div className="border rounded-full p-1 shadow-sm">
          <User size={IMAGE_SIZE} />
        </div>
      )}
      <span className="text-sm">{user.username}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>일정 상세</DialogTitle>
          <DialogDescription>일정의 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 max-h-96 py-5 overflow-auto">
              <div className="space-y-2">
                <FormLabel>스터디 그룹</FormLabel>
                <Select value={studySchedule?.group_id.toString()} disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="스터디 그룹 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {myStudyGroup.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm" disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜</FormLabel>
                    <FormControl>
                      <Calendar
                        mode="range"
                        selected={date}
                        onSelect={(selected) => {
                          if (selected) {
                            setDate(selected);
                            field.onChange(selected);
                          }
                        }}
                        className="rounded-md border shadow-md mx-auto max-w-xs"
                        captionLayout="dropdown"
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>노트</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="text-sm" disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>장소</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm" disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex items-end justify-between space-x-1">
                  <h2>참석여부</h2>
                  <Checkbox checked={scheduleChecked} onCheckedChange={onCheckedChange} className="w-5 h-5" disabled={loading} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-green-500 font-medium">참석 ({attendingUsers?.length})</span>
                    <div className="space-y-1">
                      {attendingUsers?.map((item) => (
                        <UserProfile key={`attending-${item.id}`} user={item.users} />
                      ))}
                      {attendingUsers?.length === 0 && <span className="text-sm text-gray-500">참석자가 없습니다.</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-red-500 font-medium">미참석 ({notAttendingUsers?.length})</span>
                    <div className="space-y-1">
                      {notAttendingUsers?.map((item) => (
                        <UserProfile key={`not-attending-${item.id}`} user={item.users} />
                      ))}
                      {notAttendingUsers?.length === 0 && <span className="text-sm text-gray-500">미참석자가 없습니다.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between">
              <div>
                <Button type="button" variant="destructive" onClick={handleStudyScheduleDelete} disabled={disabled || loading}>
                  {loading ? LOADING_TEXT : "삭제"}
                </Button>
              </div>

              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  취소
                </Button>

                <Button type="submit" disabled={loading || disabled}>
                  {loading ? LOADING_TEXT : "수정"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
