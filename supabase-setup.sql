-- ================================================================
--  SNPE 서면점 예약 사이트 - 데이터베이스 초기 설정
--  Supabase 대시보드 → 왼쪽 메뉴 "SQL Editor" → 이 내용 전체 붙여넣고 "Run"
-- ================================================================

-- 1) 수업 가능 시간표 (홍혜경 원장님 / 묘니쌤)
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  instructor text not null,          -- '홍혜경' 또는 '묘니'
  time_text  text not null,          -- 예: '월/수/금 오전 10시~12시'
  sort_order int  default 0,
  created_at timestamptz default now()
);

-- 2) 상담 가능 날짜
create table if not exists available_dates (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,          -- 예: '2026-07-10'
  weekday    text,                   -- 예: '목'
  time_text  text,                   -- 예: '오후 2시'
  is_closed  boolean default false,  -- true면 '마감'
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3) 상담 신청 내역 (손님이 신청하면 여기에 쌓임)
create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  discomfort text,                   -- 어디가 불편한지
  date_label text,                   -- 신청한 날짜 (신청 당시 값 저장)
  created_at timestamptz default now()
);

-- 4) 입금 계좌 정보 (딱 한 줄만 사용)
create table if not exists bank_info (
  id int primary key default 1,
  bank           text default '',
  account_number text default '',
  holder         text default ''
);

-- 계좌 정보 기본 한 줄 넣기 (없을 때만)
insert into bank_info (id, bank, account_number, holder)
values (1, '', '', '')
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 보안: RLS(행 수준 보안) 켜기.
-- 우리 사이트는 서버에서 'service_role' 키로만 접근하므로,
-- RLS를 켜두면 외부(브라우저)에서는 아무도 못 읽고/못 씁니다. (안전)
-- ----------------------------------------------------------------
alter table schedules      enable row level security;
alter table available_dates enable row level security;
alter table consultations  enable row level security;
alter table bank_info      enable row level security;

-- ----------------------------------------------------------------
-- (선택) 처음 화면이 비어 보이지 않게 예시 데이터 넣기.
-- 나중에 관리자 페이지에서 자유롭게 수정/삭제하면 됩니다.
-- ----------------------------------------------------------------
insert into schedules (instructor, time_text, sort_order) values
  ('홍혜경', '월 · 수 · 금  오전 10시 ~ 오후 1시', 1),
  ('홍혜경', '화 · 목  오후 2시 ~ 오후 5시', 2),
  ('묘니',   '월 ~ 금  오후 6시 ~ 오후 9시', 1),
  ('묘니',   '토  오전 11시 ~ 오후 3시', 2);

insert into available_dates (date_label, weekday, time_text, is_closed, sort_order) values
  ('2026-07-10', '금', '오후 2시', false, 1),
  ('2026-07-12', '일', '오전 11시', false, 2),
  ('2026-07-15', '수', '오후 7시', false, 3);
