import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Status } from '../data/today'
import type { PlaceId as Look } from '../data/nodes'
import type { DecorItem, Scene, VPlace } from './scene'
type Place = VPlace
type PlaceId = string
import { BADGE, ZCLS } from '../logic'
import '../components/village/village.css'
import './v5.css'

/**
 * 시안 5 마을: 4번과 같은 카메라 · 건물 위치 · 이름 · 건수 · 연결 관계.
 * 주요 건물 8개는 용도에 맞는 작은 건축 모형으로, 보조 건물은 단순한 덩어리로 물러나요.
 * 광원은 왼쪽 위 하나: 윗면(ft) > 왼쪽 앞면(fy) > 오른쪽 면(fx) 순으로 밝아요.
 */

/** 지도 크기 (viewBox) */
const U = 31
const W = Math.round(2 * 16.6 * U * Math.sqrt(3) / 2 + 120)
const H = Math.round(16.6 * U + 150)
const OX = W / 2
const OY = 104
const C = Math.sqrt(3) / 2

type Pt = [number, number]
/** 건물 높이 배율 (시안 5: 건물을 키움) */
const ZS = 1.3
const P = (gx: number, gy: number, z = 0): Pt => [OX + (gx - gy) * U * C, OY + (gx + gy) * U * 0.5 - z * ZS]
const pts = (...ps: Pt[]) => ps.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const quad = (x0: number, y0: number, x1: number, y1: number, z = 0) => pts(P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z))
const seg = (a: Pt, b: Pt, cls: string, k?: string | number) => <line key={k} className={cls} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />

/* ── 기본 도형 ─────────────────────────────────────────────── */

/** 상자: 왼쪽 앞면(fy) · 오른쪽 면(fx) · 윗면(ft), 윗면 앞 모서리에 가는 빛 */
function Box({ x0, y0, x1, y1, z = 0, h, cls = '' }: { x0: number; y0: number; x1: number; y1: number; z?: number; h: number; cls?: string }) {
  return <g className={'vbox ' + cls}>
    <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(x1, y1, z + h), P(x0, y1, z + h))} />
    <polygon className="fx" points={pts(P(x1, y0, z), P(x1, y1, z), P(x1, y1, z + h), P(x1, y0, z + h))} />
    <polygon className="ft" points={quad(x0, y0, x1, y1, z + h)} />
    <polyline className="vhl" points={pts(P(x0, y1, z + h), P(x1, y1, z + h), P(x1, y0, z + h))} />
  </g>
}

/** 바닥 평면 다각형으로 세운 덩어리 (둥근 모서리용). 보이는 벽만, 면 방향에 따라 fy · fm · fx */
function Prism({ foot, z = 0, h, cls = '' }: { foot: Pt[]; z?: number; h: number; cls?: string }) {
  const cx = foot.reduce((s, p) => s + p[0], 0) / foot.length, cy = foot.reduce((s, p) => s + p[1], 0) / foot.length
  const walls = foot.map((a, i) => {
    const b = foot[(i + 1) % foot.length]
    let nx = b[1] - a[1], ny = -(b[0] - a[0])
    if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny }
    const len = Math.hypot(nx, ny); nx /= len; ny /= len
    if (nx < .02 && ny < .02) return null
    const face = ny > nx * 1.8 ? 'fy' : nx > ny * 1.8 ? 'fx' : 'fm'
    return { d: (a[0] + b[0] + a[1] + b[1]) / 2, el: <polygon key={i} className={face} points={pts(P(a[0], a[1], z), P(b[0], b[1], z), P(b[0], b[1], z + h), P(a[0], a[1], z + h))} /> }
  }).filter(Boolean) as { d: number; el: ReactNode }[]
  return <g className={'vbox ' + cls}>
    {walls.sort((a, b) => a.d - b.d).map(w => w.el)}
    <polygon className="ft" points={pts(...foot.map(p => P(p[0], p[1], z + h)))} />
  </g>
}

void RecessX
void ShedRoof

/** 왼쪽 앞면(y = y 평면)의 유리: 얇은 창틀 + 은은한 반사 한 줄 */
function GlassY({ xa, xb, y, za, zb, mull = 0 }: { xa: number; xb: number; y: number; za: number; zb: number; mull?: number }) {
  return <g className="vglass">
    <polygon className="gl" points={pts(P(xa, y, za), P(xb, y, za), P(xb, y, zb), P(xa, y, zb))} />
    {Array.from({ length: mull }, (_, i) => { const x = xa + (xb - xa) * (i + 1) / (mull + 1); return seg(P(x, y, za), P(x, y, zb), 'mull', i) })}
    {seg(P(xa + (xb - xa) * .12, y, za + (zb - za) * .2), P(xa + (xb - xa) * .32, y, zb - (zb - za) * .1), 'refl', 'r')}
    <polygon className="frame" points={pts(P(xa, y, za), P(xb, y, za), P(xb, y, zb), P(xa, y, zb))} />
  </g>
}
/** 오른쪽 면(x = x 평면)의 유리 */
function GlassX({ ya, yb, x, za, zb, mull = 0 }: { ya: number; yb: number; x: number; za: number; zb: number; mull?: number }) {
  return <g className="vglass gside">
    <polygon className="gl" points={pts(P(x, ya, za), P(x, yb, za), P(x, yb, zb), P(x, ya, zb))} />
    {Array.from({ length: mull }, (_, i) => { const y = ya + (yb - ya) * (i + 1) / (mull + 1); return seg(P(x, y, za), P(x, y, zb), 'mull', i) })}
    {seg(P(x, ya + (yb - ya) * .15, za + (zb - za) * .25), P(x, ya + (yb - ya) * .3, zb - (zb - za) * .1), 'refl', 'r')}
    <polygon className="frame" points={pts(P(x, ya, za), P(x, yb, za), P(x, yb, zb), P(x, ya, zb))} />
  </g>
}

/** 왼쪽 앞면에 파인 입구: 바닥 · 안쪽 벽 · 옆벽이 보일 만큼 깊게 */
function RecessY({ xa, xb, y, d, zb, z = 0 }: { xa: number; xb: number; y: number; d: number; zb: number; z?: number }) {
  return <g className="vrecess">
    <polygon className="rfloor" points={quad(xa, y - d, xb, y, z)} />
    <polygon className="rback" points={pts(P(xa, y - d, z), P(xb, y - d, z), P(xb, y - d, z + zb), P(xa, y - d, z + zb))} />
    <polygon className="rside" points={pts(P(xa, y - d, z), P(xa, y, z), P(xa, y, z + zb), P(xa, y - d, z + zb))} />
    <polygon className="rlip" points={pts(P(xa, y - d, z + zb), P(xb, y - d, z + zb), P(xb, y, z + zb), P(xa, y, z + zb))} />
    <polyline className="rframe" points={pts(P(xa, y, z), P(xa, y, z + zb), P(xb, y, z + zb), P(xb, y, z))} />
  </g>
}
/** 오른쪽 면에 파인 입구 */
function RecessX({ ya, yb, x, d, zb, z = 0 }: { ya: number; yb: number; x: number; d: number; zb: number; z?: number }) {
  return <g className="vrecess">
    <polygon className="rfloor" points={quad(x - d, ya, x, yb, z)} />
    <polygon className="rback gside" points={pts(P(x - d, ya, z), P(x - d, yb, z), P(x - d, yb, z + zb), P(x - d, ya, z + zb))} />
    <polygon className="rside gside" points={pts(P(x - d, ya, z), P(x, ya, z), P(x, ya, z + zb), P(x - d, ya, z + zb))} />
    <polyline className="rframe" points={pts(P(x, ya, z), P(x, ya, z + zb), P(x, yb, z + zb), P(x, yb, z))} />
  </g>
}

