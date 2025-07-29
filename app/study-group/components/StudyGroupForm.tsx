import { UseFormReturn, useWatch } from "react-hook-form";
import { category, StudyGroupFormData } from "../types/studyGroup";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface StduyGroupFormProps {
  router: AppRouterInstance;
  form: UseFormReturn<StudyGroupFormData>;
  onSubmit: (data: StudyGroupFormData) => Promise<any>;
  submitButtonLabel: string;
  loading: boolean;
}

export function StudyGroupForm({ router, form, onSubmit, submitButtonLabel, loading }: StduyGroupFormProps) {
  const isOnline = useWatch({
    control: form.control,
    name: "is_online",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5 border rounded-xl shadow-sm">
        <FormField
          control={form.control}
          name="group_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>스터디 그룹명</FormLabel>
              <FormControl>
                <Input placeholder="스터디 그룹명을 입력해주세요." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            const currentLength = field.value.length;
            return (
              <FormItem>
                <FormLabel>스터디 설명</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea placeholder="스터디에 대한 설명을 입력하세요" {...field} maxLength={200} />
                    <p className="absolute right-0 text-sm text-muted-foreground mt-1">{currentLength}/200</p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {category.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
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
          name="max_members"
          render={({ field }) => (
            <FormItem>
              <FormLabel>최대 인원</FormLabel>
              <FormControl>
                <Input type="number" placeholder="예: 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_online"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">온라인 여부</FormLabel>
            </FormItem>
          )}
        />

        {!isOnline && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>오프라인 장소</FormLabel>
                <FormControl>
                  <Input placeholder="장소 입력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>그룹 상태</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="모집 중">모집 중</SelectItem>
                  <SelectItem value="진행 중">진행 중</SelectItem>
                  <SelectItem value="종료">종료</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" disabled={loading} className="w-full">
            {submitButtonLabel}
          </Button>

          <Button type="button" onClick={() => router.back()} className="w-full bg-rose-500 hover:bg-rose-400 mt-2">
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
