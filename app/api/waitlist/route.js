// 손님이 대기 신청 폼을 제출하면 여기로 들어옵니다. (누구나 호출 가능 = 공개)

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const teacher = (body.teacher || '').trim();
  const desired_time = (body.desired_time || '').trim();
  const note = (body.note || '').trim();

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: '이름과 연락처를 입력해 주세요.' }, { status: 400 });
  }

  const { error } = await supabase.from('waitlist').insert({ name, phone, teacher, desired_time, note });

  if (error) {
    return NextResponse.json({ ok: false, error: '저장에 실패했어요. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
