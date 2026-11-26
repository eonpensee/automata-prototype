import type { Status, Unit } from '../data/today'
import { BADGE } from '../logic'
export type OverviewStatus = Status | '전체'
const tabs: OverviewStatus[] = ['전체', '확인 필요', '대기 중', '진행 중', '완료']
export function OverviewTabs({ units, selected, onPick, onBack }: { units: Unit[]; selected: OverviewStatus; onPick: (s: OverviewStatus) => void; onBack?: () => void }) {
  return <div className="overview-controls">{onBack && <button type="button" className="overview-back" aria-label="전체 현황으로 돌아가기" onClick={onBack}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>}<div role="tablist" aria-label="전체 화면 처리 상태" className="overview-tabs">{tabs.map(s => <button key={s} role="tab" aria-selected={selected === s} className={selected === s ? 'selected' : ''} onClick={() => onPick(s)}>{s !== '전체' && <i className={BADGE[s]} aria-hidden="true" />}<span className="overview-tab-label"><span>{s === '전체' ? '전체 현황' : s}</span><b>{units.filter(u => s === '전체' || u.st === s).length}</b></span></button>)}</div></div>
}
