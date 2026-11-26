import type { PartnerDef } from './types'
import { hline, rect, vline } from '../iso'

const FRONT = '506.3,629.0 571.1,666.4 571.1,615.4 506.3,578.0'
const SIDE = '624.1,635.8 571.1,666.4 571.1,615.4 624.1,584.8'

// 거래 상대: 카드사. 바닥판(plate), 연결선(flow), 건물(Building)을 한 묶음으로 가져요.
export const CardCompany: PartnerDef = {
  id: 'card',
  label: '카드사',
  anchor: [40.95, 78.9],
  plate: [
    { points: '441.6,635.8 559.3,703.8 559.3,697.7 441.6,629.7', cls: 'fy' },
    { points: '677.1,635.8 559.3,703.8 559.3,697.7 677.1,629.7', cls: 'fx' },
    { points: '559.3,561.7 677.1,629.7 559.3,697.7 441.6,629.7', cls: 'ft' }
  ],
  flow: '618.2,595.0 800.8,489.6 709.5,436.9',
  Building: () => (
    <>
    <g className="bx">
      <polygon points="506.3,629.0 571.1,666.4 571.1,615.4 506.3,578.0" className="fy" />
      <polygon points="624.1,635.8 571.1,666.4 571.1,615.4 624.1,584.8" className="fx" />
      <polygon points="559.3,547.4 624.1,584.8 571.1,615.4 506.3,578.0" className="ft" />
    </g>
    <g className="bx">
      <polygon points="476.9,632.4 494.6,642.6 494.6,618.8 476.9,608.6" className="fy" />
      <polygon points="509.3,634.1 494.6,642.6 494.6,618.8 509.3,610.3" className="fx" />
      <polygon points="491.6,600.1 509.3,610.3 494.6,618.8 476.9,608.6" className="ft" />
    </g>
      {/* 벽면의 카드 간판: 건물과 같은 원근, 둥근 모서리·칩·번호 두 줄 */}
      <g transform="matrix(0.866 0.5 0 1 517 590)">
        <rect width="46" height="27" rx="3" className="card-sign" />
        <rect x="6" y="6" width="10" height="8" rx="1.5" className="card-chip" />
        <path d="M11 6v8M6 10h10M6 20h15M26 20h10" className="card-etch" />
      </g>
      {/* 얇은 처마선과 유리 양개문 */}
      <polyline points={hline(FRONT, 0.94, 0.03, 0.97)} className="wl" />
      <polyline points={hline(SIDE, 0.94, 0.03, 0.97)} className="wl" />
      <polygon points={rect(SIDE, 0.32, 0, 0.77, 0.47)} className="door" />
      <polyline points={vline(SIDE, 0.545, 0, 0.47)} className="wl" />
      <polygon points={rect(SIDE, 0.28, 0.47, 0.81, 0.53)} className="ft2" />
      {/* 작은 앞쪽 블록은 화면과 카드 투입구가 있는 단말기로 */}
      <g transform="matrix(0.866 0.5 0 1 480 614)">
        <rect width="12" height="8" rx="1" className="card-screen" />
        <path d="M2 12h8" className="card-etch" />
      </g>
    </>
  ),
}
