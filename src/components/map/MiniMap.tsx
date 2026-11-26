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

/** 들어온 자료 카드 → 지도 연결선 (세로 위치는 지도 가운데 기준 px) */
const CONNECT: { id: SourceId; top: number; vTop: number; vH: number }[] = [
  { id: 'mail', top: -232, vTop: -232, vH: 285 },
  { id: 'cp', top: -134, vTop: -134, vH: 187 },
  { id: 'ss', top: -36, vTop: -36, vH: 89 },
  { id: 'bank', top: 62, vTop: 53, vH: 9 },
  { id: 'card', top: 160, vTop: 53, vH: 107 },
  { id: 'chk', top: 258, vTop: 53, vH: 205 },
]


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
    const lit = !!vis && vis.has(z)
    const here = active ? active.filter((u) => u.z === z) : []
    const all = units.filter((u) => u.z === z)
    const top = all.reduce<Status>((m, u) => (RANK[u.st] > RANK[m] ? u.st : m), '완료')
    return {
      def,
      hide,
      move: { transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)` } as CSSProperties,
      tagPos: { left: `${(a[0] + tx / PX_X).toFixed(2)}%`, top: `${(a[1] + ty / PX_Y).toFixed(2)}%` } as CSSProperties,
      plateCls: hide ? 'zp zhide' : lit ? 'zp zon' : vis ? 'zp zoff' : 'zp',
      bldCls: hide ? 'zg zhide' : lit ? 'zg zlit' : vis ? 'zg zoff' : 'zg',
      tagCls: 'tag zt' + (hide ? ' hid' : p.zoneSelected === z ? ' on' : vis && !lit ? ' off' : ''),
      count: !hide && !active && all.length > 0 ? { label: `${all.length}건`, cls: ZCLS[top] } : null,
      list: hide ? [] : here,
    }
  })

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
            {CONNECT.map((c) => (
              <span key={'h' + c.id} className="cn h" style={{ left: 0, top: `calc(50% + ${c.top}px)`, width: '1.8%' }} aria-hidden="true" />
            ))}
            <span className="cn v" style={{ left: '1.8%', top: 'calc(50% + -232px)', height: 490 }} aria-hidden="true" />
            <span className="cn h" style={{ left: '1.8%', top: 'calc(50% + 53px)', width: '37.4%' }} aria-hidden="true" />
            {CONNECT.map((c) => {
              const cls = 'cnx' + (srcOn === c.id ? ' on' : '')
              return [
                <span key={'xh' + c.id} className={cls + ' h'} style={{ left: 0, top: `calc(50% + ${c.top}px)`, width: '1.8%' }} aria-hidden="true" />,
                <span key={'xv' + c.id} className={cls + ' v'} style={{ left: '1.8%', top: `calc(50% + ${c.vTop}px)`, height: c.vH }} aria-hidden="true" />,
              ]
            })}
            <span className={'cnx' + (srcOn ? ' on' : '') + ' h'} style={{ left: '1.8%', top: 'calc(50% + 53px)', width: '37.4%' }} aria-hidden="true" />
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
