"use client";

import { useUserId } from "../hooks/useUserId";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import Link from "next/link";
import StudyGroupPostCard from "../study-group/components/StudyGroupPostCard";
import { useOpenedStudyGroups } from "../hooks/useOpenedStudyGroups";
import { useAppliedStudyGroups } from "../hooks/useAppliedStudyGroups";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function MyPage() {
  const userId = useUserId();
  const { data: openedStudy, handleLike: handleLikeOpened, handleBookmark: handleBookmarkOpened } = useOpenedStudyGroups(userId);
  const {
    data: appliedStudy,
    handleLike: handleLikeApplied,
    handleBookmark: handleBookmarkApplied,
  } = useAppliedStudyGroups(userId);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId ?? "")
        .single();

      setUser(data);
    };

    fetchUser();
  }, [userId]);

  if (!userId) return <div className="text-center">로그인을 해주세요..</div>;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-lg font-bold mb-5">내 정보</h1>

        <div className="flex items-start justify-between">
          <div className="flex space-x-3">
            <div>
              {user?.profile_image_url ? (
                <Image src={user.profile_image_url} alt="userImage" />
              ) : (
                <div className="bg-zinc-100 rounded-full p-1">
                  <User size={30} className="text-zinc-500" />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <span>{user?.username}</span>
              <span className="text-zinc-500">{user?.bio ? user.bio : "자기소개가 없네요..ㅜ"}</span>
            </div>
          </div>

          <Link href={"/mypage/study-management"}>
            <Button type="button">스터디 관리</Button>
          </Link>
        </div>
      </section>

      <hr />

      <section>
        <h2 className="text-lg font-bold mb-5">개설한 스터디 목록</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-96 overflow-y-auto">
          {openedStudy?.map((item) => (
            <Link key={item.id} href={`/study-group/${item.id}`}>
              <StudyGroupPostCard item={item} handleLike={handleLikeOpened} handleBookmark={handleBookmarkOpened} />
            </Link>
          ))}
        </div>
      </section>

      <hr />

      <section>
        <h2 className="text-lg font-bold mb-5">신청한 스터디 목록</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-96 overflow-y-auto">
          {appliedStudy?.map((item) => (
            <Link key={item.id} href={`/study-group/${item.id}`}>
              <StudyGroupPostCard item={item} handleLike={handleLikeApplied} handleBookmark={handleBookmarkApplied} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
