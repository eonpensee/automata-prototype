import { UNITS, type Unit, type Status, type StepCode, type Source, type Result, type ResultId, type ZoneId } from './today'

export interface Evidence { id: string; title: string; kind: 'input' | 'output' | 'session' | 'decision'; body: string; columns?: string[]; rows?: string[][] }
export interface FlowStep { title: string; actor: string; zone: ZoneId; status: StepCode; time: string; summary: string; evidence: string[]; /** 엔진 노드 종류: 약속(promise) 또는 사건(event) */ kind?: 'promise' | 'event' }
export interface BatchItem { id: string; title: string; detail: string; status: Status; evidence: string }
export interface Output { type: ResultId; count: number; detail: string }
export interface FlowCase { unit: Unit; steps: FlowStep[]; items: BatchItem[]; evidence: Evidence[]; outputs: Output[]; variants: string[]; variant: number; eventLog: { time: string; text: string }[]
  /** 엔진에서 뽑은 케이스: 단계별 마을 노드, 엔진 케이스 번호, 로컬 웹의 승인 요청 링크 */
  nodes?: string[]; engineCaseId?: number; approval?: { href: string; label: string } | null
  /** 제품의 멈춘 지점 문구, 업무 플로우 이름, 들어온 자료(근거 id) */
  stuck?: string | null; flowName?: string | null; inputs?: string[] }
/** Existing approval destinations documented in the automata design brief. */
export const APPROVAL_REQUESTS: Partial<Record<string, { href: string; label: string }>> = {
  u1: { href: 'https://automata-web-staging.vercel.app/todo/all?open=3', label: '승인 요청 열기' },
  u11: { href: 'https://automata-web-staging.vercel.app/todo/all', label: '승인 요청 목록' },
}
export type VariantState = Record<string, number>
const statusName = (s: StepCode): Status => s === 'd' ? '완료' : s === 'w' ? '확인 필요' : s === 'c' ? '진행 중' : '대기 중'
const step = (title: string, actor: string, zone: ZoneId, status: StepCode, time: string, summary: string, evidence: string[] = []): FlowStep => ({ title, actor, zone, status, time, summary, evidence })
const doc = (id: string, title: string, kind: Evidence['kind'], body: string, columns?: string[], rows?: string[][]): Evidence => ({ id, title, kind, body, columns, rows })
const seed = (id: string, patch: Partial<Unit> = {}): Unit => ({ ...UNITS.find(u => u.id === id)!, ...patch })
function finish(unit: Unit, steps: FlowStep[], items: BatchItem[], evidence: Evidence[], outputs: Output[], variants: string[] = [], variant = 0): FlowCase {
  const done = steps.filter(s => s.status === 'd').length
  const current = steps.find(s => s.status === 'w') || steps.find(s => s.status !== 'd')
  const state: Status = steps.some(s => s.status === 'w') ? '확인 필요' : steps.some(s => s.status === 'c') ? '진행 중' : done === steps.length ? '완료' : '대기 중'
  const sessions = steps.flatMap((s, i) => s.status === 'n' ? [] : [doc(`session-${i}`, `${s.title} 에이전트 세션`, 'session', `${s.time || '예정'} ${s.actor}\n${s.summary}\n현재 상태: ${statusName(s.status)}\n참조 자료: ${s.evidence.map(id => evidence.find(e => e.id === id)?.title).filter(Boolean).join(', ') || '처리 단위 내 입력 자료'}\n이 세션은 흐름 검토를 위한 샘플 기록입니다.`)])
  return { unit: { ...unit, z: (current || steps[steps.length - 1]).zone, s: steps.map(s => s.status), st: state, stepLabel: `${done}/${steps.length} 완료` }, steps, items, evidence: [...evidence, ...sessions], outputs, variants, variant, eventLog: steps.filter(s => s.time && s.status !== 'n').map(s => ({ time: s.time, text: `${s.title} ${s.summary}` })) }
}

