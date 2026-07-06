// 관리자 로그아웃: 쿠키를 지웁니다.

import { NextResponse } from 'next/server';
import { clearAdminCookie } from '../../../../lib/auth';

export async function POST() {
  clearAdminCookie();
  return NextResponse.json({ ok: true });
}
