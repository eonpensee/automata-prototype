import type { FlowCase } from './review'

/**
 * 노드 기반 오버뷰 가안 (11/27 미팅).
 * 업무 플로우에서 보여 줄 것은 약속 노드와 사건 노드뿐. 액션 노드는 숨겨요.
 * 노드마다 그 일이 일어나는 장소(마을의 건물)를 하나 정해요.
 * 실제 노드 목록(약 111개)과 장소 묶음은 클라이언트 업무 플로우를 받으면 이 파일만 바꾸면 돼요.
 */
export type PlaceId =
  | 'coupang' | 'smartstore' | 'b2b'
  | 'sales' | 'ops' | 'purchase' | 'acct'
  | 'wh' | 'tpl' | 'home'
  | 'supplier' | 'factory'
  | 'bank' | 'card'

export type Art = 'shop' | 'office' | 'tower' | 'warehouse' | 'house' | 'factory' | 'bank' | 'card'
export type District = '판매처' | '우리 회사' | '물류' | '매입처' | '금융'

export interface Place { id: PlaceId; name: string; district: District; art: Art; at: [number, number]; size: [number, number]; h: number }

/** 마을 배치. at = 땅 격자 좌표(가운데), size = 바닥 칸 수, h = 높이(px) */
export const PLACES: Place[] = [
  { id: 'coupang', name: '쿠팡', district: '판매처', art: 'shop', at: [1.6, 1.6], size: [2, 2], h: 26 },
  { id: 'smartstore', name: '스마트스토어', district: '판매처', art: 'shop', at: [1.6, 5.4], size: [2, 2], h: 26 },
  { id: 'b2b', name: '거래처', district: '판매처', art: 'office', at: [5.4, 1.6], size: [2, 2], h: 34 },

  { id: 'sales', name: '영업', district: '우리 회사', art: 'tower', at: [10.4, 1.6], size: [2, 2], h: 62 },
  { id: 'ops', name: '운영', district: '우리 회사', art: 'tower', at: [10.4, 5.4], size: [2, 2], h: 54 },
  { id: 'purchase', name: '구매', district: '우리 회사', art: 'tower', at: [14.2, 1.6], size: [2, 2], h: 46 },
  { id: 'acct', name: '회계', district: '우리 회사', art: 'tower', at: [14.2, 5.4], size: [2, 2], h: 50 },

  { id: 'wh', name: '자사 창고', district: '물류', art: 'warehouse', at: [5.6, 10.4], size: [2.6, 2], h: 34 },
  { id: 'tpl', name: '3PL 창고', district: '물류', art: 'warehouse', at: [1.7, 10.4], size: [2.6, 2], h: 30 },
  { id: 'home', name: '고객', district: '물류', art: 'house', at: [1.6, 14.2], size: [2, 2], h: 22 },

  { id: 'supplier', name: '매입처', district: '매입처', art: 'factory', at: [10.4, 10.4], size: [2, 2], h: 34 },
  { id: 'factory', name: '외주 생산', district: '매입처', art: 'factory', at: [10.4, 14.2], size: [2, 2], h: 30 },

  { id: 'bank', name: '은행', district: '금융', art: 'bank', at: [14.4, 10.4], size: [2, 2], h: 32 },
  { id: 'card', name: '카드사', district: '금융', art: 'card', at: [14.4, 14.2], size: [2, 2], h: 28 },
]

export type NodeKind = '약속' | '사건'
export interface FlowNode { id: string; name: string; kind: NodeKind; place: PlaceId }

export const NODES: Record<string, FlowNode> = {
  'order-cp': { id: 'order-cp', name: '주문', kind: '약속', place: 'coupang' },
  'order-ss': { id: 'order-ss', name: '주문', kind: '약속', place: 'smartstore' },
  'order-b2b': { id: 'order-b2b', name: '주문', kind: '약속', place: 'b2b' },
  quote: { id: 'quote', name: '견적', kind: '약속', place: 'sales' },
  so: { id: 'so', name: '수주', kind: '약속', place: 'sales' },
  shipreq: { id: 'shipreq', name: '출하 지시', kind: '약속', place: 'ops' },
  ship: { id: 'ship', name: '출고', kind: '사건', place: 'wh' },
  receive: { id: 'receive', name: '입고', kind: '사건', place: 'wh' },
  pickup: { id: 'pickup', name: '회수', kind: '사건', place: 'wh' },
  deliver: { id: 'deliver', name: '인도', kind: '사건', place: 'home' },
  pr: { id: 'pr', name: '구매 요청', kind: '약속', place: 'purchase' },
  po: { id: 'po', name: '발주', kind: '약속', place: 'supplier' },
  supply: { id: 'supply', name: '납품', kind: '사건', place: 'supplier' },
  voucher: { id: 'voucher', name: '전표', kind: '사건', place: 'acct' },
  deposit: { id: 'deposit', name: '입금', kind: '사건', place: 'bank' },
  cardUse: { id: 'cardUse', name: '카드 사용', kind: '사건', place: 'card' },
}

/** 지금 샘플 케이스의 단계 → 노드 (가안) */
const STEP_NODES: Record<string, string[]> = {
  u12: ['so', 'so', 'shipreq'],
  u1: ['order-b2b', 'shipreq', 'shipreq', 'ship'],
  u2: ['order-cp', 'so', 'so', 'ship', 'deliver'],
  u8: ['order-cp', 'so', 'so', 'ship', 'deliver'],
  u5: ['order-ss', 'so', 'so', 'ship', 'deliver'],
  u3: ['deposit', 'voucher', 'voucher', 'deposit'],
  u4: ['order-b2b', 'so', 'ship', 'deliver', 'deposit'],
  u7: ['pickup', 'pickup', 'receive'],
  u9: ['cardUse', 'voucher', 'voucher', 'cardUse'],
  u11: ['pr', 'pr', 'po', 'supply', 'pr'],
}

export const stepNodes = (c: FlowCase): FlowNode[] => (STEP_NODES[c.unit.id] || c.steps.map(() => 'so')).map(id => NODES[id])

/** 케이스가 지금 머무는 단계 번호 */
export function currentStep(c: FlowCase): number {
  const i = c.steps.findIndex(s => s.status === 'w' || s.status === 'c' || s.status === 'q' || s.status === 'n')
  return i < 0 ? c.steps.length - 1 : i
}
export const currentNode = (c: FlowCase): FlowNode => stepNodes(c)[currentStep(c)]
/** 오늘 이 케이스가 거쳐 간(또는 지금 있는) 장소 */
export const touchedPlaces = (c: FlowCase): PlaceId[] => [...new Set(stepNodes(c).filter((_, i) => c.steps[i].status !== 'n').map(n => n.place))]
