import { useMemo, useState } from 'react'
import type { SourceIcon, SourceId, Status } from '../data/today'
import { Header } from '../components/Header'
import { SideNav } from '../components/SideNav'
import { SourceGlyph, CloseIcon } from '../components/Icons'
import { casesForDate as mockCasesForDate, REVIEW_DATES as MOCK_DATES, type FlowCase } from '../data/review'
import { ENGINE_DATES, engineCasesForDate } from '../data/engine'
import { currentStep } from '../data/nodes'
import { BADGE, RANK } from '../logic'
import { useFitZoom } from '../useFitZoom'
import { Village, type PlaceState } from '../v7/Village5'
import { CO, MODULE_NAME, WORLD, insideScene, whereInside, whereModule, whereWorld } from '../v7/scene'
import { groupUnits, type ProcUnit } from '../v7/units'
import { CaseTable } from '../v7/Overview5'
import '../review.css'
import '../v7/v5.css'
import './v8.css'

/**
 * 시안 8: 대시보드.
 * 맨 위에서 지금 상황이 한 번에 읽히고(확인 필요 몇 건, 어디에), 그 아래에 들어온 자료(intake 배치)와 지도, 맨 아래에 케이스 목록.
 * 고르는 범위는 한 번에 하나뿐이에요: 전체, 상태 하나, 배치 하나, 위치 하나.
 */
const USE_MOCK = new URLSearchParams(location.search).get('data') === 'mock'
const REVIEW_DATES = USE_MOCK ? MOCK_DATES : ENGINE_DATES
const casesForDate = (date: string) => USE_MOCK ? mockCasesForDate(date, {}) : engineCasesForDate(date)
const CASE_SCREEN = 'http://127.0.0.1:3002/cases/all'

const ICON: Record<string, SourceIcon> = { mail: 'mail', ss: 'shop', cp: 'shop', bank: 'bank', card: 'card', manual: 'upload', chk: 'check' }
const SOURCE_NAME: Record<SourceId, string> = { mail: '거래처 메일', ss: '스마트스토어', cp: '쿠팡', bank: '은행', card: '카드사', manual: '직원 자료', chk: '재고 점검' }
const MADE: Record<string, string> = { so: '수주 등록', ship: '출고 요청', exp: '경비 전표', ar: '채권 정리', pay: '지급 기록', inv: '재고 반영', po: '발주서', mail: '발송 메일' }
const ORDER: Status[] = ['확인 필요', '진행 중', '대기 중', '완료']
const SEG: Record<Status, string> = { '확인 필요': 'need', '진행 중': 'run', '대기 중': 'wait', '완료': 'done' }

type Scope = { kind: 'all' } | { kind: 'status'; st: Status } | { kind: 'batch'; id: string } | { kind: 'spot'; key: string }

/** 케이스가 지금 있는 곳의 이름: 바깥 건물이거나 자사 부문 */
const spotOf = (c: FlowCase) => { const w = whereWorld(c); if (w !== CO) return WORLD.places.find(p => p.id === w)?.name ?? w; return MODULE_NAME[whereModule(c) ?? ''] ?? '자사' }

