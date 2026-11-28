import { currentStep, stepNodes, type Art, type PlaceId } from '../data/nodes'
import type { FlowCase } from '../data/review'

/**
 * 시안 7 지도는 두 단계예요 (11/27 상연님 피드백).
 * 1단계: 회사 안팎 전체. 자사는 건물 하나, 바깥에 판매처, 고객, 매입처, 금융.
 * 2단계: 자사를 누르면 부문(엔진 모듈)별 건물.
 * look = 어떤 건물 모형으로 그릴지 (Village5의 Model)
 */
export interface VPlace { id: string; name: string; art: Art; at: [number, number]; size: [number, number]; h: number; look: PlaceId; sh?: number; /** 실내 자리: 책상, 상자 더미, 컨베이어, 설비, 접수대 */ room?: 'desk' | 'desks' | 'boxes' | 'belt' | 'machine' | 'counter' | 'teller' | 'register' | 'parcel' }
/** 누를 수 없는 집기 */
export interface DecorItem { kind: 'vault' | 'atm' | 'bench' | 'plant' | 'shelf' | 'rack' | 'sofa' | 'table' | 'pallet' | 'machine' | 'cabinet' | 'door' | 'gate' | 'rug' | 'posts'; at: [number, number]; w?: number }
export interface Scene { places: VPlace[]; links: [string, string][]; /** 건물 밖 마을이 아니라 건물 안 바닥 한 장 */ interior?: boolean; /** 바닥 한 변(격자 칸). 작을수록 확대 */ span?: number; wall?: number; decor?: DecorItem[]
  /** 바닥 판(격자 좌표 x0, y0, x1, y1)과 길을 직접 정할 때 */
  districts?: [number, number, number, number][]; roads?: { a: string; b: string; path: [number, number][] }[] }

export const CO = 'co'
const S: [number, number] = [2, 2]

/**
 * 1단계 지도. 자사가 가운데, 일이 흐르는 방향대로 네 묶음이 둘러싸요.
 * 화면 왼쪽 위: 물건을 사 오고 만드는 곳 / 왼쪽 아래: 주문이 들어오는 곳
 * 화면 오른쪽 위: 물건이 나가는 곳 / 오른쪽 아래: 돈이 오가는 곳
 */
export const WORLD: Scene = {
  places: [
    { id: 'supplier', name: '매입처', art: 'factory', at: [2.2, 6.5], size: S, h: 34, look: 'supplier' },
    { id: 'factory', name: '외주 생산', art: 'factory', at: [2.2, 9.5], size: S, h: 30, look: 'factory' },
    { id: 'tpl', name: '3PL 창고', art: 'warehouse', at: [6.4, 2.2], size: [2.6, 2], h: 30, look: 'tpl' },
    { id: 'home', name: '고객', art: 'house', at: [9.6, 2.2], size: S, h: 22, look: 'home' },
    { id: CO, name: '자사', art: 'tower', at: [8, 8], size: [3.2, 3.2], h: 62, look: 'sales' },
    { id: 'smartstore', name: '스마트스토어', art: 'shop', at: [5.6, 12.6], size: S, h: 26, look: 'smartstore' },
    { id: 'b2b', name: '거래처', art: 'office', at: [10.4, 12.6], size: S, h: 34, look: 'b2b' },
    { id: 'coupang', name: '쿠팡', art: 'shop', at: [8, 14.9], size: S, h: 26, look: 'coupang' },
    { id: 'bank', name: '은행', art: 'bank', at: [13.8, 6.5], size: S, h: 32, look: 'bank' },
    { id: 'card', name: '카드사', art: 'card', at: [13.8, 9.5], size: S, h: 28, look: 'card' },
  ],
  links: [],
  districts: [[5.8, 5.8, 10.2, 10.2], [.6, 5, 4, 11], [4.6, .6, 11.2, 4], [4, 11, 12, 16.3], [12, 5, 15.4, 11]],
  roads: [
    { a: 'supplier', b: CO, path: [[2.2, 7.5], [2.2, 8], [6.5, 8]] }, { a: 'factory', b: CO, path: [[2.2, 8.5], [2.2, 8], [6.5, 8]] },
    { a: CO, b: 'tpl', path: [[8, 6.5], [8, 2.2], [7.7, 2.2]] }, { a: CO, b: 'home', path: [[8, 6.5], [8, 2.2], [8.6, 2.2]] },
    { a: 'smartstore', b: CO, path: [[6.6, 12.6], [8, 12.6], [8, 9.5]] }, { a: 'b2b', b: CO, path: [[9.4, 12.6], [8, 12.6], [8, 9.5]] }, { a: 'coupang', b: CO, path: [[8, 13.9], [8, 9.5]] },
    { a: 'bank', b: CO, path: [[13.8, 7.5], [13.8, 8], [9.5, 8]] }, { a: 'card', b: CO, path: [[13.8, 8.5], [13.8, 8], [9.5, 8]] },
  ],
}

