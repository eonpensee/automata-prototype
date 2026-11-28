import { useMemo, useState } from 'react'
import type { Source, SourceId, Status } from '../data/today'
import { Header } from '../components/Header'
import { Village, type PlaceState } from './Village5'
import { SourceDock } from './SourceDock'
import { currentStep } from '../data/nodes'
import { WORLD, insideScene, whereInside, whereWorld } from './scene'
import { RANK } from '../logic'
import { SideNav } from '../components/SideNav'
import { SummaryBar, MadePanel, CaseTable, StationList, type Filter } from './Overview5'
import { groupUnits } from './units'
import { casesForDate as mockCasesForDate, REVIEW_DATES as MOCK_DATES, type FlowCase } from '../data/review'
import { ENGINE_DATES, engineCasesForDate } from '../data/engine'
import { useFitZoom } from '../useFitZoom'
import '../review.css'

/**
 * 시안 7 (11/27 피드백 반영)
 * 지도는 두 단계: 회사 안팎 전체 → 자사를 누르면 부문별.
 * 왼쪽 출처를 누르면 intake 배치 목록, 배치를 고르면 지도와 아래 케이스 목록이 그 배치로 좁혀져요.
 * 케이스 하나의 흐름은 여기서 그리지 않고 기존 케이스 화면으로 넘겨요.
 */
const USE_MOCK = new URLSearchParams(location.search).get('data') === 'mock'
const REVIEW_DATES = USE_MOCK ? MOCK_DATES : ENGINE_DATES
const casesForDate = (date: string) => USE_MOCK ? mockCasesForDate(date, {}) : engineCasesForDate(date)
/** 기존 케이스 화면 (로컬 제품). 실제 제품에 붙일 때는 케이스별 주소로 바꿔요 */
const CASE_SCREEN = 'http://127.0.0.1:3002/cases/all'

const ALL_SOURCES: Pick<Source, 'id' | 'name' | 'icon'>[] = [{ id: 'mail', name: '거래처 메일', icon: 'mail' }, { id: 'cp', name: '쿠팡', icon: 'shop' }, { id: 'ss', name: '스마트스토어', icon: 'shop' },
  { id: 'bank', name: '은행', icon: 'bank' }, { id: 'card', name: '카드사', icon: 'card' }, { id: 'manual', name: '직원 자료', icon: 'upload' }, { id: 'chk', name: '재고 점검', icon: 'check' }]

