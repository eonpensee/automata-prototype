import { useEffect, useState } from 'react'

/** 창 폭이 기준 폭보다 좁으면 화면 전체를 비율대로 줄여요. (넓으면 그대로) */
export function useFitZoom(base: number) {
  const get = () => Math.min(1, window.innerWidth / base)
  const [z, setZ] = useState(get)
  useEffect(() => {
    const on = () => setZ(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return z
}
