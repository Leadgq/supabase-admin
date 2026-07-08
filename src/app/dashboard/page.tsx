import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 统计卡片组件
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
        <span
          className={`w-2 h-2 rounded-full ${color}`}
        />
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

  if (!user) {
    redirect("/login");
  }

  // 获取一些统计数据（示例）
  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          欢迎回来
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          以下是系统的整体概况
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="注册用户"
          value={userCount ?? 0}
          description="总注册用户数"
          color="bg-blue-500"
        />
        <StatCard
          title="本周活跃"
          value="--"
          description="需要连接数据库"
          color="bg-green-500"
        />
        <StatCard
          title="内容数量"
          value="--"
          description="需要连接数据库"
          color="bg-purple-500"
        />
        <StatCard
          title="系统状态"
          value="正常"
          description="所有服务运行中"
          color="bg-green-500"
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
            <span className="text-gray-500 w-20">用户ID：</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs break-all">
              {user.id}
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

      {/* 快速操作 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快速开始
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          接下来你可以：
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            在{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Supabase Dashboard
            </a>{" "}
            创建数据库表
          </li>
          <li>在侧边栏添加新的管理页面</li>
          <li>配置 Row Level Security 策略</li>
          <li>部署到 Vercel</li>
        </ol>
      </div>
    </div>
  );
}