function bank(v: number): FlowCase {
  const mismatch = v === 1
  const records = [
    ['IN-001', '달빛스토어 입금', '320,000원', '320,000원', '일치'],
    ['IN-002', '온유마켓 입금', '180,000원', '180,000원', '일치'],
    ['IN-003', '봄상점 입금', '450,000원', '450,000원', '일치'],
    ['IN-004', '그린스토어 입금', '210,000원', '210,000원', '일치'],
    ['IN-005', '바다상점 입금', '980,000원', '960,000원', '20,000원 부족'],
    ['OUT-001', '솔빛제조 출금', '540,000원', mismatch ? '520,000원' : '540,000원', mismatch ? '20,000원 부족' : '일치'],
  ]
  const evidence = [doc('bank-input', '은행 수집 내역 입금 5건 / 출금 1건', 'input', '10:00 수집 1회 아래 입금과 출금은 하나의 수집 묶음입니다.', ['거래 번호', '거래처', '예정액', '실제 금액', '대사 결과'], records), doc('bank-output', '대사 결과와 ERP 반영', 'output', `입금 4건 채권 정리 ${mismatch ? '출금 지급 기록 보류' : '출금 1건 지급 기록, 미지급 잔액 540,000원 감소'}\n바다상점 입금 차액 20,000원은 확인 대기입니다.`)]
  const items: BatchItem[] = records.map((r, i) => {
    const pending = i === 4 || (i === 5 && mismatch)
    evidence.push(doc(r[0], `${r[1]} 원문 대조`, 'input', '같은 거래의 정산서 또는 지급 예정 내역과 통장 기록을 비교합니다.', ['항목', '정산서 / 지급 예정', '통장 수집 내역'], [['거래처', r[1], r[1]], ['금액', r[2], r[3]], ['대사 결과', r[4], pending ? '담당자 확인 대기' : 'ERP 반영 완료']]))
    return { id: r[0], title: r[1], detail: `${r[3]} ${r[4]}`, status: pending ? '확인 필요' : '완료', evidence: r[0] }
  })
  return finish(seed('u3', { name: '은행 입출금 내역', qty: '거래 6건', qsub: '입금 5건 출금 1건 / 수집 1회', now: `${mismatch ? '4건 완료 2건 확인 필요' : '5건 완료 입금 1건 확인 필요'}` }), [step('입출금 수집', '은행', 'bank', 'd', '10:00', '입금 5건과 출금 1건을 한 번에 수집했어요.', ['bank-input']), step('정산서 지급 예정액 대사', 'automata', 'hq', 'd', '10:01', '각 거래의 예정액과 실제 금액을 비교했어요.', ['bank-input']), step('일치 건 ERP 반영', 'automata', 'hq', 'd', '10:01', mismatch ? '일치한 입금 4건의 채권을 정리했어요.' : '입금 4건 채권 정리, 출금 1건 지급을 기록했어요.', ['bank-output']), step('차액 확인', '회계 담당', 'bank', 'w', '10:01', mismatch ? '입금 1건과 출금 1건의 차액 확인이 필요해요.' : '바다상점 입금 1건의 차액 2만 원을 확인해 주세요.', ['IN-005', ...(mismatch ? ['OUT-001'] : [])])], items, evidence, [{ type: 'ar', count: 4, detail: '입금 5건 중 4건 일치' }, ...(!mismatch ? [{ type: 'pay' as ResultId, count: 1, detail: '솔빛제조 54만 원 미지급 잔액 반영' }] : [])], ['입금 차액 출금 일치', '입금 출금 모두 차액'], v)
}

