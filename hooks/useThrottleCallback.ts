import { useCallback, useRef } from 'react'

const useThrottledCallback = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  const lastCalled = useRef<number>(0)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const remaining = wait - (now - lastCalled.current)

      if (remaining <= 0) {
        if (timeout.current) {
          clearTimeout(timeout.current)
          timeout.current = null
        }
        lastCalled.current = now
        func(...args)
      } else if (!timeout.current) {
        timeout.current = setTimeout(() => {
          lastCalled.current = Date.now()
          timeout.current = null
          func(...args)
        }, remaining)
      }
    },
    [func, wait]
  )
}

export default useThrottledCallback