/** 층마다 이어지는 띠창 (왼쪽 앞면) */
function BandsY({ xa, xb, y, z0, z1, fh }: { xa: number; xb: number; y: number; z0: number; z1: number; fh: number }) {
  const n = Math.floor((z1 - z0) / fh)
  return <>{Array.from({ length: n }, (_, k) => <GlassY key={k} xa={xa} xb={xb} y={y} za={z0 + k * fh + fh * .32} zb={z0 + k * fh + fh * .92} />)}</>
}
/** 층마다 이어지는 띠창 (오른쪽 면) */
function BandsX({ ya, yb, x, z0, z1, fh }: { ya: number; yb: number; x: number; z0: number; z1: number; fh: number }) {
  const n = Math.floor((z1 - z0) / fh)
  return <>{Array.from({ length: n }, (_, k) => <GlassX key={k} ya={ya} yb={yb} x={x} za={z0 + k * fh + fh * .32} zb={z0 + k * fh + fh * .92} />)}</>
}
/** 커튼월: 한 면 전체 유리, 층 띠(스팬드럴)와 세로 멀리언 */
function Curtain({ face, a, b, at, z0, z1, fh, cols }: { face: 'x' | 'y'; a: number; b: number; at: number; z0: number; z1: number; fh: number; cols: number }) {
  const Q = (u: number, z: number) => face === 'y' ? P(u, at, z) : P(at, u, z)
  const out: ReactNode[] = [<polygon key="g" className={'gl' + (face === 'x' ? ' gside' : '')} points={pts(Q(a, z0), Q(b, z0), Q(b, z1), Q(a, z1))} />]
  for (let z = z0 + fh; z < z1; z += fh) out.push(<polygon key={'s' + z} className="spandrel" points={pts(Q(a, z - .9), Q(b, z - .9), Q(b, z + .9), Q(a, z + .9))} />)
  for (let k = 1; k < cols; k++) { const u = a + (b - a) * k / cols; out.push(seg(Q(u, z0), Q(u, z1), 'mull', 'm' + k)) }
  out.push(seg(Q(a + (b - a) * .1, z0 + (z1 - z0) * .15), Q(a + (b - a) * .35, z0 + (z1 - z0) * .55), 'refl', 'r'))
  out.push(<polygon key="f" className="frame" points={pts(Q(a, z0), Q(b, z0), Q(b, z1), Q(a, z1))} />)
  return <g className="vglass">{out}</g>
}
/** 줄무늬 차양 (왼쪽 앞면에서 앞으로 기울어 나옴) */
function Awning({ x0, x1, y, z, depth, drop }: { x0: number; x1: number; y: number; z: number; depth: number; drop: number }) {
  const n = 9, out: ReactNode[] = []
  for (let k = 0; k < n; k++) { const a = x0 + (x1 - x0) * k / n, b = x0 + (x1 - x0) * (k + 1) / n
    out.push(<polygon key={k} className={'awn' + (k % 2 ? ' alt' : '')} points={pts(P(a, y, z + drop), P(b, y, z + drop), P(b, y + depth, z), P(a, y + depth, z))} />) }
  out.push(<polygon key="v" className="awn-valance" points={pts(P(x0, y + depth, z), P(x1, y + depth, z), P(x1, y + depth, z - 1.6), P(x0, y + depth, z - 1.6))} />)
  return <g className="awning">{out}</g>
}
/** 외쪽 경사 지붕 (뒤가 높고 앞이 낮음) */
function ShedRoof({ x0, y0, x1, y1, z, rise }: { x0: number; y0: number; x1: number; y1: number; z: number; rise: number }) {
  return <g className="vbox roof">
    <polygon className="fx" points={pts(P(x1, y0, z), P(x1, y1, z), P(x1, y1, z + .8), P(x1, y0, z + rise))} />
    <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(x1, y1, z + .8), P(x0, y1, z + .8))} />
    <polygon className="ft" points={pts(P(x0, y0, z + rise), P(x1, y0, z + rise), P(x1, y1, z + .8), P(x0, y1, z + .8))} />
    <polyline className="vhl" points={pts(P(x0, y1, z + .8), P(x1, y1, z + .8), P(x1, y0, z + rise))} />
  </g>
}

/** 공장: 톱니 지붕(세로면 채광창) · 띠 두른 굴뚝 · 원통 사일로 · 큰 셔터 문 */
function Factory({ x0, y0, x1, y1, stacks }: { x0: number; y0: number; x1: number; y1: number; stacks: number }) {
  const h = 14, r = 9, n = 3, bx1 = x1 - .45, tw = (bx1 - x0) / n
  const silo: Pt[] = Array.from({ length: 10 }, (_, k) => { const t = k / 10 * Math.PI * 2; return [x1 - .22 + .2 * Math.cos(t), y1 - .45 + .2 * Math.sin(t)] })
  return <>
    <Ground foot={[x0, y0, x1, y1]} />
    {Array.from({ length: stacks }, (_, k) => { const sx = x0 + .2 + k * .35; return <g key={'st' + k}><Box x0={sx} y0={y0 + .12} x1={sx + .2} y1={y0 + .32} h={h + r + 26} cls="chimney" />
      {[h + r + 8, h + r + 18].map(z => <polyline key={z} className="band" points={pts(P(sx, y0 + .32, z), P(sx + .2, y0 + .32, z), P(sx + .2, y0 + .12, z))} />)}</g> })}
    <Box x0={x0} y0={y0} x1={bx1} y1={y1} h={h} />
    {Array.from({ length: n }, (_, k) => { const a = x0 + k * tw, b = a + tw
      return <g key={'tooth' + k} className="vbox">
        <polygon className="ft" points={pts(P(a, y0, h), P(b, y0, h + r), P(b, y1, h + r), P(a, y1, h))} />
        <polygon className="fy" points={pts(P(a, y1, h), P(b, y1, h), P(b, y1, h + r))} />
        <g className="vglass gside"><polygon className="gl" points={pts(P(b, y0, h), P(b, y1, h), P(b, y1, h + r), P(b, y0, h + r))} /><polygon className="frame" points={pts(P(b, y0, h), P(b, y1, h), P(b, y1, h + r), P(b, y0, h + r))} /></g>
      </g> })}
    <polygon className="rolldoor" points={pts(P(x0 + .2, y1, 0), P(x0 + .65, y1, 0), P(x0 + .65, y1, 10), P(x0 + .2, y1, 10))} />
    {[2.5, 5, 7.5].map(z => seg(P(x0 + .22, y1, z), P(x0 + .63, y1, z), 'slat', 'fs' + z))}
    <GlassY xa={x0 + .85} xb={bx1 - .12} y={y1} za={6} zb={10} mull={2} />
    <Prism foot={silo} h={26} cls="silo" />
    <polygon className="silo-top" points={pts(...silo.map(q => P(q[0], q[1], 26)))} />
  </>
}

/** 용마루가 좌우(x)로 난 박공 지붕: 오른쪽 면(fx)에 삼각형, 앞 경사면이 보여요 */
function GableX({ x0, y0, x1, y1, z, r }: { x0: number; y0: number; x1: number; y1: number; z: number; r: number }) {
  const ym = (y0 + y1) / 2
  return <g className="vbox gable">
    <polygon className="ft" points={pts(P(x0, y0, z), P(x1, y0, z), P(x1, ym, z + r), P(x0, ym, z + r))} />
    <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(x1, ym, z + r), P(x0, ym, z + r))} />
    <polygon className="fx" points={pts(P(x1, y0, z), P(x1, y1, z), P(x1, ym, z + r))} />
    <polyline className="vhl" points={pts(P(x0, ym, z + r), P(x1, ym, z + r), P(x1, y1, z))} />
  </g>
}

/** 용마루가 앞뒤(y)로 난 박공 지붕: 정면(fy)에 삼각형 박공이 보여요 */
function PedimentY({ x0, y0, x1, y1, z, r, plain }: { x0: number; y0: number; x1: number; y1: number; z: number; r: number; plain?: boolean }) {
  const xm = (x0 + x1) / 2
  return <g className="vbox pediment">
    <polygon className="ft" points={pts(P(x0, y0, z), P(xm, y0, z + r), P(xm, y1, z + r), P(x0, y1, z))} />
    <polygon className="fx" points={pts(P(xm, y0, z + r), P(x1, y0, z), P(x1, y1, z), P(xm, y1, z + r))} />
    <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(xm, y1, z + r))} />
    {!plain && <polygon className="tymp" points={pts(P(x0 + .2, y1, z + 1.6), P(x1 - .2, y1, z + 1.6), P(xm, y1, z + r - 2.2))} />}
    <polyline className="vhl" points={pts(P(x0, y1, z), P(xm, y1, z + r), P(xm, y0, z + r))} />
  </g>
}

