import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AboutChat from "../components/AboutChat";
import AssistantJourney from "../components/AssistantJourney";
import Contributions from "../components/Contributions";
import ProjectDetails from "../components/ProjectDetails";
import styles from "../styles/Home.module.css";

const roles = [
  { company: "Upliance.ai", role: "AI Product Engineer", date: "JAN 2026 — PRESENT", current: true,
    summary: "Real-time AI & voice onboarding",
    description: "Shaping product decisions and owning the real-time layer between people and AI-powered appliances.",
    points: ["Integrated Server-Sent Events for real-time LLM updates in the Airfryer app.", "Built voice-enabled onboarding with WebSockets.", "Maintain the backend of an AI platform serving 4,000+ daily active customers.", "Deployed 10+ GCP triggers, each containing over 100 lines of SQL code.", "Built a centralized VPS for SSH access and device-specific policies."],
    stack: "SSE / WebSockets / AI infrastructure" },
  { company: "Office Solutions", role: "Backend Trainee", date: "MAR — JUN 2025",
    summary: "Backend performance & testing",
    description: "Delivered a benchmarking tool in three weeks, then made the foundations faster.",
    points: ["Simplified database relationships and removed redundant queries for a 50% performance boost.", "Wrote 50+ tests with Cucumber and JUnit.", "Implemented Redis rate limiting in a Java and Spring Boot backend."],
    stack: "Java / Spring Boot / Redis / Azure" },
  { company: "Cribble Org", role: "SWE Intern", date: "JAN — MAR 2025",
    summary: "Community apps & observability",
    description: "Worked on a Telegram MiniApp for a community of 3,000+ members.",
    points: ["Implemented Winston logging with 50+ global and component-level logs.", "Maintained and optimized Firestore deployments on Google Cloud."],
    stack: "React / Firebase / GCP" },
];

function SystemDrawing({ selected, onSelect }) {
  const drawing = useRef(null);
  const modes = [
    { color: "#c54322", labels: ["VOICE", "AI UPDATES", "BACKEND SYSTEMS"] },
    { color: "#456b9a", labels: ["TESTING", "DATABASES", "PERFORMANCE"] },
    { color: "#3c7854", labels: ["REACT", "LOGGING", "CLOUD"] },
  ];
  const move = event => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    drawing.current.style.setProperty("--tilt-x", ((event.clientY - rect.top) / rect.height - .5) * -8 + "deg");
    drawing.current.style.setProperty("--tilt-y", ((event.clientX - rect.left) / rect.width - .5) * 8 + "deg");
  };
  return <div className={styles.drawing} style={{ "--signal-color": modes[selected].color }} onPointerMove={move} onPointerLeave={() => {
    drawing.current.style.setProperty("--tilt-x", "0deg");
    drawing.current.style.setProperty("--tilt-y", "0deg");
  }}>
    <div className={styles.drawingTop}><span>{roles[selected].company.toUpperCase()} / {roles[selected].date}</span><span className={styles.dot} /></div>
    <div ref={drawing} className={styles.drawingStage}>
    <svg viewBox="0 0 480 350" role="img" aria-labelledby="system-title">
      <title id="system-title">{roles[selected].company}: {roles[selected].summary}</title>
      <defs>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#d4cfc3" /></pattern>
      </defs>
      <rect width="480" height="350" fill="url(#dots)" />
      <g fill="none" stroke="#cbc6ba" strokeWidth="1">
        <ellipse cx="240" cy="171" rx="181" ry="68" transform="rotate(-32 240 171)" />
        <ellipse cx="240" cy="171" rx="181" ry="68" transform="rotate(32 240 171)" />
        <circle cx="240" cy="171" r="115" strokeDasharray="3 7" />
        <path d="M30 171h420M240 22v298" strokeDasharray="3 7" />
      </g>
      <g className={styles.orbit}><circle cx="103" cy="98" r="5" fill="var(--signal-color)" /><circle cx="377" cy="244" r="5" fill="#1f302b" /></g>
      <g className={styles.systemCore} key={selected} fill="#eeebe1" stroke="#233b31" strokeWidth="1.2">
        <path d="m240 74 84 48v96l-84 48-84-48v-96z" />
        <path d="m240 98 63 36v73l-63 36-63-36v-73z" />
        <path d="m240 122 42 24v49l-42 24-42-24v-49z" />
        <path d="m240 146 21 12v25l-21 12-21-12v-25z" fill="var(--signal-color)" stroke="var(--signal-color)" />
        <path d="M156 122l84 49 84-49M240 171v95" fill="none" />
      </g>
      <g fontFamily="monospace" fontSize="9" fill="#686c61">
        <text x="20" y="67">01 / {modes[selected].labels[0]}</text><text x="341" y="67">02 / {modes[selected].labels[1]}</text><text x="166" y="322">03 / {modes[selected].labels[2]}</text>
      </g>
      <g fill="#ed5b34"><circle cx="53" cy="171" r="3"/><circle cx="427" cy="171" r="3"/></g>
    </svg>
    </div>
    <div className={styles.diagramControls} role="tablist" aria-label="Work experience">
      {roles.map((item, index) => <button key={item.company} id={"role-" + index} role="tab" aria-selected={selected === index} aria-controls="experience-panel" tabIndex={selected === index ? 0 : -1} onClick={() => onSelect(index)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (index + 1) % roles.length : event.key === "ArrowLeft" ? (index + roles.length - 1) % roles.length : event.key === "Home" ? 0 : event.key === "End" ? roles.length - 1 : null;
        if (next !== null) { event.preventDefault(); onSelect(next); document.getElementById("role-" + next).focus(); }
      }}><span>0{index + 1}</span>{item.company}</button>)}
    </div>
    <p className={styles.diagramCaption}>Select a company to explore the role.</p>
  </div>;
}

