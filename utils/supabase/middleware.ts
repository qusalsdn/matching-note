import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authPages = ["/signin", "/signUp"];
  const protectedKeywords = ["create", "update", "delete"];
  const pathname = request.nextUrl.pathname;

  if (user && authPages.includes(pathname)) return NextResponse.redirect(new URL("/", request.url));

  if (!user && protectedKeywords.some((keyword) => pathname.includes(keyword)))
    return NextResponse.redirect(new URL("/signin", request.url));

  return supabaseResponse;
}
