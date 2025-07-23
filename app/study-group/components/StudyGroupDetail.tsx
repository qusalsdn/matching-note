"use client";

import { ChevronLeft, Heart, MapPinned, Star, User, UserRoundPen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { Database } from "@/utils/supabase/types";

type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"] & {
  group_members: (Database["public"]["Tables"]["group_members"]["Row"] & {
    users: Pick<Database["public"]["Tables"]["users"]["Row"], "id" | "username">;
  })[];
  group_likes: Database["public"]["Tables"]["group_likes"]["Row"][];
  group_bookmarks: Database["public"]["Tables"]["group_bookmarks"]["Row"][];
};

export default function StudyGroupDetail({ data }: { data: StudyGroup | null }) {
  const router = useRouter();

  return (
    <div>
      <section className="flex items-center space-x-1 mb-5">
        <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
        <span className="text-lg font-bold mb-1">스터디 그룹 상세</span>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col space-y-2">
              <span
                className={`${
                  data?.status === "모집 중"
                    ? "text-emerald-400"
                    : data?.status === "진행 중"
                    ? "text-yellow-400"
                    : "text-rose-500"
                }`}
              >
                {data?.status}
              </span>
              <span className="text-sm text-zinc-500">{data?.category}</span>
              <span>{data?.group_name}</span>
            </CardTitle>

            <CardAction className="flex flex-col items-end space-y-1">
              <span className="lg:text-sm text-xs text-zinc-500">{formatDate(data?.created_at ?? "")}</span>
              <div className="flex space-x-2">
                <Heart className="w-5 h-5 text-zinc-500" />
                <Star className="w-5 h-5 text-zinc-500" />
              </div>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-5">
            <p>{data?.description}</p>

            {!data?.is_online && (
              <div>
                <MapPinned size={20} className="text-zinc-500" />
                <p>{data?.location}</p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>인원현황</CardTitle>
              </CardHeader>

              <CardContent className="flex items-center space-x-2">
                {data?.group_members.map((item) => (
                  <div key={item.id} className="flex items-start space-x-1 text-sm">
                    <div
                      className={`border rounded-full p-1 ${
                        item.role === "리더" ? "text-yellow-400 border-yellow-400" : "text-zinc-500 border-zinc-500"
                      }`}
                    >
                      {item.role === "리더" ? <UserRoundPen size={17} /> : <User size={17} />}
                    </div>
                    <span>{item.users.username}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>

          <CardFooter>
            <div className="flex items-center space-x-2 text-zinc-500 lg:text-sm text-xs">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>
                  {data?.group_members.length.toLocaleString()}/{data?.max_members}
                </span>
              </div>
              <span className={data?.is_online ? "text-emerald-500" : "text-rose-500"}>
                {data?.is_online ? "온라인" : "오프라인"}
              </span>
              <span>조회수 {data?.view_count.toLocaleString()}</span>
              <span>좋아요 {data?.group_likes.length.toLocaleString()}</span>
              <span>즐겨찾기 {data?.group_bookmarks.length.toLocaleString()}</span>
            </div>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
