import { useState } from 'react'
import type { FlowCase } from '../data/review'
import type { SourceIcon, Status } from '../data/today'
import { BADGE } from '../logic'
import { SourceGlyph } from '../components/Icons'
import { resultLine, type ProcUnit } from './units'

const ICON: Record<string, SourceIcon> = { mail: 'mail', ss: 'shop', cp: 'shop', bank: 'bank', card: 'card', manual: 'upload', chk: 'check' }
export type Filter = Status | '전체'

/** 맨 위 요약: 누를 수 있는 숫자 타일(필터) 4개와, 그 아래 한 단계 낮은 '오늘 처리한 업무' 결과 줄 */
export function SummaryBar({ units, filter, onFilter }: { units: ProcUnit[]; cases?: FlowCase[]; filter: Filter; onFilter: (f: Filter) => void }) {
  // 처리 단위 기준으로 세요 (단위 '개')
  const count = (st: Status) => units.filter(u => u.st === st).length
  const tile = (f: Filter, label: string, n: number, mark: string, cls = '') =>
    <button type="button" className={'sb6-tile ' + cls + (filter === f ? ' on' : '')} onClick={() => onFilter(filter === f ? '전체' : f)} aria-pressed={filter === f}>
      <span className="sb6-label">{mark && <i className={'sb6-mark ' + mark} aria-hidden="true" />}{label}</span><span className="sb6-num">{n}<small>개</small></span>
    </button>
  const need = count('확인 필요')
  return <section className="sb6" aria-label="오늘 요약">
    <div className="sb6-tiles">
      {tile('전체', '전체', units.length, '')}
      {tile('대기 중', '대기 중', count('대기 중'), 'wait')}
      {tile('진행 중', '진행 중', count('진행 중'), 'mid')}
      {tile('완료', '완료', count('완료'), 'done')}
      {tile('확인 필요', '확인 필요', need, 'need', 'need' + (need ? ' has' : ''))}
    </div>
  </section>
}

