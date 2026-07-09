import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getCurrentUserRole();
  if (role !== "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h2>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            需要管理员权限才能访问此页面
          </p>
        </div>
      </div>
    );
  }

  // 管理员获取所有用户
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // 获取每个用户的角色
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role");

  const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          用户管理
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          共 {profiles?.length ?? 0} 个注册用户
        </p>
      </div>

      {/* 用户表格 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  邮箱
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  角色
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  注册时间
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles && profiles.length > 0 ? (
                profiles.map((p: Profile) => {
                  const userRole = roleMap.get(p.id) ?? "user";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {p.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            userRole === "admin"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {userRole === "admin" ? "管理员" : "用户"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(p.created_at).toLocaleString("zh-CN")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    暂无用户数据。跑完 SQL 并注册用户后就会显示。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
