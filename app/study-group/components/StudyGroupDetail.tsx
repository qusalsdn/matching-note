"use client";

import { ChevronLeft, Ellipsis, MapPinned, SquarePen, Trash2, User, UserRoundPen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { Database } from "@/utils/supabase/types";
import { supabase } from "@/utils/supabase/client";
import useSWR from "swr";
import toast from "react-hot-toast";
import { HeartButton, StarButton } from "./IconButtons";
import { useUserId } from "@/app/hooks/useUserId";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type StudyGroupDetail = Database["public"]["Tables"]["study_groups"]["Row"] & {
  group_members: (Database["public"]["Tables"]["group_members"]["Row"] & {
    users: Pick<Database["public"]["Tables"]["users"]["Row"], "id" | "username">;
  })[];
  group_likes: Database["public"]["Tables"]["group_likes"]["Row"][];
  group_bookmarks: Database["public"]["Tables"]["group_bookmarks"]["Row"][];
  group_applications: Database["public"]["Tables"]["group_applications"]["Row"][];
};

export default function StudyGroupDetail({ studyGroupId }: { studyGroupId: string }) {
  const router = useRouter();
  const userId = useUserId();
  const [menuOpen, setMenuOpen] = useState(false);

  const fetcher = async (studyGroupId: string) => {
    const { data } = await supabase
      .from("study_groups")
      .select("*, group_members(*, users(id, username)), group_likes(*), group_bookmarks(*), group_applications(*)")
      .eq("id", Number(studyGroupId))
      .single();

    return data;
  };

  const { data, error, mutate } = useSWR(studyGroupId, fetcher);

  const toggleItem = async ({
    studyGroupId,
    key,
    table,
  }: {
    studyGroupId: number;
    key: "group_likes" | "group_bookmarks";
    table: "group_likes" | "group_bookmarks";
  }) => {
    if (!userId) return toast.error("로그인을 해주세요.!");
    if (!data) return;

    mutate(
      async () => {
        const isToggled = data[key].some((item) => item.user_id === userId);

        const updatedData = {
          ...data,
          [key]: isToggled
            ? data[key].filter((item) => item.user_id !== userId)
            : [...data[key], { group_id: studyGroupId, user_id: userId }],
        };

        const supabaseOp = isToggled
          ? supabase.from(table).delete().eq("group_id", studyGroupId).eq("user_id", userId)
          : supabase.from(table).insert({ group_id: studyGroupId, user_id: userId });

        const { error } = await supabaseOp;
        if (error) throw error;

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

  const handleIconClick = (e: React.MouseEvent, callback: (id: number) => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback(Number(studyGroupId));
  };

  const handleLike = (id: number) => toggleItem({ studyGroupId: id, key: "group_likes", table: "group_likes" });
  const handleBookmark = (id: number) => toggleItem({ studyGroupId: id, key: "group_bookmarks", table: "group_bookmarks" });

  const handleStudyGroupApplications = () => {
    if (!data) return;

    if (data.group_members.length >= data.max_members) return toast.error("현재 인원이 다 찼습니다..ㅜ");

    router.push(`/study-group/applications/${studyGroupId}`);
  };

  const handleCancelStudyGroupApplications = async () => {
    if (!userId) return toast.error("로그인을 해주세요.!");
    if (!data) return;

    mutate(
      async () => {
        const updatedData = {
          ...data,
          group_applications: data.group_applications.filter((item) => item.applicant_id !== userId),
        };

        const { error } = await supabase
          .from("group_applications")
          .delete()
          .eq("group_id", Number(studyGroupId))
          .eq("applicant_id", userId);

        if (error) throw error;

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );

    if (error) return toast.error("가입 취소 중 오류가 발생하였습니다..ㅜ");
  };

  if (error) {
    console.error(error);
    return toast.error("서버에 오류가 발생하였습니다..ㅜ");
  }

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
              {userId === data?.leader_id && (
                <div className="relative">
                  <Ellipsis
                    role="button"
                    className="w-5 h-5 text-zinc-800 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                  />

                  {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>}

                  {menuOpen && (
                    <div className="absolute z-20 right-0 w-36 h-32 flex flex-col items-center justify-center p-3 space-y-2 bg-white border-2 rounded-md">
                      <div
                        onClick={() => router.push(`/study-group/update/${studyGroupId}`)}
                        className="w-full flex items-center justify-between cursor-pointer p-3 rounded-md hover:bg-zinc-100 duration-300"
                      >
                        <SquarePen className="w-5 h-5" />
                        <span>수정하기</span>
                      </div>

                      <div className="w-full flex items-center justify-between cursor-pointer p-3 rounded-md hover:bg-zinc-100 duration-300">
                        <Trash2 className="w-5 h-5" />
                        <span>삭제하기</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <span className="lg:text-sm text-xs text-zinc-500">{formatDate(data?.created_at ?? "")}</span>

              <div className="flex space-x-2">
                <HeartButton
                  active={data?.group_likes.some((like) => like.user_id === userId) ?? false}
                  onClick={(e) => handleIconClick(e, handleLike)}
                />

                <StarButton
                  active={data?.group_bookmarks.some((bookmark) => bookmark.user_id === userId) ?? false}
                  onClick={(e) => handleIconClick(e, handleBookmark)}
                />
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

          <CardFooter className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-2 lg:flex lg:items-center lg:space-x-2 text-zinc-500 lg:text-sm text-xs">
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

            {data?.leader_id !== userId && (
              <div>
                {data?.group_applications.some((item) => item.applicant_id === userId) ? (
                  <Button type="button" variant={"destructive"} onClick={handleCancelStudyGroupApplications}>
                    가입 취소
                  </Button>
                ) : (
                  <Button type="button" onClick={handleStudyGroupApplications}>
                    가입 신청
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
