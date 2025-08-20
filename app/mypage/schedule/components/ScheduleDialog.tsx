import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Database } from "@/utils/supabase/types";

type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"];

const scheduleSchema = z.object({
  group_id: z.string({ message: "스터디 그룹을 선택해주세요." }),
  creator_id: z.string(),
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myStudyGroup: StudyGroup[];
  userId: string;
  onSubmit: (data: ScheduleForm) => Promise<void>;
  loading?: boolean;
};

export default function ScheduleDialog({
  open,
  onOpenChange,
  myStudyGroup,
  userId,
  onSubmit,
  loading = false,
}: ScheduleDialogProps) {
  const form = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      group_id: undefined,
      creator_id: userId,
      title: "",
      date: { from: new Date() },
      notes: "",
      location: "",
    },
  });

  const [date, setDate] = useState<DateRange>({ from: new Date() });

  const handleSubmit = async (data: ScheduleForm) => {
    await onSubmit(data);
    handleReset();
  };

  const handleReset = () => {
    form.reset();
    setDate({ from: new Date() });
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>일정 생성</DialogTitle>
          <DialogDescription>일정의 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4 max-h-96 py-5 overflow-auto">
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>스터디 그룹</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="스터디 그룹 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {myStudyGroup.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.group_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <DialogFooter className="mt-3">
              <DialogClose asChild>
                <Button variant="outline" onClick={handleClose}>
                  취소
                </Button>
              </DialogClose>

              <Button type="submit" disabled={loading}>
                {loading ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
