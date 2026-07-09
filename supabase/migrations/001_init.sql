-- ==========================================
-- 初始化：用户系统 + 权限系统
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ==========================================

-- ─────────────────────────────────────────
-- 1. 用户资料表（供查询展示用）
-- ─────────────────────────────────────────
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 2. 角色表（admin / user）
-- ─────────────────────────────────────────
CREATE TABLE public.user_roles (
  user_id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 3. 安全函数（绕过 RLS 查询角色）
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  RETURN COALESCE(_role, 'user');
END;
$$;

-- ─────────────────────────────────────────
-- 4. RLS 策略
-- ─────────────────────────────────────────

-- profiles：管理员看全部，用户看自己
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR public.current_role() = 'admin'
  );

-- user_roles：自己的记录 OR 管理员
CREATE POLICY "user_roles_select"
  ON public.user_roles FOR SELECT
  USING (
    auth.uid() = user_id OR public.current_role() = 'admin'
  );

-- ─────────────────────────────────────────
-- 5. 注册触发器（自动创建 profile + role）
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- 6. 回填已有用户（之前注册的，触发器不会补）
-- ─────────────────────────────────────────
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);

-- ─────────────────────────────────────────
-- 7. 设定管理员
-- ─────────────────────────────────────────
UPDATE public.user_roles
SET role = 'admin', updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = '2643336540@qq.com');
