import type { FlowCase } from '../data/review'
import type { Source, SourceId } from '../data/today'
import { sourceGroup } from '../data/review'
import { BADGE } from '../logic'
import { SourceGlyph, CloseIcon } from '../components/Icons'
import type { ProcUnit } from './units'

/** 시안 6 왼쪽(들어온 것): 동그란 출처 아이콘. 누르면 게임 UI처럼 아이콘 옆으로 패널이 튀어나와 그 출처에서 들어온 자료를 보여 줘요 */
interface Props {
  sources: Source[]; selected: SourceId | null; highlighted?: SourceId[]; alerts: Partial<Record<SourceId, number>>
  units?: ProcUnit[]; focusId?: string | null; /** 이미 열어 본 출처. 뱃지는 아직 안 본 곳에만 */ seen?: SourceId[]
  onPick: (id: SourceId) => void; onFocus?: (id: string | null) => void; onOpenCase?: (id: string) => void
}

export function SourceDock({ sources, selected, highlighted, alerts, units = [], focusId, seen = [], onPick, onFocus, onOpenCase }: Props) {
  const groups = ['외부에서 받은 자료', '직접 전달', '내부 자동 실행'].filter(g => sources.some(s => sourceGroup(s.id) === g))
  return <div className="dock5" aria-label="들어온 자료">
    {groups.map(g => <section key={g} className="dock5-group" aria-label={g}>
      {sources.filter(s => sourceGroup(s.id) === g).map(s => {
        // 아래쪽 출처는 패널이 지도 밖으로 넘치지 않게 위로 펼쳐요
        const up = sources.indexOf(s) >= Math.ceil(sources.length / 2)
        const n = parseInt(s.count, 10) || 0, warn = alerts[s.id] ?? 0
        const on = selected === s.id, lit = on || highlighted?.includes(s.id), muted = highlighted && !highlighted.includes(s.id)
        const mine = units.filter(u => u.source === s.id)
        const rows: { c: FlowCase; u: ProcUnit }[] = mine.flatMap(u => u.cases.map(c => ({ c, u })))
        return <div key={s.id} className="dock6-slot">
          <button type="button" className={'dock5-btn' + (lit ? ' on' : '') + (muted ? ' muted' : '')} onClick={() => onPick(s.id)} aria-pressed={on} aria-expanded={on}>
            <span className="dock5-orb">
              <SourceGlyph icon={s.icon} />
              {n > 0 && !seen.includes(s.id) && <span className={'dock5-badge' + (warn ? ' warn' : '')} aria-label={`${n}건${warn ? `, 확인 필요 ${warn}건` : ''}`}>{n}</span>}
            </span>
            <span className="dock5-name">{s.name}</span>
          </button>
          {on && <div className={'fly6' + (up ? ' up' : '')} role="dialog" aria-label={`${s.name}에서 들어온 자료`}>
            <header className="fly6-head"><h3>{s.name}{rows.length > 0 && <b>{rows.length}건</b>}</h3><button type="button" className="rdx" onClick={() => onPick(s.id)} aria-label="닫기"><CloseIcon /></button></header>
            <ul className="fly6-list">
              {rows.map(({ c, u }) => <li key={c.unit.id} className={focusId === c.unit.id ? 'on' : ''}>
                <button type="button" className="fly6-row" onClick={() => onFocus?.(focusId === c.unit.id ? null : c.unit.id)} aria-pressed={focusId === c.unit.id}>
                  <span className="fly6-top"><b>{c.unit.name}</b><span className={BADGE[c.unit.st]}>{c.unit.st === '완료' ? '완료' : c.stuck || c.unit.st}</span></span>
                  <span className="fly6-sub"><span>{c.unit.qsub}</span><span className="mono">{u.time}</span></span>
                </button>
                {focusId === c.unit.id && <button type="button" className="fly6-open" onClick={() => onOpenCase?.(c.unit.id)}>자세히</button>}
              </li>)}
              {!rows.length && <li className="fly6-empty">오늘 들어온 자료 없음</li>}
            </ul>
          </div>}
        </div>
      })}
    </section>)}
    {sources.length === 0 && <p className="quiet-empty">들어온 자료가 없어요</p>}
  </div>
}
