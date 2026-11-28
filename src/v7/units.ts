// 처리 단위: 외부에서 한 번 들어온 자료 (브리프 11/23).
// 판매처 조회, 은행 수집, 카드 수집은 같은 시각의 한 번이 한 단위(안에 여러 건), 메일과 직원 입력은 한 건이 한 단위예요.
import type { FlowCase } from '../data/review'
import type { ResultId, SourceId, Status } from '../data/today'
import { RANK } from '../logic'

export interface ProcUnit { id: string; time: string; source: SourceId; title: string; sub: string; cases: FlowCase[]; st: Status; done: number; results: string }

const BATCH: SourceId[] = ['ss', 'cp', 'bank', 'card']
export const SOURCE_TITLE: Record<SourceId, string> = { mail: '거래처 메일', ss: '스마트스토어 주문 수집', cp: '쿠팡 주문 수집', bank: '은행 내역 수집', card: '카드 사용 내역 수집', manual: '직원 직접 입력', chk: '자동 점검' }
const RESULT_NAME: Record<ResultId, string> = { so: '수주', ship: '출고 요청', exp: '경비 전표', ar: '채권 정리', pay: '지급', inv: '재고 반영', po: '발주서', mail: '발송 메일' }

/** 결과 합계 문구 (예: 경비 전표 2건, 지급 2건) */
export function resultLine(cases: FlowCase[]): string {
  const sum = new Map<ResultId, number>()
  for (const c of cases) for (const o of c.outputs) sum.set(o.type, (sum.get(o.type) ?? 0) + o.count)
  return [...sum].map(([k, n]) => `${RESULT_NAME[k]} ${k === 'inv' ? '+' : ''}${n}${k === 'inv' ? '개' : '건'}`).join(', ')
}

export function groupUnits(cases: FlowCase[]): ProcUnit[] {
  const map = new Map<string, FlowCase[]>()
  for (const c of cases) {
    const key = BATCH.includes(c.unit.g) ? `${c.unit.g}@${c.unit.t}` : c.unit.id
    map.set(key, [...(map.get(key) ?? []), c])
  }
  return [...map].map(([id, cs]) => {
    const first = cs[0], batch = BATCH.includes(first.unit.g)
    const st = cs.reduce<Status>((w, c) => RANK[c.unit.st] > RANK[w] ? c.unit.st : w, '완료')
    const names = cs.map(c => c.unit.name)
    return {
      id, time: first.unit.t, source: first.unit.g, cases: cs, st,
      title: batch ? SOURCE_TITLE[first.unit.g] : first.unit.name,
      sub: batch ? `${cs.length}건  ${names.slice(0, 2).join(', ')}${cs.length > 2 ? ` 외 ${cs.length - 2}건` : ''}` : first.unit.qsub,
      done: cs.filter(c => c.unit.st === '완료').length,
      results: resultLine(cs),
    }
  }).sort((a, b) => b.time.localeCompare(a.time))
}
