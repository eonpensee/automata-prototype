import type { Source, SourceId } from '../data/today'
import { sourceGroup } from '../data/review'
import { BADGE } from '../logic'
import { SourceGlyph, CloseIcon } from '../components/Icons'
import type { ProcUnit } from './units'

/** 시안 7 왼쪽(들어온 것): 출처 아이콘을 누르면 그 출처의 intake 배치(외부에서 한 번 가져온 단위)가 나열돼요. 배치를 고르면 지도와 아래 케이스 목록이 그 배치로 좁혀져요 */
interface Props {
  sources: Source[]; selected: SourceId | null; highlighted?: SourceId[]
  units?: ProcUnit[]; batchId?: string | null; seen?: SourceId[]
  onPick: (id: SourceId) => void; onBatch?: (id: string | null) => void
}

export function SourceDock({ sources, selected, highlighted, units = [], batchId, seen = [], onPick, onBatch }: Props) {
  const groups = ['외부에서 받은 자료', '직접 전달', '내부 자동 실행'].filter(g => sources.some(s => sourceGroup(s.id) === g))
  return <div className="dock5" aria-label="들어온 자료">
    {groups.map(g => <section key={g} className="dock5-group" aria-label={g}>
      {sources.filter(s => sourceGroup(s.id) === g).map(s => {
        // 아래쪽 출처는 패널이 지도 밖으로 넘치지 않게 위로 펼쳐요
        const up = sources.indexOf(s) >= Math.ceil(sources.length / 2)
        const mine = units.filter(u => u.source === s.id), n = mine.length
        const on = selected === s.id, lit = on || highlighted?.includes(s.id), muted = highlighted && !highlighted.includes(s.id)
        return <div key={s.id} className="dock6-slot">
          <button type="button" className={'dock5-btn' + (lit ? ' on' : '') + (muted ? ' muted' : '')} onClick={() => onPick(s.id)} aria-pressed={on} aria-expanded={on}>
            <span className="dock5-orb">
              <SourceGlyph icon={s.icon} />
              {n > 0 && !seen.includes(s.id) && <span className="dock5-badge" aria-label={`배치 ${n}개`}>{n}</span>}
            </span>
            <span className="dock5-name">{s.name}</span>
          </button>
          {on && <div className={'fly6' + (up ? ' up' : '')} role="dialog" aria-label={`${s.name} 배치`}>
            <header className="fly6-head"><h3>{s.name}{n > 0 && <b>배치 {n}개</b>}</h3><button type="button" className="rdx" onClick={() => onPick(s.id)} aria-label="닫기"><CloseIcon /></button></header>
            <ul className="fly6-list">
              {mine.map(u => <li key={u.id} className={batchId === u.id ? 'on' : ''}>
                <button type="button" className="fly6-row" onClick={() => onBatch?.(batchId === u.id ? null : u.id)} aria-pressed={batchId === u.id}>
                  <span className="fly6-top"><b>{u.title}</b><span className={BADGE[u.st]}>{u.st}</span></span>
                  <span className="fly6-sub"><span>케이스 {u.cases.length}건{u.done ? `, 완료 ${u.done}건` : ''}</span><span className="mono">{u.time}</span></span>
                </button>
              </li>)}
              {!n && <li className="fly6-empty">오늘 들어온 자료 없음</li>}
            </ul>
          </div>}
        </div>
      })}
    </section>)}
  </div>
}
