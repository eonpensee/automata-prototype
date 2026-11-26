import { useEffect, useRef, useState } from 'react'
import { APPROVAL_REQUESTS, type BatchItem, type Evidence, type FlowCase } from '../data/review'
import type { Status, Unit } from '../data/today'
import { BADGE } from '../logic'
import { CloseIcon, ChevronRightIcon } from './Icons'

const STEP_LABEL = { d: '완료', c: '진행 중', w: '확인 필요', q: '대기 중', n: '아직 시작 전' }
const CATEGORY = { input: '입력 자료', output: '처리 결과', session: '처리 기록', decision: '결정 기록' }

export function EvidenceDialog({ evidence, onClose }: { evidence: Evidence; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const d = ref.current!; d.showModal(); return () => d.close() }, [])
  return <dialog ref={ref} className="evidence-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }} aria-label={evidence.title}>
    <div className="evidence-sheet">
      <header><div><span className="eyebrow">{CATEGORY[evidence.kind]}</span><h2>{evidence.title}</h2></div><button className="rdx" autoFocus onClick={onClose} aria-label="자료 닫기"><CloseIcon /></button></header>
      <div className="evidence-body"><p className="doc-text">{evidence.body}</p>
        {evidence.columns && <div className="doc-table-wrap"><table className="doc-table"><thead><tr>{evidence.columns.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{evidence.rows?.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
      </div>
    </div>
  </dialog>
}

export function UnitWorkspace({ flow, related, onSelect, onBack }: { flow: FlowCase; related: Unit[]; onSelect: (id: string) => void; onBack: () => void }) {
  const { unit, steps, items, evidence } = flow
  const initial = steps.findIndex(s => s.status === 'w' || s.status === 'c' || s.status === 'q')
  const [selected, setSelected] = useState(initial < 0 ? steps.length - 1 : initial)
  const defaultFilter = (stepIndex: number): Status | '전체' => steps[stepIndex]?.status === 'w' && items.some(item => item.status === '확인 필요') ? '확인 필요' : '전체'
  const [itemFilter, setItemFilter] = useState<Status | '전체'>(() => defaultFilter(initial < 0 ? steps.length - 1 : initial))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [docId, setDocId] = useState<string | null>(null)
  const current = steps[selected]
  const approvalRequest = current.status === 'w' ? APPROVAL_REQUESTS[unit.id] : undefined
  const currentDocs = current.evidence.map(id => evidence.find(e => e.id === id)).filter((e): e is Evidence => !!e)
  const filtered = items.filter(i => (itemFilter === '전체' || i.status === itemFilter) && `${i.id} ${i.title} ${i.detail}`.toLowerCase().includes(search.toLowerCase()))
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8)), visibleItems = filtered.slice(page * 8, page * 8 + 8)
  const selectedDoc = evidence.find(e => e.id === docId)
  const filterItems = (status: Status | '전체') => { setItemFilter(status); setPage(0) }
  const statuses: (Status | '전체')[] = ['전체', '확인 필요', '대기 중', '진행 중', '완료']
  const openItem = (item: BatchItem) => setDocId(item.evidence)
  return <section className="unit-workspace" aria-label={`${unit.name} 처리 흐름`}>
    <div className="unit-crumb"><button className="detail-back" aria-label="전체 현황으로 돌아가기" onClick={onBack}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button></div>
    <header className="unit-heading">{related.length > 1 ? <nav className="unit-switcher" aria-label="같은 건물의 업무">{related.map(item => <button key={item.id} type="button" aria-current={item.id === unit.id ? 'page' : undefined} onClick={() => onSelect(item.id)}>{item.name}</button>)}</nav> : <h2>{unit.name}</h2>}
    </header>
    <div className="flow-workspace-grid">
      <aside className="flow-sidebar"><span className="eyebrow">{steps.filter(s => s.status === 'd').length}/{steps.length} 완료</span>
        <ol className="flow-step-list">{steps.map((s, i) => <li key={s.title} className={`flow-step ${s.status}${selected === i ? ' selected' : ''}`}><button onClick={() => { setSelected(i); setSearch(''); filterItems(defaultFilter(i)) }} aria-current={selected === i ? 'step' : undefined}><span className="step-number" aria-hidden="true" /><span><strong>{s.title}</strong><small>{STEP_LABEL[s.status]}</small></span><span className="step-time">{s.time}</span></button></li>)}</ol>
        
      </aside>
      <div className="flow-content">
        <section className="step-focus"><div className="step-focus-copy"><span className="eyebrow">{current.actor}</span><h3>{current.title}</h3><p>{current.summary}</p></div>{approvalRequest && <a className="approval-request-link" href={approvalRequest.href} target="_blank" rel="noopener noreferrer">{approvalRequest.label}<span aria-hidden="true">↗</span></a>}</section>
        <div className="resource-section"><div className="section-title"><h3>자료</h3></div>
          {currentDocs.length ? <div className="resource-grid">{currentDocs.map(e => <button key={e.id} className="resource-card" onClick={() => setDocId(e.id)}><span className="resource-symbol">{e.kind === 'output' ? '↗' : e.kind === 'decision' ? '✓' : '≡'}</span><span><small>{CATEGORY[e.kind]}</small><strong>{e.title}</strong></span><span className="batch-open-icon"><ChevronRightIcon /></span></button>)}</div> : <p className="quiet-empty">{current.status === 'n' ? '아직 시작 전입니다.' : '자료가 없습니다.'}</p>}
        </div>
        <section className="batch-section"><div className="section-title"><div><h3>항목 <span>{items.length}</span></h3></div>{items.length > 8 && <input aria-label="묶음 내 항목 검색" placeholder="번호 내용 검색" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />}</div>
          {items.length > 1 && <div className="item-filters" aria-label="개별 항목 상태">{statuses.map(status => { const count = status === '전체' ? items.length : items.filter(i => i.status === status).length; return count > 0 || status === '전체' ? <button key={status} className={itemFilter === status ? 'selected' : ''} aria-pressed={itemFilter === status} onClick={() => filterItems(status)}>{status} <b>{count}</b></button> : null })}</div>}
          <div className="batch-list">{visibleItems.map(item => <button key={item.id} className="batch-row" onClick={() => openItem(item)}><span className="batch-id">{item.id}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><span className={BADGE[item.status]}>{item.status}</span><span className="batch-open-icon"><ChevronRightIcon /></span></button>)}{!visibleItems.length && <p className="quiet-empty">검색 조건에 맞는 항목이 없어요.</p>}</div>
          {pageCount > 1 && <div className="pagination"><div><button aria-label="이전 항목 페이지" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button><span>{page + 1} / {pageCount}</span><button aria-label="다음 항목 페이지" disabled={page + 1 >= pageCount} onClick={() => setPage(p => p + 1)}>→</button></div></div>}
        </section>
        {flow.eventLog.length > 0 && <details className="event-log"><summary>처리 기록</summary><ol>{flow.eventLog.map((event, i) => <li key={`${event.time}-${i}`}><time>{event.time}</time><span>{event.text}</span></li>)}</ol></details>}
      </div>
    </div>
    {selectedDoc && <EvidenceDialog evidence={selectedDoc} onClose={() => setDocId(null)} />}
  </section>
}
