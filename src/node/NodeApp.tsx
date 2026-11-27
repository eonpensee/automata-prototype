import { useMemo, useRef, useState } from 'react'
import type { ResultId, SourceId, Status } from '../data/today'
import { Header } from '../components/Header'
import { SourceLane } from '../components/SourceLane'
import { Village, type PlaceState } from '../components/village/Village'
import { currentNode, stepNodes, touchedPlaces, type PlaceId } from '../data/nodes'
import { RANK } from '../logic'
import { ResultLane } from '../components/ResultLane'
import { HistoryTable } from '../components/HistoryTable'
import { SideNav } from '../components/SideNav'
import { OverviewTabs, type OverviewStatus } from '../components/OverviewTabs'
import { CaseFlow } from '../components/CaseFlow'
import { casesForDate as mockCasesForDate, REVIEW_DATES as MOCK_DATES, resultsFor, sourcesFor, type VariantState } from '../data/review'
import { ENGINE_DATES, engineCasesForDate } from '../data/engine'
import { useFitZoom } from '../useFitZoom'
import '../review.css'



// 기본은 로컬 엔진에서 뽑은 데이터. 주소에 ?data=mock 이면 기존 목업
const USE_MOCK = new URLSearchParams(location.search).get('data') === 'mock'
const REVIEW_DATES = USE_MOCK ? MOCK_DATES : ENGINE_DATES
const casesForDate = (date: string, v: VariantState) => USE_MOCK ? mockCasesForDate(date, v) : engineCasesForDate(date)

export function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(USE_MOCK ? '2026-11-26' : REVIEW_DATES[REVIEW_DATES.length - 1].id)
  const [status, setStatus] = useState<OverviewStatus>('전체')
  const [source, setSource] = useState<SourceId | null>(null)
  const [zone, setZone] = useState<PlaceId | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [result, setResult] = useState<ResultId | null>(null)
  const [variants, setVariants] = useState<VariantState>({})
  const topRef = useRef<HTMLDivElement>(null)
  const cases = useMemo(() => casesForDate(selectedDate, variants), [selectedDate, variants])
  const units = cases.map(c => c.unit)
  const sources = sourcesFor(cases)
  const detail = cases.find(c => c.unit.id === detailId)
  const visibleCases = cases.filter(c => (status === '전체' || c.unit.st === status) && (!source || c.unit.g === source))
  const filtered = status !== '전체' || source !== null || zone !== null
  const rows = visibleCases.map(c => c.unit)
  const highlightedSources = zone ? visibleCases.filter(c => touchedPlaces(c).includes(zone)).map(c => c.unit.g) : source ? [source] : status !== '전체' ? rows.map(u => u.g) : undefined
  const placeStates: Partial<Record<PlaceId, PlaceState>> = {}
  for (const c of visibleCases) for (const pl of touchedPlaces(c)) placeStates[pl] = { ...placeStates[pl], lit: true }
  for (const c of visibleCases) { const pl = currentNode(c).place; const prev = placeStates[pl]?.count; const st: Status = !prev || RANK[c.unit.st] > RANK[prev.st] ? c.unit.st : prev.st; placeStates[pl] = { ...placeStates[pl], lit: true, count: { n: (prev?.n || 0) + 1, st } } }
  if (zone && placeStates[zone]) placeStates[zone] = { ...placeStates[zone]!, current: true }
  const steps = Object.fromEntries(cases.map(c => [c.unit.id, c.steps.map(s => s.title)]))
  const reset = () => { setStatus('전체'); setSource(null); setZone(null); setResult(null) }
  const openUnit = (id: string) => { setDetailId(id); setResult(null); requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }
  return <div ref={topRef} className="today-content">
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setDetailId(null); setVariants({}); reset() }} />
    {detail ? <CaseFlow key={`${detail.unit.id}-${detail.variant}`} flow={detail} onBack={() => setDetailId(null)} onDecide={(id, v) => setVariants(x => ({ ...x, [id]: v }))} /> : <>
      <section className={`overview-shell`} aria-label="전체 처리 현황" onClick={e => { if ((filtered || result) && !(e.target as Element).closest('button,a,input,select,[role="button"],[role="tablist"],[role="dialog"],.zpop')) reset() }}>
        <OverviewTabs units={units} selected={status} onBack={filtered ? reset : undefined} onPick={s => { setStatus(s); setSource(null); setZone(null); setResult(null) }} />
        <section aria-label="오늘의 처리 장면" className="stage s3stage review-stage">
          <SourceLane sources={sources} selected={source} highlighted={highlightedSources} onPick={id => { setSource(source === id ? null : id); setZone(null); setResult(null) }} />
          <div className="world"><Village states={placeStates} popup={zone ? { place: zone, rows: visibleCases.filter(c => touchedPlaces(c).includes(zone)).sort((a, b) => Number(currentNode(b).place === zone) - Number(currentNode(a).place === zone)).map(c => { const cur = currentNode(c).place === zone; return { id: c.unit.id, title: c.unit.name, node: cur ? currentNode(c).name : `${stepNodes(c).find(n => n.place === zone)?.name} 지나감`, sub: c.unit.now, st: c.unit.st } }) } : null} onPickPlace={z => { setZone(zone === z ? null : z); setResult(null) }} onOpenCase={openUnit} onBackground={() => zone && setZone(null)} /></div>
          <div className="rlane"><ResultLane results={resultsFor(visibleCases)} units={units} selected={result} onPick={id => setResult(result === id ? null : id)} onClose={() => setResult(null)} onOpenUnit={openUnit} /></div>
        </section>
      </section>
      <section aria-label="처리 이력" className="history-section"><div className="history-heading"><div><h2>처리 이력</h2></div></div><HistoryTable rows={rows} stepNames={steps} onOpenUnit={openUnit} /></section>
    </>}
  </div>
}
export default function App() {
  const z = useFitZoom(1920)
  return <div style={{ zoom: z, ['--z' as string]: z, ['--min-font-size' as string]: `${10 / z}px`, fontSize: 'max(16px,var(--min-font-size))', boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}><SideNav /><main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}><TodayScreen /></main></div>
}