export function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(USE_MOCK ? '2026-11-26' : REVIEW_DATES[REVIEW_DATES.length - 1].id)
  const [scope, setScope] = useState<Scope>({ kind: 'all' })
  const [inside, setInside] = useState<string | null>(null)
  const [srcTab, setSrcTab] = useState<SourceId | 'all'>('all')
  const [madeOpen, setMadeOpen] = useState<string | null>(null)
  // 건물 안에서 누른 자리: 그 자리의 건이 지도 위에 작게 떠요
  const [pop, setPop] = useState<string | null>(null)
  const cases = useMemo(() => casesForDate(selectedDate), [selectedDate])
  const units = useMemo(() => groupUnits(cases), [cases])
  const counts = Object.fromEntries(ORDER.map(s => [s, cases.filter(c => c.unit.st === s).length])) as Record<Status, number>
  const need = counts['확인 필요'], total = cases.length

  const batch = scope.kind === 'batch' ? units.find(u => u.id === scope.id) : undefined
  const scoped = scope.kind === 'status' ? cases.filter(c => c.unit.st === scope.st) : scope.kind === 'batch' ? batch?.cases ?? [] : scope.kind === 'spot' ? cases.filter(c => c.unit.st === '확인 필요' && spotOf(c) === scope.key) : cases
  const scopeLabel = scope.kind === 'status' ? null : scope.kind === 'batch' && batch ? `${batch.title} ${batch.time}` : scope.kind === 'spot' ? scope.key : null
  const toggle = (next: Scope) => setScope(JSON.stringify(next) === JSON.stringify(scope) ? { kind: 'all' } : next)

  // 확인 필요한 곳: 많은 순
  const spots = [...cases.filter(c => c.unit.st === '확인 필요').reduce((m, c) => { const k = spotOf(c); m.set(k, [...(m.get(k) ?? []), c]); return m }, new Map<string, FlowCase[]>())].sort((a, b) => b[1].length - a[1].length)
  // 오늘 만든 것
  const made = [...cases.flatMap(c => c.outputs).reduce((m, o) => m.set(o.type, (m.get(o.type) ?? 0) + o.count), new Map<string, number>())]
  const sources = [...new Set(units.map(u => u.source))]
  const shownUnits = units.filter(u => srcTab === 'all' || u.source === srcTab)

  const scene = inside ? insideScene(inside) : WORLD
  const where = (c: FlowCase) => inside ? whereInside(inside, c) : whereWorld(c)
  const placeStates: Record<string, PlaceState> = {}
  for (const c of scoped) {
    const pl = where(c); if (!pl) continue
    const prev = placeStates[pl], next: PlaceState = { ...prev, lit: true }
    if (c.unit.st !== '완료') { const st: Status = !prev?.count || RANK[c.unit.st] > RANK[prev.count.st] ? c.unit.st : prev.count.st; next.count = { n: (prev?.count?.n ?? 0) + 1, st } }
    placeStates[pl] = next
  }
  // 건물 안에 들어오면 자리마다 말풍선으로 그곳의 건을 바로 보여 줘요
  const bubbles: Record<string, { id: string; title: string; sub: string; node: string; st: Status }[]> = {}
  // 맨 위 숫자를 눌러 할 일만 남겼을 때는 전체 지도에서도 건물마다 말풍선으로 그 건들을 바로 보여 줘요
  const showTodo = scope.kind === 'status' && scope.st === '확인 필요'
  if (inside || showTodo) for (const c of [...scoped].sort((a, b) => RANK[b.unit.st] - RANK[a.unit.st])) { const at = where(c); if (!at) continue; (bubbles[at] ??= []).push({ id: c.unit.id, title: c.unit.name, sub: '', node: c.unit.st === '완료' ? '' : c.stuck || c.steps[currentStep(c)].title, st: c.unit.st }) }
  // 할 일의 한 줄을 누르면 지도도 그 건이 있는 곳으로 가요 (자사 부문이면 자사 안의 그 자리)
  const goSpot = (key: string, c: FlowCase) => {
    if (scope.kind === 'spot' && scope.key === key) { setScope({ kind: 'all' }); setPop(null); return }
    const w = whereWorld(c)
    setScope({ kind: 'spot', key }); setInside(w); setPop(whereInside(w, c))
  }
  const insideName = WORLD.places.find(p => p.id === inside)?.name ?? ''
  const openCase = (_c: FlowCase) => { window.open(CASE_SCREEN, '_blank', 'noopener') }

  return <div className="today-content v5 v7 v8">
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setInside(null); setScope({ kind: 'all' }); setSrcTab('all') }} />

    <section className="now8" aria-label="지금 상황">
      <div className="now8-main">
        <h2>지금 할 일</h2>
        <div className="now8-head">
          <button type="button" className={'now8-big go' + (scope.kind === 'status' && scope.st === '확인 필요' ? ' on' : '')} disabled={!need} aria-pressed={scope.kind === 'status' && scope.st === '확인 필요'} aria-label={`지금 할 일 ${need}건, 지도에서 보기`}
            onClick={() => { toggle({ kind: 'status', st: '확인 필요' }); setInside(null); setPop(null) }}>
            {need}건<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>
        <div className="now8-legend">
          {ORDER.map(s => <div key={s} className={'lg8 ' + SEG[s] + (counts[s] ? '' : ' zero')}><span className="lg8-name"><i aria-hidden="true" />{s}</span><b>{counts[s]}<small>건</small></b></div>)}
        </div>
      </div>

      <div className="now8-col">
        <h2>할 일 내역</h2>
        <ul className="rows8">
          {spots.map(([k, cs]) => <li key={k}><button type="button" className={'row8' + (scope.kind === 'spot' && scope.key === k ? ' on' : '')} onClick={() => goSpot(k, cs[0])}>
            <b>{k}</b><span className="row8-sub">{cs[0].stuck || cs[0].steps[currentStep(cs[0])].title}{cs.length > 1 ? ` 외 ${cs.length - 1}건` : ''}</span><span className="row8-n">{cs.length}<small>건</small></span>
          </button></li>)}
          {!spots.length && <li className="empty8">없음</li>}
        </ul>
      </div>

      <div className="now8-col">
        <h2>오늘 만든 자료</h2>
        <ul className="rows8">
          {made.map(([k, n]) => <li key={k}><button type="button" className="row8" onClick={() => setMadeOpen(k)} aria-haspopup="dialog">
            <b>{MADE[k] ?? k}</b><span className="row8-sub" /><span className="row8-n">{n}<small>{k === 'inv' ? '개' : '건'}</small></span>
          </button></li>)}
          {!made.length && <li className="empty8">아직 없음</li>}
        </ul>
      </div>
    </section>

    <div className="mid8">
      <section className="card8 in8" aria-label="들어온 자료">
        <header className="card8-head"><h2>오늘 들어온 자료</h2></header>
        <div className="tabs8" role="tablist">
          <button type="button" role="tab" aria-selected={srcTab === 'all'} className={srcTab === 'all' ? 'on' : ''} onClick={() => setSrcTab('all')}>전체{srcTab === 'all' && <b>{units.length}</b>}</button>
          {sources.map(s => <button key={s} type="button" role="tab" aria-selected={srcTab === s} className={srcTab === s ? 'on' : ''} onClick={() => setSrcTab(s)}>{SOURCE_NAME[s]}{srcTab === s && <b>{units.filter(u => u.source === s).length}</b>}</button>)}
        </div>
        <ul className="batch8">
          {shownUnits.map(u => <BatchRow key={u.id} u={u} on={scope.kind === 'batch' && scope.id === u.id} onPick={() => { toggle({ kind: 'batch', id: u.id }); setInside(null); setPop(null) }} onOpenCase={openCase} />)}
          {!shownUnits.length && <li className="empty8">들어온 자료 없음</li>}
        </ul>
      </section>

      <section className="card8 map8" aria-label="처리 현황 지도">
        <header className="card8-head">
          <h2>{inside ? <button type="button" className="back8" onClick={() => { setInside(null); setPop(null) }} aria-label="전체 지도로 돌아가기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>{insideName}</button> : '처리 현황 지도'}</h2>
          <span className="head8-right">{scopeLabel && <button type="button" className="ct7-chip" onClick={() => setScope({ kind: 'all' })}>{scopeLabel}<span aria-hidden="true">×</span></button>}{need > 0 && <span className="live8"><i aria-hidden="true" />확인 필요</span>}</span>
        </header>
        <div className="stage s3stage review-stage stage5 st8"><div className="world">
          <Village key={inside ?? 'world'} scene={scene} allClickable={!inside} lively tight states={pop && placeStates[pop] ? { ...placeStates, [pop]: { ...placeStates[pop], current: true } } : placeStates}
            bubbles={inside || showTodo ? bubbles : undefined} popup={null} onPickPlace={id => { if (!inside) setInside(id) }} onOpenCase={() => window.open(CASE_SCREEN, '_blank', 'noopener')} onBackground={() => { setPop(null); if (showTodo) setScope({ kind: 'all' }) }} />
        </div></div>
      </section>
    </div>

    {madeOpen && <MadeDialog kind={madeOpen} cases={cases} onClose={() => setMadeOpen(null)} />}

    <section aria-label="케이스 목록" className="history-section">
      <div className="history-heading"><div><h2>케이스{scopeLabel && <b className="ct7-count">{scoped.length}건</b>}{scopeLabel && <button type="button" className="ct7-chip" onClick={() => setScope({ kind: 'all' })}>{scopeLabel}<span aria-hidden="true">×</span></button>}</h2></div></div>
      <div className="tabs8 list-tabs8" role="tablist" aria-label="상태">
        <button type="button" role="tab" aria-selected={scope.kind !== 'status'} className={scope.kind !== 'status' ? 'on' : ''} onClick={() => setScope({ kind: 'all' })}>전체<b>{total}</b></button>
        {ORDER.map(s => <button key={s} type="button" role="tab" aria-selected={scope.kind === 'status' && scope.st === s} className={scope.kind === 'status' && scope.st === s ? 'on' : ''} onClick={() => { setScope({ kind: 'status', st: s }); setInside(null); setPop(null) }} disabled={!counts[s]}>{s}<b>{counts[s]}</b></button>)}
      </div>
      <CaseTable key={selectedDate + JSON.stringify(scope)} cases={scoped} onOpenCase={openCase} />
    </section>
  </div>
}

