import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BookOpen, BriefcaseBusiness, CodeXml, FileBadge, Languages, Palette, Search } from "lucide-react";

const studyCategories = [
  { name: "프로그래밍", icon: <CodeXml size={26} className="text-red-500" /> },
  { name: "외국어", icon: <Languages size={26} className="text-orange-500" /> },
  { name: "자격증", icon: <FileBadge size={26} className="text-yellow-500" /> },
  { name: "독서", icon: <BookOpen size={26} className="text-green-500" /> },
  { name: "취업/이직", icon: <BriefcaseBusiness size={26} className="text-blue-500" /> },
  { name: "디자인", icon: <Palette size={26} className="text-purple-500" /> },
];

export default function Home() {
  return (
    <div className="space-y-5">
      {/* 스터디 그룹 생성 부분 */}
      <section className="text-end">
        <Link href={"/study-group/create"}>
          <Button type="button" size={"sm"}>
            <p className="text-xl">+</p>
          </Button>
        </Link>
      </section>

      {/* 검색 부분 */}
      <section className="flex items-center">
        <div className="relative flex items-center flex-grow">
          <Search className="absolute left-3 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="스터디명, 과목, 키워드로 검색"
            className="p-5 rounded-full mr-3 pl-12 w-full text-sm lg:text-base"
          />
        </div>
        <Button type="submit">검색</Button>
      </section>

      {/* 스터디 카테고리 부분 */}
      <section>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {studyCategories.map((item) => (
            <Link key={item.name} href={""}>
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
