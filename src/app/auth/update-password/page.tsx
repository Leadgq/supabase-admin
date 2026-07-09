"use client";

import { useRouter } from "next/navigation";
import { useImmer } from "use-immer";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [state, update] = useImmer({
    password: "",
    loading: false,
    error: null as string | null,
    done: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    update((d) => {
      d.error = null;
      d.loading = true;
    });

    const { error } = await supabase.auth.updateUser({
      password: state.password,
    });

    if (error) {
      update((d) => {
        d.error = error.message;
        d.loading = false;
      });
    } else {
      update((d) => {
        d.done = true;
        d.loading = false;
      });
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              设置新密码
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {state.done
                ? "密码修改成功，即将跳转..."
                : "请输入你的新密码"}
            </p>
          </div>

          {state.error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state.done ? (
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  新密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={state.password}
                  onChange={(e) =>
                    update((d) => {
                      d.password = e.target.value;
                    })
                  }
                  placeholder="至少 6 位"
                  minLength={6}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={state.loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
              >
                {state.loading ? "保存中..." : "保存新密码"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
