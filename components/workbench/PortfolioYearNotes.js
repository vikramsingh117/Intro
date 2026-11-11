import styles from '../../styles/AboutJourney.module.css';

const NOTES = {
  2021: {
    left: [{ title: 'The beginning', text: 'This is where my journey in software began. First year, first experiments, a lot to figure out.', foot: '2021 / starting out' }],
    right: [{ title: 'My first deploy!', text: 'I deployed my first Vercel project in my first year. An idea on my laptop was now a website anyone could visit.', foot: 'local → live ↗' }],
  },
  2025: {
    left: [
      { title: 'Going deeper', text: 'Redis, Linux, and understanding the systems behind the interface.', foot: '$ keep exploring' },
      { title: 'Practice & contribute', text: 'Competitive coding, solving problems, and starting to contribute on GitHub.', foot: 'learn → build → share' },
    ],
    right: [
      { title: 'Beyond the UI', text: 'IP-based rate limiting with Redis. MongoDB connections. CDN caching. Bringing industry practices into my own portfolio.', foot: 'thinking about production' },
      { title: '20+ projects', text: 'By 2025, I had more than 20 projects deployed on Vercel.', foot: 'each deploy taught me something' },
    ],
  },
  2026: {
    left: [{ title: 'The next level', text: 'Using AI tools to explore ideas and build experiences I could only imagine before.', foot: 'same curiosity, new tools' }],
    right: [{ title: 'Learning another dimension', text: 'Learning 3D modelling, working with scenes, and turning my portfolio into a room you can explore.', foot: 'a website → a little world' }],
  },
};

export default function PortfolioYearNotes({ year, side }) {
  return <aside className={`${styles.yearNotes} ${side === 'left' ? styles.notesLeft : styles.notesRight}`} aria-label={`${year} journey notes`}>
    {NOTES[year][side].map(note => <article className={styles.yearNote} key={note.title}>
      <h4>{note.title}</h4><p>{note.text}</p><small>{note.foot}</small>
    </article>)}
  </aside>;
}
