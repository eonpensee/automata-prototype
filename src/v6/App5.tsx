import { useMemo, useRef, useState } from 'react'
import type { Source, SourceId, Status } from '../data/today'
import { Header } from '../components/Header'
import { Village, type PlaceState } from './Village5'
import { SourceDock } from './SourceDock'
import { PlacePanel } from './PlacePanel'
import { currentNode, currentStep, PLACES, type PlaceId } from '../data/nodes'
import { RANK } from '../logic'
import { SideNav } from '../components/SideNav'
import { SummaryBar, MadePanel, UnitTable, type Filter } from './Overview5'
import { groupUnits } from './units'
import { CaseFlow } from './CaseFlow5'
import { casesForDate as mockCasesForDate, REVIEW_DATES as MOCK_DATES, sourcesFor, type VariantState } from '../data/review'
import { ENGINE_DATES, engineCasesForDate } from '../data/engine'
import { useFitZoom } from '../useFitZoom'
import '../review.css'

/** 시안 6: 위 요약 줄(들어온 자료, 처리한 업무, 확인 필요), 가운데 마을, 오른쪽 오늘 들어온 자료(처리 단위) 목록. 건물을 누르면 오른쪽이 그곳의 건들로 바뀜 */
const USE_MOCK = new URLSearchParams(location.search).get('data') === 'mock'
const REVIEW_DATES = USE_MOCK ? MOCK_DATES : ENGINE_DATES
const casesForDate = (date: string, v: VariantState) => USE_MOCK ? mockCasesForDate(date, v) : engineCasesForDate(date)

const ALL_SOURCES: Pick<Source, 'id' | 'name' | 'icon'>[] = [{ id: 'mail', name: '거래처 메일', icon: 'mail' }, { id: 'cp', name: '쿠팡', icon: 'shop' }, { id: 'ss', name: '스마트스토어', icon: 'shop' },
  { id: 'bank', name: '은행', icon: 'bank' }, { id: 'card', name: '카드사', icon: 'card' }, { id: 'manual', name: '직원 자료', icon: 'upload' }, { id: 'chk', name: '재고 점검', icon: 'check' }]

