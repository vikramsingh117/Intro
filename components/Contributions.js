// Renders the shared curated contribution links used by the readable portfolio experience.
// Statuses come from local profile data and are explicitly labelled as supplied snapshots rather than live GitHub state.
import { contributions } from "../lib/contributions";
import styles from "../styles/Contributions.module.css";

export default function Contributions() {
  return <div className={styles.list}>
    {contributions.map(item => <a href={item.url} key={item.url} target="_blank" rel="noreferrer">
      <span className={styles.top}><strong>{item.project} ↗</strong><span className={styles.status}>{item.status}</span></span>
      <span className={styles.title}>{item.title}</span>
    </a>)}
    <small>PR statuses supplied by Vikram · not live-synced</small>
  </div>;
}
