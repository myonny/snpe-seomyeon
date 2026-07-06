// 관리자 인증 도우미.
// 아주 단순한 방식: 로그인 시 비밀번호가 맞으면 httpOnly 쿠키를 심고,
// 관리자용 API는 매번 이 쿠키가 올바른지 확인합니다.

import { cookies } from 'next/headers';

const COOKIE_NAME = 'snpe_admin';

// 로그인 성공 시 쿠키 심기
export function setAdminCookie() {
  cookies().set(COOKIE_NAME, process.env.ADMIN_PASSWORD || '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12시간
  });
}

// 로그아웃 시 쿠키 지우기
export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

// 관리자인지 확인 (맞으면 true)
export function isAdmin() {
  const value = cookies().get(COOKIE_NAME)?.value;
  const pw = process.env.ADMIN_PASSWORD || '';
  return !!pw && value === pw;
}
