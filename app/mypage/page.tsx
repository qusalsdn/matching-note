"use client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserId } from "../hooks/useUserId";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { formatDate } from "@/utils/dateUtils";
import Link from "next/link";
import StudyGroupPostCard from "../study-group/components/StudyGroupPostCard";
import { useOpenedStudyGroups } from "../hooks/useOpenedStudyGroups";
import { useAppliedStudyGroups } from "../hooks/useAppliedStudyGroups";

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

  return (
    <div className="space-y-10">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>내 정보</CardTitle>

          <CardAction>
            <div className="flex flex-col">
              <span className="font-medium mt-1">가입일</span>
              <span>{formatDate(user?.created_at ?? "")}</span>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-col">
            <span className="font-medium mt-1">유저명</span>
            <span>{user?.username}</span>
          </div>

          <div className="flex flex-col">
            <p className="font-medium mt-1">자기소개</p>
            <p>{user?.bio}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>개설한 스터디 목록</CardTitle>
        </CardHeader>

        <CardContent>
          {openedStudy?.map((item) => (
            <Link key={item.id} href={`/study-group/${item.id}`}>
              <StudyGroupPostCard item={item} handleLike={handleLikeOpened} handleBookmark={handleBookmarkOpened} />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>신청한 스터디 목록</CardTitle>
        </CardHeader>

        <CardContent>
          {appliedStudy?.map((item) => (
            <Link key={item.id} href={`/study-group/${item.id}`}>
              <StudyGroupPostCard item={item} handleLike={handleLikeApplied} handleBookmark={handleBookmarkApplied} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