/** 연결선 위를 흐르는 빛: 앞은 밝고 뒤로 갈수록 옅어지는 혜성 꼬리, 살짝 번짐 */
function Current({ points }: { points: string }) {
  return <g className="current">
    <polyline className="c-tail" pathLength={100} points={points} />
    <polyline className="c-mid" pathLength={100} points={points} />
    <polyline className="c-head" pathLength={100} points={points} />
  </g>
}

/** 짧고 부드러운 접지 그림자 (광원 왼쪽 위 → 오른쪽 아래로 조금) */
const Ground = ({ foot }: { foot: [number, number, number, number] }) => {
  const [x0, y0, x1, y1] = foot
  return <>
    <polygon className="vshadow" points={pts(P(x0 + .15, y0 + .1), P(x1 + .32, y0 + .1), P(x1 + .32, y1 + .22), P(x0 + .15, y1 + .22))} />
    <polygon className="vao" points={quad(x0 - .05, y0 - .05, x1 + .05, y1 + .05)} />
  </>
}

/* ── 건물 모형 ─────────────────────────────────────────────── */

/** 건물 지붕 높이 (라벨 위치) */
export const TOP: Partial<Record<Look, number>> = { smartstore: 20, b2b: 46, sales: 92, ops: 36, acct: 38, wh: 30, bank: 44, home: 26 }
const SECONDARY_H: Partial<Record<Look, number>> = { coupang: 18, tpl: 20, purchase: 40, supplier: 26, factory: 24, card: 22 }

/* ── 실내 자리 (자사 내부) ──────────────────────────────────── */

/** 책상 하나: 다리 넷, 상판, 모니터, 의자 */
function Desk({ x, y }: { x: number; y: number }) {
  const w = 1.1, d = .6, legs: [number, number][] = [[x, y], [x + w - .08, y], [x, y + d - .08], [x + w - .08, y + d - .08]]
  return <>
    <Box x0={x + .35} y0={y - .5} x1={x + .75} y1={y - .15} h={5} cls="chair" />
    {legs.map(([lx, ly], k) => <Box key={k} x0={lx} y0={ly} x1={lx + .08} y1={ly + .08} h={8} cls="leg" />)}
    <Box x0={x} y0={y} x1={x + w} y1={y + d} z={8} h={1.2} />
    <Box x0={x + .3} y0={y + .12} x1={x + .8} y1={y + .18} z={10.4} h={6} cls="screen" />
    <Box x0={x + .5} y0={y + .12} x1={x + .6} y1={y + .2} z={9.2} h={1.4} cls="leg" />
  </>
}
/** 상자 더미 */
function Crates({ x, y }: { x: number; y: number }) {
  const c = .55, at: [number, number, number][] = [[0, 0, 0], [.6, 0, 0], [1.2, 0, 0], [0, .6, 0], [.6, .6, 0], [1.2, .6, 0], [0, 0, 1], [.6, 0, 1], [0, .6, 1], [.6, .6, 1], [0, 0, 2]]
  return <>{at.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]).map(([dx, dy, lv], k) => <Box key={k} x0={x + dx} y0={y + dy} x1={x + dx + c} y1={y + dy + c} z={lv * 7.5} h={7} cls="crate" />)}</>
}
/** 벽면(y 평면)에 붙은 원판: 금고 문 */
function DiscY({ x, y, z, r, cls }: { x: number; y: number; z: number; r: number; cls: string }) {
  const rz = r * U / ZS
  return <polygon className={cls} points={pts(...Array.from({ length: 28 }, (_, k) => { const t = k / 28 * Math.PI * 2; return P(x + r * Math.cos(t), y, z + rz * Math.sin(t)) }))} />
}
/** 화분 */
const Plant = ({ x, y }: { x: number; y: number }) => <><Box x0={x} y0={y} x1={x + .34} y1={y + .34} h={3.5} cls="pot" /><Box x0={x - .06} y0={y - .06} x1={x + .4} y1={y + .4} z={3.5} h={4} cls="leaf" /><Box x0={x + .04} y0={y + .04} x1={x + .3} y1={y + .3} z={7.5} h={4} cls="leaf" /></>
/** 선반: 단마다 판과 상자 */
function Shelf({ x, y, w, levels = 3 }: { x: number; y: number; w: number; levels?: number }) {
  const d = .45, n = Math.max(2, Math.round(w / .55))
  return <>
    {[x, x + w - .06].map((px, k) => <Box key={'p' + k} x0={px} y0={y} x1={px + .06} y1={y + d} h={levels * 7 + 1} cls="leg" />)}
    {Array.from({ length: levels }, (_, lv) => <g key={lv}>
      <Box x0={x} y0={y} x1={x + w} y1={y + d} z={lv * 7 + 1} h={.8} />
      {Array.from({ length: n }, (_, k) => (k + lv) % 3 === 2 ? null : <Box key={k} x0={x + .1 + k * (w - .2) / n} y0={y + .06} x1={x + .1 + (k + .8) * (w - .2) / n} y1={y + d - .06} z={lv * 7 + 1.8} h={3.6 + ((k + lv) % 2)} cls="crate" />)}
    </g>)}
  </>
}
/** 창구: 카운터, 유리 가림막, 모니터, 손님 쪽 의자 */
function Teller({ x, y, w }: { x: number; y: number; w: number }) {
  // 단순한 창구: 카운터 하나, 그 위 불투명 가림판 한 장, 손님 쪽 의자 하나 (단 안쪽에)
  const mid = x + w / 2
  return <>
    <Box x0={x} y0={y} x1={x + w} y1={y + .6} h={9} />
    <Box x0={x + .15} y0={y + .26} x1={x + w - .15} y1={y + .34} z={9} h={8} cls="tscreen" />
    <Box x0={mid - .2} y0={y + 1} x1={mid + .2} y1={y + 1.35} h={4.5} cls="chair" />
  </>
}
/** 장식(누를 수 없는 집기) */
function Decor({ d }: { d: DecorItem }): ReactNode {
  const [x, y] = d.at, w = d.w ?? 1.4
  switch (d.kind) {
    case 'vault': {
      // 뒷벽에 박힌 금고 문: 벽 테두리, 두께가 보이는 원형 문, 가운데 손잡이 바퀴, 왼쪽 경첩
      const cx = x + 1.1, cz = 15, th = .28, rz = (r: number) => r * U / ZS
      const ring = (r: number, yy: number, cls: string, k: string) => <DiscY key={k} x={cx} y={yy} z={cz} r={r} cls={cls} />
      return <>
        <Box x0={x} y0={y} x1={x + 2.2} y1={y + .16} h={30} cls="vaultb" />
        {ring(.86, y + .16, 'vdoor frame', 'f')}
        {Array.from({ length: 6 }, (_, k) => ring(.74, y + .16 + th * k / 5, 'vdoor side', 's' + k))}
        {ring(.74, y + .16 + th, 'vdoor', 'd')}
        {ring(.56, y + .16 + th, 'vdoor in', 'i')}
        {Array.from({ length: 8 }, (_, k) => { const t = k * Math.PI / 4; return <DiscY key={'b' + k} x={cx + .65 * Math.cos(t)} y={y + .16 + th} z={cz + rz(.65) * Math.sin(t)} r={.035} cls="vhub" /> })}
        {ring(.3, y + .2 + th, 'vwheel', 'w')}
        {[0, 1, 2].map(k => { const t = k * Math.PI / 3 + .3; return seg(P(cx - .3 * Math.cos(t), y + .2 + th, cz - rz(.3) * Math.sin(t)), P(cx + .3 * Math.cos(t), y + .2 + th, cz + rz(.3) * Math.sin(t)), 'vspoke', k) })}
        {ring(.07, y + .2 + th, 'vhub', 'h')}
        {[5, -5].map((dz, k) => <Box key={'h' + k} x0={cx - .98} y0={y + .16} x1={cx - .82} y1={y + .16 + th} z={cz + dz - 1.5} h={3} cls="leg" />)}
      </>
    }
    case 'atm': return <><Box x0={x} y0={y} x1={x + .7} y1={y + .55} h={16} /><polygon className="screenp" points={pts(P(x + .12, y + .55, 9), P(x + .58, y + .55, 9), P(x + .58, y + .55, 14), P(x + .12, y + .55, 14))} /><Box x0={x + .1} y0={y + .55} x1={x + .6} y1={y + .7} z={6} h={1} /></>
    case 'bench': return <>{[x + .1, x + w - .2].map((px, k) => <Box key={k} x0={px} y0={y + .05} x1={px + .1} y1={y + .4} h={3.5} cls="leg" />)}<Box x0={x} y0={y} x1={x + w} y1={y + .45} z={3.5} h={1.3} /></>
    case 'plant': return <Plant x={x} y={y} />
    case 'shelf': return <Shelf x={x} y={y} w={w} />
    case 'rack': return <><Box x0={x} y0={y} x1={x + .8} y1={y + .6} h={20} cls="rackb" />{Array.from({ length: 6 }, (_, k) => seg(P(x + .08, y + .6, 3 + k * 3), P(x + .72, y + .6, 3 + k * 3), 'corr', k))}</>
    case 'sofa': return <><Box x0={x} y0={y} x1={x + w} y1={y + .3} h={8} /><Box x0={x} y0={y + .3} x1={x + w} y1={y + .85} h={4} /><Box x0={x} y0={y + .3} x1={x + .2} y1={y + .85} z={4} h={2.5} /><Box x0={x + w - .2} y0={y + .3} x1={x + w} y1={y + .85} z={4} h={2.5} /></>
    case 'table': return <>{([[x + .1, y + .1], [x + w - .2, y + .1], [x + .1, y + .7], [x + w - .2, y + .7]] as [number, number][]).map(([lx, ly], k) => <Box key={k} x0={lx} y0={ly} x1={lx + .1} y1={ly + .1} h={7} cls="leg" />)}<Box x0={x} y0={y} x1={x + w} y1={y + .9} z={7} h={1.2} /></>
    case 'pallet': return <><Box x0={x - .08} y0={y - .08} x1={x + 1.84} y1={y + 1.24} h={1.2} cls="pad" /><g transform="translate(0,-1.5)"><Crates x={x} y={y} /></g></>
    case 'machine': return <><Box x0={x} y0={y} x1={x + 1.3} y1={y + 1.2} h={16} /><Box x0={x + 1.3} y0={y + .3} x1={x + 2.3} y1={y + 1} h={8} /><Box x0={x + .2} y0={y + .2} x1={x + .5} y1={y + .5} z={16} h={8} cls="leg" />{Array.from({ length: 4 }, (_, k) => seg(P(x + .15, y + 1.2, 4 + k * 3), P(x + 1.15, y + 1.2, 4 + k * 3), 'corr', k))}</>
    case 'cabinet': return <><Box x0={x} y0={y} x1={x + w} y1={y + .5} h={14} />{Array.from({ length: Math.round(w / .5) - 1 }, (_, k) => seg(P(x + (k + 1) * .5, y + .5, 1), P(x + (k + 1) * .5, y + .5, 13), 'corr', k))}{seg(P(x + .05, y + .5, 7), P(x + w - .05, y + .5, 7), 'corr', 'm')}</>
    case 'door': return <><polygon className="doorp" points={pts(P(x, y, 0), P(x + .9, y, 0), P(x + .9, y, 17), P(x, y, 17))} /><polygon className="rug" points={quad(x - .1, y + .1, x + 1, y + .8)} /></>
    case 'gate': return <>
      <polygon className="rug" points={quad(x - .15, y + .2, x + 1.25, y + 1.1)} />
      <Box x0={x - .12} y0={y} x1={x + 1.22} y1={y + .16} h={24} cls="doorframe" />
      <polygon className="doorp" points={pts(P(x, y + .16, 0), P(x + 1.1, y + .16, 0), P(x + 1.1, y + .16, 22), P(x, y + .16, 22))} />
      <DiscY x={x + .92} y={y + .16} z={10} r={.05} cls="vhub" />
    </>
    case 'rug': return <polygon className="rug" points={quad(x, y, x + w, y + (d.w ? d.w * .6 : 1))} />
    case 'posts': return <>{Array.from({ length: 4 }, (_, k) => <Box key={k} x0={x + k * .7} y0={y} x1={x + k * .7 + .08} y1={y + .08} h={7} cls="leg" />)}<polyline className="rope" points={pts(...Array.from({ length: 4 }, (_, k) => P(x + k * .7 + .04, y + .04, 6.5)))} /></>
    default: return null
  }
}

