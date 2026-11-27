import { useState } from 'react'
import type { FlowCase } from '../data/review'
import type { StepCode } from '../data/today'
import { currentStep, stepNodes, type Place } from '../data/nodes'
import { BADGE } from '../logic'
import { CloseIcon } from '../components/Icons'

/** 시안 5 오른쪽: 마을에서 고른 곳의 건들. 꼭 필요한 것만 (시각, 이름, 상태, 금액. 펼치면 현재 상태, 단계, 근거) */
const WORD: Record<StepCode, string> = { d: '완료', w: '확인 필요', c: '진행 중', q: '대기', n: '예정' }
const STATUS: Record<StepCode, '완료' | '확인 필요' | '진행 중' | '대기 중'> = { d: '완료', w: '확인 필요', c: '진행 중', q: '대기 중', n: '대기 중' }

export function PlacePanel({ place, cases, hereIds, onClose, onOpenCase }: {
  place: Place; cases: FlowCase[]; hereIds: string[]; onClose: () => void; onOpenCase: (id: string) => void
}) {
  const ordered = [...cases.filter(c => hereIds.includes(c.unit.id)), ...cases.filter(c => !hereIds.includes(c.unit.id))]
  const [doc, setDoc] = useState<string | null>(null)
  return <aside className="pp5" aria-label={`${place.name} 상세`}>
    <header className="pp5-head">
      <h2>{place.name}</h2>
      <button type="button" className="rdx" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
    </header>
    <div className="pp5-list">
      {ordered.map(c => {
        // 이 건물에서 일어난 단계: 지금 여기 있으면 지금 단계, 아니면 이곳을 지난 마지막 단계
        const nodes = stepNodes(c), cur0 = currentStep(c)
        const here = c.steps.map((_, k) => k).filter(k => nodes[k]?.place === place.id)
        const i = here.includes(cur0) ? cur0 : here.filter(k => k <= cur0).pop() ?? here[0] ?? cur0
        const cur = c.steps[i]
        const state = `${cur.title} ${WORD[cur.status]}`
        const docs = here.flatMap(k => c.steps[k].evidence).filter((id, k, a) => a.indexOf(id) === k).map(id => c.evidence.find(e => e.id === id)).filter(Boolean) as FlowCase['evidence']
        return <article key={c.unit.id} className="pc5" role="button" tabIndex={0} onClick={() => onOpenCase(c.unit.id)} onKeyDown={e => { if (e.key === 'Enter') onOpenCase(c.unit.id) }} aria-label={`${c.unit.name} 자세히`}>
          <div className="pc5-row"><b className="pc5-name">{c.unit.name}</b><span className={BADGE[STATUS[cur.status]] + ' pc5-badge'}>{state}</span></div>
          <div className="pc5-row pc5-meta"><span className="pc5-amount">{c.unit.qsub}</span><span className="pc5-time mono">{cur.time || c.unit.t}</span></div>
          {docs[0] && <div className="pc5-row pc5-docrow">
            <button type="button" className={'pc5-doc' + (doc === docs[0].id ? ' on' : '')} onClick={e => { e.stopPropagation(); setDoc(doc === docs[0].id ? null : docs[0].id) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
              {docs[0].title.split(' (')[0]}</button>
            <span className="pc5-go" aria-hidden="true">→</span>
          </div>}
          {docs[0] && doc === docs[0].id && <div className="pp5-doc-body" onClick={e => e.stopPropagation()}><p>{docs[0].body}</p>
            {docs[0].columns && <table><thead><tr>{docs[0].columns.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{docs[0].rows?.map((r, ri) => <tr key={ri}>{r.map((v, vi) => <td key={vi}>{v}</td>)}</tr>)}</tbody></table>}
          </div>}
        </article>
      })}
      {!cases.length && <p className="quiet-empty">오늘 이곳을 지나간 건 없음</p>}
    </div>
  </aside>
}
