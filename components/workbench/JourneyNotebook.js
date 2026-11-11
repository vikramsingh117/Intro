import styles from '../../styles/JourneyNotebook.module.css';

function Doodle({ kind }) {
  return <svg className={styles.doodle} viewBox="0 0 240 110" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'pokemon' ? <>
      <path d="M25 74l-3-37 14 17 10-29 8 30 18-14-9 35-9 12H36zM35 68h2m16-1h2M41 77l6 2 5-3M22 78L8 70l8-9-8-8"/><circle cx="114" cy="65" r="24"/><path d="M90 65h16m16 0h16"/><circle cx="114" cy="65" r="8"/><circle cx="114" cy="65" r="3"/>
      <path d="M163 30h51v60h-51zM171 38h35v25h-35zM175 73v12m-6-6h12m17-4h2m5 7h2M177 55l7-8 7 8 7-11"/><path d="M66 19l4-7 5 7 8 1-6 5 1 8-8-4-7 4 1-8-5-5z"/>
    </> : kind === 'systems' ? <>
      <rect x="7" y="30" width="58" height="38" rx="2"/><rect x="94" y="30" width="58" height="38" rx="2"/><path d="M65 49h29m-7-5 7 5-7 5M152 49h26"/><ellipse cx="204" cy="33" rx="23" ry="8"/><path d="M181 33v40c0 11 46 11 46 0V33m-46 20c0 11 46 11 46 0M21 42l7 6-7 6m14 1h14M108 42h30m-30 8h23m-23 8h30M36 69v22h85V69"/>
      <text x="12" y="22" stroke="none" fill="currentColor" fontSize="10" fontFamily="monospace">client</text><text x="97" y="22" stroke="none" fill="currentColor" fontSize="10" fontFamily="monospace">service</text><text x="182" y="99" stroke="none" fill="currentColor" fontSize="10" fontFamily="monospace">storage</text>
    </> : <>
      <path d="M24 18h51v43H24zM24 24H12v15q0 14 15 14m48-29h12v15q0 14-15 14M39 62v17H27v8h47v-8H60V62M37 39l9-10 9 10-9 10zM111 75l18-39 18 39m-29-13h22M163 33h52v42h-52zM174 45h30m-30 9h24m-24 9h27M108 91h108"/>
      <path d="M184 15l3-8 4 8 9 1-7 6 2 8-8-5-8 5 2-8-7-6z"/>
    </>}
  </svg>;
}

export default function JourneyNotebook({ month, onBack, backRef }) {
  const early = month < 48;
  return <section className={styles.notebook} aria-label={`${early ? '2021' : '2025'} illustrated notebook`}>
    <button ref={backRef} className={styles.back} onClick={onBack}>← Desk</button>
    <div className={styles.book}>
      <div className={styles.cover} aria-hidden="true"><span>FIELD NOTES<small>VIKRAM / {early ? '2021' : '2025'}</small></span></div>
      <div className={styles.spread}>
        <article className={styles.page}>
          <span className={styles.date}>{early ? 'Mumbai → Chennai / 2021' : 'VIT Chennai / 2025'}</span>
          {early ? <>
            <h2>Before the first semester</h2>
            <p><b>10th → SNPS School</b><br/>Mumbai.</p>
            <p><b>12th → MNR College</b><br/>Mumbai.</p>
            <p className={styles.note}>JEE exam → VITEEE<br/><strong>AIR &lt; 10,000!</strong></p>
            <p>A new chapter: Computer Science<br/>at <b>VIT Chennai</b>.</p>
            <Doodle kind="achievement"/>
          </> : <>
            <h2>Four years later</h2>
            <p><b>B.Tech · Computer Science</b><br/>VIT Chennai · 2021–2025</p>
            <p className={styles.note}>CGPA <strong>8.4 / 10</strong></p>
            <p><b>Google Hash Code</b><br/>1st on campus, among 50+ teams.</p>
            <p><b>20+ projects on Vercel by 2025.</b><br/>Portfolio · Go web crawler<br/>Cribble → Office Solutions</p>
            <Doodle kind="achievement"/>
          </>}
          <span className={styles.pageNumber}>1</span>
        </article>
        <article className={styles.page}>
          <span className={styles.date}>{early ? 'ideas / sketches / side quests' : 'problems / code / systems'}</span>
          {early ? <>
            <h2>Not just exam notes</h2>
            <Doodle kind="pokemon"/>
            <p className={styles.scrawl}>Active in Pokémon modding / 2021</p>
            <p>Games were something to explore,<br/>not only something to play.</p>
            <p className={styles.note}>What if I could change<br/>the game myself?</p>
            <div className={styles.sketchGrid} aria-hidden="true">✧ &nbsp; + &nbsp; ✧<br/>[ map ] → [ new idea ]</div>
          </> : <>
            <h2>Practice → build → repeat</h2>
            <div className={styles.code}>LeetCode: two pointers / graphs<br/>Linux: ps · grep · shell<br/>GitHub: branch → commit → merge</div>
            <Doodle kind="systems"/>
            <p>Spring Boot · Redis · SQL<br/>Go · MongoDB · Git</p>
            <p><b>2025 contest rating:</b> —<br/><b>GitHub contributions to 2025:</b> —<br/><small>Historical totals to add.</small></p>
            <p className={styles.margin}>Fewer doodles. More diagrams.<br/>Check the edge cases.</p>
          </>}
          <span className={styles.pageNumber}>2</span>
        </article>
      </div>
    </div>
  </section>;
}
