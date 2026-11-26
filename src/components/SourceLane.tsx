import type { CSSProperties } from 'react'
import type { Source, SourceId } from '../data/today'
import { sourceGroup } from '../data/review'
import { SourceGlyph } from './Icons'

interface Props { sources: Source[]; selected: SourceId | null; highlighted?: SourceId[]; onPick: (id: SourceId) => void }
export function SourceLane({ sources, selected, highlighted, onPick }: Props) {
  return <div className="tlane source-groups" style={{ ['--source-count']: Math.max(1, sources.length) } as CSSProperties}>{['외부에서 받은 자료', '직접 전달', '내부 자동 실행'].filter(group => sources.some(s => sourceGroup(s.id) === group)).map(group => <section key={group} aria-label={group}><h3>{group}</h3>{sources.filter(s => sourceGroup(s.id) === group).map(s => <button key={s.id} className={'trig2' + (selected === s.id || highlighted?.includes(s.id) ? ' hi' : '') + (highlighted && !highlighted.includes(s.id) ? ' source-muted' : '')} onClick={() => onPick(s.id)} aria-pressed={selected === s.id}><span className="trh"><span className="tic2"><SourceGlyph icon={s.icon} /></span><span className="tnm">{s.name}</span><span className="tcount2">{s.count}</span></span><span className="tmeta3"><span className="tl3">{s.latest}</span><span>{s.cadence}</span></span></button>)}</section>)}{sources.length === 0 && <p className="quiet-empty">해당하는 자료가 없어요.</p>}</div>
}
