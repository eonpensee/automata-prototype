// 자동 처리 현황 목업 데이터 (가상 사례 6건 기준)
// 나중에 API 응답으로 바꿀 때는 이 파일의 모양(타입)만 맞추면 돼요.

import type { ZoneId } from '../components/map/partners/types'

export type { ZoneId }

/** 처리 상태 */
export type Status = '확인 필요' | '대기 중' | '진행 중' | '완료'

/** 들어온 자료 출처 */
export type SourceId = 'mail' | 'cp' | 'ss' | 'bank' | 'card' | 'chk'

/** 단계 표시: d 완료, c 진행 중, w 확인 필요, q 대기 중, n 아직 안 함 */
export type StepCode = 'd' | 'c' | 'w' | 'q' | 'n'

/** 처리 건 = 외부에서 한 번 들어온 자료 */
export interface Unit {
  id: string
  t: string
  /** 들어온 자료 출처 */
  g: SourceId
  /** 지도에서 머무는 거래 상대 */
  z: ZoneId
  kind: string
  name: string
  qty: string
  qsub: string
  s: StepCode[]
  stepLabel: string
  now: string
  st: Status
}

export const UNITS: Unit[] = [
  { id: 'u1', t: '10:10', g: 'mail', z: 'wh', kind: '거래처 메일', name: '달빛스토어 주문 메일', qty: '주문 1건', qsub: '시트러스 핸드크림 24개', s: ['d', 'w', 'n', 'n'], stepLabel: '2/4 출고 요청 전', now: '재고 18개라 6개가 부족해요', st: '확인 필요' },
  { id: 'u2', t: '10:00', g: 'cp', z: 'wh', kind: '쿠팡 조회', name: '쿠팡 주문 조회', qty: '주문 100건', qsub: '100건 수주 등록', s: ['d', 'q', 'n', 'n'], stepLabel: '2/4 출고 요청', now: '오후 3시 창고 일괄 요청 때 보내요', st: '대기 중' },
  { id: 'u3', t: '10:00', g: 'bank', z: 'bank', kind: '은행 내역 수집', name: '은행 입금 내역', qty: '입금 5건', qsub: '판매처 정산서와 대사', s: ['d', 'd', 'w'], stepLabel: '3/3 차액 확인', now: '4건 정리, 바다상점 1건 차액 2만 원', st: '확인 필요' },
  { id: 'u10', t: '10:00', g: 'bank', z: 'sup', kind: '은행 내역 수집', name: '은행 출금 내역', qty: '출금 1건', qsub: '솔빛제조 매입 대금 54만 원', s: ['d', 'd', 'd'], stepLabel: '3/3 완료', now: '지급 예정액과 같아 지급을 기록했어요', st: '완료' },
  { id: 'u4', t: '09:10', g: 'mail', z: 'wh', kind: '거래처 메일', name: '바다상점 주문 메일', qty: '주문 1건', qsub: '무향 핸드크림 24개', s: ['d', 'd', 'c', 'n'], stepLabel: '3/4 창고 회신', now: '온유물류 중앙창고 회신을 기다려요', st: '진행 중' },
  { id: 'u5', t: '09:00', g: 'ss', z: 'wh', kind: '스마트스토어 조회', name: '스마트스토어 주문 조회', qty: '주문 38건', qsub: '38건 수주 등록, 출고 요청', s: ['d', 'd', 'c', 'n'], stepLabel: '3/4 창고 회신', now: '창고 회신을 기다려요', st: '진행 중' },
  { id: 'u7', t: '08:20', g: 'mail', z: 'wh', kind: '거래처 메일', name: '온유물류 반품 검수 회신', qty: '반품 3개', qsub: '정상 2개, 파손 1개', s: ['d', 'd', 'd'], stepLabel: '3/3 완료', now: '재고 +2, 파손 1개 기록', st: '완료' },
  { id: 'u9', t: '07:00', g: 'card', z: 'card', kind: '카드사 내역 수집', name: '법인카드 사용 내역', qty: '어제 32건', qsub: '가맹점과 금액으로 계정 분류', s: ['d', 'd', 'w'], stepLabel: '3/3 전표 기록', now: '30건 전표 기록, 2건 용도 확인 필요', st: '확인 필요' },
  { id: 'u8', t: '07:00', g: 'cp', z: 'wh', kind: '쿠팡 조회', name: '쿠팡 주문 조회', qty: '주문 64건', qsub: '64건 수주 등록', s: ['d', 'q', 'n', 'n'], stepLabel: '2/4 출고 요청', now: '오후 3시 창고 일괄 요청 때 보내요', st: '대기 중' },
  { id: 'u11', t: '06:00', g: 'chk', z: 'sup', kind: '재고 점검', name: '재고 점검 발주', qty: '발주 1건', qsub: '시트러스 핸드크림 50ml', s: ['d', 'w', 'n', 'n', 'n'], stepLabel: '2/5 구매 승인', now: '구매 담당 승인을 기다려요', st: '확인 필요' },
]

