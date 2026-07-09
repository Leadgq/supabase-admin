"use client";

import { useRouter } from "next/navigation";
import { useImmer } from "use-immer";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ui, updateUi] = useImmer<{
    loading: boolean;
    message: string | null;
    error: string | null;
  }>({
    loading: false,
    message: null,
    error: null,
  });

  const handleResetPassword = async () => {
    updateUi((draft) => {
      draft.message = null;
      draft.error = null;
      draft.loading = true;
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      updateUi((draft) => {
        draft.error = "无法获取当前用户邮箱";
        draft.loading = false;
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?reset=true`,
    });

    updateUi((draft) => {
      if (error) {
        draft.error = error.message;
      } else {
        draft.message = `密码重置链接已发送到 ${user.email}`;
      }
      draft.loading = false;
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          设置
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理您的账户设置
        </p>
      </div>

      {/* 基本信息 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          账户信息
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          账户信息由 Supabase Auth 管理。您可以在 Supabase Dashboard 中查看更多账户详情。
        </p>
        <button
          className="mt-4 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          onClick={() =>
            window.open(
              "https://supabase.com/dashboard",
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          前往 Supabase Dashboard
        </button>
      </div>

      {/* 安全 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          安全
        </h3>

        {ui.message && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
            {ui.message}
          </div>
        )}
        {ui.error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {ui.error}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          修改密码、重置密码等安全操作。
        </p>
        <button
          onClick={handleResetPassword}
          disabled={ui.loading}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
        >
          {ui.loading ? "发送中..." : "发送密码重置邮件"}
        </button>
      </div>
    </div>
  );
}
