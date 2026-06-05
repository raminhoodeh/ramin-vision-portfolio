import { useState } from 'react';
import { motion } from 'framer-motion';
import nssoBillboardUrl from '../../assets/projects/nsso-billboard-stage4.jpg';
import nssoSelfwareArtworkUrl from '../../assets/projects/nsso-mock.webp';
import { portfolioContent } from '../../data/portfolio';
import { type BookEntry } from '../types';
import { isPlaceholderValue, contentValue } from '../../lib/placeholder';
import { ContentToken } from '../../components/ContentToken';
import { ProjectLink } from '../Projects/index';

function BookCoverButton({
  book,
  index,
  isActive,
  onSelect,
}: {
  book: BookEntry;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const coverImage = isPlaceholderValue(book.bookImage) ? null : book.bookImage;

  return (
    <button
      type="button"
      className="books-shelf-cover"
      data-active={isActive ? 'true' : 'false'}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <span className="books-shelf-cover-spine" aria-hidden="true" />
      <span className="books-shelf-cover-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="books-shelf-cover-art">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <span className="books-shelf-cover-content">
          <span>{contentValue(book.bookType)}</span>
          <strong>{book.bookName}</strong>
          <em>Ramin Hoodeh</em>
        </span>
      </span>
    </button>
  );
}

function BookLinkCluster({ book }: { book: BookEntry }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ProjectLink label="Purchase link" value={book.purchaseLink} />
      {book.previewLink ? <ProjectLink label="Preview link" value={book.previewLink} /> : null}
      {book.summaryLink ? <ProjectLink label="Summary link" value={book.summaryLink} /> : null}
      {book.fullText ? <ProjectLink label="Full text" value={book.fullText} /> : null}
    </div>
  );
}

function getBookWorldImages(book: BookEntry) {
  const inventory = book.visualInventory;
  const images: { src: string; label: string; role: string }[] = [];

  const addImage = (src: string | undefined, label: string, role: string) => {
    if (src) images.push({ src, label, role });
  };

  const addImageList = (sources: readonly string[] | undefined, label: string, role: string) => {
    sources?.forEach((src, index) => addImage(src, `${label} ${index + 1}`, role));
  };

  addImage(inventory.cover, 'Cover', 'Artifact');
  addImage('openedBook' in inventory ? inventory.openedBook : undefined, 'Opened book', 'Artifact');
  addImageList(inventory.world, 'World frame', 'World');
  addImageList('characters' in inventory ? inventory.characters : undefined, 'Character', 'Cast');
  addImageList('portrait' in inventory ? inventory.portrait : undefined, 'Portrait', 'World');
  addImage('quote' in inventory ? inventory.quote : undefined, 'Quote page', 'Text');
  addImageList('supporting' in inventory ? inventory.supporting : undefined, 'Supporting frame', 'World');

  return images;
}

