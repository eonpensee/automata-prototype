import { useState } from 'react'
import type { Evidence, FlowCase } from '../data/review'
import { todoFor } from '../data/todos'
import type { StepCode } from '../data/today'
import { BADGE } from '../logic'
import { EvidenceDialog } from '../components/UnitWorkspace'
import { sourcesFor } from '../data/review'
import { stepNodes, type PlaceId } from '../data/nodes'
import { SourceDock } from './SourceDock'
import { MadePanel } from './Overview5'
import { Village, type PlaceState } from './Village5'

const WORD: Record<StepCode, string> = { d: '완료', w: '확인 필요', c: '진행 중', q: '대기', n: '예정' }

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

/**
 * 시안 6 케이스 상세: 위에 단계 줄(약속 보라, 사건 초록), 가운데 지도에 이 건이 지나간 길,
 * 왼쪽은 들어온 곳, 오른쪽은 만든 것. 단계를 누르면 아래에 그 단계의 문서와 할 일이 보여요.
 */
export function CaseFlow({ flow, onBack, onDecide }: { flow: FlowCase; onBack: () => void; onDecide: (unitId: string, variant: number) => void }) {
  const { unit, steps, evidence } = flow
  const initial = steps.findIndex(s => s.status === 'w' || s.status === 'c' || s.status === 'q')
  const [selected, setSelected] = useState(initial < 0 ? steps.length - 1 : initial)
  const [docId, setDocId] = useState<string | null>(null)
  const [decided, setDecided] = useState<Record<string, 'o' | 'x'>>({})
  const todo = todoFor(flow)
  const openDoc = evidence.find(e => e.id === docId)
  const cur = steps[selected]
  const allPlaces = stepNodes(flow).map(n => n.place)
  // 지도에는 실제로 간 곳까지만 길을 그려요. 남은 단계는 위 단계 줄에만 흐리게
  const reached = Math.max(0, steps.reduce((m, st, i) => st.status !== 'n' ? i : m, 0))
  const route = allPlaces.slice(0, Math.max(reached, selected) + 1)
  const states: Partial<Record<PlaceId, PlaceState>> = {}
  route.forEach((pl, i) => { if (steps[i].status !== 'n' || i === selected) states[pl] = { lit: true, kind: steps[i].kind } })
  states[route[selected]] = { lit: true, current: true, kind: cur.kind }
  const pickPlace = (pl: PlaceId) => { const i = route.findIndex((r, j) => r === pl && (steps[j].status !== 'n' || j === selected)); if (i >= 0) setSelected(i) }
  const docs = cur.evidence.map(id => evidence.find(e => e.id === id)).filter((e): e is Evidence => !!e)
  const inputs = (flow.inputs ?? []).map(id => evidence.find(e => e.id === id)).filter((e): e is Evidence => !!e)
  const needTodo = cur.status === 'w'
  const hasSide = (needTodo && (!!todo || !!flow.approval)) || inputs.length > 0
  const decide = (itemId: string, v: 'o' | 'x') => {
    const variant = v === 'o' ? todo?.spec.variantO : todo?.spec.variantX
    if (variant !== undefined) { onDecide(unit.id, variant); return }
    setDecided(d => ({ ...d, [itemId]: v }))
  }
  return <section className="cf5 cf6" aria-label={`${unit.name} 처리 흐름`}>
    <header className="cf5-top">
      <button type="button" className="overview-back" aria-label="전체 현황으로 돌아가기" onClick={onBack}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
      <div className="cf5-title">
        <h2>{unit.name}</h2>
      </div>
      <span className={BADGE[unit.st] + ' cf5-badge'}>{unit.st === '완료' ? '완료' : flow.stuck || unit.st}</span>
    </header>

    <ol className="cf6-steps" aria-label="처리 단계">
      {steps.map((s, i) => <li key={i} className={'cf6-step s-' + s.status + ' k-' + (s.kind ?? 'event') + (selected === i ? ' on' : '')}>
        <button type="button" onClick={() => setSelected(i)} aria-current={selected === i ? 'step' : undefined}>
          <span className="cf6-step-top"><span className={'cf5-kind ' + (s.kind ?? 'event')}>{s.kind === 'promise' ? '약속' : '사건'}</span><span className="cf6-step-state">{WORD[s.status]}{s.time ? ' ' + s.time : ''}</span></span>
          <b>{s.title}</b>
        </button>
      </li>)}
    </ol>

    <section aria-label="이 건의 처리 장면" className="stage s3stage review-stage case-stage stage5 cf6-stage">
      <SourceDock sources={sourcesFor([flow])} selected={null} alerts={{}} seen={[unit.g]} onPick={() => setSelected(0)} />
      <div className="world"><Village states={states} route={route} routeCurrent={selected} popup={null} onPickPlace={pickPlace} onOpenCase={() => {}} onBackground={() => {}} /></div>
      <div className="rlane"><MadePanel cases={[flow]} onOpenCase={() => {}} /></div>
    </section>

    <div className={'cf6-detail' + (hasSide ? '' : ' solo')}>
      {(cur.summary || docs.length > 0) && <section className="cf5-card cf6-now">
        {cur.summary && <p className="cf5-summary">{cur.summary}</p>}
        {docs.map(e => <DocInline key={e.id} e={e} onOpen={() => setDocId(e.id)} />)}
      </section>}
      {hasSide && <div className="cf6-side">
        {needTodo && todo && <section className="cf5-card cf6-todo"><h3>할 일</h3>
          <span className="cf5-todo-who">{todo.spec.assignee}</span>
          {todo.items.map(item => { const d = decided[item.id]
            return <div key={item.id} className="cf5-todo-row"><span>{todo.spec.question(item)}</span>
              {d ? <span className="cf5-todo-done">{d === 'o' ? todo.spec.o : todo.spec.x}</span>
                : <span className="cf5-ox"><button type="button" className="o" onClick={() => decide(item.id, 'o')}>{todo.spec.o}</button><button type="button" className="x" onClick={() => decide(item.id, 'x')}>{todo.spec.x}</button></span>}
            </div> })}
        </section>}
        {needTodo && !todo && flow.approval && <section className="cf5-card cf6-todo"><h3>할 일</h3><a className="cf5-link" href={flow.approval.href} target="_blank" rel="noreferrer">할 일에서 열기</a></section>}
        {inputs.length > 0 && <section className="cf5-card cf6-in"><h3>들어온 자료</h3>{inputs.map(e => <DocInline key={e.id} e={e} onOpen={() => setDocId(e.id)} />)}</section>}
      </div>}
    </div>
    {openDoc && <EvidenceDialog evidence={openDoc} onClose={() => setDocId(null)} />}
  </section>
}
