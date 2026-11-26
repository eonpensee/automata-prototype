import type { PartnerDef } from './types'
import { Windows, TopBox, rect } from '../iso'

// 거래 상대: 우리 회사. 바닥판(plate), 연결선(flow), 건물(Building)을 한 묶음으로 가져요.
export const Hq: PartnerDef = {
  id: 'hq',
  label: '(주)엘리먼츠',
  anchor: [50.0, 31.93],
  plate: [
    { points: '535.8,374.0 683.0,459.0 683.0,452.9 535.8,367.9', cls: 'fy' },
    { points: '830.2,374.0 683.0,459.0 683.0,452.9 830.2,367.9', cls: 'fx' },
    { points: '683.0,282.9 830.2,367.9 683.0,452.9 535.8,367.9', cls: 'ft' }
  ],
  flow: null,
  Building: () => (
    <>
    <g className="bx">
      <polygon points="606.4,374.0 683.0,418.2 683.0,309.4 606.4,265.2" className="fy" />
      <polygon points="759.6,374.0 683.0,418.2 683.0,309.4 759.6,265.2" className="fx" />
      <polygon points="683.0,221.0 759.6,265.2 683.0,309.4 606.4,265.2" className="ft" />
    </g>
    <polyline points="750.7,351.9 691.8,385.9" className="ln" />
    <polyline points="750.7,324.7 691.8,358.7" className="ln" />
    <polyline points="750.7,297.5 691.8,331.5" className="ln" />
    <polyline points="615.3,351.9 674.2,385.9" className="ln" />
    <polyline points="615.3,324.7 674.2,358.7" className="ln" />
    <polyline points="615.3,297.5 674.2,331.5" className="ln" />
      {/* 디테일: 층마다 창문, 1층 출입문, 옥상 설비 */}
      <Windows quad="606.4,374.0 683.0,418.2 683.0,309.4 606.4,265.2" cols={3} rows={3} v={[0.2, 0.95]} pad={[0.12, 0.08]} gap={[0.1, 0.3]} />
      <Windows quad="759.6,374.0 683.0,418.2 683.0,309.4 759.6,265.2" cols={3} rows={3} v={[0.2, 0.95]} pad={[0.12, 0.08]} gap={[0.1, 0.3]} cls="win2" />
      <polygon points={rect('606.4,374.0 683.0,418.2 683.0,309.4 606.4,265.2', 0.38, 0, 0.62, 0.15)} className="door" />
      <polygon points={rect('759.6,374.0 683.0,418.2 683.0,309.4 759.6,265.2', 0.15, 0.05, 0.85, 0.14)} className="win2" />
      <TopBox top="683.0,221.0 759.6,265.2 683.0,309.4 606.4,265.2" u0={0.15} v0={0.15} u1={0.45} v1={0.4} h={9} />
      <TopBox top="683.0,221.0 759.6,265.2 683.0,309.4 606.4,265.2" u0={0.55} v0={0.5} u1={0.7} v1={0.65} h={6} />
    </>
  ),
}
