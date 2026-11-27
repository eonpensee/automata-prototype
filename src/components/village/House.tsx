import type { PartnerDef } from '../map/partners/types'

// 고객 집. 1안 거래 상대 그림과 같은 면 색(bx ft/fy/fx)과 바닥판 규칙으로 그려요.
const C = Math.sqrt(3) / 2
const S = 40
const O: [number, number] = [683, 362]
const P = (x: number, y: number, z = 0) => [O[0] + (x - y) * S * C, O[1] + (x + y) * S * 0.5 - z]
const pts = (...ps: number[][]) => ps.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const box = (x0: number, y0: number, x1: number, y1: number, z: number, h: number) => ({
  fy: pts(P(x0, y1, z), P(x1, y1, z), P(x1, y1, z + h), P(x0, y1, z + h)),
  fx: pts(P(x1, y0, z), P(x1, y1, z), P(x1, y1, z + h), P(x1, y0, z + h)),
  ft: pts(P(x0, y0, z + h), P(x1, y0, z + h), P(x1, y1, z + h), P(x0, y1, z + h)),
})
const Box = ({ b }: { b: ReturnType<typeof box> }) => <g className="bx"><polygon points={b.fy} className="fy" /><polygon points={b.fx} className="fx" /><polygon points={b.ft} className="ft" /></g>

const T = 0.12
const body = box(-1.05, -0.8, 1.05, 0.8, 0, 46)
const ym = 0
const roofH = 34
const z = 46
const x0 = -1.2, x1 = 1.2, y0 = -0.95, y1 = 0.95
const chimney = box(0.45, -0.55, 0.75, -0.25, 50, 36)
const porch = box(-0.25, 0.8, 0.35, 1.2, 0, 4)

export const House: PartnerDef = {
  id: 'hq',
  label: '고객',
  anchor: [P(0, 0, 110)[0] / 13.66, P(0, 0, 110)[1] / 7.24],
  plate: [
    { points: pts(P(-1.5, 1.5 + T), P(1.5, 1.5 + T), P(1.5, 1.5, -6), P(-1.5, 1.5, -6)), cls: 'fy' },
    { points: pts(P(1.5, -1.5), P(1.5, 1.5), P(1.5, 1.5, -6), P(1.5, -1.5, -6)), cls: 'fx' },
    { points: pts(P(-1.5, -1.5), P(1.5, -1.5), P(1.5, 1.5), P(-1.5, 1.5)), cls: 'ft' },
  ],
  flow: null,
  Building: () => <>
    <Box b={body} />
    {/* 창문 두 개와 문 */}
    <polygon className="door" points={pts(P(-0.15, 0.8, 0), P(0.25, 0.8, 0), P(0.25, 0.8, 26), P(-0.15, 0.8, 26))} />
    <polygon className="door" points={pts(P(-0.8, 0.8, 18), P(-0.45, 0.8, 18), P(-0.45, 0.8, 34), P(-0.8, 0.8, 34))} />
    <polygon className="door" points={pts(P(0.55, 0.8, 18), P(0.9, 0.8, 18), P(0.9, 0.8, 34), P(0.55, 0.8, 34))} />
    <polygon className="door" points={pts(P(1.05, -0.35, 18), P(1.05, 0.05, 18), P(1.05, 0.05, 34), P(1.05, -0.35, 34))} />
    <Box b={porch} />
    {/* 박공 지붕 */}
    <g className="bx">
      <polygon className="ft" points={pts(P(x0, y0, z), P(x1, y0, z), P(x1, ym, z + roofH), P(x0, ym, z + roofH))} />
    </g>
    <Box b={chimney} />
    <g className="bx">
      <polygon className="fx" points={pts(P(1.05, -0.8, z), P(1.05, 0.8, z), P(1.05, ym, z + roofH - 4))} />
      <polygon className="fy" points={pts(P(x0, y1, z), P(x1, y1, z), P(x1, ym, z + roofH), P(x0, ym, z + roofH))} />
    </g>
  </>,
}
