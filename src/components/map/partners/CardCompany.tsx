import type { PartnerDef } from './types'
import { Windows, TopBox, rect } from '../iso'

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
    <g className="card">
      <polygon points="487.2,653.7 525.5,675.8 525.5,673.7 487.2,651.6" className="fy" />
      <polygon points="550.5,661.3 525.5,675.8 525.5,673.7 550.5,659.3" className="fx" />
      <polygon points="512.2,637.2 550.5,659.3 525.5,673.7 487.2,651.6" className="ft" />
    </g>
    <g className="bx">
      <polygon points="476.9,632.4 494.6,642.6 494.6,618.8 476.9,608.6" className="fy" />
      <polygon points="509.3,634.1 494.6,642.6 494.6,618.8 509.3,610.3" className="fx" />
      <polygon points="491.6,600.1 509.3,610.3 494.6,618.8 476.9,608.6" className="ft" />
    </g>
      {/* 디테일: 층 창문, 출입문, 옥상 간판 */}
      <Windows quad="506.3,629.0 571.1,666.4 571.1,615.4 506.3,578.0" cols={3} rows={2} v={[0.3, 0.95]} pad={[0.12, 0.08]} gap={[0.1, 0.25]} />
      <polygon points={rect('624.1,635.8 571.1,666.4 571.1,615.4 624.1,584.8', 0.55, 0, 0.8, 0.38)} className="door" />
      <Windows quad="624.1,635.8 571.1,666.4 571.1,615.4 624.1,584.8" cols={2} rows={1} v={[0.5, 0.95]} pad={[0.1, 0.1]} gap={[0.12, 0]} cls="win2" />
      <TopBox top="559.3,547.4 624.1,584.8 571.1,615.4 506.3,578.0" u0={0.2} v0={0.25} u1={0.5} v1={0.5} h={7} />
    </>
  ),
}
