"use client";

import { useRouter } from "next/navigation";
import { useImmer } from "use-immer";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  email: string;
  password: string;
};

type UiState = {
  isSignUp: boolean;
  forgotPassword: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, updateForm] = useImmer<FormState>({
    email: "",
    password: "",
  });

  const [ui, updateUi] = useImmer<UiState>({
    isSignUp: false,
    forgotPassword: false,
    loading: false,
    error: null,
    message: null,
  });

  // ── 忘记密码 ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    updateUi((draft) => {
      draft.error = null;
      draft.message = null;
      draft.loading = true;
    });

    const { error } = await supabase.auth.resetPasswordForEmail(
      form.email,
      { redirectTo: `${window.location.origin}/auth/callback?reset=true` }
    );

    updateUi((draft) => {
      if (error) {
        draft.error = error.message;
      } else {
        draft.message = `重置链接已发送到 ${form.email}，请查看邮箱`;
      }
      draft.loading = false;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateUi((draft) => {
      draft.error = null;
      draft.message = null;
      draft.loading = true;
    });

    try {
      if (ui.isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        updateUi((draft) => {
          draft.message =
            "注册成功！请查看邮箱确认链接。（开发环境可能自动确认）";
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      updateUi((draft) => {
        draft.error = err instanceof Error ? err.message : "操作失败";
      });
    } finally {
      updateUi((draft) => {
        draft.loading = false;
      });
    }
  };

  const handleGitHubLogin = async () => {
    updateUi((draft) => {
      draft.error = null;
      draft.loading = true;
    });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      updateUi((draft) => {
        draft.error = err instanceof Error ? err.message : "GitHub 登录失败";
        draft.loading = false;
      });
    }
  };

  const handleGoogleLogin = async () => {
    updateUi((draft) => {
      draft.error = null;
      draft.loading = true;
    });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      updateUi((draft) => {
        draft.error = err instanceof Error ? err.message : "Google 登录失败";
        draft.loading = false;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Demo
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {ui.forgotPassword
                ? "输入邮箱，我们将发送重置链接"
                : ui.isSignUp
                ? "创建新账户"
                : "登录到后台管理系统"}
            </p>
          </div>

          {/* 错误 / 成功提示 */}
          {ui.error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {ui.error}
            </div>
          )}
          {ui.message && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              {ui.message}
            </div>
          )}

          {/* OAuth 按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleGitHubLogin}
              disabled={ui.loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub 登录
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={ui.loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google 登录
            </button>
          </div>

          {/* 分割线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                或使用邮箱
              </span>
            </div>
          </div>

          {/* 邮箱密码表单 */}
          {ui.forgotPassword ? (
            /* ─── 忘记密码表单 ─── */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateForm((draft) => {
                      draft.email = e.target.value;
                    })
                  }
                  placeholder="请输入注册邮箱"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={ui.loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
              >
                {ui.loading ? "发送中..." : "发送重置链接"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    updateUi((draft) => {
                      draft.forgotPassword = false;
                      draft.error = null;
                      draft.message = null;
                    })
                  }
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  返回登录
                </button>
              </div>
            </form>
          ) : (
            /* ─── 登录 / 注册表单 ─── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateForm((draft) => {
                      draft.email = e.target.value;
                    })
                  }
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    updateForm((draft) => {
                      draft.password = e.target.value;
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
                disabled={ui.loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
              >
                {ui.loading ? "处理中..." : ui.isSignUp ? "注册" : "登录"}
              </button>

              {/* 忘记密码 */}
              {!ui.isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() =>
                      updateUi((draft) => {
                        draft.forgotPassword = true;
                        draft.error = null;
                        draft.message = null;
                      })
                    }
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    忘记密码？
                  </button>
                </div>
              )}
            </form>
          )}

          {/* 切换登录 / 注册 */}
          {!ui.forgotPassword && (
            <div className="text-center text-sm">
              <button
                onClick={() => {
                  updateUi((draft) => {
                    draft.isSignUp = !draft.isSignUp;
                    draft.error = null;
                    draft.message = null;
                  });
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {ui.isSignUp
                  ? "已有账户？点此登录"
                  : "没有账户？点此注册"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
