import type { SourceId, Status, Unit, ZoneId } from './data/today'

/** 화면 필터: 전체, 출처, 상태, 거래 상대 */
export type Filter = 'all' | SourceId | `st:${Status}` | `z:${ZoneId}`

export const BADGE: Record<Status, string> = {
  '확인 필요': 'badge st-flag',
  '대기 중': 'badge st-wait',
  '진행 중': 'badge st-run',
  '완료': 'badge st-done',
}
export const STEPC = { d: 'd', c: 'c', w: 'w', q: 'w', n: '' } as const
export const RANK: Record<Status, number> = { '확인 필요': 4, '대기 중': 3, '진행 중': 2, '완료': 1 }
export const ZCLS: Record<Status, string> = { '확인 필요': 'zc f', '대기 중': 'zc w', '진행 중': 'zc', '완료': 'zc' }

export function match(u: Unit, f: Filter): boolean {
  if (f === 'all') return true
  if (f.startsWith('st:')) return u.st === f.slice(3)
  if (f.startsWith('z:')) return u.z === f.slice(2)
  return u.g === f
}

/** 같은 필터를 다시 누르면 전체로 */
export const toggle = (cur: Filter, next: Filter): Filter => (cur === next ? 'all' : next)
