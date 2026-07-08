-- =============================================
-- 管理员权限系统
-- 在 Supabase Dashboard → SQL Editor 中执行
-- =============================================

-- 1. 创建用户角色表
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 开启 RLS（行级安全）
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. 每个人都能读自己的角色
CREATE POLICY "允许用户读取自己的角色"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 4. 管理员能读所有人的角色
CREATE POLICY "允许管理员读取所有角色"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. 新用户注册时自动创建 role = 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 绑定到 auth.users 表
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 把你的邮箱设为管理员
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = '2643336540@qq.com';
