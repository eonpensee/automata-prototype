import type { ReactNode } from 'react'
import type { Status } from '../../data/today'
import { PLACES, type Place, type PlaceId } from '../../data/nodes'
import { BADGE, ZCLS } from '../../logic'
import './village.css'

/** 지도 크기 (viewBox) */
const U = 31
const W = Math.round(2 * 16.6 * U * Math.sqrt(3) / 2 + 120)
const H = Math.round(16.6 * U + 150)
/** 땅 한 칸 크기(px)와 원점 */
const OX = W / 2
const OY = 104
const C = Math.sqrt(3) / 2

const P = (gx: number, gy: number, z = 0): [number, number] => [OX + (gx - gy) * U * C, OY + (gx + gy) * U * 0.5 - z]
const pts = (...ps: [number, number][]) => ps.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
/** 바닥 사각형 (격자 좌표) */
const quad = (x0: number, y0: number, x1: number, y1: number, z = 0) => pts(P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z))

/** 상자 하나: 왼쪽 앞면(fy), 오른쪽 면(fx), 윗면(ft) */
function Box({ x0, y0, x1, y1, z = 0, h, cls = '' }: { x0: number; y0: number; x1: number; y1: number; z?: number; h: number; cls?: string }) {
  return <g className={'vbox ' + cls}>
    <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(x1, y1, z + h), P(x0, y1, z + h))} />
    <polygon className="fx" points={pts(P(x1, y0, z), P(x1, y1, z), P(x1, y1, z + h), P(x1, y0, z + h))} />
    <polygon className="ft" points={quad(x0, y0, x1, y1, z + h)} />
  </g>
}

/** x 방향으로 마루가 난 박공 지붕 */
function Gable({ x0, y0, x1, y1, z, r }: { x0: number; y0: number; x1: number; y1: number; z: number; r: number }) {
  const ym = (y0 + y1) / 2
  return <g className="vbox">
    <polygon className="ft" points={pts(P(x0, y0, z), P(x1, y0, z), P(x1, ym, z + r), P(x0, ym, z + r))} />
    <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(x1, ym, z + r), P(x0, ym, z + r))} />
    <polygon className="fx" points={pts(P(x1, y0, z), P(x1, y1, z), P(x1, ym, z + r))} />
  </g>
}

const line = (a: [number, number], b: [number, number], cls = 'vln') => <line className={cls} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />

