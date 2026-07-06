// 손님용 페이지가 화면에 필요한 데이터를 한 번에 가져오는 곳.
// (수업 시간표 / 상담 가능 날짜 / 입금 계좌)

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic'; // 항상 최신 데이터를 보여줌

export async function GET() {
  const [schedulesRes, datesRes, bankRes] = await Promise.all([
    supabase.from('schedules').select('*').order('sort_order', { ascending: true }),
    supabase.from('available_dates').select('*').order('sort_order', { ascending: true }),
    supabase.from('bank_info').select('*').eq('id', 1).single(),
  ]);

  const schedules = schedulesRes.data || [];

  return NextResponse.json({
    schedules: {
      홍혜경: schedules.filter((s) => s.instructor === '홍혜경'),
      묘니: schedules.filter((s) => s.instructor === '묘니'),
    },
    dates: datesRes.data || [],
    bank: bankRes.data || { bank: '', account_number: '', holder: '' },
  });
}