function BookWorldGallery({ book }: { book: BookEntry }) {
  const worldImages = getBookWorldImages(book);
  const heroImage = worldImages[1] ?? worldImages[0];
  const supportingImages = worldImages.slice(2, 7);

  return (
    <div className="books-world-gallery">
      {heroImage ? (
        <figure className="books-world-hero">
          <img
            src={heroImage.src}
            alt=""
            loading="eager"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <figcaption>
            <span>{heroImage.role}</span>
            <strong>{book.bookName}</strong>
          </figcaption>
        </figure>
      ) : null}

      <div className="books-world-grid" aria-label={`${book.bookName} visual world`}>
        {supportingImages.map((image, index) => (
          <figure key={`${book.bookName}-${image.src}`} className={index === 0 ? 'is-wide' : undefined}>
            <img
              src={image.src}
              alt=""
              loading="eager"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <figcaption>
              <span>{image.role}</span>
              <strong>{image.label}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function BookInsightGrid({ book }: { book: BookEntry }) {
  const insights = [
    { label: 'Premise', value: book.premise },
    { label: 'Core question', value: book.coreQuestion },
    { label: 'Reader use', value: book.readerUse },
    { label: 'How it shaped me', value: book.shapedMe },
  ];

  return (
    <div className="books-shelf-insight-grid">
      {insights.map((insight) => (
        <div key={insight.label}>
          <span>{insight.label}</span>
          <p>{insight.value}</p>
        </div>
      ))}
    </div>
  );
}

function BookTagStrip({ book }: { book: BookEntry }) {
  return (
    <div className="books-shelf-tag-strip">
      {book.tags.map((tag) => (
        <span key={`${book.bookName}-${tag}`}>{tag}</span>
      ))}
    </div>
  );
}

function BookMiniVisualStrip({ book }: { book: BookEntry }) {
  const images = getBookWorldImages(book).slice(0, 4);

  return (
    <div className="books-shelf-mini-strip" aria-label={`${book.bookName} image strip`}>
      {images.map((image) => (
        <span key={`${book.bookName}-mini-${image.src}`}>
          <img
            src={image.src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </span>
      ))}
    </div>
  );
}

function BooksExpressionBridge() {
  const expression = portfolioContent.teachingSpeakingWriting.frame.formatIntros.books.personalExpression;

  return (
    <motion.article
      className="books-expression-bridge"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="books-expression-quote">
        <p>{expression.eyebrow}</p>
        <blockquote>"{expression.quote}"</blockquote>
        <span>{expression.thesis}</span>
      </div>
      <div className="books-expression-pillars">
        {expression.pillars.map((pillar) => (
          <div key={pillar.label}>
            <span>{pillar.label}</span>
            <p>{pillar.body}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

export function NssoExpressionBridge() {
  const nsso = portfolioContent.teachingSpeakingWriting.frame.formatIntros.books.personalExpression.nsso;

  return (
    <motion.article
      className="books-nsso-bridge"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="books-nsso-art">
        <img
          src={nssoBillboardUrl}
          alt="nsso billboard and product identity visual."
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = nssoSelfwareArtworkUrl;
          }}
        />
        <div className="books-nsso-art-overlay" aria-hidden="true" />
        <div className="books-nsso-art-copy">
          <span>{nsso.eyebrow}</span>
          <strong>{nsso.title}</strong>
        </div>
      </div>

      <div className="books-nsso-copy">
        <p>{nsso.eyebrow}</p>
        <h4>{nsso.title}</h4>
        <span>{nsso.body}</span>
        <div className="books-nsso-thesis-grid">
          <div>
            <span>Product thesis</span>
            <p>{nsso.productThesis}</p>
          </div>
          <div>
            <span>Design thesis</span>
            <p>{nsso.designThesis}</p>
          </div>
        </div>
        <div className="books-nsso-stack" aria-label="nsso expression stack">
          {nsso.stack.map((item) => (
            <span key={`nsso-stack-${item}`}>{item}</span>
          ))}
        </div>
        <div className="books-nsso-links">
          {nsso.links.map((link) => (
            <ProjectLink key={link.href} label={link.label} value={link.href} />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export function BooksShelf({ books }: { books: readonly BookEntry[] }) {
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const activeBook = books[activeBookIndex] ?? books[0];
  const booksFrame = portfolioContent.teachingSpeakingWriting.frame.formatIntros.books;

  return (
    <section id="thoughts-books" className="thought-format-section books-shelf">
      <div className="books-shelf-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--thought-faint)]">
            {booksFrame.expression.eyebrow}
          </p>
          <h3 className="mt-4 max-w-5xl text-5xl font-semibold tracking-[-0.065em] text-[color:var(--thought-strong)] md:text-7xl">
            {booksFrame.personalExpression.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--thought-muted)]">
            {booksFrame.title}
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--thought-hairline)] bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[color:var(--thought-muted)]">
          Story + product
        </span>
      </div>

      <BooksExpressionBridge />

      {activeBook ? (
        <div className="books-shelf-stage">
          <div className="books-shelf-reader">
            <p className="text-xs uppercase tracking-[0.26em] text-white/42">Selected reading path</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ContentToken value={activeBook.bookType} />
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs text-white/56">
                Long-form
              </span>
            </div>
            <h4 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
              {activeBook.bookName}
            </h4>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base md:leading-8">
              {contentValue(activeBook.bookDescription)}
            </p>
            <p className="books-shelf-reader-thesis">{booksFrame.body}</p>

            <BookInsightGrid book={activeBook} />

            <div className="books-shelf-guide">
              <span>Included guide</span>
              <p>{activeBook.includedGuide}</p>
            </div>

            <BookTagStrip book={activeBook} />

            <div className="mt-7">
              <BookLinkCluster book={activeBook} />
            </div>

            {activeBook.bookVideo ? (
              <div className="books-shelf-video mt-7">
                <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/42">Video / trailer</p>
                <div className="mt-3 flex aspect-video items-end rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-4">
                  <div>
                    <p className="text-sm leading-6 text-white/58">
                      {isPlaceholderValue(activeBook.bookVideo) ? contentValue(activeBook.bookVideo) : 'Media link ready'}
                    </p>
                    <div className="mt-3">
                      <ProjectLink label="Book video" value={activeBook.bookVideo} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="books-shelf-display">
            <div className="books-shelf-display-copy">
              <p className="text-xs uppercase tracking-[0.26em] text-white/42">World view</p>
              <p className="mt-3 text-sm leading-6 text-white/58">
                Covers act as selectors, while the selected book opens into the visual system behind the story.
              </p>
            </div>
            <BookWorldGallery book={activeBook} />
            <div className="books-shelf-plinth" aria-label="Book selector">
              {books.map((book, index) => (
                <BookCoverButton
                  key={book.bookName}
                  book={book}
                  index={index}
                  isActive={index === activeBookIndex}
                  onSelect={() => setActiveBookIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <NssoExpressionBridge />
    </section>
  );
}
