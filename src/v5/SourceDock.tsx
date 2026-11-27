import type { Source, SourceId } from '../data/today'
import { sourceGroup } from '../data/review'
import { SourceGlyph } from '../components/Icons'

/** 시안 5 왼쪽: 게임 버튼처럼 동그란 출처 아이콘 + 건수 알림 뱃지 */
interface Props { sources: Source[]; selected: SourceId | null; highlighted?: SourceId[]; alerts: Partial<Record<SourceId, number>>; onPick: (id: SourceId) => void }

export function SourceDock({ sources, selected, highlighted, alerts, onPick }: Props) {
  const groups = ['외부에서 받은 자료', '직접 전달', '내부 자동 실행'].filter(g => sources.some(s => sourceGroup(s.id) === g))
  return <div className="dock5" aria-label="들어온 자료">
    {groups.map(g => <section key={g} className="dock5-group" aria-label={g}>
      {sources.filter(s => sourceGroup(s.id) === g).map(s => {
        const n = parseInt(s.count, 10) || 0, warn = alerts[s.id] ?? 0
        const on = selected === s.id || highlighted?.includes(s.id), muted = highlighted && !highlighted.includes(s.id)
        return <button key={s.id} type="button" className={'dock5-btn' + (on ? ' on' : '') + (muted ? ' muted' : '')} onClick={() => onPick(s.id)} aria-pressed={selected === s.id}
          title={`${s.name}\n${s.latest}\n${s.cadence}`}>
          <span className="dock5-orb">
            <SourceGlyph icon={s.icon} />
            <span className={'dock5-badge' + (warn ? ' warn' : '')} aria-label={`${n}건${warn ? `, 확인 필요 ${warn}건` : ''}`}>{n}</span>
          </span>
          <span className="dock5-name">{s.name}</span>
        </button>
      })}
    </section>)}
    {sources.length === 0 && <p className="quiet-empty">들어온 자료가 없어요</p>}
  </div>
}
