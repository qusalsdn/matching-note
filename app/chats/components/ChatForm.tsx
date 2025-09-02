"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({ content: z.string().min(1, "최소 1자리 이상 입력해주세요.") });

type Message = z.infer<typeof formSchema>;

export default function ChatForm({ roomId, userId }: { roomId: number; userId: string }) {
  const form = useForm<Message>({ resolver: zodResolver(formSchema), defaultValues: { content: "" } });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Message) => {
    setLoading(true);

    try {
      const { error } = await supabase.from("messages").insert({ room_id: roomId, sender_id: userId, content: data.content });

      form.reset();

      if (error) throw error;
    } catch (error) {
      console.error(error);
      toast.error("메시지 전송 중 오류가 발생하였습니다..ㅜ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="내용을 입력해주세요." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="rounded-md" disabled={loading}>
          <ArrowUp />
        </Button>
      </form>
    </Form>
  );
}
