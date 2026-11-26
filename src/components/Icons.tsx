import type { SourceIcon } from '../data/today'

const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export function SourceGlyph({ icon }: { icon: SourceIcon }) {
  switch (icon) {
    case 'mail':
      return <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
    case 'shop':
      return <svg {...base}><path d="M4 9l1.5-5h13L20 9" /><path d="M4 9h16v11H4z" /><path d="M9 20v-6h6v6" /></svg>
    case 'bank':
      return <svg {...base}><path d="M3 10l9-6 9 6" /><path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" /></svg>
    case 'card':
      return <svg {...base}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h3" /></svg>
    case 'check':
      return <svg {...base}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M9 13l2 2 4-4" /></svg>
  }
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75Z" />
      <path d="M12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" />
      <path d="M1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}
