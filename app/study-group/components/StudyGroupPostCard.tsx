import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Users } from "lucide-react";
import { StudyGroup } from "../page";
import { formatDate } from "@/utils/dateUtils";

export default function StudyGroupPostCard({ item }: { item: StudyGroup }) {
  return (
    <Card className="hover:shadow-xl duration-300 cursor-pointer">
      <CardHeader>
        <CardTitle>
          <span className="lg:text-xl">{item.group_name}</span>
        </CardTitle>

        <CardAction className="flex flex-col items-end space-y-1">
          <span className="lg:text-sm text-xs text-zinc-500">{formatDate(item.created_at)}</span>
          <div className="flex space-x-2">
            <Heart className="w-5 h-5 text-zinc-500" />
            <Star className="w-5 h-5 text-zinc-500" />
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