/** 결과 종류 → 그 결과에 해당하는 문서 이름(전표 번호 뒤 괄호 안) */
const DOC_NAMES: Record<string, string[]> = { so: ['수주', '주문'], ship: ['출하지시', '출고'], exp: ['경비'], ar: ['입금'], pay: ['지급'], po: ['발주'], inv: ['입고', '재고 이동'] }
type Doc = FlowCase['evidence'][number]
// 확정된 문서만 (초안과 승인 대기는 아직 만든 것이 아니에요)
const docsOf = (kind: string, cases: FlowCase[]) => cases.flatMap(c => {
  const confirmed = new Set(c.steps.filter(st => st.status === 'd').flatMap(st => st.evidence))
  return c.evidence.filter(e => e.kind === 'output' && (kind === 'mail' ? e.id === 'mail-out' : confirmed.has(e.id) && DOC_NAMES[kind]?.includes(e.title.match(/\(([^)]+)\)$/)?.[1] ?? ''))).map(e => ({ e, c }))
})
/** 문서 한 장을 CSV 파일로 내려받기 */
function download(e: Doc) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = e.columns && e.rows?.length ? [e.columns.map(esc).join(','), ...e.rows.map(r => r.map(esc).join(','))] : e.body.split('\n').map(esc)
  const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = e.title.split(' (')[0] + '.csv'; a.click(); URL.revokeObjectURL(url)
}
/** 오늘 만든 것 한 종류를 눌렀을 때: 만든 문서 목록과 내려받기 */
function MadeDialog({ kind, cases, onClose }: { kind: string; cases: FlowCase[]; onClose: () => void }) {
  const docs = docsOf(kind, cases)
  return <div className="dim8" onClick={onClose}>
    <div className="dlg8" role="dialog" aria-modal="true" aria-label={MADE[kind] ?? kind} onClick={e => e.stopPropagation()}>
      <header className="dlg8-head"><h2>{MADE[kind] ?? kind}<b>{docs.length}건</b></h2><button type="button" className="rdx" onClick={onClose} aria-label="닫기"><CloseIcon /></button></header>
      <ul className="dlg8-list">
        {docs.map(({ e, c }) => <li key={c.unit.id + e.id}>
          <span className="dlg8-doc"><b>{e.title.split(' (')[0]}</b><span>{c.unit.name}</span></span>
          <button type="button" className="dl8" onClick={() => download(e)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" /></svg>내려받기</button>
        </li>)}
        {!docs.length && <li className="empty8">내려받을 문서 없음</li>}
      </ul>
    </div>
  </div>
}

function BatchRow({ u, on, onPick, onOpenCase }: { u: ProcUnit; on: boolean; onPick: () => void; onOpenCase: (c: FlowCase) => void }) {
  const n = u.cases.length
  return <li className={'bgroup8' + (on ? ' open' : '')}><button type="button" className={'brow8' + (on ? ' on' : '')} onClick={onPick} aria-pressed={on} aria-expanded={on}>
    <span className="brow8-icon"><SourceGlyph icon={ICON[u.source] ?? 'upload'} /></span>
    <span className="brow8-main"><b>{u.title}</b><span className="brow8-sub"><span className="mono">{u.time}</span></span></span>
    <span className="brow8-side"><span className={BADGE[u.st] + ' cnt8'} aria-label={`${n}건, ${u.st}`}>{n}건</span>
      <svg className="chev8" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span>
  </button>
  {/* 누르면 아래로 펼쳐져 안의 건과 상태가 보여요 */}
  {on && <ul className="bkids8">{u.cases.map(c => <li key={c.unit.id}><button type="button" className="bkid8" onClick={() => onOpenCase(c)}>
    <span className="brow8-main"><b>{c.unit.name}</b><span className="brow8-sub"><span>{c.unit.qsub}</span>{c.unit.st !== '완료' && c.stuck && <span className="stuck8">{c.stuck}</span>}</span></span>
    <span className={BADGE[c.unit.st]}>{c.unit.st}</span>
  </button></li>)}</ul>}
  </li>
}

export default function App() {
  const z = useFitZoom(1920)
  return <div style={{ zoom: z, ['--z' as string]: z, ['--min-font-size' as string]: `${10 / z}px`, fontSize: 'max(16px,var(--min-font-size))', boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}><SideNav company="송공작소" /><main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}><TodayScreen /></main></div>
}