/** 오른쪽: 오늘 들어온 자료(처리 단위) 목록. 한 번의 수집은 한 장, 안에 여러 건 */
export function UnitFeed({ units, onOpenCase, sourceName, onClearSource }: { units: ProcUnit[]; onOpenCase: (id: string) => void; sourceName?: string; onClearSource?: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  return <section className="uf5" aria-label="오늘 들어온 자료">
    <div className="uf5-headline">
      {sourceName
        ? <><h3 className="uf5-title">{sourceName}에서 들어온 자료 <b>{units.reduce((n, u) => n + u.cases.length, 0)}건</b></h3><button type="button" className="uf5-clear" onClick={onClearSource}>전체 보기</button></>
        : <h3 className="uf5-title">오늘 들어온 자료 <b>{units.length}</b></h3>}
    </div>
    <div className="uf5-list">
      {units.map(u => {
        const multi = u.cases.length > 1, isOpen = !!sourceName || open === u.id
        return <article key={u.id} className={'uf5-card' + (isOpen ? ' open' : '')}>
          <button type="button" className="uf5-head" onClick={() => multi ? setOpen(isOpen ? null : u.id) : onOpenCase(u.cases[0].unit.id)}>
            <span className="uf5-top"><span className="uf5-src"><SourceGlyph icon={ICON[u.source] ?? 'upload'} /></span><span className="uf5-time mono">{u.time}</span><span className={BADGE[u.st] + ' uf5-badge'}>{u.st}</span></span>
            <b className="uf5-name">{u.title}</b>
            <span className="uf5-sub">{u.sub}</span>
            {u.results && <span className="uf5-result">{u.results}</span>}
            {multi && u.done < u.cases.length && <span className="uf5-progress" aria-label={`${u.cases.length}건 중 ${u.done}건 완료`}><i style={{ width: `${u.done / u.cases.length * 100}%` }} /><em>{u.done}/{u.cases.length}</em></span>}
          </button>
          {multi && isOpen && <ul className="uf5-items">{u.cases.map(c => <li key={c.unit.id}>
            <button type="button" onClick={() => onOpenCase(c.unit.id)}><span>{c.unit.name}</span><span className="uf5-item-sub">{c.unit.qsub}</span><span className={BADGE[c.unit.st]}>{c.unit.st}</span></button>
          </li>)}</ul>}
        </article>
      })}
      {!units.length && <p className="quiet-empty">들어온 자료 없음</p>}
    </div>
  </section>
}

/** 처리 이력 표 (6번): 처리 단위 한 줄씩. 여러 건짜리는 누르면 안의 건이 펼쳐져요 */
export function UnitTable({ units, onOpenCase }: { units: ProcUnit[]; onOpenCase: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null)
  return <div className="ut6" role="table" aria-label="처리 이력">
    <div className="ut6-row ut6-head" role="row"><span>시각</span><span>출처</span><span>처리 단위</span><span>안에 든 건</span><span>결과</span><span>상태</span></div>
    {units.map(u => {
      const multi = u.cases.length > 1, isOpen = open === u.id
      return <div key={u.id} className={'ut6-group' + (isOpen ? ' open' : '')}>
        <button type="button" className="ut6-row" role="row" onClick={() => multi ? setOpen(isOpen ? null : u.id) : onOpenCase(u.cases[0].unit.id)}>
          <span className="mono ut6-time">{u.time}</span>
          <span className="ut6-src"><SourceGlyph icon={ICON[u.source] ?? 'upload'} />{SOURCE_NAME[u.source]}</span>
          <span className="ut6-name">{u.title}</span>
          <span className="ut6-sub">{multi ? `${u.cases.length}건${isOpen ? '' : '  펼치기'}` : u.sub}</span>
          <span className="ut6-result">{u.results}</span>
          <span><span className={BADGE[u.st]}>{!multi && u.st !== '완료' ? u.cases[0].stuck || u.st : u.st}</span></span>
        </button>
        {multi && isOpen && u.cases.map(c => <button key={c.unit.id} type="button" className="ut6-row ut6-child" role="row" onClick={() => onOpenCase(c.unit.id)}>
          <span /><span /><span className="ut6-name">{c.unit.name}</span><span className="ut6-sub">{c.unit.qsub}</span><span className="ut6-result">{resultLine([c])}</span><span><span className={BADGE[c.unit.st]}>{c.unit.st === '완료' ? '완료' : c.stuck || c.unit.st}</span></span>
        </button>)}
      </div>
    })}
    {!units.length && <p className="quiet-empty">들어온 자료 없음</p>}
  </div>
}
const SOURCE_NAME: Record<string, string> = { mail: '거래처 메일', ss: '스마트스토어', cp: '쿠팡', bank: '은행', card: '카드사', manual: '직원 입력', chk: '자동 점검' }

/** 오른쪽(만든 것): 결과 종류별 카드. 0건은 숨기고, 누르면 그 결과를 만든 건이 펼쳐져요 */
export function MadePanel({ cases, onOpenCase }: { cases: FlowCase[]; onOpenCase: (id: string) => void; scope?: string }) {
  const [open, setOpen] = useState<string | null>(null)
  const kinds = new Map<string, { n: number; inv: boolean; rows: { id: string; name: string; sub: string; n: number }[] }>()
  for (const c of cases) for (const o of c.outputs) {
    const k = MADE_NAME[o.type] ?? o.type, e = kinds.get(k) ?? { n: 0, inv: o.type === 'inv', rows: [] }
    e.n += o.count; e.rows.push({ id: c.unit.id, name: c.unit.name, sub: c.unit.qsub, n: o.count }); kinds.set(k, e)
  }
  return <section className="made6" aria-label="만든 것">
    <div className="made6-list">
      {[...kinds].map(([k, e]) => <article key={k} className={'made6-card' + (open === k ? ' open' : '')}>
        <button type="button" className="made6-head" onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k}><b>{k}</b><span className="made6-n">{e.inv ? '+' : ''}{e.n}<small>{e.inv ? '개' : '건'}</small></span></button>
        {open === k && <ul className="made6-rows">{e.rows.map((r, i) => <li key={i}><button type="button" onClick={() => onOpenCase(r.id)}><span>{r.name}</span><span className="made6-sub">{r.sub}</span></button></li>)}</ul>}
      </article>)}
    </div>
  </section>
}
const MADE_NAME: Record<string, string> = { so: '수주 등록', ship: '출고 요청', exp: '경비 전표', ar: '채권 정리', pay: '지급 기록', inv: '재고 반영', po: '발주서', mail: '발송 메일' }
