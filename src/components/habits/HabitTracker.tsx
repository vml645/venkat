'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowTurnForwardIcon } from '@hugeicons/core-free-icons'
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
type HighlightRect = { top: number; height: number }

function wrapIndex(index: number, length: number) {
  if (length <= 0) {
    return 0
  }

  return (index + length) % length
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex min-w-[1.4rem] items-center justify-center rounded-[0.3rem] border border-black/25 bg-[linear-gradient(180deg,#fffefb_0%,#f2efe6_55%,#e6e1d6_100%)] px-2 py-1 text-[10px] leading-none font-normal [font-family:inherit] text-black/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-2px_0_rgba(72,61,44,0.18),0_1px_0_rgba(0,0,0,0.14),0_2px_4px_rgba(0,0,0,0.12)]">
      {children}
    </kbd>
  )
}

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
  const [selectedHabitIndex, setSelectedHabitIndex] = useState(0)
  const [selectedChecklistIndexByHabit, setSelectedChecklistIndexByHabit] = useState<Record<string, number>>({})
  const [isTrackerFocused, setIsTrackerFocused] = useState(false)
  const [checklistHighlightRect, setChecklistHighlightRect] = useState<HighlightRect | null>(null)
  const trackerRef = useRef<HTMLElement>(null)
  const checklistListRefs = useRef<Record<string, HTMLUListElement | null>>({})
  const checklistItemRefs = useRef<Record<string, HTMLLIElement | null>>({})

  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const selectedHabit = HABITS[wrapIndex(selectedHabitIndex, HABITS.length)]

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

  useEffect(() => {
    function onWindowKeyDown(event: KeyboardEvent) {
      if (isTrackerFocused || isTypingTarget(event.target)) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedHabitIndex(0)
        setIsTrackerFocused(true)
        trackerRef.current?.focus()
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedHabitIndex(HABITS.length - 1)
        setIsTrackerFocused(true)
        trackerRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onWindowKeyDown)
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown)
    }
  }, [isTrackerFocused])

  useEffect(() => {
    if (!openCardId || !isTrackerFocused || selectedHabit?.id !== openCardId) {
      setChecklistHighlightRect(null)
      return
    }

    const habit = HABITS.find((entry) => entry.id === openCardId)
    if (!habit) {
      setChecklistHighlightRect(null)
      return
    }

    const selectedIndex = selectedChecklistIndexByHabit[openCardId]
    if (selectedIndex === undefined || selectedIndex < 0 || selectedIndex >= habit.checklist.length) {
      setChecklistHighlightRect(null)
      return
    }

    const listElement = checklistListRefs.current[openCardId]
    const itemElement = checklistItemRefs.current[`${openCardId}:${selectedIndex}`]
    if (!listElement || !itemElement) {
      setChecklistHighlightRect(null)
      return
    }

    const nextRect = {
      top: itemElement.offsetTop,
      height: itemElement.offsetHeight,
    }

    setChecklistHighlightRect((previous) => {
      if (previous?.top === nextRect.top && previous.height === nextRect.height) {
        return previous
      }

      return nextRect
    })
  }, [isTrackerFocused, openCardId, selectedChecklistIndexByHabit, selectedHabit?.id])

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

  function clearChecklistSelection(habitId: string) {
    setSelectedChecklistIndexByHabit((previous) => {
      if (!(habitId in previous)) {
        return previous
      }

      const next = { ...previous }
      delete next[habitId]
      return next
    })
  }

  function openHabitCard(habitId: string, resetChecklistSelection: boolean) {
    setOpenCardId(habitId)
    if (resetChecklistSelection) {
      setSelectedChecklistIndexByHabit((previous) => ({
        ...previous,
        [habitId]: 0,
      }))
    }
  }

  function closeHabitCard(habitId: string) {
    setOpenCardId((current) => (current === habitId ? null : current))
    clearChecklistSelection(habitId)
  }

  function onTrackerKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!isTrackerFocused || isTypingTarget(event.target)) {
      return
    }

    const habit = selectedHabit
    if (!habit) {
      return
    }

    const habitState = store[habit.id] ?? { completedDates: [], checklistByDate: {} }
    const checkedToday = new Set(habitState.checklistByDate[todayKey] ?? [])
    const readyToCheckIn = canCheckIn(habit.id, habit.checklist, checkedToday, todayKey)
    const completedToday = habitState.completedDates.includes(todayKey)
    const isOpen = openCardId === habit.id
    const selectedChecklistIndex = selectedChecklistIndexByHabit[habit.id]
    const hasChecklistSelection = selectedChecklistIndex !== undefined
    const checkInSelectionIndex = habit.checklist.length
    const isChecklistContext = isOpen && habit.checklist.length > 0

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (isChecklistContext) {
          if (!hasChecklistSelection) {
            setSelectedChecklistIndexByHabit((previous) => ({
              ...previous,
              [habit.id]: 0,
            }))
            return
          }

          const current = selectedChecklistIndexByHabit[habit.id] ?? 0
          if (current < checkInSelectionIndex) {
            setSelectedChecklistIndexByHabit((previous) => ({
              ...previous,
              [habit.id]: current + 1,
            }))
            return
          }

          clearChecklistSelection(habit.id)
          setSelectedHabitIndex((currentHabit) => wrapIndex(currentHabit + 1, HABITS.length))
        } else {
          setSelectedHabitIndex((current) => wrapIndex(current + 1, HABITS.length))
        }
        return
      case 'ArrowUp':
        event.preventDefault()
        if (isChecklistContext) {
          if (!hasChecklistSelection) {
            setSelectedChecklistIndexByHabit((previous) => ({
              ...previous,
              [habit.id]: checkInSelectionIndex,
            }))
            return
          }

          const current = selectedChecklistIndexByHabit[habit.id] ?? 0
          if (current > 0) {
            setSelectedChecklistIndexByHabit((previous) => ({
              ...previous,
              [habit.id]: current - 1,
            }))
          } else {
            clearChecklistSelection(habit.id)
          }
        } else {
          setSelectedHabitIndex((current) => wrapIndex(current - 1, HABITS.length))
        }
        return
      case 'Escape':
        if (!isOpen) {
          return
        }
        event.preventDefault()
        if (selectedChecklistIndexByHabit[habit.id] !== undefined) {
          clearChecklistSelection(habit.id)
        } else {
          closeHabitCard(habit.id)
        }
        return
      case 'Enter':
        event.preventDefault()
        if (!isOpen) {
          openHabitCard(habit.id, true)
          return
        }

        if (!hasChecklistSelection) {
          setSelectedChecklistIndexByHabit((previous) => ({
            ...previous,
            [habit.id]: 0,
          }))
          return
        }

        if (selectedChecklistIndexByHabit[habit.id] === checkInSelectionIndex) {
          if (readyToCheckIn && !completedToday) {
            incrementHabit(habit.id)
          }
          return
        }

        if (habit.checklist.length > 0) {
          const checklistIndex = Math.min(selectedChecklistIndexByHabit[habit.id] ?? 0, habit.checklist.length - 1)
          toggleChecklist(habit.id, habit.checklist[checklistIndex])
          setSelectedChecklistIndexByHabit((previous) => ({
            ...previous,
            [habit.id]: Math.min(checklistIndex + 1, checkInSelectionIndex),
          }))
        }
        return
      default:
        return
    }
  }

  return (
    <section
      ref={trackerRef}
      tabIndex={0}
      onKeyDown={onTrackerKeyDown}
      onFocusCapture={() => setIsTrackerFocused(true)}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return
        }
        setIsTrackerFocused(false)
      }}
      className="rounded-lg focus:outline-none"
    >
      <ul className="space-y-0 max-w-[34rem]">
        {HABITS.map((habit, index) => {
          const habitState = store[habit.id] ?? { completedDates: [], checklistByDate: {} }
          const checkedToday = new Set(habitState.checklistByDate[todayKey] ?? [])
          const readyToCheckIn = canCheckIn(habit.id, habit.checklist, checkedToday, todayKey)
          const completedToday = habitState.completedDates.includes(todayKey)
          const streak = computeCurrentStreak(habitState.completedDates, todayKey)
          const isOpen = openCardId === habit.id
          const selectedChecklistIndex = selectedChecklistIndexByHabit[habit.id]
          const checkInSelectionIndex = habit.checklist.length
          const isSelectedHabit = selectedHabit?.id === habit.id

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
                onClick={() => {
                  setSelectedHabitIndex(index)
                  if (isOpen) {
                    closeHabitCard(habit.id)
                  } else {
                    openHabitCard(habit.id, false)
                  }
                }}
                aria-expanded={isOpen}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                  isOpen ? 'bg-[rgb(243,244,239)]' : 'hover:bg-[rgb(243,244,239)]'
                } ${isTrackerFocused && isSelectedHabit ? 'bg-[rgb(243,244,239)]' : ''}`}
                onFocus={() => setSelectedHabitIndex(index)}
                onMouseDown={() => {
                  if (trackerRef.current) {
                    trackerRef.current.focus()
                  }
                }}
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
                    <ul
                      ref={(element) => {
                        checklistListRefs.current[habit.id] = element
                      }}
                      className="relative space-y-1.5"
                    >
                      {isTrackerFocused &&
                      isSelectedHabit &&
                      isOpen &&
                      selectedChecklistIndex !== undefined &&
                      selectedChecklistIndex < habit.checklist.length &&
                      checklistHighlightRect ? (
                        <div
                          className="pointer-events-none absolute left-0 right-0 rounded-md bg-black/[0.04] transition-all duration-200 ease-out"
                          style={{
                            top: checklistHighlightRect.top,
                            height: checklistHighlightRect.height,
                          }}
                        />
                      ) : null}
                      {habit.checklist.map((item, checklistIndex) => {
                        const checked = checkedToday.has(item)
                        return (
                          <li
                            key={item}
                            ref={(element) => {
                              checklistItemRefs.current[`${habit.id}:${checklistIndex}`] = element
                            }}
                            className="relative z-[1]"
                          >
                            <label
                              className={`flex items-center gap-2 text-[15px] leading-7 cursor-pointer rounded-md px-1 ${
                                checked ? 'text-black/90' : 'text-black/70'
                              }`}
                            >
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
                          } ${
                            isTrackerFocused &&
                            isSelectedHabit &&
                            isOpen &&
                            selectedChecklistIndex === checkInSelectionIndex
                              ? 'bg-black/[0.04]'
                              : ''
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
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-black/45">
        <span className="inline-flex items-center gap-1">
          <Keycap>↑</Keycap>/<Keycap>↓</Keycap> navigate
        </span>
        <span className="inline-flex items-center gap-1">
          <Keycap>
            <HugeiconsIcon icon={ArrowTurnForwardIcon} size={11} strokeWidth={2} />
          </Keycap>
          open/toggle
        </span>
        <span className="inline-flex items-center gap-1">
          <Keycap>Esc</Keycap> back
        </span>
      </div>
    </section>
  )
}
