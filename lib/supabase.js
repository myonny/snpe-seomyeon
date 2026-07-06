// 서버 전용 Supabase 클라이언트.
// service_role 키를 사용하므로 이 파일은 절대 브라우저(클라이언트)에서 import 하면 안 됩니다.
// (app/api/... 안의 route.js 에서만 사용합니다.)

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // 환경변수가 안 채워졌을 때 원인을 알기 쉽게 알려줍니다.
  console.error('⚠️  SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. .env.local 을 확인하세요.');
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
