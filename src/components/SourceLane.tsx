import type { Source, SourceId } from '../data/today'
import { SourceGlyph } from './Icons'

interface Props {
  sources: Source[]
  hiddenLinks: SourceId[]
  /** 선택된 출처 */
  selected: SourceId | null
  /** 무언가 걸러진 상태인지 (연결선 흐림) */
  filtered: boolean
  onPick: (id: SourceId) => void
}

/** 왼쪽: 들어온 자료 카드 */
export function SourceLane({ sources, hiddenLinks, selected, filtered, onPick }: Props) {
  return (
    <div className="tlane">
      <span className="rh" style={{ paddingLeft: 2 }}>들어온 자료</span>
      {sources.map((s) => (
        <button
          key={s.id}
          className={'trig2' + (selected === s.id ? ' hi' : '') + (filtered ? ' nol' : '')}
          onClick={() => onPick(s.id)}
          aria-pressed={selected === s.id}
        >
          <span className="trh">
            <span className="tic2"><SourceGlyph icon={s.icon} /></span>
            <span className="tnm">{s.name}</span>
            <span className="tcount2">{s.count}</span>
          </span>
          <span className="tmeta3"><span className="tl3">{s.latest}</span><span>{s.cadence}</span></span>
          {!hiddenLinks.includes(s.id) && <span className="trk2" aria-hidden="true" />}
        </button>
      ))}
    </div>
  )
}
