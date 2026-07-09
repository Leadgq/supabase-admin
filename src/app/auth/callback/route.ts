import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const isReset = searchParams.get("reset") === "true";
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = isReset ? "/auth/update-password" : next;

      // 获取真实域名：优先用请求头，其次用环境变量
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
      const base =
        forwardedHost
          ? `${forwardedProto}://${forwardedHost}`
          : process.env.NEXT_PUBLIC_SITE_URL ??
            new URL(request.url).origin;

      return NextResponse.redirect(`${base}${target}`);
    }
  }

  // 回调失败
  const fallbackBase =
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(request.url).origin;
  return NextResponse.redirect(`${fallbackBase}/login?error=auth_callback_error`);
}
