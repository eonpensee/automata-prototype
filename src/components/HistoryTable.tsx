import type { Unit } from '../data/today'
import { BADGE, STEPC } from '../logic'
import { InfoIcon } from './Icons'

interface Props {
  rows: Unit[]
  stepNames: Record<string, string[]>
  onOpenUnit: (id: string) => void
}

function stepTip(u: Unit, k: Unit['s'][number], i: number, names: string[]) {
  const st = k === 'd' ? '완료' : k === 'c' ? '진행 중' : k === 'n' ? '아직 안 함' : u.st === '확인 필요' ? '확인 필요' : '대기 중'
  return st + '\n' + (i + 1) + '단계 ' + (names[i] || '') + (k === 'w' || k === 'q' || k === 'c' ? '\n' + u.now : '')
}

/** 처리 이력 표 */
export function HistoryTable({ rows, stepNames, onOpenUnit }: Props) {
  return (
    <div className="panel" style={{ overflowX: 'auto' }}>
      <div className="thead">
        <span>시각</span>
        <span>처리 건</span>
        <span className="hide-md">들어온 내용</span>
        <span className="hide-md lgh">
          진행
          <span className="lgi" tabIndex={0} aria-label="진행 표시 설명">
            <InfoIcon />
            <span className="lgp">
              <span className="lgr"><span className="steps"><span className="d" /></span>완료</span>
              <span className="lgr"><span className="steps"><span className="c" /></span>진행 중</span>
              <span className="lgr"><span className="steps"><span className="w" /></span>대기 중 또는 확인 필요</span>
              <span className="lgr"><span className="steps"><span /></span>아직 안 함</span>
            </span>
          </span>
        </span>
        <span className="hide-md">비고</span>
        <span>상태</span>
      </div>
      {rows.map((r) => (
        <a key={r.id} className="trow" style={{ cursor: 'pointer' }} onClick={() => onOpenUnit(r.id)}>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{r.t}</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span className="type" style={{ alignSelf: 'flex-start' }}>{r.kind}</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</span>
          </span>
          <span className="hide-md" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{r.qty}</span>
            <span className="lab">{r.qsub}</span>
          </span>
          <span className="hide-md" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="steps" aria-hidden="true">
              {r.s.map((k, i) => <span key={i} className={STEPC[k]} data-tip={stepTip(r, k, i, stepNames[r.id] || [])} />)}
            </span>
            <span className="lab">{r.stepLabel}</span>
          </span>
          <span className="hide-md" style={{ fontSize: 14, color: '#2E2E2E' }}>{r.now}</span>
          <span><span className={BADGE[r.st]}>{r.st}</span></span>
        </a>
      ))}
      {rows.length === 0 && (
        <div style={{ padding: '28px 20px', fontSize: 14, color: '#6F6F6F', borderTop: '1px solid #EEEEEE' }}>이 조건에 맞는 처리 건이 없어요.</div>
      )}
    </div>
  )
}
