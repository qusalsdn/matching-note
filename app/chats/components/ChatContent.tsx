"use client";

import { useUserId } from "@/app/hooks/useUserId";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { useCallback, useEffect, useState } from "react";
import ChatForm from "./ChatForm";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { utcToKst } from "@/utils/dateUtils";
import InfiniteScroll from "react-infinite-scroll-component";

type Messages = Database["public"]["Tables"]["messages"]["Row"];

export default function ChatContent({ id }: { id: string }) {
  const router = useRouter();
  const userId = useUserId();
  const [messages, setMessages] = useState<Messages[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(
    async (pageNumber: number) => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", Number(id))
        .order("send_at", { ascending: false })
        .range((pageNumber - 1) * 20, pageNumber * 20 - 1);

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      setMessages((prev) => [...prev, ...data]);
    },
    [id]
  );

  useEffect(() => {
    fetchMessages(1);

    const channel = supabase
      .channel(`room-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [payload.new as Messages, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, id]);

  const loadMore = () => {
    const nextPage = page + 1;
    fetchMessages(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="flex flex-col gap-3">
      <ChevronLeft onClick={() => router.back()} className="cursor-pointer" />

      <div className="flex flex-col gap-5">
        <section id="scrollableDiv" className="flex flex-col-reverse grow h-[67vh] gap-3 overflow-y-auto p-3 rounded-md">
          <InfiniteScroll
            dataLength={messages.length}
            next={loadMore}
            hasMore={hasMore}
            inverse={true}
            loader={<p className="text-center text-sm">Loading...</p>}
            scrollableTarget="scrollableDiv"
            style={{ display: "flex", flexDirection: "column-reverse" }}
          >
            {messages.map((item) => (
              <div
                key={item.id}
                className={clsx("flex items-end gap-2 mb-2", item.sender_id === userId ? "justify-end" : "justify-start")}
              >
                {item.sender_id === userId && <span className="text-xs text-zinc-500">{utcToKst(item.send_at)}</span>}
                <div className="max-w-[60%] border-2 p-2 rounded-md break-words">
                  <span className="text-sm sm:text-base">{item.content}</span>
                </div>
                {item.sender_id !== userId && <span className="text-xs text-zinc-500">{utcToKst(item.send_at)}</span>}
              </div>
            ))}
          </InfiniteScroll>
        </section>

        <section>
          <ChatForm roomId={Number(id)} userId={userId} />
        </section>
      </div>
    </div>
  );
}
