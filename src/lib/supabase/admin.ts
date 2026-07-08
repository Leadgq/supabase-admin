import { createClient } from "./server";

/**
 * 获取当前用户的角色
 * @returns 'admin' | 'user' | null（未登录）
 */
export async function getCurrentUserRole(): Promise<
  "admin" | "user" | null
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return data?.role ?? "user";
}

/**
 * 需要管理员权限，否则重定向
 */
export async function requireAdmin(redirectTo = "/login") {
  const role = await getCurrentUserRole();
  if (role !== "admin") return { authorized: false, redirectTo } as const;
  return { authorized: true } as const;
}