/** 건물 그림. 그림체는 1안 지도와 같은 선 + 면 */
function Building({ p }: { p: Place }) {
  const [cx, cy] = p.at, [w, d] = p.size
  const x0 = cx - w / 2 + 0.25, x1 = cx + w / 2 - 0.25, y0 = cy - d / 2 + 0.25, y1 = cy + d / 2 - 0.25
  const h = p.h
  const parts: ReactNode[] = []
  if (p.art === 'tower') {
    parts.push(<Box key="b" x0={x0 + .15} y0={y0 + .15} x1={x1 - .15} y1={y1 - .15} h={h} />)
    for (let z = 12; z < h - 4; z += 10) {
      parts.push(<g key={'w' + z}>{line(P(x0 + .35, y1 - .15, z), P(x1 - .35, y1 - .15, z))}{line(P(x1 - .15, y0 + .35, z), P(x1 - .15, y1 - .35, z))}</g>)
    }
    parts.push(<Box key="r" x0={cx - .35} y0={cy - .35} x1={cx + .35} y1={cy + .35} z={h} h={6} />)
  } else if (p.art === 'office') {
    parts.push(<Box key="b" x0={x0} y0={y0} x1={x1} y1={y1} h={h} />)
    parts.push(<g key="w">{line(P(x0 + .3, y1, h * .55), P(x1 - .3, y1, h * .55))}{line(P(x1, y0 + .3, h * .55), P(x1, y1 - .3, h * .55))}</g>)
    parts.push(<polygon key="d" className="vdoor" points={pts(P(cx - .25, y1, 0), P(cx + .25, y1, 0), P(cx + .25, y1, 13), P(cx - .25, y1, 13))} />)
  } else if (p.art === 'shop') {
    parts.push(<Box key="b" x0={x0} y0={y0} x1={x1} y1={y1} h={h} />)
    parts.push(<g key="a" className="vbox vawning"><polygon className="fy" points={pts(P(x0, y1, h - 6), P(x1, y1, h - 6), P(x1, y1 + .45, h - 14), P(x0, y1 + .45, h - 14))} /></g>)
    parts.push(<polygon key="d" className="vdoor" points={pts(P(cx - .25, y1, 0), P(cx + .25, y1, 0), P(cx + .25, y1, 11), P(cx - .25, y1, 11))} />)
  } else if (p.art === 'warehouse') {
    parts.push(<Box key="b" x0={x0} y0={y0} x1={x1} y1={y1} h={h} />)
    parts.push(<Gable key="g" x0={x0 - .05} y0={y0 - .05} x1={x1 + .05} y1={y1 + .05} z={h} r={14} />)
    parts.push(<polygon key="d" className="vdoor" points={pts(P(x1, cy - .4, 0), P(x1, cy + .4, 0), P(x1, cy + .4, 18), P(x1, cy - .4, 18))} />)
  } else if (p.art === 'house') {
    parts.push(<Box key="b" x0={x0 + .2} y0={y0 + .2} x1={x1 - .2} y1={y1 - .2} h={h} />)
    parts.push(<Gable key="g" x0={x0 + .1} y0={y0 + .1} x1={x1 - .1} y1={y1 - .1} z={h} r={16} />)
    parts.push(<polygon key="d" className="vdoor" points={pts(P(cx - .2, y1 - .2, 0), P(cx + .2, y1 - .2, 0), P(cx + .2, y1 - .2, 12), P(cx - .2, y1 - .2, 12))} />)
  } else if (p.art === 'factory') {
    parts.push(<Box key="b" x0={x0} y0={y0} x1={x1} y1={y1} h={h} />)
    parts.push(<Box key="c" x0={x0 + .25} y0={y0 + .25} x1={x0 + .6} y1={y0 + .6} z={h} h={30} />)
    parts.push(<polygon key="d" className="vdoor" points={pts(P(x1, cy - .3, 0), P(x1, cy + .3, 0), P(x1, cy + .3, 14), P(x1, cy - .3, 14))} />)
  } else if (p.art === 'bank') {
    parts.push(<Box key="s" x0={x0 - .1} y0={y0 - .1} x1={x1 + .1} y1={y1 + .1} h={4} />)
    parts.push(<Box key="b" x0={x0 + .2} y0={y0 + .2} x1={x1 - .2} y1={y1 - .2} z={4} h={h - 4} />)
    for (let i = 0; i < 4; i++) { const x = x0 + .45 + i * (x1 - x0 - .9) / 3; parts.push(<g key={'c' + i}>{line(P(x, y1 - .2, 4), P(x, y1 - .2, h - 2))}</g>) }
    parts.push(<Gable key="g" x0={x0} y0={y0} x1={x1} y1={y1} z={h} r={10} />)
  } else {
    parts.push(<Box key="b" x0={x0} y0={y0} x1={x1} y1={y1} h={h} />)
    parts.push(<g key="k" className="vcard"><polygon points={pts(P(x1, y0 + .45, h * .3), P(x1, y1 - .45, h * .3), P(x1, y1 - .45, h * .78), P(x1, y0 + .45, h * .78))} />{line(P(x1, y0 + .45, h * .62), P(x1, y1 - .45, h * .62))}</g>)
  }
  return <>{parts}</>
}

/** 길: 큰길(가운데 십자)과 골목 */
const ROADS: [number, number, number, number][] = [
  [-0.2, 7.6, 16.2, 8.4], [7.6, -0.2, 8.4, 16.2],
  [-0.2, 3.25, 7.6, 3.75], [8.4, 3.25, 16.2, 3.75], [-0.2, 12.25, 7.6, 12.75], [8.4, 12.25, 16.2, 12.75],
  [3.25, -0.2, 3.75, 7.6], [12.25, -0.2, 12.75, 7.6], [3.25, 8.4, 3.75, 16.2], [12.25, 8.4, 12.75, 16.2],
]
/** 구역 땅 (네 블록) */
const DISTRICTS: { name: string; q: [number, number, number, number]; at: [number, number]; side: string }[] = [
  { name: '판매처', q: [0, 0, 7.6, 7.6], at: P(7.6, 7.6), side: 't' },
  { name: '우리 회사', q: [8.4, 0, 16, 7.6], at: P(8.4, 7.6), side: 'r' },
  { name: '물류', q: [0, 8.4, 7.6, 16], at: P(7.6, 8.4), side: 'l' },
  { name: '매입처 · 금융', q: [8.4, 8.4, 16, 16], at: P(8.4, 8.4), side: 'b' },
]

export interface PlaceState { lit: boolean; current?: boolean; count?: { n: number; st: Status } }
export interface PopupRow { id: string; title: string; sub: string; node: string; st: Status }

const pct = (p: [number, number]) => ({ left: `${(p[0] / W * 100).toFixed(2)}%`, top: `${(p[1] / H * 100).toFixed(2)}%` })
export const placeTop = (p: Place): [number, number] => P(p.at[0], p.at[1], p.h + (p.art === 'tower' ? 10 : p.art === 'factory' ? 32 : 18))

