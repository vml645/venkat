'use client'

import { useEffect, useMemo, useState } from 'react'
import { useStagedAnimation } from '@/components/animation/useStagedAnimation'
import {
  HABITS,
  computeCurrentStreak,
  createDefaultStore,
  normalizeHabitStore,
  toDateKey,
  type HabitStore,
} from '@/lib/habitStore'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   tracker heading settles in
 *   90ms   habit cards rise in (staggered 90ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headingAppear: 0, // heading settles first
  cardsAppear: 90, // cards begin stagger
}

const MOTION = {
  cardStagger: 90, // ms between each card
}

const SYNC_ENDPOINT = '/api/vx7a9d2'
const SAVE_DEBOUNCE_MS = 350
const LOCAL_CACHE_KEY = 'venkat:hidden:habit-store:v1'

const FITNESS_HABIT_ID = 'fitness'
const FITNESS_STRETCH_ITEM = 'Daily Stretching'
const FITNESS_CLIMBING_ITEM = 'Climbing'

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isClimbingRequired(dateKey: string) {
  const dayIndex = Math.floor(parseDateKey(dateKey).getTime() / 86400000)
  return dayIndex % 2 === 0
}

function canCheckIn(habitId: string, checklist: string[], checkedToday: Set<string>, dateKey: string) {
  if (habitId !== FITNESS_HABIT_ID) {
    return checklist.every((item) => checkedToday.has(item))
  }

  const stretchingDone = checkedToday.has(FITNESS_STRETCH_ITEM)
  if (!stretchingDone) {
    return false
  }

  if (!isClimbingRequired(dateKey)) {
    return true
  }

  return checkedToday.has(FITNESS_CLIMBING_ITEM)
}

function checkInHint(habitId: string, checkedToday: Set<string>, dateKey: string) {
  if (habitId !== FITNESS_HABIT_ID) {
    return 'Complete all checklist items to check in.'
  }

  if (!checkedToday.has(FITNESS_STRETCH_ITEM)) {
    return 'Daily Stretching is required to check in.'
  }

  if (isClimbingRequired(dateKey) && !checkedToday.has(FITNESS_CLIMBING_ITEM)) {
    return 'Climbing is required today.'
  }

  return 'Complete required items to check in.'
}

