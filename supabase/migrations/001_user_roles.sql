-- ==========================================
-- 用户角色系统 v2
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ==========================================

-- 1. 建表
CREATE TABLE public.user_roles (
  user_id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 开启 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. 安全函数，查角色时绕过 RLS
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

-- 4. 一条策略：自己的记录 OR 管理员
CREATE POLICY "user_roles_select"
  ON public.user_roles FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.current_role() = 'admin'
  );

-- 5. 新用户自动创建角色
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. 设你的邮箱为管理员
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = '2643336540@qq.com';
