'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState(null);      // { schedules, dates, bank }
  const [loading, setLoading] = useState(true);
  const [showPrice, setShowPrice] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

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

  return (
    <main className="wrap">
      {/* 1) 상단 헤더 */}
      <div style={{ marginBottom: 22 }}>
        <span className="badge">SNPE 서면점</span>
        <h1 className="title">1:1 프라이빗 레슨 수강료 및 무료 체형 분석 상담 안내</h1>
      </div>

      {/* 2) 공지 배너 */}
      <div className="notice">
        SNPE 서면점은 한 분 한 분에게 집중하기 위해, 1:1 프라이빗 레슨만 진행합니다 💕
      </div>

      {loading && <div className="card">불러오는 중… ⏳</div>}
      {error && <div className="card" style={{ color: '#d15b5b' }}>{error}</div>}

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

          {/* 5) 상담 가능한 시간 (보여주기만, 예약은 대화로) */}
          <section className="card">
            <div className="section-title">📅 상담 가능한 시간</div>
            <p className="hint">
              아래는 현재 상담이 가능한 시간이에요. 원하시는 시간을 확인하신 뒤, 편하게 문의 주시면
              대화를 통해 예약을 잡아드려요 🙂
            </p>

            <div className="date-grid">
              {data.dates.length === 0 && (
                <div className="empty" style={{ color: 'var(--plum-soft)' }}>
                  현재 안내된 상담 시간이 없어요. 곧 업데이트됩니다!
                </div>
              )}
              {data.dates.map((d) => (
                <div
                  key={d.id}
                  className={`date-card ${d.is_closed ? 'closed' : ''}`}
                  style={{ cursor: 'default' }}
                >
                  <span>
                    <span className="d-date">
                      {d.date_label} {d.weekday ? `(${d.weekday})` : ''}
                    </span>
                    <br />
                    <span className="d-sub">{d.time_text}</span>
                  </span>
                  <span className={d.is_closed ? 'pill-closed' : 'pill-open'}>
                    {d.is_closed ? '마감' : '가능'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 하단 정보 */}
          <div className="footer">
            SNPE 부산서면점
          </div>
        </>
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