function cards(): FlowCase {
  const evidence = [doc('card-input', '법인카드 사용 내역.csv', 'input', '어제 사용한 32건을 07:00에 수집한 샘플 자료입니다.'), doc('card-output', '경비 전표 30건', 'output', '확인된 사용 내역 30건만 전표로 기록했습니다. 확인 대기 2건은 제외했습니다.')]
  const items: BatchItem[] = Array.from({ length: 32 }, (_, i) => {
    const pending = i >= 30
    const id = `CARD-${String(i + 1).padStart(3, '0')}`
    const name = pending ? ['온라인 결제대행', '종합몰 결제'][i - 30] : i % 2 ? '회의 식대' : '택배 운임'
    const amount = pending ? ['78,000원', '124,000원'][i - 30] : `${(i % 2 ? 24000 : 3500).toLocaleString('ko-KR')}원`
    evidence.push(doc(id, `${id} ${name}`, 'input', `가맹점: ${name}\n사용 금액: ${amount}\n${pending ? '가맹점 이름만으로 용도를 알 수 없습니다. 영수증 사용 목적 확인이 필요합니다.\n담당: 카드 사용자 / 회계 담당' : `분류 계정: ${i % 2 ? '복리후생비' : '운반비'}\n생성 전표: EXP-${String(i + 1).padStart(3, '0')}`} `))
    return { id, title: name, detail: `${amount} ${pending ? '용도 확인 대기' : i % 2 ? '복리후생비' : '운반비'}`, status: pending ? '확인 필요' : '완료', evidence: id }
  })
  evidence[0].columns = ['사용 번호', '가맹점 / 내용', '금액 및 분류', '상태']; evidence[0].rows = items.map(i => [i.id, i.title, i.detail, i.status])
  return finish(seed('u9'), [step('카드 내역 수집', '카드사', 'card', 'd', '07:00', '어제 사용한 32건을 수집했어요.', ['card-input']), step('계정 분류', 'automata', 'hq', 'd', '07:01', '30건의 계정을 분류하고 용도가 불분명한 2건을 분리했어요.', ['card-input']), step('경비 전표 기록', 'automata', 'hq', 'd', '07:02', '분류된 30건만 전표로 기록했어요.', ['card-output']), step('사용 목적 확인', '카드 사용자', 'card', 'w', '07:02', '아래 2건의 영수증과 사용 목적을 확인해 주세요.', ['CARD-031', 'CARD-032'])], items, evidence, [{ type: 'exp', count: 30, detail: '32건 중 30건 기록 2건 확인 대기' }])
}

function orders(id: 'u2' | 'u8' | 'u5', v: number): FlowCase {
  const u = seed(id), n = id === 'u2' ? 100 : id === 'u8' ? 64 : 38, pending = v === 1 ? 3 : 0
  const evidence = [doc('orders-input', `${u.kind} 주문 수집.csv`, 'input', `${u.t} 수집 1회 주문 ${n}건. 개별 주문번호 옵션 수량을 확인할 수 있습니다.`), doc('orders-output', `수주 등록 ${n - pending}건`, 'output', `매칭된 ${n - pending}건의 수주가 등록됐습니다.${pending ? ' 매칭되지 않은 3건은 수주 등록에서 제외됐습니다.' : ''}`), doc('ship-request', '창고 출고 요청', 'output', `온유물류 중앙창고에 ${n - pending}건의 출고를 요청했습니다.`)]
  const items: BatchItem[] = Array.from({ length: n }, (_, i) => {
    const hold = i >= n - pending, key = `${id.toUpperCase()}-${String(i + 1).padStart(3, '0')}`
    evidence.push(doc(key, `${key} 주문 상세`, 'input', `주문번호: ${key}\n판매처: ${u.kind}\n주문 옵션: ${hold ? '옵션 코드 미등록' : '무향 50ml'}\n수량: ${i % 3 + 1}개\n${hold ? '사내 상품을 찾지 못해 매칭 확인이 필요합니다.' : `사내 상품: 무향 핸드크림 50ml\n수주번호: SO-${key}\n${id === 'u5' ? '창고에 요청 완료 회신 대기' : '오후 3시 일괄 출고 요청 예정'}`}`))
    return { id: key, title: hold ? '옵션 매칭 확인' : '무향 핸드크림 50ml', detail: `${i % 3 + 1}개 ${hold ? '등록 보류' : '수주 등록 완료'}`, status: hold ? '확인 필요' : id === 'u5' ? '진행 중' : '대기 중', evidence: key }
  })
  evidence[0].columns = ['주문번호', '상품 / 옵션', '수량 및 결과', '상태']; evidence[0].rows = items.map(i => [i.id, i.title, i.detail, i.status])
  return finish({ ...u, now: pending ? `${n - pending}건 등록 3건 옵션 확인 필요` : u.now, qsub: `${n - pending}건 수주 등록${pending ? ' 3건 보류' : ''}` }, [step('주문 수집', u.kind, 'shop', 'd', u.t, `조회 1회에 주문 ${n}건이 들어왔어요.`, ['orders-input']), step('옵션 매칭', 'automata', 'hq', pending ? 'w' : 'd', u.t, pending ? '미등록 옵션 3건은 담당자 확인이 필요해요.' : `${n}건 모두 사내 상품과 연결했어요.`, ['orders-input']), step('수주 등록', 'automata', 'hq', 'd', u.t, `${n - pending}건을 등록했어요.`, ['orders-output']), step('출고 요청 창고 회신', '창고', 'wh', id === 'u5' ? 'c' : 'q', id === 'u5' ? '09:01' : '', id === 'u5' ? '출고 요청 후 창고 회신을 기다려요.' : '오후 3시에 등록된 주문을 일괄 요청해요.', id === 'u5' ? ['ship-request'] : []), step('송장 전달', '판매처', 'shop', 'n', '', '출고가 확인되면 판매처에 송장을 전달해요.')], items, evidence, [{ type: 'so', count: n - pending, detail: `${u.kind} ${n - pending}건` }, ...(id === 'u5' ? [{ type: 'ship' as ResultId, count: n - pending, detail: '중앙창고 회신 대기' }] : [])], ['정상 매칭', '3건 옵션 확인 필요'], v)
}

