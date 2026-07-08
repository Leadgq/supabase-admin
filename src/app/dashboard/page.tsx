import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

function StatCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string | number;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <span className={`w-2 h-2 rounded-full ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getCurrentUserRole();

  // 以管理员身份显示总用户数
  const { count: totalUsers } = await supabase
    .from("user_roles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            欢迎回来
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {role === "admin" ? "管理员面板" : "以下是系统的整体概况"}
          </p>
        </div>
        {role === "admin" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            管理员
          </span>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总用户数"
          value={totalUsers ?? 0}
          description="已注册用户总数"
          color="bg-blue-500"
        />
        <StatCard
          title="管理员"
          value={1}
          description="系统管理员数量"
          color="bg-amber-500"
        />
        <StatCard
          title="系统状态"
          value="正常"
          description="所有服务运行中"
          color="bg-green-500"
        />
        <StatCard
          title="部署平台"
          value="Vercel"
          description="已部署上线"
          color="bg-purple-500"
        />
      </div>

      {/* 用户信息 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          当前登录信息
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-20">邮箱：</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-20">角色：</span>
            <span
              className={`font-medium ${
                role === "admin"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {role === "admin" ? "管理员" : "普通用户"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-20">注册时间：</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(user.created_at).toLocaleString("zh-CN")}
            </span>
          </div>
        </div>
      </div>

      {/* 管理提示 */}
      {role !== "admin" && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            当前账号为普通用户，部分功能受限
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
            请使用管理员账号登录以获取完整权限
          </p>
        </div>
      )}
    </div>
  );
}
