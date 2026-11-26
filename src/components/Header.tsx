import { useEffect, useId, useRef, useState } from 'react'

interface DateOption { id: string; label: string }
interface Props {
  dates: readonly DateOption[]
  selectedDate: string
  onSelectDate: (id: string) => void
}

export function Header({ dates, selectedDate, onSelectDate }: Props) {
  const index = dates.findIndex(d => d.id === selectedDate)
  const [open, setOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  useEffect(() => {
    if (!open) return
    pickerRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
    const outside = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  const chooseDate = (id: string) => {
    onSelectDate(id)
    setOpen(false)
    triggerRef.current?.focus()
  }
  return <div className="page-heading">
    <h1>자동 처리 현황</h1>
    <div className="date-controls">
      <button className="btn icon" aria-label="전날" disabled={index === 0} onClick={() => onSelectDate(dates[index - 1].id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <div className="date-picker-wrap" ref={pickerRef}>
        <button type="button" className="date-picker" ref={triggerRef} aria-label={`날짜 선택 ${dates[index].label}`} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(v => !v)} onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true) } }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
          <span>{dates[index].label}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {open && <div id={menuId} className="date-menu" role="menu" aria-label="날짜 선택" onKeyDown={e => {
          const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
          const focused = buttons.indexOf(document.activeElement as HTMLButtonElement)
          if (e.key === 'Escape') { e.preventDefault(); setOpen(false); triggerRef.current?.focus() }
          if (e.key === 'Tab') setOpen(false)
          const next = e.key === 'ArrowDown' ? (focused + 1) % buttons.length : e.key === 'ArrowUp' ? (focused - 1 + buttons.length) % buttons.length : e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : -1
          if (next >= 0) { e.preventDefault(); buttons[next].focus() }
        }}>{dates.map(d => <button type="button" key={d.id} role="menuitemradio" aria-checked={d.id === selectedDate} onClick={() => chooseDate(d.id)}><span>{d.label}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ visibility: d.id === selectedDate ? 'visible' : 'hidden' }}><path d="m5 12 4 4 10-10" /></svg></button>)}</div>}
      </div>
      <button className="btn icon" aria-label="다음 날" disabled={index === dates.length - 1} onClick={() => onSelectDate(dates[index + 1].id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  </div>
}