function Room({ p }: { p: Place }): ReactNode {
  const [cx, cy] = p.at, [w, d] = p.size, x0 = cx - w / 2 + .2, x1 = cx + w / 2 - .2, y0 = cy - d / 2 + .2, y1 = cy + d / 2 - .2
  // 자리 밑의 단(카펫처럼 보이던 판)은 그리지 않아요. 누르는 영역만 투명하게 남겨요
  const pad = <polygon className="hit" points={quad(x0, y0, x1, y1)} />
  const on = (el: ReactNode) => <g>{el}</g>
  switch (p.room) {
    case 'desks': return <>{pad}{on(<><Desk x={cx - 1.25} y={cy - .2} /><Desk x={cx + .15} y={cy - .2} /></>)}</>
    case 'boxes': return <>{pad}{on(<Crates x={x0 + .4} y={y0 + .5} />)}</>
    case 'belt': return <>{pad}{on(<>
      {[.3, 1.2, 2.1].map((dx, k) => <Box key={k} x0={x0 + dx} y0={cy - .2} x1={x0 + dx + .12} y1={cy + .2} h={5} cls="leg" />)}
      <Box x0={x0 + .2} y0={cy - .3} x1={x1 - .2} y1={cy + .3} z={5} h={1.6} />
      {/* 상자 넷이 한 칸씩 밀려가며 반복: 첫 상자는 나타나고 마지막 상자는 사라져요 (컨베이어) */}
      {[0, 1, 2, 3].map(k => { const dx = .25 + (k - 1) * .62; return <g key={'c' + k} className={'belt-item' + (k === 0 ? ' in' : k === 3 ? ' out' : '')} style={{ ['--bx' as string]: `${(.62 * U * C).toFixed(2)}px`, ['--by' as string]: `${(.62 * U * .5).toFixed(2)}px` }}><Box x0={x0 + dx} y0={cy - .22} x1={x0 + dx + .45} y1={cy + .22} z={6.6} h={5.5} cls="crate" /></g> })}
    </>)}</>
    case 'machine': return <>{pad}{on(<>
      <Box x0={x0 + .4} y0={y0 + .5} x1={x0 + 1.5} y1={y1 - .5} h={15} />
      <Box x0={x0 + 1.5} y0={y0 + .9} x1={x1 - .4} y1={y1 - .8} h={8} />
      <Box x0={x0 + .6} y0={y0 + .7} x1={x0 + .9} y1={y0 + 1} z={15} h={7} cls="leg" />
    </>)}</>
    case 'parcel': { const bx = cx - .45, by = cy - .45, sz = .9, hh = 19
      // 택배 상자 하나: 정육면체에 가까운 상자, 윗면 테이프와 송장
      return <>{pad}{on(<>
        <Box x0={bx} y0={by} x1={bx + sz} y1={by + sz} h={hh} cls="crate" />
        <polygon className="tape" points={quad(bx + .38, by, bx + .52, by + sz, hh)} />
        <polygon className="tape" points={pts(P(bx + .38, by + sz, hh), P(bx + .52, by + sz, hh), P(bx + .52, by + sz, hh - 6), P(bx + .38, by + sz, hh - 6))} />
        <polygon className="slip" points={quad(bx + .58, by + .14, bx + .82, by + .44, hh)} />
      </>)}</> }
    case 'teller': return <>{pad}{on(<Teller x={x0 + .25} y={cy - .75} w={x1 - x0 - .5} />)}</>
    case 'register': return <>{pad}{on(<>
      <Box x0={x0 + .3} y0={cy - .1} x1={x1 - .3} y1={cy + .45} h={8.5} />
      <Box x0={x0 + .55} y0={cy} x1={x0 + 1} y1={cy + .06} z={8.5} h={5.5} cls="screen" />
      <Box x0={x1 - 1} y0={cy} x1={x1 - .55} y1={cy + .35} z={8.5} h={2.2} cls="crate" />
      <Box x0={x1 - .9} y0={cy + .8} x1={x1 - .4} y1={cy + 1.2} h={5} cls="crate" />
    </>)}</>
    case 'counter': return <>{pad}{on(<>
      <Box x0={x0 + .4} y0={cy - .1} x1={x1 - .4} y1={cy + .4} h={9} />
      <Box x0={x0 + .7} y0={cy} x1={x0 + 1.2} y1={cy + .06} z={9} h={6} cls="screen" />
      <Box x0={x1 - 1.1} y0={cy + .05} x1={x1 - .7} y1={cy + .3} z={9} h={1.5} cls="crate" />
    </>)}</>
    default: return <>{pad}{on(<Desk x={cx - .55} y={cy - .2} />)}</>
  }
}

