import { useMemo, useRef, useState } from 'react'
import type { ResultId, SourceId } from '../data/today'
import { Header } from '../components/Header'
import { SourceLane } from '../components/SourceLane'
import { ResultLane } from '../components/ResultLane'
import { HistoryTable } from '../components/HistoryTable'
import { SideNav } from '../components/SideNav'
import { OverviewTabs, type OverviewStatus } from '../components/OverviewTabs'
import { UnitWorkspace } from '../components/UnitWorkspace'
import { casesForDate, REVIEW_DATES, resultsFor, sourcesFor } from '../data/review'
import { useFitZoom } from '../useFitZoom'
import { FlatStage } from './FlatStage'
import '../review.css'
import './flat3d.css'

// 시안 3: 1번 화면과 같은 틀에서, 가운데만 "처음엔 2D 카드 → 누르면 그 자리에서 3D"로 바꾼 버전

export function TodayScreen3() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-26')
  const [status, setStatus] = useState<OverviewStatus>('전체')
  const [source, setSource] = useState<SourceId | null>(null)
  const [flowId, setFlowId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [result, setResult] = useState<ResultId | null>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  const cases = useMemo(() => casesForDate(selectedDate), [selectedDate])
  const units = cases.map(c => c.unit)
  const sources = sourcesFor(cases)
  const detail = cases.find(c => c.unit.id === detailId)
  const visibleCases = cases.filter(c => (status === '전체' || c.unit.st === status) && (!source || c.unit.g === source))
  const filtered = status !== '전체' || source !== null
  const rows = visibleCases.map(c => c.unit)
  const highlightedSources = flowId ? [cases.find(c => c.unit.id === flowId)!.unit.g] : source ? [source] : status !== '전체' ? rows.map(u => u.g) : undefined
  const steps = Object.fromEntries(cases.map(c => [c.unit.id, c.steps.map(s => s.title)]))
  const reset = () => { setStatus('전체'); setSource(null); setResult(null); setFlowId(null) }
  // 처리 단위를 누르면 가운데가 그 자리에서 3D로 바뀌어요.
  const openFlow = (id: string) => { setFlowId(id); setResult(null); requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })) }
  const openDetail = (id: string) => { setDetailId(id); requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }
  return <div ref={topRef} className={'today-content' + (detail ? '' : ' v3overview')}>
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setDetailId(null); reset() }} />
    {detail ? <UnitWorkspace key={`${detail.unit.id}-${detail.variant}`} flow={detail} related={cases.filter(c => c.unit.z === detail.unit.z).map(c => c.unit)} onSelect={id => setDetailId(id)} onBack={() => setDetailId(null)} /> : <>
      <section className="overview-shell v3shell" aria-label="전체 처리 현황">
        <h1 className="v3title">자동 처리 현황</h1>
        <OverviewTabs units={units} selected={status} onBack={filtered || flowId ? reset : undefined} onPick={s => { setStatus(s); setSource(null); setResult(null); setFlowId(null) }} />
        <section ref={stageRef} aria-label="오늘의 처리 장면" className="stage s3stage review-stage v3stage">
          <SourceLane sources={sources} selected={source} highlighted={highlightedSources} onPick={id => { setSource(source === id ? null : id); setResult(null); setFlowId(null) }} />
          <FlatStage cases={cases} active={filtered ? rows : null} flowId={flowId} onOpenFlow={openFlow} onCloseFlow={() => setFlowId(null)} onOpenDetail={openDetail} />
          <div className="rlane"><ResultLane results={resultsFor(visibleCases)} units={units} selected={result} onPick={id => setResult(result === id ? null : id)} onClose={() => setResult(null)} onOpenUnit={openFlow} /></div>
        </section>
      </section>
      <section aria-label="처리 이력" className="history-section"><div className="history-heading"><div><h2>처리 이력</h2></div></div><HistoryTable rows={rows} stepNames={steps} onOpenUnit={openFlow} /></section>
    </>}
  </div>
}

export default function App3() {
  const z = useFitZoom(1920)
  return <div style={{ zoom: z, ['--z' as string]: z, ['--min-font-size' as string]: `${10 / z}px`, fontSize: 'max(16px,var(--min-font-size))', boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}><SideNav /><main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}><TodayScreen3 /></main></div>
}
