import { useMemo, type ReactNode } from 'react'
import type { FlowCase, FlowStep } from '../data/review'
import type { Status, StepCode, Unit, ZoneId } from '../data/today'
import { BADGE, RANK } from '../logic'
import { SCENE_SVG } from './flowScene'

// 시안 3 (1-7안): 가운데는 처음엔 거래 상대별 2D 카드, 처리 단위를 누르면 그 자리에서 3D 장면으로 바뀌어요.

const ZLAB: Record<ZoneId, string> = { hq: '(주)엘리먼츠', shop: '판매처', wh: '창고', sup: '매입처', bank: '은행', card: '카드사' }
const ZORDER: ZoneId[] = ['hq', 'wh', 'sup', 'bank', 'card', 'shop']
const STO: [Status, string][] = [['대기 중', 'mk sched'], ['진행 중', 'mk mid'], ['완료', 'mk done'], ['확인 필요', 'mk wait']]

const svg = (children: ReactNode) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
const ZICON: Record<ZoneId, ReactNode> = {
  hq: svg(<><path d="M4 21V5l8-3 8 3v16" /><path d="M9 21v-5h6v5M8 8h2M14 8h2M8 12h2M14 12h2" /></>),
  shop: svg(<><path d="M4 9l1.5-5h13L20 9" /><path d="M4 9h16v11H4z" /><path d="M9 20v-6h6v6" /></>),
  wh: svg(<><path d="M3 9l9-5 9 5v11H3z" /><path d="M7 20v-7h10v7" /><path d="M7 16h10" /></>),
  sup: svg(<path d="M3 20V10l5 3V10l5 3V10l5 3V4h3v16z" />),
  bank: svg(<><path d="M3 10l9-6 9 6" /><path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" /></>),
  card: svg(<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h3" /></>),
}

// 3D 장면 안 자리: [선 이름, 왼쪽 %, 위 %]
type Station = 'desk' | 'p2' | 'conv' | 'kiosk' | 'settle' | 'stack'
const TPOS: Record<Station, [string, number, number]> = { desk: ['t0', 9.36, 55.03], p2: ['t2', 42.39, 38.13], conv: ['t3', 63.32, 32.9], kiosk: ['t4', 69.94, 59.72], settle: ['t5', 57.24, 76.67], stack: ['tsh', 66.82, 17.43] }
// 지금 단계 카드가 다른 단계 이름표를 가리거나 장면 밖으로 잘리지 않게 자리마다 놓는 방향
const CARD_AT: Record<Station, string> = { desk: 'translate(-30%, 6px)', p2: 'translate(calc(-100% - 14px), -72%)', conv: 'translate(-50%, calc(-100% - 6px))', kiosk: 'translate(14px, -50%)', settle: 'translate(calc(-100% - 10px), -70%)', stack: 'translate(14px, -20%)' }
const SEQ: Station[] = ['desk', 'p2', 'conv', 'kiosk', 'settle']

/** 단계 순서대로 장면 속 자리에 놓아요 (책상 → 팔레트 → 컨베이어 → 키오스크 → 정산대). 마지막 단계가 재고 일이면 선반으로. */
function stationsFor(steps: FlowStep[]): Station[] {
  return steps.map((s, i) => i > 0 && i === steps.length - 1 && /재고|잔여/.test(s.title) ? 'stack' : SEQ[Math.min(i, 4)])
}

const active = (k: StepCode) => k !== 'd' && k !== 'n'
const NCS: Record<StepCode, [string, string]> = { c: ['진행 중', 'cells3'], q: ['대기 중', 'wring2'], w: ['확인 필요', 'chk2'], d: ['완료', 'chk2'], n: ['아직 안 함', 'wring2'] }
const KCLS: Record<StepCode, string> = { c: 'kc', q: 'kw', w: 'kf', d: 'kd', n: 'kw' }

function FlowScene({ flow, onBack, onMore }: { flow: FlowCase; onBack: () => void; onMore: () => void }) {
  const { unit: U, steps } = flow
  const st = useMemo(() => stationsFor(steps), [steps])
  const html = useMemo(() => {
    const on: Partial<Record<Station, boolean>> = {}
    steps.forEach((s, i) => { if (active(s.status)) on[st[i]] = true })
    const ld: Record<string, string> = {}, ldd: Record<string, string> = {}
    ;['t0', 't2', 't3', 't4', 't5'].forEach((k) => { ld[k] = 'ld hide'; ldd[k] = 'ldd hide' })
    steps.forEach((s, i) => { const k = TPOS[st[i]][0]; if (k in ld) { ld[k] = 'ld' + (active(s.status) ? ' on' : ''); ldd[k] = 'ldd' + (active(s.status) ? ' on' : '') } })
    const warn = steps.some((s, i) => st[i] === 'stack' && active(s.status))
    const v: Record<string, string> = {
      'pp.pl': 'pp', 'pp.p2': 'pp', 'pp.p3': 'pp', 'pp.p5': 'pp',
      'ldWarn': warn ? 'ld on' : 'ld hide', 'lddWarn': warn ? 'ldd on' : 'ldd hide',
      'mv': 'mvg' + (on.conv ? ' on' : ''), 'kscr': 'ks' + (on.kiosk ? ' on' : ''), 'xl': 'xl' + (on.desk ? ' on' : ''),
    }
    ;(['desk', 'stack', 'conv', 'kiosk', 'settle'] as Station[]).forEach((o) => { v['g.' + o] = 'grp' + (on[o] ? ' on' : '') })
    Object.keys(ld).forEach((k) => { v['ld.' + k] = ld[k]; v['ldd.' + k] = ldd[k] })
    return SCENE_SVG.replace(/\{\{\s*fv\.([\w.]+)\s*\}\}/g, (_, k: string) => v[k] ?? '')
  }, [steps, st])

  let ci = steps.findIndex((s) => active(s.status))
  if (ci < 0) ci = steps.length - 1
  const cs = steps[ci], P = TPOS[st[ci]], k = cs.status, q = U.id === 'u1' && k === 'w'
  const nc = NCS[k]
  return <>
    <div className="fl3h">
      <button className="fl3back" onClick={onBack}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>거래 상대별 지금 상황</button>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}><span className="mono" style={{ fontSize: 'max(13px,var(--min-font-size,10px))', fontWeight: 600, color: '#6F6F6F' }}>{U.t}</span><span style={{ fontSize: 'max(16px,var(--min-font-size,10px))', fontWeight: 700 }}>{U.name}</span><span className={BADGE[U.st]}>{U.st}</span></span>
    </div>
    <div className="fl3 whin">
      <div className="fl3s">
        <div className="scene" dangerouslySetInnerHTML={{ __html: html }} />
        {steps.map((s, i) => { const p = TPOS[st[i]]; return <span key={i} className={'tag' + (s.status === 'd' ? ' done' : s.status === 'n' ? ' off' : s.status === 'w' ? ' warn' : ' on') + (st[i] === 'desk' ? ' below' : '') + (i === ci ? ' hid' : '')} style={{ left: p[1] + '%', top: p[2] + '%' }}><span className="tn">{i + 1}</span>{s.title}</span> })}
        <div className={'nowc ' + KCLS[k]} style={{ left: P[1] + '%', top: P[2] + '%', width: q ? 300 : undefined, transform: CARD_AT[st[ci]] }}>
          <span className="nch"><span className="live"><span className={nc[1]} aria-hidden="true"><i /><i /><i /><i /></span>{nc[0]}</span>{cs.time && <span className="mono" style={{ fontSize: 'max(11px,var(--min-font-size,10px))', color: '#9C9C9C' }}>{cs.time} 시작</span>}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="mn">{ci + 1}</span><span style={{ fontSize: 'max(15px,var(--min-font-size,10px))', fontWeight: 700 }}>{cs.title}</span></span>
          {q && <span className="aq"><span><em>주문</em><b>24개</b></span><span><em>재고</em><b>18개</b></span><span className="r"><em>부족</em><b>6개</b></span></span>}
          <span style={{ fontSize: 'max(13px,var(--min-font-size,10px))', color: '#D9DBD7', lineHeight: 1.5 }}>{cs.summary}</span>
          <button type="button" className="more" onClick={onMore}>{k === 'w' ? '할 일에서 처리' : '자세히 보기'}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
        </div>
      </div>
    </div>
  </>
}

interface Props {
  cases: FlowCase[]
  /** 필터가 걸렸을 때 해당하는 처리 단위. 없으면 null */
  active: Unit[] | null
  flowId: string | null
  onOpenFlow: (id: string) => void
  onCloseFlow: () => void
  onOpenDetail: (id: string) => void
}

export function FlatStage({ cases, active: act, flowId, onOpenFlow, onCloseFlow, onOpenDetail }: Props) {
  const flow = flowId ? cases.find((c) => c.unit.id === flowId) : undefined
  const units = cases.map((c) => c.unit)
  const zones = ZORDER.filter((z) => units.some((u) => u.z === z))
  return (
    <div className="world f7">
      {flow ? <FlowScene key={flow.unit.id} flow={flow} onBack={onCloseFlow} onMore={() => onOpenDetail(flow.unit.id)} /> : <>
        <span className="rh" style={{ paddingLeft: 2 }}>거래 상대별 지금 상황</span>
        <div className="f7grid">
          {zones.map((z) => {
            const all = units.filter((u) => u.z === z)
            const hit = act ? all.filter((u) => act.includes(u)) : all
            const show = hit.slice().sort((p, q) => RANK[q.st] - RANK[p.st])
            return (
              <div key={z} className={'f7c' + (act ? (hit.length ? ' on' : ' off') : '')}>
                <div className="f7h">
                  <span className="f7ic" aria-hidden="true">{ZICON[z]}</span>
                  <span style={{ fontSize: 'max(15px,var(--min-font-size,10px))', fontWeight: 700 }}>{ZLAB[z]}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 'max(13px,var(--min-font-size,10px))', color: '#6F6F6F' }}>처리 단위 <b style={{ color: '#171717' }}>{all.length}개</b></span>
                </div>
                <div className="f7st">
                  {STO.map(([label, mark]) => { const n = all.filter((u) => u.st === label).length; return <span key={label} className={'f7p' + (n ? '' : ' z')}><span className={mark} aria-hidden="true" />{label} <b>{n}</b></span> })}
                </div>
                <div className="f7l">
                  {show.slice(0, 3).map((u) => (
                    <button type="button" key={u.id} className="f7i" onClick={() => onOpenFlow(u.id)}><span className={BADGE[u.st]}>{u.st}</span><span className="zpt"><span>{u.name}</span></span></button>
                  ))}
                  {show.length > 3 && <span className="f7more">외 {show.length - 3}개</span>}
                </div>
              </div>
            )
          })}
        </div>
      </>}
    </div>
  )
}
