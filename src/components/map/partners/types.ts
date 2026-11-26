import type { ComponentType } from 'react'

export type ZoneId = 'hq' | 'shop' | 'wh' | 'sup' | 'bank' | 'card'

export interface PartnerDef {
  id: ZoneId
  /** 지도 이름표 글자 */
  label: string
  /** 이름표 기준 위치 (지도 폭 높이 대비 %) */
  anchor: [number, number]
  /** 바닥판 다각형 */
  plate: { points: string; cls: string }[]
  /** (주)엘리먼츠와 잇는 연결선 좌표. 우리 회사는 null */
  flow: string | null
  /** 건물 일러스트 */
  Building: ComponentType
}