function sea(v: number): FlowCase {
  const delivered = v >= 1, settled = v === 2
  const evidence = [doc('mail', '바다상점 주문 메일 원문', 'input', '보낸 사람: 바다상점 구매 담당\n받은 시각: 09:10\n제목: 무향 핸드크림 주문 요청\n\n금요일까지 무향 핸드크림 24개를 보내 주세요. 주문서를 첨부합니다.'), doc('attachment', '바다상점 주문서.xlsx 첨부', 'input', '원문 주문서의 표기와 등록된 상품을 비교합니다.', ['주문서 표기', '매칭 상품', '주문 수량', '가용 재고'], [['무향 50ml', '무향 핸드크림 50ml', '24개', '40개']]), doc('so', '수주 SO-BADA-001', 'output', '바다상점 무향 핸드크림 50ml 24개\n09:11 등록'), doc('request', '출고 요청 메일 발송본', 'output', '받는 곳: 온유물류 중앙창고\n09:11 발송\n무향 핸드크림 50ml 24개를 바다상점으로 출고해 주세요.'), doc('reply', '창고 회신 송장 첨부', 'input', '14:00 회신\n실제 출고: 24개\n송장번호: DEMO-BADA-001'), doc('tracking', '판매처 송장 전달 발송본', 'output', '14:01 바다상점에 발송\n주문 SO-BADA-001의 24개가 출고되었습니다.\n송장번호: DEMO-BADA-001'), doc('settle', '바다상점 정산 결과', 'output', '정산서와 입금 내역이 일치하여 채권 정리를 완료했습니다. (완료 상태 예시)')]
  return finish(seed('u4', { now: settled ? '송장 전달과 정산 대조까지 완료했어요' : delivered ? '24개 출고 송장 전달 완료, 정산 수집 대기' : '온유물류 중앙창고 회신을 기다려요', z: settled ? 'bank' : delivered ? 'shop' : 'wh' }), [step('주문 확인', '바다상점', 'shop', 'd', '09:10', '무향 50ml를 사내 상품과 매칭하고 재고 40개를 확인했어요.', ['mail', 'attachment']), step('수주 등록 출고 요청', 'automata', 'hq', 'd', '09:11', '24개를 등록하고 중앙창고에 요청했어요.', ['so', 'request']), step('창고 출고 회신', '창고', 'wh', delivered ? 'd' : 'c', delivered ? '14:00' : '', delivered ? '24개 출고와 송장번호를 받았어요.' : '실제 출고 수량과 송장번호를 기다려요.', delivered ? ['reply'] : []), step('판매처 송장 전달', '바다상점', 'shop', delivered ? 'd' : 'n', delivered ? '14:01' : '', delivered ? '판매처에 송장을 전달했어요.' : '창고 회신을 받은 뒤 송장을 전달해요.', delivered ? ['tracking'] : []), step('정산 대조', '은행', 'bank', settled ? 'd' : delivered ? 'q' : 'n', settled ? '16:00' : '', settled ? '정산서와 입금액을 대조해 채권을 정리했어요.' : '정산서와 입금 내역 수집을 기다려요.', settled ? ['settle'] : [])], [{ id: 'SO-BADA-001', title: '무향 핸드크림 24개', detail: settled ? '출고 송장 정산 완료' : delivered ? '출고 24개 송장 전달 완료' : '출고 요청 24개 창고 회신 대기', status: settled ? '완료' : delivered ? '대기 중' : '진행 중', evidence: delivered ? 'tracking' : 'attachment' }], evidence, [{ type: 'so', count: 1, detail: '바다상점 수주 24개' }, { type: 'ship', count: 1, detail: '바다상점 출고 요청' }, { type: 'mail', count: delivered ? 2 : 1, detail: delivered ? '출고 요청 송장 전달' : '출고 요청 메일' }, ...(settled ? [{ type: 'ar' as ResultId, count: 1, detail: '바다상점 정산 완료' }] : [])], ['창고 회신 대기', '송장 전달 완료', '정산까지 완료'], v)
}

