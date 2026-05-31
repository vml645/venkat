'use client'

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
  reducedMotion,
}: {
  book: Book
  reducedMotion: boolean
}) {
  return (
    <li
      className={`transition-all duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
        reducedMotion ? 'duration-0' : ''
      }`}
    >
      <PerspectiveBook size="cover" className={book.coverClass}>
        <img
          src={book.coverSrc}
          alt={`${book.title} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </PerspectiveBook>
    </li>
  )
}

function BookSection({
  id,
  title,
  books,
  stage,
  reducedMotion,
}: {
  id: string
  title: string
  books: Book[]
  stage: number
  reducedMotion: boolean
}) {
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

      <ol className="grid grid-cols-[repeat(auto-fit,124px)] gap-6">
        {books.map((book) => (
          <BookRow
            key={book.title}
            book={book}
            reducedMotion={reducedMotion}
          />
        ))}
      </ol>
    </section>
  )
}

export default function BooksPage() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.subtitleAppear, TIMING.booksAppear],
  })

  return (
    <SidebarLayout currentPage="books">
      <p className={`max-w-md text-[15px] leading-relaxed text-muted-foreground transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
        stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${reducedMotion ? 'duration-0' : ''}`}>books i have read from Jan 1st 2026.</p>

      <div className="mt-9 space-y-11">
        <BookSection
          id="reading-books"
          title="reading"
          books={readingBooks}
          stage={stage}
          reducedMotion={reducedMotion}
        />

        <BookSection
          id="read-books"
          title="read"
          books={readBooks}
          stage={stage}
          reducedMotion={reducedMotion}
        />
      </div>
    </SidebarLayout>
  )
}
