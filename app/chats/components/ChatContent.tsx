"use client";

import { useUserId } from "@/app/hooks/useUserId";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { useEffect, useState } from "react";
import ChatForm from "./ChatForm";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Messages = Database["public"]["Tables"]["messages"]["Row"];

export default function ChatContent({ id }: { id: string }) {
  const router = useRouter();
  const userId = useUserId();
  const [messages, setMessages] = useState<Messages[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", Number(id))
        .eq("sender_id", userId)
        .order("send_at", { ascending: true });
      setMessages(data ?? []);
    };

    fetchMessages();

    const channels = supabase
      .channel("custom-insert-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Messages]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [id, userId]);

  return (
    <div className="flex flex-col justify-between h-full">
      <ChevronLeft onClick={() => router.back()} className="cursor-pointer" />

      <div className="space-y-5">
        <section className="flex flex-col gap-2 overflyauto">
          {messages.map((item) => (
            <div key={item.id} className={clsx("flex", item.sender_id === userId ? "justify-end" : "justify-start")}>
              <div className="max-w-[60%] border-2 p-2 rounded-md">
                <span>{item.content}</span>
              </div>
            </div>
          ))}
        </section>

        <section>
          <ChatForm roomId={Number(id)} userId={userId} />
        </section>
      </div>
    </div>
  );
}
