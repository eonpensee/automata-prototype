import { useMemo, useRef, useState } from 'react'
import * as data from './data/today'
import type { ResultId, SourceId, ZoneId } from './data/today'
import { Header } from './components/Header'
import { SourceLane } from './components/SourceLane'
import { MiniMap } from './components/map/MiniMap'
import { PARTNERS } from './components/map/partners'
import { ResultLane } from './components/ResultLane'
import { HistoryTable } from './components/HistoryTable'
import { SideNav } from './components/SideNav'
import { OverviewTabs, type OverviewStatus } from './components/OverviewTabs'
import { UnitWorkspace } from './components/UnitWorkspace'
import { casesForDate, REVIEW_DATES, resultsFor, sourcesFor } from './data/review'
import { useFitZoom } from './useFitZoom'
import './review.css'

const MAP_LAYOUT = { hidden: ['shop'] as ZoneId[], moveTo: { bank: [24.13, 19.25], card: [24.13, 66] } as Partial<Record<ZoneId, [number, number]>>, hiddenFlows: ['card'] as ZoneId[], scale: 1.12 }
export function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-26')
  const [status, setStatus] = useState<OverviewStatus>('전체')
  const [source, setSource] = useState<SourceId | null>(null)
  const [zone, setZone] = useState<ZoneId | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [result, setResult] = useState<ResultId | null>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const cases = useMemo(() => casesForDate(selectedDate), [selectedDate])
  const units = cases.map(c => c.unit)
  const sources = sourcesFor(cases)
  const detail = cases.find(c => c.unit.id === detailId)
  const visibleCases = cases.filter(c => (status === '전체' || c.unit.st === status) && (!source || c.unit.g === source))
  const filtered = status !== '전체' || source !== null || zone !== null
  const rows = visibleCases.map(c => c.unit)
  const highlightedSources = zone ? rows.filter(u => u.z === zone).map(u => u.g) : source ? [source] : status !== '전체' ? rows.map(u => u.g) : undefined
  const steps = Object.fromEntries(cases.map(c => [c.unit.id, c.steps.map(s => s.title)]))
  const reset = () => { setStatus('전체'); setSource(null); setZone(null); setResult(null) }
  const openUnit = (id: string) => { setDetailId(id); setResult(null); requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }
  return <div ref={topRef} className="today-content">
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setDetailId(null); reset() }} />
    {detail ? <UnitWorkspace key={`${detail.unit.id}-${detail.variant}`} flow={detail} related={cases.filter(c => c.unit.z === detail.unit.z).map(c => c.unit)} onSelect={id => setDetailId(id)} onBack={() => setDetailId(null)} /> : <>
      <section className="overview-shell" aria-label="전체 처리 현황">
        <OverviewTabs units={units} selected={status} onBack={filtered ? reset : undefined} onPick={s => { setStatus(s); setSource(null); setZone(null); setResult(null) }} />
        <section aria-label="오늘의 처리 장면" className="stage s3stage review-stage">
          <SourceLane sources={sources} selected={source} highlighted={highlightedSources} onPick={id => { setSource(source === id ? null : id); setZone(null); setResult(null) }} />
          <MiniMap partners={PARTNERS} units={units} availableZones={rows.map(u => u.z)} active={zone ? rows.filter(u => u.z === zone) : filtered ? rows : null} zoneSelected={zone} sourceSelected={source} {...MAP_LAYOUT} hiddenSourceLinks={sources.map(s => s.id)} sourceOrder={sources.map(s => s.id)} stockWarn={cases.find(c => c.unit.id === 'u1')?.unit.st === '확인 필요' ? { ...data.STOCK_WARN, unitId: 'u1' } : null} onClearFocus={reset} onPickZone={z => { setZone(zone === z ? null : z); setSource(null); setResult(null) }} onOpenUnit={openUnit} />
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
