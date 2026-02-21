export type HabitTemplate = {
  id: string
  title: string
  description: string
  checklist: string[]
}

export type HabitState = {
  completedDates: string[]
  checklistByDate: Record<string, string[]>
}

export type HabitStore = Record<string, HabitState>

export const HEATMAP_WEEKS = 16

export const HABITS: HabitTemplate[] = [
  {
    id: 'am-routine',
    title: 'morning routine',
    description: 'Morning routine',
    checklist: ['Water floss', 'Brush teeth', 'Face cleanse', 'Vitamin C', 'Moisturizer', 'Sunscreen'],
  },
  {
    id: 'pm-routine',
    title: 'nighttime routine',
    description: 'Evening routine',
    checklist: ['Water floss', 'String floss', 'Mouthwash', 'Brush teeth', 'Face double cleanse', 'Vitamin C', 'Moisturizer'],
  },
  {
    id: 'fitness',
    title: 'fitness',
    description: 'Fitness routine',
    checklist: ['Daily Stretching', 'Climbing'],
  },
]

export function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function createDefaultStore() {
  const defaults: HabitStore = {}

  for (const habit of HABITS) {
    defaults[habit.id] = {
      completedDates: [],
      checklistByDate: {},
    }
  }

  return defaults
}

export function normalizeHabitStore(raw: unknown) {
  const fallback = createDefaultStore()
  if (!raw || typeof raw !== 'object') {
    return fallback
  }

  const incoming = raw as Record<string, HabitState>
  for (const habit of HABITS) {
    const existing = incoming[habit.id]
    if (!existing || typeof existing !== 'object') {
      continue
    }

    fallback[habit.id] = {
      completedDates: Array.isArray(existing.completedDates)
        ? existing.completedDates.filter((entry) => typeof entry === 'string')
        : [],
      checklistByDate: existing.checklistByDate && typeof existing.checklistByDate === 'object'
        ? Object.fromEntries(
            Object.entries(existing.checklistByDate)
              .filter(([key, value]) => typeof key === 'string' && Array.isArray(value))
              .map(([key, value]) => [key, value.filter((item): item is string => typeof item === 'string')]),
          )
        : {},
    }
  }

  return fallback
}

export function computeCurrentStreak(completedDates: string[], todayKey: string) {
  const done = new Set(completedDates)
  const todayCompleted = done.has(todayKey)
  const anchor = todayCompleted ? todayKey : shiftDateKey(todayKey, -1)

  if (!done.has(anchor)) {
    return 0
  }

  let streak = 0
  let cursor = anchor

  while (done.has(cursor)) {
    streak += 1
    cursor = shiftDateKey(cursor, -1)
  }

  return streak
}

export function buildHeatmapColumns(todayKey: string) {
  const columns: string[][] = []
  const start = shiftDateKey(todayKey, -(HEATMAP_WEEKS * 7 - 1))

  for (let week = 0; week < HEATMAP_WEEKS; week += 1) {
    const column: string[] = []
    for (let day = 0; day < 7; day += 1) {
      const offset = week * 7 + day
      column.push(shiftDateKey(start, offset))
    }
    columns.push(column)
  }

  return columns
}

export function dayLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
