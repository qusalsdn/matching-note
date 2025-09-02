"use client";

import { useUserId } from "@/app/hooks/useUserId";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  room_name: z.string().min(3, "채팅방 이름은 3~20자 이내여야 합니다.").max(20, "채팅방 이름은 3~20자 이내여야 합니다."),
  is_private: z.boolean(),
  group_id: z.coerce.number({ message: "스터디 그룹을 선택해주세요." }),
});

type ChatRoomFormData = z.infer<typeof formSchema>;

type GroupMembers = Database["public"]["Tables"]["group_members"]["Row"] & {
  study_groups: Database["public"]["Tables"]["study_groups"]["Row"];
};

export default function ChatsCreate() {
  const router = useRouter();
  const userId = useUserId();
  const form = useForm<ChatRoomFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      room_name: "",
      is_private: false,
      group_id: undefined,
    },
  });

  const [groupMembers, setGroupMembers] = useState<GroupMembers[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase.from("group_members").select("*, study_groups(*)").eq("user_id", userId);

        if (error) throw error;

        setGroupMembers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGroupMembers();
  }, [userId]);

  const onSubmit = async (data: ChatRoomFormData) => {
    setLoading(true);
    try {
      const { data: ChatRoom, error: chatRoomsError } = await supabase.from("chat_rooms").insert(data).select("id").single();

      if (chatRoomsError) throw chatRoomsError;

      const { error: chatParticipants } = await supabase
        .from("chat_participants")
        .insert({ room_id: ChatRoom.id, user_id: userId });

      if (chatParticipants) throw chatParticipants;

      toast.success("채팅방이 생성되었습니다.!");

      router.replace(`/chats/${ChatRoom.id}`);
    } catch (error) {
      console.error(error);
      toast.error("채팅방 생성 중 오류가 발생하였습니다..ㅜ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>채팅방 생성</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="room_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>채팅방 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="새로운 채팅방" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>비공개 채팅방</FormLabel>
                    <FormDescription>체크하면 이 채팅방은 비공개로 생성됩니다.</FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>그룹 ID</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="스터디 그룹을 선택해주세요."></SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>스터디 그룹</SelectLabel>
                          {groupMembers?.map((groupMember) => (
                            <SelectItem key={groupMember.study_groups.id} value={groupMember.study_groups.id.toString()}>
                              {groupMember.study_groups.group_name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              채팅방 생성
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
