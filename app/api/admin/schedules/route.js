// 관리자용: 수업 가능 시간표 (홍혜경 / 묘니) 추가·수정·삭제

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { isAdmin } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}

// 추가
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const instructor = (body.instructor || '').trim();
  const time_text = (body.time_text || '').trim();
  const sort_order = Number(body.sort_order) || 0;
  if (!instructor || !time_text) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabase.from('schedules').insert({ instructor, time_text, sort_order });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// 수정
export async function PATCH(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const patch = {};
  if (typeof body.time_text === 'string') patch.time_text = body.time_text.trim();
  if (typeof body.instructor === 'string') patch.instructor = body.instructor.trim();
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;

  const { error } = await supabase.from('schedules').update(patch).eq('id', id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// 삭제
export async function DELETE(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await supabase.from('schedules').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
