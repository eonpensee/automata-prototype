import type { CSSProperties } from 'react'
import type { SourceId, Status, Unit } from '../../data/today'
import { ZNAME } from '../../data/today'
import { BADGE, RANK, ZCLS } from '../../logic'
import { GRID_LINES } from './isoGrid'
import type { PartnerDef, ZoneId } from './partners/types'

/** 지도 SVG 원본 크기(1366×724)를 % 좌표로 바꿀 때 쓰는 값 */
const PX_X = 13.66
const PX_Y = 7.24

/** 그라데이션 흐름 꼬리 10겹 */
const TRAIL = Array.from({ length: 10 }, (_, i) => 0.94 * Math.pow(0.85, i))

/** 지도 목록 팝업 위치: 왼쪽 %, 위 %, transform */
const POPUP: Record<ZoneId, [number, number, string]> = {
  hq: [50, 62, '-50%, 8px'],
  shop: [24.13, 45, '-50%, 8px'],
  wh: [67, 27, '-100%, -50%'],
  sup: [68, 70, '-100%, -50%'],
  bank: [24.13, 45, '-50%, 8px'],
  card: [24.13, 80, '-50%, 8px'],
}

/** 들어온 자료 카드 위치(px). 카드 i의 가운데 = 지도 가운데 + CARD_TOP + i × CARD_STEP */
const CARD_TOP = -232
const CARD_STEP = 98
/** 모아 주는 세로선 x(%) / 거래 상대로 바로 가는 선이 꺾이는 x(%) */
const BUS_X = 1.8
const BRANCH_X = 6

type Seg = { k: 'h' | 'v'; style: CSSProperties }
const H = (x0: number, x1: number, y: string): Seg => ({ k: 'h', style: { left: `${x0}%`, width: `${(x1 - x0).toFixed(2)}%`, top: `calc${y}` } })
const V = (x: number, y0: string, y1: string): Seg => ({ k: 'v', style: { left: `${x}%`, top: `min${'(' + y0 + ', ' + y1 + ')'}`, height: `calc(max(${y0}, ${y1}) - min(${y0}, ${y1}))` } })


interface Props {
  partners: PartnerDef[]
  units: Unit[]
  /** 지금 걸러진 처리 건. 전체 보기면 null */
  active: Unit[] | null
  /** 선택된 거래 상대 */
  zoneSelected: ZoneId | null
  /** 선택된 출처 (연결선 강조) */
  sourceSelected: SourceId | null
  /** 지도에서 숨길 거래 상대 */
  hidden: ZoneId[]
  /** 거래 상대를 다른 자리로 옮겨 그릴 때 (지도 대비 %) */
  moveTo: Partial<Record<ZoneId, [number, number]>>
  /** 이 거래 상대들로 가는 연결선은 숨김 */
  hiddenFlows: ZoneId[]
  /** 건물·바닥판 크기 배율 */
  scale: number
  /** 왼쪽 들어온 자료 카드 순서 */
  sourceOrder: SourceId[]
  /** 지도 속 거래 상대로 바로 잇는 출처 (나머지는 (주)엘리먼츠로) */
  sourceTo: Partial<Record<SourceId, ZoneId>>
  stockWarn: { label: string; n: string; zone: ZoneId; pos: [number, number] }
  onPickZone: (z: ZoneId) => void
  onOpenUnit: (id: string) => void
}