/** 상세 패널 한 줄: 항목, 값, 보조 문구, 강조 여부 */
export interface DetailRow { k: string; v: string; s: string; flag?: boolean }
export interface DetailSection { label: string; rows: DetailRow[] }

type RawRow = [string, string, string, 1?]
type RawSec = [string, RawRow[]]
const sec = (raw: RawSec[]): DetailSection[] =>
  raw.map(([label, rows]) => ({ label, rows: rows.map(([k, v, s, f]) => ({ k, v, s, flag: !!f })) }))

/** 건별 상세: 받은 자료, 판단, 남긴 결과, 지금 상태 */
export const DET: Record<string, DetailSection[]> = {
  u4: sec([['받은 자료', [['주문 메일', '09:10', ''], ['주문 내용', '무향 핸드크림 24개', '금요일까지'], ['주문서 표기', '무향 50ml', '']]],
    ['판단', [['사내 상품', '무향 핸드크림 50ml', ''], ['출고 가능 재고', '40개', '']]],
    ['남긴 결과', [['수주 등록', '24개', '09:11'], ['출고 요청', '중앙창고', '09:11']]],
    ['지금 상태', [['창고 회신', '기다리는 중', '']]]]),
  u1: sec([['받은 자료', [['주문 메일', '10:10', ''], ['주문 내용', '시트러스 핸드크림 24개', '']]],
    ['판단', [['주문', '24개', ''], ['창고 재고', '18개', ''], ['부족', '6개', '', 1]]],
    ['고를 수 있는 방법', [['부분 출고', '18개 출고 요청', '미출고 6개 기록'], ['전량 출고', '24개 확보 시 출고 요청', '']]],
    ['결정 기록', [['결정', '아직 없음', '할 일에서 고르면 남아요']]]]),
  u5: sec([['받은 자료', [['스마트스토어 조회', '09:00', ''], ['주문', '38건', '주문번호, 옵션, 수량']]],
    ['판단', [['옵션 매칭', '38건 모두 연결', '']]],
    ['남긴 결과', [['주문 등록', '38건', ''], ['출고 요청', '38건', '']]],
    ['지금 상태', [['창고 회신', '기다리는 중', '']]]]),
  u2: sec([['받은 자료', [['쿠팡 조회', '10:00', ''], ['주문', '100건', '']]],
    ['판단', [['옵션 매칭', '100건 모두 연결', '']]],
    ['남긴 결과', [['수주 등록', '100건', '']]],
    ['지금 상태', [['출고 요청', '오후 3시 일괄', '']]]]),
  u8: sec([['받은 자료', [['쿠팡 조회', '07:00', ''], ['주문', '64건', '']]],
    ['판단', [['옵션 매칭', '64건 모두 연결', '']]],
    ['남긴 결과', [['수주 등록', '64건', '']]],
    ['지금 상태', [['출고 요청', '오후 3시 일괄', '']]]]),
  u7: sec([['받은 자료', [['창고 검수 회신', '08:20', ''], ['반품', '3개 도착', '']]],
    ['판단', [['정상', '2개', ''], ['파손', '1개', '']]],
    ['남긴 결과', [['판매 가능 재고', '+2개', ''], ['파손 1개', '재고에서 제외', '파손 상태 기록']]]]),
  u3: sec([['받은 자료', [['은행 입금 내역', '5건', '10:00'], ['판매처 정산서', '바다상점', '']]],
    ['판단', [['정산서 예정액', '98만 원', ''], ['실제 입금', '96만 원', ''], ['차액', '2만 원', '', 1]]],
    ['남긴 결과', [['채권 정리', '4건', ''], ['차액 기록', '2만 원', '바다상점']]]]),
  u10: sec([['받은 자료', [['은행 출금 내역', '1건', '10:00']]],
    ['판단', [['지급 예정액', '54만 원', ''], ['실제 출금', '54만 원', '']]],
    ['남긴 결과', [['지급 기록', '솔빛제조 54만 원', '']]]]),
  u9: sec([['받은 자료', [['카드 사용 내역', '32건', '어제']]],
    ['판단', [['계정 분류', '30건', ''], ['용도 확인 필요', '2건', '', 1]]],
    ['남긴 결과', [['경비 전표', '30건', '']]]]),
  u11: sec([['받은 자료', [['재고 점검', '06:00', '하루 1번']]],
    ['판단', [['예상 판매량과 재고 대조', '시트러스 핸드크림 50ml 부족', '']]],
    ['남긴 결과', [['발주서 준비', '솔빛제조', '']]],
    ['지금 상태', [['구매 담당 승인', '기다리는 중', '', 1]]]]),
}

