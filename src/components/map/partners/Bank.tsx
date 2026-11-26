import type { PartnerDef } from './types'
import { Windows, hline } from '../iso'

// 거래 상대: 은행. 바닥판(plate), 연결선(flow), 건물(Building)을 한 묶음으로 가져요.
export const Bank: PartnerDef = {
  id: 'bank',
  label: '은행',
  anchor: [24.13, 61.99],
  plate: [
    { points: '211.9,544.0 329.7,612.0 329.7,605.9 211.9,537.9', cls: 'fy' },
    { points: '447.4,544.0 329.7,612.0 329.7,605.9 447.4,537.9', cls: 'fx' },
    { points: '329.7,469.9 447.4,537.9 329.7,605.9 211.9,537.9', cls: 'ft' }
  ],
  flow: '388.6,503.2 579.9,392.7',
  Building: () => (
    <>
    <g className="bx">
      <polygon points="264.9,540.6 341.4,584.8 341.4,576.3 264.9,532.1" className="fy" />
      <polygon points="406.2,547.4 341.4,584.8 341.4,576.3 406.2,538.9" className="fx" />
      <polygon points="329.7,494.7 406.2,538.9 341.4,576.3 264.9,532.1" className="ft" />
    </g>
    <g className="bx">
      <polygon points="288.4,525.3 353.2,562.7 353.2,520.2 288.4,482.8" className="fy" />
      <polygon points="395.9,538.0 353.2,562.7 353.2,520.2 395.9,495.5" className="fx" />
      <polygon points="331.1,458.1 395.9,495.5 353.2,520.2 288.4,482.8" className="ft" />
    </g>
    <g className="bx">
      <polygon points="275.8,532.6 284.0,537.4 284.0,494.9 275.8,490.1" className="fy" />
      <polygon points="292.3,532.6 284.0,537.4 284.0,494.9 292.3,490.1" className="fx" />
      <polygon points="284.0,485.4 292.3,490.1 284.0,494.9 275.8,490.1" className="ft" />
    </g>
    <g className="bx">
      <polygon points="294.0,543.2 302.3,547.9 302.3,505.4 294.0,500.7" className="fy" />
      <polygon points="310.5,543.2 302.3,547.9 302.3,505.4 310.5,500.7" className="fx" />
      <polygon points="302.3,495.9 310.5,500.7 302.3,505.4 294.0,500.7" className="ft" />
    </g>
    <g className="bx">
      <polygon points="312.3,553.7 320.5,558.5 320.5,516.0 312.3,511.2" className="fy" />
      <polygon points="328.8,553.7 320.5,558.5 320.5,516.0 328.8,511.2" className="fx" />
      <polygon points="320.5,506.4 328.8,511.2 320.5,516.0 312.3,511.2" className="ft" />
    </g>
    <g className="bx">
      <polygon points="330.5,564.2 338.8,569.0 338.8,526.5 330.5,521.7" className="fy" />
      <polygon points="347.0,564.2 338.8,569.0 338.8,526.5 347.0,521.7" className="fx" />
      <polygon points="338.8,517.0 347.0,521.7 338.8,526.5 330.5,521.7" className="ft" />
    </g>
    <g className="bx">
      <polygon points="264.9,489.6 341.4,533.8 341.4,523.6 264.9,479.4" className="fy" />
      <polygon points="406.2,496.4 341.4,533.8 341.4,523.6 406.2,486.2" className="fx" />
      <polygon points="329.7,442.0 406.2,486.2 341.4,523.6 264.9,479.4" className="ft" />
    </g>
    <g className="bx">
      <polygon points="259.0,479.4 341.4,527.0 341.4,521.9 259.0,474.3" className="fy" />
      <polygon points="412.1,486.2 341.4,527.0 341.4,521.9 412.1,481.1" className="fx" />
      <polygon points="329.7,433.5 412.1,481.1 341.4,521.9 259.0,474.3" className="ft" />
    </g>
    <g className="bx">
      <polygon points="259.0,474.3 341.4,521.9 300.2,479.4" className="fy" />
    </g>
      {/* 디테일: 옆벽 창문, 박공 장식, 처마 줄 */}
      <Windows quad="395.9,538.0 353.2,562.7 353.2,520.2 395.9,495.5" cols={2} rows={1} v={[0.15, 0.85]} pad={[0.18, 0.05]} gap={[0.2, 0]} cls="win2" />
      <polyline points={hline('264.9,489.6 341.4,533.8 341.4,523.6 264.9,479.4', 0.5, 0.04, 0.96)} className="wl" />
      <polyline points={hline('406.2,496.4 341.4,533.8 341.4,523.6 406.2,486.2', 0.5, 0.04, 0.96)} className="wl" />
      <polygon points="285.0,483.0 307.5,496.0 300.2,486.6" className="win" />
    </>
  ),
}
