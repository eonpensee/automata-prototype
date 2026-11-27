import { useState } from 'react'
import type { Evidence, FlowCase } from '../data/review'
import { todoFor } from '../data/todos'
import type { Status, StepCode } from '../data/today'
import { BADGE } from '../logic'
import { EvidenceDialog } from '../components/UnitWorkspace'
import { SOURCE_TITLE, resultLine } from './units'

const WORD: Record<StepCode, string> = { d: '완료', w: '확인 필요', c: '진행 중', q: '대기', n: '예정' }
const STATUS: Record<StepCode, Status> = { d: '완료', w: '확인 필요', c: '진행 중', q: '대기 중', n: '대기 중' }

/** 문서 한 장을 단계 안에 바로: 표가 있으면 표, 없으면 본문 앞부분 */
function DocInline({ e, onOpen }: { e: Evidence; onOpen: () => void }) {
  const lines = e.body.split('\n').filter(Boolean)
  return <div className="cf5-doc">
    <div className="cf5-doc-head"><span className="cf5-doc-title">{e.title.split(' (')[0]}</span><button type="button" className="cf5-link" onClick={onOpen}>원문</button></div>
    {e.columns && e.rows?.length
      ? <table className="cf5-table"><thead><tr>{e.columns.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{e.rows.slice(0, 5).map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table>
      : <p className="cf5-body">{lines.slice(0, 4).join('\n')}{lines.length > 4 ? '\n…' : ''}</p>}
  </div>
}

/** 시안 6 케이스 상세: 왼쪽은 단계별 내용을 펼친 세로 타임라인, 오른쪽은 만든 결과 */
export function CaseFlow({ flow, onBack, onDecide }: { flow: FlowCase; onBack: () => void; onDecide: (unitId: string, variant: number) => void }) {
  const { unit, steps, evidence } = flow
  const [docId, setDocId] = useState<string | null>(null)
  const [decided, setDecided] = useState<Record<string, 'o' | 'x'>>({})
  const todo = todoFor(flow)
  const openDoc = evidence.find(e => e.id === docId)
  const outputs = evidence.filter(e => e.kind === 'output')
  const decide = (itemId: string, v: 'o' | 'x') => {
    const variant = v === 'o' ? todo?.spec.variantO : todo?.spec.variantX
    if (variant !== undefined) { onDecide(unit.id, variant); return }
    setDecided(d => ({ ...d, [itemId]: v }))
  }
  return <section className="cf5" aria-label={`${unit.name} 처리 흐름`}>
    <header className="cf5-top">
      <button type="button" className="overview-back" aria-label="전체 현황으로 돌아가기" onClick={onBack}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
      <div className="cf5-title">
        <span className="cf5-meta"><span className="mono">{unit.t}</span><span>{SOURCE_TITLE[unit.g]}</span>{flow.flowName && <span>{flow.flowName}</span>}</span>
        <h2>{unit.name}</h2>
        <span className="cf5-sub">{unit.qsub}</span>
      </div>
      <span className={BADGE[unit.st] + ' cf5-badge'}>{unit.st === '완료' ? '완료' : flow.stuck || unit.st}</span>
    </header>

    <div className="cf5-grid">
      <div className="cf5-main">
      {(flow.inputs?.length ?? 0) > 0 && <section className="cf5-inputs"><h3>들어온 자료</h3>{flow.inputs!.map(id => evidence.find(e => e.id === id)).filter((e): e is Evidence => !!e).map(e => <DocInline key={e.id} e={e} onOpen={() => setDocId(e.id)} />)}</section>}
      <ol className="cf5-steps" aria-label="처리 단계">
        {steps.map((s, i) => {
          const docs = s.evidence.map(id => evidence.find(e => e.id === id)).filter((e): e is Evidence => !!e)
          return <li key={i} className={'cf5-step s-' + s.status + ' k-' + (s.kind ?? 'event')}>
            <span className="cf5-rail" aria-hidden="true"><i /></span>
            <div className="cf5-step-body">
              <div className="cf5-step-head"><span className={'cf5-kind ' + (s.kind ?? 'event')}>{s.kind === 'promise' ? '약속' : '사건'}</span><b>{s.title}</b><span className={BADGE[STATUS[s.status]]}>{WORD[s.status]}</span>{s.time && <span className="cf5-time mono">{s.time}</span>}</div>
              <p className="cf5-summary">{s.summary}</p>
              {docs.map(e => <DocInline key={e.id} e={e} onOpen={() => setDocId(e.id)} />)}
              {s.status === 'w' && todo && <div className="cf5-todo">
                <span className="cf5-todo-who">{todo.spec.assignee}</span>
                {todo.items.map(item => { const d = decided[item.id]
                  return <div key={item.id} className="cf5-todo-row"><span>{todo.spec.question(item)}</span>
                    {d ? <span className="cf5-todo-done">{d === 'o' ? todo.spec.o : todo.spec.x}</span>
                      : <span className="cf5-ox"><button type="button" className="o" onClick={() => decide(item.id, 'o')}>{todo.spec.o}</button><button type="button" className="x" onClick={() => decide(item.id, 'x')}>{todo.spec.x}</button></span>}
                  </div> })}
              </div>}
              {s.status === 'w' && !todo && flow.approval && <a className="cf5-link" href={flow.approval.href} target="_blank" rel="noreferrer">할 일에서 열기</a>}
            </div>
          </li>
        })}
      </ol>
      </div>

      <aside className="cf5-side">
        <section className="cf5-card"><h3>만든 결과</h3>
          {resultLine([flow]) ? <p className="cf5-result-line">{resultLine([flow])}</p> : <p className="quiet-empty">아직 없음</p>}
          <ul className="cf5-outputs">{outputs.map(e => <li key={e.id}><button type="button" className="cf5-link" onClick={() => setDocId(e.id)}>{e.title.split(' (')[0]}</button><span>{e.title.match(/\(([^)]+)\)/)?.[1] ?? ''}</span></li>)}</ul>
        </section>
      </aside>
    </div>
    {openDoc && <EvidenceDialog evidence={openDoc} onClose={() => setDocId(null)} />}
  </section>
}