function Model({ p }: { p: Place }): ReactNode {
  if (p.room) return <Room p={p} />
  const [cx, cy] = p.at, [w, d] = p.size
  // 대지 여백을 줄여 건물을 키움 (4번은 .25)
  const x0 = cx - w / 2 + .1, x1 = cx + w / 2 - .1, y0 = cy - d / 2 + .1, y1 = cy + d / 2 - .1
  switch (p.look) {
    case 'smartstore': {
      // 매장: 간판 띠 · 줄무늬 차양 · 큰 쇼윈도 · 출입문
      const Y0 = y0 + .25, h = 17
      return <>
        <Ground foot={[x0, Y0, x1, y1]} />
        <Box x0={x0} y0={Y0} x1={x1} y1={y1} h={h} />
        <GlassY xa={x0 + .08} xb={x1 - .08} y={y1} za={1.2} zb={10} mull={4} />
        <RecessY xa={cx - .17} xb={cx + .17} y={y1} d={.16} zb={9} />
        <polygon className="eave" points={pts(P(x0, y1, 8.6), P(x1, y1, 8.6), P(x1, y1, 10.4), P(x0, y1, 10.4))} />
        <Awning x0={x0 + .1} x1={x1 - .1} y={y1} z={10.4} depth={.26} drop={2} />
        <Box x0={x0 + .15} y0={Y0 + .15} x1={x0 + .55} y1={Y0 + .45} z={h} h={3} cls="vvent" />
      </>
    }
    case 'b2b': {
      // 거래처 오피스: 높이가 다른 두 동 + 유리 브리지, 층마다 띠창
      const a1 = x0 + .62, b0 = x1 - .62
      return <>
        <Ground foot={[x0, y0, x1, y1]} />
        <Box x0={x0} y0={y0} x1={a1} y1={y1} h={46} />
        <BandsY xa={x0 + .06} xb={a1 - .06} y={y1} z0={9} z1={44} fh={7} />
        <RecessY xa={x0 + .14} xb={x0 + .48} y={y1} d={.14} zb={7} />
        <Box x0={a1} y0={cy - .18} x1={b0} y1={cy + .18} z={20} h={7} cls="glassbox" />
        <Box x0={b0} y0={y0 + .2} x1={x1} y1={y1} h={32} />
        <BandsY xa={b0 + .06} xb={x1 - .06} y={y1} z0={4} z1={30} fh={7} />
        <BandsX ya={y0 + .26} yb={y1 - .06} x={x1} z0={4} z1={30} fh={7} />
      </>
    }
    case 'sales': {
      // 영업: 유리 커튼월 타워. 층 띠 · 세로 멀리언 · 들어간 1층 로비 · 옥상 설비
      const X0 = cx - .6, X1 = cx + .6, Y0 = cy - .6, Y1 = cy + .6, h = 84
      return <>
        <Ground foot={[X0, Y0, X1, Y1]} />
        <Box x0={X0 + .08} y0={Y0 + .08} x1={X1 - .08} y1={Y1 - .08} h={9} cls="core" />
        <Box x0={X0} y0={Y0} x1={X1} y1={Y1} z={9} h={h - 9} />
        <Curtain face="y" a={X0 + .04} b={X1 - .04} at={Y1} z0={10} z1={h - 2} fh={6} cols={4} />
        <Curtain face="x" a={Y0 + .04} b={Y1 - .04} at={X1} z0={10} z1={h - 2} fh={6} cols={4} />
        <GlassY xa={X0 + .14} xb={X1 - .14} y={Y1 - .08} za={0} zb={8} mull={3} />
        <Box x0={X0 + .2} y0={Y0 + .2} x1={X1 - .35} y1={Y1 - .3} z={h} h={5} cls="vvent" />
      </>
    }
    case 'ops': {
      // 운영 관제 센터: 층마다 띠창, 넓은 유리 로비, 옥상 안테나와 위성 접시
      const Y0 = cy - .55, Y1 = cy + .6, h = 30
      return <>
        <Ground foot={[x0, Y0, x1, Y1]} />
        <Box x0={x0} y0={Y0} x1={x1} y1={Y1} h={h} />
        <GlassY xa={x0 + .3} xb={x1 - .3} y={Y1} za={0} zb={8} mull={3} />
        <BandsY xa={x0 + .06} xb={x1 - .06} y={Y1} z0={10} z1={h - 1} fh={6.5} />
        <BandsX ya={Y0 + .06} yb={Y1 - .06} x={x1} z0={10} z1={h - 1} fh={6.5} />
        <Box x0={x0 - .05} y0={Y1 - .02} x1={x1 + .05} y1={Y1 + .28} z={8.4} h={1.4} cls="canopy" />
        <Box x0={x0 + .2} y0={Y0 + .2} x1={x0 + .7} y1={Y0 + .6} z={h} h={4} cls="vvent" />
        <Box x0={x1 - .6} y0={Y0 + .2} x1={x1 - .25} y1={Y0 + .5} z={h} h={3} cls="vvent" />
      </>
    }
    case 'acct': {
      // 회계: 세로 루버가 반복되는 정사각 오피스, 지붕 가운데 중정
      const t = .44, h = 38
      const fins = [1, 2, 3, 4, 5, 6]
      return <>
        <Ground foot={[x0, y0, x1, y1]} />
        <polygon className="court" points={quad(x0 + t, y0 + t, x1 - t, y1 - t, 0)} />
        <Box x0={x0} y0={y0} x1={x1} y1={y0 + t} h={h} />
        <Box x0={x0} y0={y0 + t} x1={x0 + t} y1={y1 - t} h={h} />
        <Box x0={x1 - t} y0={y0 + t} x1={x1} y1={y1 - t} h={h} />
        <Box x0={x0} y0={y1 - t} x1={x1} y1={y1} h={h} />
        <GlassY xa={x0 + .05} xb={x1 - .05} y={y1} za={8} zb={h - 3} />
        <GlassX ya={y0 + .05} yb={y1 - .05} x={x1} za={8} zb={h - 3} />
        {fins.map(k => { const x = x0 + (x1 - x0) * k / 7; return <Box key={'fy' + k} x0={x - .025} y0={y1} x1={x + .025} y1={y1 + .1} z={8} h={h - 11} cls="fin" /> })}
        {fins.map(k => { const y = y0 + (y1 - y0) * k / 7; return <Box key={'fx' + k} x0={x1} y0={y - .025} x1={x1 + .1} y1={y + .025} z={8} h={h - 11} cls="fin" /> })}
        <RecessY xa={cx - .2} xb={cx + .2} y={y1} d={.16} zb={7} />
      </>
    }
    case 'wh': {
      // 창고: 삼각 박공 지붕, 가로 줄이 있는 큰 롤업 셔터 셋, 하역장, 골강판 벽
      const h = 17, Y0 = y0 + .05
      return <>
        <Ground foot={[x0, Y0, x1, y1 + .25]} />
        <Box x0={x0} y0={Y0} x1={x1} y1={y1} h={h} />
        {Array.from({ length: 10 }, (_, k) => { const y = Y0 + (y1 - Y0) * (k + .5) / 10; return seg(P(x1, y, 1), P(x1, y, h - .5), 'corr', 'x' + k) })}
        {[0, 1, 2].map(k => { const w = (x1 - x0 - .5) / 3, xa = x0 + .2 + k * (w + .05), xb = xa + w - .05
          return <g key={'door' + k}>
            <polygon className="rolldoor" points={pts(P(xa, y1, 0), P(xb, y1, 0), P(xb, y1, 12), P(xa, y1, 12))} />
            {[2.4, 4.8, 7.2, 9.6].map(z => seg(P(xa + .02, y1, z), P(xb - .02, y1, z), 'slat', z))}
            <polygon className="doorhead" points={pts(P(xa - .03, y1, 12), P(xb + .03, y1, 12), P(xb + .03, y1, 13.4), P(xa - .03, y1, 13.4))} />
          </g> })}
        <Box x0={x0 + .1} y0={y1} x1={x1 - .1} y1={y1 + .24} h={2.6} cls="dock" />
        <GableX x0={x0 - .05} y0={Y0 - .05} x1={x1 + .05} y1={y1 + .05} z={h} r={11} />
        {[1, 2, 3].map(k => { const x = x0 + (x1 - x0) * k / 4; return seg(P(x, (Y0 + y1) / 2, h + 11), P(x, y1 + .05, h), 'seam', 'rs' + k) })}
      </>
    }
    case 'bank': {
      // 고전 은행: 세 단 계단 기단, 앞면을 가로지르는 기둥 다섯 개, 보, 정면을 향한 삼각 박공
      const zb = 6, colH = 20, beam = 3, Yb = y1 - .42
      return <>
        <Ground foot={[x0 - .12, y0 - .1, x1 + .12, y1 + .3]} />
        <Box x0={x0 - .16} y0={y0 - .12} x1={x1 + .16} y1={y1 + .3} h={2} cls="plinth" />
        <Box x0={x0 - .08} y0={y0 - .06} x1={x1 + .08} y1={y1 + .18} z={2} h={2} cls="plinth" />
        <Box x0={x0} y0={y0} x1={x1} y1={y1 + .06} z={4} h={2} cls="plinth" />
        <Box x0={x0 + .1} y0={y0 + .08} x1={x1 - .1} y1={Yb} z={zb} h={colH} />
        <RecessY xa={cx - .16} xb={cx + .16} y={Yb} d={.1} zb={13} z={zb} />
        <polygon className="eave" points={pts(P(x0 + .1, Yb, zb + colH - 3), P(x1 - .1, Yb, zb + colH - 3), P(x1 - .1, Yb, zb + colH), P(x0 + .1, Yb, zb + colH))} />
        {[0, 1, 2, 3, 4].map(k => { const x = x0 + .1 + (x1 - x0 - .2) * k / 4; return <Box key={k} x0={x - .045} y0={y1 - .1} x1={x + .045} y1={y1 - .01} z={zb} h={colH} cls="column" /> })}
        <Box x0={x0 - .02} y0={y0 + .02} x1={x1 + .02} y1={y1 + .02} z={zb + colH} h={beam} cls="cornice" />
        <PedimentY x0={x0 - .02} y0={y0 + .02} x1={x1 + .02} y1={y1 + .02} z={zb + colH + beam} r={13} />
      </>
    }
    case 'home': {
      // 고객 집: 정면 삼각 박공 지붕, 굴뚝, 가운데 현관(작은 차양), 양옆 창 두 개, 마당과 현관 길
      const X0 = cx - .55, X1 = cx + .55, Y0 = cy - .5, Y1 = cy + .35, h = 13
      return <>
        <polygon className="lawn" points={quad(x0, y0, x1, y1)} />
        <polygon className="path" points={quad(cx - .14, Y1, cx + .14, y1)} />
        <Ground foot={[X0, Y0, X1, Y1]} />
        <Box x0={X0} y0={Y0} x1={X1} y1={Y1} h={h} />
        <RecessY xa={cx - .14} xb={cx + .14} y={Y1} d={.1} zb={8.5} />
        <GlassY xa={X0 + .12} xb={X0 + .36} y={Y1} za={3.5} zb={9} mull={1} />
        <GlassY xa={X1 - .36} xb={X1 - .12} y={Y1} za={3.5} zb={9} mull={1} />
        <GlassX ya={Y0 + .2} yb={Y0 + .5} x={X1} za={3.5} zb={9} />
        <Box x0={cx - .22} y0={Y1} x1={cx + .22} y1={Y1 + .18} z={9.2} h={1} cls="canopy" />
        <PedimentY x0={X0 - .08} y0={Y0 - .08} x1={X1 + .08} y1={Y1 + .08} z={h} r={12} plain />
        <Box x0={X0 + .18} y0={Y0 + .1} x1={X0 + .36} y1={Y0 + .28} z={h + 5} h={9} cls="chimney" />
      </>
    }
    default: {
      // 보조 건물: 용도에 맞는 실제 건물이지만 흐리게 물러나요
      const sh = p.sh ?? SECONDARY_H[p.look] ?? 20, X0 = x0 + .1, Y0 = y0 + .1, X1 = x1 - .1, Y1 = y1 - .1
      if (p.art === 'warehouse') return <>
        <Ground foot={[X0, Y0, X1, Y1]} />
        <Box x0={X0} y0={Y0} x1={X1} y1={Y1} h={sh} />
        {Array.from({ length: 12 }, (_, k) => { const x = X0 + (X1 - X0) * (k + .5) / 12; return seg(P(x, Y1, 1), P(x, Y1, sh - 1), 'corr', k) })}
        {[0, 1].map(k => { const xa = X0 + .25 + k * .6; return <RecessY key={k} xa={xa} xb={xa + .4} y={Y1} d={.18} zb={12} /> })}
      </>
      if (p.art === 'factory') return <Factory x0={X0} y0={Y0} x1={X1} y1={Y1} stacks={p.look === 'factory' ? 2 : 1} />
      if (p.art === 'shop') return <>
        <Ground foot={[X0, Y0 + .2, X1, Y1]} />
        <Box x0={X0} y0={Y0 + .2} x1={X1} y1={Y1} h={sh} />
        <GlassY xa={X0 + .08} xb={X1 - .08} y={Y1} za={1.2} zb={10} mull={3} />
        <Awning x0={X0 + .1} x1={X1 - .1} y={Y1} z={10.4} depth={.24} drop={2} />
      </>
      return <>
        <Ground foot={[X0 + .1, Y0 + .1, X1 - .1, Y1 - .1]} />
        <Box x0={X0 + .1} y0={Y0 + .1} x1={X1 - .1} y1={Y1 - .1} h={sh} />
        <BandsY xa={X0 + .16} xb={X1 - .16} y={Y1 - .1} z0={3} z1={sh - 1} fh={7} />
        <BandsX ya={Y0 + .16} yb={Y1 - .16} x={X1 - .1} z0={3} z1={sh - 1} fh={7} />
      </>
    }
  }
}

