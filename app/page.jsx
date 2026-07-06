'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState(null);      // { schedules, dates, bank }
  const [loading, setLoading] = useState(true);
  const [showPrice, setShowPrice] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null); // 신청하려는 날짜
  const [form, setForm] = useState({ name: '', phone: '', discomfort: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // 대기 신청
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [wlForm, setWlForm] = useState({ name: '', phone: '', teacher: '', desired_time: '', note: '' });
  const [wlSubmitting, setWlSubmitting] = useState(false);
  const [wlDone, setWlDone] = useState(false);
  const [wlError, setWlError] = useState('');

  useEffect(() => {
    fetch('/api/public')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError('정보를 불러오지 못했어요. 새로고침 해주세요.'))
      .finally(() => setLoading(false));
  }, []);

  function openForm(date) {
    if (date.is_closed) return;
    setSelectedDate(date);
    setForm({ name: '', phone: '', discomfort: '' });
    setDone(false);
    setError('');
  }

  function closeModal() {
    setSelectedDate(null);
    setDone(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setError('이름과 연락처를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          discomfort: form.discomfort,
          date_label: `${selectedDate.date_label} (${selectedDate.weekday || ''}) ${selectedDate.time_text || ''}`.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDone(true);
      } else {
        setError(json.error || '신청에 실패했어요. 다시 시도해 주세요.');
      }
    } catch {
      setError('신청에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  function openWaitlist() {
    setWlForm({ name: '', phone: '', teacher: '', desired_time: '', note: '' });
    setWlDone(false);
    setWlError('');
    setWaitlistOpen(true);
  }

  async function submitWaitlist(e) {
    e.preventDefault();
    setWlError('');
    if (!wlForm.name.trim() || !wlForm.phone.trim()) {
      setWlError('이름과 연락처를 입력해 주세요.');
      return;
    }
    setWlSubmitting(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wlForm),
      });
      const json = await res.json();
      if (json.ok) {
        setWlDone(true);
      } else {
        setWlError(json.error || '신청에 실패했어요. 다시 시도해 주세요.');
      }
    } catch {
      setWlError('신청에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setWlSubmitting(false);
    }
  }

  const bank = data?.bank || {};

  return (
    <main className="wrap">
      {/* 1) 상단 헤더 */}
      <div style={{ marginBottom: 22 }}>
        <span className="badge">SNPE 서면점</span>
        <h1 className="title">1:1 개인레슨 상담예약창</h1>
      </div>

      {/* 2) 공지 배너 */}
      <div className="notice">
        SNPE 서면점은 한 분 한 분에게 집중하기 위해, 1:1 프라이빗 레슨만 진행합니다 💕
      </div>

      {loading && <div className="card">불러오는 중… ⏳</div>}

      {!loading && data && (
        <>
          {/* 3) 지금 예약 가능한 수업 시간 */}
          <section className="card">
            <div className="section-title">🕒 지금 진행 가능한 수업 시간</div>
            <p className="hint">
              수업 시간은 지금 정하지 않아요! 남은 시간대만 확인하시고, 방문 상담 후 확정돼요 ✨
            </p>

            <div className="teacher">
              <div className="teacher-name">홍혜경 원장님</div>
              {data.schedules.홍혜경.length === 0 ? (
                <div className="empty">현재 안내된 시간이 없어요.</div>
              ) : (
                data.schedules.홍혜경.map((s) => (
                  <div className="slot" key={s.id}>{s.time_text}</div>
                ))
              )}
            </div>

            <div className="teacher">
              <div className="teacher-name">묘니쌤</div>
              {data.schedules.묘니.length === 0 ? (
                <div className="empty">현재 안내된 시간이 없어요.</div>
              ) : (
                data.schedules.묘니.map((s) => (
                  <div className="slot" key={s.id}>{s.time_text}</div>
                ))
              )}
            </div>

            <p className="hint" style={{ marginTop: 16, marginBottom: 10 }}>
              이 외의 시간을 원하시면 <b>대기 신청</b>이 가능해요. 자리가 나면 순서대로 연락드려요 🙂
            </p>
            <button className="btn ghost" onClick={openWaitlist}>대기 신청하기</button>
          </section>

          {/* 4) 수강료 */}
          <section className="card">
            <div className="section-title">📋 수강료</div>
            <button className="btn ghost" onClick={() => setShowPrice((v) => !v)}>
              {showPrice ? '수강료 접기' : '수강료 보기'}
            </button>
            {showPrice && (
              <img
                className="price-img"
                src="/price.png"
                alt="수강료 안내"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setZoomImage(true)}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const n = document.createElement('p');
                  n.className = 'hint';
                  n.style.marginTop = '12px';
                  n.textContent = '수강료 이미지를 준비 중이에요. (price.png 파일을 넣어주세요)';
                  e.currentTarget.after(n);
                }}
              />
            )}
          </section>

          {/* 5) 상담 예약 */}
          <section className="card">
            <div className="section-title">📅 상담 예약</div>
            <p className="hint">
              노쇼가 잦아 부득이하게 상담 예약비 10,000원을 받고 있어요. 신청 후 계좌로 보내주시면
              예약이 확정되고, 예약금은 상담 후 전액 돌려드리니 편하게 신청해 주세요 🙂
            </p>

            <div className="date-grid">
              {data.dates.length === 0 && (
                <div className="empty" style={{ color: 'var(--plum-soft)' }}>
                  현재 열린 상담 날짜가 없어요. 곧 업데이트됩니다!
                </div>
              )}
              {data.dates.map((d) => (
                <button
                  key={d.id}
                  className={`date-card ${d.is_closed ? 'closed' : ''}`}
                  onClick={() => openForm(d)}
                  disabled={d.is_closed}
                >
                  <span>
                    <span className="d-date">
                      {d.date_label} {d.weekday ? `(${d.weekday})` : ''}
                    </span>
                    <br />
                    <span className="d-sub">{d.time_text}</span>
                  </span>
                  <span className={d.is_closed ? 'pill-closed' : 'pill-open'}>
                    {d.is_closed ? '마감' : '신청'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 하단 정보 */}
          <div className="footer">
            SNPE 부산서면점
          </div>
        </>
      )}

      {/* ===== 신청 모달 ===== */}
      {selectedDate && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={closeModal}>×</button>

            {!done ? (
              <>
                <h3>상담 예약 신청</h3>
                <p className="hint" style={{ marginTop: 6 }}>
                  {selectedDate.date_label} {selectedDate.weekday ? `(${selectedDate.weekday})` : ''}{' '}
                  {selectedDate.time_text}
                </p>

                <form onSubmit={submit} style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>이름</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="성함을 입력해 주세요"
                    />
                  </div>
                  <div className="field">
                    <label>연락처</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      inputMode="tel"
                    />
                  </div>
                  <div className="field">
                    <label>어디가 불편하신가요?</label>
                    <textarea
                      value={form.discomfort}
                      onChange={(e) => setForm({ ...form, discomfort: e.target.value })}
                      placeholder="예) 목·어깨 결림, 허리 통증, 골반 틀어짐 등"
                    />
                  </div>

                  {error && <div className="msg-error">{error}</div>}

                  <button className="btn" type="submit" disabled={submitting} style={{ marginTop: 6 }}>
                    {submitting ? '신청 중…' : '신청하기'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="done-check">✓</div>
                <h3 style={{ textAlign: 'center' }}>신청이 접수되었어요!</h3>
                <p className="hint" style={{ textAlign: 'center', marginTop: 6 }}>
                  아래 계좌로 <b>예약비 1만원</b>을 입금해 주시면 예약이 확정돼요.<br />
                  (상담 후 전액 환불해 드려요 🙂)
                </p>

                <div className="bank-box">
                  <div className="bank-row"><span className="k">은행</span><span className="v">{bank.bank || '-'}</span></div>
                  <div className="bank-row"><span className="k">계좌번호</span><span className="v">{bank.account_number || '-'}</span></div>
                  <div className="bank-row"><span className="k">예금주</span><span className="v">{bank.holder || '-'}</span></div>
                  <div className="bank-row"><span className="k">금액</span><span className="v">10,000원</span></div>
                </div>

                <button className="btn" onClick={closeModal} style={{ marginTop: 16 }}>
                  확인
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* ===== 대기 신청 모달 ===== */}
      {waitlistOpen && (
        <div className="overlay" onClick={() => setWaitlistOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setWaitlistOpen(false)}>×</button>

            {!wlDone ? (
              <>
                <h3>대기 신청</h3>
                <p className="hint" style={{ marginTop: 6 }}>
                  원하시는 시간대를 남겨주시면, 자리가 나는 대로 순서대로 연락드려요 🙂
                </p>

                <form onSubmit={submitWaitlist} style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>이름</label>
                    <input
                      value={wlForm.name}
                      onChange={(e) => setWlForm({ ...wlForm, name: e.target.value })}
                      placeholder="성함을 입력해 주세요"
                    />
                  </div>
                  <div className="field">
                    <label>연락처</label>
                    <input
                      value={wlForm.phone}
                      onChange={(e) => setWlForm({ ...wlForm, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      inputMode="tel"
                    />
                  </div>
                  <div className="field">
                    <label>강사 선택</label>
                    <div className="choice-row">
                      {['홍혜경 원장님', '묘니쌤', '둘 다 상관없음'].map((t) => (
                        <button
                          type="button"
                          key={t}
                          className={`choice ${wlForm.teacher === t ? 'active' : ''}`}
                          onClick={() => setWlForm({ ...wlForm, teacher: t })}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>원하는 시간대</label>
                    <input
                      value={wlForm.desired_time}
                      onChange={(e) => setWlForm({ ...wlForm, desired_time: e.target.value })}
                      placeholder="예) 평일 6~9시, 주말 10~12시, 월수 시간은 상관없음"
                    />
                  </div>
                  <div className="field">
                    <label>어디가 불편하신가요? (선택)</label>
                    <textarea
                      value={wlForm.note}
                      onChange={(e) => setWlForm({ ...wlForm, note: e.target.value })}
                      placeholder="예) 목·어깨 결림, 허리 통증 등"
                    />
                  </div>

                  {wlError && <div className="msg-error">{wlError}</div>}

                  <button className="btn" type="submit" disabled={wlSubmitting} style={{ marginTop: 6 }}>
                    {wlSubmitting ? '신청 중…' : '대기 신청하기'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="done-check">✓</div>
                <h3 style={{ textAlign: 'center' }}>대기 신청이 접수되었어요!</h3>
                <p className="hint" style={{ textAlign: 'center', marginTop: 6 }}>
                  자리가 나는 대로 순서대로 연락드릴게요. 감사합니다 🙂
                </p>
                <button className="btn" onClick={() => setWaitlistOpen(false)} style={{ marginTop: 16 }}>
                  확인
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== 수강료 이미지 확대 보기 ===== */}
      {zoomImage && (
        <div
          className="overlay"
          style={{ alignItems: 'center', padding: 16 }}
          onClick={() => setZoomImage(false)}
        >
          <img
            src="/price.png"
            alt="수강료 안내 확대"
            style={{ maxWidth: '100%', maxHeight: '92vh', borderRadius: 12, objectFit: 'contain' }}
          />
        </div>
      )}
    </main>
  );
}
