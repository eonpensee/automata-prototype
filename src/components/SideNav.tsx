import type { ReactNode } from 'react'

// 왼쪽 메뉴: 보이기만 하고 누르는 동작은 없어요.

const ic = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
const Chev = ({ dir = 'down' }: { dir?: 'down' | 'right' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'down' ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6'} />
  </svg>
)

const I = {
  home: <svg {...ic}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  todo: <svg {...ic}><path d="M10 6h11M10 12h11M10 18h11" /><path d="M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" /></svg>,
  flow: <svg {...ic}><circle cx="5" cy="12" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 12h4l3-5h3M11 12l3 5h3" /></svg>,
  me: <svg {...ic}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>,
  team: <svg {...ic}><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M2 20c1-3 3.5-5 6-5s5 2 6 5M14 15.5c.6-.3 1.3-.5 2-.5 2.5 0 5 2 6 5" /></svg>,
  spark: <svg {...ic}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>,
  mail: <svg {...ic}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  grid: <svg {...ic}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>,
  plug: <svg {...ic}><path d="M9 15l6-6M7 11l-2 2a3.5 3.5 0 0 0 5 5l2-2M17 13l2-2a3.5 3.5 0 0 0-5-5l-2 2" /></svg>,
  deal: <svg {...ic}><path d="M2 12l4-4 4 2 3-2 4 1 5 3M6 8l-2 6 4 4 2-1M22 12l-3 5-3 1-4-3" /></svg>,
  gear: <svg {...ic}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>,
}

function Item({ icon, label, on, right }: { icon?: ReactNode; label: string; on?: boolean; right?: ReactNode }) {
  return (
    <div className={'nav' + (on ? ' on' : '')} aria-current={on ? 'page' : undefined} style={{ cursor: 'default' }}>
      {icon}
      <span style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 6 }}>{label}</span>
      {right}
    </div>
  )
}

function Sub({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="nav" style={{ cursor: 'default', paddingLeft: 42, height: 36 }}>
      <span style={{ flex: '1 1 auto' }}>{label}</span>
      {right != null && <span style={{ fontSize: 13, color: '#6F6F6F' }}>{right}</span>}
    </div>
  )
}

function Group({ label }: { label: string }) {
  return (
    <div style={{ margin: '18px 12px 6px', fontSize: 13, color: '#6F6F6F', display: 'flex', alignItems: 'center', gap: 4 }}>
      {label}<Chev />
    </div>
  )
}

const n = (v: number | string) => <span style={{ fontSize: 13, color: '#6F6F6F' }}>{v}</span>

export function SideNav() {
  return (
    <nav aria-label="주 메뉴" className="sidenav">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 6px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <svg width="20" height="20" viewBox="0 0 100 100" aria-hidden="true" style={{ flex: '0 0 auto' }}>
            <g fill="#171717">
              {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
                <rect key={r * 3 + c} x={c * 35.714} y={r * 35.714} width="28.571" height="28.571" opacity={0.24 + 0.19 * (r + c)} />
              )))}
            </g>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>주식회사 에스엠디네트웍스</span>
          <Chev />
        </div>
        <span className="btn sm" style={{ width: 32, padding: 0, flex: '0 0 auto', cursor: 'default' }} aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
        </span>
      </div>

      <div className="sidenav-list">
        <Item icon={I.home} label="홈" />
        <Item icon={I.todo} label="오늘의 업무" right={<Chev dir="right" />} />
        <Item icon={I.flow} label="자동 처리 현황" on />
        <Item icon={I.me} label="내 근무" right={<Chev />} />
        <Sub label="오늘" />
        <Sub label="근무 기록" />
        <Sub label="급여명세서" />
        <Sub label="신청 · 증명서" />
        <Item icon={I.team} label="우리 팀" />

        <Group label="AWP" />
        <Item icon={I.spark} label="에이전트" />
        <Item icon={I.mail} label="Inbox" />
        <Item icon={I.grid} label="앱 빌더" />
        <Item icon={I.plug} label="커넥터" />

        <Group label="ARP" />
        <Item icon={I.deal} label="B2B 세일즈" right={n(7)} />
        <Sub label="대시보드" />
        <Sub label="세일즈 현황" right={3} />
        <Sub label="견적 요청" />
        <Sub label="견적" right={2} />
        <Sub label="수주" right={2} />
        <Sub label="출하지시" right="출고 · 배송" />
        <Sub label="인도" />
        <Sub label="매출 청구" />
      </div>

      <div className="sidenav-foot">
        {I.gear}
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>용대표</span>
          <span style={{ fontSize: 13, color: '#6F6F6F' }}>마스터</span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5v14M20 12H9M13 7l-5 5 5 5" /></svg>
      </div>
    </nav>
  )
}
