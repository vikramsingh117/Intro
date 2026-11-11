import { useContext, useEffect, useRef, useState } from 'react';
import { contributions } from '../../lib/contributions';
import { trackInteraction } from '../../lib/visitor-analytics';
import PortfolioYearNotes from './PortfolioYearNotes';
import LeetCodeSnapshot from './LeetCodeSnapshot';
import InceptionMonitor from './InceptionMonitor';
import JourneyNotebook from './JourneyNotebook';
import { WindowBackContext } from './DesktopWindow';
import PixelDeskScene from './PixelDeskScene';
import { EARLY_PORTFOLIO_URL, LEGACY_PORTFOLIO_URL, PORTFOLIO_HISTORY } from './portfolioHistory';
import { DETAILS } from './journeyTimeline.mjs';
import styles from '../../styles/AboutJourney.module.css';

const STOPS = [
  { year: '2021', month: 2 },
  { year: '2025', month: 56 },
  { year: '2026', month: 60 },
];

export default function AboutJourney({ onOpenUpliance, onOpenNotebook, onToggleRadio, onToggleCeiling, ceilingOn, onEnterPortfolio, radioPlaying }) {
  const setWindowBack = useContext(WindowBackContext);
  const [intro, setIntro] = useState('loading');
  const [index, setIndex] = useState(0);
  const [timelineMotion, setTimelineMotion] = useState({ from: 0, direction: 1 });
  const [previousMonth, setPreviousMonth] = useState(STOPS[0].month);
  const [transitioning, setTransitioning] = useState(false);
  const [selected, setSelected] = useState(null);
  const objectRefs = useRef({}), back = useRef(null), timer = useRef(null);
  const loggedOpen = useRef(false);
  const lastObject = useRef(null), changing = useRef(false);
  const month = STOPS[index].month, detail = selected ? DETAILS[selected] : null;
  const archiveUrl = index === 0 ? EARLY_PORTFOLIO_URL : index === 1 ? LEGACY_PORTFOLIO_URL : null;
  const selectObject = id => {
    if (intro !== 'ready' || changing.current) return;
    trackInteraction('journey_object', `${STOPS[index].year}:${id}`);
    if (month >= 60) {
      if (id === 'upliance') { onOpenUpliance?.(); return; }
      if (id === 'notebook') { onOpenNotebook?.(); return; }
      if (id === 'ceiling') { onToggleCeiling?.(); return; }
      if (id === 'radio') { onToggleRadio?.(); return; }
    }
    setSelected(id);
  };
  const move = direction => {
    const next = Math.max(0, Math.min(STOPS.length - 1, index + direction));
    if (intro !== 'ready' || changing.current || next === index) return;
    setSelected(null);
    trackInteraction('journey_year', `${STOPS[index].year}->${STOPS[next].year}`);
    setTimelineMotion({ from: index, direction: next > index ? 1 : -1 });
    setPreviousMonth(month);
    setIndex(next);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    changing.current = true;
    setTransitioning(true);
    timer.current = setTimeout(() => {
      changing.current = false;
      setTransitioning(false);
    }, 500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!loggedOpen.current) { trackInteraction('journey_open', '2021'); loggedOpen.current = true; }
  }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setIntro('ready'); return; }
    const reveal = setTimeout(() => setIntro('zoom'), 900);
    const finish = setTimeout(() => setIntro('ready'), 2200);
    return () => { clearTimeout(reveal); clearTimeout(finish); };
  }, []);
  useEffect(() => {
    setWindowBack?.(() => selected ? () => {
      trackInteraction('journey_back', `${STOPS[index].year}:${selected}`);
      lastObject.current = selected;
      setSelected(null);
    } : null);
    return () => setWindowBack?.(null);
  }, [selected, index, setWindowBack]);
  const returnToRoom = () => { trackInteraction('journey_back', `${STOPS[index].year}:${selected}`); lastObject.current = selected; setSelected(null); };
  useEffect(() => {
    if (selected) back.current?.focus({ preventScroll: true });
    else if (lastObject.current) {
      objectRefs.current[lastObject.current]?.focus({ preventScroll: true });
      lastObject.current = null;
    }
  }, [selected]);
  return <div className={styles.journey} data-intro={intro} onKeyDown={event => {
    if (event.key === 'Escape' && selected) { event.preventDefault(); event.stopPropagation(); returnToRoom(); }
  }}>
    {intro === 'loading' && <div className={styles.intro} role="status" aria-label="Opening About Me">
      <span>VIKRAM’S ROOM</span><div className={styles.loadingTrack} aria-hidden="true"><i /></div><small>STEPPING INSIDE…</small>
    </div>}
    <main className={styles.stage}>
      {selected === 'computer' && index === 2 ? <InceptionMonitor onEnterPortfolio={() => { trackInteraction('journey_enter_portfolio', '2026'); onEnterPortfolio?.(); }} radioPlaying={radioPlaying} ceilingOn={ceilingOn}/> : selected === 'leetcode' ? <LeetCodeSnapshot month={month} onBack={returnToRoom} backRef={back} radioPlaying={radioPlaying} ceilingOn={ceilingOn}/> : selected === 'computer' && archiveUrl ? <div className={styles.portfolioLayout}><PortfolioYearNotes year={STOPS[index].year} side="left"/><section className={`${styles.closeup} ${styles.archiveMonitor}`} aria-label="Archived portfolio monitor">
        <div className={styles.closeupBar}>
          <button ref={back} onClick={returnToRoom}>← Back to room</button>
          <span className={styles.portfolioYear}>Same portfolio, in {STOPS[index].year}.</span>
          <a onClick={() => trackInteraction('journey_link', `${STOPS[index].year}:portfolio`)} href={archiveUrl} target="_blank" rel="noopener noreferrer">Open full page ↗</a>
        </div>
        <iframe className={styles.archiveFrame} src={archiveUrl} key={archiveUrl} title={`Vikram’s archived portfolio · ${STOPS[index].year} chapter`} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" />
      </section><PortfolioYearNotes year={STOPS[index].year} side="right"/></div> : selected === 'notebook' ? <JourneyNotebook month={month} onBack={returnToRoom} backRef={back}/> : detail ? <section className={`${styles.closeup} ${selected === 'notebook' || selected === 'diploma' ? styles.paper : ''}`} aria-label={detail.title}>
        <div className={styles.closeupBar}><button ref={back} onClick={returnToRoom}>← Back to room</button><span>{selected === 'notebook' || selected === 'diploma' ? 'FIELD NOTES' : 'DESK / DETAIL'}</span></div>
        <article className={styles.detail}>
          <span className={styles.eyebrow}>{detail.meta}</span><h3>{detail.title}</h3>
          {detail.paragraphs.map(text => <p key={text}>{text}</p>)}
          {selected === 'notebook' && month >= 56 && detail.later.map(text => <p key={text}>{text}</p>)}
          {selected === 'computer' && month >= 16 && <p>{detail.portfolio}</p>}
          {selected === 'computer' && month >= 51 && <p>{detail.crawler}</p>}
          {selected === 'computer' && month >= 48 && <section className={styles.history} aria-label="Portfolio through the years">
            <h4>This portfolio, through Git</h4>
            {PORTFOLIO_HISTORY.filter(version => version.year <= 2021 + Math.floor(month / 12)).map(version => <p key={version.commit}><small>{version.date}</small><br/><a href={`https://github.com/vikramsingh117/Intro/tree/${version.commit}`} target="_blank" rel="noopener noreferrer">{version.label} ↗</a></p>)}
            {LEGACY_PORTFOLIO_URL && <a href={LEGACY_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">Open the archived portfolio ↗</a>}
          </section>}
          {selected === 'github' && <section className={styles.contributions} aria-label="Open source contributions">
            <h4>Open source / pull requests</h4>
            <p>Selected contributions across my journey. Saved statuses, not live GitHub data or a year-specific snapshot.</p>
            {contributions.map(contribution => <a key={contribution.url} href={contribution.url} target="_blank" rel="noopener noreferrer" onClick={() => trackInteraction('journey_link', `github:${contribution.project}`)}>
              <span><strong>{contribution.project}</strong><small>{contribution.title}</small></span>
              <b data-status={contribution.status}>{contribution.status}</b><span aria-hidden="true">↗</span>
              <span className={styles.srOnly}>Opens in a new tab</span>
            </a>)}
          </section>}
          {detail.stack && <p className={styles.stack}>{detail.stack}</p>}
          {detail.href && <a onClick={() => trackInteraction('journey_link', `${STOPS[index].year}:${selected}`)} href={detail.href} target="_blank" rel="noopener noreferrer">{detail.link} ↗ <span className={styles.srOnly}>(opens in a new tab)</span></a>}
        </article>
      </section> : <div className={styles.room}>
        <div className={styles.sceneViewport}><PixelDeskScene month={month} previousMonth={previousMonth} transitioning={transitioning} onSelect={selectObject} ceilingOn={ceilingOn} radioPlaying={radioPlaying} disabled={intro !== 'ready'} objectRefs={objectRefs}/></div>
      </div>}
    </main>
    <nav hidden={selected === 'computer' && index === 2} className={styles.timeline} style={{ '--time-direction': timelineMotion.direction, '--time-stop': index }} aria-label="Journey year" onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); event.stopPropagation(); move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}>
      <button onClick={() => move(-1)} disabled={index === 0} aria-disabled={transitioning || undefined} aria-label="Previous year">‹</button>
      <div className={styles.timelineCenter}>
        <div className={styles.yearReel} aria-hidden="true">
          {transitioning && <span key={`out-${timelineMotion.from}`} className={styles.yearLeaving}>{STOPS[timelineMotion.from].year}</span>}
          <span key={`in-${index}`} className={transitioning ? styles.yearArriving : undefined}>{STOPS[index].year}</span>
        </div>
        <div className={styles.timeRail} aria-hidden="true">
          {STOPS.map((stop, i) => <i key={stop.year} className={i <= index ? styles.timeVisited : undefined}/>)}
          <b className={styles.timeMarker}/>
        </div>
        <span className={styles.srOnly} aria-live="polite" aria-atomic="true">{STOPS[index].year}</span>
      </div>
      <button onClick={() => move(1)} disabled={index === STOPS.length - 1} aria-disabled={transitioning || undefined} aria-label="Next year">›</button>
    </nav>
  </div>;
}
