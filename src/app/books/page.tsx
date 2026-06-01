'use client'

import { useEffect, useState } from 'react'
import { PerspectiveBook } from '@/styles/components/perspective-book'
import { SidebarLayout } from "@/components/layout/SidebarLayout"
import { useStagedAnimation } from '@/components/animation/useStagedAnimation'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   subtitle settles in
 *  100ms   book rows lift in quickly
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  subtitleAppear: 0,
  booksAppear: 100,
}

const BOOKS_PER_ROW = 3
const BOOK_WIDTH = 124
const BOOK_HEIGHT = 186
const GRID_GAP = 24

// Match the layout's `lg` breakpoint (1024px). Below it, the sidebar collapses
// and we cap each row to a single book.
function useBooksPerRow() {
  const [booksPerRow, setBooksPerRow] = useState(BOOKS_PER_ROW)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setBooksPerRow(query.matches ? BOOKS_PER_ROW : 1)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return booksPerRow
}

const readBooks = [
  {
    title: "Creative Selection: Inside Apple's Design Process During the Golden Age of Steve Jobs",
    author: 'Ken Kocienda',
    coverClass: 'bg-[#d7d8d3]',
    coverSrc: '/books/creative-ol.jpg',
  },
  {
    title: 'Mother Night',
    author: 'Kurt Vonnegut',
    coverClass: 'bg-[#234184]',
    coverSrc: '/books/mother.jpg',
  },
  {
    title: 'The Making of Prince of Persia: Journals 1985-1993',
    author: 'Jordan Mechner',
    coverClass: 'bg-[#2b3e9d]',
    coverSrc: '/books/prince-ol.jpg',
  },
]

const readingBooks = [
  {
    title: "The Drunkard's Walk: How Randomness Rules Our Lives",
    author: 'Leonard Mlodinow',
    coverClass: 'bg-[#f1efe9]',
    coverSrc: '/books/drunkards-walk-ol.jpg',
  },
  {
    title: 'The Art of Doing Science and Engineering',
    author: 'Richard W. Hamming',
    coverClass: 'bg-[#354331]',
    coverSrc: '/books/hamming-ol.jpg',
  },
]

type Book = {
  title: string
  author: string
  coverClass: string
  coverSrc: string
}

function BookRow({
  book,
  index,
  reducedMotion,
  setActiveIndex,
}: {
  book: Book
  index: number
  reducedMotion: boolean
  setActiveIndex: (index: number | null) => void
}) {
  return (
    <li
      className={`book-item relative z-10 transition-[filter,opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        reducedMotion ? 'duration-0' : ''
      }`}
    >
      <div
        tabIndex={0}
        aria-label={`${book.title} by ${book.author}`}
        className="book-hitbox group/book inline-flex outline-none"
        onBlur={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex(index)}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <PerspectiveBook size="cover" className={book.coverClass}>
          <img
            src={book.coverSrc}
            alt={`${book.title} cover`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </PerspectiveBook>
      </div>
    </li>
  )
}

function BookSection({
  id,
  title,
  books,
  stage,
  reducedMotion,
  booksPerRow,
}: {
  id: string
  title: string
  books: Book[]
  stage: number
  reducedMotion: boolean
  booksPerRow: number
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activeBook = activeIndex === null ? null : books[activeIndex]
  const activeRow = activeIndex === null ? 0 : Math.floor(activeIndex / booksPerRow)
  const columnCount = Math.min(books.length, booksPerRow)
  const booksInActiveRow =
    activeIndex === null
      ? columnCount
      : Math.min(booksPerRow, books.length - activeRow * booksPerRow)
  const captionLeft = booksInActiveRow * (BOOK_WIDTH + GRID_GAP)

  return (
    <section
      aria-labelledby={id}
      className={`transition-all duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
        stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${reducedMotion ? 'duration-0' : ''}`}
    >
      <div className="mb-5">
        <h2 id={id} className="text-[14px] font-medium text-black/55">{title}</h2>
      </div>

      <ol
        className="relative grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, ${BOOK_WIDTH}px)`,
        }}
      >
        {books.map((book, index) => (
          <BookRow
            key={book.title}
            book={book}
            index={index}
            reducedMotion={reducedMotion}
            setActiveIndex={setActiveIndex}
          />
        ))}
        <div
          className={`book-caption pointer-events-none absolute left-0 z-50 w-52 translate-x-1 opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            activeBook ? 'translate-x-0 opacity-100' : ''
          } ${reducedMotion ? 'duration-0' : ''}`}
          style={{ top: `${activeRow * (BOOK_HEIGHT + GRID_GAP)}px`, left: `${captionLeft}px` }}
        >
          {activeBook && (
            <>
              <p
                className="overflow-hidden text-[15px] font-medium leading-snug text-foreground"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 4,
                }}
              >
                {activeBook.title}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{activeBook.author}</p>
            </>
          )}
        </div>
      </ol>
    </section>
  )
}

export default function BooksPage() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.subtitleAppear, TIMING.booksAppear],
  })
  const booksPerRow = useBooksPerRow()

  return (
    <SidebarLayout currentPage="books">
      <p className={`max-w-md text-[15px] leading-relaxed text-muted-foreground transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
        stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${reducedMotion ? 'duration-0' : ''}`}>books i have read from Jan 1st 2026.</p>

      <div className="books-interaction mt-9 space-y-8">
        <BookSection
          id="reading-books"
          title="reading"
          books={readingBooks}
          stage={stage}
          reducedMotion={reducedMotion}
          booksPerRow={booksPerRow}
        />

        <BookSection
          id="read-books"
          title="read"
          books={readBooks}
          stage={stage}
          reducedMotion={reducedMotion}
          booksPerRow={booksPerRow}
        />
      </div>
    </SidebarLayout>
  )
}