function shortage(v: number): FlowCase {
  const partial = v === 1, hold = v === 2
  const evidence = [doc('order', '달빛스토어 주문서', 'input', '시트러스 핸드크림 24개 주문\n현재 가용 재고 18개 부족 수량 6개'), doc('decision', '할 일에서 남긴 결정 기록', 'decision', partial ? '10:20 구매 담당 김담당\n결정: 18개 먼저 출고\n이유: 고객과 부분 출고 일정 합의\n나머지 6개는 같은 주문에 미출고 수량으로 유지합니다.' : hold ? '10:20 구매 담당 김담당\n결정: 전량 입고 후 출고\n이유: 고객이 한 번에 수령하기를 요청함\n24개 확보 전에는 출고 요청을 보내지 않습니다.' : '아직 결정되지 않았습니다. 할 일에서 담당자 확인이 필요합니다.'), doc('partial', '부분 출고 요청 18개', 'output', '원 주문: 24개\n창고에 요청한 수량: 18개\n미출고 수량: 6개\n담당자 결정에 따라 같은 주문에서 분할 처리합니다.')]
  return finish(seed('u1', { now: partial ? '18개 출고 요청 미출고 6개 입고 대기' : hold ? '전량 24개 확보 후 출고하도록 결정했어요' : '재고 18개라 6개가 부족해요' }), [step('주문 재고 확인', 'automata', 'hq', 'd', '10:10', '24개 주문에 재고가 18개라 6개가 부족해요.', ['order']), step('출고 방법 확인', '담당자', 'hq', v ? 'd' : 'w', v ? '10:20' : '10:10', v ? '할 일에서 남긴 결정을 가져왔어요.' : '부분 출고 또는 전량 확보 후 출고 결정을 기다려요.', ['decision']), step('출고 요청', '창고', 'wh', partial ? 'd' : hold ? 'q' : 'n', partial ? '10:21' : '', partial ? '18개를 창고에 출고 요청했어요.' : '전량 확보 전에는 요청하지 않아요.', partial ? ['partial'] : []), step('잔여 수량 처리', '창고', 'wh', v ? 'q' : 'n', '', partial ? '미출고 6개를 같은 주문에서 이어서 처리해요.' : '24개가 확보되면 출고를 시작해요.')], [{ id: 'MOON-001', title: '시트러스 핸드크림 24개', detail: partial ? '18개 요청 / 6개 미출고' : hold ? '24개 전량 입고 대기' : '18개 가용 / 6개 부족', status: v ? '대기 중' : '확인 필요', evidence: v ? 'decision' : 'order' }], evidence, partial ? [{ type: 'so', count: 1, detail: '원 주문 24개 미출고 6개 유지' }, { type: 'ship', count: 1, detail: '부분 출고 18개' }, { type: 'mail', count: 1, detail: '부분 출고 요청' }] : [], ['결정 대기', '18개 먼저 출고', '전량 입고 대기'], v)
}