/** 엔진 모듈 코드 → 부문 이름 (업무 플로우 설계의 모듈 14개) */
export const MODULE_NAME: Record<string, string> = {
  order_mgmt: '주문', sales: '영업', purchasing: '구매', import_mgmt: '수입',
  logistics: '물류', inventory: '재고', production: '생산', outsourcing: '외주',
  export_mgmt: '수출', accounting_mgmt: '회계', costing: '원가',
  hr_mgmt: '인사', attendance_mgmt: '근태', payroll_mgmt: '급여',
}
type Room = NonNullable<VPlace['room']>
const m = (id: string, at: [number, number], room: Room, sh = 16): VPlace => ({ id, name: MODULE_NAME[id], art: 'office', at, size: [3, 3], h: 20, look: 'purchase', sh, room })
/** 자사 내부: 바닥 한 장 위에 부문 자리. 업무가 흐르는 순서대로 왼쪽 위에서 오른쪽 아래로 */
const G = [1.8, 5.1, 8.4, 11.7]
export const COMPANY: Scene = {
  interior: true,
  span: 13.5,
  places: [
    m('order_mgmt', [G[0], G[0]], 'counter', 18), m('sales', [G[1], G[0]], 'desks'), m('purchasing', [G[2], G[0]], 'desk'), m('import_mgmt', [G[3], G[0]], 'desk'),
    m('logistics', [G[0], G[1]], 'belt', 12), m('inventory', [G[1], G[1]], 'boxes', 24), m('production', [G[2], G[1]], 'machine', 24), m('outsourcing', [G[3], G[1]], 'machine', 24),
    m('export_mgmt', [G[0], G[2]], 'desk'), m('accounting_mgmt', [G[1], G[2]], 'desks'), m('costing', [G[2], G[2]], 'desk'),
    m('hr_mgmt', [G[0], G[3]], 'desk'), m('attendance_mgmt', [G[1], G[3]], 'desk'), m('payroll_mgmt', [G[2], G[3]], 'desks'),
  ],
  links: [],
  wall: 12,
  decor: [{ kind: 'table', at: [10.8, 8], w: 1.8 }, { kind: 'cabinet', at: [10.2, .1], w: 3 }, { kind: 'sofa', at: [10.9, 11.2], w: 1.6 }],
}

/** 자사 안쪽으로 치는 기존 장소 → 모듈 (모듈 값이 없는 목업 데이터용) */
const INSIDE: Partial<Record<PlaceId, string>> = { sales: 'sales', ops: 'logistics', purchase: 'purchasing', acct: 'accounting_mgmt', wh: 'inventory' }

/** 1단계 지도에서 이 케이스가 지금 있는 곳: 바깥 건물이거나 자사 */
export function whereWorld(c: FlowCase): string {
  const place = stepNodes(c)[currentStep(c)].place
  return place in INSIDE ? CO : place
}
/** 2단계 지도에서 이 케이스가 지금 있는 부문. 자사 밖에 있으면 null */
export function whereModule(c: FlowCase): string | null {
  const i = currentStep(c), place = stepNodes(c)[i].place
  if (!(place in INSIDE)) return null
  const mod = c.steps[i].module
  return mod && mod in MODULE_NAME ? mod : INSIDE[place]!
}

/** 바깥 건물의 내부: 그곳에서 일어나는 노드가 자리 하나씩, 나머지는 그 건물다운 집기 */
type R = NonNullable<VPlace['room']>
interface Inside { span: number; wall?: number; rooms: [string, R, [number, number]][]; decor: DecorItem[] }
const STORE: Inside = { span: 9, rooms: [['주문', 'register', [2.4, 3.4]], ['주문 취소', 'desk', [6.2, 3.4]], ['반품 요청', 'boxes', [6.2, 6.9]]],
  decor: [{ kind: 'shelf', at: [.4, .15], w: 2.4 }, { kind: 'shelf', at: [3.2, .15], w: 2.4 }, { kind: 'shelf', at: [6, .15], w: 2.4 }, { kind: 'shelf', at: [1, 6.2], w: 2.2 }, { kind: 'shelf', at: [1, 7.5], w: 2.2 }, { kind: 'door', at: [.2, 0] }] }
