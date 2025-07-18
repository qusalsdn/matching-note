import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Activity, BookOpen, BriefcaseBusiness, CodeXml, Ellipsis, FileBadge, Languages, Palette } from "lucide-react";

const studyCategories = [
  { name: "프로그래밍", icon: <CodeXml size={26} className="text-red-500" />, url: "/study-group/category/programming" },
  { name: "외국어", icon: <Languages size={26} className="text-orange-500" />, url: "/study-group/category/foreign-language" },
  { name: "자격증", icon: <FileBadge size={26} className="text-yellow-500" />, url: "/study-group/category/certificate" },
  { name: "독서", icon: <BookOpen size={26} className="text-green-500" />, url: "/study-group/category/reading" },
  { name: "취업/이직", icon: <BriefcaseBusiness size={26} className="text-blue-500" />, url: "/study-group/category/employment" },
  { name: "디자인", icon: <Palette size={26} className="text-purple-500" />, url: "/study-group/category/design" },
  { name: "운동", icon: <Activity size={26} className="text-indigo-500" />, url: "/study-group/category/exercise" },
  { name: "기타", icon: <Ellipsis size={26} />, url: "/study-group/category/etc" },
];

export default function Home() {
  return (
    <div className="space-y-5">
      {/* 스터디 카테고리 부분 */}
      <section>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {studyCategories.map((item) => (
            <Link key={item.name} href={item.url}>
              <div className="flex flex-col items-center justify-center w-full h-auto py-3 lg:h-28 hover:bg-gray-100 duration-500 rounded-md">
                <span>{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 현재 인기 있는 스터디 그룹 */}
      <section className="bg-gray-50 p-3 rounded-md">
        <h2 className="text-center text-lg lg:text-2xl mb-3">🔥 현재 인기 있는 스터디 그룹 🔥</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((item) => {
            return (
              <Card key={item} className="hover:shadow-xl duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle>Next.js 심화 스터디</CardTitle>
                  <CardDescription>Next.js 14 최신 기능과 서버 컴포넌트 마스터!</CardDescription>
                </CardHeader>

                <CardContent>
                  <span>인원: 5/8명</span>
                </CardContent>

                <CardFooter className="flex justify-end">
                  <Button>자세히 보기</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
