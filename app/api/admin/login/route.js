// 관리자 로그인: 비밀번호가 맞으면 쿠키를 심어줍니다.

import { NextResponse } from 'next/server';
import { setAdminCookie } from '../../../../lib/auth';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password = (body.password || '').trim();
  const correct = process.env.ADMIN_PASSWORD || '';

  if (!correct) {
    return NextResponse.json({ ok: false, error: '서버에 관리자 비밀번호가 설정되지 않았습니다.' }, { status: 500 });
  }

  if (password !== correct) {
    return NextResponse.json({ ok: false, error: '비밀번호가 틀렸어요.' }, { status: 401 });
  }

  setAdminCookie();
  return NextResponse.json({ ok: true });
}
