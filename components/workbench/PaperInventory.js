import styles from '../../styles/Workbench.module.css';

export default function PaperInventory({ onThrow, count }) {
  return <div className={styles.paperInventory} role="toolbar" aria-label="Inventory">
    <button onClick={onThrow} title="Pick up paper ball to flick" aria-label={`Pick up paper ball to flick (${count} remaining)`}>
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <path d="M15 5 29 4 40 14 44 28 34 41 19 44 7 34 4 19Z" fill="#e8ddc4" stroke="#a69a80" strokeWidth="2"/>
        <path d="m15 5 4 14-15 0m15 0 10-15-1 19 12-9M19 19l9 4-9 21 1-15-13 5m21-11 6 18-14-12m8-6 16 5" fill="none" stroke="#b5a88b" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      <span aria-hidden="true">{count}</span>
    </button>
  </div>;
}
