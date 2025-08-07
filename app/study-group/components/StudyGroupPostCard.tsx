import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Database } from "@/utils/supabase/types";
import { useAtomValue } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";
import { HeartButton, StarButton } from "./IconButtons";
import clsx from "clsx";

export type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"] & {
  group_members: Database["public"]["Tables"]["group_members"]["Row"][];
  group_likes: Database["public"]["Tables"]["group_likes"]["Row"][];
  group_bookmarks: Database["public"]["Tables"]["group_bookmarks"]["Row"][];
};

export default function StudyGroupPostCard({
  item,
  handleLike,
  handleBookmark,
  increaseViewCount,
}: {
  item: StudyGroup;
  handleLike: (id: number) => void;
  handleBookmark: (id: number) => void;
  increaseViewCount?: (id: number, viewCount: number) => void;
}) {
  const userId = useAtomValue(userUuidAtom);

  const handleIconClick = (e: React.MouseEvent, callback: (id: number) => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback(item.id);
  };

  return (
    <Card
      className="hover:shadow-xl duration-300"
      onClick={() => increaseViewCount && increaseViewCount(item.id, item.view_count)}
    >
      <CardHeader>
        <CardTitle className="flex flex-col">
          <span
            className={`text-sm ${
              item.status === "모집 중" ? "text-emerald-400" : item.status === "진행 중" ? "text-yellow-400" : "text-rose-500"
            }`}
          >
            {item.status}
          </span>
          <span className="lg:text-xl">{item.group_name}</span>
        </CardTitle>

        <CardAction className="flex flex-col items-end space-y-1">
          <span className="lg:text-sm text-xs text-zinc-500">{formatDate(item.created_at)}</span>
          <div className="flex space-x-2">
            <HeartButton
              active={item.group_likes.some((like) => like.user_id === userId)}
              onClick={(e) => handleIconClick(e, handleLike)}
            />

            <StarButton
              active={item.group_bookmarks.some((bookmark) => bookmark.user_id === userId)}
              onClick={(e) => handleIconClick(e, handleBookmark)}
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <p className="truncate">{item.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs lg:text-sm">
        <div className="flex items-center space-x-2 text-zinc-500">
          <div
            className={clsx(
              "flex items-center space-x-1",
              item.max_members === item.group_members.length ? "text-red-500" : "text-emerald-500"
            )}
          >
            <Users className="w-4 h-4" />
            <span>
              {item.group_members.length.toLocaleString()}/{item.max_members}
            </span>
          </div>
          <span>조회수 {item.view_count.toLocaleString()}</span>
          <span>좋아요 {item.group_likes.length.toLocaleString()}</span>
          <span>즐겨찾기 {item.group_bookmarks.length.toLocaleString()}</span>
        </div>

        <span className="text-sky-500">{item.is_online ? "온라인" : "오프라인"}</span>
      </CardFooter>
    </Card>
  );
}
