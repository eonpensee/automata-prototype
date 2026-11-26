import type { PartnerDef } from './types'
import { rect, vline } from '../iso'

const FRONT = '606.4,374.0 683.0,418.2 683.0,309.4 606.4,265.2'
const SIDE = '759.6,374.0 683.0,418.2 683.0,309.4 759.6,265.2'

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
      {/* 지붕 안쪽 테두리와 측면의 얇은 수직 분할 */}
      <polygon points="683,233 738,265.2 683,297.4 628,265.2" className="wl" />
      <polyline points={vline(SIDE, 0.5, 0.29, 0.88)} className="wl" />
      {/* 작은 회사 표식: 글자 대신 네 칸의 심볼과 명판 */}
      <g transform="matrix(0.866 0.5 0 1 620 309)">
        <rect width="38" height="15" rx="1.5" className="hq-sign" />
        <path d="M5 4h3v3H5zM10 4h3v3h-3zM5 9h3v3H5zM10 9h3v3h-3z" className="band" />
        <path d="M18 6h14M18 10h10" className="wl" />
      </g>
      {/* 1층 유리 양개문과 손잡이 */}
      <polygon points={rect(FRONT, 0.34, 0, 0.66, 0.19)} className="door" />
      <polyline points={vline(FRONT, 0.5, 0, 0.19)} className="wl" />
      <polyline points={vline(FRONT, 0.47, 0.07, 0.12)} className="hq-handle" />
      <polyline points={vline(FRONT, 0.53, 0.07, 0.12)} className="hq-handle" />
      {/* 벽에서 살짝 돌출된 얇은 차양 */}
      <g className="bx">
        <polygon points="621.4,369.0 652.0,386.7 652.0,389.2 621.4,371.5" className="fy" />
        <polygon points="652.0,386.7 660.0,382.1 660.0,384.6 652.0,389.2" className="fx" />
        <polygon points="629.4,364.4 660.0,382.1 652.0,386.7 621.4,369.0" className="ft" />
      </g>
    </>
  ),
}
