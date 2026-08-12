-- 不動産管理アプリ用のproperties（物件）テーブルを作成するSQL
-- Supabaseダッシュボードの「SQL Editor」で実行してください

-- gen_random_uuid()を使うための拡張機能を有効化
create extension if not exists pgcrypto;

-- 物件テーブル
-- name: 物件名 / rent: 家賃（円） / area: エリア名 / layout: 間取り（例: 1LDK）
-- user_id: 登録したユーザー（auth.usersのid）
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  rent integer not null check (rent >= 0),
  area text not null,
  layout text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 更新のたびにupdated_atを自動更新する
create or replace function public.set_properties_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
  before update on public.properties
  for each row
  execute function public.set_properties_updated_at();

-- RLS（行レベルセキュリティ）を有効化
alter table public.properties enable row level security;

-- 自分が登録した物件のみ閲覧できる
create policy "Users can select their own properties"
  on public.properties
  for select
  using (auth.uid() = user_id);

-- 自分のuser_idとしてのみ新規登録できる
create policy "Users can insert their own properties"
  on public.properties
  for insert
  with check (auth.uid() = user_id);

-- 自分が登録した物件のみ更新できる
create policy "Users can update their own properties"
  on public.properties
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 自分が登録した物件のみ削除できる
create policy "Users can delete their own properties"
  on public.properties
  for delete
  using (auth.uid() = user_id);

-- RLSポリシーとは別に、ログイン済みユーザー（authenticatedロール）に
-- テーブルへの基本アクセス権限を付与する（実際にどの行を操作できるかはRLSが判定する）
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
