"use client";

import { useUserId } from "@/app/hooks/useUserId";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { supabase } from "@/utils/supabase/client";
import clsx from "clsx";
import { ChevronLeft, User, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";

export default function StudyManagement() {
  const router = useRouter();
  const userId = useUserId();

  const fetcher = async () => {
    const { data: studyGroups } = await supabase.from("study_groups").select("id").eq("leader_id", userId);

    const StudyGroupsIds = studyGroups?.map((item) => item.id) ?? [];

    const { data } = await supabase
      .from("group_applications")
      .select("*, users(*), study_groups(*, group_members(*))")
      .in("group_id", StudyGroupsIds)
      .eq("status", "대기");

    return data;
  };

  const { data, error, mutate } = useSWR(userId ? ["studyManagement", userId] : null, fetcher);

  const handleAccept = async (id: number, group_id: number, user_id: string) => {
    mutate(
      async () => {
        const updatedData = data?.filter((item) => item.id !== id);

        const { error: groupApplicationsError } = await supabase
          .from("group_applications")
          .update({ status: "승인" })
          .eq("id", id);

        const { error: groupMembersError } = await supabase.from("group_members").insert({ group_id, user_id, role: "멤버" });

        if (groupApplicationsError || groupMembersError) throw error;

        toast.success("수락되었습니다.!");

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

  const handleRefuse = async (id: number) => {
    mutate(
      async () => {
        const updatedData = data?.filter((item) => item.id !== id);

        const { error } = await supabase.from("group_applications").update({ status: "거절" }).eq("id", id);

        if (error) throw error;

        toast.success("거절되었습니다.!");

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

  if (!userId) return <div className="text-center">로그인을 해주세요..</div>;

  if (error) return <div className="text-center">서버에 오류가 발생하였습니다..ㅜ</div>;

  return (
    <div>
      <section className="flex items-center space-x-1 mb-5">
        <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
        <span className="text-lg font-bold mb-1">스터디 관리</span>
      </section>

      <section>
        <div>
          <h2 className="text-lg font-bold mb-5">가입 신청받은 스터디 목록</h2>

          {data?.length === 0 ? (
            <div className="text-center">가입 신청받은 스터디가 없습니다..</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:h-52">
              {data?.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.study_groups.group_name}</CardTitle>

                    <CardAction className="text-xs text-zinc-500">{formatDate(item.study_groups.created_at)}</CardAction>
                  </CardHeader>

                  <CardContent className="text-sm lg:text-base">
                    <div className="flex items-start space-x-2">
                      {item.users.profile_image_url ? (
                        <Image src={item.users.profile_image_url} alt="userImage" />
                      ) : (
                        <div className="bg-zinc-100 rounded-full p-1">
                          <User size={20} className="text-zinc-500" />
                        </div>
                      )}

                      <div>
                        <span>{item.users.username}</span>
                        <p>{item.application_message}</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-end justify-between">
                    <div
                      className={clsx(
                        "flex items-center space-x-1 text-sm",
                        item.study_groups.max_members === item.study_groups.group_members.length
                          ? "text-red-500"
                          : "text-emerald-500"
                      )}
                    >
                      <Users className="w-4 h-4" />
                      <span>
                        {item.study_groups.group_members.length.toLocaleString()}/{item.study_groups.max_members}
                      </span>
                    </div>

                    <div className="space-x-2">
                      <Button
                        type="button"
                        className="bg-green-500 hover:bg-green-400"
                        onClick={() => handleAccept(item.id, item.group_id, item.users.user_id)}
                      >
                        수락
                      </Button>

                      <Button type="button" className="bg-red-500 hover:bg-red-400" onClick={() => handleRefuse(item.id)}>
                        거절
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
