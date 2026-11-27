import type { BatchItem, FlowCase } from './review'

/**
 * 확인 필요 단계에 배정된 할 일.
 * 할 일 탭으로 넘기지 않고, 단계 상세에서 펼쳐 바로 O/X로 처리해요.
 * o/x: 버튼 이름. variant가 있으면 고른 쪽 시나리오로 흐름이 이어져요.
 * 담당자 이름은 샘플이에요(실제 배정 규칙은 클라이언트 자료를 받은 뒤 맞춰요).
 */
export interface TodoSpec { assignee: string; question: (item: BatchItem) => string; o: string; x: string; variantO?: number; variantX?: number }

const SPECS: Record<string, TodoSpec> = {
  u1: { assignee: '구매 담당', question: () => '가용 재고 18개를 먼저 출고할까요?', o: '18개 먼저 출고', x: '24개 확보 후 출고', variantO: 1, variantX: 2 },
  u11: { assignee: '구매 담당', question: () => '발주서 PO-SOL-001을 솔빛제조에 보낼까요?', o: '발송', x: '보류', variantO: 1 },
  u3: { assignee: '회계 담당', question: i => `${i.title} ${i.detail}. 이 금액으로 반영할까요?`, o: '반영', x: '보류' },
  u9: { assignee: '카드 사용자', question: i => `${i.title} ${i.detail.split(' ')[0]}. 경비로 기록할까요?`, o: '경비로 기록', x: '제외' },
}
const ORDER_SPEC: TodoSpec = { assignee: '주문 담당', question: () => '미등록 옵션을 무향 핸드크림 50ml로 매칭할까요?', o: '매칭', x: '보류' }

export function todoFor(flow: FlowCase): { spec: TodoSpec; items: BatchItem[] } | null {
  const items = flow.items.filter(i => i.status === '확인 필요')
  if (!items.length || !flow.steps.some(s => s.status === 'w')) return null
  return { spec: SPECS[flow.unit.id] || ORDER_SPEC, items }
}