export function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(USE_MOCK ? '2026-11-26' : REVIEW_DATES[REVIEW_DATES.length - 1].id)
  const [status, setStatus] = useState<Filter>('전체')
  const [source, setSource] = useState<SourceId | null>(null)
  const [zone, setZone] = useState<PlaceId | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  // 열어 본 출처는 뱃지를 지워요 (날짜별)
  const [seen, setSeen] = useState<Record<string, SourceId[]>>({})
  const [variants, setVariants] = useState<VariantState>({})
  const topRef = useRef<HTMLDivElement>(null)
  const cases = useMemo(() => casesForDate(selectedDate, variants), [selectedDate, variants])
  // 연결된 출처는 항상 다 보여 주고, 오늘 들어온 곳에만 건수가 붙어요
  // 상태 타일은 처리 단위 기준이라, 지도와 출처 건수도 그 상태인 단위에 든 건만 세요
  const inStatus = new Set(groupUnits(cases).filter(u => status === '전체' || u.st === status).flatMap(u => u.cases.map(c => c.unit.id)))
  const statusCases = cases.filter(c => inStatus.has(c.unit.id))
  const todays = sourcesFor(statusCases)
  const sources: Source[] = ALL_SOURCES.map(s => todays.find(t => t.id === s.id) ?? { ...s, count: '0', latest: '', cadence: '' })
  const alerts: Partial<Record<SourceId, number>> = {}
  for (const c of cases) if (c.unit.st === '확인 필요') alerts[c.unit.g] = (alerts[c.unit.g] ?? 0) + 1
  const detail = cases.find(c => c.unit.id === detailId)
  // 오늘 들어온 게 없는 출처를 누르면 안내만 뜨고, 지도와 오른쪽은 그대로
  const srcFilter = source && cases.some(c => c.unit.g === source) ? source : null
  const visibleCases = statusCases.filter(c => !srcFilter || c.unit.g === srcFilter)
  const filtered = status !== '전체' || source !== null || zone !== null
  const rows = visibleCases.map(c => c.unit)
  const highlightedSources = zone ? visibleCases.filter(c => currentNode(c).place === zone).map(c => c.unit.g) : srcFilter ? [srcFilter] : status !== '전체' ? rows.map(u => u.g) : undefined
  const placeStates: Partial<Record<PlaceId, PlaceState>> = {}
  // 지도는 지나간 길이 아니라 각 건이 지금 있는 곳만 켜요 (끝난 건은 마지막으로 끝난 곳)
  for (const c of visibleCases) { const pl = currentNode(c).place; placeStates[pl] = { ...placeStates[pl], lit: true } }
  for (const c of visibleCases.filter(c => c.unit.st !== '완료')) { const pl = currentNode(c).place; const prev = placeStates[pl]?.count; const st: Status = !prev || RANK[c.unit.st] > RANK[prev.st] ? c.unit.st : prev.st; placeStates[pl] = { ...placeStates[pl], lit: true, count: { n: (prev?.n || 0) + 1, st } } }
  // 그 건물에서 오늘 지나간 노드 종류: 약속만, 사건만, 둘 다
  for (const c of visibleCases) { const st = placeStates[currentNode(c).place], k = c.steps[currentStep(c)]?.kind; if (st && k) st.kind = st.kind && st.kind !== k ? 'mix' : k }
  if (zone && placeStates[zone]) placeStates[zone] = { ...placeStates[zone]!, current: true }
  const zoneCases = zone ? visibleCases.filter(c => currentNode(c).place === zone).sort((a, b) => RANK[b.unit.st] - RANK[a.unit.st]) : []
  const reset = () => { setStatus('전체'); setSource(null); setZone(null); setFocusId(null) }
  const focus = visibleCases.find(c => c.unit.id === focusId)
  const mapStates: Partial<Record<PlaceId, PlaceState>> = focus ? { [currentNode(focus).place]: { ...placeStates[currentNode(focus).place], lit: true, current: true } } : placeStates
  const procUnits = groupUnits(visibleCases)
  const openUnit = (id: string) => { setDetailId(id); requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }
  return <div ref={topRef} className="today-content v5">
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setDetailId(null); setVariants({}); reset() }} />
    {detail ? <CaseFlow key={`${detail.unit.id}-${detail.variant}`} flow={detail} onBack={() => setDetailId(null)} onDecide={(id, v) => setVariants(x => ({ ...x, [id]: v }))} /> : <>
      <section className="overview-shell" aria-label="전체 처리 현황" onClick={e => { if (filtered && !(e.target as Element).closest('button,a,input,select,[role="button"],[role="tablist"],[role="dialog"],.zpop,.pp5,.fly6,.made6')) reset() }}>
        <SummaryBar units={groupUnits(cases)} cases={cases} filter={status} onFilter={f => { setStatus(f); setSource(null); setZone(null) }} />
        <section aria-label="오늘의 처리 장면" className={'stage s3stage review-stage stage5' + (zone ? ' zone-open' : '')}>
          <SourceDock sources={sources} selected={source} highlighted={highlightedSources} alerts={alerts} units={groupUnits(statusCases)} focusId={focusId}
            seen={seen[selectedDate] ?? []} onPick={id => { setSeen(v => ({ ...v, [selectedDate]: [...new Set([...(v[selectedDate] ?? []), id])] })); setSource(source === id ? null : id); setZone(null); setFocusId(null) }} onFocus={setFocusId} onOpenCase={openUnit} />
          <div className="world"><Village states={mapStates} popup={null} onPickPlace={z => { setZone(zone === z ? null : z); setFocusId(null) }} onOpenCase={openUnit} onBackground={() => zone && setZone(null)} /></div>
          <div className="rlane">{zone
            ? <PlacePanel key={zone + selectedDate} place={PLACES.find(p => p.id === zone)!} cases={zoneCases} hereIds={zoneCases.filter(c => currentNode(c).place === zone).map(c => c.unit.id)} onClose={() => setZone(null)} onOpenCase={openUnit} />
            : <MadePanel key={selectedDate + status + source + focusId} cases={focus ? [focus] : visibleCases} onOpenCase={openUnit} scope={focus ? focus.unit.name : undefined} />}</div>
        </section>
      </section>
      <section aria-label="처리 이력" className="history-section"><div className="history-heading"><div><h2>처리 이력</h2></div></div><UnitTable key={selectedDate + status + source} units={procUnits} onOpenCase={openUnit} /></section>
    </>}
  </div>
}
export default function App() {
  const z = useFitZoom(1920)
  return <div style={{ zoom: z, ['--z' as string]: z, ['--min-font-size' as string]: `${10 / z}px`, fontSize: 'max(16px,var(--min-font-size))', boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}><SideNav company="송공작소" /><main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}><TodayScreen /></main></div>
}
