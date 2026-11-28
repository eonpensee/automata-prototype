// 로컬 엔진에서 뽑은 케이스 (../../demo-seed/export_prototype.py)
// 기본: 송영철공작소 합성 DB(dev_song, 1년치 생성기) → engine-cases-song.json
// 주소 뒤 ?data=demo 는 데모 가상 데이터(engine-cases.json), ?data=mock 은 기존 목업(review.ts)
import song from './engine-cases-song.json'
import demo from './engine-cases.json'
import type { FlowCase } from './review'

interface EngineDay { id: string; label: string; cases: FlowCase[] }
interface EngineExport { exportedAt: string; days: EngineDay[] }
// 6번은 첫 화면에 건이 고루 보이도록 데모 데이터가 기본, ?data=song 으로 송공작소 데이터
const PICK = new URLSearchParams(location.search).get('data') ?? (/\/[678]\/?(index\.html)?$/.test(location.pathname) ? 'demo' : 'song')
const RAW = (PICK === 'demo' ? demo : song) as unknown as EngineExport
const DAYS = RAW.days

export const ENGINE_DATES = DAYS.map(d => ({ id: d.id, label: d.label }))
export const engineCasesForDate = (date: string): FlowCase[] => DAYS.find(d => d.id === date)?.cases ?? []
export const ENGINE_EXPORTED_AT = RAW.exportedAt