/** 가운데: 노드 마을 */
export function Village({ states, route, routeCurrent, popup, onPickPlace, onOpenCase, onBackground }: {
  states: Partial<Record<PlaceId, PlaceState>>
  /** 케이스 한 건을 볼 때 지나는 장소 순서 */
  route?: PlaceId[]
  /** route에서 지금 단계가 들어가는 구간 번호 */
  routeCurrent?: number
  popup?: { place: PlaceId; rows: PopupRow[] } | null
  onPickPlace: (id: PlaceId) => void
  onOpenCase?: (id: string) => void
  onBackground?: () => void
}) {
  const anyLit = Object.values(states).some(s => s?.lit)
  const placeById = (id: PlaceId) => PLACES.find(p => p.id === id)!
  const sorted = [...PLACES].sort((a, b) => (a.at[0] + a.at[1]) - (b.at[0] + b.at[1]))
  const segs = route ? route.slice(1).map((to, i) => ({ from: route[i], to, i })).filter(s => s.from !== s.to) : []
  const pop = popup ? placeById(popup.place) : null
  return <div className="village" onClick={e => { if (onBackground && !(e.target as Element).closest('button,[role="button"],.zpop')) onBackground() }}>
    <svg viewBox={`0 0 ${W} ${H}`} className="village-svg" aria-hidden="false">
      {DISTRICTS.map(d => <polygon key={d.name} className="vground" points={quad(...d.q)} />)}
      {ROADS.map((r, i) => <polygon key={i} className="vroad" points={quad(...r)} />)}
      {DISTRICTS.map(d => { const [x0, , , y1] = d.q; const [ex, ey] = P(x0 + .35, y1 - .3); return <text key={'dn' + d.name} className="vdistrict" transform={`matrix(${C} .5 ${-C} .5 ${ex.toFixed(1)} ${ey.toFixed(1)})`}>{d.name}</text> })}
      {[[8, -0.2, 8, 7.6], [8, 8.4, 8, 16.2], [-0.2, 8, 7.6, 8], [8.4, 8, 16.2, 8]].map(([a, b, c, d], i) => <polyline key={'c' + i} className="vroad-mid" points={pts(P(a, b), P(c, d))} />)}
      {sorted.map(p => { const s = states[p.id]; return <polygon key={'lot' + p.id} className={'vlot' + (s?.lit ? ' on' : '') + (s?.current ? ' cur' : '')} points={quad(p.at[0] - p.size[0] / 2, p.at[1] - p.size[1] / 2, p.at[0] + p.size[0] / 2, p.at[1] + p.size[1] / 2)} /> })}
      {segs.map(s => {
        const a = placeById(s.from), b = placeById(s.to)
        const pa = P(a.at[0], a.at[1]), pb = P(b.at[0], b.at[1])
        const on = s.i + 1 === routeCurrent
        return <g key={'r' + s.i} className={'vroute' + (s.i + 1 <= (routeCurrent ?? 0) ? ' past' : '') + (on ? ' on' : '')}>
          <polyline points={pts(pa, pb)} className="vroute-line" />
          {on && <polyline points={pts(pa, pb)} pathLength={100} className="vroute-flow" />}
        </g>
      })}
      {sorted.map(p => { const s = states[p.id]; const cls = 'vbld' + (s?.lit ? ' on' : anyLit ? ' off' : '') + (s?.current ? ' cur' : ''); return <g key={p.id} className={cls} role={s?.lit ? 'button' : undefined} tabIndex={s?.lit ? 0 : undefined} aria-label={p.name} onClick={() => s?.lit && onPickPlace(p.id)} onKeyDown={e => { if (s?.lit && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPickPlace(p.id) } }}><Building p={p} /></g> })}
    </svg>
    {PLACES.map(p => { const s = states[p.id]; const t = placeTop(p); return <button key={'t' + p.id} type="button" className={'tag zt vtag' + (s?.current || popup?.place === p.id ? ' on' : !s?.lit && anyLit ? ' off' : '')} style={pct(t)} disabled={!s?.lit} onClick={() => onPickPlace(p.id)}>{p.name}{s?.count && s.count.n > 0 && <span className={ZCLS[s.count.st]}>{s.count.n}건</span>}</button> })}
    {pop && popup && (() => { const [px, py] = P(pop.at[0], pop.at[1], pop.h / 2); const right = px < W / 2; return <div className={`zpop ${right ? 'zpop-tail-left' : 'zpop-tail-right'} vpop`} style={{ left: `calc(${(px / W * 100).toFixed(2)}% ${right ? '+' : '-'} ${(pop.size[0] * U * .9).toFixed(0)}px)`, top: `${(py / H * 100).toFixed(2)}%`, transform: right ? 'translate(0,-50%)' : 'translate(-100%,-50%)' }}>
      <button type="button" className="zpop-title" onClick={() => onPickPlace(pop.id)}>{pop.name}</button>
      <div className="zpop-items">
        {popup.rows.map(r => <button type="button" key={r.id} className="zpi" onClick={() => onOpenCase?.(r.id)}>
          <span className="zpt"><span>{r.title}</span><span className="zps">{r.node} · {r.sub}</span></span>
          <span className={BADGE[r.st]}>{r.st}</span>
        </button>)}
        {!popup.rows.length && <p className="vpop-empty">지금 이곳에 머무는 건이 없어요</p>}
      </div>
    </div> })()}
  </div>
}
