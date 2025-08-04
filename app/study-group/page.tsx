"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import StudyGroupPostCard from "./components/StudyGroupPostCard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useStudyGroups } from "../hooks/useStudyGroups";

function StudyGroup() {
  const router = useRouter();
  const { data, handleLike, handleBookmark, increaseViewCount, category, search } = useStudyGroups();

  if (!category && !search) return <div className="text-center">페이지를 찾을 수 없습니다...</div>;

  return (
    <div className="space-y-3">
      <section className="flex items-center space-x-1">
        <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
        {category && <span className="text-lg font-bold mb-1">{category}</span>}
      </section>

      {data?.map((item) => (
        <div key={item.id}>
          <Link href={`/study-group/${item.id}`}>
            <StudyGroupPostCard
              item={item}
              handleLike={handleLike}
              handleBookmark={handleBookmark}
              increaseViewCount={increaseViewCount}
            />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function StudyGroupPage() {
  return (
    <Suspense>
      <StudyGroup />
    </Suspense>
  );
}
