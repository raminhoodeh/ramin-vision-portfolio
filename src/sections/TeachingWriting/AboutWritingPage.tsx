import { portfolioContent } from '../../data/portfolio';
import './TeachingWriting.css';

// Short excerpts from the author's supplied book material. The second book's
// internal story title is not presented as a separate publication.
const excerpts = [
  'When I’m reading a good book, it feels like I’m searching for something… I don’t know what I’m looking for, but I know that when I find it I’ll feel more at peace - more at one - with myself.',
  'ONCE UPON A TIME, there was a man named Adam who lived in a perfect, kind and serene Garden. Adam spent most of his perfect life bored, wondering and feeling like something was missing.',
];

export function AboutWritingPage() {
  const { writing } = portfolioContent.teachingSpeakingWriting;
  return <article className="about-writing-page" aria-labelledby="about-writing-title">
    <header>
      <p>About &amp; writing</p>
      <h1 id="about-writing-title">You are shaped by what you create.</h1>
      <p>I’m interested in how people find clarity in complex systems. In product work, that means making decisions traceable. In teaching, it means making ideas usable. In fiction, it means making them felt.</p>
      <p>My commercial work, independent software and writing give me different ways to explore that question. Writing a story makes me stay with a person’s perspective; building a product asks me to turn an idea into something useful and see where it fails.</p>
      <nav aria-label="Explore my work and thinking">
        <a href="/experience-education">Professional work</a><a href="/projects">Products I’ve built</a>
        <a href="/thoughts">Teaching &amp; speaking</a><a href="/thoughts/framework-of-metacognition">My metacognition essay</a>
      </nav>
    </header>
    <section id="thoughts-books" aria-labelledby="about-books-title">
      <h2 id="about-books-title">Two books, one continuing enquiry.</h2>
      <div className="about-writing-page__books">
        {writing.books.map((book, index) => <section key={book.bookName} className="about-writing-page__book" aria-labelledby={`about-book-${index}`}>
          {typeof book.bookImage === 'string' ? <img src={book.bookImage} alt={`${book.bookName} cover`} loading="lazy" decoding="async" /> : null}
          <h3 id={`about-book-${index}`}>{book.bookName}</h3>
          <p>{book.bookDescription}</p>
          <p><strong>The premise.</strong> {book.premise}</p>
          <p className="about-writing-page__note">{index === 0 ? 'The paperback listing uses the title The Proposition: Purpose.' : 'The Untold Story of Adam and Eve is the story within The Meaning of Life, followed by its 3-Day Purpose Guide. Reading and audio material are available through the supplied links below.'}</p>
          <p><strong>A short excerpt</strong></p>
          <blockquote>{excerpts[index]}</blockquote>
          <p><strong>How it shaped my work.</strong> {book.shapedMe}</p>
          <nav aria-label={`Read ${book.bookName}`}>
            <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer">{index === 0 ? 'View the paperback on Amazon' : 'Visit the author site'}</a>
            {book.fullText ? <a href={book.fullText} target="_blank" rel="noopener noreferrer">{index === 0 ? 'Read the supplied manuscript' : 'Open the reading folder'}</a> : null}
            {book.sourceLinks.filter((link) => link.label === 'Audiobook').map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">Listen to the supplied audiobook</a>)}
          </nav>
        </section>)}
      </div>
    </section>
    <section aria-labelledby="about-thinking-title">
      <h2 id="about-thinking-title">A way I organise questions, open to revision.</h2>
      <p>My Framework of Metacognition connects experience, values, vision, mission, strategy, tactics and what gets made. I use it to make the reasons behind a choice inspectable. It is a personal working method: customer evidence, market conditions and a failed assumption can change the direction, as well as the next task.</p>
      <nav><a href="/thoughts/framework-of-metacognition">Read the essay</a><a href="/product-method">See the AI product method</a><a href="/contact">Get in touch</a></nav>
    </section>
  </article>;
}