/** 가운데: 3D 미니 지도 */
export function MiniMap(p: Props) {
  const { partners, units, active } = p
  const vis = active ? new Set(active.map((u) => u.z)) : null

  const zone = partners.map((def) => {
    const z = def.id
    const hide = p.hidden.includes(z)
    const a = def.anchor
    const to = p.moveTo[z]
    const tx = to ? (to[0] - a[0]) * PX_X : 0
    const ty = to ? (to[1] - a[1]) * PX_Y : 0
    // 바닥판 가운데를 기준으로 건물을 키움
    const top = def.plate.find((pg) => pg.cls === 'ft') || def.plate[0]
    const pts = top.points.split(' ').map((q) => q.split(',').map(Number))
    const cx = pts.reduce((m, q) => m + q[0], 0) / pts.length
    const cy = pts.reduce((m, q) => m + q[1], 0) / pts.length
    const k = p.scale
    // 이름표도 같은 비율로 바깥쪽으로 밀어 건물과 겹치지 않게
    const ax = cx + (a[0] * PX_X - cx) * k + tx
    const ay = cy + (a[1] * PX_Y - cy) * k + ty - (k > 1 ? 12 : 0)
    // 바닥판 왼쪽 꼭짓점 (연결선이 닿는 곳), 지도 대비 %
    const lv = pts.reduce((m, q) => (q[0] < m[0] ? q : m), pts[0])
    const leftPt: [number, number] = [((cx + (lv[0] - cx) * k + tx) / 1366) * 100, ((cy + (lv[1] - cy) * k + ty) / 724) * 100]
    const lit = !!vis && vis.has(z)
    const here = active ? active.filter((u) => u.z === z) : []
    const all = units.filter((u) => u.z === z)
    const topSt = all.reduce<Status>((m, u) => (RANK[u.st] > RANK[m] ? u.st : m), '완료')
    return {
      def,
      hide,
      move: { transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${k}) translate(${(-cx).toFixed(1)}px, ${(-cy).toFixed(1)}px)` } as CSSProperties,
      tagPos: { left: `${(ax / PX_X).toFixed(2)}%`, top: `${(ay / PX_Y).toFixed(2)}%` } as CSSProperties,
      plateCls: hide ? 'zp zhide' : lit ? 'zp zon' : vis ? 'zp zoff' : 'zp',
      bldCls: hide ? 'zg zhide' : lit ? 'zg zlit' : vis ? 'zg zoff' : 'zg',
      tagCls: 'tag zt' + (hide ? ' hid' : p.zoneSelected === z ? ' on' : vis && !lit ? ' off' : ''),
      count: !hide && !active && all.length > 0 ? { label: `${all.length}건`, cls: ZCLS[topSt] } : null,
      list: hide ? [] : here,
      leftPt,
    }
  })

  // 연결선: 출처 카드 → (주)엘리먼츠, 또는 출처 카드 → 지도 속 거래 상대
  const yCard = (i: number) => `(50% + ${CARD_TOP + i * CARD_STEP}px)`
  const yMap = (pct: number) => `(${pct.toFixed(2)}% + 40px)`
  const hq = zone.find((v) => v.def.id === 'hq')!
  const hub = p.sourceOrder.map((id, i) => ({ id, i })).filter((c) => !p.sourceTo[c.id])
  const hubY = yMap(hq.leftPt[1])
  const hubSegs: Seg[] = hub.length
    ? [V(BUS_X, yCard(Math.min(...hub.map((c) => c.i))), yCard(Math.max(...hub.map((c) => c.i)))), H(BUS_X, hq.leftPt[0], hubY)]
    : []
  const routes = p.sourceOrder.map((id, i) => {
    const to = p.sourceTo[id]
    const dest = to && zone.find((v) => v.def.id === to)
    if (dest) {
      const y = yMap(dest.leftPt[1])
      return { id, hub: false, segs: [H(0, BRANCH_X, yCard(i)), V(BRANCH_X, yCard(i), y), H(BRANCH_X, dest.leftPt[0], y)] }
    }
    return { id, hub: true, segs: [H(0, BUS_X, yCard(i)), V(BUS_X, yCard(i), hubY)] }
  })
  const hubOn = !!p.sourceSelected && !p.sourceTo[p.sourceSelected]

  const srcOn = p.sourceSelected

  return (
    <div className="world">
      <div className="c2">
        <div className="scene3">
          <svg viewBox="0 0 1366 724" aria-hidden="true" className="s3">
            <g className="isogrid">
              {GRID_LINES.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} className="gl" />
              ))}
            </g>
            {zone.map((v) => (
              <g key={'p' + v.def.id} className={v.plateCls} style={v.move}>
                <g className="pl3">
                  {v.def.plate.map((pg, i) => <polygon key={i} points={pg.points} className={pg.cls} />)}
                </g>
              </g>
            ))}
            {FLOW_ORDER.map((z) => {
              const def = partners.find((d) => d.id === z)
              if (!def || !def.flow) return null
              const off = !!active || p.hiddenFlows.includes(z)
              return (
                <g key={'f' + z} className={off ? 'pp phide' : 'pp on'}>
                  <polyline points={def.flow} className="po" />
                  <g className="comet">
                    {TRAIL.map((o, i) => (
                      <polyline key={i} points={def.flow!} pathLength={100} className={`tr t${i}`} style={{ strokeOpacity: o.toFixed(3), animationDuration: '3.4s' }} />
                    ))}
                  </g>
                </g>
              )
            })}
            {zone.map((v) => (
              <g key={'b' + v.def.id} className={v.bldCls} style={v.move}>
                <v.def.Building />
              </g>
            ))}
          </svg>

          <div className={active ? 'cnl off' : 'cnl'}>
            {routes.flatMap((r) => r.segs.filter((_, j) => !(r.hub && j === 1)).map((sg, j) => (
              <span key={'c' + r.id + j} className={'cn ' + sg.k} style={sg.style} aria-hidden="true" />
            )))}
            {hubSegs.map((sg, j) => <span key={'hub' + j} className={'cn ' + sg.k} style={sg.style} aria-hidden="true" />)}
            {routes.flatMap((r) => r.segs.map((sg, j) => (
              <span key={'x' + r.id + j} className={'cnx' + (srcOn === r.id ? ' on' : '') + ' ' + sg.k} style={sg.style} aria-hidden="true" />
            )))}
            <span className={'cnx' + (hubOn ? ' on' : '') + ' h'} style={hubSegs[1]?.style} aria-hidden="true" />
          </div>


          {zone.map((v) => (
            <button key={'t' + v.def.id} className={v.tagCls} style={v.tagPos} onClick={() => p.onPickZone(v.def.id)}>
              {v.def.label}
              {v.count && <span className={v.count.cls}>{v.count.label}</span>}
            </button>
          ))}
          <button
            className={'tag warn' + (active ? ' hid' : '')}
            style={{ left: `${p.stockWarn.pos[0]}%`, top: `${p.stockWarn.pos[1]}%` }}
            onClick={() => p.onPickZone(p.stockWarn.zone)}
          >
            <span className="wdot" aria-hidden="true" />{p.stockWarn.label}<span className="wnum">{p.stockWarn.n}</span>
          </button>

          {zone.map((v) => {
            if (!v.list.length) return null
            const [l, t, tr] = POPUP[v.def.id]
            return (
              <div key={'l' + v.def.id} className="zpop" style={{ left: `${l}%`, top: `${t}%`, transform: `translate(${tr})` }}>
                {v.list.map((u) => {
                  const nm = ZNAME[u.id + ':' + v.def.id] || [u.name, '']
                  return (
                    <a key={u.id} className="zpi" style={{ cursor: 'pointer' }} onClick={() => p.onOpenUnit(u.id)}>
                      <span className={BADGE[u.st]}>{u.st}</span>
                      <span className="zpt"><span>{nm[0]}</span>{nm[1] && <span className="zps">{nm[1]}</span>}</span>
                    </a>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** 원본과 같은 연결선 그리는 순서 */
const FLOW_ORDER: ZoneId[] = ['shop', 'bank', 'card', 'wh', 'sup']
