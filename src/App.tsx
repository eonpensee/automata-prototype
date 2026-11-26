import { useRef, useState } from 'react'
import * as data from './data/today'
import type { ResultId, SourceId, ZoneId } from './data/today'
import { match, toggle, type Filter } from './logic'
import { Header } from './components/Header'
import { SourceLane } from './components/SourceLane'
import { MiniMap } from './components/map/MiniMap'
import { PARTNERS } from './components/map/partners'
import { ResultLane } from './components/ResultLane'
import { DetailPanel } from './components/DetailPanel'
import { StatusTabs } from './components/StatusTabs'
import { HistoryTable } from './components/HistoryTable'
import { SideNav } from './components/SideNav'
import { useFitZoom } from './useFitZoom'

const SOURCE_IDS: SourceId[] = ['mail', 'cp', 'ss', 'bank', 'card', 'chk']

/** 지도 배치: 판매처는 숨기고, 은행은 왼쪽 위(판매처 자리), 카드사는 왼쪽 아래(은행 자리)로 */
const MAP_LAYOUT = {
  hidden: ['shop'] as ZoneId[],
  moveTo: { bank: [24.13, 19.25], card: [24.13, 61.99] } as Partial<Record<ZoneId, [number, number]>>,
  hiddenFlows: ['card'] as ZoneId[],
  /** 건물 크기 배율 */
  scale: 1.12,
  /** 은행·카드사 자료는 지도 속 은행·카드사로 바로 이어요 */
  sourceTo: { bank: 'bank', card: 'card' } as Partial<Record<SourceId, ZoneId>>,
}

type Data = typeof data

/** 자동 처리 현황 본문. 화면 데이터는 모두 props로 받아요. */
export function TodayScreen({ d }: { d: Data }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [result, setResult] = useState<ResultId | null>(null)

  const rows = d.UNITS.filter((u) => match(u, filter))
  const active = filter === 'all' ? null : rows
  const sourceSel = (SOURCE_IDS as string[]).includes(filter) ? (filter as SourceId) : null
  const zoneSel = filter.startsWith('z:') ? (filter.slice(2) as ZoneId) : null
  const detail = d.UNITS.find((u) => u.id === detailId) || null

  const historyRef = useRef<HTMLElement>(null)
  /** 상태 카드를 누르면 처리 이력이 화면 위쪽에 오도록 부드럽게 스크롤 */
  const pickStatus = (id: Filter) => {
    setFilter((f) => toggle(f, id))
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openUnit = (id: string) => { setDetailId(id); setResult(null) }

  return (
    <div style={{ flex: '1 1 auto', background: '#F8F8F8', border: '1px solid #E6E6E6', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Header dateLabel={d.TODAY_LABEL} />

      <div style={{ overflowX: 'auto' }}>
        <section aria-label="오늘의 처리 장면" className={'stage s3stage' + (detail ? ' ndopen' : '')}>
          <SourceLane
            sources={d.SOURCES}
            selected={sourceSel}
            filtered={!!active}
            onPick={(id) => setFilter((f) => toggle(f, id))}
          />
          <MiniMap
            partners={PARTNERS}
            units={d.UNITS}
            active={active}
            zoneSelected={zoneSel}
            sourceSelected={sourceSel}
            {...MAP_LAYOUT}
            sourceOrder={d.SOURCES.map((x) => x.id)}
            stockWarn={d.STOCK_WARN}
            onPickZone={(z) => setFilter((f) => toggle(f, `z:${z}`))}
            onOpenUnit={openUnit}
          />
          <div className="rlane">
            {detail ? (
              <DetailPanel
                unit={detail}
                stepNames={d.FLT[detail.id] || []}
                sections={d.DET[detail.id] || []}
                onClose={() => setDetailId(null)}
              />
            ) : (
              <ResultLane
                results={d.RES}
                units={d.UNITS}
                selected={result}
                onPick={(id) => setResult((r) => (r === id ? null : id))}
                onClose={() => setResult(null)}
                onOpenUnit={openUnit}
              />
            )}
          </div>
        </section>
      </div>

      <section ref={historyRef} aria-label="처리 이력" style={{ scrollMarginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>처리 이력</h2>
        <StatusTabs tabs={d.CARDS} units={d.UNITS} filter={filter} onPick={pickStatus} />
        <HistoryTable rows={rows} stepNames={d.FLT} onOpenUnit={openUnit} />
      </section>
    </div>
  )
}

/** 앱 틀: 왼쪽 메뉴, 본문. 1920px 기준 화면을 창 폭에 맞춰 줄여 보여 줘요. */
export default function App() {
  const z = useFitZoom(1920)
  return (
    <div style={{ zoom: z, ['--z' as string]: z, boxSizing: 'border-box', minHeight: `calc(100vh / ${z})`, display: 'flex', alignItems: 'stretch', width: z < 1 ? 1920 : undefined }}>
      <SideNav />
      <main style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TodayScreen d={data} />
      </main>
    </div>
  )
}
