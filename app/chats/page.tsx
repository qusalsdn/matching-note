"use client";

import { Button } from "@/components/ui/button";
import { utcToKst } from "@/utils/dateUtils";
import { supabase } from "@/utils/supabase/client";
import { MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { useUserId } from "../hooks/useUserId";
import useSWR from "swr";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetcher = async ([, userId]: string[]) => {
  const { data } = await supabase
    .from("chat_participants")
    .select("*, chat_rooms(*, messages(*))")
    .eq("user_id", userId)
    .order("send_at", { foreignTable: "chat_rooms.messages", ascending: false })
    .limit(1, { foreignTable: "chat_rooms.messages" });

  return data;
};

export default function Chats() {
  const userId = useUserId();
  const { data } = useSWR(userId ? ["chats", userId] : null, fetcher, { refreshInterval: 5000 });

  return (
    <div className="space-y-5">
      <section className="text-end">
        <Link href={"/chats/create"}>
          <Button type="button">
            <MessageCirclePlus />
          </Button>
        </Link>
      </section>

      <section>
        {data
          ?.map((item) => item.chat_rooms)
          .map((chatRoom) => (
            <Link key={chatRoom.id} href={`/chats/${chatRoom.id}`}>
              <Card className="hover:shadow-lg duration-300 my-3">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <span>{chatRoom.room_name}</span>
                  </CardTitle>

                  <CardAction className="text-sm text-zinc-500">
                    {chatRoom.messages[0] ? utcToKst(chatRoom.messages[0].send_at) : "아직 채팅이 없습니다.."}
                  </CardAction>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between"></div>

                    <span className="text-zinc-500">
                      {chatRoom.messages[0]?.content ? chatRoom.messages[0].content : "아직 채팅이 없습니다.."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
      </section>
    </div>
  );
}
