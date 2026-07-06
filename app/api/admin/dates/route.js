// 관리자용: 상담 가능 날짜 추가·수정(마감 토글)·삭제

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { isAdmin } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const { data, error } = await supabase
    .from('available_dates')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}

// 추가
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const date_label = (body.date_label || '').trim();
  const weekday = (body.weekday || '').trim();
  const time_text = (body.time_text || '').trim();
  const sort_order = Number(body.sort_order) || 0;
  if (!date_label) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabase
    .from('available_dates')
    .insert({ date_label, weekday, time_text, sort_order, is_closed: false });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// 수정 (마감 토글 포함)
export async function PATCH(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const patch = {};
  if (typeof body.date_label === 'string') patch.date_label = body.date_label.trim();
  if (typeof body.weekday === 'string') patch.weekday = body.weekday.trim();
  if (typeof body.time_text === 'string') patch.time_text = body.time_text.trim();
  if (typeof body.is_closed === 'boolean') patch.is_closed = body.is_closed;
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;

  const { error } = await supabase.from('available_dates').update(patch).eq('id', id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// 삭제
export async function DELETE(req) {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await supabase.from('available_dates').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
