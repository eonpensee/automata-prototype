import type { PartnerDef, ZoneId } from './partners/types'
import './building-interior.css'

type Point = [number, number, number]
// Every surface shares the same 30-degree isometric projection as the existing plate.
const project = ([x,y,z]:Point) => [90 + (x-y)*Math.sqrt(3)/2, 90 + (x+y)/2-z]
const points = (vertices:Point[]) => vertices.map(p=>project(p).join(',')).join(' ')
function Line({a,b,className='mini-line'}:{a:Point;b:Point;className?:string}) {
  return <polyline points={points([a,b])} className={className}/>
}
function Solid({x,y,z=0,w,d,h}:{x:number;y:number;z?:number;w:number;d:number;h:number}) {
  return <g>
    <polygon className="mini-front" points={points([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]])}/>
    <polygon className="mini-side" points={points([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]])}/>
    <polygon className="mini-top" points={points([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]])}/>
  </g>
}
function Parcel({x,y,z=0}:{x:number;y:number;z?:number}) {
  return <g className="mini-parcel"><Solid x={x} y={y} z={z} w={17} d={17} h={18}/>
    <Line a={[x+7,y,z+18]} b={[x+7,y+17,z+18]}/><Line a={[x+10,y,z+18]} b={[x+10,y+17,z+18]}/>
    <Line a={[x+7,y+17,z+18]} b={[x+7,y+17,z+12]}/>
  </g>
}
function Desk({mode}:{mode:ZoneId}) {
  const screen = project([-23,-8,62])
  return <g className="mini-desk">
    {([-30,27] as const).flatMap(x=>([-14,11] as const).map(y=><Solid key={`${x}-${y}`} x={x} y={y} w={3} d={3} h={26}/>))}
    <Solid x={-34} y={-18} z={26} w={68} d={36} h={3}/>
    <Solid x={-7} y={-11} z={29} w={15} d={9} h={2}/>
    <Solid x={-1} y={-8} z={31} w={3} d={3} h={8}/>
    <g transform={`matrix(${Math.sqrt(3)/2} .5 0 1 ${screen[0]} ${screen[1]})`}>
      <rect width="46" height="27" rx="1.5" className="mini-monitor"/>
      <rect x="3" y="3" width="40" height="21" rx=".5" className="mini-screen"/>
      {mode==='hq'||mode==='shop'?<path d="M8 8h28M8 13h24M8 18h18" className="mini-typing"/>:
        mode==='card'?<><rect x="11" y="7" width="24" height="14" rx="2" className="mini-monitor"/><path d="M11 11h24M15 17h5" className="mini-line"/></>:
        <><path d="M8 8h19M8 14h19M8 20h19" className="mini-line"/><path d="m32 8 2 2 4-4m-6 10 2 2 4-4" className="mini-check"/></>}
    </g>
    <Solid x={-19} y={3} z={29} w={34} d={10} h={1}/>
    {[6,9].map(y=><Line key={y} a={[-15,y,30.2]} b={[11,y,30.2]} className="mini-key-typing"/>)}
    <Solid x={22} y={5} z={29} w={5} d={7} h={2}/>
  </g>
}
function Warehouse() {
  return <g className="mini-warehouse">
    <Parcel x={-26} y={-48}/><Parcel x={-7} y={-48}/><Parcel x={-26} y={-48} z={18}/>
    <Parcel x={14} y={-39}/><Parcel x={-6} y={-28}/>
    {[-43,39].flatMap(x=>[6,24].map(y=><Solid key={`${x}-${y}`} x={x} y={y} w={3} d={3} h={12}/>))}
    <Solid x={-48} y={3} z={12} w={96} d={28} h={4}/>
    {Array.from({length:16},(_,i)=><Line key={i} a={[-45+i*6,5,16.2]} b={[-45+i*6,29,16.2]} className="mini-roller"/>)}
    <Line a={[-48,3,17]} b={[48,3,17]}/><Line a={[-48,31,17]} b={[48,31,17]}/>
    {[0,1,2].map(i=><g key={i} className="mini-moving-box" style={{animationDelay:`${-i*2.8}s`}}><Parcel x={-44} y={8} z={16}/></g>)}
  </g>
}
export function BuildingInterior({partner}:{partner:PartnerDef}) {
  const floor=partner.plate.find(p=>p.cls==='ft')!.points.split(' ').map(p=>p.split(',').map(Number))
  const cx=floor.reduce((n,p)=>n+p[0],0)/floor.length,cy=floor.reduce((n,p)=>n+p[1],0)/floor.length
  const w=(Math.max(...floor.map(p=>p[0]))-Math.min(...floor.map(p=>p[0])))*.86,h=w*150/180
  return <svg x={cx-w/2} y={cy-h*.6} width={w} height={h} viewBox="0 0 180 150" className="building-interior" aria-hidden="true">
    {partner.id==='wh'?<Warehouse/>:<Desk mode={partner.id}/>}
  </svg>
}
