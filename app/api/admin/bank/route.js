// 관리자용: 입금 계좌 정보 조회 / 수정

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { isAdmin } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const { data, error } = await supabase.from('bank_info').select('*').eq('id', 1).single();
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, bank: data });
}

// 수정
export async function PUT(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const patch = {
    bank: (body.bank || '').trim(),
    account_number: (body.account_number || '').trim(),
    holder: (body.holder || '').trim(),
  };

  const { error } = await supabase.from('bank_info').update(patch).eq('id', 1);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
