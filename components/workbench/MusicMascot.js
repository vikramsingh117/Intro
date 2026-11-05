import styles from '../../styles/Workbench.module.css';

// Approved headphone pose, split into independently stepped pixel parts.
export default function MusicMascot({phase='on',onTransitionEnd}) {
  return <svg className={styles.mascotMusicSprite} data-phase={phase} viewBox="0 0 107 86" aria-hidden="true" shapeRendering="crispEdges" onAnimationEnd={event=>{if(event.target.dataset.headphones==='true')onTransitionEnd?.();}}>
    <g className={styles.mascotMusicBounce}>
      <g fill="#DD775B">
        <path className={styles.mascotMusicLeftFeet} d="M11 60h11v26H11zM32 60h11v26H32z"/>
        <path className={styles.mascotMusicRightFeet} d="M64 60h11v26H64zM85 60h11v16h9v10H85z"/>
      </g>
      <g className={styles.mascotMusicHead}>
        <g fill="#DD775B"><path d="M11 0h85v65H11z"/><path d="M85 26h22v23H85z"/></g>
        <g className={styles.mascotHeadphones} data-headphones="true">
          <path d="M1 31V-6h9v-10h15v-6h57v6h15v10h9v37H95V-2H85v-9H22v9H12v33z" fill="#0b1820"/>
          <path d="M7 22V-3h9v-9h14v-5h47v5h14v9h9v25h-6V0H84v-8H23v8H13v22z" fill="#99c8ba"/>
          <path d="M28-16h49v4H28z" fill="#c6e4d6"/>
          <path d="M-3 12h17v32H-3zM94 12h17v32H94z" fill="#0b1820"/>
          <path d="M-7 17H5v22H-7zM103 17h12v22h-12z" fill="#99c8ba"/>
          <path d="M-5 19h4v17h-4zM105 19h4v17h-4z" fill="#c6e4d6"/>
          <path d="M8 16h5v23H8zM95 16h5v23h-5z" fill="#334b4d"/>
        </g>
        <g fill="#131b20"><path d="M24 23v-4h4v-4h7v4h4v4h-4v-4h-7v4zM67 23v-4h4v-4h7v4h4v4h-4v-4h-7v4z"/></g>
        <g fill="#f3aa88" opacity=".7"><path d="M23 29h13v4H23zM70 29h13v4H70z"/></g>
        <g className={styles.mascotHeadphoneHands}>
          <path d="M-1 34h12v-8h9v20H0v-4h-6v-8z" fill="#DD775B"/>
          <path d="M0 34h11v5H0z" fill="#f3aa88"/>
          <g className={styles.mascotHeadphoneRightHand}><path d="M87 26h9v8h12v8h-6v4H87z" fill="#DD775B"/><path d="M96 34h11v5H96z" fill="#f3aa88"/></g>
        </g>
      </g>
    </g>
    <g fill="#99c8ba">
      <g className={styles.mascotMusicNote} style={{'--note-delay':'0s'}}><path d="M-19 2h4v22h-12v-5h8zM-15 2h8v5h-8z"/></g>
      <g className={styles.mascotMusicNote} style={{'--note-delay':'-.6s'}}><path d="M113-10h4v24h-12V9h8zM117-10h9v4h-9z"/></g>
      <g className={styles.mascotMusicNote} style={{'--note-delay':'-1.2s'}}><path d="M99-26h3v17h-9v-4h6zM102-26h6v4h-6z"/></g>
    </g>
  </svg>;
}
