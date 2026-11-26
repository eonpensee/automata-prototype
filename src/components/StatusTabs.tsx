import type { StatusTab, Unit } from '../data/today'
import type { Filter } from '../logic'

interface Props {
  tabs: StatusTab[]
  units: Unit[]
  filter: Filter
  onPick: (f: Filter) => void
  /** "할 일에서 처리" 버튼. 지금은 연결된 경로 없음 */
  onTodo?: () => void
}

/** 상태 카드 5장: 전체, 대기 중, 진행 중, 완료, 확인 필요 */
export function StatusTabs({ tabs, units, filter, onPick, onTodo }: Props) {
  return (
    <div role="tablist" aria-label="처리 상태" className="hero6">
      {tabs.map((k) => {
        const id: Filter = k.st === '전체' ? 'all' : `st:${k.st}`
        const on = filter === id
        const n = units.filter((u) => k.st === '전체' || u.st === k.st).length
        return (
          <div key={k.st} className={'c6' + (on ? ' on' : '')}>
            <button className="c6h" role="tab" onClick={() => onPick(id)} aria-selected={on}>
              <span className="c5lab"><span className={k.mark} aria-hidden="true" />{k.st}</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span style={{ fontSize: 'max(40px,var(--min-font-size,10px))', fontWeight: 700, lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 'max(24px,var(--min-font-size,10px))', fontWeight: 700, lineHeight: 1 }}>건</span>
              </span>
            </button>
            {/* TODO: 할 일 탭 경로가 생기면 onTodo로 연결 */}
            {k.todo && <a className="w4btn c6todo" style={{ cursor: 'pointer' }} onClick={() => onTodo?.()}>할 일에서 처리</a>}
          </div>
        )
      })}
    </div>
  )
}
