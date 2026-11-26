import type { PartnerDef } from './types'
import { Windows, rect, hline } from '../iso'

// 거래 상대: 창고. 바닥판(plate), 연결선(flow), 건물(Building)을 한 묶음으로 가져요.
export const Warehouse: PartnerDef = {
  id: 'wh',
  label: '창고',
  anchor: [76.08, 18.55],
  plate: [
    { points: '909.7,215.9 1039.3,290.7 1039.3,284.6 909.7,209.8', cls: 'fy' },
    { points: '1168.8,215.9 1039.3,290.7 1039.3,284.6 1168.8,209.8', cls: 'fx' },
    { points: '1039.3,135.0 1168.8,209.8 1039.3,284.6 909.7,209.8', cls: 'ft' }
  ],
  flow: '797.8,348.5 974.5,246.5',
  Building: () => (
    <>
    <g className="bx">
      <polygon points="959.8,204.0 1054.0,258.4 1054.0,214.2 959.8,159.8" className="fy" />
      <polygon points="1130.6,214.2 1054.0,258.4 1054.0,214.2 1130.6,170.0" className="fx" />
      <polygon points="1036.3,115.6 1130.6,170.0 1054.0,214.2 959.8,159.8" className="ft" />
    </g>
    <g className="bx">
      <polygon points="1036.3,115.6 1130.6,170.0 1092.3,168.3 998.1,113.9" className="ft" />
      <polygon points="959.8,159.8 1054.0,214.2 1092.3,168.3 998.1,113.9" className="fy" />
      <polygon points="1130.6,170.0 1054.0,214.2 1092.3,168.3" className="fx" />
    </g>
    <polygon points="1112.9,224.4 1071.7,248.2 1071.7,214.2 1112.9,190.4" className="door" />
    <g className="bx">
      <polygon points="943.6,216.8 959.8,226.1 959.8,209.1 943.6,199.8" className="fy" />
      <polygon points="976.0,216.8 959.8,226.1 959.8,209.1 976.0,199.8" className="fx" />
      <polygon points="959.8,190.4 976.0,199.8 959.8,209.1 943.6,199.8" className="ft" />
    </g>
    <g className="bx">
      <polygon points="962.7,227.8 978.9,237.1 978.9,220.1 962.7,210.8" className="fy" />
      <polygon points="995.1,227.8 978.9,237.1 978.9,220.1 995.1,210.8" className="fx" />
      <polygon points="978.9,201.4 995.1,210.8 978.9,220.1 962.7,210.8" className="ft" />
    </g>
    <g className="bx">
      <polygon points="943.6,199.8 959.8,209.1 959.8,193.8 943.6,184.4" className="fy" />
      <polygon points="976.0,199.8 959.8,209.1 959.8,193.8 976.0,184.4" className="fx" />
      <polygon points="959.8,175.1 976.0,184.4 959.8,193.8 943.6,184.4" className="ft" />
    </g>
      {/* 디테일: 벽 창문 띠, 셔터 줄무늬, 지붕 채광창 */}
      <Windows quad="959.8,204.0 1054.0,258.4 1054.0,214.2 959.8,159.8" cols={4} rows={1} v={[0.55, 0.85]} pad={[0.1, 0.1]} gap={[0.08, 0]} />
      <polyline points={hline('1112.9,224.4 1071.7,248.2 1071.7,214.2 1112.9,190.4', 0.25)} className="wl" />
      <polyline points={hline('1112.9,224.4 1071.7,248.2 1071.7,214.2 1112.9,190.4', 0.45)} className="wl" />
      <polyline points={hline('1112.9,224.4 1071.7,248.2 1071.7,214.2 1112.9,190.4', 0.65)} className="wl" />
      <polyline points={hline('1112.9,224.4 1071.7,248.2 1071.7,214.2 1112.9,190.4', 0.85)} className="wl" />
      <polygon points={rect('1130.6,214.2 1054.0,258.4 1054.0,214.2 1130.6,170.0', 0.06, 0.55, 0.18, 0.8)} className="win2" />
      <polygon points={rect('959.8,159.8 1054.0,214.2 1092.3,168.3 998.1,113.9', 0.15, 0.38, 0.29, 0.62)} className="win" />
      <polygon points={rect('959.8,159.8 1054.0,214.2 1092.3,168.3 998.1,113.9', 0.43, 0.38, 0.57, 0.62)} className="win" />
      <polygon points={rect('959.8,159.8 1054.0,214.2 1092.3,168.3 998.1,113.9', 0.71, 0.38, 0.85, 0.62)} className="win" />
    </>
  ),
}
