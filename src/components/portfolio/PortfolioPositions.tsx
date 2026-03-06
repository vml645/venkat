'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useStagedAnimation } from '@/components/animation/useStagedAnimation'
import {
  normalizePortfolioStore,
  type AssetClass,
  type PortfolioPosition,
  type PortfolioStore,
} from '@/lib/portfolioStore'

const SYNC_ENDPOINT = '/api/vx7a9d2/portfolio'
const QUOTE_ENDPOINT = '/api/vx7a9d2/quote'
const SAVE_DEBOUNCE_MS = 450

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   portfolio heading settles in
 *   90ms   content cards rise in (staggered 90ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headingAppear: 0,
  cardsAppear: 90,
}

const MOTION = {
  cardStagger: 90,
}

type SortKey = 'ticker' | 'weight' | 'avgCost' | 'closePrice' | 'dailyChangePct' | 'totalReturnPct'

type SortState = {
  key: SortKey
  direction: 'asc' | 'desc'
}

type AddFormState = {
  ticker: string
  shares: string
  avgCost: string
}

type AdjustFormState = {
  action: 'buy' | 'sell'
  shares: string
  price: string
}

type PositionWithMetrics = {
  position: PortfolioPosition
  weightPct: number
  totalReturnPct: number
}

type QuoteLookupResponse = {
  ticker: string
  name: string
  price: number | null
  closePrice: number | null
  dailyChangePct: number
  assetClass: AssetClass
  sector?: string
  sourceUrl: string
}

function toFixedPct(value: number, digits = 2) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

function asNumber(input: string) {
  const parsed = Number(input)
  return Number.isFinite(parsed) ? parsed : NaN
}

function sortPositions(positions: PositionWithMetrics[], sort: SortState) {
  const sorted = [...positions]

  sorted.sort((left, right) => {
    const l = left.position
    const r = right.position

    let result = 0

    switch (sort.key) {
      case 'ticker':
        result = l.ticker.localeCompare(r.ticker)
        break
      case 'weight':
        result = left.weightPct - right.weightPct
        break
      case 'avgCost':
        result = l.avgCost - r.avgCost
        break
      case 'closePrice':
        result = (l.meta.closePrice ?? l.price) - (r.meta.closePrice ?? r.price)
        break
      case 'dailyChangePct':
        result = l.dailyChangePct - r.dailyChangePct
        break
      case 'totalReturnPct':
        result = left.totalReturnPct - right.totalReturnPct
        break
      default:
        result = 0
    }

    return sort.direction === 'asc' ? result : -result
  })

  return sorted
}

function SortButton({
  label,
  sortKey,
  activeSort,
  onToggle,
}: {
  label: string
  sortKey: SortKey
  activeSort: SortState
  onToggle: (key: SortKey) => void
}) {
  const active = activeSort.key === sortKey
  const icon = !active ? '↕' : activeSort.direction === 'asc' ? '↑' : '↓'

  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      className={`inline-flex items-center gap-1 text-left transition-colors ${active ? 'text-black' : 'text-black/60 hover:text-black'}`}
    >
      <span>{label}</span>
      <span className="text-[11px]">{icon}</span>
    </button>
  )
}

