export type AssetClass = 'equity' | 'fund' | 'cash' | 'crypto' | 'other'

export type PositionMeta = {
  sector?: string
  account?: string
  thesis?: string
  tags: string[]
  closePrice?: number
  week52Low?: number
  week52High?: number
  dataSourceUrl?: string
}

export type PortfolioPosition = {
  id: string
  ticker: string
  name: string
  shares: number
  price: number
  avgCost: number
  dailyChangePct: number
  assetClass: AssetClass
  meta: PositionMeta
}

export type PortfolioStore = {
  positions: PortfolioPosition[]
  updatedAt: string
}

const DEFAULT_POSITIONS: PortfolioPosition[] = [
  {
    id: 'googl',
    ticker: 'GOOGL',
    name: 'Alphabet',
    shares: 240.5256,
    price: 301.69,
    avgCost: 124.73,
    dailyChangePct: -0.48,
    assetClass: 'equity',
    meta: {
      sector: 'Communication Services',
      account: 'Brokerage',
      thesis: 'AI + ads + cloud compounding',
      tags: ['mega-cap', 'growth'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/GOOGL',
    },
  },
  {
    id: 'meta',
    ticker: 'META',
    name: 'Meta',
    shares: 13.36913,
    price: 661.79,
    avgCost: 758.54,
    dailyChangePct: -0.89,
    assetClass: 'equity',
    meta: {
      sector: 'Communication Services',
      account: 'Brokerage',
      thesis: 'Ad efficiency and AI distribution',
      tags: ['mega-cap', 'growth'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/META',
    },
  },
  {
    id: 'tsla',
    ticker: 'TSLA',
    name: 'Tesla',
    shares: 20.88421,
    price: 405.59,
    avgCost: 257.6,
    dailyChangePct: -0.09,
    assetClass: 'equity',
    meta: {
      sector: 'Consumer Cyclical',
      account: 'Brokerage',
      thesis: 'EV scale plus optionality',
      tags: ['volatile', 'growth'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/TSLA',
    },
  },
  {
    id: 'nvda',
    ticker: 'NVDA',
    name: 'NVIDIA',
    shares: 34.72178,
    price: 182.55,
    avgCost: 155.06,
    dailyChangePct: -0.27,
    assetClass: 'equity',
    meta: {
      sector: 'Technology',
      account: 'Brokerage',
      thesis: 'AI compute demand leader',
      tags: ['ai', 'semi'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/NVDA',
    },
  },
  {
    id: 'aapl',
    ticker: 'AAPL',
    name: 'Apple',
    shares: 16.14725,
    price: 260.25,
    avgCost: 146.28,
    dailyChangePct: -0.86,
    assetClass: 'equity',
    meta: {
      sector: 'Technology',
      account: 'Brokerage',
      thesis: 'Ecosystem cashflow durability',
      tags: ['quality'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/AAPL',
    },
  },
  {
    id: 'amzn',
    ticker: 'AMZN',
    name: 'Amazon',
    shares: 8.92257,
    price: 219.1,
    avgCost: 224.15,
    dailyChangePct: 1.05,
    assetClass: 'equity',
    meta: {
      sector: 'Consumer Cyclical',
      account: 'Brokerage',
      thesis: 'AWS + retail efficiency',
      tags: ['platform'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/AMZN',
    },
  },
  {
    id: 'msft',
    ticker: 'MSFT',
    name: 'Microsoft',
    shares: 1.88593,
    price: 411.63,
    avgCost: 530.24,
    dailyChangePct: 1.59,
    assetClass: 'equity',
    meta: {
      sector: 'Technology',
      account: 'Brokerage',
      thesis: 'Enterprise moat + cloud + AI',
      tags: ['quality', 'ai'],
      dataSourceUrl: 'https://finance.yahoo.com/quote/MSFT',
    },
  },
  {
    id: 'fxaix',
    ticker: 'FXAIX',
    name: 'Fidelity 500 Index Fund',
    shares: 29.298,
    price: 237.69,
    avgCost: 239.01,
    dailyChangePct: -0.57,
    assetClass: 'fund',
    meta: {
      sector: 'Index Fund',
      account: 'ROTH IRA',
      thesis: 'Core broad-market exposure',
      tags: ['core', 'index'],
      week52Low: 173.01,
      week52High: 242.52,
      dataSourceUrl: 'https://finance.yahoo.com/quote/FXAIX',
    },
  },
]

function normalizeMeta(raw: unknown): PositionMeta {
  const incoming = raw && typeof raw === 'object' ? (raw as Partial<PositionMeta>) : {}
  const tags = Array.isArray(incoming.tags) ? incoming.tags.filter((tag): tag is string => typeof tag === 'string') : []

  return {
    sector: typeof incoming.sector === 'string' ? incoming.sector : undefined,
    account: typeof incoming.account === 'string' ? incoming.account : undefined,
    thesis: typeof incoming.thesis === 'string' ? incoming.thesis : undefined,
    tags,
    closePrice: typeof incoming.closePrice === 'number' ? incoming.closePrice : undefined,
    week52Low: typeof incoming.week52Low === 'number' ? incoming.week52Low : undefined,
    week52High: typeof incoming.week52High === 'number' ? incoming.week52High : undefined,
    dataSourceUrl: typeof incoming.dataSourceUrl === 'string' ? incoming.dataSourceUrl : undefined,
  }
}

function normalizePosition(raw: unknown): PortfolioPosition | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const incoming = raw as Partial<PortfolioPosition>
  if (
    typeof incoming.id !== 'string' ||
    typeof incoming.ticker !== 'string' ||
    typeof incoming.name !== 'string' ||
    typeof incoming.shares !== 'number' ||
    typeof incoming.price !== 'number' ||
    typeof incoming.avgCost !== 'number' ||
    typeof incoming.dailyChangePct !== 'number'
  ) {
    return null
  }

  const assetClass: AssetClass =
    incoming.assetClass === 'equity' ||
    incoming.assetClass === 'fund' ||
    incoming.assetClass === 'cash' ||
    incoming.assetClass === 'crypto'
      ? incoming.assetClass
      : 'other'

  return {
    id: incoming.id,
    ticker: incoming.ticker.toUpperCase(),
    name: incoming.name,
    shares: incoming.shares,
    price: incoming.price,
    avgCost: incoming.avgCost,
    dailyChangePct: incoming.dailyChangePct,
    assetClass,
    meta: normalizeMeta(incoming.meta),
  }
}

export function createDefaultPortfolioStore(): PortfolioStore {
  return {
    positions: DEFAULT_POSITIONS,
    updatedAt: new Date().toISOString(),
  }
}

export function normalizePortfolioStore(raw: unknown): PortfolioStore {
  const fallback = createDefaultPortfolioStore()
  if (!raw || typeof raw !== 'object') {
    return fallback
  }

  const incoming = raw as Partial<PortfolioStore>
  const positions = Array.isArray(incoming.positions)
    ? incoming.positions.map(normalizePosition).filter((entry): entry is PortfolioPosition => Boolean(entry))
    : []

  return {
    positions: positions.length > 0 ? positions : fallback.positions,
    updatedAt: typeof incoming.updatedAt === 'string' ? incoming.updatedAt : fallback.updatedAt,
  }
}
