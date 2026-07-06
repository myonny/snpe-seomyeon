'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('consultations');

  // 로그인되어 있는지 확인 (관리자 API를 한 번 호출해봄)
  useEffect(() => {
    fetch('/api/admin/consultations')
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  async function login(e) {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (json.ok) {
      setAuthed(true);
      setPassword('');
    } else {
      setLoginError(json.error || '로그인 실패');
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
  }

  if (!authed) {
    return (
      <main className="wrap">
        <div style={{ marginBottom: 22 }}>
          <span className="badge">SNPE 서면점</span>
          <h1 className="title">관리자 로그인</h1>
          <div className="rainbow-line" />
        </div>
        <div className="card">
          <form onSubmit={login}>
            <div className="field">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호"
              />
            </div>
            {loginError && <div className="msg-error">{loginError}</div>}
            <button className="btn" type="submit" style={{ marginTop: 8 }}>로그인</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span className="badge">SNPE 관리자</span>
        </div>
        <button className="btn small ghost" onClick={logout}>로그아웃</button>
      </div>
      <div className="rainbow-line" style={{ marginBottom: 18 }} />

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'consultations' ? 'active' : ''}`} onClick={() => setTab('consultations')}>상담 신청</button>
        <button className={`admin-tab ${tab === 'schedules' ? 'active' : ''}`} onClick={() => setTab('schedules')}>수업 시간</button>
        <button className={`admin-tab ${tab === 'dates' ? 'active' : ''}`} onClick={() => setTab('dates')}>상담 날짜</button>
        <button className={`admin-tab ${tab === 'bank' ? 'active' : ''}`} onClick={() => setTab('bank')}>입금 계좌</button>
      </div>

      {tab === 'consultations' && <ConsultationsTab />}
      {tab === 'schedules' && <SchedulesTab />}
      {tab === 'dates' && <DatesTab />}
      {tab === 'bank' && <BankTab />}
    </main>
  );
}

/* ================= 상담 신청 목록 ================= */
function ConsultationsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/consultations');
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function del(id) {
    if (!confirm('이 신청을 삭제할까요?')) return;
    await fetch(`/api/admin/consultations?id=${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="card">
      <div className="section-title">📋 상담 신청 목록 ({items.length})</div>
      {loading ? <p className="hint">불러오는 중…</p> : items.length === 0 ? (
        <p className="hint">아직 신청이 없어요.</p>
      ) : (
        items.map((c) => (
          <div key={c.id} className="row-item">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{c.name} · {c.phone}</div>
              <div className="small-muted">희망일: {c.date_label || '-'}</div>
              {c.discomfort && <div style={{ fontSize: 14, marginTop: 2 }}>“{c.discomfort}”</div>}
              <div className="small-muted">신청: {formatDate(c.created_at)}</div>
            </div>
            <button className="tag-del" onClick={() => del(c.id)}>삭제</button>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= 수업 시간 관리 ================= */
function SchedulesTab() {
  const [items, setItems] = useState([]);
  const [instructor, setInstructor] = useState('홍혜경');
  const [timeText, setTimeText] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/schedules');
    const json = await res.json();
    setItems(json.items || []);
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setMsg('');
    if (!timeText.trim()) return;
    const sort_order = items.filter((i) => i.instructor === instructor).length + 1;
    await fetch('/api/admin/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructor, time_text: timeText, sort_order }),
    });
    setTimeText('');
    load();
  }

  async function edit(item) {
    const next = prompt('시간을 수정하세요', item.time_text);
    if (next === null) return;
    await fetch('/api/admin/schedules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, time_text: next }),
    });
    load();
  }

  async function del(id) {
    if (!confirm('삭제할까요?')) return;
    await fetch(`/api/admin/schedules?id=${id}`, { method: 'DELETE' });
    load();
  }

  const render = (name, key) => (
    <div className="teacher" style={{ marginBottom: 16 }}>
      <div className="teacher-name">{name}</div>
      {items.filter((i) => i.instructor === key).length === 0 && <div className="empty">등록된 시간 없음</div>}
      {items.filter((i) => i.instructor === key).map((i) => (
        <div key={i.id} className="row-item">
          <span style={{ flex: 1 }}>{i.time_text}</span>
          <button className="tag-edit" onClick={() => edit(i)}>수정</button>
          <button className="tag-del" onClick={() => del(i.id)}>삭제</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="card">
      <div className="section-title">🕒 수업 가능 시간 관리</div>
      {render('홍혜경 원장님', '홍혜경')}
      {render('묘니쌤', '묘니')}

      <form className="inline-form" onSubmit={add}>
        <select value={instructor} onChange={(e) => setInstructor(e.target.value)} style={{ flex: '0 0 110px' }}>
          <option value="홍혜경">홍혜경</option>
          <option value="묘니">묘니</option>
        </select>
        <input
          placeholder="예) 월·수·금 오전 10시~오후 1시"
          value={timeText}
          onChange={(e) => setTimeText(e.target.value)}
        />
        <button className="btn small" type="submit">추가</button>
      </form>
      {msg && <div className="msg-ok">{msg}</div>}
    </div>
  );
}

/* ================= 상담 날짜 관리 ================= */
function DatesTab() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  async function load() {
    const res = await fetch('/api/admin/dates');
    const json = await res.json();
    setItems(json.items || []);
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!date) return;
    const weekday = weekdayOf(date);
    const sort_order = items.length + 1;
    await fetch('/api/admin/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date_label: date, weekday, time_text: time, sort_order }),
    });
    setDate(''); setTime('');
    load();
  }

  async function toggle(item) {
    await fetch('/api/admin/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_closed: !item.is_closed }),
    });
    load();
  }

  async function editTime(item) {
    const next = prompt('시간을 수정하세요', item.time_text || '');
    if (next === null) return;
    await fetch('/api/admin/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, time_text: next }),
    });
    load();
  }

  async function del(id) {
    if (!confirm('삭제할까요?')) return;
    await fetch(`/api/admin/dates?id=${id}`, { method: 'DELETE' });
    load();
  }

  // 순서 바꾸기: 위(-1) 또는 아래(+1)로 이동
  async function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    // 새 순서대로 번호(sort_order)를 다시 부여
    await Promise.all(
      reordered.map((it, i) =>
        fetch('/api/admin/dates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: it.id, sort_order: i + 1 }),
        })
      )
    );
    load();
  }

  return (
    <div className="card">
      <div className="section-title">📅 상담 가능 날짜 관리</div>
      <p className="hint">↑ ↓ 버튼으로 손님에게 보이는 순서를 바꿀 수 있어요.</p>
      {items.length === 0 && <p className="hint">등록된 날짜가 없어요.</p>}
      {items.map((d, index) => (
        <div key={d.id} className="row-item">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button className="tag-move" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
            <button className="tag-move" onClick={() => move(index, 1)} disabled={index === items.length - 1}>↓</button>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>
              {d.date_label} {d.weekday ? `(${d.weekday})` : ''}{' '}
              <span className={d.is_closed ? 'pill-closed' : 'pill-open'}>{d.is_closed ? '마감' : '열림'}</span>
            </div>
            <div className="small-muted">{d.time_text || '시간 미정'}</div>
          </div>
          <button className="tag-edit" onClick={() => editTime(d)}>시간</button>
          <button className="tag-edit" onClick={() => toggle(d)}>{d.is_closed ? '열기' : '마감'}</button>
          <button className="tag-del" onClick={() => del(d.id)}>삭제</button>
        </div>
      ))}

      <form className="inline-form" onSubmit={add}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ flex: '0 0 150px' }} />
        <input placeholder="시간 예) 오후 2시" value={time} onChange={(e) => setTime(e.target.value)} />
        <button className="btn small" type="submit">추가</button>
      </form>
    </div>
  );
}

