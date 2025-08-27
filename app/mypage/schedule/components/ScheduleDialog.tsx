import { useEffect, useState } from "react";
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
import { KeyedMutator } from "swr";

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

export default function ScheduleDialog({
  studySchedule,
  open,
  onOpenChange,
  myStudyGroup,
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

  const [date, setDate] = useState<DateRange>({ from: new Date() });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studySchedule) {
      form.reset({
        title: studySchedule.title,
        date: {
          from: new Date(studySchedule.start_time),
          to: studySchedule.end_time ? new Date(studySchedule.end_time) : undefined,
        },
        notes: studySchedule.notes ?? "",
        location: studySchedule.location ?? "",
      });
      setDate({
        from: new Date(studySchedule.start_time),
        to: studySchedule.end_time ? new Date(studySchedule.end_time) : undefined,
      });
    }
  }, [form, studySchedule]);

  const handleReset = () => {
    form.reset();
    setDate({ from: new Date() });
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const onSubmit = async (data: ScheduleForm) => {
    setLoading(true);

    const { date, ...rest } = data;

    try {
      await mutate(
        async () => {
          const updatedData = studySchedules?.map((item) =>
            item.group_id === studySchedule?.group_id
              ? {
                  ...item,
                  title: data.title,
                  start_time: formatDateToYYYYMMDD(data.date?.from ?? new Date()),
                  end_time: data.date?.to ? formatDateToYYYYMMDD(data.date?.to ?? new Date()) : null,
                  notes: data.notes ?? null,
                  location: data.location ?? null,
                }
              : item
          );

          const { error } = await supabase
            .from("study_schedules")
            .update({
              ...rest,
              start_time: formatDateToYYYYMMDD(date?.from ?? new Date()),
              end_time: formatDateToYYYYMMDD(date?.to ?? new Date()),
            })
            .eq("group_id", studySchedule?.group_id ?? 0)
            .eq("creator_id", studySchedule?.creator_id ?? "");

          if (error) throw error;

          handleReset();

          onOpenChange(false);

          toast.success("일정이 수정되었습니다.!");

          return updatedData;
        },
        { rollbackOnError: true, populateCache: true, revalidate: false }
      );
    } catch (error) {
      console.error(error);
      toast.error("일정 수정 중 오류가 발생하였습니다..ㅜ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
          <DialogDescription>일정의 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 max-h-96 py-5 overflow-auto">
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

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm" />
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
                      <Textarea {...field} className="text-sm" />
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
                      <Input {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-3 flex justify-between">
              <div>
                <Button type="button" variant={"destructive"}>
                  삭제
                </Button>
              </div>

              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  취소
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? "수정 중..." : "수정"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
