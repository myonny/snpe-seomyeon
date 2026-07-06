-- ================================================================
--  [추가 기능] 대기 신청 표 만들기
--  Supabase → SQL Editor → New query → 이 내용 붙여넣고 "Run"
--  (이미 만든 다른 표들은 그대로 두고, 이 표만 새로 추가됩니다)
-- ================================================================

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text not null,
  desired_time text,               -- 원하는 시간대 (손님이 자유롭게 입력)
  note         text,               -- 어디가 불편한지 등 메모
  created_at   timestamptz default now()
);

alter table waitlist enable row level security;