/** 처리 건별 단계 이름 */
export const FLT: Record<string, string[]> = {
  u1: ['주문 확인', '수주 등록, 출고 요청', '창고 회신', '송장 전달'],
  u2: ['주문 확인', '수주 등록, 출고 요청', '창고 회신', '송장 전달'],
  u8: ['주문 확인', '수주 등록, 출고 요청', '창고 회신', '송장 전달'],
  u4: ['주문 확인', '수주 등록, 출고 요청', '창고 회신', '송장 전달'],
  u5: ['주문 확인', '수주 등록, 출고 요청', '창고 회신', '송장 전달'],
  u3: ['입금 수집', '정산서 대조', '차액 확인'],
  u10: ['출금 수집', '지급 예정액 대조', '지급 기록'],
  u7: ['반품 도착', '검수 회신', '재고 반영'],
  u9: ['카드 내역 수집', '계정 분류', '전표 기록'],
  u11: ['재고 점검', '구매 승인', '발주서 발송', '납품일 회신', '일정 반영'],
}

/** 상태 카드 (처리 이력 위 탭). 전체는 화면에서 앞에 붙여요. 건수는 UNITS에서 세요. */
export interface StatusTab { st: Status | '전체'; mark: string; todo?: boolean }
export const CARDS: StatusTab[] = [
  { st: '전체', mark: 'mk all' },
  { st: '대기 중', mark: 'mk sched' },
  { st: '진행 중', mark: 'mk mid' },
  { st: '완료', mark: 'mk done' },
  { st: '확인 필요', mark: 'mk wait', todo: true },
]