/* ================= 입금 계좌 관리 ================= */
function BankTab() {
  const [bank, setBank] = useState({ bank: '', account_number: '', holder: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/bank').then((r) => r.json()).then((j) => {
      if (j.bank) setBank({ bank: j.bank.bank || '', account_number: j.bank.account_number || '', holder: j.bank.holder || '' });
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/admin/bank', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bank),
    });
    const json = await res.json();
    setMsg(json.ok ? '저장했어요 ✓' : '저장 실패');
  }

  return (
    <div className="card">
      <div className="section-title">🏦 입금 계좌 관리</div>
      <form onSubmit={save}>
        <div className="field">
          <label>은행</label>
          <input value={bank.bank} onChange={(e) => setBank({ ...bank, bank: e.target.value })} placeholder="예) 카카오뱅크" />
        </div>
        <div className="field">
          <label>계좌번호</label>
          <input value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} placeholder="예) 3333-01-1234567" />
        </div>
        <div className="field">
          <label>예금주</label>
          <input value={bank.holder} onChange={(e) => setBank({ ...bank, holder: e.target.value })} placeholder="예) 홍혜경" />
        </div>
        <button className="btn" type="submit">저장</button>
        {msg && <div className="msg-ok">{msg}</div>}
      </form>
    </div>
  );
}

/* ================= 도우미 함수 ================= */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function weekdayOf(dateStr) {
  try {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(dateStr + 'T00:00:00').getDay()];
  } catch {
    return '';
  }
}
