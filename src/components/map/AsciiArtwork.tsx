import { useEffect, useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AsciiGeometry } from './AsciiGeometry'
import type { PartnerDef } from './partners/types'

// Sample the existing isometric geometry into a fixed character grid. The art
// remains real text, while the original geometry keeps perspective consistent.
const CELL_X = 3.6
const CELL_Y = 5.4
const RAMP = ' .:-=+01#'
const PALETTE = `
  polygon,rect,path,polyline,line{stroke:#4c5c40;stroke-width:1.2;stroke-linejoin:round;fill:none}
  .ft{fill:#dbe2d0}.fy{fill:#b9c7aa}.fx{fill:#718461}
  .detail{stroke:#455b40;stroke-width:1.15;fill:none}
  .window,.door{fill:#344d38;stroke:#344d38}.window-side{fill:#526c4b}
  .monitor{fill:#6e8467}.screen{fill:#f3f4e9}.signal{fill:#d7e4c6}
  .ascii-desk polygon{stroke:#344b2c;stroke-width:1.3}
  .ascii-desk .ft{fill:#b2c398}.ascii-desk .fy{fill:#79915f}.ascii-desk .fx{fill:#4b6538}
  .ascii-desk .monitor{fill:#516d3d;stroke-width:1.5}.ascii-desk .screen{fill:#e5edda}
  .ascii-desk .detail{stroke:#304727;stroke-width:1.5}
  .ascii-plate .ft{fill:#f5f6ef;stroke:#a4b09c;stroke-width:.65}
  .ascii-plate .fx{fill:#b4c0aa}.ascii-plate .fy{fill:#d4dccb}
`
const TONES = ['#b4bcae','#a4ae9b','#919f85','#7c8f6f','#627b55','#49663e','#35562e','#24461e']
type Art = { lines:string[]; x:number; y:number; width:number; height:number }

export function AsciiArtwork({partner,interior,working,flowing}:{partner:PartnerDef;interior:boolean;working:boolean;flowing:boolean}) {
  const animated = flowing || working || interior
  const [frame,setFrame] = useState(0)
  const [art,setArt] = useState<Art | null>(null)
  const box = useMemo(()=>{
    const pts=partner.plate.flatMap(p=>p.points.split(' ').map(v=>v.split(',').map(Number)))
    const x=Math.min(...pts.map(p=>p[0]))-5
    const y=Math.min(partner.anchor[1]*7.24-28,Math.min(...pts.map(p=>p[1]))-95)
    return {x,y,width:Math.max(...pts.map(p=>p[0]))-x+5,height:Math.max(...pts.map(p=>p[1]))-y+5}
  },[partner])

  useEffect(()=>{
    setFrame(0)
    if(!animated) return
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)')
    if(motion.matches) return
    const started=performance.now()
    const timer=window.setInterval(()=>{
      if(!document.hidden) setFrame((performance.now()-started)/1000)
    },50)
    return ()=>window.clearInterval(timer)
  },[interior,partner.id,animated])

  useEffect(()=>{
    let alive=true
    const cols=Math.ceil(box.width/CELL_X), rows=Math.ceil(box.height/CELL_Y)
    const scale=4
    const svg=renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={cols*scale} height={rows*scale} preserveAspectRatio="none" viewBox={`${box.x} ${box.y} ${cols*CELL_X} ${rows*CELL_Y}`}>
      <style>{PALETTE}</style>
      <AsciiGeometry partner={partner} interior={interior} frame={frame} working={working || interior}/>
    </svg>)
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}))
    const image=new Image()
    image.onload=()=>{
      URL.revokeObjectURL(url)
      if(!alive)return
      const canvas=document.createElement('canvas')
      canvas.width=cols*scale;canvas.height=rows*scale
      const ctx=canvas.getContext('2d',{willReadFrequently:true})
      if(!ctx)return
      ctx.drawImage(image,0,0)
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data
      const lines:string[]=[]
      for(let row=0;row<rows;row++){
        let line=''
        for(let col=0;col<cols;col++){
          let ink=0,coverage=0
          for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){
            const i=((row*scale+dy)*canvas.width+col*scale+dx)*4
            const a=pixels[i+3]/255
            coverage+=a
            ink+=(1-(pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255)*a
          }
          const base=ink/(scale*scale)
          // A travelling band changes character density without moving the
          // silhouette. It reads as flowing data, rather than random flicker.
          const wave=animated && base>.06 ? Math.pow((Math.sin(col*.24+row*.15-frame*2.1)+1)/2,4)*.085 : 0
          const density=base+wave
          const index=coverage<1 ? 0 : Math.max(1,Math.min(RAMP.length-1,Math.round(density*12)))
          line+=RAMP[index]
        }
        lines.push(line)
      }
      const next={...box,lines}
      setArt(next)
    }
    image.onerror=()=>URL.revokeObjectURL(url)
    image.src=url
    return ()=>{alive=false;URL.revokeObjectURL(url)}
  },[partner,interior,frame,animated,working,box,AsciiGeometry])

  return <g className={`ascii-art${interior?' ascii-interior':''}`} aria-hidden="true">
    {/* The transparent hit area preserves the existing building interaction. */}
    <rect x={box.x} y={box.y} width={box.width} height={box.height} fill="transparent" stroke="none"/>
    {art?.lines.map((line,i)=><text key={i} x={art.x} y={art.y+(i+1)*CELL_Y} fontSize={6} fontFamily="'Courier New',monospace" textLength={line.length*CELL_X} lengthAdjust="spacingAndGlyphs" xmlSpace="preserve">{line.match(/(.)\1*/g)?.map((run,j)=><tspan key={j} fill={TONES[Math.max(0,RAMP.indexOf(run[0])-1)]} fontWeight={RAMP.indexOf(run[0])>=6?700:400}>{run}</tspan>)}</text>)}
  </g>
}