/* ── 바닥과 업무 연결선 ─────────────────────────────────────── */

/** 구역 땅 (네 블록) */
const DISTRICTS: [number, number, number, number][] = [[0, 0, 7.6, 7.6], [8.4, 0, 16, 7.6], [0, 8.4, 7.6, 16], [8.4, 8.4, 16, 16]]
/** 연결선이 지나는 길 (가로 · 세로 중심선) */
const LANES = [3.5, 8, 12.5]

/** 업무가 이어지는 주요 건물끼리 (판매처 → 영업 · 운영 → 창고 → 고객, 은행 → 회계) */

/** 가장 가까운 길(건물 옆 두 줄 중 목표 쪽) */
const laneToward = (from: number, to: number) => LANES.filter(l => Math.abs(l - from) < 2.7).sort((a, b) => Math.abs(a - to) - Math.abs(b - to))[0]
/** 기단 접점에서 출발해 길을 따라 꺾이는 경로 (격자 좌표) */
function routeOf(a: Place, b: Place): Pt[] {
  const ha = a.size[1] / 2 - .1, wb = b.size[0] / 2 - .1
  const row = laneToward(a.at[1], b.at[1]), col = laneToward(b.at[0], a.at[0])
  // 같은 세로줄(또는 가로줄)에 있으면 사이 길을 가로질러 곧게 이어요
  if (Math.abs(a.at[0] - b.at[0]) < 1) {
    const x = (a.at[0] + b.at[0]) / 2, dir = Math.sign(b.at[1] - a.at[1])
    return [[x, a.at[1] + dir * ha], [x, b.at[1] - dir * (b.size[1] / 2 - .1)]]
  }
  if (Math.abs(a.at[1] - b.at[1]) < 1) {
    const y = (a.at[1] + b.at[1]) / 2, dir = Math.sign(b.at[0] - a.at[0])
    return [[a.at[0] + dir * (a.size[0] / 2 - .1), y], [b.at[0] - dir * wb, y]]
  }
  const raw: Pt[] = [[a.at[0], a.at[1] + Math.sign(row - a.at[1]) * ha], [a.at[0], row], [col, row], [col, b.at[1]], [b.at[0] + Math.sign(col - b.at[0]) * wb, b.at[1]]]
  return raw.filter((q, k) => k === 0 || q[0] !== raw[k - 1][0] || q[1] !== raw[k - 1][1])
}
/** 모든 경로를 가로 · 세로 구간으로 쪼개 같은 줄의 겹치는 구간을 하나로 합쳐요 */
function mergedSegments(routes: Pt[][]): [Pt, Pt][] {
  const lines = new Map<string, [number, number][]>()
  for (const r of routes) for (let k = 1; k < r.length; k++) {
    const [a, b] = [r[k - 1], r[k]], h = a[1] === b[1]
    const key = (h ? 'h' : 'v') + (h ? a[1] : a[0]).toFixed(3), lo = Math.min(h ? a[0] : a[1], h ? b[0] : b[1]), hi = Math.max(h ? a[0] : a[1], h ? b[0] : b[1])
    lines.set(key, [...(lines.get(key) ?? []), [lo, hi]])
  }
  const out: [Pt, Pt][] = []
  for (const [key, spans] of lines) {
    const at = parseFloat(key.slice(1)), h = key[0] === 'h'
    const merged = spans.sort((p, q) => p[0] - q[0]).reduce<[number, number][]>((m, sp) => { const last = m[m.length - 1]; if (last && sp[0] <= last[1] + 1e-6) last[1] = Math.max(last[1], sp[1]); else m.push([...sp]); return m }, [])
    for (const [lo, hi] of merged) out.push(h ? [[lo, at], [hi, at]] : [[at, lo], [at, hi]])
  }
  return out
}