export default function SimplePortfolio() {
  const [activeRole, setActiveRole] = useState(0);
  const [showJourney, setShowJourney] = useState(false);
  const page = useRef(null);
  const progress = useRef(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = page.current.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.dataset.reveal = "visible"; observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    if (!motion.matches) elements.forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.dataset.reveal = "waiting";
        observer.observe(element);
      }
    });
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.current.style.transform = "scaleX(" + (total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0) + ")";
      });
    };
    const revealAll = () => { if (motion.matches) elements.forEach(element => { element.dataset.reveal = "visible"; }); };
    motion.addEventListener("change", revealAll);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", revealAll);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const role = roles[activeRole];
  return <>
    <Head>
      <title>Vikram Singh — AI Product Engineer & Systems Builder</title>
      <meta name="description" content="AI product engineer in Mumbai. Building real-time AI experiences, reliable backends, and useful software. Explore Vikram Singh’s work and ask his portfolio assistant." />
      <meta name="theme-color" content="#f4f1e8" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <a className={styles.skipLink} href="#main">Skip to content</a>
    <div className={styles.readProgress} ref={progress} aria-hidden="true" />
    <div className={styles.page} ref={page}>
      <nav className={styles.themeNav} aria-label="Portfolio navigation">
        <Link href="/"><a className={styles.themeSwitch}>← Home</a></Link>
      </nav>
      <main id="main">
        <section id="home" className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}><span className={styles.dot} /> AI PRODUCT ENGINEER · MUMBAI, INDIA</p>
            <h1>Vikram Singh.<br/><em>AI product engineer.</em></h1>
            <p className={styles.intro}>I shape product decisions, build real-time AI experiences, and own the systems behind them. Currently at Upliance.ai.</p>
            <p className={styles.openSource}>Merged contributions to <a href="https://github.com/kestra-io/kestra/pull/13219" target="_blank" rel="noreferrer">Kestra ↗</a> and <a href="https://github.com/MCPJam/inspector/pull/737" target="_blank" rel="noreferrer">MCPJam Inspector ↗</a>. Open PR for the <a href="https://github.com/anthropics/claude-agent-sdk-python/pull/259" target="_blank" rel="noreferrer">Claude Agent SDK ↗</a>.</p>
            <div className={styles.heroActions}><a className={styles.primaryLink} href="#ask">Ask my assistant <span>↗</span></a><a className={styles.textLink} href="#work">Explore my work ↓</a><a className={styles.textLink} href="https://github.com/vikramsingh117" target="_blank" rel="noreferrer">GitHub ↗</a></div>
          </div>
          <div id="ask" className={styles.heroVisual}>
            <button className={styles.howItWorks} onClick={() => setShowJourney(!showJourney)} aria-expanded={showJourney} aria-controls="assistant-journey">
              {showJourney ? "Back to assistant" : "How this assistant works"}
            </button>
            <div className={styles.flipCard}>
              <div className={`${styles.flipInner} ${showJourney ? styles.flipped : ""}`}>
                <div className={styles.flipFront} aria-hidden={showJourney} inert={showJourney ? "" : undefined}><AboutChat /></div>
                <div id="assistant-journey" className={styles.flipBack} aria-hidden={!showJourney} inert={!showJourney ? "" : undefined}>
                  {showJourney && <AssistantJourney />}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="experience" className={styles.experience} data-reveal>
          <div className={styles.sectionHead}><div><p className={styles.kicker}>01 / EXPERIENCE</p><h2>Where I’ve <em>worked.</em></h2></div></div>
          <div className={styles.experienceGrid}>
            <div className={styles.experienceDrawing}><SystemDrawing selected={activeRole} onSelect={setActiveRole} /></div>
            <div key={activeRole} id="experience-panel" role="tabpanel" aria-labelledby={"role-" + activeRole} tabIndex={0} className={styles.rolePanel}>
              <p className={styles.kicker}>{role.current ? "CURRENT CHAPTER" : "PREVIOUS CHAPTER"} / {role.role}</p><h3>{role.summary}</h3><p>{role.description}</p><ul>{role.points.map(point => <li key={point}>{point}</li>)}</ul><p className={styles.roleStack}>{role.stack}</p>
            </div>
          </div>
        </section>
        <section id="work" className={styles.work} data-reveal>
          <div className={styles.sectionHead}><div><p className={styles.kicker}>02 / SELECTED WORK</p><h2>Selected <em>projects.</em></h2></div></div>
          <div className={styles.projects}>
            <article className={styles.searchProject}>
              <div className={styles.projectLabel}><span>01 / DISCOVERY ENGINE</span><span>2025</span></div>
              <div className={styles.searchArt} aria-label="Illustration of the crawler and search index">
                <div className={styles.searchBox}><span>⌕</span> Search the index<i>↵</i></div>
                <div className={styles.indexRows}><span>01</span><div/><b>CRAWL</b><span>02</span><div/><b>PARSE</b><span>03</span><div/><b>INDEX</b></div>
              </div>
              <div className={styles.projectCopy}><p className={styles.tags}>GO · MONGODB ATLAS · GOQUERY</p><h3><a className={styles.cardLink} href="https://go-web-crawler.onrender.com/" target="_blank" rel="noreferrer" aria-label="Go web crawler & search index (opens in a new tab)">Go web crawler & search index ↗</a></h3><p>Turns live webpages into structured observations: extracted text, keyword frequency, and crawl results stored for inspection.</p><div className={styles.cardDetails}><ProjectDetails>Built with Go and net/http, GoQuery for HTML parsing, and MongoDB Atlas. Handles Gzip, Brotli, and Deflate responses, with a responsive HTML/CSS interface and environment-based database configuration. April–June 2025.</ProjectDetails></div></div>
            </article>
            <article className={styles.portfolioProject}>
              <div className={styles.projectLabel}><span>02 / AN EVOLVING EXPERIMENT</span><span>2022 — NOW</span></div>
              <div className={styles.portfolioArt}><span className={styles.largeAsterisk}>✳</span><div><span>vikram</span><span>.dev</span></div><small>2022 — PRESENT</small></div>
              <div className={styles.projectCopy}><p className={styles.tags}>NEXT.JS · REDIS · DOCKER · JWT</p><h3>Personal portfolio</h3><p>A serverless application maintained since 2022, with CDN caching, authentication, and a résumé-grounded AI assistant.</p><a href="#ask" className={styles.projectLink}>Try the portfolio assistant <span>↗</span></a></div>
            </article>
          </div>
        </section>
        <section className={styles.about} id="about" data-reveal>
          <div><p className={styles.kicker}>03 / BACKGROUND</p><h2>Education &<br/><em>open source.</em></h2><p>B.Tech in Computer Science, VIT Chennai.<br/>2021–2025 · CGPA 8.42/10.</p><p>First on campus at Google Hash Code, among more than 50 teams.</p><Contributions/></div>
          <div className={styles.toolbox}><p className={styles.kicker}>THE TOOLBOX</p><div><small>LANGUAGES</small><p>Java · TypeScript · JavaScript<br/>Python · SQL · Bash</p></div><div><small>DATA & INFRASTRUCTURE</small><p>Redis · MongoDB · MySQL · Docker<br/>Linux · GCP · Azure · Firebase · Git</p></div></div>
        </section>
        <footer className={styles.footer}>
          <p className={styles.kicker}>GET IN TOUCH</p><a className={styles.footerTitle} href="mailto:vikramandanshu@gmail.com">Say <em>hello.</em><span>↗</span></a>
          <div className={styles.footerBottom}><a href="mailto:vikramandanshu@gmail.com">vikramandanshu@gmail.com</a><div><a href="https://github.com/vikramsingh117" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://leetcode.com/u/vikramandanshu/" target="_blank" rel="noreferrer">LeetCode ↗</a><a href="#home">Back to top ↑</a></div><span>© {new Date().getFullYear()} VIKRAM SINGH</span></div>
        </footer>
      </main>
    </div>
  </>;
}
