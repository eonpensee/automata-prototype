import { lazy, Suspense, type CSSProperties } from 'react'
import type { SourceId, Status, Unit } from '../../data/today'
import { BADGE, RANK, ZCLS } from '../../logic'
const AsciiArtwork = lazy(() => import('./AsciiArtwork').then(m => ({ default: m.AsciiArtwork })))
import { BuildingInterior } from './BuildingInterior'
import { PopupItems } from './PopupItems'
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
  card: [24.13, 77, '-50%, 8px'],
}

/** 들어온 자료 카드 위치(px). 카드 i의 가운데 = 지도 가운데 + CARD_TOP + i × CARD_STEP */
const CARD_TOP = -232
const CARD_STEP = 98
/** 모아 주는 세로선 x(%) */
const BUS_X = 1.8

type Seg = { k: 'h' | 'v'; style: CSSProperties }
const H = (x0: number, x1: number, y: string): Seg => ({ k: 'h', style: { left: `${x0}%`, width: `${(x1 - x0).toFixed(2)}%`, top: `calc${y}` } })
const V = (x: number, y0: string, y1: string): Seg => ({ k: 'v', style: { left: `${x}%`, top: `min${'(' + y0 + ', ' + y1 + ')'}`, height: `calc(max(${y0}, ${y1}) - min(${y0}, ${y1}))` } })