export function PortfolioPositions() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.headingAppear, TIMING.cardsAppear],
  })

  const [store, setStore] = useState<PortfolioStore>({ positions: [], updatedAt: new Date().toISOString() })
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastSyncedPayload, setLastSyncedPayload] = useState<string | null>(null)

  const [sort, setSort] = useState<SortState>({ key: 'weight', direction: 'desc' })

  const [isAdding, setIsAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [formState, setFormState] = useState<AddFormState>({ ticker: '', shares: '', avgCost: '' })

  const [adjustPositionId, setAdjustPositionId] = useState<string | null>(null)
  const [adjustForm, setAdjustForm] = useState<AdjustFormState>({ action: 'buy', shares: '', price: '' })
  const [adjustError, setAdjustError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadStore() {
      try {
        const response = await fetch(SYNC_ENDPOINT, { method: 'GET' })
        if (!response.ok) {
          throw new Error('Failed to load portfolio store')
        }

        const payload = await response.json()
        if (!mounted) {
          return
        }

        const normalized = normalizePortfolioStore(payload)
        const serialized = JSON.stringify(normalized)
        setStore(normalized)
        setLastSyncedPayload(serialized)
      } catch {
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
            throw new Error('Failed to save portfolio store')
          }

          setLastSyncedPayload(serialized)
        } catch {}
      })()
    }, SAVE_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isLoaded, lastSyncedPayload, store])

  const positionsWithMetrics = useMemo(() => {
    const totalValue = store.positions.reduce((sum, position) => sum + position.shares * position.price, 0)

    return store.positions.map((position) => {
      const value = position.shares * position.price
      const weightPct = totalValue > 0 ? (value / totalValue) * 100 : 0
      const totalReturnPct = position.avgCost > 0 ? ((position.price - position.avgCost) / position.avgCost) * 100 : 0

      return {
        position,
        weightPct,
        totalReturnPct,
      }
    })
  }, [store.positions])

  const sorted = useMemo(() => sortPositions(positionsWithMetrics, sort), [positionsWithMetrics, sort])

  const summary = useMemo(() => {
    if (sorted.length === 0) {
      return {
        weightedDailyChange: 0,
        weightedTotalReturn: 0,
      }
    }

    const weightedDailyChange = sorted.reduce(
      (sum, entry) => sum + (entry.position.dailyChangePct * entry.weightPct) / 100,
      0,
    )
    const weightedTotalReturn = sorted.reduce(
      (sum, entry) => sum + (entry.totalReturnPct * entry.weightPct) / 100,
      0,
    )

    return { weightedDailyChange, weightedTotalReturn }
  }, [sorted])

  function toggleSort(key: SortKey) {
    setSort((previous) => {
      if (previous.key !== key) {
        return { key, direction: 'desc' }
      }
      return { key, direction: previous.direction === 'desc' ? 'asc' : 'desc' }
    })
  }

  function updateFormField<K extends keyof AddFormState>(field: K, value: AddFormState[K]) {
    setFormState((previous) => ({ ...previous, [field]: value }))
  }

  function resetForm() {
    setFormState({ ticker: '', shares: '', avgCost: '' })
  }

  async function fetchQuote(ticker: string): Promise<QuoteLookupResponse | null> {
    try {
      const response = await fetch(`${QUOTE_ENDPOINT}?ticker=${encodeURIComponent(ticker)}`, { method: 'GET' })
      if (!response.ok) {
        return null
      }
      return (await response.json()) as QuoteLookupResponse
    } catch {
      return null
    }
  }

  async function addPosition() {
    const ticker = formState.ticker.trim().toUpperCase()
    const sharesToAdd = asNumber(formState.shares)
    const avgCostInput = asNumber(formState.avgCost)

    if (!ticker || Number.isNaN(sharesToAdd) || Number.isNaN(avgCostInput) || sharesToAdd <= 0 || avgCostInput <= 0) {
      setAddError('Enter a valid ticker, shares, and cost basis.')
      return
    }

    setAddError(null)
    setIsAdding(true)

    const existing = store.positions.find((entry) => entry.ticker.toUpperCase() === ticker)
    const quote = await fetchQuote(ticker)

    if (!quote && !existing) {
      setAddError('Could not fetch ticker data. Check symbol and try again.')
      setIsAdding(false)
      return
    }

    setStore((previous) => {
      const current = previous.positions.find((entry) => entry.ticker.toUpperCase() === ticker)

      if (current) {
        const nextShares = current.shares + sharesToAdd
        const nextAvgCost =
          nextShares > 0 ? ((current.shares * current.avgCost) + (sharesToAdd * avgCostInput)) / nextShares : current.avgCost

        return {
          positions: previous.positions.map((entry) =>
            entry.id === current.id
              ? {
                  ...entry,
                  shares: nextShares,
                  avgCost: nextAvgCost,
                  price: quote?.price ?? entry.price,
                  dailyChangePct: quote?.dailyChangePct ?? entry.dailyChangePct,
                  assetClass: quote?.assetClass ?? entry.assetClass,
                  name: quote?.name ?? entry.name,
                  meta: {
                    ...entry.meta,
                    closePrice: quote?.closePrice ?? entry.meta.closePrice,
                    sector: quote?.sector ?? entry.meta.sector,
                    dataSourceUrl: quote?.sourceUrl ?? entry.meta.dataSourceUrl,
                  },
                }
              : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      }

      const newPosition: PortfolioPosition = {
        id: `${ticker.toLowerCase()}-${Date.now()}`,
        ticker,
        name: quote?.name ?? ticker,
        shares: sharesToAdd,
        avgCost: avgCostInput,
        price: quote?.price ?? avgCostInput,
        dailyChangePct: quote?.dailyChangePct ?? 0,
        assetClass: quote?.assetClass ?? 'equity',
        meta: {
          tags: [],
          closePrice: quote?.closePrice ?? undefined,
          sector: quote?.sector,
          dataSourceUrl: quote?.sourceUrl ?? `https://finance.yahoo.com/quote/${ticker}`,
        },
      }

      return {
        positions: [newPosition, ...previous.positions],
        updatedAt: new Date().toISOString(),
      }
    })

    resetForm()
    setShowAddForm(false)
    setIsAdding(false)
  }

  function startAdjust(position: PortfolioPosition) {
    setAdjustPositionId(position.id)
    setAdjustForm({ action: 'buy', shares: '', price: String(position.price) })
    setAdjustError(null)
    setShowAddForm(false)
  }

  function cancelAdjust() {
    setAdjustPositionId(null)
    setAdjustError(null)
    setAdjustForm({ action: 'buy', shares: '', price: '' })
  }

  function applyAdjust(positionId: string) {
    const deltaShares = asNumber(adjustForm.shares)
    const tradePrice = asNumber(adjustForm.price)

    if (Number.isNaN(deltaShares) || Number.isNaN(tradePrice) || deltaShares <= 0 || tradePrice <= 0) {
      setAdjustError('Enter valid shares and price.')
      return
    }

    setStore((previous) => {
      const target = previous.positions.find((entry) => entry.id === positionId)
      if (!target) {
        return previous
      }

      if (adjustForm.action === 'sell') {
        if (deltaShares > target.shares) {
          setAdjustError('Cannot sell more shares than you hold.')
          return previous
        }

        const nextShares = target.shares - deltaShares
        if (nextShares <= 0) {
          return {
            positions: previous.positions.filter((entry) => entry.id !== positionId),
            updatedAt: new Date().toISOString(),
          }
        }

        return {
          positions: previous.positions.map((entry) =>
            entry.id === positionId
              ? {
                  ...entry,
                  shares: nextShares,
                  price: tradePrice,
                }
              : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      }

      const nextShares = target.shares + deltaShares
      const nextAvgCost = ((target.shares * target.avgCost) + (deltaShares * tradePrice)) / nextShares

      return {
        positions: previous.positions.map((entry) =>
          entry.id === positionId
            ? {
                ...entry,
                shares: nextShares,
                avgCost: nextAvgCost,
                price: tradePrice,
              }
            : entry,
        ),
        updatedAt: new Date().toISOString(),
      }
    })

    cancelAdjust()
  }

  function removePosition(positionId: string) {
    const confirmed = window.confirm('Remove this position?')
    if (!confirmed) {
      return
    }

    setStore((previous) => ({
      positions: previous.positions.filter((entry) => entry.id !== positionId),
      updatedAt: new Date().toISOString(),
    }))

    if (adjustPositionId === positionId) {
      cancelAdjust()
    }
  }

  return (
    <section className="space-y-4">
      <header>
        <p
          className={`text-xs text-black/45 transition-all duration-[520ms] ease-[cubic-bezier(0.22,0.9,0.36,1)] ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          } ${reducedMotion ? 'duration-0' : ''}`}
        >
          Updated: {new Date(store.updatedAt).toLocaleString()}
        </p>
      </header>

      <div
        className={`flex flex-wrap gap-4 py-2 text-sm text-black/70 transition-all duration-[520ms] ease-[cubic-bezier(0.22,0.9,0.36,1)] ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        } ${reducedMotion ? 'duration-0' : ''}`}
        style={reducedMotion ? undefined : { transitionDelay: `${MOTION.cardStagger}ms` }}
      >
        <p>
          Day:{' '}
          <span className={`font-medium tabular-nums ${summary.weightedDailyChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {toFixedPct(summary.weightedDailyChange)}
          </span>
        </p>
        <p>
          Return:{' '}
          <span className={`font-medium tabular-nums ${summary.weightedTotalReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {toFixedPct(summary.weightedTotalReturn)}
          </span>
        </p>
      </div>

      <div
        className={`overflow-x-auto transition-all duration-[520ms] ease-[cubic-bezier(0.22,0.9,0.36,1)] ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        } ${reducedMotion ? 'duration-0' : ''}`}
        style={reducedMotion ? undefined : { transitionDelay: `${MOTION.cardStagger * 2}ms` }}
      >
        <table className="min-w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-black/15 text-left text-xs uppercase tracking-wide text-black/55">
              <th className="py-2 pr-3">
                <SortButton label="Ticker" sortKey="ticker" activeSort={sort} onToggle={toggleSort} />
              </th>
              <th className="py-2 pr-3">
                <SortButton label="Weight" sortKey="weight" activeSort={sort} onToggle={toggleSort} />
              </th>
              <th className="py-2 pr-3">
                <SortButton label="Day" sortKey="dailyChangePct" activeSort={sort} onToggle={toggleSort} />
              </th>
              <th className="py-2 pr-3">
                <SortButton label="Close" sortKey="closePrice" activeSort={sort} onToggle={toggleSort} />
              </th>
              <th className="py-2 pr-3">
                <SortButton label="Avg Cost" sortKey="avgCost" activeSort={sort} onToggle={toggleSort} />
              </th>
              <th className="py-2 pr-3">
                <SortButton label="Total" sortKey="totalReturnPct" activeSort={sort} onToggle={toggleSort} />
              </th>
              <th className="py-2 text-right text-black/55">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, index) => {
              const { position } = entry

              return (
                <Fragment key={position.id}>
                  <tr
                    style={reducedMotion ? undefined : { transitionDelay: `${index * MOTION.cardStagger}ms` }}
                    className={`border-b border-black/5 align-top transition-all duration-[520ms] ease-[cubic-bezier(0.22,0.9,0.36,1)] ${
                      stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    } ${reducedMotion ? 'duration-0' : ''}`}
                  >
                    <td className="py-2 pr-3">
                      <div className="font-medium text-black">{position.ticker}</div>
                      <div className="text-xs text-black/55">
                        {position.name}
                        {position.meta.sector ? ` · ${position.meta.sector}` : ''}
                      </div>
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-black/85">{entry.weightPct.toFixed(2)}%</td>
                    <td className={`py-2 pr-3 tabular-nums ${position.dailyChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {position.dailyChangePct > 0 ? '▲ ' : position.dailyChangePct < 0 ? '▼ ' : '• '}
                      {toFixedPct(position.dailyChangePct)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-black/85">${(position.meta.closePrice ?? position.price).toFixed(2)}</td>
                    <td className="py-2 pr-3 tabular-nums text-black/85">${position.avgCost.toFixed(2)}</td>
                    <td className={`py-2 pr-3 tabular-nums ${entry.totalReturnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {entry.totalReturnPct > 0 ? '▲ ' : entry.totalReturnPct < 0 ? '▼ ' : '• '}
                      {toFixedPct(entry.totalReturnPct)}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startAdjust(position)}
                          className="h-7 rounded border border-black/20 px-2.5 text-xs text-black/70 hover:text-black"
                        >
                          Trade
                        </button>
                        <button
                          type="button"
                          onClick={() => removePosition(position.id)}
                          className="h-7 rounded px-2.5 text-xs text-black/45 hover:text-black"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div
        className={`space-y-2 transition-all duration-[520ms] ease-[cubic-bezier(0.22,0.9,0.36,1)] ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        } ${reducedMotion ? 'duration-0' : ''}`}
        style={reducedMotion ? undefined : { transitionDelay: `${MOTION.cardStagger * 3}ms` }}
      >
        {!showAddForm && !adjustPositionId ? (
          <button
            type="button"
            onClick={() => {
              setAddError(null)
              setShowAddForm(true)
            }}
            className="h-8 rounded border border-black/20 px-3 text-sm text-black/80 hover:text-black"
          >
            Add
          </button>
        ) : null}

        {showAddForm ? (
          <>
            <div className="grid gap-2 sm:grid-cols-[110px_110px_110px_88px_88px] sm:items-end">
              <label className="space-y-1 text-xs text-black/55">
                <span className="block">Ticker</span>
                <input
                  placeholder="AAPL"
                  value={formState.ticker}
                  onChange={(event) => updateFormField('ticker', event.target.value)}
                  className="h-8 w-full rounded border border-black/20 px-2.5 text-sm text-black"
                />
              </label>
              <label className="space-y-1 text-xs text-black/55">
                <span className="block">Cost Basis</span>
                <input
                  placeholder="145.00"
                  value={formState.avgCost}
                  onChange={(event) => updateFormField('avgCost', event.target.value)}
                  className="h-8 w-full rounded border border-black/20 px-2.5 text-sm text-black"
                />
              </label>
              <label className="space-y-1 text-xs text-black/55">
                <span className="block">Shares</span>
                <input
                  placeholder="10"
                  value={formState.shares}
                  onChange={(event) => updateFormField('shares', event.target.value)}
                  className="h-8 w-full rounded border border-black/20 px-2.5 text-sm text-black"
                />
              </label>
              <button
                type="button"
                onClick={() => void addPosition()}
                disabled={isAdding}
                className="h-8 rounded bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAdding ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddError(null)
                  resetForm()
                  setShowAddForm(false)
                }}
                className="h-8 rounded border border-black/20 px-3 text-sm text-black/70"
              >
                Cancel
              </button>
            </div>
            {addError ? <p className="text-xs text-rose-700">{addError}</p> : null}
          </>
        ) : null}

        {adjustPositionId ? (
          <>
            <div className="grid gap-2 sm:grid-cols-[95px_110px_110px_88px_88px] sm:items-end">
              <label className="space-y-1 text-xs text-black/55">
                <span className="block">Action</span>
                <select
                  value={adjustForm.action}
                  onChange={(event) =>
                    setAdjustForm((previous) => ({ ...previous, action: event.target.value as 'buy' | 'sell' }))
                  }
                  className="h-8 w-full rounded border border-black/20 px-2 text-sm text-black"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </label>
              <label className="space-y-1 text-xs text-black/55">
                <span className="block">Shares</span>
                <input
                  placeholder="1"
                  value={adjustForm.shares}
                  onChange={(event) => setAdjustForm((previous) => ({ ...previous, shares: event.target.value }))}
                  className="h-8 w-full rounded border border-black/20 px-2.5 text-sm text-black"
                />
              </label>
              <label className="space-y-1 text-xs text-black/55">
                <span className="block">Price</span>
                <input
                  placeholder="200.00"
                  value={adjustForm.price}
                  onChange={(event) => setAdjustForm((previous) => ({ ...previous, price: event.target.value }))}
                  className="h-8 w-full rounded border border-black/20 px-2.5 text-sm text-black"
                />
              </label>
              <button
                type="button"
                onClick={() => applyAdjust(adjustPositionId)}
                className="h-8 rounded bg-black px-3 text-sm text-white"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={cancelAdjust}
                className="h-8 rounded border border-black/20 px-3 text-sm text-black/70"
              >
                Cancel
              </button>
            </div>
            {adjustError ? <p className="text-xs text-rose-700">{adjustError}</p> : null}
          </>
        ) : null}
      </div>
    </section>
  )
}
