import type { PartnerDef } from './types'

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
    </>
  ),
}
