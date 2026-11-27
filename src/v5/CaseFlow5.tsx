import { useState } from 'react'
import type { Evidence, FlowCase } from '../data/review'
import { resultsFor, sourcesFor } from '../data/review'
import { todoFor } from '../data/todos'
import type { Status } from '../data/today'
import { BADGE } from '../logic'
import { SourceDock } from './SourceDock'
import { ResultLane } from '../components/ResultLane'
import { Village, type PlaceState } from './Village5'
import { stepNodes, type PlaceId } from '../data/nodes'
import { EvidenceDialog } from '../components/UnitWorkspace'
import { ChevronRightIcon } from '../components/Icons'

const STEP_LABEL = { d: '완료', c: '진행 중', w: '확인 필요', q: '대기 중', n: '아직 시작 전' }

/** 근거가 열리는 곳. 실제 화면 주소가 생기면 여기서 링크로 바꿔요. */
function destination(e: Evidence, source: string): string {
  if (e.kind === 'output') return 'ERP'
  if (e.kind === 'decision') return '할 일 기록'
  if (source === 'mail' || source === 'manual') return 'Inbox'
  if (source === 'bank') return '은행 수집 내역'
  if (source === 'card') return '카드 수집 내역'
  if (source === 'chk') return 'ERP 재고'
  return '판매처 주문 수집'
}

/**
 * 처리 이력에서 한 건을 눌렀을 때.
 * 첫 화면과 같은 틀(받은 자료, 3D 거래 상대, 결과)을 그대로 두고,
 * 아래 단계를 누를 때마다 그 단계의 거래 상대 안이 보여요. 단계 상세는 그 아래.
 */