/** 왼쪽 들어온 자료 카드 */
export type SourceIcon = 'mail' | 'shop' | 'bank' | 'card' | 'check'
export interface Source { id: SourceId; name: string; count: string; latest: string; cadence: string; icon: SourceIcon }
export const SOURCES: Source[] = [
  { id: 'mail', name: '거래처 메일', count: '3통', latest: '최근 10:10 달빛스토어', cadence: '10분마다', icon: 'mail' },
  { id: 'cp', name: '쿠팡', count: '2회', latest: '최근 10:00 주문 100건', cadence: '3시간마다', icon: 'shop' },
  { id: 'ss', name: '스마트스토어', count: '1회', latest: '09:00 주문 38건', cadence: '하루 1번', icon: 'shop' },
  { id: 'bank', name: '은행', count: '1회', latest: '10:00 입금 5건, 출금 1건', cadence: '하루 1번', icon: 'bank' },
  { id: 'card', name: '카드사', count: '1회', latest: '07:00 사용 내역 32건', cadence: '하루 1번', icon: 'card' },
  { id: 'chk', name: '재고 점검', count: '1회', latest: '06:00 발주 1건', cadence: '하루 1번', icon: 'check' },
]

/** 오른쪽 ERP에 입력된 결과 카드와, 눌렀을 때 뜨는 처리 건 목록 */
export type ResultId = 'so' | 'ship' | 'exp' | 'ar' | 'pay' | 'inv' | 'po'
export interface ResultRow { t: string; name: string; sub: string; n: string; unitId: string }
export interface Result { id: ResultId; title: string; sub: string; n: string; rows: ResultRow[] }
const rr = (rows: [string, string, string, string, string][]): ResultRow[] =>
  rows.map(([t, name, sub, n, unitId]) => ({ t, name, sub, n, unitId }))
export const RES: Result[] = [
  { id: 'so', title: '수주 등록', sub: '메일 1건, 쿠팡 164건, 스마트스토어 38건', n: '203건', rows: rr([['10:00', '쿠팡 주문 조회', '100건 수주 등록', '100건', 'u2'], ['09:10', '바다상점 주문 메일', '무향 핸드크림 24개', '1건', 'u4'], ['09:00', '스마트스토어 주문 조회', '38건 수주 등록', '38건', 'u5'], ['07:00', '쿠팡 주문 조회', '64건 수주 등록', '64건', 'u8']]) },
  { id: 'ship', title: '출고 요청', sub: '164건은 오후 3시 예정', n: '39건', rows: rr([['09:10', '바다상점 주문 메일', '온유물류 중앙창고에 요청', '1건', 'u4'], ['09:00', '스마트스토어 주문 조회', '창고에 요청', '38건', 'u5']]) },
  { id: 'exp', title: '경비 전표', sub: '카드 사용 내역', n: '30건', rows: rr([['07:00', '법인카드 사용 내역', '32건 중 30건 기록, 2건 용도 확인 필요', '30건', 'u9']]) },
  { id: 'ar', title: '채권 정리', sub: '은행 입금 대사', n: '4건', rows: rr([['10:00', '은행 입금 내역', '5건 중 4건 정리, 바다상점 1건 차액 2만 원', '4건', 'u3']]) },
  { id: 'pay', title: '지급 기록', sub: '솔빛제조 54만 원', n: '1건', rows: rr([['10:00', '은행 출금 내역', '솔빛제조 매입 대금 54만 원', '1건', 'u10']]) },
  { id: 'inv', title: '재고 반영', sub: '반품 정상품', n: '+2개', rows: rr([['08:20', '온유물류 반품 검수 회신', '정상 2개 재고 반영, 파손 1개 기록', '+2개', 'u7']]) },
  { id: 'po', title: '발주서', sub: '구매 승인 대기', n: '1건', rows: rr([['06:00', '재고 점검 발주', '솔빛제조, 구매 승인 대기', '1건', 'u11']]) },
]

/** 지도 목록에서 처리 건 이름을 그 거래 상대 기준으로 바꿔 부를 때 */
export const ZNAME: Record<string, [string, string]> = {
  'u10:sup': ['솔빛제조 대금 지급', ''],
  'u11:sup': ['솔빛제조 발주', '구매 승인 대기'],
}

/** 지도 위 재고 부족 표시 */
export const STOCK_WARN = { label: '재고 부족', n: '6개', zone: 'wh' as ZoneId, pos: [89.5, 33] as [number, number] }

/** 헤더 날짜 */
export const TODAY_LABEL = '11월 26일 목요일'
