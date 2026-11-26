import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Keep five complete rows visible, including wrapped descriptions. */
export function PopupItems({ children, count }: { children: ReactNode; count: number }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  useLayoutEffect(() => {
    const list = listRef.current!
    if (count <= 5) {
      setHeight(undefined)
      return
    }
    const rows = Array.from(list.children).slice(0, 5) as HTMLElement[]
    const measure = () => {
      const first = rows[0], last = rows[rows.length - 1]
      if (first && last) setHeight(last.offsetTop + last.offsetHeight - first.offsetTop)
    }
    measure()
    const observer = new ResizeObserver(measure)
    rows.forEach(row => observer.observe(row))
    observer.observe(list)
    return () => observer.disconnect()
  }, [count])
  return <div ref={listRef} className="zpop-items" style={{ maxHeight: height }}>{children}</div>
}
