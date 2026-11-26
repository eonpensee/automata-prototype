// 3D 지도 디테일을 그릴 때 쓰는 도우미.
// 건물 면(사각형) 위의 위치를 0~1 비율(u, v)로 잡아 창문 문 같은 모양을 얹어요.

type P = [number, number]

const parse = (pts: string): P[] => pts.trim().split(/\s+/).map((s) => s.split(',').map(Number) as P)
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const fmt = (ps: P[]) => ps.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')

/**
 * 면 위의 점. quad 순서는 [아래 a, 아래 b, 위 b, 위 a] (원본 SVG 다각형 순서 그대로).
 * u: a→b 방향, v: 아래(0)→위(1)
 */
export function at(quad: string, u: number, v: number): P {
  const [b0, b1, t1, t0] = parse(quad)
  return lerp(lerp(b0, b1, u), lerp(t0, t1, u), v)
}

/** 면 위의 네모 (창문, 문 등) */
export function rect(quad: string, u0: number, v0: number, u1: number, v1: number) {
  return fmt([at(quad, u0, v0), at(quad, u1, v0), at(quad, u1, v1), at(quad, u0, v1)])
}

/** 면 위의 가로줄 */
export function hline(quad: string, v: number, u0 = 0, u1 = 1) {
  return fmt([at(quad, u0, v), at(quad, u1, v)])
}

/** 면 위의 세로줄 */
export function vline(quad: string, u: number, v0 = 0, v1 = 1) {
  return fmt([at(quad, u, v0), at(quad, u, v1)])
}

/** 면에 창문을 격자로 */
export function Windows({ quad, cols, rows, cls = 'win', pad = [0.12, 0.14], gap = [0.1, 0.12], v = [0, 1] }: {
  quad: string; cols: number; rows: number; cls?: string; pad?: [number, number]; gap?: [number, number]; v?: [number, number]
}) {
  const [px, py] = pad
  const [gx, gy] = gap
  const w = (1 - px * 2 - gx * (cols - 1)) / cols
  const span = v[1] - v[0]
  const h = (span - py * span * 2 - gy * span * (rows - 1)) / rows
  const out: string[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const u0 = px + c * (w + gx)
    const v0 = v[0] + py * span + r * (h + gy * span)
    out.push(rect(quad, u0, v0, u0 + w, v0 + h))
  }
  return <>{out.map((p, i) => <polygon key={i} points={p} className={cls} />)}</>
}

/**
 * 윗면 위에 얹는 작은 상자 (옥상 실외기, 간판 등).
 * top 순서는 원본 윗면 다각형 [뒤, 오른쪽, 앞, 왼쪽].
 */
export function TopBox({ top, u0, v0, u1, v1, h }: { top: string; u0: number; v0: number; u1: number; v1: number; h: number }) {
  const [P0, P1, P2, P3] = parse(top)
  const pt = (u: number, v: number) => lerp(lerp(P0, P1, u), lerp(P3, P2, u), v)
  const up = (p: P): P => [p[0], p[1] - h]
  const a = pt(u0, v0), b = pt(u1, v0), c = pt(u1, v1), d = pt(u0, v1)
  return (
    <g className="bx">
      <polygon points={fmt([d, c, up(c), up(d)])} className="fy" />
      <polygon points={fmt([b, c, up(c), up(b)])} className="fx" />
      <polygon points={fmt([up(a), up(b), up(c), up(d)])} className="ft" />
    </g>
  )
}