/** 시안 5 케이스 상세: 처리 단계 줄을 장면 위에 두고, 5번 마을과 동그란 출처 버튼을 써요 */
export function CaseFlow({ flow, onBack, onDecide }: { flow: FlowCase; onBack: () => void; onDecide: (unitId: string, variant: number) => void }) {
  const { unit, steps, items, evidence } = flow
  const initial = steps.findIndex(s => s.status === 'w' || s.status === 'c' || s.status === 'q')
  const [selected, setSelected] = useState(initial < 0 ? steps.length - 1 : initial)
  const [todoOpen, setTodoOpen] = useState(false)
  const [decided, setDecided] = useState<Record<string, 'o' | 'x'>>({})
  const [docId, setDocId] = useState<string | null>(null)
  const [itemFilter, setItemFilter] = useState<Status | '전체'>('전체')
  const [page, setPage] = useState(0)
  const current = steps[selected]
  const nodes = stepNodes(flow)
  const route = nodes.map(n => n.place)
  const states: Partial<Record<PlaceId, PlaceState>> = {}
  route.forEach((pl, i) => { if (steps[i].status !== 'n' || i === selected) states[pl] = { lit: true } })
  states[route[selected]] = { lit: true, current: true }
  const sources = sourcesFor([flow])
  const results = resultsFor([flow]).filter(r => r.rows.length)
  const todo = current.status === 'w' ? todoFor(flow) : null
  const docs = current.evidence.map(id => evidence.find(e => e.id === id)).filter((e): e is Evidence => !!e)
  const openDoc = evidence.find(e => e.id === docId)
  const filtered = items.filter(i => itemFilter === '전체' || i.status === itemFilter)
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8))
  const statuses: (Status | '전체')[] = ['전체', '확인 필요', '대기 중', '진행 중', '완료']
  const pickPlace = (pl: PlaceId) => { const i = route.findIndex((r, j) => r === pl && (steps[j].status !== 'n' || j === selected)); if (i >= 0) setSelected(i) }
  const decide = (itemId: string, v: 'o' | 'x') => {
    const spec = todo?.spec
    const variant = v === 'o' ? spec?.variantO : spec?.variantX
    if (variant !== undefined) { onDecide(unit.id, variant); return }
    setDecided(d => ({ ...d, [itemId]: v }))
  }

  return <>
    <section className="overview-shell case-shell" aria-label={`${unit.name} 처리 흐름`}>
      <div className="overview-controls case-controls">
        <button type="button" className="overview-back" aria-label="전체 현황으로 돌아가기" onClick={onBack}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
        <div className="case-title"><span className="mono">{unit.t}</span><span className="type">{unit.kind}</span><strong>{unit.name}</strong><span className={BADGE[unit.st]}>{unit.st}</span></div>
      </div>
      <ol className="case-steps" aria-label="처리 단계">
        {steps.map((s, i) => <li key={s.title} className={`case-step ${s.status}${selected === i ? ' selected' : ''}`}>
          <button type="button" onClick={() => { setSelected(i); setTodoOpen(false) }} aria-current={selected === i ? 'step' : undefined}>
            <span className="step-number" aria-hidden="true">{s.status === 'd' ? null : i + 1}</span>
            <span className="case-step-copy"><strong>{s.title}</strong><small>{STEP_LABEL[s.status]}{s.time && ` ${s.time}`}</small></span>
          </button>
        </li>)}
      </ol>
      <section aria-label="이 건의 처리 장면" className="stage s3stage review-stage case-stage stage5">
        <SourceDock sources={sources} selected={null} alerts={{}} onPick={() => setSelected(0)} />
        <div className="world"><Village states={states} route={route} routeCurrent={selected} onPickPlace={pickPlace} /></div>
        <div className="rlane"><ResultLane results={results} units={[unit]} selected={null} onPick={() => {}} onClose={() => {}} onOpenUnit={() => {}} />{!results.length && <p className="case-empty">아직 생성된 결과가 없어요</p>}</div>
      </section>
    </section>

    <section className="step-detail" aria-label={`${current.title} 상세`}>
      <header className="step-detail-head">
        <div><span className="eyebrow">{selected + 1}단계</span><span className="eyebrow">{current.actor}</span><h3>{current.title}</h3><p>{current.summary}</p></div>
        <span className={BADGE[current.status === 'd' ? '완료' : current.status === 'w' ? '확인 필요' : current.status === 'c' ? '진행 중' : '대기 중']}>{STEP_LABEL[current.status]}</span>
      </header>

      {todo && <div className={`todo-toggle${todoOpen ? ' open' : ''}`}>
        <button type="button" className="todo-toggle-head" aria-expanded={todoOpen} onClick={() => setTodoOpen(o => !o)}>
          <span><strong>할 일 {todo.items.length}건</strong><small>{todo.spec.assignee}</small></span>
          <span className="todo-chevron" aria-hidden="true"><ChevronRightIcon /></span>
        </button>
        {todoOpen && <ul className="todo-rows">{todo.items.map(item => {
          const d = decided[item.id]
          return <li key={item.id}>
            <span className="todo-copy"><strong>{todo.spec.question(item)}</strong><small>{item.id}</small></span>
            {d ? <span className="todo-done"><b>{d === 'o' ? todo.spec.o : todo.spec.x}</b><button type="button" onClick={() => setDecided(x => { const n = { ...x }; delete n[item.id]; return n })}>되돌리기</button></span>
              : <span className="ox"><button type="button" className="ox-o" onClick={() => decide(item.id, 'o')}><i aria-hidden="true">O</i>{todo.spec.o}</button><button type="button" className="ox-x" onClick={() => decide(item.id, 'x')}><i aria-hidden="true">X</i>{todo.spec.x}</button></span>}
          </li>
        })}</ul>}
      </div>}

      <div className="step-block"><h4>근거</h4>
        {docs.length ? <div className="proof-links">{docs.map(e => <button key={e.id} type="button" className="proof-link" onClick={() => setDocId(e.id)}><small>{destination(e, unit.g)}</small><strong>{e.title}</strong><span aria-hidden="true">↗</span></button>)}</div>
          : <p className="quiet-empty">{current.status === 'n' ? '아직 시작 전이에요.' : '이 단계에 남은 근거가 없어요.'}</p>}
      </div>

      <div className="step-block"><h4>항목 <span>{items.length}</span></h4>
        {items.length > 1 && <div className="item-filters">{statuses.map(st => { const n = st === '전체' ? items.length : items.filter(i => i.status === st).length; return n || st === '전체' ? <button key={st} type="button" className={itemFilter === st ? 'selected' : ''} onClick={() => { setItemFilter(st); setPage(0) }}>{st} <b>{n}</b></button> : null })}</div>}
        <div className="batch-list">{filtered.slice(page * 8, page * 8 + 8).map(item => <button key={item.id} type="button" className="batch-row" onClick={() => setDocId(item.evidence)}><span className="batch-id">{item.id}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><span className={BADGE[item.status]}>{item.status}</span><span className="batch-open-icon"><ChevronRightIcon /></span></button>)}</div>
        {pageCount > 1 && <div className="pagination"><div><button type="button" aria-label="이전" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button><span>{page + 1} / {pageCount}</span><button type="button" aria-label="다음" disabled={page + 1 >= pageCount} onClick={() => setPage(p => p + 1)}>→</button></div></div>}
      </div>
    </section>
    {openDoc && <EvidenceDialog evidence={{ ...openDoc, title: openDoc.title }} onClose={() => setDocId(null)} />}
  </>
}
