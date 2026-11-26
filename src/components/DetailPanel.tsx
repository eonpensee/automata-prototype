import type { DetailSection, Unit } from '../data/today'
import { BADGE, STEPC } from '../logic'
import { CloseIcon } from './Icons'

interface Props {
  unit: Unit
  stepNames: string[]
  sections: DetailSection[]
  onClose: () => void
  /** "할 일에서 처리" 등 하단 버튼. 지금은 연결된 경로 없음 */
  onAction?: (unit: Unit) => void
}

/** 오른쪽 상세 패널: 단계, 받은 자료, 판단, 남긴 결과, 지금 상태 */
export function DetailPanel({ unit, stepNames, sections, onClose, onAction }: Props) {
  const btn = unit.st === '확인 필요' ? '할 일에서 처리' : '에이전트 세션 보기'
  return (
    <div className="odet" role="dialog" aria-label={`${unit.name} 상세`}>
      <div className="odh">
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: '#6F6F6F' }}>{unit.t} {unit.kind}</span>
          <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{unit.name}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={BADGE[unit.st]}>{unit.st}</span>
          <button className="rdx" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
        </span>
      </div>
      <div className="odsteps">
        {unit.s.map((k, i) => (
          <span key={i} className={'ops ' + STEPC[k]}><i aria-hidden="true" />{stepNames[i] || ''}</span>
        ))}
      </div>
      {sections.map((sec) => (
        <div key={sec.label} className="odsec">
          <span className="odl">{sec.label}</span>
          <div className="kv">
            {sec.rows.map((r, i) => (
              <span key={i} className={r.flag ? 'r' : ''}>
                <em>{r.k}</em>
                <b>{r.v}{r.s && <small>{r.s}</small>}</b>
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="odft">
        {/* TODO: 할 일 탭 / 에이전트 세션 경로가 생기면 onAction으로 연결 */}
        <a className="opbtn on" style={{ cursor: 'pointer' }} onClick={() => onAction?.(unit)}>{btn}</a>
      </div>
    </div>
  )
}