interface Props {
  ascii?: boolean
  partners: PartnerDef[]
  units: Unit[]
  availableZones: ZoneId[]
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
  /** 건물 바닥판 크기 배율 */
  scale: number
  /** 왼쪽 들어온 자료 카드 순서 */
  sourceOrder: SourceId[]
  /** 자료 카드에서 지도로 가는 연결선을 생략할 출처 */
  hiddenSourceLinks: SourceId[]
  stockWarn: { unitId: string; label: string; n: string; zone: ZoneId; pos: [number, number] } | null
  onClearFocus: () => void
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
    let ty = to ? (to[1] - a[1]) * PX_Y : 0
    // 바닥판 가운데를 기준으로 건물을 키움
    const top = def.plate.find((pg) => pg.cls === 'ft') || def.plate[0]
    const pts = top.points.split(' ').map((q) => q.split(',').map(Number))
    const cx = pts.reduce((m, q) => m + q[0], 0) / pts.length
    const cy = pts.reduce((m, q) => m + q[1], 0) / pts.length
    if (p.ascii && z !== 'hq') {
      const upper = z === 'bank' || z === 'wh'
      ty = 367.9 + (upper ? -1 : 1) * Math.abs(cx + tx - 683) * .34 / .866 - cy
    }
    const k = p.scale
    // 이름표도 같은 비율로 바깥쪽으로 밀어 건물과 겹치지 않게
    const ax = cx + (a[0] * PX_X - cx) * k + tx
    const ay = cy + (a[1] * PX_Y - cy) * k + ty - (k > 1 ? 12 : 0) - (p.zoneSelected === z ? z === 'card' ? 36 : 30 : 0)
    // 바닥판 왼쪽 꼭짓점 (연결선이 닿는 곳), 지도 대비 %
    const lv = pts.reduce((m, q) => (q[0] < m[0] ? q : m), pts[0])
    const leftPt: [number, number] = [((cx + (lv[0] - cx) * k + tx) / 1366) * 100, ((cy + (lv[1] - cy) * k + ty) / 724) * 100]
    const here = active ? active.filter((u) => u.z === z) : []
    const all = units.filter((u) => u.z === z)
    const lit = vis ? vis.has(z) : all.length > 0
    const selected = lit && p.zoneSelected === z
    const topSt = all.reduce<Status>((m, u) => (RANK[u.st] > RANK[m] ? u.st : m), '완료')
    return {
      def,
      hide,
      move: { transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${k}) translate(${(-cx).toFixed(1)}px, ${(-cy).toFixed(1)}px)` } as CSSProperties,
      tagPos: { left: `${(ax / PX_X).toFixed(2)}%`, top: `${(ay / PX_Y).toFixed(2)}%` } as CSSProperties,
      plateCls: hide ? 'zp zhide' : lit ? 'zp zon' + (selected ? ' zselected' : '') : vis ? 'zp zoff' : 'zp',
      bldCls: hide ? 'zg zhide' : lit ? 'zg zlit' + (selected ? ' zselected' : '') : vis ? 'zg zoff' : 'zg',
      tagCls: 'tag zt' + (hide ? ' hid' : p.zoneSelected === z ? ' on' : vis && !lit ? ' off' : ''),
      count: !hide && !active && all.length > 0 ? { label: `${all.length}건`, cls: ZCLS[topSt] } : null,
      list: hide ? [] : here,
      leftPt,
      asciiCenter: [cx + tx, cy + ty] as [number, number],
      asciiHalfWidth: (Math.max(...pts.map(p => p[0])) - Math.min(...pts.map(p => p[0]))) * k / 2,
      canOpen: !hide && p.availableZones.includes(z),
      right: (cx + (Math.max(...pts.map(p => p[0])) - cx) * k + tx) / PX_X,
      centerY: (cy + ty) / PX_Y,
      graphicTop: p.zoneSelected === z ? (cy - (Math.max(...pts.map(p => p[0])) - Math.min(...pts.map(p => p[0]))) * .86 / 180 * (z === 'wh' ? 73 : 77.5) * k + ty) / PX_Y : ay / PX_Y,
      bottom: (cy + (Math.max(...pts.map(p => p[1])) - cy) * k + ty) / PX_Y,
    }
  })

  // 연결선: 표시할 출처 카드 → (주)엘리먼츠. 원래 카드 순서의 좌표를 유지해요.
  const yCard = (i: number) => `(50% + ${CARD_TOP + i * CARD_STEP}px)`
  const yMap = (pct: number) => `(${pct.toFixed(2)}% + 40px)`
  const hq = zone.find((v) => v.def.id === 'hq')!
  const hub = p.sourceOrder.map((id, i) => ({ id, i })).filter((c) => !p.hiddenSourceLinks.includes(c.id))
  const hubY = yMap(hq.leftPt[1])
  const hubSegs: Seg[] = hub.length
    ? [V(BUS_X, yCard(Math.min(...hub.map((c) => c.i))), yCard(Math.max(...hub.map((c) => c.i)))), H(BUS_X, hq.leftPt[0], hubY)]
    : []
  const routes = hub.map(({ id, i }) => ({
    id,
    segs: [H(0, BUS_X, yCard(i)), V(BUS_X, yCard(i), hubY)],
  }))
  const hubOn = hub.some((c) => c.id === p.sourceSelected)

  const srcOn = p.sourceSelected

  return (
    <div className="world">
      <div className="c2">
        <div className="scene3" onClick={e => { if (active && !(e.target as Element).closest('button,[role="button"],.zpop')) p.onClearFocus() }}>
          <svg viewBox="0 0 1366 724" className="s3">
            <g className="isogrid" transform={p.ascii ? 'translate(0 367.9) scale(1 .68) translate(0 -367.9)' : undefined}>
              {GRID_LINES.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} className="gl" />
              ))}
            </g>
            {!p.ascii && zone.map((v) => (
              <g key={'p' + v.def.id} className={v.plateCls} style={v.move}>
                <g className="pl3">
                  {v.def.plate.map((pg, i) => <polygon key={i} points={pg.points} className={pg.cls} />)}
                </g>
              </g>
            ))}
            {FLOW_ORDER.map((z) => {
              const def = partners.find((d) => d.id === z)
              if (!def || !def.flow) return null
              if (p.ascii && p.hidden.includes(z)) return null
              const off = !!active || (!p.ascii && p.hiddenFlows.includes(z))
              const hasActivity = units.some(unit => unit.z === z && (p.ascii ? unit.st === '진행 중' : unit.st !== '완료'))
              let flow = def.flow
              if (p.ascii) {
                const target = zone.find(v => v.def.id === z)!
                const dx = Math.sign(target.asciiCenter[0] - hq.asciiCenter[0])
                const dy = Math.sign(target.asciiCenter[1] - hq.asciiCenter[1])
                const edge = (v: typeof hq, direction: number) => [v.asciiCenter[0] + dx * direction * v.asciiHalfWidth / 2, v.asciiCenter[1] + dy * direction * v.asciiHalfWidth / 2 * .34 / .866]
                flow = `${edge(hq, 1).join(',')} ${edge(target, -1).join(',')}`
              }
              return (
                <g key={'f' + z} className={off ? 'pp phide' : hasActivity ? 'pp on' : 'pp'}>
                  <polyline points={flow} className="po" />
                  <g className="comet">
                    {TRAIL.map((o, i) => (
                      <polyline key={i} points={flow} pathLength={100} className={`tr t${i}`} style={{ strokeOpacity: o.toFixed(3), animationDuration: '3.4s' }} />
                    ))}
                  </g>
                </g>
              )
            })}
            {zone.map((v) => (
              <g key={'b' + v.def.id} className={v.bldCls} style={v.move} role={v.canOpen ? 'button' : undefined} tabIndex={v.canOpen ? 0 : undefined} aria-label={`${v.def.label} 내부 보기`} onClick={() => v.canOpen && p.onPickZone(v.def.id)} onKeyDown={e => { if (v.canOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); p.onPickZone(v.def.id) } }}>
                {p.ascii ? <Suspense fallback={null}><AsciiArtwork partner={v.def} flowing={(active ? v.list : units.filter(u => u.z === v.def.id)).length > 0} interior={p.zoneSelected === v.def.id} working={(active ? v.list : units.filter(u => u.z === v.def.id)).some(u => u.st === '진행 중')} /></Suspense> : p.zoneSelected === v.def.id ? <BuildingInterior partner={v.def} /> : <v.def.Building />}
              </g>
            ))}
          </svg>

          <div className={active ? 'cnl off' : 'cnl'}>
            {routes.flatMap((r) => r.segs.filter((_, j) => j === 0).map((sg, j) => (
              <span key={'c' + r.id + j} className={'cn ' + sg.k} style={sg.style} aria-hidden="true" />
            )))}
            {hubSegs.map((sg, j) => <span key={'hub' + j} className={'cn ' + sg.k} style={sg.style} aria-hidden="true" />)}
            {routes.flatMap((r) => r.segs.map((sg, j) => (
              <span key={'x' + r.id + j} className={'cnx' + (srcOn === r.id ? ' on' : '') + ' ' + sg.k} style={sg.style} aria-hidden="true" />
            )))}
            <span className={'cnx' + (hubOn ? ' on' : '') + ' h'} style={hubSegs[1]?.style} aria-hidden="true" />
          </div>


          {zone.filter(v => !v.list.length).map((v) => (
            <button key={'t' + v.def.id} className={v.tagCls} style={{ ...v.tagPos, top: `calc(${v.tagPos.top} - 8px / var(--z, 1))` }} disabled={!v.canOpen} onClick={() => p.onPickZone(v.def.id)}>
              {v.def.label}
              {v.count && <span className={v.count.cls}>{v.count.label}</span>}
            </button>
          ))}
          {p.stockWarn && <button
            className={'tag warn' + (active ? ' hid' : '')}
            style={{ left: `${p.stockWarn.pos[0]}%`, top: `${p.stockWarn.pos[1]}%` }}
            onClick={() => p.onOpenUnit(p.stockWarn!.unitId)}
          >
            <span className="wdot" aria-hidden="true" />{p.stockWarn.label}<span className="wnum">{p.stockWarn.n}</span>
          </button>}

          {zone.map((v) => {
            if (!v.list.length) return null
            const [, t] = POPUP[v.def.id]
            const above = v.def.id === 'bank' || v.def.id === 'hq' || v.def.id === 'card'
            const leftAligned = v.def.id === 'bank' || v.def.id === 'card'
            const besideCard = p.zoneSelected === 'card' && v.def.id === 'card'
            const docked = v.def.id === 'wh' && zone.filter(item => item.list.length > 0).length === 1
            const tail = besideCard ? 'left' : docked ? 'right' : above ? 'bottom' : 'top'
            const popupStyle: CSSProperties = {
              left: besideCard ? `calc(${v.right}% + 20px)` : docked ? `calc(${v.leftPt[0]}% - 18px)` : leftAligned ? '2%' : v.tagPos.left,
              top: besideCard ? `${v.centerY}%` : docked ? `calc(${v.tagPos.top} - 12px - 28px / var(--z, 1))` : above ? `calc(${v.graphicTop}% - 18px / var(--z, 1))` : v.def.id === 'wh' ? `calc(${v.bottom}% + 18px / var(--z, 1))` : `${t}%`,
              transform: besideCard ? 'translateY(-50%)' : docked ? 'translate(-100%, 0)' : above ? `translate(${leftAligned ? '0' : '-50%'}, -100%)` : 'translate(-50%, 0)',
              ['--tail-x' as string]: leftAligned && !besideCard ? '74%' : '50%',
            }
            return (
              <div key={'l' + v.def.id} className={`zpop zpop-tail-${tail}${docked ? ' zpop-docked' : ''}`} style={popupStyle}>
                <button type="button" className="zpop-title" onClick={() => p.onPickZone(v.def.id)} aria-label={`${v.def.label} 선택`}>{v.def.label}</button>
                <PopupItems key={v.list.map(u => u.id).join("-")} count={v.list.length}>
                {v.list.map((u) => {
                  const nm = [u.name, u.now]
                  return (
                    <button type="button" key={u.id} className="zpi" style={{ cursor: 'pointer' }} onClick={() => p.onOpenUnit(u.id)}>
                      <span className="zpt"><span>{nm[0]}</span>{nm[1] && <span className="zps">{nm[1]}</span>}</span>
                      <span className={BADGE[u.st]}>{u.st}</span>
                    </button>
                  )
                })}
                </PopupItems>
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
