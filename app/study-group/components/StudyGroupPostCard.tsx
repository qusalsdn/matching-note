import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Users } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Database } from "@/utils/supabase/types";
import { useAtomValue } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";

type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"] & {
  group_members: Database["public"]["Tables"]["group_members"]["Row"][];
  group_likes: Database["public"]["Tables"]["group_likes"]["Row"][];
  group_bookmarks: Database["public"]["Tables"]["group_bookmarks"]["Row"][];
};

export default function StudyGroupPostCard({
  item,
  handleLike,
  handleBookmark,
}: {
  item: StudyGroup;
  handleLike: (id: number) => void;
  handleBookmark: (id: number) => void;
}) {
  const userId = useAtomValue(userUuidAtom);

  return (
    <Card className="hover:shadow-xl duration-300 cursor-pointer">
      <CardHeader>
        <CardTitle>
          <span className="lg:text-xl">{item.group_name}</span>
        </CardTitle>

        <CardAction className="flex flex-col items-end space-y-1">
          <span className="lg:text-sm text-xs text-zinc-500">{formatDate(item.created_at)}</span>
          <div className="flex space-x-2">
            <Heart
              className={`w-5 h-5 ${
                item.group_likes.find((like) => like.user_id === userId) ? "text-rose-500 fill-current" : "text-zinc-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleLike(item.id);
              }}
            />
            <Star
              className={`w-5 h-5 ${
                item.group_bookmarks.find((bookmark) => bookmark.user_id === userId)
                  ? "text-yellow-300 fill-current"
                  : "text-zinc-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleBookmark(item.id);
              }}
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <p className="truncate">{item.description}</p>
      </CardContent>

      <CardFooter className="flex items-center space-x-2 text-zinc-500 lg:text-sm text-xs">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>
            {item.group_members.length.toLocaleString()}/{item.max_members}
          </span>
        </div>
        <span className={item.is_online ? "text-emerald-500" : "text-rose-500"}>{item.is_online ? "온라인" : "오프라인"}</span>
        <span>조회수 {item.view_count.toLocaleString()}</span>
        <span>좋아요 {item.group_likes.length.toLocaleString()}</span>
        <span>즐겨찾기 {item.group_bookmarks.length.toLocaleString()}</span>
      </CardFooter>
    </Card>
  );
}