export interface PlaceState { lit: boolean; current?: boolean; count?: { n: number; st: Status }; /** 오늘 이곳을 지나간 노드 종류 */ kind?: 'promise' | 'event' | 'mix' }
export interface PopupRow { id: string; title: string; sub: string; node: string; st: Status }

/** 라벨 자리: 지붕 위 (지붕과 특징을 덮지 않게) */
export const placeTop = (p: Place): Pt => P(p.at[0], p.at[1], (TOP[p.look] ?? p.sh ?? SECONDARY_H[p.look] ?? 20) + 11)

export function Village({ scene, allClickable, lively, tight, bubbles, states, route, routeCurrent, popup, onPickPlace, onOpenCase, onBackground }: {
  scene: Scene
  /** 켜지지 않은 건물도 누를 수 있게 (안으로 들어가기) */
  allClickable?: boolean
  /** 움직임에 뜻을 하나씩: 진행 중인 건이 있는 길에만 흐르는 빛, 확인 필요한 곳의 이름표에만 퍼지는 점 */
  lively?: boolean
  /** 둘레 여백을 줄여 그림을 크게 */
  tight?: boolean
  /** 자리별 건 목록. 있으면 이름표 대신 말풍선으로 바로 보여 줘요 */
  bubbles?: Record<string, PopupRow[]>
  states: Partial<Record<PlaceId, PlaceState>>
  route?: PlaceId[]
  routeCurrent?: number
  popup?: { place: PlaceId; rows: PopupRow[] } | null
  onPickPlace: (id: PlaceId) => void
  onOpenCase?: (id: string) => void
  onBackground?: () => void
}) {
  const PLACES = scene.places, LINKS = scene.links
  // 실내는 바닥 크기(span)에 맞춰 확대해서 보여요
  const span = scene.span ?? 16
  const vb: [number, number, number, number] = scene.interior && span < 16 ? (() => { const c = P(span / 2, span / 2), vw = 2 * span * U * C + 110, vh = vw * H / W; return [c[0] - vw / 2, c[1] - vh / 2 - 14, vw, vh] as [number, number, number, number] })() : scene.districts ? (() => {
    // 바닥 판이 차지하는 범위에 맞춰 화면을 잡아요
    const cs = scene.districts!.flatMap(([ax, ay, bx, by]) => [P(ax, ay), P(bx, ay), P(bx, by), P(ax, by)])
    const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) - 70, y1 = Math.max(...ys) + 10
    const vw = Math.max(x1 - x0 + 60, (y1 - y0 + 20) * W / H), vh = vw * H / W
    return [(x0 + x1) / 2 - vw / 2, (y0 + y1) / 2 - vh / 2, vw, vh] as [number, number, number, number]
  })() : tight ? [W * .065, H * .065 + 6, W * .87, H * .87] : [0, 0, W, H]
  // 말풍선 자리 잡기: 위, 오른쪽, 왼쪽, 아래 순으로 놓아 보고 서로 겹치지 않는 첫 자리를 써요
  const boxRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(1000)
  useLayoutEffect(() => { const el = boxRef.current; if (!el) return; const ro = new ResizeObserver(() => setCw(el.clientWidth)); ro.observe(el); setCw(el.clientWidth); return () => ro.disconnect() }, [])
  const placed: { p: Place; rows: PopupRow[]; x: number; y: number; side: 'bottom' | 'left' | 'right' | 'top'; ax: number }[] = []
  if (bubbles) {
    const k = cw / vb[2], maxY = cw * vb[3] / vb[2], BW = 268
    const items = PLACES.filter(p => bubbles[p.id]?.length).map(p => { const q = placeTop(p), g = P(p.at[0], p.at[1]); return { p, rows: bubbles[p.id], ax: (q[0] - vb[0]) * k, ay: (q[1] - vb[1]) * k, gy: (g[1] - vb[1]) * k } }).sort((a, b) => b.rows.length - a.rows.length)
    const hit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w + 8 && b.x < a.x + a.w + 8 && a.y < b.y + b.h + 8 && b.y < a.y + a.h + 8
    const taken: { x: number; y: number; w: number; h: number }[] = items.map(it => ({ x: it.ax - 50, y: it.ay, w: 100, h: it.gy - it.ay + 20 }))
    for (const it of items) {
      const h = 40 + Math.min(it.rows.length, 3) * 52 + (it.rows.length > 3 ? 26 : 0), mid = (it.ay + it.gy) / 2
      const cands = [
        { side: 'bottom' as const, x: it.ax - BW / 2, y: it.ay - h - 12, ax: BW / 2 },
        { side: 'left' as const, x: it.ax + 64, y: mid - h / 2, ax: 0 },
        { side: 'right' as const, x: it.ax - 64 - BW, y: mid - h / 2, ax: 0 },
        { side: 'bottom' as const, x: it.ax - BW + 40, y: it.ay - h - 12, ax: BW - 40 },
        { side: 'bottom' as const, x: it.ax - 40, y: it.ay - h - 12, ax: 40 },
        { side: 'top' as const, x: it.ax - BW / 2, y: it.gy + 28, ax: BW / 2 },
      ]
      const own = taken.find(t => Math.abs(t.x + 50 - it.ax) < 1 && Math.abs(t.y - it.ay) < 1)
      const ok = cands.find(c => c.x >= 4 && c.x + BW <= cw - 4 && c.y >= 4 && c.y + h <= maxY - 4 && !taken.some(t => t !== own && hit({ x: c.x, y: c.y, w: BW, h }, t))) ?? cands[0]
      taken.push({ x: ok.x, y: ok.y, w: BW, h })
      placed.push({ p: it.p, rows: it.rows, x: ok.x, y: ok.y, side: ok.side, ax: ok.ax })
    }
  }
  const pct = (q: Pt) => ({ left: `${((q[0] - vb[0]) / vb[2] * 100).toFixed(2)}%`, top: `${((q[1] - vb[1]) / vb[3] * 100).toFixed(2)}%` })
  const anyLit = Object.values(states).some(s => s?.lit)
  const placeById = (id: PlaceId) => PLACES.find(p => p.id === id)!
  const sorted = [...PLACES].sort((a, b) => (a.at[0] + a.at[1]) - (b.at[0] + b.at[1]))
  const picked = PLACES.find(p => states[p.id]?.current)?.id
  const pop = popup ? placeById(popup.place) : null
  return <div ref={boxRef} className={'village v5v' + (picked ? ' picked' : '')} onClick={e => { if (onBackground && !(e.target as Element).closest('button,[role="button"],.zpop')) onBackground() }}>
    <svg viewBox={vb.join(' ')} className="village-svg" aria-hidden="false">
      <defs>
        {([['', '#F6FAF7', '#EBF2ED', '#E5EEE8', '#DAE6DD', '#E0EAE3'], ['on', '#E7F1E9', '#DAE9DD', '#D3E4D7', '#C6DBCB', '#CFE1D3'], ['cur', '#D6E7D9', '#C7DDCB', '#BFD6C5', '#ADC9B4', '#B9D1BF'], ['pr', '#EEEBFA', '#E2DDF5', '#DAD4F1', '#CCC5EA', '#D5CEEE'], ['prcur', '#DFDAF6', '#D0C9F0', '#C7BFEB', '#B5ABE2', '#C0B7E7']] as const).map(([k, ya, yb, xa, xb, m]) =>
          <g key={'gd' + k}>
            <linearGradient id={'v5fy' + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ya} /><stop offset="1" stopColor={yb} /></linearGradient>
            <linearGradient id={'v5fx' + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={xa} /><stop offset="1" stopColor={xb} /></linearGradient>
            <linearGradient id={'v5fm' + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ya} /><stop offset="1" stopColor={m} /></linearGradient>
          </g>)}
        <linearGradient id="v5glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F9F6" /><stop offset=".55" stopColor="#DCEBE2" /><stop offset="1" stopColor="#CBE0D3" /></linearGradient>
        <linearGradient id="v5glassOn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F1F8F3" /><stop offset=".55" stopColor="#D2E5D8" /><stop offset="1" stopColor="#BCD6C3" /></linearGradient>
        <filter id="v5soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" /></filter>
        <filter id="v5glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="v5ao" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      {scene.interior
        ? <g className="vfloor"><polygon className="edge-y" points={pts(P(0, span), P(span, span), P(span, span, -6), P(0, span, -6))} /><polygon className="edge-x" points={pts(P(span, 0), P(span, span), P(span, span, -6), P(span, 0, -6))} /><polygon className="top" points={quad(0, 0, span, span)} />
            {(scene.wall ?? 16) > 0 && <g className="vwall"><Box x0={-.2} y0={-.2} x1={span} y1={0} h={scene.wall ?? 16} /><Box x0={-.2} y0={0} x1={0} y1={span} h={scene.wall ?? 16} /></g>}</g>
        : (scene.districts ?? DISTRICTS).map((q, i) => { const e = tight && !scene.districts ? .3 : 0, [ax, ay, bx, by] = q; return <polygon key={'g' + i} className="vground" points={quad(ax === 0 ? e : ax, ay === 0 ? e : ay, bx === 16 ? 16 - e : bx, by === 16 ? 16 - e : by)} /> })}
      {(() => {
        const routes = scene.roads ? scene.roads.map(x => ({ a: x.a, b: x.b, r: x.path as Pt[] })) : LINKS.map(([a, b]) => ({ a, b, r: routeOf(placeById(a), placeById(b)) }))
        const ends = [...new Map(routes.flatMap(x => [x.r[0], x.r[x.r.length - 1]]).map(q => [q.join(), q])).values()]
        // 건물을 골라도 주변 길을 따로 켜지 않아요 (진한 선이 중간에 끊겨 보여서)
        const hot: typeof routes = []
        return <g className="vlinks5">
          {mergedSegments(routes.map(x => x.r)).map(([p0, p1], k) => <line key={k} className="lk" x1={P(...p0)[0]} y1={P(...p0)[1]} x2={P(...p1)[0]} y2={P(...p1)[1]} />)}
          {ends.map((q, k) => { const [ex, ey] = P(q[0], q[1]); return <ellipse key={'e' + k} className="lk-end" cx={ex} cy={ey} rx={2.6} ry={1.5} /> })}
          {route && route.slice(1).map((to, k) => ({ from: route[k], to, k })).filter(x => x.from !== x.to).map(x => {
            const r = routeOf(placeById(x.from), placeById(x.to)), done = x.k + 1 <= (routeCurrent ?? 0), now = x.k + 1 === routeCurrent
            return <g key={'rt' + x.k} className={'lk-hot' + (done ? '' : ' later')}><polyline points={pts(...r.map(q => P(q[0], q[1])))} />{now && <Current points={pts(...r.map(q => P(q[0], q[1])))} />}</g>
          })}
          {lively && routes.filter(x => states[x.a]?.count?.st === '진행 중' || states[x.b]?.count?.st === '진행 중').map((x, k) => <g key={'lv' + k} className="lk-live" style={{ ['--d' as string]: `${k * .7}s` }}><Current points={pts(...x.r.map(q => P(q[0], q[1])))} /></g>)}
          {hot.map((x, k) => <g key={'h' + k} className="lk-hot"><polyline points={pts(...x.r.map(q => P(q[0], q[1])))} /><Current points={pts(...x.r.map(q => P(q[0], q[1])))} /></g>)}
        </g>
      })()}
      {[...sorted.map(p => ({ k: p.at[0] + p.at[1], p, d: null as DecorItem | null })), ...(scene.decor ?? []).map(d => ({ k: d.at[0] + d.at[1] - .6, p: null as Place | null, d }))].sort((a, b) => a.k - b.k).map((it, n) => {
        if (it.d) return <g key={'d' + n} className={'vbld deco' + (anyLit ? ' dim' : '')}><Decor d={it.d} /></g>
        const p = it.p!
        const s = states[p.id]; const main = p.look in TOP || p.sh !== undefined; const cls = 'vbld' + (main ? '' : ' minor') + (s?.lit ? ' on' : anyLit ? ' off' : '') + (s?.current ? ' cur' : '')
        return <g key={p.id} className={cls} role={s?.lit || allClickable ? 'button' : undefined} tabIndex={s?.lit || allClickable ? 0 : undefined} aria-label={p.name} onClick={() => (s?.lit || allClickable) && onPickPlace(p.id)} onKeyDown={e => { if ((s?.lit || allClickable) && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPickPlace(p.id) } }}><Model p={p} /></g> })}
    </svg>
    {placed.map(({ p, rows, x, y, side, ax }) =>
      <div key={'b' + p.id} className={'bub8 a-' + side + (states[p.id]?.current ? ' on' : '')} style={{ left: x, top: y, ['--ax' as string]: `${ax}px` }}>
        <button type="button" className="bub8-head" onClick={() => onPickPlace(p.id)}><b>{p.name}</b><span>{rows.length}건</span></button>
        {rows.slice(0, 3).map(r => <button key={r.id} type="button" className="bub8-row" onClick={() => onOpenCase?.(r.id)}><span className="bub8-main"><b>{r.title}</b>{r.node && <span>{r.node}</span>}</span><span className={BADGE[r.st]}>{r.st}</span></button>)}
        {rows.length > 3 && <span className="bub8-more">외 {rows.length - 3}건</span>}
      </div>)}
    {PLACES.filter(p => (states[p.id]?.lit || scene.interior || allClickable) && !bubbles?.[p.id]?.length).map(p => { const s = states[p.id]; return <button key={'t' + p.id} type="button" className={'tag zt vtag vtag5' + (s?.lit ? '' : ' idle') + (s?.current || popup?.place === p.id ? ' on' : '') + (s?.count && s.count.n > 0 ? ' live' : '')} style={pct(placeTop(p))} onClick={() => onPickPlace(p.id)}>{s?.kind && <span className={'vkind ' + s.kind} aria-label={s.kind === 'promise' ? '약속' : s.kind === 'event' ? '사건' : '약속과 사건'} />}{lively && s?.count?.st === '확인 필요' && <span className="need-dot" aria-label="확인 필요" />}<span className="vtag5-name">{p.name}</span>{s?.count && s.count.n > 0 && <span className={ZCLS[s.count.st]}>{s.count.n}건</span>}</button> })}
    {pop && popup && (() => { const [px, py] = P(pop.at[0], pop.at[1], 10); return <div className="zpop vpop" style={pct([px, py])}>
      <div className="zpop-items">{popup.rows.map(r => <button type="button" key={r.id} className="zpi" onClick={() => onOpenCase?.(r.id)}><span className="zpt"><span>{r.title}</span><span className="zps">{r.node} {r.sub}</span></span><span className={BADGE[r.st]}>{r.st}</span></button>)}</div>
    </div> })()}
  </div>
}
