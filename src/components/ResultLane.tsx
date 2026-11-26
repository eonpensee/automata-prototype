import type { Result, ResultId, Unit } from '../data/today'
import { BADGE } from '../logic'
import { CloseIcon } from './Icons'

interface Props {
  results: Result[]
  units: Unit[]
  selected: ResultId | null
  onPick: (id: ResultId) => void
  onClose: () => void
  onOpenUnit: (id: string) => void
}

/** 오른쪽: ERP에 입력된 결과 카드와 처리 건 목록 팝업 */
export function ResultLane({ results, units, selected, onPick, onClose, onOpenUnit }: Props) {
  const sel = results.find((r) => r.id === selected) || null
  return (
    <>
      <span className="rh">ERP에 입력된 결과</span>
      {sel && (
        <div className="rdet" role="dialog" aria-label={`${sel.title} 상세`}>
          <div className="rdh">
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 13, color: '#6F6F6F' }}>{sel.title}</span>
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{sel.n}</span>
            </span>
            <button className="rdx" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
          </div>
          <div className="rdl">
            {sel.rows.map((r) => {
              const u = units.find((x) => x.id === r.unitId)
              return (
                <a key={r.unitId + r.t} className="rdr" style={{ cursor: 'pointer' }} onClick={() => onOpenUnit(r.unitId)}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: '#6F6F6F', width: 40, flex: '0 0 auto' }}>{r.t}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto', minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: '#9C9C9C' }}>{r.sub}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.n}</span>
                  {u && <span className={BADGE[u.st]}>{u.st}</span>}
                </a>
              )
            })}
          </div>
        </div>
      )}
      {results.map((r) => (
        <button key={r.id} className={'res2' + (selected === r.id ? ' on' : '')} onClick={() => onPick(r.id)} aria-expanded={selected === r.id}>
          <span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</span>
            <span className="sub">{r.sub}</span>
          </span>
          <span className="v2">{r.n}</span>
        </button>
      ))}
    </>
  )
}
