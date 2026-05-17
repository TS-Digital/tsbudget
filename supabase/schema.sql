-- TSBudget Database Schema
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE.

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner write"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ─────────────────────────────────────────────
-- 2. TAX PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tax_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_income       NUMERIC(12,2),
  tax_code           TEXT,
  pay_frequency      TEXT,
  pension_pct        NUMERIC(5,2) DEFAULT 0,
  student_loan_plan  TEXT DEFAULT 'none',
  scotland           BOOLEAN DEFAULT FALSE,
  employment_type    TEXT DEFAULT 'employed',
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tax_profiles_user_idx ON public.tax_profiles (user_id);

ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_profiles: owner read"
  ON public.tax_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tax_profiles: owner write"
  ON public.tax_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 3. BUDGETS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budgets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method              TEXT NOT NULL DEFAULT '50/30/20',
  categories          JSONB NOT NULL DEFAULT '[]',
  income_sources      JSONB NOT NULL DEFAULT '[]',
  net_monthly_income  NUMERIC(12,2) DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS budgets_user_idx ON public.budgets (user_id);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets: owner read"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "budgets: owner write"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 4. GOALS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  target_amount        NUMERIC(12,2) NOT NULL,
  current_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_contribution NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS goals_user_idx ON public.goals (user_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals: owner read"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "goals: owner write"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