function purchase(v: number): FlowCase {
  const evidence = [doc('stock', '재고 점검 결과', 'input', '06:00 정기 실행\n시트러스 핸드크림 50ml의 예상 판매량과 재고를 대조해 발주서 초안을 준비했습니다.'), doc('approval', '구매 승인 기록', 'decision', v ? '06:20 구매 담당 승인 완료\n발주서 PO-SOL-001 발송 승인 (샘플 기록)' : '구매 담당 확인을 기다립니다. 이 화면에서는 승인 거절하지 않습니다.'), doc('po', '발주서 PO-SOL-001', 'output', v ? '06:21 솔빛제조에 발송\n상품: 시트러스 핸드크림 50ml\n발주 수량: 50개 (샘플)' : '구매 승인 전 초안입니다. 아직 발송하지 않았습니다.'), doc('delivery', '솔빛제조 납품일 회신', 'input', '08:00 회신\n예정 납품일: 11월 30일\n일정에 반영했습니다.')]
  return finish(seed('u11', { now: v === 2 ? '납품 예정일을 발주 일정에 반영했어요' : v === 1 ? '발주서 발송 완료 납품일 회신 대기' : '구매 담당 승인을 기다려요' }), [step('예상 판매량 재고 대조', 'automata', 'hq', 'd', '06:00', '부족 수량을 계산하고 발주서 초안을 준비했어요.', ['stock', 'po']), step('구매 승인 확인', '구매 담당', 'hq', v ? 'd' : 'w', v ? '06:20' : '', v ? '할 일의 승인 기록을 확인했어요.' : '할 일에서 구매 담당자의 승인을 기다려요.', ['approval']), step('발주서 발송', '매입처', 'sup', v ? 'd' : 'n', v ? '06:21' : '', v ? '솔빛제조에 발주서를 발송했어요.' : '승인 후 발주서를 발송해요.', v ? ['po'] : []), step('납품 예정일 회신', '매입처', 'sup', v === 2 ? 'd' : v === 1 ? 'c' : 'n', v === 2 ? '08:00' : '', v === 2 ? '11월 30일 납품 예정 회신을 받았어요.' : '매입처의 납품일 회신을 기다려요.', v === 2 ? ['delivery'] : []), step('발주 일정 반영', 'automata', 'hq', v === 2 ? 'd' : 'n', v === 2 ? '08:01' : '', '회신받은 납품일을 발주 일정에 반영해요.', v === 2 ? ['delivery'] : [])], [{ id: 'PO-SOL-001', title: '솔빛제조 발주', detail: v === 2 ? '11/30 납품 예정' : v === 1 ? '발송 완료 / 회신 대기' : '초안 / 구매 승인 대기', status: v === 2 ? '완료' : v === 1 ? '진행 중' : '확인 필요', evidence: 'po' }], evidence, v ? [{ type: 'po', count: 1, detail: '솔빛제조 발주서 발송' }, { type: 'mail', count: 1, detail: '발주서 발송 메일' }] : [], ['구매 승인 대기', '납품일 회신 대기', '일정 반영 완료'], v)
}

function returns(): FlowCase {
  const evidence = [doc('inspection', '온유물류 반품 검수 회신', 'input', '08:20 회신 반품 3개\n정상 2개는 판매 가능 재고에 반영하고 파손 1개는 분리했습니다.', ['검수 번호', '판정', '처리 결과'], [['RET-001', '정상', '판매 가능 재고 +1'], ['RET-002', '정상', '판매 가능 재고 +1'], ['RET-003', '파손', '판매 가능 재고 제외 / 파손 기록']]), doc('inventory', '재고 반영 내역', 'output', '판매 가능 재고 +2개\n파손 1개 별도 상태 기록')]
  return finish(seed('u7'), [step('반품 도착', '창고', 'wh', 'd', '08:00', '반품 3개가 도착했어요.', ['inspection']), step('검수 결과 수신', '창고', 'wh', 'd', '08:20', '정상 2개와 파손 1개로 구분했어요.', ['inspection']), step('재고 파손 상태 반영', 'automata', 'hq', 'd', '08:21', '정상 2개만 판매 가능 재고에 반영했어요.', ['inventory'])], Array.from({ length: 3 }, (_, i) => ({ id: `RET-00${i + 1}`, title: i === 2 ? '파손 상품' : '정상 상품', detail: i === 2 ? '재고 제외 파손 기록' : '판매 가능 재고 +1', status: '완료' as Status, evidence: 'inspection' })), evidence, [{ type: 'inv', count: 2, detail: '정상 2개 반영 파손 1개 제외' }])
}
function manual(): FlowCase {
  const u: Unit = { ...seed('u4'), id: 'u12', g: 'manual', t: '11:00', kind: '직원 직접 전달', name: '직원이 전달한 주문 파일', qty: '주문 2건', qsub: '샘플 주문서.xlsx', now: '2건 수주 등록 오후 출고 요청 대기', z: 'hq' }
  const evidence = [doc('upload', '샘플 주문서.xlsx', 'input', '11:00 영업 담당자가 에이전트에 전달한 파일입니다.', ['주문번호', '상품', '수량'], [['DIRECT-001', '무향 핸드크림 50ml', '10개'], ['DIRECT-002', '시트러스 핸드크림 50ml', '6개']]), doc('direct-output', '직접 전달 주문 수주 등록', 'output', 'DIRECT-001, DIRECT-002의 수주 등록을 완료했습니다.')]
  return finish(u, [step('직원 자료 전달', '영업 담당', 'hq', 'd', '11:00', '에이전트에 주문 파일을 직접 전달했어요.', ['upload']), step('상품 매칭 수주 등록', 'automata', 'hq', 'd', '11:01', '2건을 확인하고 수주로 등록했어요.', ['direct-output']), step('출고 요청', '창고', 'wh', 'q', '', '오후 일괄 출고 요청을 기다려요.')], ['DIRECT-001', 'DIRECT-002'].map(id => ({ id, title: '직접 전달 주문', detail: '수주 등록 완료 출고 요청 대기', status: '대기 중', evidence: 'upload' })), evidence, [{ type: 'so', count: 2, detail: '직원 직접 전달 주문' }])
}

