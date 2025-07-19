-- 确保 social_media_accounts 表存在 (如果它不存在，这个语句会创建它)
CREATE TABLE IF NOT EXISTS public.social_media_accounts (
  id            SERIAL PRIMARY KEY,
  serial_number TEXT      NOT NULL,
  name          TEXT      NOT NULL,
  platform      TEXT,
  url           TEXT,
  followers     INTEGER   DEFAULT 0,
  level         INTEGER   DEFAULT 1,
  category      TEXT,
  description   TEXT,
  avatar        TEXT,
  images        TEXT[]    DEFAULT '{}',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全 (RLS) (如果尚未启用)
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取数据
CREATE POLICY "public read"
ON public.social_media_accounts FOR SELECT
USING ( TRUE );

-- 允许所有用户插入新数据 (这是解决添加账号问题的关键)
CREATE POLICY "Allow public insert"
ON public.social_media_accounts FOR INSERT
WITH CHECK ( TRUE );

-- 允许所有用户更新数据 (如果您需要编辑功能，这个策略是必需的)
CREATE POLICY "Allow public update"
ON public.social_media_accounts FOR UPDATE
USING ( TRUE );

-- 允许所有用户删除数据 (如果您需要删除功能，这个策略是必需的)
CREATE POLICY "Allow public delete"
ON public.social_media_accounts FOR DELETE
USING ( TRUE );
