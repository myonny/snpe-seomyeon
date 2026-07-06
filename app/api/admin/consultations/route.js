// 관리자용: 상담 신청 목록 보기 / 삭제

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { isAdmin } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

// 목록 조회 (최신순)
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });

  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}

// 삭제
export async function DELETE(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabase.from('consultations').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