export function HabitTracker() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.headingAppear, TIMING.cardsAppear],
  })
  const [store, setStore] = useState<HabitStore>(() => createDefaultStore())
  const [isLoaded, setIsLoaded] = useState(false)
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [lastSyncedPayload, setLastSyncedPayload] = useState<string | null>(null)

  const todayKey = useMemo(() => toDateKey(new Date()), [])

  useEffect(() => {
    let mounted = true

    async function loadStore() {
      const localRaw = window.localStorage.getItem(LOCAL_CACHE_KEY)
      if (localRaw) {
        try {
          const localStore = normalizeHabitStore(JSON.parse(localRaw))
          if (mounted) {
            setStore(localStore)
            setLastSyncedPayload(JSON.stringify(localStore))
            setIsLoaded(true)
          }
        } catch {}
      }

      try {
        const response = await fetch(SYNC_ENDPOINT, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Failed to load hidden tracker store')
        }

        const payload = await response.json()
        if (!mounted) {
          return
        }

        const normalized = normalizeHabitStore(payload)
        const normalizedPayload = JSON.stringify(normalized)
        setStore(normalized)
        setLastSyncedPayload(normalizedPayload)
        window.localStorage.setItem(LOCAL_CACHE_KEY, normalizedPayload)
      } catch {
        if (!mounted) {
          return
        }

        const fallback = createDefaultStore()
        const fallbackPayload = JSON.stringify(fallback)
        setStore(fallback)
        setLastSyncedPayload(fallbackPayload)
        window.localStorage.setItem(LOCAL_CACHE_KEY, fallbackPayload)
      } finally {
        if (mounted) {
          setIsLoaded(true)
        }
      }
    }

    void loadStore()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    const serialized = JSON.stringify(store)
    if (serialized === lastSyncedPayload) {
      return
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(SYNC_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: serialized,
          })

          if (!response.ok) {
            throw new Error('Failed to save hidden tracker store')
          }
          setLastSyncedPayload(serialized)
          window.localStorage.setItem(LOCAL_CACHE_KEY, serialized)
        } catch {}
      })()
    }, SAVE_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isLoaded, lastSyncedPayload, store])

  function toggleChecklist(habitId: string, item: string) {
    setStore((previous) => {
      const next = { ...previous }
      const habit = next[habitId]
      const todayChecklist = new Set(habit.checklistByDate[todayKey] ?? [])

      if (todayChecklist.has(item)) {
        todayChecklist.delete(item)
      } else {
        todayChecklist.add(item)
      }

      next[habitId] = {
        ...habit,
        checklistByDate: {
          ...habit.checklistByDate,
          [todayKey]: Array.from(todayChecklist),
        },
      }

      return next
    })
  }

  function incrementHabit(habitId: string) {
    setStore((previous) => {
      const next = { ...previous }
      const habit = next[habitId]
      const completed = new Set(habit.completedDates)
      completed.add(todayKey)

      next[habitId] = {
        ...habit,
        completedDates: Array.from(completed).sort(),
      }

      return next
    })
  }

  return (
    <section>
      <ul className="space-y-0 max-w-[34rem]">
        {HABITS.map((habit, index) => {
          const habitState = store[habit.id] ?? { completedDates: [], checklistByDate: {} }
          const checkedToday = new Set(habitState.checklistByDate[todayKey] ?? [])
          const readyToCheckIn = canCheckIn(habit.id, habit.checklist, checkedToday, todayKey)
          const completedToday = habitState.completedDates.includes(todayKey)
          const streak = computeCurrentStreak(habitState.completedDates, todayKey)
          const isOpen = openCardId === habit.id

          return (
            <li
              key={habit.id}
              style={reducedMotion ? undefined : { transitionDelay: `${index * MOTION.cardStagger}ms` }}
              className={`rounded-xl transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
                stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              } ${reducedMotion ? 'duration-0' : ''}`}
            >
              <button
                type="button"
                onClick={() => setOpenCardId((current) => (current === habit.id ? null : habit.id))}
                aria-expanded={isOpen}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                  isOpen ? 'bg-[rgb(243,244,239)]' : 'hover:bg-[rgb(243,244,239)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] leading-6 font-normal tracking-normal text-foreground">{habit.title}</h2>
                  </div>
                  <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#dce3f7] text-[#161a24] text-sm font-medium">
                    {streak}
                  </span>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'max-h-[40rem] opacity-100 px-2 pb-2 mt-0.5'
                    : 'max-h-0 opacity-0 px-2 pb-0 mt-0 pointer-events-none'
                }`}
              >
                <div className="pt-1.5">
                  <div className="min-w-0">
                    <ul className="space-y-1.5">
                      {habit.checklist.map((item) => {
                        const checked = checkedToday.has(item)
                        return (
                          <li key={item}>
                            <label className="flex items-center gap-2 text-[15px] leading-7 text-black/70 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleChecklist(habit.id, item)}
                                className="h-4 w-4 rounded border-black/20 bg-white/85"
                              />
                              <span className={checked ? 'text-black/90' : 'text-black/60'}>{item}</span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="group relative inline-flex items-center">
                        <button
                          type="button"
                          disabled={!readyToCheckIn || completedToday}
                          onClick={() => incrementHabit(habit.id)}
                          className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${
                            readyToCheckIn && !completedToday
                              ? 'border-black/20 text-black/90 hover:bg-black/[0.04]'
                              : 'border-black/10 text-black/35 cursor-not-allowed'
                          }`}
                        >
                          {completedToday ? 'Done Today' : 'Check In'}
                        </button>
                        {!readyToCheckIn && !completedToday ? (
                          <p className="absolute left-full ml-2 whitespace-nowrap text-sm text-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                            {checkInHint(habit.id, checkedToday, todayKey)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
