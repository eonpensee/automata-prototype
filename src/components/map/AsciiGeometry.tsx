import type { PartnerDef, ZoneId } from './partners/types'

type P = [number,number,number]
// A lower, wider isometric view gives characters room to describe the facade.
const p=([x,y,z]:P)=>[.866*(x-y),.34*(x+y)-z]
const points=(a:P[])=>a.map(v=>p(v).join(',')).join(' ')
function Face({v,cls='fy'}:{v:P[];cls?:string}){return <polygon points={points(v)} className={cls}/>}
function Line({a,b}:{a:P;b:P}){return <polyline points={points([a,b])} className="detail"/>}
function Block({x,y,z=0,w,d,h,cls=''}:{x:number;y:number;z?:number;w:number;d:number;h:number;cls?:string}){
  return <g className={cls}>
    <Face v={[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]]}/>
    <Face cls="fx" v={[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]]}/>
    <Face cls="ft" v={[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]]}/>
  </g>
}
function Box({x,y,z=0}:{x:number;y:number;z?:number}){return <g><Block x={x} y={y} z={z} w={17} d={17} h={17}/><Line a={[x+8,y,z+17]} b={[x+8,y+17,z+17]}/></g>}
function Office({card,frame,working}:{card:boolean;frame:number;working:boolean}){
  const h=card?49:94
  return <>
    <Block x={-30} y={-25} w={60} d={50} h={h}/>
    <Block x={-32} y={-27} z={h} w={64} d={54} h={3}/>
    <Face cls="door" v={[[-8,25.2,0],[7,25.2,0],[7,25.2,19],[-8,25.2,19]]}/>
    <Block x={-12} y={24} z={20} w={23} d={8} h={2}/>
    {card&&<><Face cls="ft" v={[[-23,25.5,29],[-3,25.5,29],[-3,25.5,41],[-23,25.5,41]]}/><Line a={[-21,25.8,37]} b={[-5,25.8,37]}/></>}
    {working&&<Face cls="signal" v={[[3,25.8,33],[3+Math.max(2,(frame%2)*8),25.8,33],[3+Math.max(2,(frame%2)*8),25.8,36],[3,25.8,36]]}/>}
  </>
}
function Bank(){return <>
  <Block x={-40} y={-27} w={80} d={54} h={5}/>
  <Block x={-34} y={-25} z={5} w={68} d={39} h={48}/>
  {[-29,-10,9,28].map(x=><g key={x}><Block x={x-4} y={17} z={5} w={8} d={8} h={43}/><Block x={x-5} y={16} z={45} w={10} d={10} h={4}/></g>)}
  <Block x={-41} y={-29} z={49} w={82} d={58} h={5}/>
  <Face cls="ft" v={[[-43,-31,54],[0,-31,77],[0,31,77],[-43,31,54]]}/>
  <Face cls="fx" v={[[0,-31,77],[43,-31,54],[43,31,54],[0,31,77]]}/>
  <Face v={[[-43,31,54],[43,31,54],[0,31,77]]}/>
  <Line a={[-26,31.2,59]} b={[25,31.2,59]}/>
</>}
function Conveyor({frame,working}:{frame:number;working:boolean}){return <>
  {[-45,38].flatMap(x=>[10,28].map(y=><Block key={`${x}-${y}`} x={x} y={y} w={3} d={3} h={12}/>))}
  <Block x={-49} y={7} z={12} w={98} d={29} h={4}/>
  {Array.from({length:16},(_,i)=><Line key={i} a={[-47+i*6,9,16.2]} b={[-47+i*6,34,16.2]}/>)}
  {[0,1,2].map(i=><Box key={i} x={-46+((working?frame/7:0)+i/3)%1*76} y={12} z={16}/>)}
</>}
function Warehouse({frame,working,interior}:{frame:number;working:boolean;interior:boolean}){
  if(interior)return <><Box x={-30} y={-45}/><Box x={-11} y={-45}/><Box x={-30} y={-45} z={17}/><Box x={16} y={-37}/><Conveyor frame={frame} working={working}/></>
  return <>
    <Block x={-39} y={-35} w={78} d={62} h={41}/>
    <Face cls="ft" v={[[-43,-39,41],[0,-39,65],[0,31,65],[-43,31,41]]}/>
    <Face cls="fx" v={[[0,-39,65],[43,-39,41],[43,31,41],[0,31,65]]}/>
    <Face v={[[-39,27.2,41],[39,27.2,41],[0,27.2,63]]}/>
    <Face cls="door" v={[[-13,27.4,0],[21,27.4,0],[21,27.4,32],[-13,27.4,32]]}/>
    {[8,15,22,29].map(z=><Line key={z} a={[-12,27.6,z]} b={[20,27.6,z]}/>)}
    <Box x={-41} y={29}/><Box x={-22} y={34}/>
    {working&&<Box x={5+(frame%4)/4*29} y={33}/>}
  </>
}
function Factory(){return <>
  <Block x={-35} y={-28} w={70} d={56} h={30}/>
  {[-28,-7,14].map(x=><g key={x}><Face cls="ft" v={[[x,-28,30],[x+21,-28,41],[x+21,28,41],[x,28,30]]}/><Face cls="fx" v={[[x+21,-28,30],[x+21,28,30],[x+21,28,41],[x+21,-28,41]]}/></g>)}
  <Block x={15} y={-21} z={30} w={10} d={10} h={55}/>
  <Face cls="door" v={[[-13,28.2,0],[8,28.2,0],[8,28.2,20],[-13,28.2,20]]}/>
</>}
function Desk({mode,frame,working}:{mode:ZoneId;frame:number;working:boolean}){return <>
  {[-30,27].flatMap(x=>[-16,15].map(y=><Block key={`${x}-${y}`} x={x} y={y} w={4} d={4} h={27}/>))}
  <Block x={-35} y={-21} z={27} w={73} d={46} h={4}/>
  <Block x={-5} y={-13} z={30} w={14} d={9} h={2}/>
  <Block x={0} y={-10} z={32} w={3} d={3} h={7}/>
  <Face cls="monitor" v={[[-24,-11,38],[27,-11,38],[27,-11,69],[-24,-11,69]]}/>
  <Face cls="screen" v={[[-20,-10.8,42],[23,-10.8,42],[23,-10.8,65],[-20,-10.8,65]]}/>
  {[0,1,2].map(i=><Line key={i} a={[-15,-10.5,59-i*6]} b={[-15+(working?8+((frame+i*.6)%3)/3*27:27-i*5),-10.5,59-i*6]}/>)}
  {mode==='card'&&<Face cls="window" v={[[9,-10.4,44],[20,-10.4,44],[20,-10.4,52],[9,-10.4,52]]}/>}
  <Block x={-21} y={4} z={30} w={37} d={11} h={1}/>
  <Line a={[-17,7,31.2]} b={[12,7,31.2]}/><Line a={[-17,11,31.2]} b={[12,11,31.2]}/>
  <Block x={25} y={7} z={30} w={5} d={8} h={2}/>
</>}
export function AsciiGeometry({partner,interior,frame,working}:{partner:PartnerDef;interior:boolean;frame:number;working:boolean}){
  const pts=partner.plate.find(p=>p.cls==='ft')!.points.split(' ').map(v=>v.split(',').map(Number))
  const cx=pts.reduce((s,p)=>s+p[0],0)/4,cy=pts.reduce((s,p)=>s+p[1],0)/4
  const scale=(Math.max(...pts.map(p=>p[0]))-Math.min(...pts.map(p=>p[0])))/208
  return <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
    <Block x={-60} y={-60} z={-4} w={120} d={120} h={4} cls="ascii-plate"/>
    {interior?(partner.id==='wh'?<Warehouse frame={frame} working={working} interior/>:<g className="ascii-desk"><Desk mode={partner.id} frame={frame} working={working}/></g>):partner.id==='bank'?<Bank/>:partner.id==='wh'?<Warehouse frame={frame} working={working} interior={false}/>:partner.id==='sup'?<Factory/>:<Office card={partner.id==='card'} frame={frame} working={working}/>}
  </g>
}