const OUTSIDE: Record<string, Inside> = {
  coupang: STORE, smartstore: STORE,
  b2b: { span: 8, rooms: [['견적 요청', 'desk', [2.2, 3]], ['주문', 'desks', [5.6, 3]]],
    decor: [{ kind: 'cabinet', at: [.5, .1], w: 3 }, { kind: 'cabinet', at: [4.2, .1], w: 2.5 }, { kind: 'bench', at: [2.9, 4.7], w: 2 }, { kind: 'table', at: [2.8, 5.7], w: 2.2 }, { kind: 'bench', at: [2.9, 7.2], w: 2 }] },
  // 고객: 벽도 문도 없이 택배 둘
  home: { span: 4.4, wall: 0, rooms: [['인도', 'parcel', [1.4, 2.2]], ['반품 회수', 'parcel', [3, 2.2]]],
    decor: [] },
  tpl: { span: 10, rooms: [['3PL 출고', 'belt', [3, 4]], ['재고 이동', 'boxes', [7.4, 4]]],
    decor: [{ kind: 'shelf', at: [.5, .15], w: 2.8 }, { kind: 'shelf', at: [3.6, .15], w: 2.8 }, { kind: 'shelf', at: [6.7, .15], w: 2.8 }, { kind: 'pallet', at: [1.2, 7] }, { kind: 'pallet', at: [4.2, 7.4] }, { kind: 'pallet', at: [7.2, 7.2] }] },
  supplier: { span: 9, rooms: [['발주', 'desk', [2.4, 3.2]], ['입고', 'boxes', [6.2, 3.4]]],
    decor: [{ kind: 'cabinet', at: [.5, .1], w: 2.5 }, { kind: 'machine', at: [1.2, 6.2] }, { kind: 'pallet', at: [5.6, 6.6] }, { kind: 'shelf', at: [5, .15], w: 3 }] },
  factory: { span: 9, rooms: [['외주 작업지시', 'desk', [2.4, 3.2]], ['외주 가공품 입고', 'machine', [6.2, 3.4]]],
    decor: [{ kind: 'machine', at: [1, 6.2] }, { kind: 'machine', at: [4.6, 6.6] }, { kind: 'pallet', at: [7, .6] }, { kind: 'cabinet', at: [.5, .1], w: 2.5 }] },
  bank: { span: 8, rooms: [['입금', 'teller', [2.3, 2.9]], ['지급', 'teller', [5.4, 2.9]]],
    decor: [{ kind: 'cabinet', at: [4.6, .1], w: 2.5 }, { kind: 'cabinet', at: [.6, .1], w: 2.5 }, { kind: 'atm', at: [.2, 5] }, { kind: 'atm', at: [.2, 6.1] }, { kind: 'bench', at: [3, 6], w: 1.8 }, { kind: 'bench', at: [3, 6.9], w: 1.8 }] },
  card: { span: 7, rooms: [['카드 사용', 'desks', [3.3, 3.8]]],
    decor: [{ kind: 'rack', at: [.6, .15] }, { kind: 'rack', at: [1.6, .15] }, { kind: 'rack', at: [2.6, .15] }, { kind: 'rack', at: [3.6, .15] }, { kind: 'cabinet', at: [4.8, .1], w: 2 }, { kind: 'bench', at: [.6, 5.8], w: 1.6 }] },
}
/** 건물 하나의 내부 장면 */
export function insideScene(place: string): Scene {
  if (place === CO) return COMPANY
  const b = OUTSIDE[place]
  return { interior: true, links: [], span: b.span, wall: b.wall, decor: b.decor, places: b.rooms.map(([name, room, at]) => ({ id: `${place}:${name}`, name, art: 'office', at, size: room === 'parcel' ? [2, 1.8] : [2.8, 2.6], h: 20, look: 'purchase', sh: room === 'boxes' || room === 'machine' ? 24 : room === 'teller' ? 26 : room === 'parcel' ? 24 : 16, room })) }
}
/** 건물 안에서 이 케이스가 지금 있는 자리. 그 건물에 없으면 null */
export function whereInside(place: string, c: FlowCase): string | null {
  if (place === CO) return whereModule(c)
  if (whereWorld(c) !== place) return null
  const rooms = OUTSIDE[place]?.rooms ?? [], title = c.steps[currentStep(c)].title
  const hit = rooms.find(([name]) => name === title) ?? rooms[0]
  return hit ? `${place}:${hit[0]}` : null
}