export function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(USE_MOCK ? '2026-11-26' : REVIEW_DATES[REVIEW_DATES.length - 1].id)
  const [status, setStatus] = useState<Filter>('전체')
  const [source, setSource] = useState<SourceId | null>(null)
  const [batchId, setBatchId] = useState<string | null>(null)
  // 지도에서 건물을 누르면 그 건물 안으로 들어가요 (null이면 회사 안팎 전체)
  const [inside, setInside] = useState<string | null>(null)
  const [zone, setZone] = useState<string | null>(null)
  // 열어 본 출처는 뱃지를 지워요 (날짜별)
  const [seen, setSeen] = useState<Record<string, SourceId[]>>({})
  const cases = useMemo(() => casesForDate(selectedDate), [selectedDate])
  // 상태 타일은 케이스 기준. 고르면 그 상태의 케이스와 그 케이스가 든 배치만 남아요
  const statusCases = cases.filter(c => status === '전체' || c.unit.st === status)
  const statusUnits = groupUnits(statusCases)
  const sources: Source[] = ALL_SOURCES.map(s => ({ ...s, count: String(statusUnits.filter(u => u.source === s.id).length), latest: '', cadence: '' }))
  const batch = statusUnits.find(u => u.id === batchId) ?? null
  // 오늘 들어온 게 없는 출처를 누르면 안내만 뜨고, 지도와 아래는 그대로
  const srcFilter = source && statusCases.some(c => c.unit.g === source) ? source : null
  const visibleCases = batch ? batch.cases : statusCases.filter(c => !srcFilter || c.unit.g === srcFilter)
  const filtered = status !== '전체' || source !== null || zone !== null || batchId !== null

  const scene = inside ? insideScene(inside) : WORLD
  const where = (c: FlowCase) => inside ? whereInside(inside, c) : whereWorld(c)
  const insideName = WORLD.places.find(p => p.id === inside)?.name ?? ''
  const placeStates: Record<string, PlaceState> = {}
  for (const c of visibleCases) {
    const pl = where(c); if (!pl) continue
    const prev = placeStates[pl], k = c.steps[currentStep(c)]?.kind
    const next: PlaceState = { ...prev, lit: true, kind: prev?.kind && k && prev.kind !== k ? 'mix' : prev?.kind ?? k }
    if (c.unit.st !== '완료') { const st: Status = !prev?.count || RANK[c.unit.st] > RANK[prev.count.st] ? c.unit.st : prev.count.st; next.count = { n: (prev?.count?.n ?? 0) + 1, st } }
    placeStates[pl] = next
  }
  if (zone && placeStates[zone]) placeStates[zone] = { ...placeStates[zone], current: true }
  const zoneCases = zone ? visibleCases.filter(c => where(c) === zone).sort((a, b) => RANK[b.unit.st] - RANK[a.unit.st]) : []
  // 아래 목록: 그날 전체 또는 고른 배치. 건물 안에서 자리를 고르면 그 자리의 케이스로 더 좁혀져요
  const listCases = zone ? zoneCases : visibleCases
  const stations = scene.places.map(p => ({ id: p.id, name: p.name, n: visibleCases.filter(c => where(c) === p.id).length })).filter(r => r.n > 0).sort((a, b) => b.n - a.n)
  const zoneName = scene.places.find(p => p.id === zone)?.name ?? ''
  const reset = () => { setStatus('전체'); setSource(null); setZone(null); setBatchId(null) }
  const openCase = (_c: FlowCase) => { window.open(CASE_SCREEN, '_blank', 'noopener') }
  const pickPlace = (id: string) => { if (!inside) { setInside(id); setZone(null) } else setZone(zone === id ? null : id) }
  const highlightedSources = batch ? [batch.source] : srcFilter ? [srcFilter] : undefined
  return <div className="today-content v5 v7">
    <Header dates={REVIEW_DATES} selectedDate={selectedDate} onSelectDate={id => { setSelectedDate(id); setInside(null); reset() }} />
    <section className="overview-shell" aria-label="전체 처리 현황" onClick={e => { if (filtered && !(e.target as Element).closest('button,a,input,select,[role="button"],[role="tablist"],[role="dialog"],.zpop,.pp5,.fly6,.made6')) reset() }}>
      <SummaryBar cases={cases} filter={status} onFilter={f => { setStatus(f); setSource(null); setZone(null); setBatchId(null) }} />
      <section aria-label="오늘의 처리 장면" className="stage s3stage review-stage stage5">
        <SourceDock sources={sources} selected={source} highlighted={highlightedSources} units={statusUnits} batchId={batchId} seen={seen[selectedDate] ?? []}
          onPick={id => { setSeen(v => ({ ...v, [selectedDate]: [...new Set([...(v[selectedDate] ?? []), id])] })); setSource(source === id ? null : id); setZone(null); setBatchId(null) }}
          onBatch={id => { setBatchId(id); setZone(null); if (id) setSource(null) }} />
        <div className="world">
          <div className="bar7">
            {inside && <button type="button" className="lv7-back" onClick={() => { setInside(null); setZone(null) }} aria-label="전체 지도로 돌아가기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>{insideName}</button>}
            {batch && <button type="button" className="ct7-chip" onClick={() => setBatchId(null)}>{batch.title} {batch.time}, 케이스 {batch.cases.length}건<span aria-hidden="true">×</span></button>}
          </div>
          <Village key={inside ?? 'world'} scene={scene} allClickable={!inside} states={placeStates} popup={null} onPickPlace={pickPlace} onBackground={() => zone && setZone(null)} />
        </div>
        <div className="rlane">{inside
          ? <StationList key={inside + selectedDate + batchId} rows={stations} selected={zone} onPick={id => setZone(zone === id ? null : id)} />
          : <MadePanel key={selectedDate + status + source + batchId} cases={visibleCases} onOpenCase={() => {}} />}</div>
      </section>
    </section>
    <section aria-label="케이스 목록" className="history-section"><div className="history-heading"><div><h2>케이스<b className="ct7-count">{listCases.length}건</b>{batch && <button type="button" className="ct7-chip" onClick={() => setBatchId(null)}>{batch.title} {batch.time}<span aria-hidden="true">×</span></button>}{zone && <button type="button" className="ct7-chip" onClick={() => setZone(null)}>{insideName} {zoneName}<span aria-hidden="true">×</span></button>}</h2></div></div>
      <CaseTable key={selectedDate + status + source + batchId + zone} cases={listCases} onOpenCase={openCase} /></section>
  </div>
}
export default function App() {
  const z = useFitZoom(1920)
  return <div style={{ zoom: z, ['--z' as string]: z, ['--min-font-size' as string]: `${10 / z}px`, fontSize: 'max(16px,var(--min-font-size))', boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}><SideNav company="송공작소" /><main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}><TodayScreen /></main></div>
}
