import { Hq } from './Hq'
import { Shop } from './Shop'
import { Warehouse } from './Warehouse'
import { Supplier } from './Supplier'
import { Bank } from './Bank'
import { CardCompany } from './CardCompany'
import type { PartnerDef, ZoneId } from './types'

export { Hq, Shop, Warehouse, Supplier, Bank, CardCompany }
export type { PartnerDef, ZoneId }

/** 지도에 그리는 순서(뒤에 있는 것이 위로 올라와요) */
export const PARTNERS: PartnerDef[] = [Hq, Shop, Warehouse, Supplier, Bank, CardCompany]
