import type { PartnerDef } from './types'
import { rect } from '../iso'

// 거래 상대: 매입처. 바닥판(plate), 연결선(flow), 건물(Building)을 한 묶음으로 가져요.
export const Supplier: PartnerDef = {
  id: 'sup',
  label: '매입처',
  anchor: [76.3, 60.58],
  plate: [
    { points: '924.4,540.6 1042.2,608.6 1042.2,602.5 924.4,534.5', cls: 'fy' },
    { points: '1160.0,540.6 1042.2,608.6 1042.2,602.5 1160.0,534.5', cls: 'fx' },
    { points: '1042.2,466.5 1160.0,534.5 1042.2,602.5 924.4,534.5', cls: 'ft' }
  ],
  flow: '791.9,389.3 983.3,499.8',
  Building: () => (
    <>
    <g className="bx">
      <polygon points="965.7,537.2 1048.1,584.8 1048.1,544.0 965.7,496.4" className="fy" />
      <polygon points="1118.8,544.0 1048.1,584.8 1048.1,544.0 1118.8,503.2" className="fx" />
      <polygon points="1036.3,455.6 1118.8,503.2 1048.1,544.0 965.7,496.4" className="ft" />
    </g>
    <polygon points="1036.3,455.6 965.7,496.4 993.1,493.5 1063.7,452.7" className="ft2" />
    <polygon points="1063.7,471.4 993.1,512.2 993.1,493.5 1063.7,452.7" className="fx2" />
    <polygon points="1063.7,471.4 993.1,512.2 1020.4,509.3 1091.1,468.5" className="ft2" />
    <polygon points="1091.1,487.2 1020.4,528.0 1020.4,509.3 1091.1,468.5" className="fx2" />
    <polygon points="1091.1,487.2 1020.4,528.0 1047.8,525.1 1118.5,484.3" className="ft2" />
    <polygon points="1118.5,503.0 1047.8,543.8 1047.8,525.1 1118.5,484.3" className="fx2" />
    <g className="bx">
      <polygon points="1029.0,510.9 1042.2,518.5 1042.2,430.1 1029.0,422.5" className="fy" />
      <polygon points="1055.5,510.9 1042.2,518.5 1042.2,430.1 1055.5,422.5" className="fx" />
      <polygon points="1042.2,414.8 1055.5,422.5 1042.2,430.1 1029.0,422.5" className="ft" />
    </g>
      {/* 디테일: 출입문, 굴뚝 띠 */}
      <polygon points={rect('1118.8,544.0 1048.1,584.8 1048.1,544.0 1118.8,503.2', 0.12, 0, 0.36, 0.6)} className="door" />
      <polygon points={rect('1029.0,510.9 1042.2,518.5 1042.2,430.1 1029.0,422.5', 0, 0.84, 1, 0.9)} className="band" />
      <polygon points={rect('1055.5,510.9 1042.2,518.5 1042.2,430.1 1055.5,422.5', 0, 0.84, 1, 0.9)} className="band" />
    </>
  ),
}