export function createCases(v: VariantState = {}): FlowCase[] {
  return [manual(), shortage(v.u1 || 0), orders('u2', v.u2 || 0), bank(v.u3 || 0), sea(v.u4 || 0), orders('u5', v.u5 || 0), returns(), cards(), orders('u8', v.u8 || 0), purchase(v.u11 || 0)]
}
export const sourceGroup = (id: string) => id === 'chk' ? '내부 자동 실행' : id === 'manual' ? '직접 전달' : '외부에서 받은 자료'
export function sourcesFor(cases: FlowCase[]): Source[] {
  const names: [Source['id'], string, Source['icon'], string][] = [['mail', '거래처 메일', 'mail', '10분마다 확인'], ['cp', '쿠팡', 'shop', '3시간마다 조회'], ['ss', '스마트스토어', 'shop', '하루 1번 조회'], ['bank', '은행', 'bank', '하루 1번 수집'], ['card', '카드사', 'card', '하루 1번 수집'], ['manual', '직원 자료', 'upload', '직접 전달'], ['chk', '재고 점검', 'check', '하루 1번 실행']]
  return names.filter(([id]) => cases.some(c => c.unit.g === id)).map(([id, name, icon, cadence]) => { const a = cases.filter(c => c.unit.g === id); return { id, name, icon, cadence, count: `${a.length}${id === 'mail' ? '통' : '회'}`, latest: a.length ? `${a[0].unit.t} ${a[0].unit.qty}` : '자료 없음' } })
}
const RESULT_NAMES: Record<ResultId, string> = { so: '수주 등록', ship: '출고 요청', exp: '경비 전표', ar: '채권 정리', pay: '지급 기록', inv: '재고 반영', po: '발주서 발송', mail: '발송 메일' }
export function resultsFor(cases: FlowCase[]): Result[] {
  return (Object.keys(RESULT_NAMES) as ResultId[]).map(id => {
    const rows = cases.flatMap(c => c.outputs.filter(o => o.type === id).map(o => ({ t: c.unit.t, name: c.unit.name, sub: o.detail, n: `${o.count}${id === 'inv' ? '개' : '건'}`, unitId: c.unit.id })))
    const total = cases.reduce((n, c) => n + c.outputs.filter(o => o.type === id).reduce((sum, o) => sum + o.count, 0), 0)
    return { id, title: RESULT_NAMES[id], n: `${id === 'inv' ? '+' : ''}${total}${id === 'inv' ? '개' : '건'}`, sub: rows.length ? `처리 단위 ${rows.length}개에서 생성` : '아직 생성된 결과 없음', rows }
  })
}

export const REVIEW_DATES = [
  { id: '2026-11-24', label: '11월 24일 화요일' },
  { id: '2026-11-25', label: '11월 25일 수요일' },
  { id: '2026-11-26', label: '11월 26일 목요일' },
] as const

/** Three representative days share the same processing model. */
export function casesForDate(date: string, variants: VariantState = {}): FlowCase[] {
  if (date === '2026-11-24') return createCases(variants).filter(c => c.unit.id === 'u7')
  if (date === '2026-11-25') return createCases({ u2: 1, u4: 1, u3: 1, u11: 1, ...variants }).filter(c => ['u2', 'u3', 'u4', 'u9', 'u11'].includes(c.unit.id))
  return createCases(variants).filter(c => c.unit.id !== 'u11')
}
