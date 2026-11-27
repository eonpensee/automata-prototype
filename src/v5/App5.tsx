import { useMemo, useRef, useState } from 'react'
import type { ResultId, SourceId, Status } from '../data/today'
import { Header } from '../components/Header'
import { Village, type PlaceState } from './Village5'
import { SourceDock } from './SourceDock'
import { PlacePanel } from './PlacePanel'
import { currentNode, touchedPlaces, PLACES, type PlaceId } from '../data/nodes'
import { RANK } from '../logic'
import { HistoryTable } from '../components/HistoryTable'
import { SideNav } from '../components/SideNav'
import { ResultLane } from '../components/ResultLane'
import { OverviewTabs, type OverviewStatus } from '../components/OverviewTabs'
import { CaseFlow } from './CaseFlow5'
import { casesForDate as mockCasesForDate, REVIEW_DATES as MOCK_DATES, resultsFor, sourcesFor, type VariantState } from '../data/review'
import { ENGINE_DATES, engineCasesForDate } from '../data/engine'
import { useFitZoom } from '../useFitZoom'
import '../review.css'

/** 시안 5: 상단 상태 탭, 가운데 마을, 오른쪽 결과 카드. 건물을 누르면 오른쪽이 그곳의 건들로 바뀜 (6번은 요약 줄 · 처리 단위 목록 구조) */
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
  const alerts: Partial<Record<SourceId, number>> = {}
  for (const c of cases) if (c.unit.st === '확인 필요') alerts[c.unit.g] = (alerts[c.unit.g] ?? 0) + 1
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
  const zoneCases = zone ? visibleCases.filter(c => touchedPlaces(c).includes(zone)).sort((a, b) => Number(currentNode(b).place === zone) - Number(currentNode(a).place === zone) || RANK[b.unit.st] - RANK[a.unit.st]) : []
  const reset = () => { setStatus('전체'); setSource(null); setZone(null); setResult(null) }
  const openUnit = (id: string) => { setDetailId(id); setResult(null); requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }
  return <div ref={topRef} className="today-content v5">
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setDetailId(null); setVariants({}); reset() }} />
    {detail ? <CaseFlow key={`${detail.unit.id}-${detail.variant}`} flow={detail} onBack={() => setDetailId(null)} onDecide={(id, v) => setVariants(x => ({ ...x, [id]: v }))} /> : <>
      <section className="overview-shell" aria-label="전체 처리 현황" onClick={e => { if ((filtered || result) && !(e.target as Element).closest('button,a,input,select,[role="button"],[role="tablist"],[role="dialog"],.zpop,.pp5')) reset() }}>
        <OverviewTabs units={units} selected={status} onBack={filtered ? reset : undefined} onPick={s => { setStatus(s); setSource(null); setZone(null); setResult(null) }} />
        <section aria-label="오늘의 처리 장면" className={'stage s3stage review-stage stage5' + (zone ? ' zone-open' : '')}>
          <SourceDock sources={sources} selected={source} highlighted={highlightedSources} alerts={alerts} onPick={id => { setSource(source === id ? null : id); setZone(null); setResult(null) }} />
          <div className="world"><Village states={placeStates} popup={null} onPickPlace={z => { setZone(zone === z ? null : z); setResult(null) }} onOpenCase={openUnit} onBackground={() => zone && setZone(null)} /></div>
          <div className="rlane">{zone
            ? <PlacePanel key={zone + selectedDate} place={PLACES.find(p => p.id === zone)!} cases={zoneCases} hereIds={zoneCases.filter(c => currentNode(c).place === zone).map(c => c.unit.id)} onClose={() => setZone(null)} onOpenCase={openUnit} />
            : <ResultLane results={resultsFor(visibleCases)} units={units} selected={result} onPick={id => setResult(result === id ? null : id)} onClose={() => setResult(null)} onOpenUnit={openUnit} />}</div>
        </section>
      </section>
      <section aria-label="처리 이력" className="history-section"><div className="history-heading"><div><h2>처리 이력</h2></div></div><HistoryTable rows={rows} stepNames={steps} onOpenUnit={openUnit} /></section>
    </>}
  </div>
}
export default function App() {
  const z = useFitZoom(1920)
  return <div style={{ zoom: z, ['--z' as string]: z, ['--min-font-size' as string]: `${10 / z}px`, fontSize: 'max(16px,var(--min-font-size))', boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}><SideNav company="송공작소" /><main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}><TodayScreen /></main></div>
}
