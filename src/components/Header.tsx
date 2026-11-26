interface Props {
  dateLabel: string
  /** 전날·다음 날 이동. 지금은 연결된 동작 없음 */
  onPrev?: () => void
  onNext?: () => void
}

/** 헤더: 제목, 날짜 이동 */
export function Header({ dateLabel, onPrev, onNext }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>자동 처리 현황</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn icon" aria-label="전날" onClick={onPrev}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 10, border: '1px solid #E2E2E2', background: '#FFFFFF', fontSize: 14, fontWeight: 600, boxSizing: 'border-box' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
          {dateLabel}
        </div>
        <button className="btn icon" aria-label="다음 날" disabled style={{ opacity: 0.4, cursor: 'default' }} onClick={onNext}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <span className="badge st-done">오늘</span>
      </div>
    </div>
  )
}
