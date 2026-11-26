import type { PartnerDef } from './types'

// 거래 상대: 판매처. 바닥판(plate), 연결선(flow), 건물(Building)을 한 묶음으로 가져요.
export const Shop: PartnerDef = {
  id: 'shop',
  label: '판매처',
  anchor: [24.13, 19.25],
  plate: [
    { points: '211.9,210.8 329.7,278.8 329.7,272.7 211.9,204.7', cls: 'fy' },
    { points: '447.4,210.8 329.7,278.8 329.7,272.7 447.4,204.7', cls: 'fx' },
    { points: '329.7,136.7 447.4,204.7 329.7,272.7 211.9,204.7', cls: 'ft' }
  ],
  flow: '388.6,238.0 574.1,345.1',
  Building: () => (
    <>
    <g className="bx">
      <polygon points="264.9,207.4 335.6,248.2 335.6,193.8 264.9,153.0" className="fy" />
      <polygon points="400.3,210.8 335.6,248.2 335.6,193.8 400.3,156.4" className="fx" />
      <polygon points="329.7,115.6 400.3,156.4 335.6,193.8 264.9,153.0" className="ft" />
    </g>
    <polygon points="279.6,215.9 300.2,227.8 300.2,208.5 279.6,196.6" className="door" />
    <polygon points="264.9,156.4 276.7,163.2 261.9,183.6 250.2,176.8" className="aw1" />
    <polygon points="276.7,163.2 288.4,170.0 273.7,190.4 261.9,183.6" className="aw2" />
    <polygon points="288.4,170.0 300.2,176.8 285.5,197.2 273.7,190.4" className="aw1" />
    <polygon points="300.2,176.8 312.0,183.6 297.3,204.0 285.5,197.2" className="aw2" />
    <polygon points="312.0,183.6 323.8,190.4 309.1,210.8 297.3,204.0" className="aw1" />
    <polygon points="323.8,190.4 335.6,197.2 320.8,217.6 309.1,210.8" className="aw2" />
    <g className="bx">
      <polygon points="335.6,251.6 350.3,260.1 350.3,244.8 335.6,236.3" className="fy" />
      <polygon points="365.0,251.6 350.3,260.1 350.3,244.8 365.0,236.3" className="fx" />
      <polygon points="350.3,227.8 365.0,236.3 350.3,244.8 335.6,236.3" className="ft" />
    </g>
    </>
  ),
}
