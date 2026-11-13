import { contributions } from '../../lib/contributions';
import { DETAILS } from './journeyTimeline.mjs';
import styles from '../../styles/AboutJourney.module.css';

export default function GitHubSnapshot() {
  const detail = DETAILS.github;
  return <section className={`${styles.desktopProfile} ${styles.githubView}`} aria-label="GitHub profile snapshot">
    <header className={styles.closeupBar}>
      <span>GITHUB / BUILDING IN THE OPEN</span>
      <a href={detail.href} target="_blank" rel="noopener noreferrer">Live profile ↗</a>
    </header>
    <article className={styles.detail}>
      <span className={styles.eyebrow}>{detail.meta}</span>
      <h3>{detail.title}</h3>
      {detail.paragraphs.map(text => <p key={text}>{text}</p>)}
      <section className={styles.contributions} aria-label="Open source contributions">
        <h4>Open source / pull requests</h4>
        <p>Selected contributions across my journey. Saved statuses, not live GitHub data or a year-specific snapshot.</p>
        {contributions.map(contribution => <a key={contribution.url} href={contribution.url} target="_blank" rel="noopener noreferrer">
          <span><strong>{contribution.project}</strong><small>{contribution.title}</small></span>
          <b data-status={contribution.status}>{contribution.status}</b><span aria-hidden="true">↗</span>
          <span className={styles.srOnly}>Opens in a new tab</span>
        </a>)}
      </section>
      <a href={detail.href} target="_blank" rel="noopener noreferrer">{detail.link} ↗ <span className={styles.srOnly}>(opens in a new tab)</span></a>
    </article>
  </section>;
}
