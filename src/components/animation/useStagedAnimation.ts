'use client'

import { useEffect, useMemo, useState } from 'react'

interface UseStagedAnimationOptions {
  timing: number[]
  replayKey?: string | number
}

export function useStagedAnimation({ timing, replayKey = 0 }: UseStagedAnimationOptions) {
  const timingSignature = timing.join('|')
  const orderedTiming = useMemo(
    () => [...timing].sort((first, second) => first - second),
    [timingSignature],
  )
  const [stage, setStage] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches)

    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setStage(orderedTiming.length)
      return
    }

    setStage(0)
    const timers = orderedTiming.map((at, index) =>
      window.setTimeout(() => setStage(index + 1), at),
    )

    return () => {
      timers.forEach(window.clearTimeout)
    }
  }, [orderedTiming, reducedMotion, replayKey, timingSignature])

  return { stage, reducedMotion }
}
